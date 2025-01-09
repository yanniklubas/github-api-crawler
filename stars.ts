import { loadJson } from "./load.ts";
import { FILTERED_JSON } from "./constants.ts";

async function main() {
	const data = await loadJson(FILTERED_JSON);
	if (!data.success || data.data === undefined) {
		console.error(`failed to load ${FILTERED_JSON}: ${data.error}`);
	} else {
		const arr = data.data;
		console.log(`Original entries: ${arr.length}`);
		const filtered = arr.filter((e) => e.stargazers_count >= 1);
		console.log(`Filtered entries: ${filtered.length}`);
	}
}

if (import.meta.main) {
	main();
}
