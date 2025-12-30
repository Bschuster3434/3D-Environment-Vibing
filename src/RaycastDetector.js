import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_INTERACTION_DISTANCE = 20;

function RaycastDetector({ enabled, onSurfaceDetected }) {
  const { camera, scene } = useThree();
  const raycaster = new THREE.Raycaster();

  useFrame(() => {
    if (!enabled) {
      onSurfaceDetected(null);
      return;
    }

    // Raycast from center of screen
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    // Get all intersections
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Find first interactable surface within range
    let detectedSurface = null;
    for (const intersect of intersects) {
      if (intersect.distance > MAX_INTERACTION_DISTANCE) continue;

      // Check if this object has surface metadata
      if (intersect.object.userData?.surfaceId) {
        detectedSurface = {
          surfaceId: intersect.object.userData.surfaceId,
          distance: intersect.distance,
          point: intersect.point
        };
        break;
      }
    }

    onSurfaceDetected(detectedSurface);
  });

  return null;
}

export default RaycastDetector;
