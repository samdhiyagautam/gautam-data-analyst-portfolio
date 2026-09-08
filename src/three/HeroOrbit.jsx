import { useEffect, useRef } from "react";
import * as THREE from "three";

const NODES = [
  { label: "SQL" },
  { label: "DATA" },
  { label: "BI" },
  { label: "EXCEL" },
  { label: "AUTO" },
  { label: "∞", accent: true },
];

const ORBIT_RADIUS = 1.85;

export default function HeroOrbit() {
  const mountRef = useRef(null);
  const labelRefs = useRef([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = 0.35;
    scene.add(group);

    const coreGeometry = new THREE.IcosahedronGeometry(1.3, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: "#39d879",
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const glowGeometry = new THREE.IcosahedronGeometry(0.8, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: "#d64050",
      transparent: true,
      opacity: 0.16,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    const ringGeometry = new THREE.TorusGeometry(ORBIT_RADIUS, 0.004, 8, 96);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: "#39d879",
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.3;
    group.add(ring);

    const nodeMeshes = NODES.map((node, index) => {
      const geometry = new THREE.SphereGeometry(0.075, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: node.accent ? "#d64050" : "#39d879",
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.angleOffset = (index / NODES.length) * Math.PI * 2;
      mesh.userData.speed = 0.22 + (index % 3) * 0.05;
      group.add(mesh);
      return mesh;
    });

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    const worldPosition = new THREE.Vector3();
    let frameId;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const idle = prefersReducedMotion ? 0.05 : 1;

      core.rotation.y = elapsed * 0.18 * idle;
      core.rotation.x = elapsed * 0.09 * idle;
      glow.rotation.y = -elapsed * 0.12 * idle;

      nodeMeshes.forEach((mesh) => {
        const angle =
          mesh.userData.angleOffset + elapsed * mesh.userData.speed * idle;

        mesh.position.set(
          Math.cos(angle) * ORBIT_RADIUS,
          Math.sin(angle * 0.6) * 0.4,
          Math.sin(angle) * ORBIT_RADIUS
        );
      });

      const targetRotY = elapsed * 0.05 * idle + pointer.x * 0.4;
      const targetRotX = 0.35 - pointer.y * 0.3;

      group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

      renderer.render(scene, camera);

      nodeMeshes.forEach((mesh, index) => {
        const label = labelRefs.current[index];
        if (!label) return;

        worldPosition.setFromMatrixPosition(mesh.matrixWorld);
        worldPosition.project(camera);

        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        const scale = THREE.MathUtils.clamp(
          1 - worldPosition.z * 0.4,
          0.55,
          1.15
        );
        const opacity = THREE.MathUtils.clamp(
          1 - Math.abs(worldPosition.z) * 0.55,
          0.35,
          1
        );

        label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        label.style.opacity = String(opacity);
      });

      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);

      [coreGeometry, glowGeometry, ringGeometry].forEach((geometry) =>
        geometry.dispose()
      );
      [coreMaterial, glowMaterial, ringMaterial].forEach((material) =>
        material.dispose()
      );
      nodeMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });

      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="hero-orbit" ref={mountRef} aria-hidden="true">
      {NODES.map((node, index) => (
        <span
          key={node.label}
          ref={(el) => {
            labelRefs.current[index] = el;
          }}
          className={
            node.accent ? "orbit-label orbit-label--accent" : "orbit-label"
          }
        >
          {node.label}
        </span>
      ))}
    </div>
  );
}
