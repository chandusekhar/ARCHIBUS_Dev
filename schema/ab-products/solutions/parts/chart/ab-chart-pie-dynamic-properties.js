
//custom colors:	b. purple   b. indigo	b. dk. blue	b. blue	b. green	b. lime	b. yellow	b. mustard 	b. red	b. purple       
var customFillColors = ['0x7030A0','0x002060','0x0070C0','0x00B0F0','0x00B050','0x92D050','0xFFFF00','0xFFC000','0xFF0000','0xC00000'];
var customDesturatedFillColors = ['0x9A91A1','0x575A61','0xACB7BF','0xD8E9F0','0x9EB0A6','0xC7D1BC','0xFFFFE5','0xFFF9E5','0xFFE5E5','0xBFACAC'];

//toggle between custom solid color and default solid colors
var customSolidColor = false;
function toggleSolidFillColors()
{
	if(customSolidColor){
		alert("set default solid color.");
		View.panels.get('chartPie_chart').setSolidFillColors([]);
	} else {
		alert("set custom custom color.");
		View.panels.get('chartPie_chart').setSolidFillColors(customFillColors);
	}
	customSolidColor = !customSolidColor;
}


//toggle between custom linear gradient, default linear gradient, custom radical gradient, and default radical gradient colors
var customGradientColor = 0;
function toggleGradientFillColors()
{
	if(customGradientColor==0){
		alert("set custom linear gradient color.");
		View.panels.get('chartPie_chart').setGradientFillColors("linearGradient", customFillColors, customDesturatedFillColors, 0.5, 1.0);
		customGradientColor++;
	} else if(customGradientColor==1) {
		alert("set default linear gradient color.");
		View.panels.get('chartPie_chart').setGradientFillColors("linearGradient", [], [], 1.0, 1.0);
		customGradientColor++;
	}else if(customGradientColor==2) {
		alert("set custom radical gradient color.");
		View.panels.get('chartPie_chart').setGradientFillColors("radialGradient", customFillColors, customDesturatedFillColors, 1.0, 0.5);
		customGradientColor++;
	}else {
		alert("set default radical gradient color.");
		View.panels.get('chartPie_chart').setGradientFillColors("radialGradient", [], [], 1.0, 1.0);
		customGradientColor = 0;
	}
}

var calloutGap = 5;
function increaseCalloutGap()
{
	if(calloutGap < 100){
		alert("set calloutGap to " + calloutGap);
		View.panels.get('chartPie_chart').setCalloutGap(calloutGap);
		calloutGap += 10;
	} else {
		calloutGap = 5;
	}
}

var labelSizeLimit = 15;
function decreaseInsideLabelSizeLimit()
{
	if(labelSizeLimit > 0){
		alert("set InsideLabelSizeLimit to " + labelSizeLimit);
		View.panels.get('chartPie_chart').setInsideLabelSizeLimit(labelSizeLimit);
		labelSizeLimit -= 3;
	} else {
		labelSizeLimit = 15;
	}
}

var showAllTooltips = true;
function toggleTooltips()
{
	if(showAllTooltips)
		alert("show all tooltips - move tooltip over chart");
	else
		alert("show default tooltips  - move tooltip over chart");
	
	View.panels.get('chartPie_chart').setDataTipFunction(showAllTooltips);
	showAllTooltips = !showAllTooltips;
}







 