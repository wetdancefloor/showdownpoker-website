import {
    MeshBasicMaterial,
    BoxGeometry,
    Mesh,
    SRGBColorSpace,
    TextureLoader,
    Vector3,
} from 'three';

const textureLoader = new TextureLoader();
const cardGeo = new BoxGeometry(1, 1.5, 0.05);

const cardTextures = {};
const suits = ['Clovers', 'Pikes', 'Tiles', 'Hearts'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

// Load 52 card faces
suits.forEach(suit => {
    values.forEach(value => {
        const fileName = `${suit}_${value}_black.png`;
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

function configureCard(card, pos, rot, rNumb, name) {
    card.name = name;
    card.castShadow = true;
    card.position.copy(pos[rNumb]);
    card.rotation.set(rot[rNumb].x, rot[rNumb].y, rot[rNumb].z);
    pos.splice(rNumb, 1);
    rot.splice(rNumb, 1);
    CARDS.push(card);
}

export function setupPokerGame(scene) {
    // 1. Spawns all 52 cards
    let cardIndex = 0;
    suits.forEach(suit => {
        values.forEach(value => {
            const key = `${suit}_${value}`;

            const cardMaterials = [
                sideMaterial, 
                sideMaterial, 
                sideMaterial, 
                sideMaterial, 
                new MeshBasicMaterial({ map: cardTextures[key] }), 
                new MeshBasicMaterial({ map: coverTexture })          
            ];

            const cardMesh = new Mesh(cardGeo, cardMaterials);

            cardMesh.position.x = 0;
            cardMesh.position.z = -1;
            cardMesh.position.y = cardIndex * 0.051; 

            cardMesh.rotation.x = -Math.PI / 2;
            cardMesh.rotation.y = 0;
            cardMesh.rotation.z = 0; 

            scene.add(cardMesh);
            cardIndex++;
        });
    });

    // 2. Generate deck keys
    const deckKeys = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deckKeys.push(`${suit}_${value}`);
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

    for (let i = 0; i < 5; i++) {
        const randomDeckIndex = Math.floor(Math.random() * deckKeys.length);
        const cardKey = deckKeys[randomDeckIndex];
        deckKeys.splice(randomDeckIndex, 1);

        const randomPosIndex = Math.floor(Math.random() * myCardsPositions.length);

        const cardMaterials = [
            sideMaterial, sideMaterial, sideMaterial, sideMaterial, 
            new MeshBasicMaterial({ map: cardTextures[cardKey] }), 
            new MeshBasicMaterial({ map: coverTexture })          
        ];

        const card = new Mesh(cardGeo, cardMaterials);
        configureCard(card, myCardsPositions, myCardsRotations, randomPosIndex, cardKey, `playerCard_${cardKey}`);
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
        const cardKey = deckKeys[randomDeckIndex];
        deckKeys.splice(randomDeckIndex, 1);

        const randomPosIndex = Math.floor(Math.random() * opponentCardsPositions.length);

        const cardMaterials = [
            sideMaterial, sideMaterial, sideMaterial, sideMaterial, 
            new MeshBasicMaterial({ map: cardTextures[cardKey] }), 
            new MeshBasicMaterial({ map: coverTexture })          
        ];

        const opponentCard = new Mesh(cardGeo, cardMaterials);
        configureCard(opponentCard, opponentCardsPositions, opponentCardsRotations, randomPosIndex, `opponent_${cardKey}`);
        scene.add(opponentCard);
    }
}

export { CARDS, cardTextures, coverTexture };