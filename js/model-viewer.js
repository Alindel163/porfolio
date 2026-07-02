import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

export function init3DViewer(modelPath, container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1020);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(2, 1.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
   //renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);


   // Свет (без теней)
const ambientLight = new THREE.AmbientLight(0x8090b0, 0.8);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(2, 3, 2);
mainLight.castShadow = false;  // ← добавьте
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
fillLight.position.set(-2, 1, 1);
fillLight.castShadow = false;
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffaa66, 0.3);
backLight.position.set(0, 1, -2);
scene.add(backLight);

const rimLight = new THREE.DirectionalLight(0x88aaff, 0.3);
rimLight.position.set(-1, 1, -1.5);
scene.add(rimLight);

    //const gridHelper = new THREE.GridHelper(5, 20, 0x336699, 0x225588);
    //gridHelper.position.y = -0.8;
    //scene.add(gridHelper);

    let mixer = null;
    let animationActions = [];
    let currentAnimationIndex = 0;

    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;

         model.traverse((node) => { //отключение тени
        if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
        }
    });

        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;
        model.scale.set(scale, scale, scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);

            gltf.animations.forEach((clip, index) => {
                const action = mixer.clipAction(clip);
                action.play();
                action.enabled = true;
                animationActions.push({
                    name: clip.name || `Animation ${index + 1}`,
                    action: action,
                    index: index
                });
            });

            animationActions.forEach((item, idx) => {
                if (idx !== 0) {
                    item.action.enabled = false;
                    item.action.stop();
                }
            });

            addAnimationControls(container, animationActions);
        }

    }, undefined, (error) => {
        console.error('Model error:', error);
        container.innerHTML = '<p style="color: #ff8888; text-align: center; padding: 20px;">Failed to load 3D model</p>';
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) {
            mixer.update(delta);
        }
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    resizeObserver.observe(container);
}

function addAnimationControls(container, animationActions) {
    const panel = document.createElement('div');
    panel.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        min-width: 300px;        
        transform: translateX(-50%);
        background: rgba(10, 20, 40, 0.8);
        backdrop-filter: blur(8px);
        padding: 10px 16px;
        border-radius: 30px;
        border: 1px solid rgba(100, 150, 200, 0.3);
        display: flex;
        gap: 8px;
        z-index: 10;
        flex-wrap: wrap;
        justify-content: center;
    `;

    let selectedIndex = 0;

    animationActions.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.textContent = item.name;
        btn.style.cssText = `
            background: ${idx === 0 ? '#2266aa' : 'rgba(34, 102, 170, 0.3)'};
            color: white;
            border: 1px solid #4488cc;
            padding: 4px 12px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        `;
        btn.onmouseover = () => { btn.style.background = '#3388cc'; };
        btn.onmouseout = () => {
            btn.style.background = idx === selectedIndex ? '#2266aa' : 'rgba(34, 102, 170, 0.3)';
        };
        btn.onclick = () => {
            animationActions.forEach(a => {
                a.action.enabled = false;
                a.action.stop();
            });
            item.action.enabled = true;
            item.action.play();
            selectedIndex = idx;

            document.querySelectorAll('.anim-btn').forEach((b, i) => {
                b.style.background = i === idx ? '#2266aa' : 'rgba(34, 102, 170, 0.3)';
            });
        };
        btn.className = 'anim-btn';
        panel.appendChild(btn);
    });

    container.style.position = 'relative';
    container.appendChild(panel);
}