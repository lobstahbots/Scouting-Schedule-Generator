import exceljs, { Worksheet } from "exceljs";
import { ScoutingMatch, ScoutingSchedule, ScoutingTeam } from "../types";

const stationToCol: { [key: string]: string | undefined } = {
    Red1: "B",
    Red2: "C",
    Red3: "D",
    Blue1: "E",
    Blue2: "F",
    Blue3: "G",
};

const lightRed = { argb: "F4CCCC" };
const lightBlue = { argb: "FFC9DAF8" };
const red = { argb: "FFFF0000" };
const blue = { argb: "FF0000FF" };

const doOverCells = (worksheet: Worksheet, startColumn: number, endColumn: number, startRow: number, endRow: number, callback: (cell: exceljs.Cell) => void) => {
    for (let col = startColumn; col <= endColumn; col++) {
        for (let row = startRow; row <= endRow; row++) {
            callback(worksheet.getCell(row, col));
        }
    }
};

const convertTZ = (date: Date, timeZone: string): Date => {
    const dateInTZ = new Date(date.toLocaleString("en-US", { timeZone: timeZone }));
    const dateInUTC = Date.UTC(dateInTZ.getFullYear(), dateInTZ.getMonth(), dateInTZ.getDate(), dateInTZ.getHours(), dateInTZ.getMinutes(), dateInTZ.getSeconds(), dateInTZ.getMilliseconds());
    return new Date(dateInUTC);
};

const getSolidFill = (color: Partial<exceljs.Color>): exceljs.Fill => ({
    type: "pattern",
    pattern: "solid",
    fgColor: color,
});

export default async (
    schedule: ScoutingSchedule,
    {
        urlTemplate,
        highlightTeams,
        timeZone,
    }: {
        urlTemplate?: string;
        highlightTeams?: number[];
        timeZone?: string;
    },
): Promise<Buffer> => {
    if (highlightTeams === undefined) {
        highlightTeams = [];
    }

    const workbook = new exceljs.Workbook();

    const sheet = workbook.addWorksheet("Schedule");

    const getScouterVal = (
        team: ScoutingTeam,
        match: ScoutingMatch,
    ): exceljs.CellValue => {
        if (team.scouter === undefined) {
            return "";
        }
        if (urlTemplate === undefined) {
            return team.scouter;
        }
        let url = urlTemplate;
        for (const key in team) {
            url = url.replaceAll(
                `{${key}}`,
                team[key as keyof ScoutingTeam]?.toString() ?? "",
            );
        }
        for (const key in match) {
            url = url.replaceAll(
                `{${key}}`,
                match[key as keyof ScoutingMatch]?.toString() ?? "",
            );
        }
        return {
            text: team.scouter,
            hyperlink: url,
        };
    };

    const doBorders = (
        startColumn: number,
        endColumn: number,
        startRow: number,
        endRow: number,
    ) => {
        for (let col = startColumn; col <= endColumn; col++) {
            const startCell = sheet.getCell(startRow, col);
            startCell.border = {
                ...startCell.border,
                top: { style: "medium" },
            };
            const endCell = sheet.getCell(endRow, col);
            endCell.border = {
                ...endCell.border,
                bottom: { style: "medium" },
            };
        }
        for (let row = startRow; row <= endRow; row++) {
            const startCell = sheet.getCell(row, startColumn);
            startCell.border = {
                ...startCell.border,
                left: { style: "medium" },
            };
            const endCell = sheet.getCell(row, endColumn);
            endCell.border = {
                ...endCell.border,
                right: { style: "medium" },
            }; 
        }
        doOverCells(sheet, startColumn, endColumn, startRow, endRow, cell => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
                ...cell.border,
            };
        });
    };

    sheet.mergeCells("A1:A2");
    sheet.getCell("A1").value = "Match";
    sheet.mergeCells("B1:D1");
    sheet.getCell("B1").value = "Red Alliance";
    sheet.getCell("B2").value = "Red 1";
    sheet.getCell("C2").value = "Red 2";
    sheet.getCell("D2").value = "Red 3";
    sheet.mergeCells("E1:G1");
    sheet.getCell("E1").value = "Blue Alliance";
    sheet.getCell("E2").value = "Blue 1";
    sheet.getCell("F2").value = "Blue 2";
    sheet.getCell("G2").value = "Blue 3";
    sheet.mergeCells("H1:H2");
    sheet.getCell("H1").value = "Approx Time";

    sheet.getColumn("B").fill = getSolidFill(lightRed);
    sheet.getColumn("C").fill = getSolidFill(lightRed);
    sheet.getColumn("D").fill = getSolidFill(lightRed);
    sheet.getColumn("E").fill = getSolidFill(lightBlue);
    sheet.getColumn("F").fill = getSolidFill(lightBlue);
    sheet.getColumn("G").fill = getSolidFill(lightBlue);

    sheet.getColumn("H").numFmt = "ddd hh:mm AM/PM";
    sheet.getColumn("A").width = 15;
    sheet.getColumn("H").width = 15;

    doBorders(2, 4, 1, 2);
    doBorders(5, 7, 1, 2);

    let curRow = 3;

    for (const match of schedule) {
        sheet.mergeCells(`A${curRow}:A${curRow + 1}`);
        sheet.getCell(`A${curRow}`).value = match.description;
        sheet.mergeCells(`H${curRow}:H${curRow + 1}`);
        sheet.getCell(`H${curRow}`).value = convertTZ(match.startTime, timeZone ?? "America/New_York");
        doBorders(2, 4, curRow, curRow + 1);
        doBorders(5, 7, curRow, curRow + 1);
        for (const team of match.teams) {
            const col = stationToCol[team.station];
            if (col !== undefined) {
                sheet.getCell(`${col}${curRow}`).value = getScouterVal(team, match);
                sheet.getCell(`${col}${curRow + 1}`).value = team.teamNumber;
            }
            if (highlightTeams.includes(team.teamNumber)) {
                const col = stationToCol[team.station];
                if (col !== undefined) {
                    sheet.getCell(`${col}${curRow}`).fill = team.station.startsWith("Red")
                        ? getSolidFill(red)
                        : getSolidFill(blue);
                    sheet.getCell(`${col}${curRow + 1}`).fill = team.station.startsWith("Red")
                        ? getSolidFill(red)
                        : getSolidFill(blue);
                }
            }
        }
        curRow += 2;
    }

    sheet.getRows(1, curRow)?.forEach(row => {
        row.alignment = {
            horizontal: "center",
            vertical: "middle",
        };
    });

    doBorders(1, 1, 1, curRow);
    doBorders(8, 8, 1, curRow);

    return (await workbook.xlsx.writeBuffer()) as Buffer;
};
