import math
import os
import sys

import bpy
from mathutils import Matrix


TEXTURE_SIZE = 96


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(name: str, color: tuple[float, float, float, float], metallic: float = 0.0, roughness: float = 0.45):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def textured_material(
    name: str,
    base: tuple[float, float, float, float],
    accent: tuple[float, float, float, float],
    pattern: str,
    metallic: float = 0.0,
    roughness: float = 0.45,
):
    mat = material(name, base, metallic, roughness)
    image = make_texture_image(f"{name}_texture", base, accent, pattern)
    image.pack()

    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def make_texture_image(
    name: str,
    base: tuple[float, float, float, float],
    accent: tuple[float, float, float, float],
    pattern: str,
):
    image = bpy.data.images.new(name, width=TEXTURE_SIZE, height=TEXTURE_SIZE)
    pixels: list[float] = []

    for y in range(TEXTURE_SIZE):
        for x in range(TEXTURE_SIZE):
            use_accent = False
            mix = 0.0

            if pattern == "wood":
                band = (math.sin(x * 0.22 + math.sin(y * 0.17) * 1.8) + 1) * 0.5
                use_accent = band > 0.68 or (x + y) % 19 == 0
                mix = 0.34 if use_accent else 0.08
            elif pattern == "panel":
                use_accent = x % 24 in (0, 1) or y % 24 in (0, 1)
                mix = 0.28 if use_accent else 0.04
            elif pattern == "diagonal":
                use_accent = (x + y) % 28 < 8
                mix = 0.48 if use_accent else 0.02
            elif pattern == "carbon":
                use_accent = ((x // 6) + (y // 6)) % 2 == 0
                mix = 0.22 if use_accent else 0.02
            else:
                use_accent = (x + y) % 16 == 0
                mix = 0.18 if use_accent else 0.02

            color = tuple(base[i] * (1 - mix) + accent[i] * mix for i in range(4))
            pixels.extend(color)

    image.pixels = pixels
    return image


def cube(name: str, loc: tuple[float, float, float], scale: tuple[float, float, float], mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new("soft_edges", "BEVEL")
    bevel.width = min(scale) * 0.08
    bevel.segments = 3
    obj.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
    return obj


def cyl(
    name: str,
    loc: tuple[float, float, float],
    radius: float,
    depth: float,
    mat,
    rotation: tuple[float, float, float] = (0, 0, 0),
    vertices: int = 32,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    try:
        bpy.ops.object.shade_smooth()
    except RuntimeError:
        pass
    return obj


def wheel(
    name: str,
    loc: tuple[float, float, float],
    radius: float,
    tire_mat,
    hub_mat,
    tube_ratio: float = 0.28,
) -> None:
    tube_radius = radius * tube_ratio
    major_radius = radius - tube_radius
    bpy.ops.mesh.primitive_torus_add(
        major_segments=40,
        minor_segments=12,
        major_radius=major_radius,
        minor_radius=tube_radius,
        location=loc,
    )
    tire = bpy.context.object
    tire.name = f"{name}_tire"
    tire.data.materials.append(tire_mat)
    try:
        bpy.ops.object.shade_smooth()
    except RuntimeError:
        pass

    cyl(f"{name}_hub", loc, radius * 0.43, tube_radius * 1.35, hub_mat, vertices=24)


def sphere(name: str, loc: tuple[float, float, float], radius: float, mat) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    try:
        bpy.ops.object.shade_smooth()
    except RuntimeError:
        pass
    return obj


def export_glb(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)

    for obj in bpy.context.scene.objects:
      if obj.type != "MESH":
        continue
      bpy.ops.object.select_all(action="DESELECT")
      obj.select_set(True)
      bpy.context.view_layer.objects.active = obj
      bpy.ops.object.mode_set(mode="EDIT")
      bpy.ops.mesh.select_all(action="SELECT")
      bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)
      bpy.ops.object.mode_set(mode="OBJECT")

    bpy.ops.object.select_all(action="SELECT")

    # The model construction helpers use web/Three.js coordinates (Y-up).
    # Blender is Z-up, so rotate the whole scene before exporting to GLB.
    correction = Matrix.Rotation(math.radians(90), 4, "X")
    for obj in bpy.context.scene.objects:
        obj.matrix_world = correction @ obj.matrix_world

    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    try:
        bpy.ops.export_scene.gltf(
            filepath=path,
            export_format="GLB",
            export_apply=True,
            export_yup=True,
            export_draco_mesh_compression_enable=True,
            export_draco_mesh_compression_level=6,
        )
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_yup=True)
    print(f"Exported {path}")


def create_vehicle(path: str) -> None:
    reset_scene()
    body = textured_material("warm white body", (0.82, 0.89, 0.94, 1), (0.4, 0.53, 0.63, 1), "panel", 0.25, 0.36)
    glass = material("blue glass", (0.38, 0.68, 0.86, 0.72), 0.0, 0.2)
    dark = textured_material("dark tire", (0.07, 0.11, 0.16, 1), (0.18, 0.24, 0.3, 1), "carbon", 0.0, 0.52)
    hub = material("vehicle hub", (0.78, 0.84, 0.88, 1), 0.35, 0.28)
    coral = material("adas coral", (0.98, 0.45, 0.52, 1), 0.05, 0.32)
    road = textured_material("bev panel", (0.93, 0.96, 0.98, 1), (0.98, 0.45, 0.52, 1), "panel", 0.0, 0.55)

    cube("vehicle_body", (0, 0.35, 0), (2.4, 0.48, 1.05), body)
    cube("vehicle_cabin", (0.22, 0.78, 0), (1.08, 0.42, 0.78), glass)
    cube("front_sensor_bar", (1.25, 0.42, 0), (0.12, 0.2, 0.72), coral)
    cube("under_vehicle_bev_panel", (0, -0.08, 0), (2.7, 0.04, 1.28), road)

    for x in (-0.78, 0.78):
        for z in (-0.58, 0.58):
            wheel("wheel", (x, 0.12, z), 0.22, dark, hub)

    for x in (-0.8, -0.35, 0.1, 0.55, 0.95):
        sphere("feature_point", (x, -0.02, -0.28 + (x % 0.45)), 0.035, coral)

    export_glb(path)


def create_guitar_camera(path: str) -> None:
    reset_scene()
    wood = textured_material("maple fretboard", (0.86, 0.62, 0.34, 1), (0.45, 0.25, 0.1, 1), "wood", 0.0, 0.42)
    dark = material("fret dark", (0.18, 0.12, 0.08, 1), 0.0, 0.48)
    metal = material("fret metal", (0.75, 0.78, 0.8, 1), 0.4, 0.28)
    camera = textured_material("camera white", (0.9, 0.95, 1, 1), (0.52, 0.63, 0.72, 1), "panel", 0.18, 0.34)
    lens = material("lens blue", (0.08, 0.22, 0.34, 1), 0.0, 0.22)
    yellow = material("note yellow", (0.98, 0.78, 0.08, 1), 0.0, 0.32)

    cube("guitar_neck", (0.25, 0, 0), (2.8, 0.16, 0.46), wood)
    cube("nut", (-1.24, 0.03, 0), (0.08, 0.22, 0.54), dark)

    for x in (-0.8, -0.38, 0.04, 0.46, 0.88):
        cube("fret", (x, 0.09, 0), (0.025, 0.05, 0.54), metal)

    for z in (-0.18, -0.06, 0.06, 0.18):
        cube("string", (0.22, 0.13, z), (2.55, 0.012, 0.012), metal)

    cube("webcam_body", (-0.82, 0.72, -0.12), (0.64, 0.34, 0.34), camera)
    cyl("webcam_lens", (-0.82, 0.72, 0.08), 0.105, 0.055, lens, rotation=(math.pi / 2, 0, 0), vertices=32)
    cube("camera_mount", (-0.82, 0.42, -0.12), (0.12, 0.34, 0.12), dark)

    for x, z in ((-0.36, -0.06), (0.04, 0.06), (0.46, 0.18), (0.9, -0.18)):
        sphere("scale_note", (x, 0.24, z), 0.075, yellow)

    export_glb(path)


def create_fleet(path: str) -> None:
    reset_scene()
    white = textured_material("fleet white", (0.9, 0.95, 1, 1), (0.25, 0.42, 0.56, 1), "panel", 0.2, 0.36)
    blue = textured_material("seer blue", (0.22, 0.62, 0.95, 1), (0.92, 0.97, 1, 1), "diagonal", 0.05, 0.34)
    dark = textured_material("fleet dark", (0.08, 0.12, 0.18, 1), (0.2, 0.28, 0.36, 1), "carbon", 0.0, 0.55)
    amber = textured_material("agv amber", (0.96, 0.64, 0.16, 1), (0.18, 0.12, 0.08, 1), "diagonal", 0.05, 0.36)
    green = material("robot dog green", (0.16, 0.78, 0.58, 1), 0.04, 0.34)
    hub = material("fleet wheel hub", (0.72, 0.8, 0.86, 1), 0.3, 0.3)

    cube("seer_amr_base", (-0.85, 0.22, 0), (1.2, 0.38, 0.78), white)
    cube("seer_amr_top", (-0.85, 0.58, 0), (0.68, 0.3, 0.5), blue)
    for x in (-1.22, -0.48):
        for z in (-0.42, 0.42):
            wheel("amr_wheel", (x, 0.0, z), 0.14, dark, hub, tube_ratio=0.32)

    cube("agv_base", (0.58, 0.18, 0.28), (1.0, 0.3, 0.62), amber)
    cube("agv_tower", (0.92, 0.58, 0.28), (0.18, 0.76, 0.18), dark)
    cube("agv_forks_left", (0.18, 0.08, 0.12), (0.82, 0.06, 0.06), dark)
    cube("agv_forks_right", (0.18, 0.08, 0.44), (0.82, 0.06, 0.06), dark)

    cube("dog_body", (0.72, 0.44, -0.62), (0.74, 0.28, 0.28), white)
    cube("dog_head", (1.16, 0.5, -0.62), (0.24, 0.2, 0.22), green)
    for x in (0.46, 0.94):
        for z in (-0.76, -0.48):
            cube("dog_leg", (x, 0.18, z), (0.08, 0.42, 0.08), dark)

    export_glb(path)


def main() -> int:
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
    out_dir = os.path.abspath(args[0]) if args else os.path.abspath("public/models")

    create_guitar_camera(os.path.join(out_dir, "guitar-camera.glb"))
    create_vehicle(os.path.join(out_dir, "vehicle.glb"))
    create_fleet(os.path.join(out_dir, "fleet-robots.glb"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
