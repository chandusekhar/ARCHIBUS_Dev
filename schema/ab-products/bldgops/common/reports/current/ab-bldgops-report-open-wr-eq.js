var abBldgopsReportOpenWrEqController = View.createController('abBldgopsReportOpenWrEqController', {
	otherRes:' 1=1 ',
	fieldsArraysForRestriction: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type','like'], ['wr.supervisor'], ['wr.work_team_id']),
    
	abBldgopsReportOpenWrEqConsole_onFilter : function() {
		this.otherRes = getRestrictionStrFromConsole(this.abBldgopsReportOpenWrEqConsole, this.fieldsArraysForRestriction);	
		this.abBldgopsReportOpenWrEqReport.show(true);
		this.abBldgopsReportOpenWrEqReport.refresh(this.otherRes);
	},

	abBldgopsReportOpenWrEqConsole_onClear : function() {	
		this.abBldgopsReportOpenWrEqConsole.clear();
		this.abBldgopsReportOpenWrEqReport.show(false);
	}
});

function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abBldgopsReportOpenWrEqGrid');
    var parentController =View.controllers.get('abBldgopsReportOpenWrEqController');
	onOpenWrCrossTableClick(obj, parentController, detailGrid, "wr.eq_id", "wr.status");
}
