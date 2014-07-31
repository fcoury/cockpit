function IndexCtrl($scope, $http, $q) {
  var projects_request = $http.get('/api/projects');
  var entries_request = $http.get('/api/entries');
  var budgets_request = $http.get('/api/budgets');

  $q.all([projects_request, entries_request, budgets_request])
    .then(function(results) {
      var data = {
        projects: results[0].data.projects,
        entries: results[1].data.entries,
        budgets: results[2].data.budgets,
      };
      return data;
    }).then(function(data) {
      var projects = data.projects;
      var entries = data.entries;
      var budgets = data.budgets;

      _.each(entries, function(entry) {
        var id = entry.project_id;
        var project = _.find(projects, function(p) { return p.project_id == id; });

        if (!project.hours) {
          project.hours = 0
        }
        project.hours += parseFloat(entry.hours);
      });

      _.each(projects, function(p) {
        p.budget = budgets[p.name];
      });

      $scope.projects = _.filter(projects, function(p) { return p.hours > 0; });
    }, function(error) {
      // TODO
    });
}
