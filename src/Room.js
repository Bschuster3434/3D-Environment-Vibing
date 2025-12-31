import React from 'react';
import * as THREE from 'three';
import { materialLibrary } from './materialLibrary';

// Room dimensions (1 unit = 1 meter)
const ROOM_WIDTH = 6;    // X axis (meters)
const ROOM_HEIGHT = 2.6; // Y axis (meters)
const ROOM_DEPTH = 6;    // Z axis (meters)
const WALL_THICKNESS = 0.12; // Wall thickness (meters)

// Architectural details
const BASEBOARD_HEIGHT = 0.1;
const BASEBOARD_DEPTH = 0.05;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.0;
const DOOR_FRAME_THICKNESS = 0.05;
const WINDOW_WIDTH = 1.2;
const WINDOW_HEIGHT = 1.2;
const WINDOW_SILL_HEIGHT = 1.0; // From floor
const FRAME_OFFSET = 0.001; // Prevent z-fighting with wall surfaces

// Simple floor materials
const floorMaterials = {
  hardwood: { color: '#8B4513', roughness: 0.8, metalness: 0.0 },
  tile: { color: '#E0E0E0', roughness: 0.2, metalness: 0.1 },
  carpet: { color: '#556B2F', roughness: 0.9, metalness: 0.0 },
};

// Wall materials
const wallMaterials = {
  whitePaint: { color: '#F5F5F5', roughness: 0.7, metalness: 0.0 },
  bluePaint: { color: '#4A90E2', roughness: 0.6, metalness: 0.0 },
  brick: { color: '#8B4726', roughness: 0.9, metalness: 0.0 },
};

