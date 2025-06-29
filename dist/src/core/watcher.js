"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SmartWatcher", {
    enumerable: true,
    get: function() {
        return SmartWatcher;
    }
});
const _chokidar = /*#__PURE__*/ _interop_require_default(require("chokidar"));
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class SmartWatcher {
    updateFiles(files) {
        const added = [
            ...files
        ].filter((f)=>!this.trackedFiles.has(f));
        const removed = [
            ...this.trackedFiles
        ].filter((f)=>!files.has(f));
        if (added.length) this.watcher.add(added);
        if (removed.length) this.watcher.unwatch(removed);
        this.trackedFiles = new Set(files);
        _logger.logger.success(`Watching ${files.size} files`);
    }
    constructor(onChange){
        _define_property(this, "onChange", void 0);
        _define_property(this, "watcher", void 0);
        _define_property(this, "trackedFiles", void 0);
        this.onChange = onChange;
        this.trackedFiles = new Set();
        this.watcher = _chokidar.default.watch([], {
            ignored: /node_modules/,
            ignoreInitial: true,
            atomic: 300,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 50
            }
        }).on("change", (file)=>{
            _logger.logger.info(`File changed: ${file}`);
            this.onChange(file);
        });
    }
}
