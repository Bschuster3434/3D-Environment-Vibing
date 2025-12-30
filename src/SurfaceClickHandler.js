import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

function SurfaceClickHandler({ onSurfaceClick, selectedSurface }) {
  const { camera, scene, gl } = useThree();
  const [raycaster] = useState(() => new THREE.Raycaster());
  const [mouse] = useState(() => new THREE.Vector2());

  useEffect(() => {
    const handleClick = (event) => {
      // Don't handle any clicks when material selector is open
      if (selectedSurface) {
        return;
      }

      // When pointer is locked, raycast from center of screen (camera direction)
      // When pointer is not locked, use actual mouse position
      if (document.pointerLockElement) {
        // Pointer is locked - raycast from center (where camera is looking)
        mouse.x = 0;
        mouse.y = 0;
      } else {
        // Pointer is not locked - use mouse position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }

      // Update raycaster with camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Get all objects in the scene (only mesh objects)
      const meshes = [];
      scene.traverse((object) => {
        if (object.isMesh && object.userData.clickable) {
          meshes.push(object);
        }
      });

      // Calculate intersections
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (onSurfaceClick) {
          onSurfaceClick(clickedObject);
        }
      }
    };

    // Add click listener to canvas
    gl.domElement.addEventListener('click', handleClick);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, scene, gl, raycaster, mouse, onSurfaceClick, selectedSurface]);

  return null; // This component doesn't render anything
}

export default SurfaceClickHandler;
