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



export { htmlEncode, htmlDecode, getQueryVariable };
