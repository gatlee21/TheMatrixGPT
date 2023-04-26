import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { filename, memoryObjects } = req.body;

    try {
        const jsonString = JSON.stringify(memoryObjects);
        await writeFile('agents/' + filename + '.json', jsonString, 'utf8');
        res.status(200).json({ message: 'File saved successfully' });
    } catch (error) {
        res.status(500).json({ error: `Error writing file ${filename}` });
    }
}