function Room({ floorMaterial, wallMaterial }) {
  const getSurfaceMaterial = (surfaceId) => {
    let material;

    if (surfaceId === 'floor') {
      material = floorMaterials[floorMaterial] || floorMaterials.hardwood;
    } else if (surfaceId === 'wall') {
      material = wallMaterials[wallMaterial] || wallMaterials.whitePaint;
    } else if (surfaceId === 'ceiling') {
      material = { color: '#D3D3D3', roughness: 0.7, metalness: 0.0 }; // Light gray ceiling
    }

    return (
      <meshStandardMaterial
        key={`${surfaceId}-${material.color}`}
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
      />
    );
  };

  // Baseboard material (bright white with sheen)
  const baseboardMaterial = (
    <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.2} emissive="#FFFFFF" emissiveIntensity={0.1} />
  );

  // Frame material (bright white trim)
  const frameMaterial = (
    <meshStandardMaterial
      color="#FFFFFF"
      roughness={0.2}
      metalness={0.2}
      emissive="#FFFFFF"
      emissiveIntensity={0.1}
      polygonOffset={true}
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
    />
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        userData={{ clickable: true, surfaceId: 'floor' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        {getSurfaceMaterial('floor')}
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, ROOM_HEIGHT, 0]}
        userData={{ surfaceId: 'ceiling' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        {getSurfaceMaterial('ceiling')}
      </mesh>

      {/* North Wall (positive Z) - with door - using extruded shape with hole */}
      <group>
        <mesh
          position={[0, 0, ROOM_DEPTH / 2]}
          userData={{ surfaceId: 'wall' }}
          receiveShadow
          castShadow
        >
          <extrudeGeometry args={[
            (() => {
              const wallShape = new THREE.Shape();
              wallShape.moveTo(-ROOM_WIDTH/2, 0);
              wallShape.lineTo(ROOM_WIDTH/2, 0);
              wallShape.lineTo(ROOM_WIDTH/2, ROOM_HEIGHT);
              wallShape.lineTo(-ROOM_WIDTH/2, ROOM_HEIGHT);
              wallShape.lineTo(-ROOM_WIDTH/2, 0);

              const doorHole = new THREE.Path();
              doorHole.moveTo(-DOOR_WIDTH/2, 0);
              doorHole.lineTo(DOOR_WIDTH/2, 0);
              doorHole.lineTo(DOOR_WIDTH/2, DOOR_HEIGHT);
              doorHole.lineTo(-DOOR_WIDTH/2, DOOR_HEIGHT);
              doorHole.lineTo(-DOOR_WIDTH/2, 0);
              wallShape.holes.push(doorHole);

              return wallShape;
            })(),
            { depth: WALL_THICKNESS, bevelEnabled: false }
          ]} />
          {getSurfaceMaterial('wall')}
        </mesh>
        {/* Door frame - left (inside) */}
        <mesh position={[-DOOR_WIDTH/2 - DOOR_FRAME_THICKNESS/2, DOOR_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT + DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Door frame - left (outside) */}
        <mesh position={[-DOOR_WIDTH/2 - DOOR_FRAME_THICKNESS/2, DOOR_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + 3*WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT + DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Door frame - right (inside) */}
        <mesh position={[DOOR_WIDTH/2 + DOOR_FRAME_THICKNESS/2, DOOR_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT + DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Door frame - right (outside) */}
        <mesh position={[DOOR_WIDTH/2 + DOOR_FRAME_THICKNESS/2, DOOR_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + 3*WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_FRAME_THICKNESS, DOOR_HEIGHT + DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Door frame - top (inside) */}
        <mesh position={[0, DOOR_HEIGHT + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_WIDTH + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Door frame - top (outside) */}
        <mesh position={[0, DOOR_HEIGHT + DOOR_FRAME_THICKNESS/2, ROOM_DEPTH / 2 + 3*WALL_THICKNESS/4]} receiveShadow castShadow>
          <boxGeometry args={[DOOR_WIDTH + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS, WALL_THICKNESS/2]} />
          {frameMaterial}
        </mesh>
        {/* Baseboard - left */}
        <mesh position={[-(ROOM_WIDTH/2 - (ROOM_WIDTH/2 - DOOR_WIDTH/2)/2), BASEBOARD_HEIGHT/2, ROOM_DEPTH / 2 - BASEBOARD_DEPTH/2]} receiveShadow castShadow>
          <boxGeometry args={[(ROOM_WIDTH/2 - DOOR_WIDTH/2), BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
          {baseboardMaterial}
        </mesh>
        {/* Baseboard - right */}
        <mesh position={[(ROOM_WIDTH/2 - (ROOM_WIDTH/2 - DOOR_WIDTH/2)/2), BASEBOARD_HEIGHT/2, ROOM_DEPTH / 2 - BASEBOARD_DEPTH/2]} receiveShadow castShadow>
          <boxGeometry args={[(ROOM_WIDTH/2 - DOOR_WIDTH/2), BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
          {baseboardMaterial}
        </mesh>
      </group>

      {/* South Wall (negative Z) */}
      <group>
        <mesh
          position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 - WALL_THICKNESS/2]}
          userData={{ surfaceId: 'wall' }}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]} />
          {getSurfaceMaterial('wall')}
        </mesh>
        {/* Baseboard */}
        <mesh position={[0, BASEBOARD_HEIGHT/2, -ROOM_DEPTH / 2 + BASEBOARD_DEPTH/2]} receiveShadow castShadow>
          <boxGeometry args={[ROOM_WIDTH, BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
          {baseboardMaterial}
        </mesh>
      </group>

      {/* East Wall (positive X) - with window - using extruded shape with hole */}
      <group>
        <mesh
          position={[ROOM_WIDTH / 2, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          userData={{ surfaceId: 'wall' }}
          receiveShadow
          castShadow
        >
          <extrudeGeometry args={[
            (() => {
              const wallShape = new THREE.Shape();
              wallShape.moveTo(-ROOM_DEPTH/2, 0);
              wallShape.lineTo(ROOM_DEPTH/2, 0);
              wallShape.lineTo(ROOM_DEPTH/2, ROOM_HEIGHT);
              wallShape.lineTo(-ROOM_DEPTH/2, ROOM_HEIGHT);
              wallShape.lineTo(-ROOM_DEPTH/2, 0);

              const windowHole = new THREE.Path();
              windowHole.moveTo(-WINDOW_WIDTH/2, WINDOW_SILL_HEIGHT);
              windowHole.lineTo(WINDOW_WIDTH/2, WINDOW_SILL_HEIGHT);
              windowHole.lineTo(WINDOW_WIDTH/2, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT);
              windowHole.lineTo(-WINDOW_WIDTH/2, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT);
              windowHole.lineTo(-WINDOW_WIDTH/2, WINDOW_SILL_HEIGHT);
              wallShape.holes.push(windowHole);

              return wallShape;
            })(),
            { depth: WALL_THICKNESS, bevelEnabled: false }
          ]} />
          {getSurfaceMaterial('wall')}
        </mesh>
        {/* Window sill (inside) */}
        <mesh position={[ROOM_WIDTH / 2, WINDOW_SILL_HEIGHT, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.15, 0.05, WINDOW_WIDTH + 2 * DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window sill (outside) */}
        <mesh position={[ROOM_WIDTH / 2 + WALL_THICKNESS, WINDOW_SILL_HEIGHT, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.15, 0.05, WINDOW_WIDTH + 2 * DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - left (inside) */}
        <mesh position={[ROOM_WIDTH / 2 + WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, -WINDOW_WIDTH/2 - DOOR_FRAME_THICKNESS/2]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, WINDOW_HEIGHT + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - left (outside) */}
        <mesh position={[ROOM_WIDTH / 2 + 3*WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, -WINDOW_WIDTH/2 - DOOR_FRAME_THICKNESS/2]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, WINDOW_HEIGHT + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - right (inside) */}
        <mesh position={[ROOM_WIDTH / 2 + WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, WINDOW_WIDTH/2 + DOOR_FRAME_THICKNESS/2]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, WINDOW_HEIGHT + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - right (outside) */}
        <mesh position={[ROOM_WIDTH / 2 + 3*WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT/2 + DOOR_FRAME_THICKNESS/2, WINDOW_WIDTH/2 + DOOR_FRAME_THICKNESS/2]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, WINDOW_HEIGHT + DOOR_FRAME_THICKNESS, DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - top (inside) */}
        <mesh position={[ROOM_WIDTH / 2 + WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT + DOOR_FRAME_THICKNESS/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, DOOR_FRAME_THICKNESS, WINDOW_WIDTH + DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Window frame - top (outside) */}
        <mesh position={[ROOM_WIDTH / 2 + 3*WALL_THICKNESS/4, WINDOW_SILL_HEIGHT + WINDOW_HEIGHT + DOOR_FRAME_THICKNESS/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[WALL_THICKNESS/2, DOOR_FRAME_THICKNESS, WINDOW_WIDTH + DOOR_FRAME_THICKNESS]} />
          {frameMaterial}
        </mesh>
        {/* Baseboard */}
        <mesh position={[ROOM_WIDTH / 2 - BASEBOARD_DEPTH/2, BASEBOARD_HEIGHT/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[BASEBOARD_DEPTH, BASEBOARD_HEIGHT, ROOM_DEPTH]} />
          {baseboardMaterial}
        </mesh>
      </group>

      {/* West Wall (negative X) */}
      <group>
        <mesh
          position={[-ROOM_WIDTH / 2 - WALL_THICKNESS/2, ROOM_HEIGHT / 2, 0]}
          userData={{ surfaceId: 'wall' }}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH]} />
          {getSurfaceMaterial('wall')}
        </mesh>
        {/* Baseboard */}
        <mesh position={[-ROOM_WIDTH / 2 + BASEBOARD_DEPTH/2, BASEBOARD_HEIGHT/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[BASEBOARD_DEPTH, BASEBOARD_HEIGHT, ROOM_DEPTH]} />
          {baseboardMaterial}
        </mesh>
      </group>

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.8} />
      {/* Center ceiling light */}
      <pointLight position={[0, ROOM_HEIGHT - 0.3, 0]} intensity={2} castShadow />
      {/* Corner lights */}
      <pointLight position={[2, ROOM_HEIGHT - 0.5, 2]} intensity={1.2} castShadow />
      <pointLight position={[-2, ROOM_HEIGHT - 0.5, 2]} intensity={1.2} castShadow />
      <pointLight position={[2, ROOM_HEIGHT - 0.5, -2]} intensity={1.2} castShadow />
      <pointLight position={[-2, ROOM_HEIGHT - 0.5, -2]} intensity={1.2} castShadow />
      {/* Mid-height lights for better wall illumination */}
      <pointLight position={[0, ROOM_HEIGHT / 2, 0]} intensity={0.8} />
      <pointLight position={[2, 1, 0]} intensity={0.6} />
      <pointLight position={[-2, 1, 0]} intensity={0.6} />
    </group>
  );
}

export default Room;
