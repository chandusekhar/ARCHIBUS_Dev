
//custom colors:	b. purple   b. indigo	b. dk. blue	b. blue	b. green	b. lime	b. yellow	b. mustard 	b. red	b. purple       
var customFillColors = ['0x7030A0','0x002060','0x0070C0','0x00B0F0','0x00B050','0x92D050','0xFFFF00','0xFFC000','0xFF0000','0xC00000'];
var customDesturatedFillColors = ['0x9A91A1','0x575A61','0xACB7BF','0xD8E9F0','0x9EB0A6','0xC7D1BC','0xFFFFE5','0xFFF9E5','0xFFE5E5','0xBFACAC'];

//toggle between custom solid color and default solid colors
var customSolidColor = false;
function toggleSolidFillColors()
{
	if(customSolidColor){
		alert("set default solid color.");
		View.panels.get('chartStackedArea_panel').setSolidFillColors([]);
	} else {
		alert("set custom custom color.");
		View.panels.get('chartStackedArea_panel').setSolidFillColors(customFillColors);
	}
	View.panels.get('chartStackedArea_panel').refresh();
	customSolidColor = !customSolidColor;
}


//toggle between custom linear gradient, default linear gradient, custom radical gradient, and default radical gradient colors
var customGradientColor = 0;
function toggleGradientFillColors()
{
	if(customGradientColor==0){
		alert("set custom linear gradient color.");
		View.panels.get('chartStackedArea_panel').setGradientFillColors("linearGradient", customFillColors, customDesturatedFillColors, 0.5, 1.0);
		customGradientColor++;
	} else if(customGradientColor==1) {
		alert("set default linear gradient color.");
		View.panels.get('chartStackedArea_panel').setGradientFillColors("linearGradient", [], [], 1.0, 1.0);
		customGradientColor++;
	}else if(customGradientColor==2) {
		alert("set custom radical gradient color.");
		View.panels.get('chartStackedArea_panel').setGradientFillColors("radialGradient", customFillColors, customDesturatedFillColors, 1.0, 0.5);
		customGradientColor++;
	}else {
		alert("set default radical gradient color.");
		View.panels.get('chartStackedArea_panel').setGradientFillColors("radialGradient", [], [], 1.0, 1.0);
		customGradientColor = 0;
	}
	View.panels.get('chartStackedArea_panel').refresh();
}


var showAllTooltips = true;
function toggleTooltips()
{
	if(showAllTooltips)
		alert("show all tooltips - move tooltip over chart");
	else
		alert("show default tooltips  - move tooltip over chart");
	
	View.panels.get('chartStackedArea_panel').setDataTipFunction(showAllTooltips);
	showAllTooltips = !showAllTooltips;
}







 