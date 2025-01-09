import { readJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";

async function main() {
	const base = "output";
	const filePath = `${base}/filtered.json`;
	const data = await readJson(filePath);
	if (!Array.isArray(data)) {
		console.error(`${filePath} does not contain a top-level array`);
		return;
	}
	console.log(`Original entries: ${data.length}`);
	const filtered = data.filter((e) => e["stargazers_count"] >= 0);
	console.log(`Filtered entries: ${filtered.length}`);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
	main();
}
