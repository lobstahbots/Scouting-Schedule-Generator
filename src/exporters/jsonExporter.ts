import { ScoutingSchedule } from "../types";

export default function jsonExporter(
    schedule: ScoutingSchedule,
    { dateLocale }: { dateLocale?: string },
): string {
    return JSON.stringify(
        schedule,
        function (key, val) {
            const trueVal = this[key];
            if (trueVal instanceof Date) {
                return trueVal.toLocaleString(dateLocale ?? "en-US");
            }
            return val;
        },
        4,
    );
}
