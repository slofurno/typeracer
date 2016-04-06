var fs = require('fs');

var text = fs.readFileSync("./republic.txt", "utf8");
var ps = text.split(/\r\n\r\n/g)
  .map(x => x.match(/\S+/g))
  .filter(x => x )
  .map(x => x.join(" "))
  .filter(x => x.length > 3000 && x.length < 10000);

ps.forEach(x => console.log(x));
