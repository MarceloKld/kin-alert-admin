import fs from "node:fs";
import sharp from "sharp";

const inputSvg = "public/icons/kin-alert-logo.svg";
const outDir = "public/icons";

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  // any
  await sharp(inputSvg)
    .resize(size, size)
    .png()
    .toFile(`${outDir}/icon-${size}.png`);

  // maskable: on ajoute du padding (zone de sécurité)
  const pad = Math.round(size * 0.12);
  await sharp(inputSvg)
    .resize(size - pad * 2, size - pad * 2)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 11, g: 15, b: 25, alpha: 1 },
    })
    .png()
    .toFile(`${outDir}/icon-${size}-maskable.png`);
}

console.log("PWA icons generated.");
