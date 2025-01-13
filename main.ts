import { Octokit } from "https://esm.sh/octokit@4.0.3?dts";
import { format } from "@std/datetime";
import * as path from "jsr:@std/path";
import { OUTPUT_BASE } from "./constants.ts";
import { writeFilePretty } from "./write.ts";

const KEYWORDS = [
	"microservice application",
	"micro-service application",
	"micro service application",
];

const TIME_SLICES = [
	// 2020
	"2020-01-01..2020-04-01",
	"2020-04-01..2020-08-01",
	"2020-08-01..2021-01-01",
	// 2021
	"2021-01-01..2021-04-01",
	"2021-04-01..2021-08-01",
	"2021-08-01..2022-01-01",
	// 2022
	"2022-01-01..2022-04-01",
	"2022-04-01..2022-08-01",
	"2022-08-01..2023-01-01",
	// 2023
	"2023-01-01..2023-04-01",
	"2023-04-01..2023-08-01",
	"2023-08-01..2024-01-01",
	// 2024
	"2024-01-01..2024-04-01",
	"2024-04-01..2024-08-01",
	"2024-08-01..2025-01-01",
	// 2025
	"2025-01-01..*",
];

Date.prototype.addDays = function (days: number) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};
const TOMORROW = format(new Date().addDays(1), "yyyy-MM-dd");

async function searchRepositories(
	client: Octokit,
	keyword: string,
	timeSlice: string,
) {
	const dirPath = await mkOutputDir(keyword.replaceAll(" ", "_"));
	const iterator = newRequestIterator(client, keyword, timeSlice);
	const time = timeSlice.replaceAll("..", "--").replaceAll("*", TOMORROW);
	let page = 1;
	for await (const { data: repositories } of iterator) {
		const fileName = `${time}-page-${page}.json`;
		console.log(
			`Saving page ${page} for keyword ${keyword} and time slice ${time}`,
		);
		await writeFilePretty(path.join(dirPath, fileName), repositories);
		page++;
	}
}

function newApiClient(token: string) {
	return new Octokit({ auth: token });
}

function newRequestIterator(
	client: Octokit,
	search: string,
	timeSlice: string,
) {
	return client.paginate.iterator(
		`GET /search/repositories?q=${encodeURIComponent(
			`${search} in:readme|name|description pushed:${timeSlice} is:public archived:false`,
		)}`,
	);
}

async function mkOutputDir(dirName: string) {
	const dirPath = path.join(OUTPUT_BASE, dirName);
	await Deno.mkdir(dirPath, { recursive: true });
	return dirPath;
}

async function main() {
	const token = Deno.env.get("GITHUB_API_TOKEN");
	if (token === undefined) {
		console.error("Missing GitHub API token! Exiting...");
		Deno.exit(1);
	}
	const client = newApiClient(token);
	for (const keyword of KEYWORDS) {
		for (const timeSlice of TIME_SLICES) {
			await searchRepositories(client, keyword, timeSlice);
		}
	}

	// See: https://github.com/octokit/octokit.js/issues/2079
	Deno.exit(0);
}

if (import.meta.main) {
	main();
}
