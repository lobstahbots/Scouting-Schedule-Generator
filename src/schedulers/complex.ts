import { Match, Schedule, ScoutingSchedule } from '../types';

/**
 * Generate a map for teams to scout for each map.
 * @param {Schedule} schedule The schedule to scout.
 * @param options Options for the teams to scout. See {@link complex} for more information.
 * @returns A map from match number to an array of team numbers to scout for that match.
 */
export function teamsToScout(
    schedule: Schedule,
    options: {
        usTeams: number[];
        scoutBeforePlay: number;
        endScout: number;
        skipStartScout: number;
        startScout: number;
        minScout: number;
        minScouterAtMatch: number;
    },
): Map<number, number[]> {
    const us: number[] = [];
    const matchesInMap: Map<number, number[]> = new Map();
    const result: Map<number, number[]> = new Map();
    const matchMap: Map<number, Match> = new Map();
    const scoutedCounts: Map<number, number> = new Map();
    const teamSet: Set<number> = new Set();
    const addToResult = function (teamNumber: number, matchNumber: number) {
        if (!result.has(matchNumber)) {
            result.set(matchNumber, []);
        }
        if (!result.get(matchNumber)?.includes(teamNumber)) {
            result.get(matchNumber)?.push(teamNumber);
            scoutedCounts.set(teamNumber, (scoutedCounts.get(teamNumber) ?? 0) + 1);
        }
    };
    // Populate data
    for (const match of schedule) {
        matchMap.set(match.matchNumber, match);
        result.set(match.matchNumber, []);
        for (const team of match.teams) {
            teamSet.add(team.teamNumber);
            scoutedCounts.set(team.teamNumber, 0);
            if (options.usTeams.includes(team.teamNumber)) us.push(match.matchNumber);
            if (!matchesInMap.has(team.teamNumber)) matchesInMap.set(team.teamNumber, []);
            matchesInMap.get(team.teamNumber)?.push(match.matchNumber);
        }
    }
    // Scout every team the scoutBeforePlay times before they play a match with anyone in usTeams
    for (const matchNumber of us) {
        const match = matchMap.get(matchNumber);
        for (const team of match?.teams ?? []) {
            if (options.usTeams.includes(team.teamNumber))
                addToResult(team.teamNumber, matchNumber);
            const index = matchesInMap.get(team.teamNumber)?.indexOf(matchNumber) ?? 0;
            for (const matchNumToScout of matchesInMap
                .get(team.teamNumber)
                ?.slice(Math.max(0, index - options.scoutBeforePlay), index) ?? []) {
                addToResult(team.teamNumber, matchNumToScout);
            }
        }
    }
    // Scout every team their last endScout matches
    // also scout startScout matches after skipping skipStartScout matches
    for (const teamNumber of teamSet) {
        for (const matchNumber of matchesInMap
            .get(teamNumber)
            ?.slice(-options.endScout, matchesInMap.get(teamNumber)?.length) ?? []) {
            addToResult(teamNumber, matchNumber);
        }
        for (const matchNumber of matchesInMap
            .get(teamNumber)
            ?.slice(
                options.skipStartScout,
                options.skipStartScout + options.startScout,
            ) ?? []) {
            addToResult(teamNumber, matchNumber);
        }
    }
    // Scout every team at least minScout times
    for (const teamNumber of teamSet) {
        if (scoutedCounts.get(teamNumber) ?? 0 < options.minScout) {
            for (const matchNumber of matchesInMap
                .get(teamNumber)
                ?.sort(
                    (matchA, matchB) =>
                        (result.get(matchA)?.length ?? 0) -
                        (result.get(matchB)?.length ?? 0),
                )
                .slice(0, Math.max(0, options.minScout - (scoutedCounts.get(teamNumber) ?? 0))) ??
                []) {
                addToResult(teamNumber, matchNumber);
            }
        }
    }
    // Have at least minScoutersAtMatch scouters at each match
    for (const [matchNumber, match] of matchMap.entries()) {
        if (result.get(matchNumber)?.length ?? 0 < options.minScouterAtMatch) {
            for (const teamNumber of match.teams
                .map(team => team.teamNumber)
                .sort(
                    (teamA, teamB) =>
                        (scoutedCounts.get(teamA) ?? 0) - (scoutedCounts.get(teamB) ?? 0),
                )
                .slice(
                    0,
                    Math.max(0, options.minScouterAtMatch - (result.get(matchNumber)?.length ?? 0)),
                )) {
                addToResult(teamNumber, matchNumber);
            }
        }
    }
    return result;
}

/**
 * Assign scouters given the teams to scout.
 * @param {Schedule} schedule The {@link Schedule} to scout.
 * @param options Options for the scouters. See {@link complex} for more information.
 * @returns {ScoutingSchedule} The {@link ScoutingSchedule} with scouters assigned.
 */
