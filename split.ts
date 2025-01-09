import { FILTERED_JSON } from "./constants.ts";
import { loadJson } from "./load.ts";

const CHUNKS = 4;

async function main() {
	const data = await loadJson(FILTERED_JSON);
	if (!data.success || data.data === undefined) {
		console.error(`failed to parse ${filePath}: ${data.error}`);
		Deno.exit(1);
	}
	const searchResults = data.data;
	for (const chunk of chunks(searchResults, CHUNKS)) {
		console.log(chunk.length);
	}
}

function* chunks<T>(arr: T[], n: number) {
	const size = Math.ceil(arr.length / n);
	for (let i = 0; i < arr.length; i += size) {
		yield arr.slice(i, i + size);
	}
}

if (import.meta.main) {
	main();
}
