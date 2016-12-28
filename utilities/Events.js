var on = addEventListener.bind(window),
 off = removeEventListener.bind(window),
 emit = function(name, val) {
    dispatchEvent(new CustomEvent(name, {
        detail: val
    }));
};