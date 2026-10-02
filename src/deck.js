import {
    MeshBasicMaterial,
    BoxGeometry,
    Mesh,
    SRGBColorSpace,
    TextureLoader,
    Vector3,
} from 'three';

import { evaluatePokerHand } from './pokerEvaluator.js'; // Make sure this path points to your evaluator

const textureLoader = new TextureLoader();
const cardGeo = new BoxGeometry(1, 1.5, 0.05);

const cardTextures = {};
const suits = ['diamonds', 'hearts', 'spades', 'clubs'];
const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

// Load 52 card faces
suits.forEach(suit => {
    values.forEach(value => {
        const fileName = `${value}_of_${suit}.svg`;
        const path = `/${fileName}`;
        const key = `${suit}_${value}`;

        const texture = textureLoader.load(path);
        texture.colorSpace = SRGBColorSpace;
        cardTextures[key] = texture;
    });
});

// Load card back texture
const coverTexture = textureLoader.load('/card back.png');
coverTexture.colorSpace = SRGBColorSpace;

const sideMaterial = new MeshBasicMaterial({ color: 0xffffff }); // White edges

const CARDS = [];

function configureCard(card, pos, rot, rNumb, name, userData) {
    card.name = name;
    card.castShadow = true;
    card.position.copy(pos[rNumb]);
    card.rotation.set(rot[rNumb].x, rot[rNumb].y, rot[rNumb].z);
    card.userData = userData; // <-- Attach userData here
    pos.splice(rNumb, 1);
    rot.splice(rNumb, 1);
    CARDS.push(card);
}

// Helper to normalize 'Jack' -> 'J', etc. for the poker evaluator
function getNormalHand(val) {
    if (val === 'Jack') return 'J';
    if (val === 'Queen') return 'Q';
    if (val === 'King') return 'K';
    return val;
}

export function setupPokerGame(scene) {
    // 1. Spawns all 52 cards (hidden/deck stack)
    let cardIndex = 0;
    suits.forEach(suit => {
        values.forEach(value => {
            const key = `${suit}_${value}`;

            const cardMaterials = [
                sideMaterial, sideMaterial, sideMaterial, sideMaterial, 
                new MeshBasicMaterial({ map: cardTextures[key] }), 
                new MeshBasicMaterial({ map: coverTexture })          
            ];

            const cardMesh = new Mesh(cardGeo, cardMaterials);
            cardMesh.position.x = 0;
            cardMesh.position.z = -1;
            cardMesh.position.y = cardIndex * 0.051; 
            cardMesh.rotation.x = -Math.PI / 2;

            // Optional: Give deck stack cards userData too just in case
            cardMesh.userData = {
                rank: getNormalHand(value),
                suit: suit,
                played: false,
                selected: false
            };

            scene.add(cardMesh);
            cardIndex++;
        });
    });

    // 2. Generate deck keys
    const deckKeys = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deckKeys.push({ suit, value });
        });
    });

    // 3. Player positions & hand deal
    const myCardsPositions = [
        new Vector3(0.5, 6.004, 4.21),
        new Vector3(0.25, 6.003, 4.17),
        new Vector3(0, 6.002, 4.15),
        new Vector3(-0.25, 6.001, 4.17),
        new Vector3(-0.5, 6, 4.21)
    ];

    const myCardsRotations = [
         new Vector3(-Math.PI / 2, 0, -0.15),
         new Vector3(-Math.PI / 2, 0, -0.10),
         new Vector3(-Math.PI / 2, 0, 0),
         new Vector3(-Math.PI / 2, 0, 0.10),
         new Vector3(-Math.PI / 2, 0, 0.15)
    ];

    // Array to hold the player's starting cards for evaluation
    const initialPlayerHand = [];

    for (let i = 0; i < 5; i++) {
        const randomDeckIndex = Math.floor(Math.random() * deckKeys.length);
        const cardData = deckKeys[randomDeckIndex];
        deckKeys.splice(randomDeckIndex, 1);

        const cardKey = `${cardData.suit}_${cardData.value}`;
        const randomPosIndex = Math.floor(Math.random() * myCardsPositions.length);

        // Save normalized rank/suit for the evaluator
        initialPlayerHand.push({
            rank: getNormalHand(cardData.value),
            suit: cardData.suit
        });
        
        const cardMaterials = [
            sideMaterial, sideMaterial, sideMaterial, sideMaterial, 
            new MeshBasicMaterial({ map: cardTextures[cardKey] }), 
            new MeshBasicMaterial({ map: coverTexture })          
        ];

        const card = new Mesh(cardGeo, cardMaterials);
        
        const cardUserData = {
            rank: getNormalHand(cardData.value),
            suit: cardData.suit,
            played: false,
            selected: false
        };

        configureCard(card, myCardsPositions, myCardsRotations, randomPosIndex, `playerCard_${cardKey}`, cardUserData);
        scene.add(card);
    }

    // 4. Opponent positions & hand deal
    const opponentCardsPositions = [
        new Vector3(0.5, 8.47, 2.5),
        new Vector3(0.25, 8.5, 2.501),
        new Vector3(0, 8.515, 2.502),
        new Vector3(-0.25, 8.5, 2.503),
        new Vector3(-0.5, 8.47, 2.504)
    ];

    const opponentCardsRotations = [
        new Vector3(2 * Math.PI / 2, Math.PI, 0.15),
        new Vector3(2 * Math.PI / 2, Math.PI, 0.10),
        new Vector3(2 * Math.PI / 2, Math.PI, 0),
        new Vector3(2 * Math.PI / 2, Math.PI, -0.10),
        new Vector3(2 * Math.PI / 2, Math.PI, -0.15)
    ];

    for (let i = 0; i < 5; i++) {
        const randomDeckIndex = Math.floor(Math.random() * deckKeys.length);
        const cardData = deckKeys[randomDeckIndex];
        deckKeys.splice(randomDeckIndex, 1);

        const cardKey = `${cardData.suit}_${cardData.value}`;
        const randomPosIndex = Math.floor(Math.random() * opponentCardsPositions.length);

        const cardMaterials = [
            sideMaterial, sideMaterial, sideMaterial, sideMaterial, 
            new MeshBasicMaterial({ map: cardTextures[cardKey] }), 
            new MeshBasicMaterial({ map: coverTexture })          
        ];

        const opponentCard = new Mesh(cardGeo, cardMaterials);
        
        const cardUserData = {
            rank: getNormalHand(cardData.value),
            suit: cardData.suit,
            played: false,
            selected: false
        };

        configureCard(opponentCard, opponentCardsPositions, opponentCardsRotations, randomPosIndex, `opponent_${cardKey}`, cardUserData);
        scene.add(opponentCard);
    }

    // --- 5. EVALUATE AUTOMATICALLY AFTER DEAL ---
    const evaluatedHand = evaluatePokerHand(initialPlayerHand, []);
    console.log("Initial Hand Evaluated:", evaluatedHand);

    const comboTextElement = document.getElementById('combo-text');
    if (comboTextElement) {
        if (evaluatedHand && evaluatedHand.name) {
            comboTextElement.textContent = evaluatedHand.name;
        } else {
            comboTextElement.textContent = "High Card";
        }
    }
}

export { CARDS, cardTextures, coverTexture };