export function assignScouters(
    schedule: Schedule,
    scouters: string[],
    teamsToScoutMap: Map<number, number[]>,
    {
        softLimitMatchesInARow,
        hardLimitMatchesInARow,
    }: { softLimitMatchesInARow: number; hardLimitMatchesInARow: number },
): ScoutingSchedule {
    const result: ScoutingSchedule = [];
    const scoutedInARow: Map<string, number> = new Map();
    const totalScouted: Map<string, number> = new Map();
    for (const scouter of scouters) {
        scoutedInARow.set(scouter, 0);
        totalScouted.set(scouter, 0);
    }
    for (const match of schedule) {
        let scoutingCounter = 0;
        let availableScouters = scouters.filter(
            scouter => ((scoutedInARow.get(scouter) ?? 0) < softLimitMatchesInARow),
        );
        if (
            availableScouters.length <
            (teamsToScoutMap.get(match.matchNumber)?.length ?? 0)
        ) {
            availableScouters = scouters.filter(
                scouter => scoutedInARow.get(scouter) ?? 0 < hardLimitMatchesInARow,
            );
        }
        availableScouters.sort((scouterA, scouterB) => {
            const scoutedA = scoutedInARow.get(scouterA) ?? 0;
            const scoutedB = scoutedInARow.get(scouterB) ?? 0;
            // Complete shifts once they've been started
            if (scoutedA === 0 && 0 < scoutedB && scoutedB < softLimitMatchesInARow)
                return 1;
            if (scoutedB === 0 && 0 < scoutedA && scoutedA < softLimitMatchesInARow)
                return -1;
            // Otherwise order first by scouted matches in a row and then by total matches scouted
            if (scoutedA === scoutedB)
                return (
                    (totalScouted.get(scouterA) ?? 0) - (totalScouted.get(scouterB) ?? 0)
                );
            return scoutedA - scoutedB;
        });
        const currentScouters: Map<number, string> = new Map();
        for (const teamNumber of teamsToScoutMap.get(match.matchNumber) ?? []) {
            const currentScouter = availableScouters[scoutingCounter];
            scoutedInARow.set(
                currentScouter,
                (scoutedInARow.get(currentScouter) ?? 0) + 1,
            );
            totalScouted.set(currentScouter, (totalScouted.get(currentScouter) ?? 0) + 1);
            currentScouters.set(teamNumber, currentScouter);
            scoutingCounter++;
            if (scoutingCounter >= availableScouters.length) {
                break;
            }
        }
        result.push({
            ...match,
            teams: match.teams.map(team => ({
                ...team,
                scouter: currentScouters.get(team.teamNumber),
            })),
        });
        const currentScoutersSet = new Set(currentScouters.values());
        scouters
            .filter(scouter => !currentScoutersSet.has(scouter))
            .forEach(scouter => scoutedInARow.set(scouter, 0));
    }
    return result;
}

/**
 *
 * @param schedule The {@link Schedule} to scout.
 * @param scouters A list of scouters to use.
 * @param {Object} options Options for the scheduling & scouting assignment.
 * @param options.usTeams The teams we're scouting for. These teams will have every team in their matches scouted the `scoutBeforePlay`
 * times before the play with or against them.
 * @param options.softLimitMatchesInARow After the soft limit is reached, scouters will be rotated out of scouting if possible. However,
 * if more scouters are needed than have not reached the soft limit, these scouters can still be used.
 * @param options.hardLimitMatchesInARow After the hard limit is reached, scouters will be rotated out of scouting if possible. Even if
 * more scouters are needed than have not reached the hard limit, the scouters that have reached the hard limit will not be used. This
 * can result in teams which should be scouted in a match not being scouted.
 * @param options.scoutBeforePlay The number of matches to scout before a team plays with or against a team in `usTeams`.
 * @param options.endScout The last `endScout` matches for each team will be scouted.
 * @param options.skipStartScout The number of matches to skip before starting to scout `startScout` matches.
 * @param options.startScout The number of matches to scout after skipping `skipStartScout` matches.
 * @param options.minScout The minimum number of times a team should be scouted.
 * @param options.minScouterAtMatch The minimum number of scouters that should be at each match. This is useful if you want somebody to
 * be watching each match, even if the other parameters don't cause any of the teams in it to be scouted.
 * @returns The {@link ScoutingSchedule} with scouters assigned.
 */
export default function complex(
    schedule: Schedule,
    scouters: string[],
    options: {
        usTeams: number[];
        softLimitMatchesInARow: number;
        hardLimitMatchesInARow: number;
        scoutBeforePlay: number;
        endScout: number;
        skipStartScout: number;
        startScout: number;
        minScout: number;
        minScouterAtMatch: number;
    },
): ScoutingSchedule {
    return assignScouters(schedule, scouters, teamsToScout(schedule, options), options);
}
