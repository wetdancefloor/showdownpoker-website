import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {CARDS, cardTextures, coverTexture} from './src/deck.js';
import { setupPokerGame } from './src/deck.js';
import gsap from 'gsap';

const gltfLoader = new GLTFLoader();

let hoveredCard;
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let x = -2;


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xFEFEFE);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);   

camera.position.set(0, 10, 6);
camera.lookAt(new THREE.Vector3(0, 6, 2));

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionalLight.position.y = 10;
scene.add(directionalLight);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambientLight);

gltfLoader.load('./kitchen_table.glb', function(glb) {
    const model = glb.scene;
    scene.add(model);
    model.rotateY(Math.PI / 2)
    model.scale.set(0.35, 0.35, 0.35);
    model.position.set(0.25, 0, 0);

    model.traverse(function(node) {
        if(node.isMesh)
            node.receiveShadow = true;
    });
});


// Creates a 12 by 12 grid helper.
const gridHelper = new THREE.GridHelper(12, 12);
scene.add(gridHelper);

CARDS.forEach(function(card) {
    scene.add(card);
});

// setupPokerGame(scene);

window.addEventListener('click', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePosition, camera);
    
    // Raycast against your CARDS array
    const intersects = raycaster.intersectObjects(CARDS);
    if (intersects.length === 0) return; 

    const clickedObject = intersects[0].object;

    // Prevent clicking opponent cards
    if (clickedObject.name.includes('opponent')) return;

    let hoveredCard = clickedObject;
    if (!hoveredCard) return;

    // --- PLAYER CARD ANIMATION ---
    const tl = new gsap.timeline({
        defaults: { duration: 0.4, delay: 0.1 }
    });
    
    tl.to(hoveredCard.rotation, {
        y: Math.PI,
        z: 0
    })
    .to(hoveredCard.position, {
        y: 3.18,
        z: 0.9,
        x // Uses your dynamic x position
    }, 0)
    .to(hoveredCard.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5
    }, 0)
    .to(hoveredCard.rotation, {
        y: 0,
        delay: 1
    }, 0)
    .to(hoveredCard.position, {
        y: 3.33,
        delay: 1
    }, 0);

    const opponentCards = CARDS.filter(card => card.name.includes('opponent') && !card.userData.played);

    console.log("Available opponent cards to play:", opponentCards.length);

    if (opponentCards.length > 0) {
        const minimum = 0;
        let maximum = opponentCards.length - 1;
        let randomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
        
        const chosenOpponentCard = opponentCards[randomNumber];
        chosenOpponentCard.userData.played = true; // Mark as played so it won't be picked again

        console.log("Opponent plays card:", chosenOpponentCard.name);

        const tl2 = new gsap.timeline({
            defaults: { duration: 0.4, delay: 0.4 }
        });

        tl2.to(chosenOpponentCard.rotation, {
            x: 2 * Math.PI - Math.PI / 2,
            z: Math.PI
        })
        .to(chosenOpponentCard.position, {
            y: 3.18,
            z: -0.7,
            x: x // Matches the player's horizontal slot
        }, 0)
        .to(chosenOpponentCard.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5
        }, 0)
        .to(chosenOpponentCard.rotation, {
            y: 0,
            delay: 1
        }, 0)
        .to(chosenOpponentCard.position, {
            y: 3.33,
            delay: 1
        }, 0);
    }

    // Increment player X slot for next turn
    if (x < 2) x++;
});

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});