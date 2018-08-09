function clamp(x, min, max) {
    return Math.max(min, Math.min(x, max));
}


function lerp(v0, v1, t) {
    if(Array.isArray(v0)) {
        return v0.map((v, i) => lerp(v, v1[i], t));
    }
    //Precise method, which guarantees v = v1 when t = 1.
    //https://en.wikipedia.org/wiki/Linear_interpolation#Programming_language_support
    return ((1-t) * v0) + (t * v1);
}



export { clamp, lerp };
