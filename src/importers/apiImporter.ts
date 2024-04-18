import { Match, Schedule } from "../types";
import axios from "axios";

export default async function apiImporter( {year, eventCode, matchLevel}: {year: number, eventCode: string, matchLevel?: string}): Promise<Schedule> {
    const url = `https://frc-api.firstinspires.org/v3.0/${year}/schedule/${eventCode}` + (matchLevel !== undefined ? "?tournamentLevel=" + matchLevel : "");
    const API_KEY = process.env.FIRST_API_KEY;
    const USERNAME = process.env.FIRST_USERNAME;
    if (API_KEY === undefined || USERNAME === undefined) {
        throw new Error("API key or username not found in environment variables. Make sure to set FIRST_API_KEY and FIRST_USERNAME.");
    }
    const response = await axios.get(url, {
        auth: {
            username: USERNAME,
            password: API_KEY,
        }
    });
    if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status} ${response.statusText}`);
    }
    return response.data.Schedule.map((match: Match) => ({...match, startTime: new Date(match.startTime)}));
}