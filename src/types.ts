export interface TeamInMatch {
    teamNumber: number;
    station: string;
    surrogate: boolean;
}

export interface Match {
    field: string;
    tournamentLevel: string;
    description: string;
    startTime: Date;
    matchNumber: number;
    teams: TeamInMatch[];
}

export interface ScoutingTeam extends TeamInMatch {
    scouter?: string;
}

export interface ScoutingMatch extends Match {
    teams: ScoutingTeam[];
}

export type Schedule = Match[];

export type ScoutingSchedule = ScoutingMatch[];

export type Options = { [key: string]: string | number | string[] | number[] };

export type Importer = (options: Options) => Promise<Schedule>;

export type Scheduler = (
    schedule: Schedule,
    scouters: string[],
    options: Options,
) => ScoutingSchedule;

type ExporterSync = ((schedule: ScoutingSchedule, options: Options) => string | Buffer);

type ExporterAsync = (schedule: ScoutingSchedule, options: Options) => Promise<string | Buffer>;

export type Exporter = ExporterSync | ExporterAsync;
