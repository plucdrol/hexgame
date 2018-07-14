

function insertButton(text, callback) {
	return "<input type='option' onclick='" + callback() + "'>" + text + "</input>";
}