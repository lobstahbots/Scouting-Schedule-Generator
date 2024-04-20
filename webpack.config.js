import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const common = {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devtool: false,
}

export default [
    {
        ...common,
        entry: {
            index: "./src/index.ts",
            cli: "./src/cli.ts",
        },
        output: {
            filename: "[name].cjs",
            path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
            library: {
                type: "umd",
                name: "ScoutingScheduleGenerator",
            },
            globalObject: "this",
            chunkFormat: "commonjs",
        },
        target: "node",
        externals: {
            "commander": "commander",
            "axios": "axios",
        },
        plugins: [
            new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        ]
    },
    {
        ...common,
        entry: "./src/index.ts",
        experiments: {
            outputModule: true,
        },
        externals: {
            "axios": "axios",
        },
        output: {
            filename: "index.js",
            path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
            library: {
                type: "module",
            },
            globalObject: "this",
            chunkFormat: "module",
        },
        target: "node",
    },
    {
        ...common,
        entry: "./src/index.ts",
        output: {
            filename: "index.web.js",
            path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
            library: { name: "ScoutingScheduleGenerator", type: "umd" },
            globalObject: "this",
            chunkFormat: "array-push",
        },
        target: "web",
    },
];
