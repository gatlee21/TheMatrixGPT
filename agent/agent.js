import { promptChat } from "./prompt";
import agents from "./agents";

export default class agent {
    constructor(name, memoryStream, gridEngine, fieldMapTileMap, agentID) {
        this.name = name;
        this.memoryStream = memoryStream;
        this.gridEngine = gridEngine;
        this.fieldMapTileMap = fieldMapTileMap;
        this.agentID = agentID;
        this.state = "";
        // TODO: add personality traits
    }

    update() {
      this.lookForNearbyAgents();
    }

    // TODO: how to save memories based interview observations
    async interview(query) {
        const retrievedMemories = await this.memoryStream.retrieveMemories(query);

        // console.log("retrieved memories based on query: " + query);
        // console.log(retrievedMemories);

        // Prompt the language model to answer the query
        const prompt = this.respondToMemories(this.name, retrievedMemories, query);
        const response = await promptChat(prompt);
        // console.log("openAI response:");
        // console.log(response.data.choices[0].message.content);
        return response.data.choices[0].message.content;
    }

    respondToMemories(name, memories, query) {
        const template = `Write a response based on the memories provided. Replace the <name> with I. Respond using informal language. Your personality is based on the memories provided.\n\n<memories>\n\nQuery: <query>`;
      
        const memoriesString = memories.join("\n"); // Convert the list of memories to a string with each item on a new line
        const filledTemplate = template
          .replace("<memories>", memoriesString)
          .replace("<query>", query)
          .replace("<name>", name);
      
        return filledTemplate;
    }

    requestLocalMovement() {
      const x = Math.floor(Math.random() * 361); // Generates a random integer between 0 and 360
      const y = Math.floor(Math.random() * 241); // Generates a random integer between 0 and 240
    
      this.gridEngine.moveTo(this.agentID, { x: x, y: y });
    }

    async requestMovement() {
        if (this.state == "")
        {
          try {
            const prompt = `
              Write a response based on the information provided. Graham is located at position ${JSON.stringify(this.getAgentPosition())}
              move him to another location. You can choose at random.

              Respond using the following JSON format:

                  {
                      action: {
                      type: "navigate",
                      destination: {x: 10, y: 12}
                      }
                  }

              Respond ONLY using the JSON format above. Nothing else.
            `;

            const response = await promptChat(prompt);
            
            // console.log("requestMovement response:");
            const data = JSON.parse(response.data.choices[0].message.content);
            // console.log(data);

            // Move the agent to the destination
            this.gridEngine.moveTo(this.agentID, { x: data.action.destination.x, y: data.action.destination.y });

            } catch (error) {
                console.error("Error processing GPT-3 response:", error);
            }
        }
        else {
          console.log("Not moving. Engaged in other activity..");
        }

    }

    getAgentPosition() {
        return this.gridEngine.getPosition(this.agentID);
    }
    
    getSurroundings() {
        const playerPosition = this.getAgentPosition();
        const { x: playerX, y: playerY } = playerPosition;
      
        const surroundings = {
          up: 'walkable',
          down: 'walkable',
          left: 'walkable',
          right: 'walkable'
        };
      
        const directions = [
          { key: 'up', dx: 0, dy: -1 },
          { key: 'down', dx: 0, dy: 1 },
          { key: 'left', dx: -1, dy: 0 },
          { key: 'right', dx: 1, dy: 0 }
        ];
      
        this.fieldMapTileMap.layers.forEach((layer) => {
          const tilemapLayer = layer.tilemapLayer;
      
          directions.forEach((direction) => {
            const tile = tilemapLayer.getTileAt(
              playerX + direction.dx,
              playerY + direction.dy
            );
      
            if (tile && tile.properties.ge_collide) {
              surroundings[direction.key] = 'wall';
            }
          });
        });
    
        return surroundings;
    }

    lookForNearbyAgents() {
      if (this.state == "") {
        let { nearestAgent, closestDistance } = this.findNearestAgent();
        
        if (closestDistance <= 2) {
          let shouldTalk = this.shouldEngageInConversation();

          if (shouldTalk)
          {
            // NOTE: use .stopMovement(id) instead;
            this.gridEngine.moveTo(this.agentID, this.getAgentPosition());
            this.state = "talking";
            console.log(this.name + " should talk to " + nearestAgent.name);
            agents.runConversation(nearestAgent);
          }
        }
      }
    }

    findNearestAgent() {
      let closestDistance = Infinity;
      let closestAgent = null;

      agents.manifest.forEach(agent => {
        if (agent.name !== this.name) {
          let otherAgentPos = agent.getAgentPosition();
          let agentPos = this.getAgentPosition();
          let distance = this.distanceBetweenPoints(agentPos.x, agentPos.y, otherAgentPos.x, otherAgentPos.y);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestAgent = agent;
          }
        }
      })
      return { nearestAgent: closestAgent, closestDistance: closestDistance };
    }

    // Note: later this should be determined by a natural confidence score
    shouldEngageInConversation() {
      const probabilityThreshold = 0.5;
      const randomValue = Math.random();

      return randomValue < probabilityThreshold;
    }

    distanceBetweenPoints(x1, y1, x2, y2) {
      const dx = x1 - x2;
      const dy = y1 - y2;
    
      return Math.sqrt(dx * dx + dy * dy);
    }
    

};


