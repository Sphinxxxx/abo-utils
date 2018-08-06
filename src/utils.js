
function printTime() {
    var d = new Date();
    //return d.toLocaleTimeString() + ' - ';
    var millis = ('00' + d.getMilliseconds()).substr(-3);

    return d.toTimeString().split(' ')[0] + '.' + millis;
}


//http://stackoverflow.com/a/15348311/1869660
//https://jsfiddle.net/ThinkingStiff/FSaU2/
function htmlEncode(text) {
    return document.createElement('a')
                   .appendChild(document.createTextNode(text))
                   .parentNode.innerHTML;
}
function htmlDecode(html) {
    var a = document.createElement('a');
    a.innerHTML = html;
    return a.textContent;
}


//https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable)
{
    var vars = window.location.search
                              .substring(1)
                              .split("&");
    for (var i=0; i<vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] === variable) { return pair[1]; }
    }
    return false;
}


//For debugging on mobile:
function alertErrors() {
    window.onerror = function(msg, url, linenumber) {
        alert(`${printTime()} - Error message: ${msg}\nURL: ${url}\nLine Number: ${linenumber}`);
        //return true;
    };
}
function logToScreen() {
    const log = document.body.appendChild( document.createElement('div') );
          log.id = 'abo-log';
          log.setAttribute('style', 'position:fixed;top:0;left:0;z-index:9999;white-space:pre;pointer-events:none;background-color:rgba(255,255,255,.5);');

    console._log = console.log;
    console.log = function() {
        var msg = Array.from(arguments).join(' ');
        log.textContent = `${printTime()} - ${msg}\n` + log.textContent;
    };
}



export { printTime, htmlEncode, htmlDecode, getQueryVariable, alertErrors, logToScreen };
