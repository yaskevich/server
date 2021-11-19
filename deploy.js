'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require("child_process");

if (process.argv.length > 2) {
	console.log(">", process.argv[2]);
	const name = process.argv[2];
	const json = `./${name}.json`;
	
	if (fs.existsSync(json)){
		const config = JSON.parse(fs.readFileSync(json, 'utf8'));
		
		if (config?.owner) {
			const branch = config.branch || "main";			
			const git = `https://github.com/${config.owner}/${name}#${branch}`;
			
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
				execSync(config?.ssh ? `git clone git@${config.ssh}:${config.owner}/${name}.git . --depth 1` : `degit ${git}`, {cwd: dirApp});
			} catch (error) {
				console.log(error);
				process.exit();
			}
			
			if (config?.root) {
				try {
					execSync(`mv ${config.root}/* .`, {cwd: dirApp});
					console.log("> move root up");
				} catch (error) {
					console.log(error);
					process.exit();
				}
			}
			
			if (config?.rm) {
				for (let file of config.rm) {
				  fs.rmSync(path.join(dirApp, file), { recursive: true, force: true });
				}
			}
			
			console.log("> npm install");
			execSync("npm install", {cwd: dirApp});
			
			const envConfig = `${name}.env`;
			
			if (fs.existsSync(envConfig)){
				fs.copyFileSync(envConfig, path.join(dirApp, ".env"));
				console.log("> copy env");
			}
			
			let pm2Config = fs.existsSync(path.join(dirApp, "ecosystem.config.cjs")) ? "ecosystem.config.cjs" : "ecosystem.config.js";
			
			let starter  = `pm2 start ${pm2Config}`;
			let port = '';
			
			if (config?.host) {
				const nginx = path.join('/etc/nginx/sites-enabled', config.host);
				const contents = fs.readFileSync(path.join(nginx), 'utf8');
				const myRegexp = /^\s*proxy_pass\s+http\:\/\/127\.0\.0\.1\:(.*?)\;$/gm;
				const match = myRegexp.exec(contents);
				port = match[1];
				console.log(">", config.host, port);
			} 
			
			if (!port && config?.port) {
				console.log("> port from config ", config.port);
				port = config.port;
			}
			
			if (port) {
				starter = `PORT=${port} ${starter}`;
			}
			
			execSync(starter, {cwd: dirApp});
			// console.log(starter);
			execSync("pm2 save");
		} else {
			console.error("Repository owner is not set in JSON config! Exiting...");
		}
	} else {
		console.error("Config JSON was not provided! Exiting...");
	}
}
