import { ScoutingSchedule } from "../types";

export default function jsonExporter(schedule: ScoutingSchedule, options: {}): string {
    return JSON.stringify(schedule, null, 4);
}