/*
 *  https://github.com/search?q=user%3Ajkroso+svg
 *
 *  The MIT License
 *  Copyright (c) 2013 Jake Rosoman <jkroso@gmail.com>
 */


const segLengths = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
      segSearch = /([astvzqmhlc])([^astvzqmhlc]*)/ig;


//
// https://github.com/jkroso/parse-svg-path/
//
function parsePath(path) {

    function parseValues(args) {
        //https://github.com/jkroso/parse-svg-path/issues/1:
        args = args.replace(/(\.\d+)(?=\.)/g, '$1 ');

        args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig);
        return args ? args.map(Number) : [];
    }

    const data = [];
    path.replace(segSearch, function(_, command, args) {
        var type = command.toLowerCase();
        args = parseValues(args);

        // overloaded moveTo
        if (type === 'm' && args.length > 2) {
            data.push([command].concat(args.splice(0, 2)));
            type = 'l';
            command = (command === 'm') ? 'l' : 'L';
        }

        while (true) {
            if (args.length === segLengths[type]) {
                args.unshift(command);
                return data.push(args);
            }
            if (args.length < segLengths[type]) { throw new Error('Malformed path data: ' + [command, args]); }
            
            data.push([command].concat(args.splice(0, segLengths[type])));
        }
    });

    return data;
}


//
// https://github.com/jkroso/abs-svg-path/
//
function absolutizePath(path) {
    var startX = 0;
    var startY = 0;
    var x = 0;
    var y = 0;

    return path.map(function(seg) {
        seg = seg.slice();
        var type = seg[0];
        var command = type.toUpperCase();

        seg.startPoint = { x: x, y: y };
        
        // is relative
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
                    for (var i = 1; i < seg.length; ) {
                        seg[i++] += x;
                        seg[i++] += y;
                    }
                    break;
            }
        }

        // update cursor state
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


//
// https://github.com/jkroso/serialize-svg-path/
//
function serializePath(path){
    return path.reduce(function(str, seg) {
        return str + seg[0] + seg.slice(1).join(',');
    }, '');
}



export { parsePath, absolutizePath, serializePath };
