"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProcessManager", {
    enumerable: true,
    get: function() {
        return ProcessManager;
    }
});
const _child_process = require("child_process");
const _logger = require("../utils/logger");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class ProcessManager {
    start() {
        this.child = (0, _child_process.spawn)(this.command, {
            shell: true,
            stdio: "inherit"
        });
        this.child.on("error", (err)=>{
            _logger.logger.error(`Process error: ${err.message}`);
        });
        this.child.on("exit", (code)=>{
            if (code !== 0) {
                _logger.logger.warn(`Process exited with code ${code}`);
            }
        });
    }
    restart() {
        this.child?.kill("SIGTERM");
        this.start();
    }
    constructor(command){
        _define_property(this, "child", void 0);
        _define_property(this, "command", void 0);
        this.command = command;
    }
}
