/**
 * holds the svg drawing parameters loaded from database.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 * 
 */
var SavedParameters = Base.extend({
	
    viewBox: null,
    
    redmarks: null,
    
    selectedPlanType: null,
    
    planTypeGroup: null,
    
    filter: null,
    
	constructor: function(){
		// clear all parameters
		this.reset();
	},

	reset: function(){

		this.viewBox = null;
		
		this.redmarks = null;
		
		this.selectedPlanType = null;
	    
		this.planTypeGroup = null;
	    
		this.filter = null;

	},
	
	/**
	 * load the parameters value from database and set.
	 */
	load: function(record, svgControl){
		
		this.viewBox = [];
		
		this.viewBox[0] = record.getValue("afm_redlines.extents_lux");
		this.viewBox[1] = record.getValue("afm_redlines.extents_luy");
		this.viewBox[2] = record.getValue("afm_redlines.extents_rlx");
		this.viewBox[3] = record.getValue("afm_redlines.extents_rly");

		var highlight_defs = record.getValue("afm_redlines.highlight_defs");
		if(highlight_defs){
			var highlightJson = JSON.parse(highlight_defs);
			
			if(highlightJson && highlightJson["planType"]){
				this.selectedPlanType = highlightJson["planType"].selectedPlanType;
				this.planTypeGroup = highlightJson["planType"].planTypeGroup;
			}
			if(highlightJson && highlightJson["planType"]){
				this.filter = highlightJson["filter"];
			}
		}
		
		var html5_redlines = record.getValue("afm_redlines.html5_redlines");
		if(html5_redlines)
			this.loadRedmarks(record, svgControl);
		
	},
	
	/**
	 * download redmarks string from database then add to the svg control
	 */
	loadRedmarks: function(record, svgControl){
		// retrieve the from redlines doc table
		var auto_number = record.getValue("afm_redlines.auto_number");
		var fileName = "afm_redlines-" + auto_number + "-html5_redlines.txt";
		var keys = {'auto_number': auto_number};
		var parameters = { "tableName": "afm_redlines",
				   "fieldName": "html5_redlines",
				   "documentName": fileName
				  };
		var control = this;
		DrawingSvgService.checkOut(keys, parameters, {
		        callback: function(redmarks) {
		        	if(redmarks){
		        		control.redmarks = redmarks;
		        		
		           	 	if(redmarks)
		           	 		svgControl.addRedmarks(redmarks);
		        	}
		        },
		        errorHandler: function(m, e) {
		            Ab.view.View.showException(e);
		        }
		});
	}
});