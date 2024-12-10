import { Application } from "oak";
import router from "./routes/routes.ts";
import handleErrors from "./middlewares/handleErrors.ts";
import handleAuthentication from "./middlewares/handleAuthentication.ts";
import initializeDb from "./init.ts";


const SERVER_PROTOCOL = Deno.env.get("SERVER_PROTOCOL");
const HOST = Deno.env.get("HOST");
const SERVER_PORT = +Deno.env.get("SERVER_PORT")!;
const VERBOSE = Deno.env.get("VERBOSE");

const app = new Application({ logErrors: !!VERBOSE });

const apiURL = `${SERVER_PROTOCOL}://${HOST}:${SERVER_PORT}`;

await initializeDb();

// Enable to log all requests
if (VERBOSE === 'true') {
	app.use(async (ctx, next) => {
		console.log(ctx.request);
		await next();
	});
}

app.use(handleErrors);
app.use(handleAuthentication);
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
console.log(`Server is running on ${apiURL}`);
await app.listen({ port: SERVER_PORT });


