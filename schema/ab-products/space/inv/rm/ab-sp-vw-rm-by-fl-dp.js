var flid = "", blid = "", dpid = "", dvid = "", restrictionID;
View.createController('vwRmbyFlDp', {

    dpPanel_afterRefresh: function(){
        var dpPanel = this.dpPanel;
        dpPanel.setTitle(getMessage('setTitleForDp') + ' ' + blid + "-" + flid);
    },
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + blid + "-" + flid + ", " + dvid + "-" + dpid);
    },

	flPanel_onOpenPaginateReport: function(){  
			var flRestriction = new Ab.view.Restriction();
			var flGrid = this.flPanel;
			if ( flGrid.selectedRowIndex>=0 ) {
				var record = flGrid.gridRows.get(flGrid.selectedRowIndex).getRecord();
				var blId = record.getValue('fl.bl_id');
				var flId = record.getValue('fl.fl_id');
				flRestriction.addClause('fl.bl_id', blId , '=');
				flRestriction.addClause('fl.fl_id', flId , '=');
			}

			var dpRestriction = new Ab.view.Restriction();
			var dpGrid = this.dpPanel;
			if ( dpGrid.selectedRowIndex>=0 ) {
				var record = dpGrid.gridRows.get(dpGrid.selectedRowIndex).getRecord();
				var dvId = record.getValue('rm.dv_id');
				var dpId = record.getValue('rm.dp_id');
				dpRestriction.addClause('dp.dv_id', dvId , '=');
				dpRestriction.addClause('dp.dp_id', dpId , '=');
			}
			//paired dataSourceId with Restriction objects
			var passedRestrictions = {'ds_ab-sp-vw-rm-by-fl-dp_prnt_grid_fl': flRestriction, 'ds_ab-sp-vw-rm-by-fl-dp_prnt_grid_dp': dpRestriction};
			
			//passing restrictions
			View.openPaginatedReportDialog("ab-sp-vw-rm-by-fl-dp-prnt.axvw", passedRestrictions);	
	}
})

function showDpPanel(){
    var flPanel = View.panels.get("flPanel");
    var selectedRowIndex = flPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        flid = flPanel.rows[selectedRowIndex]['fl.fl_id'];
        blid = flPanel.rows[selectedRowIndex]['fl.bl_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rm.fl_id", flid, "=");
        restrictionID.addClause("rm.bl_id", blid, "=");
        View.panels.get("dpPanel").refresh(restrictionID);
    }
}


function showRmPanel(){
    var dpPanel = View.panels.get("dpPanel");
    var selectedRowIndex = dpPanel.selectedRowIndex;
    if (selectedRowIndex != -1) {
        flid = dpPanel.rows[selectedRowIndex]['rm.fl_id'];
        blid = dpPanel.rows[selectedRowIndex]['rm.bl_id'];
        dpid = dpPanel.rows[selectedRowIndex]['rm.dp_id'];
        dvid = dpPanel.rows[selectedRowIndex]['rm.dv_id'];
        restrictionID = new Ab.view.Restriction();
        restrictionID.addClause("rm.fl_id", flid, "=");
        restrictionID.addClause("rm.bl_id", blid, "=");
        if (dpid) {
            restrictionID.addClause("rm.dp_id", dpid, "=");
        }
        else {
            restrictionID.addClause("rm.dp_id", '', "IS NULL");
        }
        if (dvid) {
            restrictionID.addClause("rm.dv_id", dvid, "=");
        }
        else {
            restrictionID.addClause("rm.dv_id", '', "IS NULL");
        }
        
        View.panels.get("rmPanel").refresh(restrictionID);
    }
}
