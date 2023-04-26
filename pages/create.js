import { Scene } from "phaser";
import Phaser from "phaser";
import agent from '../agent/agent';
import agents from "../agent/agents";
import memoryStream from "../agent/memoryStream";

export default class Creater extends Scene {

    constructor() {
        super("creater")
    }

    async create() {
        this.fieldMapTileMap = this.make.tilemap({ key: "field-map" });
        this.fieldMapTileMap.addTilesetImage("cityRogue", "tiles");
        this.fieldMapTileMap.layers.forEach((_, i) => {
            const layer = this.fieldMapTileMap.createLayer(i, "cityRogue", 0, 0);
                layer.scale = 3;
        });

        // Set up camera controls
        this.cameras.main.zoom = 0.85;
        const cursors = this.input.keyboard.createCursorKeys();

        const controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        // Add characters to grid engine
        const player1Sprite = this.add.sprite(0, 0, "player");
        player1Sprite.scale = 1.5;

        const player2Sprite = this.add.sprite(0, 0, "player");
        player2Sprite.scale = 1.5;
    
        const agent1 = "agent1";
        const agent2 = "agent2";
    
        const gridEngineConfig = {
            characters: [
                {
                    id: agent1,
                    sprite: player1Sprite,
                    walkingAnimationMapping: 6,
                    startPosition: { x: 7, y: 6 }
                },
                {
                    id: agent2,
                    sprite: player2Sprite,
                    walkingAnimationMapping: 1,
                    startPosition: { x: 17, y: 6 }
                },
            ],
        };
        // Add character to grid engine
        this.gridEngine.create(this.fieldMapTileMap, gridEngineConfig);

        this.gridEngine.moveRandomly(agent1);
        this.gridEngine.moveRandomly(agent2);
    
        // Create AI agents
        this.edward = new agent(
            "Edward",
            new memoryStream("Edward"),
            this.gridEngine, 
            this.fieldMapTileMap,
            agent1, 
            {x: 6, y: 5});
        await this.edward.memoryStream.loadLocalMemory("Edward");
        this.edward.memoryStream.addMemory("Edward is an Engineer at the Magic Corp.");
        this.edward.memoryStream.addMemory("Edward recently saw a beautiful sunrise");
        this.edward.memoryStream.addMemory("Edward lakes to take long walks on the beach and think about the future");
        this.edward.memoryStream.addMemory("Edward is thinking about adopting a dog");

        this.rosalie = new agent(
            "Rosalie",
            new memoryStream("Rosalie"),
            this.gridEngine,
            this.fieldMapTileMap,
            agent2,
            {x: 6, y: 5}
        )
        await this.rosalie.memoryStream.loadLocalMemory("Rosalie");
        this.rosalie.memoryStream.addMemory("Rosalie is data analyst at the Health Corp.");
        this.rosalie.memoryStream.addMemory("Rosalie recently saw a beautiful sunset");
        this.rosalie.memoryStream.addMemory("Rosalie likes to take walks outside to clear her head");
        this.rosalie.memoryStream.addMemory("Rosalie is thinking about adopting a dog");

        agents.manifest.push(this.edward);
        agents.manifest.push(this.rosalie);
    
        // Expose to extension
        window.__GRID_ENGINE__ = this.gridEngine;
    }

    update (time, delta) {
        this.controls.update(delta);

        for (const agent of agents.manifest) {
            agent.update();
        }
    }

};