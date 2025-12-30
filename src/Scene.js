import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Room from './Room';
import FirstPersonControls from './FirstPersonControls';
import MaterialSelectorOverlay from './MaterialSelectorOverlay';
import RaycastDetector from './RaycastDetector';
import './Scene.css';

// State machine states
const STATE = {
  UNLOCKED_UI: 'UNLOCKED_UI',       // Not in FPS, cursor visible, awaiting canvas click
  LOCKING_PENDING: 'LOCKING_PENDING', // Requested pointer lock, waiting for browser
  LOCKED_MOVING: 'LOCKED_MOVING',    // In FPS mode, WASD works, can press E for selector
  SELECTOR_OPEN: 'SELECTOR_OPEN'     // Material UI visible, cursor visible, pointer unlocked
};

function Scene() {
  // State machine - single source of truth
  const [inputState, setInputState] = useState(STATE.UNLOCKED_UI);
  const [selectedSurface, setSelectedSurface] = useState(null);
  const [floorMaterial, setFloorMaterial] = useState('hardwood');
  const [wallMaterial, setWallMaterial] = useState('whitePaint');
  const [lookedAtSurface, setLookedAtSurface] = useState(null); // Surface user is aiming at
  const controlsRef = React.useRef();

  // ============================================================================
  // POINTER LOCK CONTROL - Single source of truth via pointerlockchange event
  // ============================================================================
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = !!document.pointerLockElement;
      console.log('🔒 pointerlockchange:', isLocked ? 'LOCKED' : 'UNLOCKED', 'currentState:', inputState);

      if (isLocked) {
        // Pointer locked → transition to LOCKED_MOVING
        if (inputState === STATE.UNLOCKED_UI || inputState === STATE.LOCKING_PENDING) {
          console.log('✅ Transition: → LOCKED_MOVING');
          setInputState(STATE.LOCKED_MOVING);
          document.body.classList.add('fps-cursor-hidden');
        }
      } else {
        // Pointer unlocked → return to UI mode (unless we're in selector)
        if (inputState !== STATE.SELECTOR_OPEN) {
          console.log('✅ Transition: → UNLOCKED_UI (pointer unlocked)');
          setInputState(STATE.UNLOCKED_UI);
          document.body.classList.remove('fps-cursor-hidden');
        }
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, [inputState]);

  // ============================================================================
  // POINTER LOCK HANDLERS - Listen to PointerLockControls lock/unlock events
  // ============================================================================
  const handleLock = () => {
    console.log('🔒 PointerLockControls locked');
    if (inputState === STATE.UNLOCKED_UI) {
      console.log('✅ Transition: UNLOCKED_UI → LOCKED_MOVING');
      setInputState(STATE.LOCKED_MOVING);
    }
  };

  const handleUnlock = () => {
    console.log('🔓 PointerLockControls unlocked');
    // Handled by pointerlockchange event
  };

  // ============================================================================
  // RAYCAST DETECTION - Detect what surface user is looking at
  // ============================================================================
  const handleSurfaceDetected = (surface) => {
    setLookedAtSurface(surface);
  };

  // ============================================================================
  // KEYBOARD INPUT - E key opens selector, ESC closes it
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // E key - open material selector (only if looking at a surface)
      if (e.key === 'e' || e.key === 'E') {
        if (inputState === STATE.LOCKED_MOVING && lookedAtSurface) {
          console.log('✅ Transition: LOCKED_MOVING → SELECTOR_OPEN (E pressed), surface:', lookedAtSurface.surfaceId);
          setSelectedSurface(lookedAtSurface.surfaceId);
          setInputState(STATE.SELECTOR_OPEN);
          document.exitPointerLock();
          document.body.classList.add('cursor-visible');
        }
      }

      // ESC key - close selector
      if (e.key === 'Escape') {
        if (inputState === STATE.SELECTOR_OPEN) {
          console.log('✅ Transition: SELECTOR_OPEN → UNLOCKED_UI (ESC pressed)');
          handleSelectorClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputState, lookedAtSurface]);

  // ============================================================================
  // MATERIAL SELECTION
  // ============================================================================
  const handleMaterialSelect = (materialId) => {
    if (selectedSurface === 'floor') {
      setFloorMaterial(materialId);
    } else if (selectedSurface === 'wall') {
      setWallMaterial(materialId);
    }
    // Don't close selector - user can keep selecting materials
  };

  const handleSelectorClose = () => {
    console.log('✅ Transition: SELECTOR_OPEN → UNLOCKED_UI (Done clicked)');
    setSelectedSurface(null);
    setInputState(STATE.UNLOCKED_UI);
    document.body.classList.remove('cursor-visible');
  };

  // ============================================================================
  // INSTRUCTIONS - Based on current state
  // ============================================================================
  const getInstructions = () => {
    switch(inputState) {
      case STATE.UNLOCKED_UI:
        return 'Click to enter first-person mode';
      case STATE.LOCKING_PENDING:
        return 'Entering FPS mode...';
      case STATE.LOCKED_MOVING:
        return 'WASD to move, mouse to look, E to open material selector';
      case STATE.SELECTOR_OPEN:
        return 'Choose a material, then click Done or press ESC';
      default:
        return '';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="scene-container">
      <Canvas
        camera={{
          position: [0, 1.6, -2],
          rotation: [0, 0, 0],
          fov: 75
        }}
      >
        <FirstPersonControls
          ref={controlsRef}
          enabled={inputState === STATE.UNLOCKED_UI || inputState === STATE.LOCKED_MOVING}
          onLock={handleLock}
          onUnlock={handleUnlock}
        />
        <Room
          floorMaterial={floorMaterial}
          wallMaterial={wallMaterial}
        />
        <RaycastDetector
          enabled={inputState === STATE.LOCKED_MOVING}
          onSurfaceDetected={handleSurfaceDetected}
        />
      </Canvas>
      <div className="instructions">
        {getInstructions()}
      </div>

      {/* Interaction Tooltip */}
      {inputState === STATE.LOCKED_MOVING && lookedAtSurface && (
        <div className="interaction-tooltip">
          Press E to change material
        </div>
      )}

      <div className="debug-state" style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px'
      }}>
        State: {inputState}
      </div>

      {/* Material Selector HUD */}
      {selectedSurface === 'floor' && (
        <MaterialSelectorOverlay
          onMaterialSelect={handleMaterialSelect}
          onClose={handleSelectorClose}
          materials={[
            { id: 'hardwood', name: 'Hardwood', color: '#8B4513' },
            { id: 'tile', name: 'Tile', color: '#E0E0E0' },
            { id: 'carpet', name: 'Carpet', color: '#556B2F' },
          ]}
        />
      )}
      {selectedSurface === 'wall' && (
        <MaterialSelectorOverlay
          onMaterialSelect={handleMaterialSelect}
          onClose={handleSelectorClose}
          materials={[
            { id: 'whitePaint', name: 'White Paint', color: '#F5F5F5' },
            { id: 'bluePaint', name: 'Blue Paint', color: '#4A90E2' },
            { id: 'brick', name: 'Brick', color: '#8B4726' },
          ]}
        />
      )}
    </div>
  );
}

export default Scene;
