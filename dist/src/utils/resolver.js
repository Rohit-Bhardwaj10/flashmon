// import path from "path";
// import fs from "fs";
//
// export function resolvePath(importPath: string, parentFile: string): string {
//   console.log("resolvePath:", importPath, parentFile);
//   // Only handle relative or absolute imports
//   if (importPath.startsWith(".") || importPath.startsWith("/")) {
//     // This is the correct parent directory!
//     const parentDir = path.dirname(parentFile);
//     let resolved = path.resolve(parentDir, importPath);
//
//     // Check if the path exists as-is
//     if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
//       return resolved;
//     }
//
//     // Try appending common extensions
//     const exts = [".js", ".ts", ".jsx", ".tsx", ".json"];
//     for (const ext of exts) {
//       if (fs.existsSync(resolved + ext)) {
//         return resolved + ext;
//       }
//     }
//
//     // Try index files in directories
//     for (const ext of exts) {
//       const indexPath = path.join(resolved, `index${ext}`);
//       if (fs.existsSync(indexPath)) {
//         return indexPath;
//       }
//     }
//
//     throw new Error(
//       `Cannot resolve import path: ${importPath} from ${parentFile}`
//     );
//   } else {
//     throw new Error(
//       `Non-relative imports (e.g., packages) are not supported: ${importPath}`
//     );
//   }
// }
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "resolvePath", {
    enumerable: true,
    get: function() {
        return resolvePath;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function resolvePath(importPath, parentFile, projectRoot) {
    console.log("resolvePath:", importPath, parentFile);
    let resolved;
    // Handle relative imports
    if (importPath.startsWith(".")) {
        const parentDir = _path.default.dirname(parentFile);
        resolved = _path.default.resolve(parentDir, importPath);
    } else if (importPath.startsWith("/")) {
        if (!projectRoot) {
            throw new Error("Project root must be specified for absolute imports.");
        }
        resolved = _path.default.join(projectRoot, importPath);
    } else {
        throw new Error(`Non-relative imports (e.g., packages) are not supported: ${importPath}`);
    }
    // Check if the path exists as-is
    if (_fs.default.existsSync(resolved) && _fs.default.statSync(resolved).isFile()) {
        return resolved;
    }
    // Try appending common extensions
    const exts = [
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json"
    ];
    for (const ext of exts){
        if (_fs.default.existsSync(resolved + ext)) {
            return resolved + ext;
        }
    }
    // Try index files in directories
    for (const ext of exts){
        const indexPath = _path.default.join(resolved, `index${ext}`);
        if (_fs.default.existsSync(indexPath)) {
            return indexPath;
        }
    }
    console.error(`Failed to resolve import: ${importPath} from ${parentFile}`);
    throw new Error(`Cannot resolve import path: ${importPath} from ${parentFile}`);
}
