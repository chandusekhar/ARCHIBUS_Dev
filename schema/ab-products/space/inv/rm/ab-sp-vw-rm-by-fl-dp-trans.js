var flid = "", blid = "", dpid = "", dvid = "", restrictionID;
View.createController('vwRmbyFlDp', {

    dpPanel_afterRefresh: function(){
        var dpPanel = this.dpPanel;
        dpPanel.setTitle(getMessage('setTitleForDp') + ' ' + blid + "-" + flid);
    },
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + blid + "-" + flid + ", " + dvid + "-" + dpid);
    }
})

function showDpPanel(){
    var flPanel = View.panels.get("flPanel");
    var selectedRowIndex = flPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        flid = flPanel.rows[selectedRowIndex]['fl.fl_id'];
        blid = flPanel.rows[selectedRowIndex]['fl.bl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rmpct.fl_id", flid, "=");
        restrictionID.addClause("rmpct.bl_id", blid, "=");
        View.panels.get("dpPanel").refresh(restrictionID);
    }
}


function showRmPanel(){
    var dpPanel = View.panels.get("dpPanel");
    var selectedRowIndex = dpPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        flid = dpPanel.rows[selectedRowIndex]['rmpct.fl_id'];
        blid = dpPanel.rows[selectedRowIndex]['rmpct.bl_id'];
        dpid = dpPanel.rows[selectedRowIndex]['rmpct.dp_id'];
        dvid = dpPanel.rows[selectedRowIndex]['rmpct.dv_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rmpct.fl_id", flid, "=");
        restrictionID.addClause("rmpct.bl_id", blid, "=");
        if (dpid) {
            restrictionID.addClause("rmpct.dp_id", dpid, "=");
        }
        else {
            restrictionID.addClause("rmpct.dp_id", '', "IS NULL");
        }
        if (dvid) {
            restrictionID.addClause("rmpct.dv_id", dvid, "=");
        }
        else {
            restrictionID.addClause("rmpct.dv_id", '', "IS NULL");
        }
        
        View.panels.get("rmPanel").refresh(restrictionID);
    }
}
