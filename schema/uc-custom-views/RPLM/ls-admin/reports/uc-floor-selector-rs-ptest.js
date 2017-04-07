// CHANGE LOG
// 2010/12/15 - Removed the initial addDrawing if there's no restriction.
var drawingController = View.createController('drawingController', {
    currentRestriction: null,

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

		var ruleset = new DwgHighlightRuleSet();

		ruleset.appendRule("fhbm.material_type", "NSM", "ff0000", "=", "NSM");
		this.cadPanel.appendRuleSet("highlightFHBMDs", ruleset);

		// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
	}
});


function onClickHandler(pk, selected)
{
	if (selected) {
		/*
		var args = new Object ();
		args.target = 'opener';
		args.type ='openDialog';
		args.parentPanelId = this.id;
		args.viewName = 'uc-rm-detail-separate-window-drawing-popup.axvw';
		args.width = 300;
		args.height = 600;

		var myDlgCmd = new Ab.command.openDialog(args);
		var r = new Ab.view.Restriction();
		r.addClause("rm.bl_id", pk[0], "=", true);
		r.addClause("rm.fl_id", pk[1], "=", true);
		r.addClause("rm.rm_id", pk[2], "=", true);
		myDlgCmd.restriction = r;
		myDlgCmd.handle();
		*/

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
    drawingController.currentRestriction = ob.restriction;
	View.getControl('', 'cadPanel').addDrawing(ob.restriction);
}

function exportRmOccPage() {

    var restriction = drawingController.currentRestriction;

    var bl_id = restriction.findClause('fl.bl_id').value;
    var fl_id = restriction.findClause('fl.fl_id').value;
    var parameters = null;

    var parameters = {'ds_abExRmxdpDwgRpt_highlightData_bl_id':bl_id,'ds_abExRmxdpDwgRpt_highlightData_fl_id':fl_id};

    View.openPaginatedReportDialog('uc-rmoccupant-dwg-rpt.axvw', null, parameters);
}