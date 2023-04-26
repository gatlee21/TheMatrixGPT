// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
    // apiKey: "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",
// });

// const openai = new OpenAIApi(configuration);

import { promptChat, promptCompletion, promptEmbedding } from "./prompt";

// The memory stream maintains a comprehensive record of the agent's experience.
// It is a list of memory objects where each object contains a natural lang. description,
// a creation time stamp, and a most recent access timestamp

// The memory stream tracks a large number of observations that are relevant and irrelevant
// to the agent's current situation. 

// Observations are the most basic element of the of the memory stream. These are
// events perceived by the agent

// Define a class to represent a memory object
class memoryObject {
    constructor(description, creationTimestamp) {
        this.description = description;
        this.creationTimestamp = creationTimestamp;
        this.accessTimestamp = Date.now(); // Set the most recent access timestamp to the current time
        this.importanceScore = 0;
    }

    updateAccessTimestamp() {
        this.accessTimestamp = new Date.now();
    }
}
  
// Define a class to represent the memory stream
export default class memoryStream {
    constructor(owner) {
        this.memoryObjects = []; // Start with an empty list of memory objects
        this.owner = owner;
    }

    async dumpLocalMemory(name) {
        try {
            const response = await fetch('/api/memory/dump', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: name,
                    memoryObjects: this.memoryObjects
                })
            });

            if (!response.ok) {
                throw new Error('Error dumping memoryObjects');
            }
        } catch (error) {
            console.error(`Error writing file ${name}:`, error);
        }
    }

    async loadLocalMemory(name) {
        try {
            name = name + '.json'
            const response = await fetch(`/api/memory/load?filename=${name}`);
            const data = await response.json();
            this.memoryObjects = JSON.parse(data);
        } catch (error) {
            console.error(`Error loading file ${name}:`, error);
        }
    }

    // Add a new observation to the memory stream
    // TODO: check importance sum for new reflections
    async addMemory(description) {
        const memoryObj = new memoryObject(description, Date.now());
        // Check if the memoryObj already exists in memoryObjects based on the description
        const memoryExists = this.memoryObjects.some(existingMemoryObj => existingMemoryObj.description === memoryObj.description);

        // If the memory already exists we don't need to rate it again (it costs money)
        if (!memoryExists) {
            // Rate the importance of the memory object be added
            memoryObj.importanceScore = await this.rateImportance(description); 
            this.memoryObjects.push(memoryObj);
            // Since the memory changed dump it to the hard disk
            await this.dumpLocalMemory(this.owner);
        } else {
            console.log("Memory already exists. Skipping");
        }
    }

    getAllMemories() {
        return this.memoryObjects;
    }

    // Get the n most recent memory objects from the memory stream
    getRecentMemories(n) {
        return this.memoryObjects.slice(-n);
    }

    // Retrieval functions

    // Importance discriminates the mundane from the core memories by asking the language model
    // to assign an integer based score to each memory. Higher score = more important
    async rateImportance(memory) {
        const prompt = `On the scale of 1 to 10, where 1 is purely mundane (e.g., brushing teeth, making bed) and 10 is extremely poignant (e.g., a break up, college acceptance), rate the likely poignancy of the following piece of memory. Please respond only with the rating number.
        Memory: ${memory}
        Rating: `;

        const response = await promptCompletion(prompt);

        // console.log('promptCompletion:');
        // console.log(response);

        return parseInt(response.data.choices[0].text.trim());
    
    }

    async getMemoryEmbeddings() {
        const descriptions = this.memoryObjects.map((memory) => memory.description);
        // const response = await openai.createEmbedding({
        //   model: 'text-embedding-ada-002',
        //   input: descriptions,
        // });
        const response = await promptEmbedding(descriptions);
        return response.data.data;
    }

    async generateReflections(numberOfReflections = 2) {
        console.log("generating reflections...");
        const recentMemories = this.getRecentMemories(10);
        const memoryDescriptions = recentMemories.map((memory) => memory.description).join("\n");

        const prompt = `Given only the information below, what are the 3 most salient high-level questions we can answer about the subjects in the statements?
        ${memoryDescriptions}`;
        console.log(prompt);

        const response = await promptChat(prompt);
        console.log("answer to 3 most salient questions");

        const questions = response.data.choices[0].message.content.trim().split("\n");
        console.log(questions);

        for (const question of questions) {
            console.log("question: ", question);
            const retrievedMemories = await this.retrieveMemories(question);
            const evidenceDescriptions = retrievedMemories.map((retrievedMemory) => retrievedMemory).join("\n");

            console.log("evidenceDescriptions:");
            console.log(evidenceDescriptions);

            const insightsPrompt = `Statements about the subject:
            ${evidenceDescriptions}
            What ${numberOfReflections} high-level insights can you infer from the above statements? (example format: insight (because of 1, 5, 3))`;

            console.log("insightsPrompt:");
            console.log(insightsPrompt);

            const insightsResponse = await promptChat(insightsPrompt);
  
            console.log("insightsResponse:");
            console.log(insightsResponse);

            const insights = insightsResponse.data.choices[0].message.content.trim().split("\n");
            for (const insight of insights) {
                console.log("adding insight to memory: ", insight);
                this.addMemory(insight);
            }
        }
    }

    async retrieveMemories(query, alphaRecency = 0.1, alphaImportance = 0.1, alphaRelevance = 2) {

        const currentTime = new Date();
    
        // Recency assigns a higher score to memory objects that were recently accessed 
        // It is calculated by:
        //  1. the difference between the current time and the most recent time the memory was accessed
        //  2. Then raise it to the power of the decay factor
        const recencyScores = this.memoryObjects.map((memory) => {
            const timeDifference = (currentTime - memory.accessTimestamp) / 3600000; // Convert to hours
            const decayFactor = 0.99;
            return Math.pow(decayFactor, timeDifference);
        });
        // console.log("recencyScores:");
        // console.log(recencyScores)
    
        const importanceScores = this.memoryObjects.map((memory) => memory.importanceScore);
        // console.log("importanceScores:");
        // console.log(importanceScores);
    
        // const queryEmbeddingResponse = await openai.createEmbedding({
        //   model: 'text-embedding-ada-002',
        //   input: query,
        // });
        const queryEmbeddingResponse = await promptEmbedding(query);
        // console.log("query embedding response:");
        // console.log(queryEmbeddingResponse);

        const queryEmbedding = queryEmbeddingResponse.data.data[0];
        // console.log("queryEmbedding: ", queryEmbedding);
        const memoryEmbeddings = await this.getMemoryEmbeddings();
        // console.log("memoryEmbeddings:");
        // console.log(memoryEmbeddings);

        // Relevance assigns a higher score to memory objects that are related to the current situation.
        // It is calculated by:
        //  1. Cosine similarity between the memory's embedding vector and the query's embedding vector
        const relevanceScores = memoryEmbeddings.map((embedding) => {
          const cosineSimilarity = (a, b) => {
            const dotProduct = a.reduce((sum, a_i, i) => sum + a_i * b[i], 0);
            const magnitudeA = Math.sqrt(a.reduce((sum, a_i) => sum + a_i * a_i, 0));
            const magnitudeB = Math.sqrt(b.reduce((sum, b_i) => sum + b_i * b_i, 0));
            return dotProduct / (magnitudeA * magnitudeB);
          };
          return cosineSimilarity(queryEmbedding.embedding, embedding.embedding);
        });
        // console.log("relevanceScores:");
        // console.log(relevanceScores);
    
        const normalizedRecencyScores = this.normalize(recencyScores);
        const normalizedImportanceScores = this.normalize(importanceScores);
        const normalizedRelevanceScores = this.normalize(relevanceScores);

        // console.log("normalizedRecencyScores: ");
        // console.log(normalizedRecencyScores);
        // console.log("normalizedImportanceScores:");
        // console.log(normalizedImportanceScores);
        // console.log("normalizedRelevanceScores");
        // console.log(normalizedRelevanceScores);
    
        const retrievalScores = this.memoryObjects.map((_, i) => {
          return (
            (alphaRecency * normalizedRecencyScores[i]) +
            (alphaImportance * normalizedImportanceScores[i]) +
            (alphaRelevance * normalizedRelevanceScores[i])
          );
        });
        // console.log("retrievalScores");
        // console.log(retrievalScores)

        const topRankedMemories = this.getTopRankedMemories(retrievalScores, this.memoryObjects, 3);

        return topRankedMemories;
    }

    getTopRankedMemories(retrievalScores, memories, n) {
        const indexedScores = retrievalScores.map((score, index) => ({ index, score }));
        
        const sortedScores = indexedScores.sort((a, b) => b.score - a.score);
        
        const topNScores = sortedScores.slice(0, n);

        // console.log("topNScores: ");
        // console.log(topNScores);
        
        const topMemories = topNScores.map(({ index }) => memories[index].description);
        
        return topMemories;
    }

    normalize(arr) {
        if (arr.length === 1)
            return [1];

        const min = Math.min(...arr);
        const max = Math.max(...arr);

        if (min === max) {
            return arr.map(_ => 0);
        }
      
        return arr.map(value => (value - min) / (max - min));
    }
}
  