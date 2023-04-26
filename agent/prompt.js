import { Configuration, OpenAIApi } from "openai";
import env from "../env.json" assert { type: "json" };

const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Models:
// text-davinci-003

export async function promptChat(prompt) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{"role":"system", "content":prompt}],
          })

        return response;

    } catch (error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
            // res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            // res.status(500).json({
            //     error: {
            //     message: 'An error occurred during your request.',
            //     }
            // });
        }
    }
}

export async function promptCompletion(prompt) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 3,
            n: 1,
            stop: null,
            temperature: 0,
        });

        return response;

    } catch (error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
            // res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            // res.status(500).json({
            //     error: {
            //     message: 'An error occurred during your request.',
            //     }
            // });
        }
    }
}

export async function promptEmbedding(prompt) {
    const response = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: prompt,
    });

    return response;
}