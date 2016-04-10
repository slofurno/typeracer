var fs = require('fs');

function truncate (n) {
  return function (xs) {
    return xs.slice(0, n);
  }
}

var maxSize = truncate(5000);

var text = fs.readFileSync("./republic.txt", "utf8");
var ps = text.split(/\r\n\r\n/g)
  .map(x => x.match(/\S+/g))
  .filter(x => x )
  .map(x => x.join(" "))
  .filter(x => x.length > 3000)
  .map(maxSize)

ps.forEach(x => console.log(x));
