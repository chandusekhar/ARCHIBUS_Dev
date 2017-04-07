
   	
/**
 * Generate random color as default for room selector
 */
function generateRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createColorInput(id, valueId){
	var colorInput = document.createElement('input');
	colorInput.id = id;
	colorInput.className = "color {valueElement: '" + valueId + "'}";
	return colorInput;
}

function createColorValueInput(valueId){
	var colorValueInput = document.createElement('input');
	colorValueInput.id = valueId;
	colorValueInput.value = generateRandomColor();
	//colorValueInput.type = "hidden";
	return colorValueInput;
}