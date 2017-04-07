var drawingController = View.createController('drawingController', {
	afterInitialDataFetch: function() {
		// load the drawing based on the queryString
		var bl_id = window.location.parameters['bl_id'];
		var fl_id = window.location.parameters['fl_id'];

		// add drawing takes a restriction object
		var rest = new Ab.view.Restriction();
		rest.addClause("fl.bl_id", bl_id, "=");
		rest.addClause("fl.fl_id", fl_id, "=");

		if (bl_id != null && bl_id != "") {
            this.cadPanel.addDrawing(rest, null);
        }

		//var ruleset = new DwgHighlightRuleSet();

		//ruleset.appendRule("fhbm.material_type", "NSM", "ff0000", "=", "NSM");
		//this.cadPanel.appendRuleSet("highlightFHBMDs", ruleset);

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

		View.openDialog('uc-rm-detail-separate-window-drawing-popup.axvw', rest, false, dlgConfig);
	}
}



function onTreeClick(ob) {
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}




