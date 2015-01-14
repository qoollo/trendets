
angular.module('Qoollo.Trendets.Admin', ['ng', 'ngRoute'])

    .controller('NavbarController', ['$scope', '$location', '$route', function ($scope, $location, $route) {
        
        $scope.links = [];

        for (var f in $route.routes) {
            if (angular.isDefined($route.routes[f].title))
                $scope.links.push({
                    title: $route.routes[f].title,
                    url: $route.routes[f].originalPath
                });
        }

        $scope.isActive = function (link) {
            return $location.$$url == link.url;
        }

    }])

    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/admin/forecasts', {
                title: 'Прогнозы',
                templateUrl: '/html/forecasts.html'
            })
            .when('/admin/people', {
                title: 'Люди',
                templateUrl: '/html/people.html'
            })
            .when('/admin/citation-sources', {
                title: 'Источники',
                templateUrl: '/html/citation-sources.html'
            })
            .otherwise({
                redirectTo: '/admin/forecasts'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }])

    .run();