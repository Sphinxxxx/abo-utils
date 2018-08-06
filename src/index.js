//Doesn't work yet..
//https://stackoverflow.com/questions/44640696/es6-module-syntax-is-it-possible-to-export-as-name-from
//  export * as DOM from './utils-dom';

import * as Polys  from './utils-polys';
import * as Geom   from './utils-geom';
import * as DOM    from './utils-dom';
import * as Canvas from './utils-canvas';
import * as SVG    from './utils-svg';

//Export the basic stuff un-namespaced..
export * from './utils';
//..and other things within namespaces:
export { Polys, Geom, DOM, Canvas, SVG };
