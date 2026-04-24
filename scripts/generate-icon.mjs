import fs from "node:fs";
import path from "node:path";
import pngToIco from "png-to-ico";

/** 从 PNG 生成 Windows ICO 图标。 */
async function generateIcon() {
	const source = path.resolve("src/gpad-logo.png");
	const targetDirectory = path.resolve("build");
	const target = path.resolve(targetDirectory, "gpad-logo.ico");

	const buffer = await pngToIco(source);
	fs.mkdirSync(targetDirectory, { recursive: true });
	fs.writeFileSync(target, buffer);
	console.log(`Icon generated: ${target}`);
}

await generateIcon();
