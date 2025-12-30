import './MaterialSelectorOverlay.css';

function MaterialSelectorOverlay({ onMaterialSelect, onClose, materials }) {

  const handleMaterialClick = (e, materialId) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('Material selected:', materialId);

    onMaterialSelect(materialId);
  };

  const handleDoneClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  return (
    <div className="material-selector-hud">
      <div
        className="material-selector-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="selector-header">
          <h3>Choose Material</h3>
          <p className="hint">Click materials to preview</p>
        </div>
        <div className="material-grid">
          {materials.map((material) => (
            <button
              key={material.id}
              className="material-button"
              onClick={(e) => handleMaterialClick(e, material.id)}
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
        <button className="done-button" onClick={handleDoneClick}>
          Done
        </button>
      </div>
    </div>
  );
}

export default MaterialSelectorOverlay;
