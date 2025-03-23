/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch (request, env, ctx) {
		const url = new URL(request.url);
		const headersarg = {headers: {"Content-Type": "text/html"}};

		if (url.pathname == '/') {
			return new Response("The index page has nothing. It is open to all. The members area is <a href='/secure'>/secured</a> and needs log in.", headersarg);

		} else if (url.pathname == '/secure') {

			var email = request.headers.get('cf-access-authenticated-user-email');
			var cc = request.headers.get('cf-ipcountry');
			var dt = new Date().toUTCString();

			var resp = `<p>${email} authenticated at ${dt} from <a href="/secure/${cc}">${cc}</a></p>`;
			return new Response(resp, headersarg);

		} else if (url.pathname.startsWith('/secure/')) {
			var pts = url.pathname.split('/'); // Path TokenS
			const cc = pts[pts.length-1].toLowerCase();

			switch (request.method) {
			case "GET":
				const r2object = await env.r2flags.get(cc + ".png");

				if (r2object === null) {
					return new Response(`Flag not found for country ${cc}`, { status: 404 });
				}

				headersarg.headers['Content-Type'] = "image/png";
				return new Response(r2object.body, headersarg);

			default:
				return new Response("Method Not Allowed", {
					status: 405,
					headers: {
						Allow: "GET",
					},
				});
			}
		}
		else
			return new Response('Page Not Found', { status: 404 });
	},
}