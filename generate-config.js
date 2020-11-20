const fs = require('fs');
const moment = require('moment-timezone');
const handlebars = require('handlebars');

const inFile = 'src/assets/config/config.json.tmpl';
const outFile = 'src/assets/config/config.json';

try {
  var timeStamp = moment(new Date()).tz('Europe/Madrid').format("YYYYMMDDHHmm");
  const source = fs.readFileSync(inFile, 'utf8');
  const template = handlebars.compile(source, {
    strict: true
  });

  const result = template({
    "buildTimeStamp": timeStamp
  });

  fs.writeFileSync(outFile, result);
  console.log('Build timestamp set to: ' + timeStamp);
} catch (error) {
  console.error('Error occurred:', error);
  throw error
}
