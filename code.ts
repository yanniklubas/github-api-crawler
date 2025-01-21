import { Octokit } from "https://esm.sh/octokit@4.0.3?dts";
import { writeFilePretty } from "./write.ts";
import { OUTPUT_BASE } from "./constants.ts";

const QUERIES = {
	Prometheus: "prometheus in:file,path",
	MongoDB: "mongo in:file,path NOT language:json",
	MySQL: "mysql in:file,path",
	OracleDB: "oracledb in:file,path",
	SnowflakeDB: "snowflake in:file,path",
	PostgreSQL: "postgresql in:file,path",
	MsSql: "mssql in:file,path",
	Redis: "redis in:file,path NOT filename:license",
	Cassandra: "cassandra in:file,path",
	MariaDb: "mariadb in:file,path",
	Database: "database in:file,path",
	MinIO: "minio in:file,path",
	React: "react in:file filename:package extension:json",
	NextJS: "next in:file filename:package extension:json",
	Svelte: "svelte in:file filename:package extension:json",
	SvelteKit: "sveltejs/kit in:file filename:package extension:json",
	VueJS: "vue in:file filename:package extension:json",
	Nuxt: "nuxt in:file filename:package extension:json",
	AngularJS: "angular in:file filename:package extension:json",
	AnalogJS: "analogjs in:file filename:package extension:json",
	Jaeger: "jaeger in:file,path",
	Zipkin: "zipkin in:file,path",
	OpenTelemetry: "otel in:file,path",
	Logstash: "logstash in:file,path",
	Filebeat: "filebeat in:file,path",
	ElasticSearch: "elasticsearch in:file,path",
	Kafka: "kafka in:file,path",
	RabbitMQ: "rabbitmq in:file,path",
	Nats: "nats in:file,path",
	Dapr: "dapr in:file,path",
	Consul: "consul in:file,path",
	Istio: "istio in:file,path",
	nginx: "nginx in:file,path",
	Zuul: "zuul in:file,path",
	Kong: "kong in:file,path NOT language:json",
	Envoy: "envoy in:file,path",
	Traefix: "traefik in:file,path",
	Ocelot: "ocelot in:file,path",
	Zookeeper: "zookeeper in:file,path",
	Hystrix: "hystrix in:file,path",
	"Kiali (Istio Console)": "kiali in:file,path",
	Grafana: "grafana in:file,path",
	"Kibana (ElasticSearch)": "kibana in:file,path",
	"Akhq (Kafka Gui)": "akhq in:file,path",
	Portainer: "portainer in:file,path",
	Keycloak: "keycloak in:file,path",
	Vault: "vault in:file,path",
	Eureka: "eureka in:file,path",
	Locust: "locust in:file language:python",
	K6: '"k6" in:file language:javascript',
	JMeter: "jmeter in:file extension:jmx",
};

function newApiClient(token: string) {
	return new Octokit({ auth: token });
}

async function searchCode(client: Octokit, repo: string) {
	const out = {};
	for (const [key, query] of Object.entries(QUERIES)) {
		const q = `repo:${repo} ${query}`;
		const response = await client.request(
			`GET /search/code?q=${encodeURIComponent(q)}`,
		);
		const data = response.data;
		out[key] = data;
	}
	await writeFilePretty(
		`${OUTPUT_BASE}/${repo.replaceAll("/", "---")}.json`,
		out,
	);
}

async function main() {
	const token = Deno.env.get("GITHUB_API_TOKEN");
	if (token === undefined) {
		console.error("Missing GitHub API token! Exiting...");
		Deno.exit(1);
	}
	await Deno.mkdir(OUTPUT_BASE, { recursive: true });
	const client = newApiClient(token);
	const text = await Deno.readTextFile("urls.txt");

	for (const url of text.split("\n")) {
		if (url === "") continue;
		const components = url.split("/");
		const repo = `${components[components.length - 2]}/${components[components.length - 1]}`;
		await searchCode(client, repo);
	}

	// See: https://github.com/octokit/octokit.js/issues/2079
	Deno.exit(0);
}

if (import.meta.main) {
	main();
}
