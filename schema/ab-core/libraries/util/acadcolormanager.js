
var gAcadColorMgr = new AcadColorManager();

function AcadColorManager() 
{ 
	this.unassignedColor = '13421772';
	this.unassignedOpacity = '0.7';
	this.unassignedBorderColor = '0';
	this.unassignedBorderOpacity = '1';
	this.unassignedBorderThickness = '2';

	this.assignedColor = '65535';
	this.assignedOpacity = '0.7';
	this.assignedBorderColor = '0';
	this.assignedBorderOpacity = '1';
	this.assignedBorderThickness = '5';

	this.selectedColor = '16776960';
	this.selectedOpacity = '0.9';
	this.selectedBorderColor = '255';
	this.selectedBorderOpacity = '1';
	this.selectedBorderThickness = '10';

	this.nofillColor = '-2';
	this.nofillOpacity = '0.0';
	this.nofillBorderColor = '0';
	this.nofillBorderOpacity = '1';
	this.nofillBorderThickness = '2';
	
	this._fixedColors = new Array();
	
	this._idealLabelTextSize = '11';
	this._minimumLabelTextSize = '8';
	this._shrinkLabelTextToFit = 'true';
	
	// true if the getHighlightRGBColorEncoding() function has been called
	// false otherwise.
	this._getHighlightRGBColorEncoding = false;
	
	// the variable to record the highlight RGB color encoding from database. Default to 1.
	this._highlightRGBColorEncoding = "1";
	
	this.valueColorMap = {}; // map of values (strings) to colors (strings containing decimal values)
	//if(window.localStorage){
		//this.valueColorMap = window.localStorage;
	//}
	//XXX: this.legendKey used by the key of this.valueColorMap to avoid global conflicting of window.localStorage???
	this.legendKey = "LEGENDKEY";
	
	// This function is to call the Server side to retrieve the HighlightRGBColorEncoding value
	// should only call the server once for gAcadColorMgr
	this.setHighlightRGBColorEncoding = function() {
	    try {
	    	var result = Workflow.call('AbCommonResources-HighlightPatternService-getHighlightRGBColorEncoding', null);
	    	if (result.code == 'executed') {
	    		this._highlightRGBColorEncoding = result.message;
	    		this._getHighlightRGBColorEncoding = true;
	    	}
		} 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	}
	
	this.reset = function() {
		//if(window.localStorage){
		//	this.valueColorMap.clear();
		//}else{
			this.valueColorMap = {};
		//}
		
	}
	
	this.setAutoAssignColors = function(autoAssignColors) {
		this._fixedColors = autoAssignColors;
	}
	
	this.setIdealLabelTextSize = function(idealLabelTextSize) {
		this._idealLabelTextSize = idealLabelTextSize;
	}
	
	this.setMinimumLabelTextSize = function(minimumLabelTextSize) {
		this._minimumLabelTextSize = minimumLabelTextSize;
	}
	
	this.setShrinkLabelTextToFit = function(shrinkLabelTextToFit) {
		this._shrinkLabelTextToFit = shrinkLabelTextToFit;
	}

	this.setAssignedInitConfig = function(dwgHighlightsConfig){
		if(dwgHighlightsConfig.assigned!=null && dwgHighlightsConfig.assigned.fill!=null){
			gAcadColorMgr.setAssignedColor(dwgHighlightsConfig.assigned.fill.color);
			gAcadColorMgr.setAssignedOpacity(dwgHighlightsConfig.assigned.fill.opacity);
		}
		if(dwgHighlightsConfig.assigned!=null && dwgHighlightsConfig.assigned.border!=null){
			gAcadColorMgr.setAssignedBorderColor(dwgHighlightsConfig.assigned.border.color);
			gAcadColorMgr.setAssignedBorderOpacity(dwgHighlightsConfig.assigned.border.opacity);
			gAcadColorMgr.setAssignedBorderThinkness(dwgHighlightsConfig.assigned.border.thickness);
		}
	}
	
	this.setUnassignedInitConfig = function(dwgHighlightsConfig){
		if(dwgHighlightsConfig.unassigned!=null && dwgHighlightsConfig.unassigned.fill!=null){
			gAcadColorMgr.setUnassignedColor(dwgHighlightsConfig.unassigned.fill.color);
			gAcadColorMgr.setUnassignedOpacity(dwgHighlightsConfig.unassigned.fill.opacity);
		}
		if(dwgHighlightsConfig.unassigned!=null && dwgHighlightsConfig.unassigned.border!=null){
			gAcadColorMgr.setUnassignedBorderColor(dwgHighlightsConfig.unassigned.border.color);
			gAcadColorMgr.setUnassignedBorderOpacity(dwgHighlightsConfig.unassigned.border.opacity);
			gAcadColorMgr.setUnassignedBorderThinkness(dwgHighlightsConfig.unassigned.border.thickness);
		}
	}
	
	this.setSelectedInitConfig = function(dwgHighlightsConfig){
		if(dwgHighlightsConfig.selected!=null && dwgHighlightsConfig.selected.fill!=null){
			gAcadColorMgr.setSelectedColor(dwgHighlightsConfig.selected.fill.color);
			gAcadColorMgr.setSelectedOpacity(dwgHighlightsConfig.selected.fill.opacity);
		}
		if(dwgHighlightsConfig.selected!=null && dwgHighlightsConfig.selected.border!=null){
			gAcadColorMgr.setSelectedBorderColor(dwgHighlightsConfig.selected.border.color);
			gAcadColorMgr.setSelectedBorderOpacity(dwgHighlightsConfig.selected.border.opacity);
			gAcadColorMgr.setSelectedBorderThinkness(dwgHighlightsConfig.selected.border.thickness);
		}
	}
	
	this.setNoFillInitConfig = function(dwgHighlightsConfig){		
		if(dwgHighlightsConfig.nofill!=null && dwgHighlightsConfig.nofill.fill!=null){
			gAcadColorMgr.setNoFillColor(dwgHighlightsConfig.nofill.fill.color);
			gAcadColorMgr.setNoFillOpacity(dwgHighlightsConfig.nofill.fill.opacity);
		}
		if(dwgHighlightsConfig.nofill!=null && dwgHighlightsConfig.nofill.border!=null){
			gAcadColorMgr.setNoFillBorderColor(dwgHighlightsConfig.nofill.border.color);
			gAcadColorMgr.setNoFillBorderOpacity(dwgHighlightsConfig.nofill.border.opacity);
			gAcadColorMgr.setNoFillBorderThinkness(dwgHighlightsConfig.nofill.border.thickness);
		}
	}
	
	this.getRGB = function(nColorNum, asHex, isRGB) {
		var nColorRGB = 0;

		//		---- Convert color number to true color
		if (nColorNum <= 0)
			nColorRGB = 0;
		else if ( nColorNum >= 1 && nColorNum <= 256 && isRGB != true) {
			var nRed = (Math.round(this.map[nColorNum][0] * 255)) * 256 * 256;
			var nGreen = (Math.round(this.map[nColorNum][1] * 255)) * 256;
			var nBlue = (Math.round(this.map[nColorNum][2] * 255));
			nColorRGB = nRed + nGreen + nBlue;
		}
		else //when ColorNum > 256 or the nColorNum passed in is a RGB value already
			nColorRGB = nColorNum;	
	
		return this.ensureValidColor(nColorRGB.toString(asHex == true ? 16 : 10), asHex);
	}
	
	this.getRGBFromPattern = function(pattern, asHex) {
		
		if(this._getHighlightRGBColorEncoding == false)
			this.setHighlightRGBColorEncoding();
		
		var c = new String();
		if (pattern == null || !pattern.length)
			return "-1";
		var ver = parseInt(pattern);
		var vals = new Array();
		vals = pattern.split(" ");
				
		// Note that the ver == 1 option is not currently supported
		if (ver == 0)
			c = this.getRGB(parseInt(vals[1]), asHex);
		else if (ver >= 14)	{
			// The ARCHIBUS database stores the number representing
			// an RGB the opposite how Flash needs it.  Handle this case here	
			var c1 = parseInt(vals[3], 10);
			
			//convert from Windows's Highlight pattern format to Web's format
			if(this._highlightRGBColorEncoding=="0")
				c1 = this.convertColorValueFromWindowsFormat(c1);
			
			c1 = c1.toString(16);
			
			if (c1.length < 6) {
				var i = c1.length;
				c1 = ("000000" + c1).substring(i);
			}
			
			c = c1.substr(4, 2) + c1.substr(2, 2) + c1.substr(0, 2);
			if (!asHex)
				c = parseInt(c, 16);
		}
				
		return c;
	}
	
	
	//This funtion is to handle the problem that Windows and WebC adapt different formulas to convert from RGB color 
	// into the colorValue. (KB# 3029026)
	//
	// In Windows, the (R, G, B) color is converted into colorValue using (r + g * 255 + b * 255 * 255)
	// In WebC,  the (R, G, B) color is converted into colorValue using (r * 255 * 255 + g * 255 + b)
	this.convertColorValueFromWindowsFormat = function(color) {
		var nBlue = Math.floor(color/(256*256));
		var nGreen = Math.floor((color-nBlue*256*256)/256);
		var nRed = Math.floor(color-nBlue*256*256 - nGreen*256);
		
		return (nRed*256*256 + nGreen*256 + nBlue);
	}
	
	//KB# 3027416 - solid color on set color dialog issue
	//this function is a duplicate for getRGBFromPattern except for removing the line 
	//that switch the rgb color to bgr.
	this.getRGBFromPatternForGrid = function(pattern, asHex) {
		
		if(this._getHighlightRGBColorEncoding == false)
			this.setHighlightRGBColorEncoding();
		
		var c = new String();
		if (pattern == null || !pattern.length)
			return "-1";
		var ver = parseInt(pattern);
		var vals = new Array();
		vals = pattern.split(" ");
				
		// Note that the ver == 1 option is not currently supported
		if (ver == 0)
			c = this.getRGB(parseInt(vals[1]), asHex);
		else if (ver >= 14)	{
			var c1 = parseInt(vals[3], 10);
			
			//convert from Windows's Highlight pattern format to Web's format
			if(this._highlightRGBColorEncoding=="0")
				c1 = this.convertColorValueFromWindowsFormat(c1);
			
			c1 = c1.toString(16);
			
			if (c1.length < 6) {
				var i = c1.length;
				c1 = ("000000" + c1).substring(i);
			}
			
			if (!asHex)
				c = parseInt(c1, 16);
			else 
				c = c1;	
		}
				
		return c;
	}
	//TODO: refactoring
	this.getColorFromValue = function (fullfield, val, asHex) {
		//var color = valueColorMap[fullfield + val];	
		var color = this.valueColorMap[this.legendKey + val.toUpperCase()];	
		if (color === undefined){
			//TODO: the size of auto-assigned colors - this._fixedColors are 20,
			//the highlight colors become gray (unassignedColor) if users open more than 20 drawing items.
			var i = this.getMapSize(this.valueColorMap); 
			if ( i < this._fixedColors.length) {
				color = this._fixedColors[i];
				// The color values stored in _fixedColors are prefixed with '0x'
				// strip that off when assigning here
				color = color.substr(2);
			} else{
				color = this.getRGB(this.unassignedColor, true, true);
			}
			this.valueColorMap[this.legendKey + val.toUpperCase()] =  color;
		}
		
		return this.getRGB(parseInt('0x' + color), asHex, true);
	}
	/**
	 * Get the size of associate array object.
	 */
	this.getMapSize = function (map){
		var size = 0, key;
		for (key in map) {
			if (map.hasOwnProperty(key)) size++;
		}
		return size;
	}
	/**
	 * setColor
	 *
	 * @param fullfield:	A table.fieldname
	 * @param val:			The value for the fullfield
	 * @param hexColor:		The color associated with the value.  e.g.  'CC0039'
	 */	
	this.setColor = function (fullfield, val, hexColor) {
		//valueColorMap[fullfield + val] = hexColor;
		
		this.valueColorMap[this.legendKey + val.toUpperCase()] = hexColor;
	}
	
	this.setUnassignedColor = function(c) { this.unassignedColor = c; }
	this.setUnassignedOpacity = function(c) { this.unassignedOpacity = c; }
	this.setUnassignedBorderColor = function(c) { this.unassignedBorderColor = c; }
	this.setUnassignedBorderOpacity = function(c) { this.unassignedBorderOpacity = c; }
	this.setUnassignedBorderThinkness = function(c) { this.unassignedBorderThickness = c; }

	this.setAssignedColor = function(c) { this.assignedColor = c; }
	this.setAssignedOpacity = function(c) { this.assignedOpacity = c; }
	this.setAssignedBorderColor = function(c) { this.assignedBorderColor = c; }
	this.setAssignedBorderOpacity = function(c) { this.assignedBorderOpacity = c; }
	this.setAssignedBorderThinkness = function(c) { this.assignedBorderThickness = c; }
	
	this.setSelectedColor = function(c) { this.selectedColor = c; }
	this.setSelectedOpacity = function(c) { this.selectedOpacity = c; }
	this.setSelectedBorderColor = function(c) { this.selectedBorderColor = c; }
	this.setSelectedBorderOpacity = function(c) { this.selectedBorderOpacity = c; }
	this.setSelectedBorderThinkness  = function(c) { this.selectedBorderThickness = c; }

	this.setNoFillColor = function(c) { this.nofillColor = c; }
	this.setNoFillOpacity = function(c) { this.nofillOpacity = c; }
	this.setNoFillBorderColor = function(c) { this.nofillBorderColor = c; }
	this.setNoFillBorderOpacity = function(c) { this.nofillBorderOpacity = c; }
	this.setNoFillBorderThinkness  = function(c) { this.nofillBorderThickness = c; }

	this.getUnassignedColor = function(asHex) {	
		return this.formatColor(this.unassignedColor, asHex);
	}
	
	this.getAssignedColor = function(asHex) {	
		return this.formatColor(this.assignedColor, asHex);
	}
	
	this.getSelectedColor = function(asHex) {	
		return this.formatColor(this.selectedColor, asHex);
	}
	
	this.formatColor = function(c, asHex) {	
		return this.ensureValidColor(parseInt(c).toString(asHex == true ? 16 : 10).toString(), asHex);
	}
	
	this.ensureValidColor = function(c, asHex) {
		if (asHex == true && c.length < 6) {
			var i = c.length;
			c = ("000000" + c).substring(i);
		}
		
		return c;	
	}
	

	this.map = [
	[0,0,0],
	
	[1,0,0], 
	[1,1,0],
	[0,1,0],
	[0,1,1],
	[0,0,1 ],
	[1, 0, 1 ],
	[1,1,1 ],
	[0.502,0.502,0.502 ],
	[0.753,0.753,0.753 ],
	[1,0, 0 ],				// 10
	
	[1,0.5,0.5 ],
	[0.65,0,0 ],
	[0.65,0.325,0.325], 
	[0.5,0,0 ],
	[0.5,0.25,0.25 ],
	[0.3,0,0 ],
	[0.3,0.15,0.15 ],
	[0.15,0,0 ],
	[0.15,0.075,0.075], 
	[1,0.25,0 ],			// 20
	
	[1,0.625,0.5 ],
	[0.65,0.1625,0 ],
	[0.65,0.4063,0.325 ],
	[0.5,0.125,0 ],
	[0.5,0.3125,0.25 ],
	[0.3,0.075,0 ],
	[0.3,0.1875,0.15 ],
	[0.15,0.0375,0 ],
	[0.15,0.0938,0.075 ],
	[1,0.5,0 ],				// 30
	
	[1,0.75,0.5 ],
	[0.65,0.325,0 ],
	[0.65,0.4875,0.325 ],
	[0.5,0.25,0 ],
	[0.5,0.375,0.25 ],
	[0.3,0.15,0 ],
	[0.3,0.225,0.15 ],
	[0.15,0.075,0 ],
	[0.15,0.1125,0.075 ],
	[1,0.75,0 ],			// 40
	
	[1,0.875,0.5 ],
	[0.65,0.4875,0 ],
	[0.65,0.5688,0.325 ],
	[0.5,0.375,0 ],
	[0.5,0.4375,0.25 ],
	[0.3,0.225,0 ],
	[0.3,0.2625,0.15 ],
	[0.15,0.1125,0 ],
	[0.15,0.1313,0.075 ],
	[1,1,0 ],				// 50
	
	[1,1,0.5 ],
	[0.65,0.65,0 ],
	[0.65,0.65,0.325 ],
	[0.5,0.5,0 ],
	[0.5,0.5,0.25 ],
	[0.3,0.3,0 ],
	[0.3,0.3,0.15 ],
	[0.15,0.15,0 ],
	[0.15,0.15,0.075 ],
	[0.75,1,0 ],			// 60
	
	[0.875,1,0.5 ],
	[,0.4875,0.65,0 ],
	[0.5688,0.65,0.325 ],
	[0.375,0.5,0 ],
	[,0.4375,0.5,0.25 ],
	[0.225,0.3,0 ],
	[0.2625,0.3,0.15 ],
	[0.1125,0.15,0 ],
	[0.1313,0.15,0.075 ],
	[0.5,1,0 ],				// 70
	
	[0.75,1,0.5 ],
	[0.325,0.65,0 ],
	[0.4875,0.65,0.325 ],
	[0.25,0.5,0 ],
	[0.375,0.5,0.25 ],
	[0.15,0.3,0 ],
	[0.225,0.3,0.15 ],
	[0.075,0.15,0 ],
	[0.1125,0.15,0.075 ],
	[0.25,1,0 ],			// 80
	
	[0.625,1,0.5 ],
	[0.1625,0.65,0 ],
	[0.4063,0.65,0.325 ],
	[0.125,0.5,0 ],
	[0.3125,0.5,0.25 ],
	[0.075,0.3,0 ],
	[0.1875,0.3,0.15 ],
	[0.0375,0.15,0 ],
	[0.0938,0.15,0.075 ],
	[0,1,0 ],				// 90
	
	[0.5,1,0.5 ],
	[0,0.65,0 ],
	[0.325,0.65,0.325], 
	[0,0.5,0 ],
	[0.25,0.5,0.25 ],
	[0,0.3,0 ],
	[0.15,0.3,0.15 ],
	[0,0.15,0 ],
	[0.075,0.15,0.075], 
	[0,1,0.25 ],			// 100
	
	[0.5,1,0.625 ],
	[0,0.65,0.1625 ],
	[0.325,0.65,0.4063 ],
	[0,0.5,0.125 ],
	[0.25,0.5,0.3125 ],
	[0,0.3,0.075 ],
	[0.15,0.3,0.1875 ],
	[0,0.15,0.0375 ],
	[0.075,0.15,0.0938 ],
	[0,1,0.5 ],			// 110
	
	[0.5,1,0.75 ],
	[0,0.65,0.325 ],
	[0.325,0.65,0.4875 ],
	[0,0.5,0.25 ],
	[0.25,0.5,0.375 ],
	[0,0.3,0.15 ],
	[0.15,0.3,0.225 ],
	[0,0.15,0.075 ],
	[0.075,0.15,0.1125 ],
	[0,1,0.75 ],			// 120
	
	[0.5,1,0.875 ],
	[0,0.65,0.4875 ],
	[0.325,0.65,0.5688 ],
	[0,0.5,0.375 ],
	[0.25,0.5,0.4375 ],
	[0,0.3,0.225 ],
	[0.15,0.3,0.2625 ],
	[0,0.15,0.1125 ],
	[0.075,0.15,0.1313 ],
	[0,1,1 ],				// 130
	
	[0.5,1,1 ],
	[0,0.65,0.65 ],
	[0.325,0.65,0.65 ],
	[0,0.5,0.5 ],
	[0.25,0.5,0.5 ],
	[0,0.3,0.3 ],
	[0.15,0.3,0.3 ],
	[0,0.15,0.15 ],
	[0.075,0.15,0.15 ],
	[0,0.75,1 ],			// 140
	
	[0.5,0.875,1 ],
	[0,0.4875,0.65 ],
	[0.325,0.5688,0.65 ],
	[0,0.375,0.5 ],
	[0.25,0.4375,0.5 ],
	[0,0.225,0.3 ],
	[0.15,0.2625,0.3 ],
	[0,0.1125,0.15 ],
	[0.075,0.1313,0.15 ],
	[0,0.5,1 ],				//150
	
	[0.5,0.75,1 ],
	[0,0.325,0.65 ],
	[0.325,0.4875,0.65 ],
	[0,0.25,0.5 ],
	[0.25,0.375,0.5 ],
	[0,0.15,0.3 ],
	[0.15,0.225,0.3 ],
	[0,0.075,0.15 ],
	[0.075,0.1125,0.15 ],
	[0,0.25,1 ],			// 160
	
	[0.5,0.625,1 ],
	[0,0.1625,0.65 ],
	[0.325,0.4063,0.65 ],
	[0,0.125,0.5 ],
	[0.25,0.3125,0.5 ],
	[0,0.075,0.3 ],
	[0.15,0.1875,0.3 ],
	[0,0.0375,0.15 ],
	[0.075,0.0938,0.15 ],
	[0,0,1 ],				// 170
	
	[0.5,0.5,1 ],
	[0,0,0.65 ],
	[0.325,0.325,0.65 ],
	[0,0,0.5 ],
	[0.25,0.25,0.5 ],
	[0,0,0.3 ],
	[0.15,0.15,0.3 ],
	[0,0,0.15 ],
	[0.075,0.075,0.15], 
	[0.25,0,1 ],			// 180
	
	[0.625,0.5,1 ],
	[0.1625,0,0.65 ],
	[0.4063,0.325,0.65 ],
	[0.125,0,0.5 ],
	[0.3125,0.25,0.5 ],
	[0.075,0,0.3 ],
	[0.1875,0.15,0.3 ],
	[0.0375,0,0.15 ],
	[0.0938,0.075,0.15 ],
	[0.5,0,1 ],			// 190
	
	[0.75,0.5,1 ],
	[0.325,0,0.65 ],
	[0.4875,0.325,0.65 ],
	[0.25,0,0.5 ],
	[0.375,0.25,0.5 ],
	[0.15,0,0.3 ],
	[0.225,0.15,0.3 ],
	[0.075,0,0.15 ],
	[0.1125,0.075,0.15 ],
	[0.75,0,1 ],			// 200
	
	[0.875,0.5,1 ],
	[0.4875,0,0.65 ],
	[0.5688,0.325,0.65 ],
	[0.375,0,0.5 ],
	[0.4375,0.25,0.5 ],
	[0.225,0,0.3 ],
	[0.2625,0.15,0.3 ],
	[0.1125,0,0.15 ],
	[0.1313,0.075,0.15 ],
	[1,0,1 ],					// 210
	
	[1,0.5,1 ],
	[0.65,0,0.65 ],
	[0.65,0.325,0.65 ],
	[0.5,0,0.5 ],
	[0.5,0.25,0.5 ],
	[0.3,0,0.3 ],
	[0.3,0.15,0.3 ],
	[0.15,0,0.15 ],
	[0.15,0.075,0.15 ],
	[1,0,0.75 ],				// 220
	
	[1,0.5,0.875 ],
	[0.65,0,0.4875 ],
	[0.65,0.325,0.5688 ],
	[0.5,0,0.375 ],
	[0.5,0.25,0.4375 ],
	[0.3,0,0.225 ],
	[0.3,0.15,0.2625 ],
	[0.15,0,0.1125 ],
	[0.15,0.075,0.1313 ],
	[1,0,0.5 ],			// 230
	
	[1,0.5,0.75 ],
	[0.65,0,0.325 ],
	[0.65,0.325,0.4875 ],
	[0.5,0,0.25 ],
	[0.5,0.25,0.375 ],
	[0.3,0,0.15 ],
	[0.3,0.15,0.225 ],
	[0.15,0,0.075 ],
	[0.15,0.075,0.1125 ],
	[1,0,0.25 ],			// 240
	
	[1,0.5,0.625 ],
	[0.65,0,0.1625 ],
	[0.65,0.325,0.4063 ],
	[0.5,0,0.125 ],
	[0.5,0.25,0.3125 ],
	[0.3,0,0.075 ],
	[0.3,0.15,0.1875 ],
	[0.15,0,0.0375 ],
	[0.15,0.075,0.0938 ],
	[0.33,0.33,0.33 ],		// 250
	
	[0.464,0.464,0.464 ],
	[0.598,0.598,0.598 ],
	[0.732,0.732,0.732 ],
	[0.866,0.866,0.866 ],
	[1,1, 1 ]
];

};
