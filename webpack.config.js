const path = require("path");

module.exports = {
    entry: "src/index.ts",
    devtool: "inline-source-map",
    mode: "production",
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
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "scouting-schedule-generator",
        globalObject: "this",
    },
};
