const fs = require("fs");
const path = require("path");

const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (
      fullPath.endsWith(".tsx") &&
      !fullPath.includes("node_modules")
    ) {
      let content = fs.readFileSync(fullPath, "utf8");

      const hasJSX = /<\w+/.test(content);
      const hasReactImport = /import\s+React\s+from\s+["']react["']/.test(
        content
      );

      if (hasJSX && !hasReactImport) {
        console.log(`Adding React import to: ${fullPath}`);
        content = `import React from "react";\n${content}`;
        fs.writeFileSync(fullPath, content, "utf8");
      }
    }
  }
};

scanDir("./");