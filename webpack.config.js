import exp from "constants";
import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

export default [
    {
        devtool: "inline-source-map",
        mode: "production",
        entry: {
            index: "./src/index.ts",
            cli: "./src/cli.ts",
        },
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
        plugins: [
            new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        ]
    },
    {
        entry: "./src/index.ts",
        experiments: {
            outputModule: true,
        },
        devtool: "inline-source-map",
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
        entry: "./src/index.ts",
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
