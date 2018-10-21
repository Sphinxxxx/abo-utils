/*global URL*/
/*global NodeFilter*/


//https://codepen.io/michaelschofield/post/a-useful-function-for-making-queryselectorall-more-like-jquery
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
const $ = $$1;

function selectors() {
    return [$, $$];
}


//https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
function walkNodeTree(root, options) {
    options = options || {};

    const inspect = options.inspect || (n => true),
          collect = options.collect || (n => true);
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ALL,
        {
            acceptNode: function(node) {
                if(!inspect(node)) { return NodeFilter.FILTER_REJECT; }
                if(!collect(node)) { return NodeFilter.FILTER_SKIP; }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodes = []; let n;
    while(n = walker.nextNode()) {
        options.callback && options.callback(n);
        nodes.push(n);
    }

    return nodes;
}


function nodeName(elm, name) {
    //Element.nodeName/tagName is uppercase ..except when it's not:
    //https://stackoverflow.com/questions/27223756/is-element-tagname-always-uppercase
    if(elm && name) {
        return (elm.nodeName.toLowerCase() === name.toLowerCase());
    }
}


function createElement(tag, parent, attributes) {
    //Examples: "div", "#foo.bar", "button.large.blue"
    const tagInfo = tag.split(/([#\.])/);
    if(tagInfo.length > 1) {
        tag = tagInfo[0] || 'div';

        attributes = attributes || {};
        for(let i = 1; i < tagInfo.length-1; i++) {
            const key = tagInfo[i],
                  val = tagInfo[i + 1];
            
            if(key === '#') {
                attributes.id = val;
            }
            else {
                attributes.class = attributes.class
                                        ? attributes.class + ' ' + val
                                        : val;
            }
            i++;
        }
    }
    
    const namespace = (tag.toLowerCase() === 'svg')
                            ? 'http://www.w3.org/2000/svg'
                            //Needed for SVG elements:
                            : parent ? parent.namespaceURI : null;
    const element = namespace
            ? document.createElementNS(namespace, tag)
            : document.createElement(tag);

    if(attributes) {
        for(const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
    }

    if(parent) {
        parent.appendChild(element);
    }
    return element;
}


function relativeMousePos(mouseEvent, element, stayWithin) {
    function respectBounds(value, min,max) {
        return Math.max(min, Math.min(value, max));
    }

    var elmBounds = element.getBoundingClientRect();
    var x = mouseEvent.clientX - elmBounds.left,
        y = mouseEvent.clientY - elmBounds.top;
    
    if(stayWithin) {
        x = respectBounds(x, 0, elmBounds.width);
        y = respectBounds(y, 0, elmBounds.height);
    }

    return [x, y];
}


function addEvent(target, type, handler) {
    target.addEventListener(type, handler, false);
}


//Usage:
//  ABOUtils.DOM.live('click', 'nav .aap a', function(event) { console.log(event); alert(this + ' clicked'); });
function live(eventType, elementQuerySelector, callback) {
    document.addEventListener(eventType, function(e) {

        const qs = $$(elementQuerySelector);
        if (qs && qs.length) {
            
            let el = e.target,
                index = -1;
            while (el && ((index = qs.indexOf(el)) === -1)) {
                el = el.parentElement;
            }

            if (index > -1) {
                callback.call(el, e);
            }
        }
    });
}


function animate(durationMS, callback, alternate) {
    let startTime, cancelled;
    function anim(t) {
        if(!startTime) { startTime = t; }

        const totalProgress = (t - startTime) / durationMS;

        let relProgress = totalProgress % 1;
        if(alternate) {
            const iteration = Math.trunc(totalProgress);
            if(iteration % 2) {
                relProgress = 1 - relProgress;
            }
        }

        callback(relProgress, totalProgress);
        if(!cancelled) { requestAnimationFrame(anim); }
    }
    requestAnimationFrame(anim);
    
    return {
        cancel() { cancelled = true; }
    };
}


function dropFiles(target, callback, options) {
    options = options || {};
    
    const autoRevoke = (options.autoRevoke !== false);
    
    let fileUrls;
    function handleFiles(files) {
        if(!files) { return; }
        files = Array.from(files);

        const types = options.acceptedTypes;
        if(types) { files = files.filter(f => types.includes(f.type)); }
        if(!files.length) { return; }

        if(fileUrls && autoRevoke) {
            //We probably don't need to hang on to the previous files anymore,
            //so we release them for performance reasons:
            fileUrls.forEach(u => URL.revokeObjectURL(u));
        }

        const results = files.map(processFile);
        callback(results);
    }
    function processFile(file) {
        //https://developer.mozilla.org/en-US/docs/Web/API/Camera_API/Introduction
        //http://stackoverflow.com/questions/31742072/filereader-vs-window-url-createobjecturl
        const url = URL.createObjectURL(file);
        return {
            url,
            file,
        };
    }
    
    //If we are intercepting a file input field, we use the `change`` event instead of drag/drop events.
    //That way we fetch the file both on drag/drop (built-in behavior for file input fields), 
    //and when a file is selected through the old-fashioned "Browse" button.
    if(nodeName(target, 'INPUT') && (target.type === 'file')) {
        addEvent(target, 'change', function(e) {
            const input = e.currentTarget;
            if (input.files) {
                handleFiles(input.files);
            }
        });
    }
    else {
        //http://html5demos.com/dnd-upload
        //https://developer.mozilla.org/en-US/docs/Web/Events/drop#Example
        addEvent(target, 'dragover', e => e.preventDefault());
        //addEvent(target, 'dragend',  () => false);
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
        acceptedTypes: ['image/png',
                        'image/jpeg',
                        'image/gif',
                        'image/svg',
                        'image/svg+xml']
    });
}



export { $$, $,$$1, selectors, walkNodeTree, nodeName, createElement, relativeMousePos, addEvent, live, animate, dropFiles, dropFile, dropImage };
