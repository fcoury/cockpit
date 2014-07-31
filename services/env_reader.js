var fs = require('fs');

function EnvReader() {
  this.env = process.env.NODE_ENV || 'development';
}

EnvReader.prototype.read = function() {
  var configName = './env.' + this.env + '.json';
  if (fs.existsSync(configName)) {
    var config = require('.' + configName);
    for (var key in config) {
      process.env[key] = config[key];
    }
  }
}

module.exports = new EnvReader();
