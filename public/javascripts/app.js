angular.module('cockpit', ['ngRoute', 'firebase']).
  config(function($routeProvider, $locationProvider) {
    console.log('here');
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index',
        controller: IndexCtrl
      }).
      otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
