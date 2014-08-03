function bindObject($firebase, scope, bind_name, scope_var_name) {
  var ref = new Firebase("https://gistia-cockpit.firebaseio.com/" + bind_name);
  var sync = $firebase(ref);
  var syncObject = sync.$asObject();

  if (!scope_var_name) {
    scope_var_name = bind_name;
  }

  console.log('binding', bind_name, 'to', scope_var_name);
  syncObject.$bindTo(scope, scope_var_name);
  return syncObject;
}

function IndexCtrl($scope, $http, $q, $firebase) {
  $scope.date = {
    start: moment().startOf('week').format("YYYY-MM-DD"),
    end: moment().endOf('week').format("YYYY-MM-DD")
  };

  $scope.changeDate = function() {
    if ($scope.date.period) {
      if ($scope.date.period === 'Last week') {
        var today = moment();
        var daysToLastMonday = 0 - (1 - today.isoWeekday()) + 7;

        var lastMonday = today.subtract('days', daysToLastMonday);
        var lastSunday = moment(lastMonday);
        lastSunday.add('days', 6);

        $scope.date.start = lastMonday.format("YYYY-MM-DD");
        $scope.date.end = lastSunday.format("YYYY-MM-DD");
      }
      else if ($scope.date.period === 'Last week') {
        $scope.date.start = moment().startOf('month').format("YYYY-MM-DD");
        $scope.date.end = moment().endOf('month').format("YYYY-MM-DD");
      }
    }

    $scope.getEntries();
  }

  $scope.sync = function() {
    var usersRef = new Firebase("https://gistia-cockpit.firebaseio.com/users");
    var usersSync = $firebase(usersRef);
    $scope.users = usersSync.$asArray();

    var budgetReq = bindObject($firebase, $scope, "budget").$loaded();
    var projectReq = bindObject($firebase, $scope, "projects", "projectInfo").$loaded();
    var usersReq = $scope.users.$loaded();

    $q.all([budgetReq, projectReq, usersReq]).then(function(results) {
      console.log('loaded', results);
      return results[0];
    }).then(function(data) {
      console.log('initialized', data);
      console.log('projectInfo', $scope.projectInfo);

      $scope.userInfo = {};

      for (var i = 0; i < $scope.users.length; i++) {
        var user = $scope.users[i];
        $scope.userInfo[user.freshbooks_id] = {
          name: user.name,
          rate: user.rate
        }
      }

      $scope.getEntries();
    });

  }

  $scope.getEntries = function() {
    var projects_request = $http.get('/api/projects');
    var entries_request = $http.get('/api/entries?start=' + $scope.date.start + '&end=' + $scope.date.end);
    var budgets_request = $http.get('/api/budgets');

    $scope.newUser = {};
    $scope.projectData = {};
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

        _.each(projects, function(p) {
          p.gross_revenue = 0;
          p.cost = 0;
          p.net_revenue = 0;
        });

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
          if (!$scope.projectData[project.name]) {
            $scope.projectData[project.name] = {
              gross_revenue: 0,
              cost: 0,
              net_revenue: 0
            };
          }

          var userInfo = $scope.userInfo[entry.staff_id];
          var projectInfo = $scope.projectInfo[project.name];
          var projectData = $scope.projectData[project.name];
          if (userInfo) {
            var rate = $scope.userInfo[entry.staff_id].rate;
          }
          else {
            console.log("Don't know who user", entry.staff_id, "is for entry", entry);
            var rate = 0;
          }

          console.log('projectInfo for', project.name, '=', projectInfo);

          if (projectInfo) {
            var gross = entry.hours * projectInfo.rate;
            var cost  = entry.hours * rate;
            var net   = gross - cost;

            project.rate = projectInfo.rate;
            project.gross_revenue += gross;
            project.cost += cost;
            project.net_revenue += net;
          }

          $scope.usersTotal += parseFloat(entry.hours);
        });

        _.each(projects, function(p) {
          p.budget = budgets[p.name];
        });

        $scope.totalGrossRevenue = 0;
        $scope.totalCost = 0;
        $scope.totalNetRevenue = 0;

        _.each(projects, function(p) {
          $scope.totalGrossRevenue += p.gross_revenue;
          $scope.totalCost += p.cost;
          $scope.totalNetRevenue += p.net_revenue;
        });

        $scope.projects = _.filter(projects, function(p) { return p.hours > 0; });
      }, function(error) {
        // TODO
      });
  };

  $scope.edit = function(project) {
    project.editing = !!!project.editing;
  };

  $scope.addUser = function() {
    $scope.users.$add($scope.newUser);
  };

  $scope.sync();
}
