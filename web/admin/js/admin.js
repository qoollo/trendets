
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
        $scope.toAdd = new CitationSource();
        $scope.toEdit = null;
        $scope.toDelete = null;

        $scope.selectItem = function (item) {
            $scope.activeItem = item;
        }
        $scope.isActive = function (item) {
            return $scope.activeItem === item;
        }
        $scope.addItem = function (item) {
            item.$save();
            $scope.citationSources.push(item);
            $scope.toAdd = new CitationSource();
        }
        $scope.editItem = function (item) {
            item.$save();
            $scope.toggleEditMode();
        }
        $scope.toggleEditMode = function (item) {
            if ($scope.isInEditMode())
                $scope.toEdit = null;
            else if (item !== undefined)
                $scope.toEdit = item;
            else
                throw new Error('Specify item to enter edit mode.');
        }
        $scope.toggleDeleteMode = function (item) {
            if ($scope.isInDeleteMode())
                $scope.toDelete = null;
            else if (item !== undefined)
                $scope.toDelete = item;
            else
                throw new Error('Specify item to enter delete mode.');
        }
        $scope.isInNormalMode = function () {
            return !$scope.isInEditMode() && !$scope.isInDeleteMode()
        }
        $scope.isInEditMode = function () {
            return $scope.toEdit !== null;
        }
        $scope.isInDeleteMode = function () {
            return $scope.toDelete !== null;
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