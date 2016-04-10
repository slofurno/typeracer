export function mapQueryString(s) {
  return s.split('&')
  .map(function(kvp){
        return kvp.split('=');
  }).reduce(function(sum,current){
        var key = current[0];
        var value = current[1];
        sum[key] = value;
        return sum;
  },{});
}


export function zip(xs, ys) {
  var r = [];
  var c = Math.min(xs.length, ys.length);
  for (var i = 0; i < c; i++) {
    r.push([xs[i], ys[i]]);
  }
  return r;
}


export function dzip(xs, ys) {
  var r = [];
  var c = Math.min(xs.length, ys.length);
  var zz = Math.max(xs.length, ys.length);
  var i = 0;
  for (; i < c; i++) {
    r.push([xs[i], ys[i]]);
  }

  for (; i < zz; i++) {
    var asdf = xs[i] || ys[i];
    r.push([asdf, asdf]);
  }
  return r;
}
