
// -------------------------------------------------------------------
// -------------------------------------------------------------------
// -- 
// -- Nov 2010
// -- Simon Corrin
// -- Updated: use images instead of table colors 
// --    Why? Table volors don't print as they are in the background
// -- 
// -- Updated: use height property in image specification
// -- 
// -------------------------------------------------------------------
// -------------------------------------------------------------------

var AtalasoftBarcode39Symbols = new Object();
AtalasoftBarcode39Symbols['*'] = "bWbwBwBwb";
AtalasoftBarcode39Symbols['-'] = "bWbwbwBwB";
AtalasoftBarcode39Symbols['$'] = "bWbWbWbwb";
AtalasoftBarcode39Symbols['%'] = "bwbWbWbWb";
AtalasoftBarcode39Symbols[' '] = "bWBwbwBwb";
AtalasoftBarcode39Symbols['.'] = "BWbwbwBwb";
AtalasoftBarcode39Symbols['/'] = "bWbWbwbWb";
AtalasoftBarcode39Symbols['+'] = "bWbwbWbWb";
AtalasoftBarcode39Symbols['0'] = "bwbWBwBwb";
AtalasoftBarcode39Symbols['1'] = "BwbWbwbwB";
AtalasoftBarcode39Symbols['2'] = "bwBWbwbwB";
AtalasoftBarcode39Symbols['3'] = "BwBWbwbwb";
AtalasoftBarcode39Symbols['4'] = "bwbWBwbwB";
AtalasoftBarcode39Symbols['5'] = "BwbWBwbwb";
AtalasoftBarcode39Symbols['6'] = "bwBWBwbwb";
AtalasoftBarcode39Symbols['7'] = "bwbWbwBwB";
AtalasoftBarcode39Symbols['8'] = "BwbWbwBwb";
AtalasoftBarcode39Symbols['9'] = "bwBWbwBwb";
AtalasoftBarcode39Symbols['A'] = "BwbwbWbwB";
AtalasoftBarcode39Symbols['B'] = "bwBwbWbwB";
AtalasoftBarcode39Symbols['C'] = "BwBwbWbwb";
AtalasoftBarcode39Symbols['D'] = "bwbwBWbwB";
AtalasoftBarcode39Symbols['E'] = "BwbwBWbwb";
AtalasoftBarcode39Symbols['F'] = "bwBwBWbwb";
AtalasoftBarcode39Symbols['G'] = "bwbwbWBwB";
AtalasoftBarcode39Symbols['H'] = "BwbwbWBwb";
AtalasoftBarcode39Symbols['I'] = "bwBwbWBwb";
AtalasoftBarcode39Symbols['J'] = "bwbwBWBwb";
AtalasoftBarcode39Symbols['K'] = "BwbwbwbWB";
AtalasoftBarcode39Symbols['L'] = "bwBwbwbWB";
AtalasoftBarcode39Symbols['M'] = "BwBwbwbWb";
AtalasoftBarcode39Symbols['N'] = "bwbwBwbWB";
AtalasoftBarcode39Symbols['O'] = "BwbwBwbWb";
AtalasoftBarcode39Symbols['P'] = "bwBwBwbWb";
AtalasoftBarcode39Symbols['Q'] = "bwbwbwBWB";
AtalasoftBarcode39Symbols['R'] = "BwbwbwBWb";
AtalasoftBarcode39Symbols['S'] = "bwBwbwBWb";
AtalasoftBarcode39Symbols['T'] = "bwbwBwBWb";
AtalasoftBarcode39Symbols['U'] = "BWbwbwbwB";
AtalasoftBarcode39Symbols['V'] = "bWBwbwbwB";
AtalasoftBarcode39Symbols['W'] = "BWBwbwbwb";
AtalasoftBarcode39Symbols['X'] = "bWbwBwbwB";
AtalasoftBarcode39Symbols['Y'] = "BWbwBwbwb";
AtalasoftBarcode39Symbols['Z'] = "bWBwBwbwb";


function AtalasoftBarcode39(s)
{
    this._bcData = s;
}

AtalasoftBarcode39.prototype.getBCSymbol = function(sym, nw, ww, h) {
    var w = nw;
    var clr = "black";
    if (sym == "B") {
        w = ww;
    }
    else if (sym == "b") {
        // defaults good
    }
    else if (sym == "W") {
        w = ww;
        clr = "white";
    }
    else if (sym == "w") {
        clr = "white";
    }
/*
	winFile = ""
	wnPath=""
	path = "/archibus/schema/per-site/multiPrint/barcode/"
	currpath=window.location.pathname.split("/");
	for(var j =1; j<currpath.length;j++){
		if(j!=currpath.length-1){
			wnPath+="/"+currpath[j];
		}
		else{
			wnPath+="/"
		}
		
	}
	for(var i = wnPath.split("/").length-1; i < path.split("/").length - 1; i++){
		winFile = winFile +path.split("/")[i] +"/"
	}
	finalPath=wnPath+winFile;
*/
	finalPath = "/archibus/schema/uc-custom-views/multiPrint/barcode/"
	return "<img src='"+finalPath+"bc_"+clr+".png' style='width: "+w+"px; height: "+h+"px' />";
}

AtalasoftBarcode39.prototype.getBC39 = function(c, nw, ww, h) {
    var bcData = AtalasoftBarcode39Symbols[c];    
    if (bcData == null) {        
        return "<td>[Illegal Char: "+c+"]</td>";
    }
    var retSymbol = "";
    for (var i = 0; i < bcData.length; ++i) {
        var bar = bcData.substring(i, i+1);        
        retSymbol += this.getBCSymbol(bar, nw, ww, h);
    }
    return retSymbol;
}

AtalasoftBarcode39.prototype.getBarcode = function(h, nw, ww) {

    var retBarcode = "";
    if (h == null) { 
        h = 40;
    }
    if (nw == null) { 
        nw = 3;
    }
    if (ww == null) { 
        ww = 6;
    }
    //retBarcode += "<table cellpadding=0 cellspacing=0 style='height:"+h+"px'><tr style='height:"+h+"px'>";
	retBarcode += "<table cellpadding=0 cellspacing=0 style='width: 100%; height:"+h+"px'><tr style='height:"+h+"px;'>";
    retBarcode += this.getBC39("*", nw, ww, h);
    retBarcode += this.getBCSymbol("w", nw, ww, h);
    for (var i = 0; i < this._bcData.length; ++i) {        
        retBarcode += this.getBC39(this._bcData.substring(i, i+1), nw, ww, h);
        retBarcode += this.getBCSymbol("w", nw, ww, h);
    }
    retBarcode += this.getBC39("*", nw, ww, h);
    retBarcode += "</tr></table>";

    return retBarcode;
}

AtalasoftBarcode39.prototype.write = function(h, nw, ww) {
    document.write(this.getBarcode(h, nw, ww))
}
