var Hpattern = Base.extend({
	getColor: function(value, colorVal) {
		
		if (value == undefined)
			value = '';
		  content = '';

		var hpattern = new HighlightPattern(value);

		// workaround enceError: Workflow is not defined line 61
		//gAcadColorMgr.setHighlightRGBColorEncoding = null;		
		//gAcadColorMgr._highlightRGBColorEncoding = 1;
		//gAcadColorMgr.setHighlightRGBColorEncoding();
		//gAcadColorMgr._getHighlightRGBColorEncoding = true;
		
		if (hpattern.isHatched()) {
	    	// HATCHED pattern
			/*
			var bitmapName = this.getLegendBitmapName(column.id, row, hpattern);
			if (bitmapName) {
				//KB# 3036630 - fill the cell with hatch pattern.
				//kb# 3036164 - fix "unusual row height when bitmap images are not yet generated."
	            //content = "<img src='" + View.project.projectGraphicsFolder + '/' + bitmapName + ".png' hspace='0' border='0' style='width:100%;height:16px;'/>";
				content = bitmapName + '.png';
			}
			*/
	    	
		} else {
			// handle possibility that the raw value passed in is a hex value already

			var color = '';

			if (value.substr(0,2) == '0x') {
				color = value.substr(2);
		    } else {
		    	//color = gAcadColorMgr.getColorFromValue("", value, true);
				color = gAcadColorMgr.getRGBFromPatternForGrid(value, true);

				if (color == "-1") {
					if (colorVal == undefined || !colorVal.length) {
						color = gAcadColorMgr.getUnassignedColor(true);
					} else {
						color = gAcadColorMgr.getColorFromValue(colorVal, true);						
					}
				}
			}

			/*
			var legendKeyColumn = this.getLegendKeyColumn();
			if(valueExists(legendKeyColumn)){
				gAcadColorMgr.setColor(legendKeyColumn.id, row[legendKeyColumn.id], color);
			}
			*/
						
			//var style = (valueExistsNotEmpty(this.colorOpacity)) ? 'opacity: ' + this.colorOpacity + '; filter: alpha(opacity=\'' + (this.colorOpacity * 100).toFixed() + '\')' : '';
			//content = '<div class="colorSwatch" style="background-color:#' + color + ';' + style + '"></div>';
			//content = color;
	    }

		//return content;
		return color;
	},
	
	getLegendBitmapName: function(id, row, hpattern) {
		return null;
	}
});


// from ab-data.js
HighlightPattern = Base.extend({
	
	// hpattern string
	pattern: '',
	
	// pattern parts
	patternParts: null,
	
	/**
	 * Constructor.
	 */
	constructor: function(pattern) {
	    this.pattern = pattern;
		this.patternParts = pattern.split(' ');
    },
    
    isNewFormat: function() {
    	return (this.patternParts[0] == '14');
    },
    
    isHatched: function() {
		return (this.patternParts[this.isNewFormat() ? 1 : 0] == '1');
    },
    
    getLegendBitmapName: function(tableName, primaryKeyValues) {
    	// table name
    	var name = tableName + '-';
    	
    	// primary key values
    	for (var i = 0; i < primaryKeyValues.length; i++) {
    		name = name +  primaryKeyValues[i];
    	}
    	
    	// pattern name
    	name = name  + this.patternParts[this.isNewFormat() ? 6 : 3];
    	
    	// remove spaces
    	name = name.replace(/\s/g, '');
    	
    	// convert to lower case
    	name = name.toLowerCase();
    	
    	// replace invalid file name special characters
    	name = name.replace(/\&/g, '').replace(/\#/g, '').replace(/\'/g, '').replace(/\"/g, '').replace(/\~/g, '').replace(/\*/g, '').replace(/\$/g, '').replace(/\%/g, '');
    	return name;
    }
});
