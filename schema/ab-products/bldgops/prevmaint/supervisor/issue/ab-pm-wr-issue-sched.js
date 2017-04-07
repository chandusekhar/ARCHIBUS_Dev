
/**
 * Called when form is loading<br />
 * Create restriction and reload panels
 */
var wrScheduleController = View.createController('wrScheduleController', {
    wo_issue_sched_console_afterRefresh: function(){
        this.refreshGridPanel();
    },
    refreshGridPanel: function(){
        var wo = this.wo_issue_sched_console.getFieldValue("wo.wo_id");
        var rest = new Ab.view.Restriction();
        rest.addClause("wr.wo_id", wo, '=');
        this.wo_issue_sched_cf_report.refresh(rest);
        this.wo_issue_sched_pt_report.refresh(rest);
        this.wo_issue_sched_tl_report.refresh(rest);
        this.wo_issue_sched_other_report.refresh(rest);
    }
});
