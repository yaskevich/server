const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join('/etc/nginx/sites-enabled');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        // console.log(file); 
		var contents = fs.readFileSync(path.join(directoryPath, file), 'utf8');
		// console.log(contents);
		
		var myRegexp = /^\s*proxy_pass\s+http\:\/\/127\.0\.0\.1\:(.*?)\;$/gm;
		var match = myRegexp.exec(contents);
		console.log(`  ${file.padEnd(45, ' ')}${match[1]}`);
    });
});
