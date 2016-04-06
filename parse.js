var fs = require('fs');

var text = fs.readFileSync("./republic.txt", "utf8");
var ps = text.split(/\r\n\r\n/g)
  .map(x => x.match(/\S+/g))
  .filter(x => x && x.length > 150 && x.length < 170)
  .map(x => x.join(" "))
  .slice(-20);

ps.forEach(x => console.log(x));
