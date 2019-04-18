const prefix = '[NetworkListener]';

export default {
    prefix,

    Errors: {
        get falseHandler() {
            return `${prefix} False in handler`;
        },
        get fatalError() {
            return `${prefix} Fatal error`;
        },
    },
};
