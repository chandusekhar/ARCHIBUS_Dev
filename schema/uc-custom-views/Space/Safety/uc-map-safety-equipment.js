var drawingController = View.createController('drawingController', {

	afterViewLoad: function() {	
	

		// Use the following ruleset to mange the applied highlights
		
		var ruleset = new DwgHighlightRuleSet();
		ruleset.appendRule("rm.count_em", "1", "00CCFF", "==");
		ruleset.appendRule("rm.count_em", "2", "0099CC", "==");
		ruleset.appendRule("rm.count_em", "3", "009966", "==");
		ruleset.appendRule("rm.count_em", "4 or more", "00CC33", "==", "", false, true);
		//ruleset.appendRule("eq.eq_std", "FIREX-XXXX-XXXXX", "FF0000", "==", false, true);
		//ruleset.appendRule("rm.count_em", "2", "0099CC", "==");
		//ruleset.appendRule("rm.count_em", "3", "009966", "==");
		//ruleset.appendRule("rm.count_em", "4 or more", "00CC33", "==", "", false, true);
		
		this.cadPanel.appendRuleSet("Safety Highlight", ruleset);
	},

	afterInitialDataFetch: function() {
		// load the drawing based on the queryString
//		var bl_id = window.location.parameters['bl_id'];
//		var fl_id = window.location.parameters['fl_id'];
		
		// add drawing takes a restriction object
//		var rest = new Ab.view.Restriction();
//		rest.addClause("fl.bl_id", bl_id, "=");
//		rest.addClause("fl.fl_id", fl_id, "=");

//		this.cadPanel.addDrawing(rest, null);
		
		
//		var ruleset = new DwgHighlightRuleSet();
		
//		ruleset.appendRule("fhbm.material_type", "NSM", "ff0000", "=", "NSM");
//		this.cadPanel.appendRuleSet("highlightFHBMDs", ruleset);
		
		// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
	}
});












function onClickHandler(pk, selected)
{
	if (selected) {
		
		
		var dlgConfig = new Object();
		//dlgConfig.width = 300;
		//dlgConfig.height = 600;
		dlgConfig.closeButton = false;
		
		var rest = new Ab.view.Restriction();
		rest.addClause("rm.bl_id", pk[0], "=", true);
		rest.addClause("rm.fl_id", pk[1], "=", true);
		rest.addClause("rm.rm_id", pk[2], "=", true);
		
		View.openDialog('uc-map-safety-popup.axvw', rest, false, dlgConfig);
	}
}



function onTreeClick(ob) {
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}


