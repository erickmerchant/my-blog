/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://enderjs.com)
  * Build: ender build hircine kalas
  * Packages: ender-core@2.0.0 ender-commonjs@1.0.7 hircine@0.8.1 kalas@0.9.1
  * =============================================================
  */

(function () {

  /*!
    * Ender: open module JavaScript framework (client-lib)
    * http://enderjs.com
    * License MIT
    */
  
  /**
   * @constructor
   * @param  {*=}      item      selector|node|collection|callback|anything
   * @param  {Object=} root      node(s) from which to base selector queries
   */
  function Ender(item, root) {
    var i
    this.length = 0 // Ensure that instance owns length
  
    if (typeof item == 'string')
      // start with strings so the result parlays into the other checks
      // the .selector prop only applies to strings
      item = ender._select(this['selector'] = item, root)
  
    if (null == item) return this // Do not wrap null|undefined
  
    if (typeof item == 'function') ender._closure(item, root)
  
    // DOM node | scalar | not array-like
    else if (typeof item != 'object' || item.nodeType || (i = item.length) !== +i || item == item.window)
      this[this.length++] = item
  
    // array-like - bitwise ensures integer length
    else for (this.length = i = (i > 0 ? ~~i : 0); i--;)
      this[i] = item[i]
  }
  
  /**
   * @param  {*=}      item   selector|node|collection|callback|anything
   * @param  {Object=} root   node(s) from which to base selector queries
   * @return {Ender}
   */
  function ender(item, root) {
    return new Ender(item, root)
  }
  
  
  /**
   * @expose
   * sync the prototypes for jQuery compatibility
   */
  ender.fn = ender.prototype = Ender.prototype
  
  /**
   * @enum {number}  protects local symbols from being overwritten
   */
  ender._reserved = {
    reserved: 1,
    ender: 1,
    expose: 1,
    noConflict: 1,
    fn: 1
  }
  
  /**
   * @expose
   * handy reference to self
   */
  Ender.prototype.$ = ender
  
  /**
   * @expose
   * make webkit dev tools pretty-print ender instances like arrays
   */
  Ender.prototype.splice = function () { throw new Error('Not implemented') }
  
  /**
   * @expose
   * @param   {function(*, number, Ender)}  fn
   * @param   {object=}                     scope
   * @return  {Ender}
   */
  Ender.prototype.forEach = function (fn, scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }
  
  /**
   * @expose
   * @param {object|function} o
   * @param {boolean=}        chain
   */
  ender.ender = function (o, chain) {
    var o2 = chain ? Ender.prototype : ender
    for (var k in o) !(k in ender._reserved) && (o2[k] = o[k])
    return o2
  }
  
  /**
   * @expose
   * @param {string}  s
   * @param {Node=}   r
   */
  ender._select = function (s, r) {
    return s ? (r || document).querySelectorAll(s) : []
  }
  
  /**
   * @expose
   * @param {function} fn
   */
  ender._closure = function (fn) {
    fn.call(document, ender)
  }
  
  if (typeof module !== 'undefined' && module['exports']) module['exports'] = ender
  var $ = ender
  
  /**
   * @expose
   * @param {string} name
   * @param {*}      value
   */
  ender.expose = function (name, value) {
    ender.expose.old[name] = window[name]
    window[name] = value
  }
  
  /**
   * @expose
   */
  ender.expose.old = {}
  
  /**
   * @expose
   * @param {boolean} all   restore only $ or all ender globals
   */
  ender.noConflict = function (all) {
    window['$'] = ender.expose.old['$']
    if (all) for (var k in ender.expose.old) window[k] = ender.expose.old[k]
    return this
  }
  
  ender.expose('$', ender)
  ender.expose('ender', ender); // uglify needs this semi-colon between concating files
  
  /*!
    * Ender: open module JavaScript framework (module-lib)
    * http://enderjs.com
    * License MIT
    */
  
  var global = this
  
  /**
   * @param  {string}  id   module id to load
   * @return {object}
   */
  function require(id) {
    if ('$' + id in require._cache)
      return require._cache['$' + id]
    if ('$' + id in require._modules)
      return (require._cache['$' + id] = require._modules['$' + id]._load())
    if (id in window)
      return window[id]
  
    throw new Error('Requested module "' + id + '" has not been defined.')
  }
  
  /**
   * @param  {string}  id       module id to provide to require calls
   * @param  {object}  exports  the exports object to be returned
   */
  function provide(id, exports) {
    return (require._cache['$' + id] = exports)
  }
  
  /**
   * @expose
   * @dict
   */
  require._cache = {}
  
  /**
   * @expose
   * @dict
   */
  require._modules = {}
  
  /**
   * @constructor
   * @param  {string}                                          id   module id for this module
   * @param  {function(Module, object, function(id), object)}  fn   module definition
   */
  function Module(id, fn) {
    this.id = id
    this.fn = fn
    require._modules['$' + id] = this
  }
  
  /**
   * @expose
   * @param  {string}  id   module id to load from the local module context
   * @return {object}
   */
  Module.prototype.require = function (id) {
    var parts, i
  
    if (id.charAt(0) == '.') {
      parts = (this.id.replace(/\/.*?$/, '/') + id.replace(/\.js$/, '')).split('/')
  
      while (~(i = parts.indexOf('.')))
        parts.splice(i, 1)
  
      while ((i = parts.lastIndexOf('..')) > 0)
        parts.splice(i - 1, 2)
  
      id = parts.join('/')
    }
  
    return require(id)
  }
  
  /**
   * @expose
   * @return {object}
   */
  Module.prototype._load = function () {
    var m = this
  
    if (!m._loaded) {
      m._loaded = true
  
      /**
       * @expose
       */
      m.exports = {}
      m.fn.call(global, m, m.exports, function (id) { return m.require(id) }, global)
    }
  
    return m.exports
  }
  
  /**
   * @expose
   * @param  {string}                     id        main module id
   * @param  {Object.<string, function>}  modules   mapping of module ids to definitions
   * @param  {string}                     main      the id of the main module
   */
  Module.createPackage = function (id, modules, main) {
    var path, m
  
    for (path in modules) {
      new Module(id + '/' + path, modules[path])
      if (m = path.match(/^(.+)\/index$/)) new Module(id + '/' + m[1], modules[path])
    }
  
    if (main) require._modules['$' + id] = require._modules['$' + id + '/' + main]
  }
  
  if (ender && ender.expose) {
    /*global global,require,provide,Module */
    ender.expose('global', global)
    ender.expose('require', require)
    ender.expose('provide', provide)
    ender.expose('Module', Module)
  }
  
  Module.createPackage('hircine', {
    'dist/hircine': function (module, exports, require, global) {
      !function(a,b,c){"undefined"!=typeof module&&module.exports?module.exports=c():"function"==typeof define&&define.amd?define(c):b[a]=c()}("hircine",this,function(){function a(a,b){var d;return a=1===a.nodeType?a.ownerDocument:a,d=a.getElementById(b),c(d)&&d.parentNode&&d.id===b?[d]:[]}function b(a){return"undefined"==typeof a?g:c(a)?a:"string"==typeof a?f(a):g}function c(a){return a&&(1===a.nodeType||9===a.nodeType)}function d(a){return a&&"object"==typeof a&&"number"==typeof a.length}function e(a){var b=[];return h.forEach.call(a,function(a){-1===b.indexOf(a)&&b.push(a)}),b}function f(g,h){var j,k;if(c(g)||g===g.window)return[g];if(d(g))return g;if(h=b(h),d(h))return k=[],[].forEach.call(h,function(a){k=k.concat(f(g,a))}),k;if("string"!=typeof g||!c(h))return[];if(j=i.exec(g)){if(j[1])return e(a(h,j[1]));if(j[2])return e(h.getElementsByClassName(j[2]));if(j[3])return e(h.getElementsByTagName(j[3]))}return e(h.querySelectorAll(g))}var g=this.document,h=[],i=/^(?:\w*\#([\w\-]+)|\.([\w\-]+)|(\w+))$/;return f});
    },
    'src/ender': function (module, exports, require, global) {
      (function($){
        var
        hircine = require("hircine");
      
        $._select = hircine;
      
        $.ender({
          children: function(selector) {
            return $(selector || "*", this);
          },
          find: function(selector) {
            return $(selector, this);
          }
        }, true);
      }(ender));
    }
  }, 'dist/hircine');

  Module.createPackage('kalas', {
    'dist/kalas': function (module, exports, require, global) {
      !function(a,b,c){"undefined"!=typeof module&&module.exports?module.exports=c():"function"==typeof define&&define.amd?define(c):b[a]=c()}("kalas",this,function(){var a,b=this.document;return a={off:function(a,b,c,d){a.removeEventListener(b,c,d||!1)},on:function(a,b,c,d){a.addEventListener(b,c,d||!1)},ready:function(a,c){b.addEventListener("DOMContentLoaded",a,c||!1)},trigger:function(a,c){var d;d=b.createEvent("Event"),d.initEvent(c,!0,!0),a.dispatchEvent(d)}}});
    },
    'src/ender': function (module, exports, require, global) {
      (function($){
        var
        kalas = require("kalas");
      
        $.ender({
          off: function(type, fn) {
            return this.forEach(function(node) {
              kalas.off(node, type, fn);
            });
          },
          on: function(type, fn, off) { // if off is true, the event can be removed.
            return this.forEach(function(node, index, obj) {
              kalas.on(node, type, off ? fn : function(event) {
                fn.call(node, event, node, index, obj);
              });
            });
          },
          trigger: function(name) {
            return this.forEach(function(node) {
              kalas.trigger(node, name);
            });
          }
        }, true);
      
        $.ender({
          ready: kalas.ready
        });
      }(ender));
    }
  }, 'dist/kalas');

  require('hircine');
  require('hircine/src/ender');
  require('kalas');
  require('kalas/src/ender');

}.call(window));
//# sourceMappingURL=ender.js.map
