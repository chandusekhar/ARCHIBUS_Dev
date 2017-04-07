var abBldgopsReportOpenWrTeamController = View.createController('abBldgopsReportOpenWrTeamController', {
	otherRes:' 1=1 ',
	fieldsArraysForRestriction: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type','like'], ['wr.eq_id']),

	abBldgopsReportOpenWrTeamConsole_onFilter : function() {
		this.otherRes = this.getConsoleRestriction();
		this.abBldgopsReportOpenWrTeamReport.show(true);
		this.abBldgopsReportOpenWrTeamReport.refresh(this.otherRes);
	},

	getConsoleRestriction : function() {
		var console = this.abBldgopsReportOpenWrTeamConsole;
		var otherRes = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);
		var eqStd = console.getFieldValue("eq.eq_std");
		if(eqStd){
			otherRes = otherRes + " AND EXISTS ( SELECT 1 FROM eq WHERE eq.eq_id=wr.eq_id AND "+ getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) +")";
		}
		return otherRes;
	},
		
	abBldgopsReportOpenWrTeamConsole_onClear : function() {	
		this.abBldgopsReportOpenWrTeamConsole.clear();
		this.abBldgopsReportOpenWrTeamReport.show(false);
	}
});

function onCrossTableClick(obj){
	var detailGrid = View.panels.get('abBldgopsReportOpenWrTeamGrid');
    var parentController =View.controllers.get('abBldgopsReportOpenWrTeamController');
	onOpenWrCrossTableClick(obj, parentController, detailGrid, "wr.work_team_id", "wr.status");
}
