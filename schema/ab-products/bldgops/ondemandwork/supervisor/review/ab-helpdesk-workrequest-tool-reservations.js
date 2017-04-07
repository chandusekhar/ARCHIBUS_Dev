/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workrequest-tool-reservations.axvw' target='main'>ab-helpdesk-workrequest-tool-reservations.axvw</a>
 */
var toolReservController = View.createController('toolReserv', {

    /**
     * Called when loading the form<br />
     * Create restriction and refresh report<br />
     */
    tool_info_afterRefresh: function(){
		/*
        var tool = this.tool_info.getFieldValue("tl.tool_id");
        var rest = new Ab.view.Restriction();
        rest.addClause("wrtl.tool_id", tool, '=');
        var grid = View.getControl('', 'tool_report');
        grid.refresh(rest);
        */
    }
})
