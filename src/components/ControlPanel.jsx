import React from 'react';
import CoordinateControls from './inputSlider';

const ControlPanel = ({
    mode,
    setMode,
    fkTarget,
    setFkTarget,
    ikTarget,
    setIkTarget,
    fkAxes,
    ikAxes
}) => {
    return (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-6 rounded-xl shadow-2xl z-10 w-80 border border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Robot Control</h2>

            {/* Mode Switcher */}
            <div className="flex bg-gray-200 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setMode('IK')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'IK'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    IK Mode
                </button>
                <button
                    onClick={() => setMode('FK')}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === 'FK'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    FK Mode
                </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                {mode === 'IK' ? (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">Inverse Kinematics</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Target XYZ</span>
                        </div>
                        <CoordinateControls
                            target={ikTarget}
                            setTarget={setIkTarget}
                            axes={ikAxes}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">Forward Kinematics</h3>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Joint Angles</span>
                        </div>
                        <CoordinateControls
                            target={fkTarget}
                            setTarget={setFkTarget}
                            axes={fkAxes}
                        />
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-400">
                    Select a mode to control the robotic arm.
                </p>
            </div>
        </div>
    );
};

export default ControlPanel;