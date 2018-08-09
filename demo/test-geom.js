/*global ABOUtils*/
/*global Vue*/
/*global dragTracker*/

(function() {
    "use strict";
    console.clear();
    
    function rnd(max) {
        return Math.round(Math.random()*max);
    }

    function createPoint() {
        const p = [rnd(400), rnd(400)];
        return p;
    }


    //Global state model. Can be changed from within Vue or from the outside.
    const _svgState = {
        size: [400, 400],

        p1: createPoint(),
        p2: createPoint(),
        p3: createPoint(),
    };
    

    Vue.component('drag-node', {
        template: '<circle data-draggable @dragging="onDragging" :cx="absCoord[0]" :cy="absCoord[1]" :r="r" />',
        props: {
            coord: Array,
            //If 'coord' is relative to some other point:
            offsetCenter: Array,

            r: {
                default: 16,
            }
        },
        model: {
            prop: 'coord',
            event: 'do_it',
        },
        computed: {
            absCoord() {
                const point = this.coord,
                      center = this.offsetCenter,
                      absCoord = center ? [ point[0] + center[0], point[1] + center[1] ]
                                        : point;
                return absCoord;
            },
        },
        methods: {
            onDragging(e) {
                const point = e.detail.pos,
                      center = this.offsetCenter,
                      relCoord = center ? [ point[0] - center[0], point[1] - center[1] ]
                                        : point;
                this.$emit('do_it', relCoord);
            },
        },
    });

    Vue.component('connector', {
        template: '<line class="connector" :x1="start[0]" :y1="start[1]" :x2="absEnd[0]" :y2="absEnd[1]" />',
        props: ['start', 'end', 'endIsRel'],
        computed: {
            absEnd() {
                const start = this.start,
                      end = this.end,
                      absEnd = this.endIsRel ? [ start[0] + end[0], start[1] + end[1] ]
                                             : end;
                return absEnd;
            }
        }
    });

    new Vue({
        el: '#app',
        data: {
            svg: _svgState,
        },
        computed: {
        },
        methods: {
            getAngle(a, b, c) {
                const angle = ABOUtils.Geom.angleBetween(a, b, c);
                return Math.round( angle * 180/Math.PI );
            },
        },
        filters: {
            prettyCompact: function(obj) {
                if(!obj) return '';
                const pretty = JSON.stringify(obj, null, 2),
                      //Collapse simple arrays (arrays without objects or nested arrays) to one line:
                      compact = pretty.replace(/\[[^[{]*?]/g, (match => match.replace(/\s+/g, ' ')));

                return compact;
            }
        },
    });


    //Vue replaces the original <svg> element, so we must wait until now to enable dragging:
    dragTracker({
        container: document.querySelector('#app svg'), 
        selector: '[data-draggable]',
        //The .resizer needs to be dragged outside..
        //  dragOutside: false,
        callback: (node, pos) => {
            //Doesn't look like this binding is two-way,
            //so we must dispatch a custom event which is handled by the node's Vue component...
            //	node.setAttribute('cx', pos[0]);
            //	node.setAttribute('cy', pos[1]);

            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('dragging', true, false, { pos } );
            //var event = new CustomEvent('dragging', { detail: { pos } });
            node.dispatchEvent(event);
        },
    });
    
})();
