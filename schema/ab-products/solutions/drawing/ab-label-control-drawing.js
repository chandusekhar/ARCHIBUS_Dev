

// Appends new line items to an existing label
function appendLabels()
{
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	var labels = new Array();
	labels[0] = new DwgLabel("myfield", "hello", 15, 0xff0000, null, null, true);
	labels[1] = new DwgLabel("otherfield", "aaa", 12, 0x0000ff);
	labels[2] = new DwgLabel("otherfield", "bbb");
	opts.appendRec("HQ;17;101", null, labels);
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 2);
}

// Removes a specific line item from an existing label
function removeLabels()
{
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	var labels = new Array();
	labels[0] = new DwgLabel("myfield", "hello");
	opts.appendRec("HQ;17;101", null, labels);
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 3);
}

// Clears a label
function clearLabels()
{
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	opts.appendRec("HQ;17;101");
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 4);
}

// Replace a specific field value in a label
function replaceValues()
{
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	var labels = new Array();
	labels[0] = new DwgLabel("myfield", "replaced");
	opts.appendRec("HQ;17;101", null, labels);
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 1);
}

// Reset a label to the original datasource values
function resetLabels(rm)
{
	if (!valueExistsNotEmpty(rm))
		rm = "101";
		
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	opts.appendRec("HQ;17;" + rm);
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 5);
}

function drawX(rm)
{
	if (!valueExistsNotEmpty(rm))
		rm = "101";
		
	var loc = new Ab.drawing.DwgCtrlLoc("HQ", "17");
	var opts = new DwgOpts();
	var labels = new Array();
	labels[0] = new DwgLabel("myfield", "X", 100, 0x0000ff, null, null, true);
	opts.appendRec("HQ;17;" + rm, null, labels);
	
	View.panels.get('labelControlDrawing_cadPanel').setLabels(loc, opts, 0);	// replace labels
}

var rms = new Array("101", "102", "103");
var rmPos = 0;
var modeReplace = true;

function toggleLabels()
{
	if (rmPos >= rms.length) {
		rmPos = 0;
		modeReplace = !modeReplace;
	}
	
	if (modeReplace == true)
		drawX(rms[rmPos]);
	else
		resetLabels(rms[rmPos]);
		
	rmPos++;
}

var minTextSize = 4;
var idealTextSize = 12;
var shrinkToTextFit = true;

function setMinTextSize() {
	minTextSize = prompt("Minimal Text Size (currently " + minTextSize + "):");
	try {
		View.panels.get('labelControlDrawing_cadPanel').setMinimumLabelTextSize(minTextSize);
	} catch (err) {
		alert(err);
	}
}

function setIdealTextSize() {
	idealTextSize = prompt("Ideal Text Size (currently " + idealTextSize + "):");
	try {
		View.panels.get('labelControlDrawing_cadPanel').setIdealLabelTextSize(idealTextSize);
	} catch(err) {
		alert(err);
	}
}

function toggleShrinkText() {
	alert("Switching text shrinking to "  + ((shrinkToTextFit = !shrinkToTextFit) ? "ON" : "OFF"));
	View.panels.get('labelControlDrawing_cadPanel').setShrinkLabelTextToFit(shrinkToTextFit);
}







 