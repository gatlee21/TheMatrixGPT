import { last } from 'rxjs/operators';


const agents = {
    manifest: [],

    agentChatRoom: [],

    runConversation: async function(otherAgentToTalkTo, initialQuestion="Hello?") {
        // Wait for other agent to respond
        this.agentChatRoom.push(otherAgentToTalkTo);
        console.log("waitingRoom: ", this.agentChatRoom);

        let turns = 0;

        if (this.agentChatRoom.length > 1) {
            // Let one of the agents initate the conversation
            let response = await this.agentChatRoom[0].interview(initialQuestion);
            console.log(this.agentChatRoom[0].name + " initialResponse: ", response);
            while (turns < 3) {
                console.log("turn: ", turns);
                response = await this.agentChatRoom[1].interview(response);
                console.log(this.agentChatRoom[1].name + ": " + response);
                response = await this.agentChatRoom[0].interview(response);
                console.log(this.agentChatRoom[0].name + ": " + response);
                turns++;
            }

            // Move the agents away from each other
            await this.moveAgentsAway(this.agentChatRoom[0], this.agentChatRoom[1], 17);
            
            console.log("resume random movement...");
            this.agentChatRoom[0].gridEngine.moveRandomly(this.agentChatRoom[0].agentID);
            this.agentChatRoom[1].gridEngine.moveRandomly(this.agentChatRoom[1].agentID);

            // Return agents state and eject them from the waiting room
            this.agentChatRoom.forEach(agent => {
                agent.state = "";
            })
            this.agentChatRoom = [];
        }
    },

    moveAgentsAway: async function (agent1, agent2, distance) {
        const agent1Pos = agent1.getAgentPosition();
        const agent2Pos = agent2.getAgentPosition();

        // Calculate the angle between the two agents manually
        const dx = agent2Pos.x - agent1Pos.x;
        const dy = agent2Pos.y - agent1Pos.y;
        const angle = Math.atan2(dy, dx);
        console.log("angle: ", angle);
      
        // Calculate new positions for both agents at the specified distance
        const newX1 = agent1Pos.x + Math.cos(angle) * distance;
        const newY1 = agent1Pos.y + Math.sin(angle) * distance;
        const newX2 = agent2Pos.x - Math.cos(angle) * distance;
        const newY2 = agent2Pos.y - Math.sin(angle) * distance;
      
        await this.moveToAsync(agent1, { x: Math.round(newX1), y: Math.round(newY1) });
        await this.moveToAsync(agent2, { x: Math.round(newX2), y: Math.round(newY2) });

    },

    moveToAsync: async function (agent, position) {
        const result = await agent.gridEngine.moveTo(agent.agentID, position).pipe(last()).toPromise();
        return result;
    },

    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

};

export default agents;