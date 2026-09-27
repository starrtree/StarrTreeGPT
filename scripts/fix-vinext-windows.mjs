import { readFile, writeFile } from "node:fs/promises";

// Vinext 0.0.50 uses OS file paths as URL cache keys. Normalize its scanner
// on Windows so npm start can serve the migrated site's assets locally.
if (process.platform === "win32") {
  const file = new URL("./static-file-cache.js", import.meta.resolve("vinext/server/prod-server"));
  const original = "relativePath: path.relative(base, batch[j]),";
  const corrected = 'relativePath: path.relative(base, batch[j]).split(path.sep).join("/"),';
  const source = await readFile(file, "utf8");
  if (source.includes(original)) {
    await writeFile(file, source.replace(original, corrected));
    console.log("Applied Vinext Windows asset-path correction.");
  } else if (!source.includes(corrected)) {
    throw new Error("Vinext static-file scanner changed; review the Windows correction before starting.");
  }
}
