import agent from './agent';
import agents from './agents';
import memoryStream from './memoryStream';

export default async function run() {

    // Let's keep track of all new agent's we create
    const agentList = new agents();

    // Create agent's and add them to the list
    const graham = new agent("Graham", new memoryStream("Graham"));
    await graham.memoryStream.loadLocalMemory("Graham");
    graham.memoryStream.addMemory("Graham is a Software Engineer at the Magic Corp.");
    graham.memoryStream.addMemory("Graham lives in Pennsylvania");
    graham.memoryStream.addMemory("Graham just saw a beautiful sunset on the beach");
    graham.memoryStream.addMemory("Graham smelled a pretty flower and smiled");
    graham.memoryStream.addMemory("Graham wants to adopt a dog");
    graham.memoryStream.addMemory("Graham likes to research AI");
    graham.memoryStream.addMemory("Graham works on optimizing the Magic at Magic Corp.");
    agentList.addAgent(graham);

    // graham.interview("Where do you work?");

    // Generate reflections when the sum of importance scores exceeds a threshold
    const importanceSum = graham.memoryStream.memoryObjects.reduce((sum, memory) => sum + memory.importanceScore, 0);
    const importanceThreshold = 15;
    if (importanceSum >= importanceThreshold) {
        // await graham.memoryStream.generateReflections();
    }
}
