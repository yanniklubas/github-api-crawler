import { FILTERED_JSON, OUTPUT_BASE } from "./constants.ts";
import { loadJson } from "./load.ts";
import { type RepoSearchResult } from "./schema.ts";
import { writeFilePretty } from "./write.ts";
import * as path from "jsr:@std/path";

async function main() {
	const filtered: RepoSearchResult = [];
	const seen: Set<string> = new Set();
	for await (const entry of Deno.readDir(OUTPUT_BASE)) {
		if (entry.isDirectory) {
			const dirPath = path.join(OUTPUT_BASE, entry.name);
			for await (const entry of Deno.readDir(dirPath)) {
				if (isJsonFile(entry)) {
					const filePath = path.join(dirPath, entry.name);
					await processJson(filePath, filtered, seen);
				}
			}
		}
	}
	console.log(`Writing ${filtered.length} entries to ${FILTERED_JSON}`);
	await writeFilePretty(FILTERED_JSON, filtered);
}

async function processJson(
	path: string,
	out: RepoSearchResult,
	seen: Set<string>,
) {
	const data = await loadJson(path);

	if (!data.success || data.data === undefined) {
		console.error(`failed to load ${path}: ${data.error}`);
	} else {
		const arr = data.data;
		out.push(
			...arr.filter((e) => {
				const isDuplicate = seen.has(e.html_url);
				seen.add(e.html_url);
				return e.language != null && !isDuplicate && !e.is_template;
			}),
		);
	}
}

function isJsonFile(entry: Deno.DirEntry): boolean {
	return entry.isFile && entry.name.endsWith(".json");
}

if (import.meta.main) {
	main();
}
