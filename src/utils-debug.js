import * as dom from './utils-dom';


function printTime() {
    //UTC..
    //  const time = (new Date()).toISOString().replace(/.*T([^A-Z]+).*/, '[$1]');

    var d = new Date();
    //return d.toLocaleTimeString() + ' - ';
    var millis = ('00' + d.getMilliseconds()).substr(-3);

    return d.toTimeString().split(' ')[0] + '.' + millis;
}


function log2() {
    const time = `[${printTime()}]`,
          args = Array.from(arguments);
    
    args.unshift(time);
    console.log.apply(console, args);
}


//For debugging on mobile:
function alertErrors() {
    window.onerror = function(msg, url, linenumber) {
        alert(`${printTime()} - Error message: ${msg}\nURL: ${url}\nLine Number: ${linenumber}`);
        //return true;
    };
}
function logToScreen() {
    const log = dom.createElement('#abo-log', document.body, {
        style: 'position:fixed;top:0;left:0;z-index:9999;white-space:pre;pointer-events:none;background-color:rgba(255,255,255,.5);',
    });

    console._log = console.log;
    console.log = function() {
        var msg = Array.from(arguments).join(' ');
        log.textContent = `${msg}\n` + log.textContent;
    };
}



export { printTime, log2, alertErrors, logToScreen };
