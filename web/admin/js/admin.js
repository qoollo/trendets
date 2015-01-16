
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

    .service('CitationSource', ['$resource', '$q', function ($resource, $q) {
        return $resource('/api/citation-sources/:id', { id: '@id' },
            {
                update: { method: 'PUT' }
            });
    }])

    .service('RestClient', ['$resource', function ($resource) {

        function RestClient(resourceName) {

            var Resource = $resource('/api/' + resourceName + '/:id', { id: '@id' }, { update: { method: 'PUT' } }),
                self = this;

            this.items = Resource.query();
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
                        self.items.push(item);
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
                    .catch(function (res) {
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

    .controller('ForecastsController', ['$scope', function ($scope) {
    }])

    .controller('PeopleController', ['$scope', 'RestClient', function ($scope, RestClient) {

        $scope.rest = new RestClient('people')
    }])

    .controller('CitationSourcesController', ['$scope', 'CitationSource', function ($scope, CitationSource) {

        $scope.citationSources = CitationSource.query();
        $scope.activeItem = null;
        $scope.toAdd = new CitationSource();
        $scope.toEdit = null;
        $scope.toDelete = null;

        var itemsInProgress = [];
        $scope.isInProgress = function (item) {
            return itemsInProgress.indexOf(item) !== -1;
        }
        function startProgress(item) {
            itemsInProgress.push(item);
        }
        function stopProgress(item) {
            itemsInProgress.splice(itemsInProgress.indexOf(item), 1);
        }

        var errors = [];
        $scope.getErrors = function (item) {
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
        $scope.removeError = function (item, error) {
            var itemErrors = $scope.getErrors(item),
                index = itemErrors.indexOf(error);
            itemErrors.splice(index, 1);
        }
        function addError(item, error) {
            $scope.getErrors(item).push({
                time: new Date(),
                error: error
            });
        }

        $scope.selectItem = function (item) {
            $scope.activeItem = item;
        }
        $scope.isActive = function (item) {
            return $scope.activeItem === item;
        }
        $scope.addItem = function (item) {
            item.$save()
                .then(function () {
                    $scope.citationSources.push(item);
                    $scope.toAdd = new CitationSource();
                }, function (res) {
                    addError(item, res.data);
                })
                .finally(function () {
                    stopProgress(item);
                });
            startProgress(item);
        }
        $scope.editItem = function (item) {
            item.$update()
                .catch(function (res) {
                    addError(item, res.data);
                })
                .finally(function () {
                    stopProgress(item);
                });
            startProgress(item);
            $scope.toggleEditMode();
        }
        $scope.deleteItem = function (item) {
            item.$delete()
                .then(function () {
                    $scope.citationSources.splice($scope.citationSources.indexOf(item), 1);
                }, function (res) {
                    addError(item, res.data.error || res.data);
                })
                .finally(function () {
                    stopProgress(item);
                });
            $scope.toggleDeleteMode();
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