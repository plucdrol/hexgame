// HELPERS

function assert(condition,message) {
	if (!condition) {
		complain(message);
	}
}

function scream() {
	document.getElementById('console').innerHTML += '<br>aaah!';
}

function complain(message) {
	document.getElementById('console').innerHTML += "<br>";
	document.getElementById('console').innerHTML += message;
}


function listContainsHex(hex, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (Hex.equals(list[i],hex)) {
            return true;
        }
    }

    return false;
}