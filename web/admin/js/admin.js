
angular.module('Qoollo.Trendets.Admin', ['ng', 'ngRoute', 'ngResource', 'ngAnimate'])

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

    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }])

    .service('RestClient', ['$resource', '$cacheFactory', function ($resource, $cacheFactory) {
        
        var cache = $cacheFactory('RestClient');

        function RestClient(resourceName, dependentResources, itemTransform) {
            
            var key = resourceName + (dependentResources || '[]') + (itemTransform || 'function () {}'),
                cached = cache.get(key);
            
            if (cached)
                return cached;
            else
                cache.put(key, this);

            var Resource = $resource('/api/' + resourceName + '/:id', { id: '@id' }, { update: { method: 'PUT' } }),
                self = this;

            if (dependentResources) {
                for (var i = 0; i < dependentResources.length; i++) {
                    var r = dependentResources[i];
                    if (this[r])
                        throw new Error('RestClient already have defined ' + r);
                    var childRest = new RestClient(r);
                    this[r] = childRest.items;
                    this[r].find = function (search) {
                        return this.filter(function (e) {
                            var match = true;
                            for (var f in search) {
                                match &= search[f] == e[f];
                            }
                            return match;
                        })
                    }.bind(this[r]);
                }
            }
            if (!(itemTransform instanceof Function))
                itemTransform = function (i) { return i };

            this.items = Resource.query();

            this.items.$promise.then(function (items) {
                for (var i = 0; i < items.length; i++) {
                    var index = self.items.indexOf(items[i]),
                        transformed = itemTransform(items[i]);
                    if (transformed)
                        self.items[index] = transformed;
                }
            });

            this.activeItem = null;
            this.toAdd = new Resource();
            this.toEdit = null;
            this.toDelete = null;

            var itemsInProgress = [];
            this.isInProgress = function (item) {
                return itemsInProgress.indexOf(item) !== -1;
            }
            function startProgress(item) {
                itemsInProgress.push(item);
            }
            function stopProgress(item) {
                itemsInProgress.splice(itemsInProgress.indexOf(item), 1);
            }

            var errors = [];
            this.getErrors = function (item) {
                var match = errors.filter(function (e) { return e.item === item })[0];
                if (!match) {
                    match = {
                        item: item,
                        errors: []
                    };
                    errors.push(match);
                }
                return match.errors;
            }
            this.removeError = function (item, error) {
                var itemErrors = self.getErrors(item),
                    index = itemErrors.indexOf(error);
                itemErrors.splice(index, 1);
            }
            function addError(item, error) {
                self.getErrors(item).push({
                    time: new Date(),
                    error: error
                });
            }

            this.selectItem = function (item) {
                self.activeItem = item;
            }
            this.isActive = function (item) {
                return self.activeItem === item;
            }
            this.addItem = function (item) {
                item.$save()
                    .then(function () {
                        var transformed = itemTransform(item);
                        self.items.push(transformed || item);
                        self.toAdd = new Resource();
                    }, function (res) {
                        addError(item, res.data);
                    })
                    .finally(function () {
                        stopProgress(item);
                    });
                startProgress(item);
            }
            this.editItem = function (item) {
                item.$update()
                    .then(function () {
                        var index = self.items.indexOf(item),
                            transformed = itemTransform(item);
                        if (transformed)
                            self.items[index] = transformed;
                    }, function (res) {
                        addError(item, res.data);
                    })
                    .finally(function () {
                        stopProgress(item);
                    });
                startProgress(item);
                self.toggleEditMode();
            }
            this.deleteItem = function (item) {
                item.$delete()
                    .then(function () {
                        self.items.splice(self.items.indexOf(item), 1);
                    }, function (res) {
                        addError(item, res.data.error || res.data);
                    })
                    .finally(function () {
                        stopProgress(item);
                    });
                self.toggleDeleteMode();
            }
            this.toggleEditMode = function (item) {
                if (self.isInEditMode())
                    self.toEdit = null;
                else if (item !== undefined)
                    self.toEdit = item;
                else
                    throw new Error('Specify item to enter edit mode.');
            }
            this.toggleDeleteMode = function (item) {
                if (self.isInDeleteMode())
                    self.toDelete = null;
                else if (item !== undefined)
                    self.toDelete = item;
                else
                    throw new Error('Specify item to enter delete mode.');
            }
            this.isInNormalMode = function () {
                return !self.isInEditMode() && !self.isInDeleteMode()
            }
            this.isInEditMode = function () {
                return self.toEdit !== null;
            }
            this.isInDeleteMode = function () {
                return self.toDelete !== null;
            }
        }

        return RestClient;
    }])

    .controller('ForecastsController', ['$scope', 'RestClient', function ($scope, RestClient) {
        $scope.rest = new RestClient('forecasts', ['people', 'citation-sources'], function (i) {
            i.occuranceDate = new Date(i.occuranceDate);
            i.targetDate = new Date(i.targetDate);
        });
    }])

    .controller('PeopleController', ['$scope', 'RestClient', function ($scope, RestClient) {
        $scope.rest = new RestClient('people');
    }])

    .controller('CitationSourcesController', ['$scope', 'RestClient', function ($scope, RestClient) {
        $scope.rest = new RestClient('citation-sources');
    }])

    .controller('QuotesController', ['$scope', 'RestClient', function ($scope, RestClient) {
        $scope.rest = new RestClient('quotes');
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
            .when('/admin/quotes', {
                title: 'Котировки',
                templateUrl: '/html/quotes.html',
                controller: 'QuotesController'
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