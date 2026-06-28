import os
import sys

import FreeCAD
import Import
import Mesh
import MeshPart


def main() -> int:
    input_arg = os.environ.get("STEP_INPUT")
    output_arg = os.environ.get("OBJ_OUTPUT")

    if not input_arg or not output_arg:
        print("Set STEP_INPUT and OBJ_OUTPUT environment variables before running this script.")
        return 2

    input_path = os.path.abspath(input_arg)
    output_path = os.path.abspath(output_arg)

    if not os.path.exists(input_path):
        print(f"Input STEP file not found: {input_path}")
        return 1

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = FreeCAD.newDocument("step_import")
    FreeCAD.setActiveDocument(doc.Name)
    Import.insert(input_path, doc.Name)
    doc.recompute()

    meshes = []
    for obj in doc.Objects:
        shape = getattr(obj, "Shape", None)
        if not shape or shape.isNull():
            continue

        mesh = MeshPart.meshFromShape(
            Shape=shape,
            LinearDeflection=0.12,
            AngularDeflection=0.35,
            Relative=False,
        )
        if mesh and mesh.CountFacets > 0:
            meshes.append(mesh)

    if not meshes:
        print(f"No meshable shapes found in: {input_path}")
        return 1

    combined = Mesh.Mesh()
    for mesh in meshes:
        combined.addMesh(mesh)

    combined.write(output_path)
    FreeCAD.closeDocument(doc.Name)
    print(f"Exported OBJ: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
