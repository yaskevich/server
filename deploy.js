'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require("child_process");

if (process.argv.length > 2) {
	console.log(process.argv[2]);
	const name = process.argv[2];
	
	const config = JSON.parse(fs.readFileSync(`./${name}.json`, 'utf8'));
	
	const branch = config.branch || "main";
	const git = `https://github.com/yaskevich/${name}#${branch}`;
	
	const dirParent = config.dir || "production";
	const dirApp = path.join(dirParent, name);
	
	fs.rmSync(dirApp, { recursive: true, force: true });
	fs.mkdirSync(dirApp, { recursive: true });
	
	try {
		execSync(`pm2 delete ${name}`);
	} catch { 
		console.log("Process is not in PM2 list!"); 
	}
	
	try {
		execSync(`degit ${git}`, {cwd: dirApp});
	} catch (error) {
		console.log(error);
	}
	
	if (config?.rm) {
		for (let file of config.rm) {
		  fs.rmSync(path.join(dirApp, file), { recursive: true, force: true });
		}
	}
	
	let starter  = "pm2 start ecosystem.config.cjs";
	let port = '';
	
	if (config?.host) {
		const nginx = path.join('/etc/nginx/sites-enabled', config.host);
		const contents = fs.readFileSync(path.join(nginx), 'utf8');
		const myRegexp = /^\s*proxy_pass\s+http\:\/\/127\.0\.0\.1\:(.*?)\;$/gm;
		const match = myRegexp.exec(contents);
		port = match[1];
		console.log(config.host, port);
	} 
	
	if (!port && config?.port) {
		port = config.port;
	}
	
	if (port) {
		starter = `PORT=${config.port} ${starter}`;
	}
	
	execSync(starter, {cwd: dirApp});
	execSync("pm2 save");
}
