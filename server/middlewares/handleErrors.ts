import { type Context, type HttpError, isHttpError } from "oak";

const handleErrors = async ({ response }: Context, next: () => Promise<unknown>): Promise<void> => {
	try {
		await next();
	} catch (err) {
		if (isHttpError(err)) {
			response.status = err.status;
		} else {
			response.status = 500;
		}
		response.body = { error: (err as HttpError).message };
	}
};


export default handleErrors;