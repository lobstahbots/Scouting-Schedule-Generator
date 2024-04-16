interface TeamInMatch {
    teamNumber: number;
    station: string;
    surrogate: boolean;
}

interface Match {
    field: string;
    tournamentLevel: string;
    description: string;
    startTime: Date;
    matchNumber: number;
    teams: TeamInMatch[];
}

interface ScoutingTeam extends TeamInMatch {
    scouter?: string;
}

interface ScoutingMatch extends Match {
    teams: ScoutingTeam[];
}

type Schedule = Match[];

type ScoutingSchedule = ScoutingMatch[];

type Options = { [key: string]: string | number | string[] | number[] };

type Importer = (eventName: string, options: Options) => Promise<Schedule>;

type Scheduler = (
    schedule: Schedule,
    scouters: string[],
    options: Options,
) => ScoutingSchedule;

type Exporter = (schedule: ScoutingSchedule, options: Options) => string;
