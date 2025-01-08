import { Octokit } from "https://esm.sh/octokit?dts";
import { writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";

function newClient(token: string) {
	return new Octokit({ auth: token });
}

function newRequestIterator(client: Octokit, query: string) {
	return client.paginate.iterator(
		`GET /search/repositories?q=${encodeURIComponent(
			`"${query}" in:readme|name|description pushed:>=2020-01-01 is:public archived:false`,
		)}&sort=stars`,
	);
}

async function makeRequests(client: Octokit, keyword: string) {
	const iterator = newRequestIterator(client, keyword);
	let i = 1;
	const dir = keyword.replaceAll(" ", "_");
	await Deno.mkdir(`output/${dir}`, {
		recursive: true,
	});
	for await (const { data: repositories } of iterator) {
		console.log(`Saving page ${i} for keyword ${keyword}`);
		await writeFile(`output/${dir}/page-${i}.json`, repositories);
		i++;
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
