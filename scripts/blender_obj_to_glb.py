import os
import sys

import bpy


def import_obj(path: str) -> None:
    if hasattr(bpy.ops.wm, "obj_import"):
        bpy.ops.wm.obj_import(filepath=path)
    else:
        bpy.ops.import_scene.obj(filepath=path)


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: blender --background --python blender_obj_to_glb.py -- input.obj output.glb")
        return 2

    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[-2:]
    if len(args) < 2:
        print("Missing input OBJ and output GLB paths.")
        return 2

    input_path = os.path.abspath(args[0])
    output_path = os.path.abspath(args[1])

    if not os.path.exists(input_path):
        print(f"Input OBJ file not found: {input_path}")
        return 1

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

    import_obj(input_path)

    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not objects:
        print(f"No mesh objects imported from: {input_path}")
        return 1

    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        try:
            bpy.ops.object.shade_smooth()
        except RuntimeError:
            pass

        polygon_count = len(obj.data.polygons)
        ratio = 1.0
        if polygon_count > 250_000:
            ratio = 0.12
        elif polygon_count > 100_000:
            ratio = 0.25
        elif polygon_count > 50_000:
            ratio = 0.45

        if ratio < 1.0:
            modifier = obj.modifiers.new("web_decimate", "DECIMATE")
            modifier.ratio = ratio
            bpy.ops.object.modifier_apply(modifier=modifier.name)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")

    max_dimension = max(max(obj.dimensions) for obj in objects)
    if max_dimension > 0:
        scale = 3.0 / max_dimension
        for obj in objects:
            obj.scale = (obj.scale.x * scale, obj.scale.y * scale, obj.scale.z * scale)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )

    print(f"Exported GLB: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
