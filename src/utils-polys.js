
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
Array.from = Array.from || function(list) {
    return Array.prototype.slice.call(list);
};


//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
//http://stackoverflow.com/a/17551105/1869660
Math.trunc = Math.trunc || function(x) {
  return (x < 0) ? Math.ceil(x) : Math.floor(x);
};
