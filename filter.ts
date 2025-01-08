import { readJson, writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";

async function main() {
	const base = "output";
	const data = [];
	for await (const entry of Deno.readDir(base)) {
		if (entry.isDirectory) {
			const dirPath = `${base}/${entry.name}`;
			for await (const entry of Deno.readDir(dirPath)) {
				if (entry.isFile && entry.name.endsWith(".json")) {
					const filePath = `${dirPath}/${entry.name}`;
					const slice = await readJson(filePath);
					if (Array.isArray(slice)) {
						const filtered = slice.filter((e) => e.language != null);
						data.push(...filtered);
					} else {
						console.error(`${filePath} does not contain a top-level array`);
					}
				}
			}
		}
	}
	const filePath = `${base}/filtered.json`;
	console.log(`Writing ${data.length} entries to ${filePath}`);
	await writeJson(filePath, data, { spaces: 2 });
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
	main();
}
