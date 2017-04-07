var ucScReportSpaceAssign = View.createController('ucScReportSpaceAssign', {
	afterViewLoad: function() {
		this.inherit();
	},

	grid_results_onActionInfo: function(row) {
		var pms_id = row.getRecord().getValue('pmdd.pms_id');
		var restriction = "pms.pms_id="+pms_id;
		this.schedule_info.refresh(restriction);
		this.schedule_info.showInWindow({
			newRecord: false,
			closeButton: true
        });
	}
});

function setFilterAndRender() {

	var restriction = "1=1";
	var console = View.panels.get('consolePanel');
	var showReport=true;

	var bl_id = console.getFieldValue('rm.bl_id');
	if (bl_id != '') {
		restriction += " AND rm.bl_id = "+restLiteral(bl_id);
	}

	var fl_id = console.getFieldValue('rm.fl_id');
	if (fl_id != '') {
		restriction += " AND rm.fl_id = "+restLiteral(fl_id);
	}

	if(showReport) {
		// apply restriction to the report
		var report = View.panels.get('grid_results');
		report.refresh(restriction);

		// show the report
		report.show(showReport);
	}
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}