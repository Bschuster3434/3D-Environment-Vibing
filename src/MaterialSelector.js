import React from 'react';
import { getMaterialList } from './materialLibrary';
import './MaterialSelector.css';

function MaterialSelector({ selectedSurface, onMaterialSelect }) {
  const materials = getMaterialList();

  if (!selectedSurface) {
    return null; // Completely hidden when no surface is selected
  }

  return (
    <div className="material-selector active">
      <div className="selector-header">
        <h3>Change Material</h3>
        <p className="selected-surface">Selected: {selectedSurface}</p>
      </div>
      <div className="material-grid">
        {materials.map((material) => (
          <button
            key={material.id}
            className="material-button"
            onClick={() => onMaterialSelect(material.id)}
            title={material.name}
          >
            <div
              className="material-swatch"
              style={{
                backgroundColor: material.color,
                opacity: material.metalness > 0.5 ? 0.9 : 1,
              }}
            />
            <span className="material-name">{material.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MaterialSelector;
