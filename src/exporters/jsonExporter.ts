import { ScoutingSchedule } from "../types";

export default function jsonExporter(
    schedule: ScoutingSchedule,
    { dateLocale, timeZone }: { dateLocale?: string, timeZone?: string},
): string {
    return JSON.stringify(
        schedule,
        function (key, val) {
            const trueVal = this[key];
            if (trueVal instanceof Date) {
                return trueVal.toLocaleString(dateLocale ?? "en-US", { timeZone: timeZone ?? "EST" });
            }
            return val;
        },
        4,
    );
}
