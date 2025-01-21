import { loadJson } from "./load.ts";
import { FILTERED_JSON, FINAL_JSON, TABLE_FILE } from "./constants.ts";
import { writeFilePretty } from "./write.ts";

async function main() {
	const threshold = 5;
	const data = await loadJson(FILTERED_JSON);
	if (!data.success || data.data === undefined) {
		console.error(`failed to load ${FILTERED_JSON}: ${data.error}`);
	} else {
		const arr = data.data;
		console.log(`Original entries: ${arr.length}`);
		const filtered = arr.filter(
			(e) => e.stargazers_count >= threshold || e.forks_count >= threshold, // ||
			// e.forks >= threshold,
		);
		console.log(`Filtered entries: ${filtered.length}`);
		await writeFilePretty(FINAL_JSON, filtered);
		await Deno.writeTextFile(
			TABLE_FILE,
			filtered.reduce((ack, curr) => `${ack}\n${curr.html_url}`, ""),
		);
	}
}

if (import.meta.main) {
	main();
}
