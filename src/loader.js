/* jshint globalstrict: true */
'use strict';

function setupModuleLoader (window) {
  var ensure = function (obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  };

  var angular = ensure(window, 'angular', Object);

  var createModule = function (name, requires, modules, configFn) {
    if (name === 'hasOwnProperty') {
      throw 'hasOwnProperty is not a valid module name';
    }

    var invokeLater = function (service, method, arrayMethod, queue) {
      return function () {
        queue = queue || '_invokeQueue';
        var item = [service, method, arguments];
        moduleInstance[queue][arrayMethod || 'push'](item);
        return moduleInstance;
      };
    };

    var moduleInstance = {
      name: name,
      requires: requires,
      constant: invokeLater('$provide', 'constant', 'unshift'),
      provider: invokeLater('$provide', 'provider'),
      factory: invokeLater('$provide', 'factory'),
      value: invokeLater('$provide', 'value'),
      service: invokeLater('$provide', 'service'),
      directive: invokeLater('$compileProvider', 'directive'),
      controller: invokeLater('$controllerProvider', 'register'),
      config: invokeLater('$injector', 'invoke', 'push', '_configBlocks'),
      run: function (fn) {
        moduleInstance._runBlocks.push(fn);
        return moduleInstance;
      },
      _invokeQueue: [],
      _configBlocks: [],
      _runBlocks: []
    };

    if (configFn) {
      moduleInstance.config(configFn);
    }

    modules[name] = moduleInstance;
    return moduleInstance;
  };

  var getModule = function (name, modules) {
    if (modules.hasOwnProperty(name)) {
      return modules[name];
    } else {
      throw 'Module ' + name + ' is not available!';
    }
  };

  ensure(angular, 'module', function () {
    var modules = {};
    return function (name, requires, configFn) {
      if (requires) {
        return createModule(name, requires, modules, configFn);
      } else {
        return getModule(name, modules);
      }
    };
  });
}
