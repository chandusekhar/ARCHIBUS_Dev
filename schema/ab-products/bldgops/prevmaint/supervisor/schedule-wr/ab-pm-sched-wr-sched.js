/**
 * Called when loading the form
 */
var wrScheduleController = View.createController('wrScheduleController', {
    sched_wr_shced_wr_form_afterRefresh: function(){
        this.refreshGridPanel();
    },
    
    refreshGridPanel: function(){
        var wr_id = this.sched_wr_shced_wr_form.getFieldValue('wr.wr_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wr.wr_id", wr_id, '=');
        this.sched_wr_shced_tr_report.refresh(restriction);
        this.sched_wr_shced_cf_report.refresh(restriction);
        this.sched_wr_shced_tool_report.refresh(restriction);
    }
});

/**
 * Complete work request schedule<br />
 * Called by 'Complete Schedule' button<br />
 * Reloads select tab
 */
function completeScheduling(){
    View.parentTab.parentPanel.selectTab('select');
}

/**
 * Open dialog for new tool assignment, with work request code set to current work request
 */
function addTool(){
    var panel = View.getControl('', 'sched_wr_shced_wr_form');
    var wrId = panel.getFieldValue('wr.wr_id');
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrtl.wr_id", wrId, "=");
    rest.addClause("wrtl.tool_id", '', "=");
    View.openDialog("ab-pm-sched-wr-tl.axvw", rest, true);
}

/**
 * Open dialog for new craftsperson assigment, with work request code set to current work request
 */
function addCfToWr(){
    var panel = View.getControl('', 'sched_wr_shced_wr_form');
    var wrId = panel.getFieldValue('wr.wr_id');
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrcf.wr_id", wrId, "=");
    rest.addClause("wrcf.cf_id", '', "=");
    View.openDialog("ab-pm-sched-wr-cf.axvw", rest, true);
}
