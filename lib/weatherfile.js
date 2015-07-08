var csv = require('csv');
var fs  = require('fs');

function getStream (lim) {
  return fs.createReadStream('./data/weather.csv').
    pipe(csv.parse());
}

module.exports = {
  getStream: getStream
};

