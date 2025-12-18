import React from 'react';

const CoordinateControls = ({ target, setTarget, axes = ['X', 'Y', 'Z'] }) => {

  const handleSliderChange = (index, value) => {
    const next = [...target];
    next[index] = parseFloat(value);
    setTarget(next);
  };

  let min_value = -100;
  let max_value = 100;

  if (target.length != 3) { 
    min_value = -Math.PI;
    max_value = Math.PI;
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl w-full overflow-hidden">
      <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-4 opacity-75">
        Target Position
      </h3>
      <div className="space-y-3 w-full">
        {axes.map((axis, i) => (
          <div key={axis} className="flex items-center gap-2 w-full">
            {/* Etiqueta con valor actual */}
            <label className="text-blue-400 font-mono text-xs w-14 shrink-0 flex-shrink-0">
              <span className="text-white mr-1">{axis}:</span>
              {target[i].toFixed(2)}
            </label>
            
            {/* Slider estilizado */}
            <div className="flex-1 min-w-0">
              <input
                type="range"
                min={min_value}
                max={max_value}
                step={0.05}
                value={target[i]}
                onChange={(e) => handleSliderChange(i, e.target.value)}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoordinateControls;