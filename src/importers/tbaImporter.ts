import { Match, Schedule } from "../types";
import axios from "axios";

const compLevelMap = {
    qm: "Qualification",
    ef: "EighthFinal",
    qf: "QuarterFinal",
    sf: "SemiFinal",
    f: "Final",
};

export default async function tbaImporter({
    eventKey,
    quals,
}: {
    eventKey: string;
    quals?: boolean;
}): Promise<Schedule> {
    const url = `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches/simple`;
    const API_KEY = process.env.TBA_API_KEY;
    if (API_KEY === undefined) {
        throw new Error(
            "API key not found in environment variables. Make sure to set TBA_API_KEY.",
        );
    }
    const response = await axios.get(url, {
        headers: {
            "X-TBA-Auth-Key": API_KEY,
        },
    });
    if (response.status !== 200) {
        throw new Error(
            `API request failed with status ${response.status} ${response.statusText}`,
        );
    }
    if (quals === undefined) quals = true;
    const result: Schedule = [];
    for (const match of quals
        ? response.data.filter((m: any) => m.comp_level === "qm")
        : response.data.filter((m: any) => m.comp_level !== "qm")) {
        const tournamentLevel =
            compLevelMap[match.comp_level as keyof typeof compLevelMap];
        const matchResult: Match = {
            field: "Primary",
            startTime: new Date(match.time * 1000),
            matchNumber: match.match_number,
            teams: [],
            tournamentLevel: tournamentLevel,
            description: `${tournamentLevel} ${match.set_number}-${match.match_number}`,
        };
        let red_counter = 0;
        for (const team of match.alliances.red.team_keys) {
            matchResult.teams.push({
                teamNumber: parseInt(team.substring(3)),
                station: "Red" + ++red_counter,
                surrogate: false,
            });
        }
        for (const team of match.alliances.red.surrogate_team_keys) {
            matchResult.teams.push({
                teamNumber: parseInt(team.substring(3)),
                station: "Red" + ++red_counter,
                surrogate: true,
            });
        }
        let blue_counter = 0;
        for (const team of match.alliances.blue.team_keys) {
            matchResult.teams.push({
                teamNumber: parseInt(team.substring(3)),
                station: "Blue" + ++blue_counter,
                surrogate: false,
            });
        }
        for (const team of match.alliances.blue.surrogate_team_keys) {
            matchResult.teams.push({
                teamNumber: parseInt(team.substring(3)),
                station: "Blue" + ++blue_counter,
                surrogate: true,
            });
        }
        result.push(matchResult);
    }
    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}
