
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
    
    const element = parent
            //Needed for SVG elements:
            ? document.createElementNS(parent.namespaceURI, tag)
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



export { $$, $$1, createElement, relativeMousePos, live };
