function distance(p1, p2) {
    const dx = p2[0] - p1[0],
          dy = p2[1] - p1[1];
    return Math.sqrt(dx*dx + dy*dy);
}


//https://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d
function rotatePoint(p, radians, center) {
    const cos = Math.cos(radians),
          sin = Math.sin(radians);
    
    let x = p[0],
        y = p[1];
    if(center) {
        x -= center[0];
        y -= center[1];
    }

    let newX = cos*x - sin*y,
        newY = sin*x + cos*y;
    if(center) {
        newX += center[0];
        newY += center[1];
    }
    
    return [newX, newY];
}


//Angle (in radians) between two or three points
function angleBetween(p1, p2, p3) {
    function squared(a) { return a*a; }

    let radians;
    
    //Angle between two points
    //https://gist.github.com/conorbuck/2606166
    if(!p3) {
        const dx = p2[0] - p1[0],
              dy = p2[1] - p1[1];

        radians = Math.atan2(dy, dx);
    }

    //Angle between three points (center point is p2)
    //http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
    //  Optimized:
    //  http://phrogz.net/angle-between-three-points
    else {
        /*
        function findAngle(A,B,C) {
            var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
            var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
            var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
            
            var angle = Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
            console.log('findAngle:', A, '->', B, '->', C, ':', angle);
            return angle;
        }
        */

        const a = squared(p2[0] - p1[0]) + squared(p2[1] - p1[1]),
              b = squared(p2[0] - p3[0]) + squared(p2[1] - p3[1]),
              c = squared(p3[0] - p1[0]) + squared(p3[1] - p1[1]);
        
        const cos = (a + b - c) / Math.sqrt(4 * a * b);
        //Rounding errors near 0° and 180° may cause an invalid cosine,
        //e.g. [0,602.382], [0,598.339], [0,592.913] => -1.0000000000000002
        //Handle these edge cases:
        if(cos <= -1) {
            radians = Math.PI;
        }
        else if(cos >= 1) {
            radians = 0;
        }
        else {
            radians = Math.acos(cos);
        }
    }

    //console.log('findAngle:', p1, '->', p2, '->', p3, ':', radians);
    return radians;
}


function triangleArea(A, B, C) {
    /*
    //Heron's formula
    //Side lengths, perimiter p and semiperimiter s:
    //https://www.wikihow.com/Calculate-the-Area-of-a-Triangle#Using_Side_Lengths
    const a = distance(B, C),
          b = distance(C, A),
          c = distance(A, B),
          p = (a + b + c),
          s = p/2;
    
    const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
    */
    
    //Faster(?) alternative:
    //http://geomalgorithms.com/a01-_area.html#Modern-Triangles
    const area = Math.abs( (B[0]-A[0]) * (C[1]-A[1]) - (C[0]-A[0]) * (B[1]-A[1]) )/2;

    return area;
}


/**
 * https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
 * https://math.stackexchange.com/questions/1413372/find-cartesian-coordinates-of-the-incenter
 * https://www.mathopenref.com/coordincenter.html
 */
function triangleIncircle(A, B, C) {
    //Side lengths, perimiter p and semiperimiter s:
    const a = distance(B, C),
          b = distance(C, A),
          c = distance(A, B),
          p = (a + b + c),
          s = p/2;
    
    const area = triangleArea(A, B, C);

    //Incircle radius r
    //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Relation_to_area_of_the_triangle
    //..and center [cx, cy]
    //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Cartesian_coordinates
    //  https://www.mathopenref.com/coordincenter.html
    const r = area/s,
          cx = (a*A[0] + b*B[0] + c*C[0]) / p,
          cy = (a*A[1] + b*B[1] + c*C[1]) / p;
    return {
        r,
        c: [cx, cy],
    };
}


/*
 * https://math.stackexchange.com/questions/17561/how-to-shrink-a-triangle
 */
function expandTriangle(A, B, C, amount) {
    const incircle = triangleIncircle(A, B, C),
          c = incircle.c,
          factor = (incircle.r + amount)/(incircle.r);
    
    function extendPoint(p) {
        const dx = p[0] - c[0],
              dy = p[1] - c[1],
              x2 = (dx * factor) + c[0],
              y2 = (dy * factor) + c[1];
        return [x2, y2];
    }
    
    const A2 = extendPoint(A),
          B2 = extendPoint(B),
          C2 = extendPoint(C);
    return[A2, B2, C2];
}



export { distance, rotatePoint, angleBetween, triangleArea, triangleIncircle, expandTriangle };
