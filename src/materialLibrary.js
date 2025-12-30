// Material library with pre-made realistic materials
// Each material has properties for Three.js MeshStandardMaterial

export const materialLibrary = {
  // Neutrals
  white: {
    name: 'White Paint',
    color: '#f5f5f5',
    roughness: 0.9,
    metalness: 0,
  },
  lightGray: {
    name: 'Light Gray',
    color: '#d3d3d3',
    roughness: 0.8,
    metalness: 0,
  },
  darkGray: {
    name: 'Dark Gray',
    color: '#808080',
    roughness: 0.7,
    metalness: 0,
  },
  black: {
    name: 'Black Paint',
    color: '#2b2b2b',
    roughness: 0.9,
    metalness: 0,
  },

  // Wood tones
  lightWood: {
    name: 'Light Wood',
    color: '#d4a574',
    roughness: 0.8,
    metalness: 0,
  },
  mediumWood: {
    name: 'Medium Wood',
    color: '#8b6f47',
    roughness: 0.7,
    metalness: 0,
  },
  darkWood: {
    name: 'Dark Wood',
    color: '#3e2723',
    roughness: 0.6,
    metalness: 0,
  },

  // Colors
  navyBlue: {
    name: 'Navy Blue',
    color: '#1e3a5f',
    roughness: 0.8,
    metalness: 0,
  },
  forestGreen: {
    name: 'Forest Green',
    color: '#2d5016',
    roughness: 0.8,
    metalness: 0,
  },
  burgundy: {
    name: 'Burgundy',
    color: '#6d1a36',
    roughness: 0.7,
    metalness: 0,
  },
  cream: {
    name: 'Cream',
    color: '#f5f5dc',
    roughness: 0.85,
    metalness: 0,
  },
  skyBlue: {
    name: 'Sky Blue',
    color: '#87ceeb',
    roughness: 0.8,
    metalness: 0,
  },

  // Materials
  concrete: {
    name: 'Concrete',
    color: '#9e9e9e',
    roughness: 0.95,
    metalness: 0,
  },
  marble: {
    name: 'Marble',
    color: '#e8e8e8',
    roughness: 0.3,
    metalness: 0.1,
  },
  copper: {
    name: 'Copper',
    color: '#b87333',
    roughness: 0.4,
    metalness: 0.9,
  },
  steel: {
    name: 'Brushed Steel',
    color: '#b0b0b0',
    roughness: 0.5,
    metalness: 0.9,
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    roughness: 0.3,
    metalness: 1.0,
  },
};

// Get an array of all materials for UI display
export const getMaterialList = () => {
  return Object.entries(materialLibrary).map(([id, material]) => ({
    id,
    ...material,
  }));
};
