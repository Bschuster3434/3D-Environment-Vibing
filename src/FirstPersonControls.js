import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const MOVE_SPEED = 5;

const FirstPersonControls = React.forwardRef(({ enabled, onLock, onUnlock }, ref) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Expose lock/unlock methods to parent
  useImperativeHandle(ref, () => ({
    lock: () => {
      if (controlsRef.current) {
        controlsRef.current.lock();
      }
    },
    unlock: () => {
      if (controlsRef.current) {
        controlsRef.current.unlock();
      }
    }
  }));

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const direction = useRef(new THREE.Vector3());

  // Handle lock/unlock events from PointerLockControls
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleLock = () => {
      if (onLock) onLock();
    };

    const handleUnlock = () => {
      if (onUnlock) onUnlock();
    };

    controls.addEventListener('lock', handleLock);
    controls.addEventListener('unlock', handleUnlock);

    return () => {
      controls.removeEventListener('lock', handleLock);
      controls.removeEventListener('unlock', handleUnlock);
    };
  }, [onLock, onUnlock]);

  // Unlock pointer when disabled
  useEffect(() => {
    if (!enabled && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
    }
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!enabled) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      if (!enabled) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  useFrame((state, delta) => {
    if (!enabled) return;

    // Get the direction vectors
    direction.current.set(0, 0, 0);

    if (moveState.current.forward) direction.current.z += 1;
    if (moveState.current.backward) direction.current.z -= 1;
    if (moveState.current.left) direction.current.x -= 1;
    if (moveState.current.right) direction.current.x += 1;

    // Normalize diagonal movement
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }

    // Apply movement relative to camera direction
    const moveVector = new THREE.Vector3();

    // Get camera's forward direction (where it's looking)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement horizontal
    forward.normalize();

    // Get right direction (perpendicular to forward, for strafing)
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Apply forward/backward movement
    if (direction.current.z !== 0) {
      moveVector.add(forward.clone().multiplyScalar(direction.current.z * MOVE_SPEED * delta));
    }

    // Apply left/right movement
    if (direction.current.x !== 0) {
      moveVector.add(right.clone().multiplyScalar(direction.current.x * MOVE_SPEED * delta));
    }

    // Apply the movement
    camera.position.add(moveVector);

    // Keep camera at eye level
    camera.position.y = 1.6;
  });

  // Always render, but only allow locking when enabled
  return <PointerLockControls ref={controlsRef} enabled={enabled} />;
});

export default FirstPersonControls;
