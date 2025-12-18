import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import RobotArmFK from './components/RobotArmCustom'
import RobotArmIK from './components/RobotArmIKCCD'
import CoordinateControls from './components/inputSlider'
import ControlPanel from './components/ControlPanel'


export default function App() {
  // Coordenadas mundo del IK target
  const fk_bones = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P1']
  const ik_axes = ['X', 'Y', 'Z']
  const [ikTarget, setIkTarget] = useState([0, 45, 0])
  const [fkTarget, setFkTarget] = useState(Array(fk_bones.length).fill(0))
  const [mode, setMode] = useState('IK') // 'IK' o 'FK'
  
  return (
    <div className="w-screen h-screen relative bg-gray-900">

      {/* UI */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow z-10 space-y-2">
        <ControlPanel
          mode={mode}
          setMode={setMode}
          fkTarget={fkTarget}
          setFkTarget={setFkTarget}
          ikTarget={ikTarget}
          setIkTarget={setIkTarget}
          fkAxes={fk_bones}
          ikAxes={ik_axes}
        />
      </div>

      {/* Canvas */}
      <Canvas camera={{ position: [45, 70, 45], fov: 45}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <gridHelper args={[100, 20]} />
        {mode === 'IK' ? (
          <RobotArmIK target={ikTarget} />
        ) : (
          <RobotArmFK target={fkTarget} />
        )}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
