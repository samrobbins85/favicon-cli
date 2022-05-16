#!/usr/bin/env node
import sharp from "sharp";
import fs from "fs";
import toIco from "to-ico";
import { highlight } from "cli-highlight";
import { optimize } from "svgo";

const mySvg = await (async () => {
  // automatically adjusting svg density
  const instance = sharp("favicon.svg");
  const metadata = await instance.metadata();
  const initDensity = metadata.density ?? 72;

  let wDensity = 0;
  let hDensity = 0;

  if (metadata.width) {
    wDensity = (initDensity * 1024) / metadata.width
  }

  if (metadata.height) {
    hDensity = (initDensity * 1024) / metadata.height
  }

  if (!wDensity && !hDensity) {
    // if there's no width/height metadata
    return instance
  }

  return sharp("favicon.svg", { density: Math.max(wDensity, hDensity) });
})();

const pngSettings = {compressionLevel: 9, colors: 64};

const tempPng = await mySvg.resize(32, 32).toBuffer();

const file = [tempPng];

const icoFormat = await toIco(file);

fs.writeFileSync("favicon.ico", icoFormat);

mySvg.resize(512, 512).png(pngSettings).toFile("icon-512.png");
mySvg.resize(192, 192).png(pngSettings).toFile("icon-192.png");
mySvg
  .resize(140, 140)
  .extend({
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png(pngSettings)
  .toFile("apple-touch-icon.png");

const html = `
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
`;

const manifest = {
  icons: [
    { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
    { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
  ],
};

const manifestString = JSON.stringify(manifest, null, 2);

fs.writeFile("manifest.webmanifest", manifestString, (err) => {
  if (err) {
    throw err;
  }
});

// we're done with the original svg now, so let's optimize it
const svgString = fs.readFileSync("favicon.svg", "utf8");
const result = optimize(svgString);
// renaming original just in case
fs.rename("favicon.svg", "favicon-original.svg", (err) => {
  if (err) {
    throw err;
  }
});
fs.writeFile("favicon.svg", result.data, (err) => {
  if (err) {
    throw err;
  }
});

console.log("Optimized favicon.svg. Original renamed to favicon-original.svg.\n")

console.log("Copy the following into your head globally:");
console.log(highlight(html, { language: "html" }));