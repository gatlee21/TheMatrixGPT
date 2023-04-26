# The MatrixGPT
<img src="doc/imgs/agents-conversing.png">

Welcome to MatrixGPT, a project striving to implement the innovative concepts presented in the <a href="https://arxiv.org/pdf/2304.03442.pdf">research paper</a> by Stanford University and Google Research.

This repo only contains a portion of those concepts:
* A minimalist grass park environment for AI agents to navigate with ease
* A pair of OpenAI-integrated agents equipped with memory and conversational capabilities
* Although the agents possess the functionality to generate reflections, this feature is currently disabled in this specific instance.

👁 View the <a href="https://gatlee21.github.io/thematrixgpt-guide/">project proposal</a> 👁

## Setup

The MatrixGPT runs locally on your machine. To run:

1. Update the `env.json` file with your OpenAI API key
2. In the root of the project's directory run `npm install` to install all dependencies
3. Then run `npm run dev` in the root directory. This will spawn the front-end and create 2 agents named Edward and Rosalie. Open your browser to `http://localhost:3000`
4. To view the agent's conversation open your browsers debug console

## Help Wanted 🙏
Implementing all aspects of the research paper is an overwhelming task for a single developer. If you find this project promising, I encourage you to contribute by selecting one of the following items to work on:

* The ability for agents to generate and react to plans
* Agents should be able to move on their own according to their plans or based on "free will"
* Agents need to know how to save memories based on conversations they've had
* An architecture that handles more 2+ agents conversing at a time
* Add places to the map such as housing, shops, and restaurants.
* UI enhancements so that we can interact with the agents
* Personality traits that can evolve over time
* Emotions that affect the tone of an agent's voice
* Need a timing system (day/night cycles)
* Implement agent actions (e.g dig a hole)
