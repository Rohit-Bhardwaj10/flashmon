"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "logger", {
    enumerable: true,
    get: function() {
        return logger;
    }
});
const _chalk = /*#__PURE__*/ _interop_require_default(require("chalk"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const logger = {
    info: (...args)=>console.log(_chalk.default.blue("[ℹ]"), ...args),
    success: (...args)=>console.log(_chalk.default.green("[✓]"), ...args),
    warn: (...args)=>console.warn(_chalk.default.yellow("[⚠]"), ...args),
    error: (...args)=>console.error(_chalk.default.red("[✗]"), ...args),
    debug: (...args)=>{
        if (process.env.DEBUG) {
            console.log(_chalk.default.gray("[DEBUG]"), ...args);
        }
    }
};
