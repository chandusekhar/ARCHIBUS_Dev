/**
 * Called when loading the form<br />
 * Create restriction and refresh report
 */
var showToolReservationController = View.createController('showToolReservationController', {
    sched_wr_tl_res_tool_info_afterRefresh: function(){
        var tool = this.sched_wr_tl_res_tool_info.getFieldValue("tl.tool_id");
        var rest = new Ab.view.Restriction();
        rest.addClause("wrtl.tool_id", tool, '=');
        this.sched_wr_tl_res_tool_report.refresh(rest);
    }
});
