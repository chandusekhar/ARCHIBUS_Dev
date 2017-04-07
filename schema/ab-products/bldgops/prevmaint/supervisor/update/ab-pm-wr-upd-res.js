/**
 * Called when form is loading<br />
 * Create restriction and refresh panels
 */
var resourceUpdateController = View.createController('resourceUpdateController', {
    wo_upd_wr_form_afterRefresh: function(){
        this.refreshGridPanel();
    },
    refreshGridPanel: function(){
        var wr = this.wo_upd_wr_form.getFieldValue('wr.wr_id');
        var ptrest = new Ab.view.Restriction();
        ptrest.addClause("wrpt.wr_id", wr, '=');
        this.wo_upd_pt_report.refresh(ptrest);
        
        var tlrest = new Ab.view.Restriction();
        tlrest.addClause("wrtl.wr_id", wr, '=');
        this.wo_upd_tl_report.refresh(tlrest);
        
        var otrest = new Ab.view.Restriction();
        otrest.addClause("wr_other.wr_id", wr, '=');
        this.wo_upd_other_report.refresh(otrest);
    }
});

/**
 * Open dialog to add part to current work request
 */
function addPart(){
    var panel = View.getControl('', 'wo_upd_wr_form');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrpt.wr_id", wrId, "=");
    rest.addClause("wrpt.part_id", '', "=");
    View.openDialog("ab-pm-wr-newpt.axvw", rest, true);
}

/**
 * Open dialog to add other cost to current work request
 */
function addOther(){
    var panel = View.getControl('', 'wo_upd_wr_form');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wr_other.wr_id", wrId, "=");
    rest.addClause("wr_other.other_rs_type", '', "=");
    View.openDialog("ab-pm-cf-wr-newother.axvw", rest, true);
}

/**
 * Open dialog to add tool to current work request
 */
function addTool(){
    var panel = View.getControl('', 'wo_upd_wr_form');
    var wrId = panel.getFieldValue("wr.wr_id");
    var rest = new Ab.view.Restriction();
    rest.addClause("wrtl.wr_id", wrId, "=");
    rest.addClause("wrtl.tool_id", '', "=");
    View.openDialog("ab-pm-wr-newtl.axvw", rest, true);
}

