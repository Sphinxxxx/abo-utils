/*global Element*/
/*global HTMLCanvasElement*/

import * as dom from './utils-dom';


function ensure(obj, prop, fallback) {
    //if(!obj[prop]) { obj[prop] = fallback; }
    
    //https://stackoverflow.com/questions/38961414/object-defineproperty-or-prototype
    if (!obj[prop]) {
        Object.defineProperty(obj, prop, {
            value: fallback,
        });
    }
}

/* TEST
function test(x) {
    console.log('Apekatt! ' + x, this);
}
ensure(Array.prototype, 'test2', test);
ensure(Math,            'test2', test);
ensure(Math,            'floor', test); //Should *not* override the existing function

[7,8,9].test2(1); Math.test2(2); Math.floor(3);
//*/


/* Array.from() */
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays

ensure(Array, 'from', (list) => Array.prototype.slice.call(list));


/* Math.trunc() */
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
//http://stackoverflow.com/a/17551105/1869660

ensure(Math, 'trunc', (x) => (x < 0) ? Math.ceil(x) : Math.floor(x));


/* array.includes() */
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
//  "The following works because NaN is the only value in javascript which is not equal to itself."
ensure(Number, 'isNaN', (value) => (value !== value));

ensure(Array.prototype, 'includes', function(needle, fromIndex) {
    function equals(a, b) {
        //https://stackoverflow.com/questions/35370222/array-prototype-includes-vs-array-prototype-indexof
        return Number.isNaN(a) ? Number.isNaN(b) : (a === b);
    }
    
    fromIndex = fromIndex || 0;
    if(fromIndex < 0) { fromIndex = this.length + fromIndex; }

    return this.some((x, i) => (i >= fromIndex) && equals(x, needle));
});


/* element.closest() */
//https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
//https://github.com/Financial-Times/polyfill-service/issues/1279

const ep = Element.prototype;
ensure(ep, 'matches', ep.msMatchesSelector || ep.webkitMatchesSelector);
ensure(ep, 'closest', function(selector) {
    var node = this;
    do {
        if(node.matches(selector)) return node;
        //https://github.com/Financial-Times/polyfill-service/issues/1279
        node = dom.nodeName(node, 'svg') ? node.parentNode : node.parentElement;
    }
    while(node); 

    return null;
});


/* canvas.toBlob() */
//https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill

ensure(HTMLCanvasElement.prototype, 'toBlob', function(callback, type, quality) {
    var canvas = this;
    setTimeout(function() {

        var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || 'image/png'} ) );
    });
});
