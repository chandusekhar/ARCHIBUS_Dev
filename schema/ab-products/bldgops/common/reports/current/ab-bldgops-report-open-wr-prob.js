var abBldgopsReportOpenWrProbController = View.createController('abBldgopsReportOpenWrProbController', {
	otherRes:' 1=1 ',
  	fieldsArraysForRestriction: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type'], ['wr.supervisor'], ['wr.work_team_id'], ['wr.eq_id']),
  
	abBldgopsReportOpenWrProbConsole_onFilter : function() {
		this.otherRes = this.getConsoleRestriction();
		this.abBldgopsReportOpenWrProbReport.show(true);
		this.abBldgopsReportOpenWrProbReport.refresh(this.otherRes);
	},

	getConsoleRestriction : function() {
		var console = this.abBldgopsReportOpenWrProbConsole;
		var otherRes = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);
		var eqStd = console.getFieldValue("eq.eq_std");
		if(eqStd){
			otherRes = otherRes + " AND EXISTS ( SELECT 1 FROM eq WHERE eq.eq_id=wr.eq_id AND "+ getMultiSelectFieldRestriction(['eq.eq_std'],eqStd) +")";
		}
		return otherRes;
	},
		
	abBldgopsReportOpenWrProbConsole_onClear : function() {	
		this.abBldgopsReportOpenWrProbConsole.clear();
		this.abBldgopsReportOpenWrProbReport.show(false);
	}
});

function onCrossTableClick(obj){
	var detailGrid = View.panels.get('abBldgopsReportOpenWrProbGrid');
    var parentController =View.controllers.get('abBldgopsReportOpenWrProbController');
	onOpenWrCrossTableClick(obj, parentController, detailGrid, "wr.prob_type", "wr.status");
}
