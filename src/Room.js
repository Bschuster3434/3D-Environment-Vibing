import React from 'react';
import { materialLibrary } from './materialLibrary';

// Room dimensions
const ROOM_WIDTH = 8;  // X axis
const ROOM_HEIGHT = 3; // Y axis
const ROOM_DEPTH = 8;  // Z axis

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
  console.log('🏠 Room render - wallMaterial:', wallMaterial, 'floorMaterial:', floorMaterial);

  const getSurfaceMaterial = (surfaceId) => {
    let material;

    if (surfaceId === 'floor') {
      material = floorMaterials[floorMaterial] || floorMaterials.hardwood;
    } else if (surfaceId === 'wall') {
      material = wallMaterials[wallMaterial] || wallMaterials.whitePaint;
      console.log('🧱 Getting wall material:', wallMaterial, '→', material);
    } else if (surfaceId === 'ceiling') {
      material = materialLibrary.white;
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

      {/* North Wall (positive Z) */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}
        userData={{ surfaceId: 'wall' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        {getSurfaceMaterial('wall')}
      </mesh>

      {/* South Wall (negative Z) */}
      <mesh
        position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}
        userData={{ surfaceId: 'wall' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        {getSurfaceMaterial('wall')}
      </mesh>

      {/* East Wall (positive X) */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        userData={{ surfaceId: 'wall' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        {getSurfaceMaterial('wall')}
      </mesh>

      {/* West Wall (negative X) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        userData={{ surfaceId: 'wall' }}
        receiveShadow
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        {getSurfaceMaterial('wall')}
      </mesh>

      {/* Basic Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} castShadow />
      <pointLight position={[3, 2, 3]} intensity={0.5} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.5} castShadow />
    </group>
  );
}

export default Room;
