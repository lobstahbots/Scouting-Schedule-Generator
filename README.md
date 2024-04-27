# `scouting-schedule-generator`

A scouting schedule generator for [*FIRST*® Robotics Competition](https://www.firstinspires.org/robotics/frc).

Currently, it comes with two options for importing the match schedule: [The Blue Alliance](thebluealliance.com) API and the [FRC API](https://frc-events.firstinspires.org/services/api). Then, a scheduling algorithm will assign scouters to matches. There are two scheduling algorithms: the simple algorithm and the complex algorithm. The simple algorithm simply goes around and always picks the scouter for a team in a match of the list of scouters, rotating them out after some number of matches. The complex algorithm has more options, which you can read about below. Finally, an exporter layer exports the match schedule with scouters assigned, either to JSON, CSV, or an Excel workbook.

## CLI Usage
### General Options
```
Usage: scouting-schedule-generator [options] [command]

Options:
  -o, --output <filename>         Output to a file. If not specified, output to stdout.
  -f, --format <format>           Output format. (choices: "json", "csv", "xlsx", default: "json")
  -l, --locale <locale>           Date locale (e.g. en-US). (default: "en-US")
  -t, --timezone <timezone>       Timezone, an IATA timezone identifier. (default: "America/New_York")
  -e, --event-code <eventCode>    Use FIRST API with this event code. Make sure to set FIRST_API_KEY and FIRST_USERNAME in your environment variables.
  -T, --tba-api <eventKey>        Use The Blue Alliance API. Make sure to set TBA_API_KEY in your environment varaibles.
  -y, --year <year>               Use FIRST API with this year. Make sure to set FIRST_API_KEY and FIRST_USERNAME in your environment variables. (default: 2024)
  -L, --match-level <matchLevel>  Match level to import from FIRST API. Make sure to set FIRST_API_KEY and FIRST_USERNAME in your environment variables. (choices: "Qualification", "Playoff", "Practice", default: "Qualification")
  -s, --scouter <scouter...>      Scouter name
  -h, --help                      display help for command

Commands:
  simple [options]                Simple scheduler
  complex [options]               Complex scheduler
  help [command]                  display help for command
```
### Simple Scheduler
```
Usage: scouting-schedule-generator simple [options]

Simple scheduler

Options:
  -r, --rotate-after <number>  Rotate after this many matches (default: 4)
  -h, --help                   display help for command
```
### Complex Scheduler
```
Usage: scouting-schedule-generator complex [options]

Complex scheduler

Options:
  -u, --us-teams <team...>             Teams we're scouting for
  -b, --scout-before-play <matches>    The number of matches to scout before a team plays with or against a team in usTeams. (default: 2)
  -S, --soft-limit <limit>             After the soft limit is reached, scouters will be rotated out of scouting if possible. However, if more scouters are needed than have not reached the soft limit, these scouters can still be used. (default: 4)
  -h, --hard-limit <limit>             After the hard limit is reached, scouters will be rotated out of scouting if possible. Even if more scouters are needed than have not reached the hard limit, the scouters that have reached the hard limit will not be used. This can result in teams which should be scouted in a match not being scouted. (default: 8)
  -E, --end-scout <matches>            The last end-scout matches for each team will be scouted. (default: 3)
  -k, --skip-start-scout <matches>     The number of matches to skip before starting to scout start-scout matches. (default: 3)
  -a, --start-scout <matches>          The number of matches to scout after skipping skip-start-scout matches. (default: 3)
  -m, --min-scout <times>              The minimum number of times a team should be scouted. (default: 6)
  -M, --min-scouter-at-match <number>  The minimum number of scouters that should be at each match. This is useful if you want somebody to be watching each match, even if the other parameters don't cause any of the teams in it to be scouted. (default: 1)
  -U, --url-template <urlTemplate>     URL template for scouter links. Only works with xlsx format. Default is no link. See README for more information.
  --help                               display help for command
```

## Web Usage

To include the latest version of the library on the web, insert
```html
<script src="https://cdn.jsdelivr.net/npm/scouting-schedule-generator/dist/index.web.js" />
```
It's recommended that you pin a version, like so:
```html
<script src="https://cdn.jsdelivr.net/npm/scouting-schedule-generator@0.3.0/dist/index.web.js" />
```
You can then access the functions `csvExporter`, `jsonExporter`, `apiImporter`, `tbaImporter`, `complexScheduler`, and `simpleScheduler` on the object `ScoutingScheduleGenerator`.

## Node.js Usage

Install the library using
```bash
$ npm install scouting-schedule-generator
```
Then, assuming your `PATH` is set correctly, you should be able to use the CLI as described above. To use the library, you can either (ESM)
```js
import { csvExporter, jsonExporter, apiImporter, tbaImporter, complexScheduler, simpleScheduler } from "scouting-schedule-generator";
```
or (CommonJS)
```js
const { csvExporter, jsonExporter, apiImporter, tbaImporter, complexScheduler, simpleScheduler } = require("scouting-schedule-generator");
```

## Why?

The simple algorithm is one which is used by a lot of scouting systems. However, it is less than ideal when you don't have at least 12 scouters. Thus, I wrote the complex algorithm to scout the matches which will have the most value for planning matches as well as for alliance selection.

## URL Template

If your scouting operation uses forms, and you are generating an Excel schedule, you have the option to make each scouter's name on the sheet link to the form with fields already filled out. Specify `-U` on the command line for this. The template will be a URL with an arbitrary amount of keys, listed as `{key}`. Keys can be any key in the types `ScoutingMatch` or `ScoutingTeam` (see `types.ts`). If you use Google Forms, check out [this link](https://theconfuzedsourcecode.wordpress.com/2019/11/10/lets-auto-fill-google-forms-with-url-parameters/). Note, however, that some things have changed since then and the `<input>` elements *are not next to* their respective form fields, rather they are at the bottom of the HTML. This means you'll have to try editing the value of the `<input>` element in the Inspect panel to find which form field it's associated with.
