import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Configuración de ejes de rotación por hueso
const BONE_ROTATION_CONFIG = [
  { axis: 'y' }, // Hueso1
  { axis: 'x' }, // Hueso2
  { axis: 'x' }, // Hueso3
  { axis: 'y' }, // Hueso4
  { axis: 'x' }, // Hueso5
  { axis: 'y' }, // Hueso6
];

export default function RobotArmFK({ target }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/arm.glb`)
  const base = scene.getObjectByName('Hueso1')

  const bones = useRef([])
  const ikTarget = useRef(null)
  const claws = useRef([])

  useEffect(() => {
    const targetObj = scene.getObjectByName('HuesoIK')
    ikTarget.current = targetObj

    const chain = [base]
    let current = base
    const i_bone = [2, 3, 4, 5, 6];

    for (let i of i_bone) {
      const next = current.children.find(c => c.name === `Hueso${i}`)
      if (!next){
        console.error(`No se encontró Hueso${i}`)
        break
      }
      chain.push(next)
      current = next
    }

    bones.current = chain
    claws.current = [
      scene.getObjectByName('Hueso007'),
      scene.getObjectByName('Hueso008')
    ]

    console.log('Cadena:', bones.current.map(b => b.name))
    console.log('Objetos en escena:', scene.children.map(o => o.name))
    console.log('Garras:', claws.current.map(c => c.name))

    const geometry = new THREE.SphereGeometry(1, 16, 16); 
    const material = new THREE.MeshBasicMaterial({ 
        color: "green",
        depthTest: false,
        depthWrite: false,
        transparent: true,
    });
    const pointTarget = new THREE.Mesh(geometry, material);
    pointTarget.position.set(10, 5, 3); 
    pointTarget.renderOrder = 999;
    scene.add(pointTarget);
  }, [scene, base])

  // Rotación directa (FK)
  useFrame(() => {
    if (bones.current.length === 0) {
      console.warn("Cadena de huesos no inicializada aún.")
      return
    }

    // Aplicar rotaciones a los huesos según configuración
    bones.current.forEach((bone, index) => {
      const config = BONE_ROTATION_CONFIG[index]
      if (config && target[index] !== undefined) {
        bone.rotation[config.axis] = target[index]
      }
    })

    // Aplicar rotación a las garras
    if (claws.current.length === 2 && target[6] !== undefined) {
      claws.current[0].rotation.z = target[6]
      claws.current[1].rotation.z = -target[6]
    }
  })

  return <primitive object={scene} />
}