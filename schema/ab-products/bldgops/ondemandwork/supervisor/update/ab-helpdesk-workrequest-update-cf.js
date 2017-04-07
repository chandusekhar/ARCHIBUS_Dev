/**
 * Called when form is loading<br />
 * Create restriction and refresh bottom panel
 */
var cfUpdateController = View.createController('cfUpdateController', {
    wo_upd_cf_wr_basic_afterRefresh: function(){
        this.refreshGridPanel();
    },
    refreshGridPanel: function(){
        var wrId = this.wo_upd_cf_wr_basic.getFieldValue('wr.wr_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wrcf.wr_id", wrId, '=');
        this.requestReportGrid.refresh(restriction);
    }
});

/**
 * Open dialog for new craftsperson assigment, with work request code set to current work request
 */
function addCfToWr(){
    var panel = View.panels.get('wo_upd_cf_wr_basic');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrcf.wr_id", wrId, "=");
    rest.addClause("wrcf.cf_id", '', "=");
    View.openDialog("ab-helpdesk-cf-workrequest-cf.axvw", rest, true);
}
