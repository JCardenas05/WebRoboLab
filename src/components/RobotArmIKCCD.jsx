import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function RobotArmIK({ target }) {
  const { scene } = useGLTF('/models/arm.glb')

  const bones = useRef([])
  const pointTarget = useRef(null)
  const claws = useRef([])

  // ─────────────────────────────────────────────
  // Restricciones por joint (ejes GLOBALES)
  // ─────────────────────────────────────────────
  const jointConstraints = {
    Hueso1: { axis: 'y' },
    Hueso2: { axis: 'x' },
    Hueso3: { axis: 'x' },
    Hueso4: { axis: 'y' },
    Hueso5: { axis: 'x' },
    Hueso6: { axis: 'y' },
  }

  // ─────────────────────────────────────────────
  // Límites angulares (RAD)
  // ─────────────────────────────────────────────
  const jointLimits = {
    Hueso1: { min: -Math.PI * 2, max: Math.PI * 2 },
    Hueso2: { min: -1.7, max: 1.7 },
    Hueso3: { min: 1.2, max: 5.1 },
    Hueso4: { min: -Math.PI * 2, max: Math.PI * 2 },
    Hueso5: { min: 1.3, max: 5.0 },
    Hueso6: { min: 0, max: Math.PI * 2 },
  }

  // ─────────────────────────────────────────────
  // Inicialización
  // ─────────────────────────────────────────────
  useEffect(() => {
    const base = scene.getObjectByName('Hueso1')
    if (!base) {
      console.error('No se encontró Hueso1')
      return
    }

    // Cadena IK
    const chain = [base]
    let current = base
    const indices = [2, 3, 4, 5, 6]

    for (const i of indices) {
      const next = current.children.find(
        (c) => c.name === `Hueso${i}`
      )
      if (!next) break
      chain.push(next)
      current = next
    }

    bones.current = chain

    // Garras
    claws.current = [
      scene.getObjectByName('Hueso007'),
      scene.getObjectByName('Hueso008'),
    ]

    // Target visual
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 'green',
        depthTest: false,
        depthWrite: false,
        transparent: true,
      })
    )
    sphere.position.set(target[0], target[1], target[2])
    sphere.renderOrder = 999
    scene.add(sphere)
    pointTarget.current = sphere

    console.log('Cadena IK:', bones.current.map(b => b.name))
    console.log('Garras:', claws.current.map(c => c.name))
  }, [scene])

  // ─────────────────────────────────────────────
  // CCD IK Solver + límites
  // ─────────────────────────────────────────────
  function solveIKCCD(bones, targetObj, iterations = 6) {
    const targetPos = new THREE.Vector3()
    targetObj.getWorldPosition(targetPos)

    const endEffector = bones[bones.length - 1]

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = bones.length - 2; i >= 0; i--) {
        const bone = bones[i]
        const constraint = jointConstraints[bone.name]
        const limits = jointLimits[bone.name]
        if (!constraint || !limits) continue

        const bonePos = new THREE.Vector3()
        const endPos = new THREE.Vector3()

        bone.getWorldPosition(bonePos)
        endEffector.getWorldPosition(endPos)

        const toEnd = endPos.clone().sub(bonePos).normalize()
        const toTarget = targetPos.clone().sub(bonePos).normalize()

        // eje GLOBAL
        const axis =
          constraint.axis === 'x'
            ? new THREE.Vector3(1, 0, 0)
            : constraint.axis === 'y'
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(0, 0, 1)

        const cross = new THREE.Vector3()
          .crossVectors(toEnd, toTarget)

        const projected = cross.projectOnVector(axis)
        const angle = toEnd.angleTo(toTarget)

        if (projected.lengthSq() === 0 || angle < 1e-4) continue

        bone.rotateOnWorldAxis(
          axis,
          Math.sign(projected.dot(axis)) * angle
        )

        if (constraint.axis === 'x') {
          bone.rotation.x = THREE.MathUtils.clamp(
            bone.rotation.x,
            limits.min,
            limits.max
          )
        }
        if (constraint.axis === 'y') {
          bone.rotation.y = THREE.MathUtils.clamp(
            bone.rotation.y,
            limits.min,
            limits.max
          )
        }
        if (constraint.axis === 'z') {
          bone.rotation.z = THREE.MathUtils.clamp(
            bone.rotation.z,
            limits.min,
            limits.max
          )
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // Loop
  // ─────────────────────────────────────────────
  useFrame(() => {
    if (!pointTarget.current || bones.current.length === 0) return

    // mover target
    pointTarget.current.position.set(
      target[0],
      target[1],
      target[2]
    )

    solveIKCCD(bones.current, pointTarget.current)
  })

  return <primitive object={scene} scale={0.75} />
}
