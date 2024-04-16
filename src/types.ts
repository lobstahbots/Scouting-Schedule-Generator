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