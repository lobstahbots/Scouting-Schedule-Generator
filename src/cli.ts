import { Command, Option } from "@commander-js/extra-typings";
import { Schedule } from "./types";
import jsonExporter from "./exporters/jsonExporter";
import csvExporter from "./exporters/csvExporter";
import * as fs from "fs";
import apiImporter from "./importers/apiImporter";
import simple from "./schedulers/simple";
import complex from "./schedulers/complex";

const program = new Command()
    .name("scouting-schedule-generator")
    .usage("[global options] <command> [command options]")
    .addOption(new Option("-o, --output <filename>", "Output to a file"))
    .addOption(
        new Option("-f, --format <format>", "Output format")
            .choices(["json", "csv"])
            .default("json")
            .makeOptionMandatory(),
    )
    .addOption(new Option("-l, --locale <locale>", "Date locale").default("en-US"))
    .addOption(new Option("-t, --timezone <timezone>", "Timezone").default("EST"))
    .addOption(
        new Option(
            "-e, --event-code <event>",
            "Use FIRST API with this event code",
        ).makeOptionMandatory(),
    )
    .addOption(
        new Option("-y, --year <year>", "Use FIRST API with this year")
            .default(new Date().getFullYear())
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-L, --match-level <matchLevel>",
            "Match level to import from FIRST API",
        )
            .choices(["Qualification", "Playoff", "Practice"])
            .default("Qualification")
            .makeOptionMandatory(),
    )
    .addOption(
        new Option("-s, --scouter <scouter...>", "Scouter name").makeOptionMandatory(),
    );

const getSchedule = async () => {
    const options = program.opts();
    if (options.eventCode !== undefined) {
        return await apiImporter(options);
    }
    throw new Error("No input method specified");
};

const output = (schedule: Schedule) => {
    const options = program.opts();
    let result: string = "";
    switch (options.format) {
        case "json":
            result = jsonExporter(schedule, {
                dateLocale: options.locale,
                timeZone: options.timezone,
            });
            break;
        case "csv":
            result = csvExporter(schedule, {
                dateLocale: options.locale,
                timeZone: options.timezone,
            });
            break;
    }
    if (options.output !== undefined) {
        fs.writeFileSync(options.output, result);
    } else console.log(result);
};

program
    .command("simple")
    .description("Simple scheduler")
    .addOption(
        new Option("-r, --rotate-after <number>", "Rotate after this many matches")
            .default(4)
            .argParser(value => parseInt(value, 10)),
    )
    .action((options, command): void => {
        getSchedule().then(schedule => {
            output(simple(schedule, program.opts().scouter, options));
        });
    });

program
    .command("complex")
    .description("Complex scheduler")
    .addOption(
        new Option(
            "-u, --us-teams <team...>",
            "Teams we're scouting for",
        ).makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-b, --scout-before-play <matches>",
            "The number of matches to scout before a team plays with or against a team in usTeams.",
        )
            .default(2)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-S, --soft-limit <limit>",
            "After the soft limit is reached, scouters will be rotated out of scouting if possible. However, if more scouters are needed than have not reached the soft limit, these scouters can still be used.",
        )
            .default(4)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-h, --hard-limit <limit>",
            "After the hard limit is reached, scouters will be rotated out of scouting if possible. Even if more scouters are needed than have not reached the hard limit, the scouters that have reached the hard limit will not be used. This can result in teams which should be scouted in a match not being scouted.",
        )
            .default(8)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-E, --end-scout <matches>",
            "The last end-scout matches for each team will be scouted.",
        )
            .default(3)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-k, --skip-start-scout <matches>",
            "The number of matches to skip before starting to scout start-scout matches.",
        )
            .default(3)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-a, --start-scout <matches>",
            "The number of matches to scout after skipping skip-start-scout matches.",
        )
            .default(3)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-m, --min-scout <times>",
            "The minimum number of times a team should be scouted.",
        )
            .default(6)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .addOption(
        new Option(
            "-M, --min-scouter-at-match <number>",
            "The minimum number of scouters that should be at each match. This is useful if you want somebody to be watching each match, even if the other parameters don't cause any of the teams in it to be scouted.",
        )
            .default(1)
            .argParser(value => parseInt(value, 10))
            .makeOptionMandatory(),
    )
    .action((options, command): void => {
        const usTeams = options.usTeams.map(team => parseInt(team, 10));
        getSchedule().then(schedule => {
            output(
                complex(schedule, program.opts().scouter, {
                    ...options,
                    usTeams,
                    softLimitMatchesInARow: options.softLimit,
                    hardLimitMatchesInARow: options.hardLimit,
                }),
            );
        });
    });

program.parse();
