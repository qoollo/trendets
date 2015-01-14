
angular.module('Qoollo.Trendets.Admin', ['ng', 'ngRoute', 'ngResource'])

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

    .service('CitationSource', ['$resource', '$q', function ($resource, $q) {
        return $resource('/api/citation-sources');
    }])

    .controller('ForecastsController', ['$scope', function ($scope) {
    }])

    .controller('PeopleController', ['$scope', function ($scope) {
    }])

    .controller('CitationSourcesController', ['$scope', 'CitationSource', function ($scope, CitationSource) {

        $scope.citationSources = CitationSource.query();
        $scope.activeItem = null;
        $scope.newItem = new CitationSource();

        $scope.selectItem = function (item) {
            $scope.activeItem = item;
        }
        $scope.isActive = function (item) {
            return $scope.activeItem === item;
        }
        $scope.addItem = function (item) {
            item.$save();
            $scope.citationSources.push(item);
            $scope.newItem = new CitationSource();
        }

    }])

    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/admin/forecasts', {
                title: 'Прогнозы',
                templateUrl: '/html/forecasts.html',
                controller: 'ForecastsController'
            })
            .when('/admin/people', {
                title: 'Люди',
                templateUrl: '/html/people.html',
                controller: 'PeopleController'
            })
            .when('/admin/citation-sources', {
                title: 'Источники',
                templateUrl: '/html/citation-sources.html',
                controller: 'CitationSourcesController'
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