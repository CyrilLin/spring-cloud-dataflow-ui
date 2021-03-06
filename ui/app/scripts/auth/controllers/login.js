/*
 * Copyright 2014-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Handles user logins.
 *
 * @author Gunnar Hillert
 * @author Alex Boyko
 */

define([], function () {
  'use strict';
  return ['$scope', '$state', 'userService', 'DataflowUtils', '$log', '$rootScope', '$http',
          function ($scope, $state, user, utils, $log, $rootScope, $http) {
          $scope.loginForm = {};
          $scope.login = function() {
            $log.info('Logging in user:', $scope.loginForm.username);
            var authenticationPromise = $http.post($rootScope.dataflowServerUrl + '/authenticate', $scope.loginForm);
            utils.addBusyPromise(authenticationPromise);
            authenticationPromise.then(
              function(response) {
                $rootScope.user.username = $scope.loginForm.username;
                $rootScope.user.isAuthenticated = true;
                $rootScope.user.isFormLogin = true;
                $http.defaults.headers.common[$rootScope.xAuthTokenHeaderName] = response.data;

                var securityInfoUrl = '/security/info';
                var timeout = 20000;
                var promiseHttp = $http.get(securityInfoUrl, {timeout: timeout});
                utils.growl.success('User ' + $scope.loginForm.username + ' logged in.');
                $scope.loginForm = {};

                promiseHttp.then(function(response) {
                  console.log('Security info retrieved ...', response.data);
                  $rootScope.user.roles = response.data.roles;
                  $state.go('home.apps.tabs.appsList');
                }, function(errorResponse) {
                  var errorMessage = 'Error retrieving security info from ' + securityInfoUrl + ' (timeout: ' + timeout + 'ms)';
                  console.log(errorMessage, errorResponse);
                  $('.splash .container').html(errorMessage);
                });
              },
              function(response) {
                utils.growl.error(response.data[0].message);
              }
            );
          };
          $scope.logout = function() {
            $state.go('logout');
          };
        }];
});
