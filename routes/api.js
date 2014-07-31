var moment = require('moment');
var express = require('express');
var router = express.Router();
var Statistics = require('../services/statistics');

router.get('/entries', function(req, res) {
  var start = moment().startOf('week').format("YYYY-MM-DD");
  var end = moment().endOf('week').format("YYYY-MM-DD");

  var stats = new Statistics(process.env.API_URL, process.env.API_TOKEN, start, end);
  stats.getEntries(function(entries) {
    res.send(JSON.stringify({entries: entries}));
  });
});

router.get('/projects', function(req, res) {
  var start = moment().startOf('week').format("YYYY-MM-DD");
  var end = moment().endOf('week').format("YYYY-MM-DD");
  var stats = new Statistics(process.env.API_URL, process.env.API_TOKEN, start, end);

  stats.getProjects(function(entries) {
    res.send(JSON.stringify({projects: entries}));
  });
});

router.get('/budgets', function(req, res) {
  var budgets = {
    'Planscope': 20,
    'Ridley Router Chrome Extension': 25
  };

  res.send(JSON.stringify({budgets: budgets}));
});

module.exports = router;
