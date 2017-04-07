
//create color dialog div
document.write("<div  id='colorPopup'  style=' position:absolute; z-index:100;  display:none; '></div>  ");

var oColorPopup = document.getElementById("colorPopup");
var oColorPicker = null;
var isInitialized = false;

function showColorPicker(){
    if (!isInitialized) {
        initColor();
        isInitialized = true;
    }
    if (oColorPopup.style.display == "none") {
        window.document.onclick = function(evt){
            //evt=evt || window.event;
            evt = evt ? evt : (window.event ? window.event : null);
            oColorPopup.style.left = evt.clientX - 200 + "px";
            oColorPopup.style.top = evt.clientY - 100 + "px";
            window.document.onclick = null;
        }
        oColorPopup.style.display = "block";
    }
    else {
        oColorPopup.style.display = "none";
    }
}

function initColor(){
    var baseColorHex = new Array('00', '33', '66', '99', 'CC', 'FF');
    var SpColorHex = new Array('000000', '333333', '666666', '999999', 'cccccc', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', '00FFFF', 'FF00FF');
    var colorRGB = "";
    var sColorPopup;
    sColorPopup = "<table  width='260'  border='1'  cellPadding=1  cellSpacing=0   bordercolordark='#ffffff'  bordercolorlight='#000000'  bgcolor='#cccccc'><tr><td>";
    sColorPopup += "<input   id='colorDis'  style='width:50px;border:solid 1px #000000;background-color:#ffff00;margin-left:3px' disabled />";
    sColorPopup += " <input id='colorHexDis'  style='width:70px;border:inset 1px;font-family:Arial;' type='text' value='#FFFF00' readonly />";
    sColorPopup += "<input  type='button' style='border:outset 1px;font-family:Arial;font-size:12px;line-height:12px;width:15px;height:15px;margin-left:105px;margin-bottom:3px;cursor:pointer;' value='X' onclick='doClose()' />";
    sColorPopup += "</td></tr><tr><td>";
    sColorPopup += "<table  border='0' cellpadding='0' cellspacing='0' align='center' ><tr><td bgcolor='#000000' width='12'>";
    sColorPopup += "<table  border='0' cellpadding='0'  cellspacing='1' bgcolor='#000000' align='center' >"; //第1列
    for (i = 0; i < 12; i++) {
        sColorPopup += "<tr  height='12'>";
        colorRGB = SpColorHex[i];
        sColorPopup += "<td width='12' onmouseover='currentColor(this.bgColor)' onclick='clickColor(this.bgColor)'  bgColor='" + colorRGB + "' style='cursor:pointer;'> " + "</td>";
        sColorPopup += "</tr>";
    }
    sColorPopup += "</table>";
    sColorPopup += "</td><td>";
    sColorPopup += "<table  border='0'    cellpadding='0'    cellspacing='1'    bgcolor=#000000 align='center' >"; //第2列
    for (n = 0; n < 2; n++) {
        for (i = 0; i < 6; i++) {
            sColorPopup += "<tr    height=12>";
            for (j = 0 + 3 * n; j < 3 + 3 * n; j++) {
                for (k = 0; k < 6; k++) {
                    colorRGB = baseColorHex[j] + baseColorHex[k] + baseColorHex[i];
                    sColorPopup += "<td  width='12' onmouseover='currentColor(this.bgColor)' onclick='clickColor(this.bgColor)'  bgColor='" + colorRGB + "' style='cursor:pointer;'></td>";
                }
            }
            sColorPopup += "</tr>";
        }
    }
    
    sColorPopup += "</table>";
    
    sColorPopup += "</td></tr></table>";
    sColorPopup += "</td></tr></table>";
    oColorPopup.innerHTML = sColorPopup;
}

function currentColor(colorStr){
	if(colorStr.indexOf('#')==-1){
		document.getElementById("colorDis").style.backgroundColor = '#'+colorStr;
	}else{
		document.getElementById("colorDis").style.backgroundColor = colorStr;
	}
    
    document.getElementById("colorHexDis").value = colorStr.toUpperCase(); 
}

function clickColor(colorStr){
	if(colorStr.indexOf('#')==-1){
		oColorPicker.style.backgroundColor = '#'+colorStr;
	}else{
		oColorPicker.style.backgroundColor = colorStr;
	}
    
    oColorPicker.colorValue = colorStr;
    oColorPopup.style.display = "none";
}

function doClose(){
    oColorPopup.style.display = "none";
}
