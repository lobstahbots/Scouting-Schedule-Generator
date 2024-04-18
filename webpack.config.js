const path = require("path");

module.exports = {
    entry: "./src/index.ts",
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
                use: require.resolve("ts-loader"),
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "scouting-schedule-generator",
        globalObject: "this",
    },
    target: "node",
};
