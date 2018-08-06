/*!
 * abo-utils v0.1.0
 * https://github.com/Sphinxxxx/abo-utils
 *
 * Copyright 2018 Andreas Borgen
 * Released under the MIT license.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.ABOUtils = {})));
}(this, (function (exports) { 'use strict';

  Array.from = Array.from || function (list) {
    return Array.prototype.slice.call(list);
  };

  Math.trunc = Math.trunc || function (x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };

  var utilsPolys = Object.freeze({

  });

  function calcAngle(p0, p1, p2) {

      function squared(a) {
          return a * a;
      }

      var a = squared(p1[0] - p0[0]) + squared(p1[1] - p0[1]),
          b = squared(p1[0] - p2[0]) + squared(p1[1] - p2[1]),
          c = squared(p2[0] - p0[0]) + squared(p2[1] - p0[1]);

      var angle = Math.acos((a + b - c) / Math.sqrt(4 * a * b));
      return angle;
  }

  function calcIncircle(A, B, C) {
      function lineLen(p1, p2) {
          var dx = p2[0] - p1[0],
              dy = p2[1] - p1[1];
          return Math.sqrt(dx * dx + dy * dy);
      }

      var a = lineLen(B, C),
          b = lineLen(C, A),
          c = lineLen(A, B),
          p = a + b + c,
          s = p / 2;

      var area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

      var r = area / s,
          cx = (a * A[0] + b * B[0] + c * C[0]) / p,
          cy = (a * A[1] + b * B[1] + c * C[1]) / p;
      return {
          r: r,
          c: [cx, cy]
      };
  }

  function expandTriangle(A, B, C, amount) {
      var incircle = calcIncircle(A, B, C),
          c = incircle.c,
          factor = (incircle.r + amount) / incircle.r;

      function extendPoint(p) {
          var dx = p[0] - c[0],
              dy = p[1] - c[1],
              x2 = dx * factor + c[0],
              y2 = dy * factor + c[1];
          return [x2, y2];
      }

      var A2 = extendPoint(A),
          B2 = extendPoint(B),
          C2 = extendPoint(C);
      return [A2, B2, C2];
  }

  var utilsGeom = Object.freeze({
    calcAngle: calcAngle,
    calcIncircle: calcIncircle,
    expandTriangle: expandTriangle
  });

  function $$(selector, context) {
      context = context || document;
      var elements = context.querySelectorAll(selector);
      return Array.from(elements);
  }
  function $$1(selector, context) {
      context = context || document;
      var element = context.querySelector(selector);
      return element;
  }

  function createElement(tag, parent, attributes) {
      var tagInfo = tag.split(/([#\.])/);
      if (tagInfo.length > 1) {
          tag = tagInfo[0] || 'div';

          attributes = attributes || {};
          for (var i = 1; i < tagInfo.length - 1; i++) {
              var key = tagInfo[i],
                  val = tagInfo[i + 1];

              if (key === '#') {
                  attributes.id = val;
              } else {
                  attributes.class = attributes.class ? attributes.class + ' ' + val : val;
              }
              i++;
          }
      }

      var element = parent
      ? document.createElementNS(parent.namespaceURI, tag) : document.createElement(tag);

      if (attributes) {
          for (var _key in attributes) {
              element.setAttribute(_key, attributes[_key]);
          }
      }

      if (parent) {
          parent.appendChild(element);
      }
      return element;
  }

  function relativeMousePos(mouseEvent, element, stayWithin) {
      function respectBounds(value, min, max) {
          return Math.max(min, Math.min(value, max));
      }

      var elmBounds = element.getBoundingClientRect();
      var x = mouseEvent.clientX - elmBounds.left,
          y = mouseEvent.clientY - elmBounds.top;

      if (stayWithin) {
          x = respectBounds(x, 0, elmBounds.width);
          y = respectBounds(y, 0, elmBounds.height);
      }

      return [x, y];
  }

  function live(eventType, elementQuerySelector, callback) {
      document.addEventListener(eventType, function (e) {

          var qs = $$(elementQuerySelector);
          if (qs && qs.length) {

              var el = e.target,
                  index = -1;
              while (el && (index = qs.indexOf(el)) === -1) {
                  el = el.parentElement;
              }

              if (index > -1) {
                  callback.call(el, e);
              }
          }
      });
  }

  var utilsDom = Object.freeze({
    $$: $$,
    $$1: $$1,
    createElement: createElement,
    relativeMousePos: relativeMousePos,
    live: live
  });

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function drawImageTriangle(img, ctx, s1, s2, s3, d1, d2, d3) {

      function linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3) {
          var a = ((t2 - t3) * (s1 - s2) - (t1 - t2) * (s2 - s3)) / ((r2 - r3) * (s1 - s2) - (r1 - r2) * (s2 - s3));
          var b = ((t2 - t3) * (r1 - r2) - (t1 - t2) * (r2 - r3)) / ((s2 - s3) * (r1 - r2) - (s1 - s2) * (r2 - r3));
          var c = t1 - r1 * a - s1 * b;

          return [a, b, c];
      }

      var xm = linearSolution(s1[0], s1[1], d1[0], s2[0], s2[1], d2[0], s3[0], s3[1], d3[0]),
          ym = linearSolution(s1[0], s1[1], d1[1], s2[0], s2[1], d2[1], s3[0], s3[1], d3[1]);

      ctx.save();

      ctx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
      ctx.beginPath();
      ctx.moveTo(s1[0], s1[1]);
      ctx.lineTo(s2[0], s2[1]);
      ctx.lineTo(s3[0], s3[1]);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.width, img.height);

      ctx.restore();

      var incircle = calcIncircle(d1, d2, d3),
          c = incircle.c;
      ctx.beginPath();
      ctx.arc(c[0], c[1], incircle.r, 0, 2 * Math.PI, false);
      ctx.moveTo(d1[0], d1[1]);
      ctx.lineTo(d2[0], d2[1]);
      ctx.lineTo(d3[0], d3[1]);
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,0,0, .4)';
      ctx.stroke();
  }


  var CanvasPixelBuffer = function () {
      function CanvasPixelBuffer(canvas, w, h) {
          classCallCheck(this, CanvasPixelBuffer);

          this.w = canvas.width = w || canvas.width;
          this.h = canvas.height = h || canvas.height;
          this.targetContext = canvas.getContext('2d');
          this.targetData = this.targetContext.getImageData(0, 0, this.w, this.h);
      }



      createClass(CanvasPixelBuffer, [{
          key: 'setPixel',
          value: function setPixel(x, y, rgb) {
              var index = (y * this.w + x) * 4,
              data = this.targetData.data;

              data[index] = rgb[0]; 
              data[index + 1] = rgb[1]; 
              data[index + 2] = rgb[2]; 
              data[index + 3] = rgb.length > 3 ? rgb[3] : 255; 
          }
      }, {
          key: 'render',
          value: function render() {
              this.targetContext.putImageData(this.targetData, 0, 0);
          }
      }]);
      return CanvasPixelBuffer;
  }();

  var utilsCanvas = Object.freeze({
    drawImageTriangle: drawImageTriangle,
    CanvasPixelBuffer: CanvasPixelBuffer
  });


  var segLengths = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
      segSearch = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

  function parsePath(path) {

      function parseValues(args) {
          args = args.replace(/(\.\d+)(?=\.)/g, '$1 ');

          args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig);
          return args ? args.map(Number) : [];
      }

      var data = [];
      path.replace(segSearch, function (_, command, args) {
          var type = command.toLowerCase();
          args = parseValues(args);

          if (type === 'm' && args.length > 2) {
              data.push([command].concat(args.splice(0, 2)));
              type = 'l';
              command = command === 'm' ? 'l' : 'L';
          }

          while (true) {
              if (args.length === segLengths[type]) {
                  args.unshift(command);
                  return data.push(args);
              }
              if (args.length < segLengths[type]) {
                  throw new Error('Malformed path data: ' + [command, args]);
              }

              data.push([command].concat(args.splice(0, segLengths[type])));
          }
      });

      return data;
  }

  function absolutizePath(path) {
      var startX = 0;
      var startY = 0;
      var x = 0;
      var y = 0;

      return path.map(function (seg) {
          seg = seg.slice();
          var type = seg[0];
          var command = type.toUpperCase();

          seg.startPoint = { x: x, y: y };

          if (type !== command) {
              seg[0] = command;
              switch (type) {

                  case 'a':
                      seg[6] += x;
                      seg[7] += y;
                      break;

                  case 'v':
                      seg[1] += y;
                      break;

                  case 'h':
                      seg[1] += x;
                      break;

                  default:
                      for (var i = 1; i < seg.length;) {
                          seg[i++] += x;
                          seg[i++] += y;
                      }
                      break;
              }
          }

          switch (command) {

              case 'Z':
                  x = startX;
                  y = startY;
                  break;

              case 'H':
                  x = seg[1];
                  break;

              case 'V':
                  y = seg[1];
                  break;

              case 'M':
                  x = startX = seg[1];
                  y = startY = seg[2];
                  break;

              default:
                  x = seg[seg.length - 2];
                  y = seg[seg.length - 1];
                  break;
          }

          seg.endPoint = { x: x, y: y };
          return seg;
      });
  }

  function serializePath(path) {
      return path.reduce(function (str, seg) {
          return str + seg[0] + seg.slice(1).join(',');
      }, '');
  }

  var utilsSvg = Object.freeze({
    parsePath: parsePath,
    absolutizePath: absolutizePath,
    serializePath: serializePath
  });

  function printTime() {
      var d = new Date();
      var millis = ('00' + d.getMilliseconds()).substr(-3);

      return d.toTimeString().split(' ')[0] + '.' + millis;
  }

  function htmlEncode(text) {
      return document.createElement('a').appendChild(document.createTextNode(text)).parentNode.innerHTML;
  }
  function htmlDecode(html) {
      var a = document.createElement('a');
      a.innerHTML = html;
      return a.textContent;
  }

  function getQueryVariable(variable) {
      var vars = window.location.search.substring(1).split("&");
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (pair[0] === variable) {
              return pair[1];
          }
      }
      return false;
  }

  function alertErrors() {
      window.onerror = function (msg, url, linenumber) {
          alert(printTime() + ' - Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
      };
  }
  function logToScreen() {
      var log = document.body.appendChild(document.createElement('div'));
      log.id = 'abo-log';
      log.setAttribute('style', 'position:fixed;top:0;left:0;z-index:9999;white-space:pre;pointer-events:none;background-color:rgba(255,255,255,.5);');

      console._log = console.log;
      console.log = function () {
          var msg = Array.from(arguments).join(' ');
          log.textContent = printTime() + ' - ' + msg + '\n' + log.textContent;
      };
  }


  exports.Polys = utilsPolys;
  exports.Geom = utilsGeom;
  exports.DOM = utilsDom;
  exports.Canvas = utilsCanvas;
  exports.SVG = utilsSvg;
  exports.printTime = printTime;
  exports.htmlEncode = htmlEncode;
  exports.htmlDecode = htmlDecode;
  exports.getQueryVariable = getQueryVariable;
  exports.alertErrors = alertErrors;
  exports.logToScreen = logToScreen;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
