import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

function printHelp() {
  console.log("Usage: npx tsx generate-logo.ts <text> [options]");
  console.log("");
  console.log("Options:");
  console.log("  --size <n>         ViewBox size (default: 32)");
  console.log("  --color1 <hex>     Gradient start color (default: #3b82f6)");
  console.log("  --color2 <hex>     Gradient end color (default: #9333ea)");
  console.log("  --radius <n>       Border radius (default: 6)");
  console.log("  --font-size <n>    Font size (default: auto)");
  console.log("  --output <file>    Output file (default: logo.svg)");
  process.exit(1);
}

if (args.length < 1) printHelp();

const text = args[0];
const size = parseInt(getArg("--size", "32"));
const color1 = getArg("--color1", "#3b82f6");
const color2 = getArg("--color2", "#9333ea");
const radius = parseInt(getArg("--radius", "6"));
const fontSize = parseInt(getArg("--font-size", String(Math.round(size * 0.44))));
const output = getArg("--output", "logo.svg");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <text x="${size / 2}" y="${Math.round(size / 2 + fontSize * 0.35)}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}">${text}</text>
</svg>`;

fs.writeFileSync(path.resolve(output), svg);
console.log(`Logo saved to ${output}`);
