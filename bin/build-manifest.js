/**
 * Build browser-specific manifest.json.
 *
 * USAGE:
 *   node build-manifest.js <targetBrowser> <outputDir>
 *
 * EXAMPLES:
 *   node build-manifest.js chrome dist/chrome
 *   node build-manifest.js firefox dist/firefox
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArguments(argv) {
  // Get target browser
  const target = argv[2];
  if (!target || (target !== 'firefox' && target !== 'chrome')) {
    throw new Error("target must be 'firefox' or 'chrome'");
  }

  // Get output directory
  const outputDir = argv[3];
  if (!outputDir) {
    throw new Error('output directory must be specified');
  }

  return { target, outputDir };
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
}

function writeJson(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function main() {
  // Parse command-line arguments
  const { target, outputDir } = parseArguments(process.argv);

  // Set manifest version from package.json version
  const { version } = readJson('../package.json');
  const manifest = readJson('../src/manifest.json');
  manifest.version = version;

  // Update manifest for Chrome
  if (target === 'chrome') {
    manifest.background.service_worker = manifest.background.scripts[0];
    delete manifest.background.scripts;
    delete manifest.browser_specific_settings;
  }

  // Write updated manifest
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFilename = path.join(outputDir, 'manifest.json');
  writeJson(manifest, outputFilename);

  console.log(
    `Wrote manifest.json for target "${target}" in "${outputFilename}"`,
  );
}

main();
