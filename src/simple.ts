export default function simple(
  schedule: Schedule,
  scouters: string[],
  rotate_after: number
): ScoutingSchedule {
  const res: ScoutingSchedule = [];
  for (const match of schedule) {
    res.push({
      ...match,
      teams: match.teams.map((team, i) => ({ ...team, scouter: scouters[i] })),
    });
    if (!(match.matchNumber % rotate_after)) {
      for (let i = 0; i < 6; i++)
        scouters.push(scouters.shift() ?? scouters[0]);
    }
  }
  return res;
}
