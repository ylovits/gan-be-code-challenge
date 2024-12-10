import { Context } from "oak";

const handleAuthentication = async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
	const authHeader = ctx.request.headers.get("Authorization");
	if (authHeader && authHeader === "bearer dGhlc2VjcmV0dG9rZW4=") { // fake token, fake authentication check :)
		await next();
	} else {
		ctx.response.status = 401;
		ctx.response.body = { message: "Unauthorized" };
	}
}

export default handleAuthentication;