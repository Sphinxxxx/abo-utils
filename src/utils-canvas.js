import * as geom from './utils-geom';


/**
 * From
 *  http://mike.teczno.com/notes/canvas-warp.html
 *  http://s3.amazonaws.com/canvas-warp/2009-11-01/index.html
 *
 * This draws a triangular area from an image onto a canvas,
 * similar to how ctx.drawImage() draws a rectangular area from an image onto a canvas.
 *
 * s1-3 are the corners of the triangular area on the source image, and
 * d1-3 are the corresponding corners of the area on the destination canvas.
 *
 * Those corner coordinates ([x, y]) can be given in any order,
 * just make sure s1 corresponds to d1 and so forth.
 */
function drawImageTriangle(img, ctx, s1, s2, s3, d1, d2, d3, expand) {

    /**
     * Solves a system of linear equations.
     *
     * t1 = (a * r1) + (b + s1) + c
     * t2 = (a * r2) + (b + s2) + c
     * t3 = (a * r3) + (b + s3) + c
     *
     * r1 - t3 are the known values.
     * a, b, c are the unknowns to be solved.
     * returns the a, b, c coefficients.
     */
    function linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3)
    {
        var a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
        var b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
        var c = t1 - (r1 * a) - (s1 * b);
    
        return [a, b, c];
    }
    
    if(expand) {
        //Overlap the destination areas a little
        //to avoid hairline cracks when drawing mulitiple connected triangles.
        const destOverlap = .3,
              destArea = geom.triangleArea(d1, d2, d3),
              srcArea = geom.triangleArea(s1, s2, s3);
              
        [d1, d2, d3] = geom.expandTriangle(d1, d2, d3,  destOverlap),
        [s1, s2, s3] = geom.expandTriangle(s1, s2, s3,  destOverlap * srcArea/destArea);
    }

    //I assume the "m" is for "magic"...
    const xm = linearSolution(s1[0], s1[1], d1[0],  s2[0], s2[1], d2[0],  s3[0], s3[1], d3[0]),
          ym = linearSolution(s1[0], s1[1], d1[1],  s2[0], s2[1], d2[1],  s3[0], s3[1], d3[1]);

    ctx.save();

    ctx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
    ctx.beginPath();
    ctx.moveTo(s1[0], s1[1]);
    ctx.lineTo(s2[0], s2[1]);
    ctx.lineTo(s3[0], s3[1]);
    ctx.closePath();
    //Leaves a faint black (or whatever .fillStyle) border around the drawn triangle
    //  ctx.fill();
    ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height);

    ctx.restore();
    
    
    /* DEBUG - https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
    const incircle = geom.triangleIncircle(d1, d2, d3),
          c = incircle.c;
    //console.log(incircle);
    ctx.beginPath();
    ctx.arc(c[0], c[1], incircle.r, 0, 2*Math.PI, false);
    ctx.moveTo(d1[0], d1[1]);
    ctx.lineTo(d2[0], d2[1]);
    ctx.lineTo(d3[0], d3[1]);
    ctx.closePath();
    //ctx.fillStyle = 'rgba(0,0,0, .3)';
    //ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,0,0, .4)';
    ctx.stroke();
    //*/
}


/* Usage:
    var cb = new CanvasPixelBuffer(myCanvas);
    cb.setPixel(10,20, 100);
    cb.setPixel(11,21, 100);
    cb.render();    
*/
class CanvasPixelBuffer {
    
    constructor(canvas, w, h) {
        this.w = canvas.width  = (w || canvas.width);
        this.h = canvas.height = (h || canvas.height);
        this.targetContext = canvas.getContext('2d');
        this.targetData    = this.targetContext.getImageData(0,0, this.w,this.h);
    }

    //http://stackoverflow.com/questions/13917139/fastest-way-to-iterate-pixels-in-a-canvas-and-copy-some-of-them-in-another-one
    setPixel(x, y, rgb) {
        const index = (y * this.w + x) * 4, //Index of the current pixel
              data = this.targetData.data;

        data[index]     = rgb[0]; //r
        data[index + 1] = rgb[1]; //g
        data[index + 2] = rgb[2]; //b
        data[index + 3] = (rgb.length > 3) ? rgb[3] : 255; //a
    }
    
    render() {
        this.targetContext.putImageData(this.targetData, 0,0);
    }
}



export { drawImageTriangle, CanvasPixelBuffer };
