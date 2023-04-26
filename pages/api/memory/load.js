import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
    const { filename } = req.query;

    try {
        // TODO: check if file exists
        const fileContent = await readFile('agents/' + filename, 'utf8');
        res.status(200).json(fileContent);
    } catch (error) {
        console.error(`Error loading file ${filename}:`, error);
        res.status(500).json({ error: `Error loading file ${filename}` });
    }
}
