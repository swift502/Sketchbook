import { BoxPhysics } from "./BoxPhysics";
import { CapsulePhysics } from "./CapsulePhysics";
import { ConvexPhysics } from "./ConvexPhysics";
import { SpherePhysics } from "./SpherePhysics";
import { TrimeshPhysics } from "./TrimeshPhysics";

export let ObjectPhysics = {
    Box: BoxPhysics,
    Capsule: CapsulePhysics,
    Convex: ConvexPhysics,
    Sphere: SpherePhysics,
    TriMesh: TrimeshPhysics,
};