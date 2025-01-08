import { Octokit } from "https://esm.sh/octokit?dts";
import { writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";

function newClient(token: string) {
	return new Octokit({ auth: token });
}

const TIME_SLICES = [
	"2020-01-01..2020-04-01",
	"2020-04-01..2020-08-01",
	"2020-08-01..2021-01-01",
	"2021-01-01..2021-04-01",
	"2021-04-01..2021-08-01",
	"2021-08-01..2022-01-01",
	"2022-01-01..2022-04-01",
	"2022-04-01..2022-08-01",
	"2022-08-01..2023-01-01",
	"2023-01-01..2023-04-01",
	"2023-04-01..2023-08-01",
	"2023-08-01..2024-01-01",
	"2024-01-01..2024-04-01",
	"2024-04-01..2024-08-01",
	"2024-08-01..2025-01-01",
	"2025-01-01..*",
];

function newRequestIterator(client: Octokit, query: string, time: string) {
	return client.paginate.iterator(
		`GET /search/repositories?q=${encodeURIComponent(
			`"${query}" in:readme|name|description pushed:${time} is:public archived:false`,
		)}`,
	);
}

async function makeRequests(client: Octokit, keyword: string) {
	for (const time of TIME_SLICES) {
		const iterator = newRequestIterator(client, keyword, time);
		let i = 1;
		const dir = keyword.replaceAll(" ", "_");
		await Deno.mkdir(`output/${dir}`, {
			recursive: true,
		});
		const timePath = time.replaceAll("..", "--");
		for await (const { data: repositories } of iterator) {
			console.log(
				`Saving page ${i} for keyword ${keyword} and time ${timePath.replaceAll("*", "today")}`,
			);
			await writeFile(`output/${dir}/${timePath}-page-${i}.json`, repositories);
			i++;
		}
	}
}

async function writeFile(path: string, data: object) {
	try {
		await writeJson(path, data, { spaces: 2 });
	} catch (e) {
		console.error(e);
	}
}

const KEYWORDS = [
	"microservice application",
	"micro-service application",
	"micro service application",
];

async function main() {
	const client = newClient(Deno.env.get("GITHUB_API_TOKEN") || "");
	for (const keyword of KEYWORDS) {
		await makeRequests(client, keyword);
	}
	Deno.exit(0);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
	main();
}
