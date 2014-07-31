"use strict";
var FreshBooks = require('freshbooks');

function Statistics(api_url, api_token, start, end) {
  this.staff = {
    '3': 'Felipe',
    '21': 'Douglas'
  }

  this.freshbooks = new FreshBooks(api_url, api_token)
  this.start = start;
  this.end = end;
}

Statistics.prototype.get = function(callback) {
  this.callback = callback;
  this.getProjectsHash(this.summarizeEntries.bind(this), this.printStats.bind(this));
};

Statistics.prototype.printStats = function() {
  if (this.callback) {
    this.callback(this.hoursByProject, this.hoursByUser)
  };
};

Statistics.prototype.getProjectsHash = function(callback, args) {
  var project = new this.freshbooks.Project();
  var that = this;
  project.list(function(err, projects, options) {
    if (err) {
      console.log(err);
    }
    else {
      that.projectHash = {};
      projects.forEach(function(project) {
        that.projectHash[project.project_id] = project.name;
      });
      callback(args);
    }
  });
};

Statistics.prototype.fetch = function(type, params, callback, errCallback) {
  var entity = new this.freshbooks[type]();
  entity.list(params, function(err, items, options) {
    if (err) {
      console.log(err);
      errCallback(err);
    }
    else {
      callback(items);
    }
  });
};

Statistics.prototype.getEntries = function(callback, errCallback) {
  this.fetch('Time_Entry', {date_from: this.start, date_to: this.end}, callback, errCallback);
};

Statistics.prototype.getProjects = function(callback, errCallback) {
  this.fetch('Project', {}, callback, errCallback);
};

Statistics.prototype.summarizeEntries = function(callback) {
  console.log("From: " + this.start + " to " + this.end);
  var that = this;

  var timeEntry = new this.freshbooks.Time_Entry();
  timeEntry.list({date_from: this.start, date_to: this.end}, function(err, time_entries, options) {
    if (err) {
      console.log(err);
    }
    else {
      that.hoursByProject = {};
      that.hoursByUser = {};

      time_entries.forEach(function(entry) {
        var project = that.projectHash[entry.project_id];
        var user = that.staff[entry.staff_id];

        if (!that.hoursByProject[project]) {
          that.hoursByProject[project] = 0;
        }
        if (!that.hoursByUser[user]) {
          that.hoursByUser[user] = 0;
        }

        that.hoursByProject[project] += parseFloat(entry.hours);
        that.hoursByUser[user] += parseFloat(entry.hours);
      });

      callback();
    }
  });
};

module.exports = Statistics;

