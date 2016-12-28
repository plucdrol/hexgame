
//Pass the name of the event, and the callback function
//Example: on("test", function(e){ alert(e.detail);});
var receiveEvent = addEventListener.bind(window);
 
 //Pass the name of the event
 //Example: offEvent('test');
var offEvent = removeEventListener.bind(window);

//Pass the name of the event, and all the variables you want as the detail
//emitEvent("test", "Number is " + Math.random());
var emitEvent = function(name, val) {
    dispatchEvent(new CustomEvent(name, {
        detail: val
    }));
};