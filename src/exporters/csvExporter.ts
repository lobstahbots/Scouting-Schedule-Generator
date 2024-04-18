import { ScoutingSchedule, ScoutingMatch, ScoutingTeam } from "../types";

export default function csvExporter(
    schedule: ScoutingSchedule,
    {
        includePerMatch,
        includePerTeam,
        dateLocale
    }: {
        includePerMatch?: (keyof ScoutingMatch)[];
        includePerTeam?: (keyof ScoutingTeam)[];
        dateLocale?: string;
    },
): string {
    const lines: string[] = [];

    if (includePerMatch === undefined) {
        includePerMatch = ["description", "startTime"];
    }

    if (includePerTeam === undefined) {
        includePerTeam = ["teamNumber", "scouter"];
    }

    lines.push(
        [
            ...includePerMatch,
            ...includePerTeam.flatMap(field => [
                "Red 1 " + field,
                "Red 2 " + field,
                "Red 3 " + field,
                "Blue 1 " + field,
                "Blue 2 " + field,
                "Blue 3 " + field,
            ]),
        ].join(","),
    );

    for (const match of schedule) {
        const currentLine: string[] = [];
        for (const field of includePerMatch) {
            const val = match[field];
            if (val instanceof Date) {
                currentLine.push(val.toLocaleString(dateLocale ?? "en-US"));
                continue;
            }
            currentLine.push(match[field].toString());
        }
        const teams = match.teams.sort((a, b) => {
            if (a.station.startsWith("Red") && b.station.startsWith("Blue")) return -1;
            if (a.station.startsWith("Blue") && b.station.startsWith("Red")) return 1;
            return parseInt(a.station[-1]) - parseInt(b.station[-1]);
        });
        for (const field of includePerTeam) {
            for (const team of teams) {
                currentLine.push(team[field]?.toString() ?? "");
            }
        }
        lines.push(currentLine.join(","));
    }
    return lines.join("\n");
}
