/*!
 * abo-utils v0.3.3
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
    var $ = $$1;

    function selectors() {
        return [$, $$];
    }

    function walkNodeTree(root, options) {
        options = options || {};

        var inspect = options.inspect || function (n) {
            return true;
        },
            collect = options.collect || function (n) {
            return true;
        };
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
            acceptNode: function acceptNode(node) {
                if (!inspect(node)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!collect(node)) {
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        var nodes = [];var n = void 0;
        while (n = walker.nextNode()) {
            options.callback && options.callback(n);
            nodes.push(n);
        }

        return nodes;
    }

    function nodeName(elm, name) {
        if (elm && name) {
            return elm.nodeName.toLowerCase() === name.toLowerCase();
        }
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

        var namespace = tag.toLowerCase() === 'svg' ? 'http://www.w3.org/2000/svg'
        : parent ? parent.namespaceURI : null;
        var element = namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);

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

    function addEvent(target, type, handler) {
        target.addEventListener(type, handler, false);
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

    function animate(durationMS, callback, alternate) {
        var startTime = void 0,
            cancelled = void 0;
        function anim(t) {
            if (!startTime) {
                startTime = t;
            }

            var totalProgress = (t - startTime) / durationMS;

            var relProgress = totalProgress % 1;
            if (alternate) {
                var iteration = Math.trunc(totalProgress);
                if (iteration % 2) {
                    relProgress = 1 - relProgress;
                }
            }

            callback(relProgress, totalProgress);
            if (!cancelled) {
                requestAnimationFrame(anim);
            }
        }
        requestAnimationFrame(anim);

        return {
            cancel: function cancel() {
                cancelled = true;
            }
        };
    }

    function dropFiles(target, callback, options) {
        options = options || {};

        var autoRevoke = options.autoRevoke !== false;
        function handleFiles(files) {
            if (!files) {
                return;
            }
            files = Array.from(files);

            var types = options.acceptedTypes;
            if (types) {
                files = files.filter(function (f) {
                    return types.includes(f.type);
                });
            }
            if (!files.length) {
                return;
            }

            var results = files.map(processFile);
            callback(results);
        }
        function processFile(file) {
            var url = URL.createObjectURL(file);
            return {
                url: url,
                file: file
            };
        }

        if (nodeName(target, 'INPUT') && target.type === 'file') {
            addEvent(target, 'change', function (e) {
                var input = e.currentTarget;
                if (input.files) {
                    handleFiles(input.files);
                }
            });
        } else {
            addEvent(target, 'dragover', function (e) {
                return e.preventDefault();
            });
            addEvent(target, 'drop', function (e) {
                e.preventDefault();

                var files = e.dataTransfer.files;
                handleFiles(files);
            });
        }
    }
    function singleFileProxy(callback) {
        function proxy(results) {
            callback(results[0]);
        }
        return proxy;
    }
    function dropFile(target, callback) {
        dropFiles(target, singleFileProxy(callback));
    }
    function dropImage(target, callback) {
        dropFiles(target, singleFileProxy(callback), {
            acceptedTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg', 'image/svg+xml']
        });
    }

    var utilsDom = Object.freeze({
        $$: $$,
        $: $,
        $$1: $$1,
        selectors: selectors,
        walkNodeTree: walkNodeTree,
        nodeName: nodeName,
        createElement: createElement,
        relativeMousePos: relativeMousePos,
        addEvent: addEvent,
        live: live,
        animate: animate,
        dropFiles: dropFiles,
        dropFile: dropFile,
        dropImage: dropImage
    });


    function ensure(obj, prop, fallback) {

        if (!obj[prop]) {
            Object.defineProperty(obj, prop, {
                value: fallback
            });
        }
    }



    ensure(Array, 'from', function (list) {
        return Array.prototype.slice.call(list);
    });


    ensure(Math, 'trunc', function (x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x);
    });


    ensure(Number, 'isNaN', function (value) {
        return value !== value;
    });

    ensure(Array.prototype, 'includes', function (needle, fromIndex) {
        function equals(a, b) {
            return Number.isNaN(a) ? Number.isNaN(b) : a === b;
        }

        fromIndex = fromIndex || 0;
        if (fromIndex < 0) {
            fromIndex = this.length + fromIndex;
        }

        return this.some(function (x, i) {
            return i >= fromIndex && equals(x, needle);
        });
    });


    var ep = Element.prototype;
    ensure(ep, 'matches', ep.msMatchesSelector || ep.webkitMatchesSelector);
    ensure(ep, 'closest', function (selector) {
        var node = this;
        do {
            if (node.matches(selector)) return node;
            node = nodeName(node, 'svg') ? node.parentNode : node.parentElement;
        } while (node);

        return null;
    });


    ensure(HTMLCanvasElement.prototype, 'toBlob', function (callback, type, quality) {
        var canvas = this;
        setTimeout(function () {

            var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], { type: type || 'image/png' }));
        });
    });

    var utilsPolys = Object.freeze({

    });

    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }

    function lerp(v0, v1, t) {
        if (Array.isArray(v0)) {
            return v0.map(function (v, i) {
                return lerp(v, v1[i], t);
            });
        }
        return (1 - t) * v0 + t * v1;
    }

    var utilsMath = Object.freeze({
        clamp: clamp,
        lerp: lerp
    });

    function distance(p1, p2) {
        var dx = p2[0] - p1[0],
            dy = p2[1] - p1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function rotatePoint(p, radians) {
        var x = p[0],
            y = p[1],
            cos = Math.cos(radians),
            sin = Math.sin(radians);

        return [cos * x - sin * y, sin * x + cos * y];
    }

    function angleBetween(p1, p2, p3) {
        function squared(a) {
            return a * a;
        }

        var radians = void 0;

        if (!p3) {
            var dx = p2[0] - p1[0],
                dy = p2[1] - p1[1];

            radians = Math.atan2(dy, dx);
        }

        else {

                var a = squared(p2[0] - p1[0]) + squared(p2[1] - p1[1]),
                    b = squared(p2[0] - p3[0]) + squared(p2[1] - p3[1]),
                    c = squared(p3[0] - p1[0]) + squared(p3[1] - p1[1]);

                radians = Math.acos((a + b - c) / Math.sqrt(4 * a * b));
            }

        return radians;
    }

    function triangleArea(A, B, C) {

        var area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;

        return area;
    }

    function triangleIncircle(A, B, C) {
        var a = distance(B, C),
            b = distance(C, A),
            c = distance(A, B),
            p = a + b + c,
            s = p / 2;

        var area = triangleArea(A, B, C);

        var r = area / s,
            cx = (a * A[0] + b * B[0] + c * C[0]) / p,
            cy = (a * A[1] + b * B[1] + c * C[1]) / p;
        return {
            r: r,
            c: [cx, cy]
        };
    }

    function expandTriangle(A, B, C, amount) {
        var incircle = triangleIncircle(A, B, C),
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
        distance: distance,
        rotatePoint: rotatePoint,
        angleBetween: angleBetween,
        triangleArea: triangleArea,
        triangleIncircle: triangleIncircle,
        expandTriangle: expandTriangle
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

    var slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    function drawImageTriangle(img, ctx, s1, s2, s3, d1, d2, d3, expand) {

        function linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3) {
            var a = ((t2 - t3) * (s1 - s2) - (t1 - t2) * (s2 - s3)) / ((r2 - r3) * (s1 - s2) - (r1 - r2) * (s2 - s3));
            var b = ((t2 - t3) * (r1 - r2) - (t1 - t2) * (r2 - r3)) / ((s2 - s3) * (r1 - r2) - (s1 - s2) * (r2 - r3));
            var c = t1 - r1 * a - s1 * b;

            return [a, b, c];
        }

        if (expand) {
            var _geom$expandTriangle, _geom$expandTriangle2, _geom$expandTriangle3, _geom$expandTriangle4;

            var destOverlap = .3,
                destArea = triangleArea(d1, d2, d3),
                srcArea = triangleArea(s1, s2, s3);

            (_geom$expandTriangle = expandTriangle(d1, d2, d3, destOverlap), _geom$expandTriangle2 = slicedToArray(_geom$expandTriangle, 3), d1 = _geom$expandTriangle2[0], d2 = _geom$expandTriangle2[1], d3 = _geom$expandTriangle2[2], _geom$expandTriangle), (_geom$expandTriangle3 = expandTriangle(s1, s2, s3, destOverlap * srcArea / destArea), _geom$expandTriangle4 = slicedToArray(_geom$expandTriangle3, 3), s1 = _geom$expandTriangle4[0], s2 = _geom$expandTriangle4[1], s3 = _geom$expandTriangle4[2], _geom$expandTriangle3);
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

    }


    var CanvasPixelBuffer = function () {
        function CanvasPixelBuffer(canvas, w, h) {
            classCallCheck(this, CanvasPixelBuffer);

            this.w = canvas.width = w || canvas.width;
            this.h = canvas.height = h || canvas.height;
            this.targetContext = canvas.getContext('2d');
            this.sync();
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


        }, {
            key: 'sync',
            value: function sync() {
                this.targetData = this.targetContext.getImageData(0, 0, this.w, this.h);
            }
        }, {
            key: 'clear',
            value: function clear() {
                this.targetContext.clearRect(0, 0, this.w, this.h);
                this.sync();
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

    function log2() {
        var time = '[' + printTime() + ']',
            args = Array.from(arguments);

        args.unshift(time);
        console.log.apply(console, args);
    }

    function alertErrors() {
        window.onerror = function (msg, url, linenumber) {
            alert(printTime() + ' - Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
        };
    }
    function logToScreen() {
        var log = createElement('#abo-log', document.body, {
            style: 'position:fixed;top:0;left:0;z-index:9999;white-space:pre;pointer-events:none;background-color:rgba(255,255,255,.5);'
        });

        console._log = console.log;
        console.log = function () {
            var msg = Array.from(arguments).join(' ');
            log.textContent = msg + '\n' + log.textContent;
        };
    }

    var utilsDebug = Object.freeze({
        printTime: printTime,
        log2: log2,
        alertErrors: alertErrors,
        logToScreen: logToScreen
    });

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


    exports.Polys = utilsPolys;
    exports.Math = utilsMath;
    exports.Geom = utilsGeom;
    exports.DOM = utilsDom;
    exports.Canvas = utilsCanvas;
    exports.SVG = utilsSvg;
    exports.Debug = utilsDebug;
    exports.htmlEncode = htmlEncode;
    exports.htmlDecode = htmlDecode;
    exports.getQueryVariable = getQueryVariable;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
