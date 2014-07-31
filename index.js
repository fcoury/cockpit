var moment = require('moment');
var express = require('express');
var app = express();

var Statistics = require("./statistics");

app.set('port', (process.env.PORT || 5000));


app.get('/', function(request, response) {
  var start = moment().startOf('week').format("YYYY-MM-DD");
  var end = moment().endOf('week').format("YYYY-MM-DD");

  if (request.query.start) {
    start = request.query.start;
  }

  if (request.query.end) {
    end = request.query.end;
  }

  var stats = new Statistics(process.env.API_URL, process.env.API_TOKEN, start, end);
  stats.get(function(byProject, byUser) {
    console.log("By project: %j", byProject);
    console.log("By user: %j", byUser);

    html = "<html>";

    html += "<body>";

    html += "<p>From: " + start + " to: " + end;

    html += "<table>";
    for (var key in byProject) {
      html += "<tr><td>" + key + "</td><td>" + byProject[key] + "</td></tr>";
    }
    html += "</table>";

    html += "<table>";
    for (var key in byUser) {
      html += "<tr><td>" + key + "</td><td>" + byUser[key] + "</td></tr>";
    }
    html += "</table>";

    html += "</body></html>";

    response.send(html);
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
