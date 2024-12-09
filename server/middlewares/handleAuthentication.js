const handleAuthentication = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (authHeader && authHeader === "bearer dGhlc2VjcmV0dG9rZW4=") { // fake token, fake authentication check :)
		next();
	} else {
        res.status(401);
        res.send('Unauthorized');
	}
}

module.exports = handleAuthentication;