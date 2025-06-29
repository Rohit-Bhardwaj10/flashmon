//effficiently caching the parsed ast for each file , re--apesing only if the file changed
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getCachedAst", {
    enumerable: true,
    get: function() {
        return getCachedAst;
    }
});
const _core = require("@swc/core");
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const astcache = new Map();
async function getCachedAst(file) {
    const stats = _fs.default.statSync(file);
    const mTime = stats.mtimeMs;
    const cached = astcache.get(file);
    //return cached ast if file hasn't changed
    if (cached && cached.mTime === mTime) {
        return cached.ast;
    }
    const code = _fs.default.readFileSync(file, "utf-8");
    const ast = await (0, _core.parse)(code, {
        syntax: "typescript"
    });
    astcache.set(file, {
        mTime,
        ast
    });
    return ast;
}
