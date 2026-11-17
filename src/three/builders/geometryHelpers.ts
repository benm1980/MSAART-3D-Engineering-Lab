import * as THREE from 'three';

/**
 * Creates a high-subdivision, thick-walled hollow spherical shell using LatheGeometry
 * so cross-section slicing reveals true physical wall thickness (outer + inner surface).
 */
export function createThickSphericalShell(
  outerRadius: number,
  innerRadius: number,
  radialSegments = 112,
  arcSegments = 64
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const eps = 0.004;

  // Outer arc from north pole to south pole
  for (let i = 0; i <= arcSegments; i++) {
    const theta = eps + (i / arcSegments) * (Math.PI - eps * 2);
    pts.push(
      new THREE.Vector2(
        Math.sin(theta) * outerRadius,
        Math.cos(theta) * outerRadius
      )
    );
  }

  // Inner arc back from south pole to north pole
  for (let i = arcSegments; i >= 0; i--) {
    const theta = eps + (i / arcSegments) * (Math.PI - eps * 2);
    pts.push(
      new THREE.Vector2(
        Math.sin(theta) * innerRadius,
        Math.cos(theta) * innerRadius
      )
    );
  }

  // Close profile cleanly
  pts.push(pts[0].clone());

  const geo = new THREE.LatheGeometry(pts, radialSegments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a high-subdivision, thick-walled open-ended tube along the Y axis.
 */
export function createThickTube(
  outerRadius: number,
  innerRadius: number,
  length: number,
  radialSegments = 96
): THREE.BufferGeometry {
  const half = length * 0.5;
  const bevel = Math.min(0.012, (outerRadius - innerRadius) * 0.18);
  const pts = [
    new THREE.Vector2(innerRadius, -half + bevel),
    new THREE.Vector2(innerRadius + bevel, -half),
    new THREE.Vector2(outerRadius - bevel, -half),
    new THREE.Vector2(outerRadius, -half + bevel),
    new THREE.Vector2(outerRadius, half - bevel),
    new THREE.Vector2(outerRadius - bevel, half),
    new THREE.Vector2(innerRadius + bevel, half),
    new THREE.Vector2(innerRadius, half - bevel),
    new THREE.Vector2(innerRadius, -half + bevel),
  ];
  const geo = new THREE.LatheGeometry(pts, radialSegments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a thick-walled conical frustum (for Dual-Cone Implosion Resonator).
 */
export function createThickConeFrustum(
  bottomOuterR: number,
  topOuterR: number,
  wallThickness: number,
  height: number,
  radialSegments = 112
): THREE.BufferGeometry {
  const half = height * 0.5;
  const bIn = Math.max(0.05, bottomOuterR - wallThickness);
  const tIn = Math.max(0.05, topOuterR - wallThickness);

  const pts = [
    new THREE.Vector2(bIn, -half),
    new THREE.Vector2(bottomOuterR, -half),
    new THREE.Vector2(topOuterR, half),
    new THREE.Vector2(tIn, half),
    new THREE.Vector2(bIn, -half),
  ];
  const geo = new THREE.LatheGeometry(pts, radialSegments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a thick-walled hollow disc with a central bore (for end plates & baffles).
 */
export function createThickAnnularDisc(
  outerRadius: number,
  innerRadius: number,
  thickness: number,
  radialSegments = 96
): THREE.BufferGeometry {
  const half = thickness * 0.5;
  const bevel = Math.min(0.015, thickness * 0.2);
  const pts = [
    new THREE.Vector2(innerRadius, -half + bevel),
    new THREE.Vector2(innerRadius + bevel, -half),
    new THREE.Vector2(outerRadius - bevel, -half),
    new THREE.Vector2(outerRadius, -half + bevel),
    new THREE.Vector2(outerRadius, half - bevel),
    new THREE.Vector2(outerRadius - bevel, half),
    new THREE.Vector2(innerRadius + bevel, half),
    new THREE.Vector2(innerRadius, half - bevel),
    new THREE.Vector2(innerRadius, -half + bevel),
  ];
  const geo = new THREE.LatheGeometry(pts, radialSegments);
  geo.computeVertexNormals();
  return geo;
}

export function tagPart(
  obj: THREE.Object3D,
  partId: string,
  interactables: THREE.Object3D[]
): void {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData.partId = partId;
      child.castShadow = true;
      child.receiveShadow = true;
      interactables.push(child);
    }
  });
}

export function disposeHierarchy(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      geometries.add(mesh.geometry);
    }
  });
  geometries.forEach((g) => g.dispose());
}
