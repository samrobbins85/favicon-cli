#!/usr/bin/env node
import sharp from "sharp";
import fs from "fs";
import toIco from "to-ico";
import { highlight } from "cli-highlight";
const mySvg = sharp("favicon.svg");

const tempPng = await mySvg.resize(32, 32).toBuffer();

const file = [tempPng];

const icoFormat = await toIco(file);

fs.writeFileSync("favicon.ico", icoFormat);

mySvg.resize(512, 512).toFile("icon-512.png");
mySvg.resize(192, 192).toFile("icon-192.png");
mySvg
  .resize(140, 140)
  .extend({
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toFile("apple-touch-icon.png");

const html = `
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
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

console.log("Copy the following into your head globally:");
console.log(highlight(html, { language: "html" }));
