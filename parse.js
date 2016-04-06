var fs = require('fs');

var text = fs.readFileSync("./republic.txt", "utf8");
var ps = text.split(/\r\n\r\n/g).map(x => x.match(/\w+/g)).filter(x => x && x.length > 150 && x.length < 170).map(x => x.join(" ")).slice(-5);

console.log(JSON.stringify(ps));

