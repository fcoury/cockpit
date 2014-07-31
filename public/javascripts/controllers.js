function IndexCtrl($scope, $http, $q, $firebase) {
  var projects_request = $http.get('/api/projects');
  var entries_request = $http.get('/api/entries');
  var budgets_request = $http.get('/api/budgets');

  var budgetRef = new Firebase("https://gistia-cockpit.firebaseio.com/budget");
  var budgetSync = $firebase(budgetRef);

  var usersRef = new Firebase("https://gistia-cockpit.firebaseio.com/users");
  var usersSync = $firebase(usersRef);

  var syncObject = budgetSync.$asObject();
  syncObject.$bindTo($scope, "budget");

  $scope.users = usersSync.$asArray();
  $scope.newUser = {};
  $scope.usersTotal = 0;
  $scope.projectsTotal = 0;

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
      $scope.hoursByUser = {};

      _.each(entries, function(entry) {
        var id = entry.project_id;
        var project = _.find(projects, function(p) { return p.project_id == id; });

        if (!project.hours) {
          project.hours = 0
        }
        project.hours += parseFloat(entry.hours);
        $scope.projectsTotal += parseFloat(entry.hours);

        if (!$scope.hoursByUser[entry.staff_id]) {
          $scope.hoursByUser[entry.staff_id] = 0;
        }

        $scope.hoursByUser[entry.staff_id] += parseFloat(entry.hours);
        $scope.usersTotal += parseFloat(entry.hours);
      });

      _.each(projects, function(p) {
        p.budget = budgets[p.name];
      });

      $scope.projects = _.filter(projects, function(p) { return p.hours > 0; });
    }, function(error) {
      // TODO
    });

  $scope.edit = function(project) {
    project.editing = !!!project.editing;
  };

  $scope.addUser = function() {
    $scope.users.$add($scope.newUser);
  };
}
