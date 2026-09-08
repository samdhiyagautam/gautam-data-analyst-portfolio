import { useEffect, useRef } from "react";
import * as THREE from "three";

const GREEN = new THREE.Color("#39d879");
const RED = new THREE.Color("#d64050");
const POINT_COUNT = 220;
const LINK_DISTANCE = 2.6;
const MAX_LINKS_PER_POINT = 2;

export default function BackgroundField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);

    for (let i = 0; i < POINT_COUNT; i++) {
      const radius = 6 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 6;

      const color = Math.random() > 0.86 ? RED : GREEN;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    pointGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pointMaterial = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(points);

    // Connect nearby points into a faint data-network mesh.
    const linkPositions = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();

    for (let i = 0; i < POINT_COUNT; i++) {
      a.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      let links = 0;

      for (let j = i + 1; j < POINT_COUNT && links < MAX_LINKS_PER_POINT; j++) {
        b.set(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);

        if (a.distanceTo(b) < LINK_DISTANCE) {
          linkPositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
          links++;
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linkPositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: "#39d879",
      transparent: true,
      opacity: 0.12,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const speed = prefersReducedMotion ? 0.003 : 0.05;

      points.rotation.y = elapsed * speed;
      lines.rotation.y = points.rotation.y;
      points.rotation.x = Math.sin(elapsed * 0.05) * 0.08;
      lines.rotation.x = points.rotation.x;

      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.02;
      camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -4);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);

      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="bg-field" aria-hidden="true" />;
}
