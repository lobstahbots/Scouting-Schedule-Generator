import fs from 'fs/promises';
import { Schedule } from '../types';

export default async function fileImporter({
    path,
    encoding
}: {
    path: string;
    encoding?: BufferEncoding;
}): Promise<Schedule> {
    const result = await fs.readFile(path, encoding ?? 'utf-8');
    return JSON.parse(result);
}