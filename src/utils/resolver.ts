// import path from "path";
// import fs from "fs";
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
  // Handle relative or absolute imports
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    // Use parentFile to get the correct parent directory
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
      `Cannot resolve import path: ${importPath} from ${parentFile}`,
    );
  } else {
    // Handle npm package imports
    const parentDir = path.dirname(parentFile);

    // Look for node_modules starting from the parent directory and walking up
    let currentDir = parentDir;
    while (currentDir !== path.dirname(currentDir)) {
      const nodeModulesPath = path.join(currentDir, "node_modules", importPath);

      // Check if the package exists in node_modules
      if (fs.existsSync(nodeModulesPath)) {
        // Try to find the main entry point
        const packageJsonPath = path.join(nodeModulesPath, "package.json");
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, "utf8"),
            );
            const mainField =
              packageJson.main || packageJson.module || "index.js";
            const mainPath = path.join(nodeModulesPath, mainField);

            if (fs.existsSync(mainPath)) {
              return mainPath;
            }
          } catch (e) {
            // Fall back to index.js if package.json is malformed
          }
        }

        // Try common entry points
        const commonEntries = ["index.js", "index.ts", "index.json"];
        for (const entry of commonEntries) {
          const entryPath = path.join(nodeModulesPath, entry);
          if (fs.existsSync(entryPath)) {
            return entryPath;
          }
        }
      }

      // Move up one directory
      currentDir = path.dirname(currentDir);
    }

    // If we can't resolve the npm package, return null instead of throwing
    // This allows the graph builder to handle it gracefully
    return "";
  }
}
