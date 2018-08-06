//Center point is p1; angle returned in radians
//  Optimized:
//  http://phrogz.net/angle-between-three-points
function calcAngle(p0, p1, p2) {

    function squared(a) { return a*a; }

    var a = squared(p1[0] - p0[0]) + squared(p1[1] - p0[1]),
        b = squared(p1[0] - p2[0]) + squared(p1[1] - p2[1]),
        c = squared(p2[0] - p0[0]) + squared(p2[1] - p0[1]);
    
    var angle = Math.acos( (a+b-c) / Math.sqrt(4*a*b) );
    //console.log('findAngle:', p0, '->', p1, '->', p2, ':', angle);
    return angle;
}
/*
//http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
function findAngle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    
    var angle = Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    console.log('findAngle:', A, '->', B, '->', C, ':', angle);
    return angle;
}
*/


/**
 * https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
 * https://math.stackexchange.com/questions/1413372/find-cartesian-coordinates-of-the-incenter
 * https://www.mathopenref.com/coordincenter.html
 */
function calcIncircle(A, B, C) {
    function lineLen(p1, p2) {
        const dx = p2[0] - p1[0],
              dy = p2[1] - p1[1];
        return Math.sqrt(dx*dx + dy*dy);
    }
    
    //Side lengths, perimiter p and semiperimiter s:
    const a = lineLen(B, C),
          b = lineLen(C, A),
          c = lineLen(A, B),
          p = (a + b + c),
          s = p/2;
    
    //Heron's formula
    //https://www.wikihow.com/Calculate-the-Area-of-a-Triangle#Using_Side_Lengths
    const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
    //Faster(?) alternative:
    //http://geomalgorithms.com/a01-_area.html#Modern-Triangles
    //const area = Math.abs( (B[0]-A[0])*(C[1]-A[1]) - (C[0]-A[0])*(B[1]-A[1]) )/2;

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
    const incircle = calcIncircle(A, B, C),
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



export { calcAngle, calcIncircle, expandTriangle };
