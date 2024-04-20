import config from './webpack.config.js';

export default config.map(individualConfig => {
    return {
        ...individualConfig,
        mode: "development",
        devtool: "inline-source-map",
    }
});