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
import path from "path";
import fs from "fs";

export function resolvePath(importPath: string, parentFile: string): string {
  console.log("resolvePath:", importPath, parentFile);
  // Only handle relative or absolute imports
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    // This is the correct parent directory!
    const parentDir = path.dirname(parentFile);
    let resolved = path.resolve(parentDir, importPath);

    // Check if the path exists as-is
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return resolved;
    }

    // Try appending common extensions
    const exts = [".js", ".ts", ".jsx", ".tsx", ".json"];
    for (const ext of exts) {
      if (fs.existsSync(resolved + ext)) {
        return resolved + ext;
      }
    }

    // Try index files in directories
    for (const ext of exts) {
      const indexPath = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    throw new Error(
      `Cannot resolve import path: ${importPath} from ${parentFile}`
    );
  } else {
    throw new Error(
      `Non-relative imports (e.g., packages) are not supported: ${importPath}`
    );
  }
}
