module = {
  set exports(fn) {
    module[fn.name] = fn;
  }
};
require = function(name) {
  name = name.replace(/Typed/, '');
  name = name.match(/\/(.*)\./)[1];
  return module[name];
};
