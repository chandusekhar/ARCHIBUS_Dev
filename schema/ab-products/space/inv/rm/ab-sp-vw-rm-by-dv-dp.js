
View.createController('vwRmbyDvDp', {

    dpPanel_afterRefresh: function(){
        var dpPanel = this.dpPanel;
        if (this.dpPanel.restriction != null) {
            dpPanel.setTitle(getMessage('setTitleForDp') + ' ' + this.dpPanel.restriction['dv.dv_id']);
        }
        else 
            dpPanel.setTitle(getMessage('setTitleForDp'));
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        if (this.rmPanel.restriction != null || this.rmPanel.restriction != null) 
            rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['dp.dv_id'] + "-" + this.rmPanel.restriction['dp.dp_id']);
    },

	dvPanel_onOpenPaginateReport: function(){  
			var dvRestriction = new Ab.view.Restriction();
			var dvGrid = this.dvPanel;
			if ( dvGrid.selectedRowIndex>=0 ) {
				var record = dvGrid.gridRows.get(dvGrid.selectedRowIndex).getRecord();
				var dvId = record.getValue('dv.dv_id');
				dvRestriction.addClause('dv.dv_id', dvId , '=');
			}

			var dpRestriction = new Ab.view.Restriction();
			var dpGrid = this.dpPanel;
			if ( dpGrid.selectedRowIndex>=0 ) {
				var record = dpGrid.gridRows.get(dpGrid.selectedRowIndex).getRecord();
				var dpId = record.getValue('dp.dp_id');
				dpRestriction.addClause('dp.dp_id', dpId , '=');
			}
			//paired dataSourceId with Restriction objects
			var passedRestrictions = {'ds_abViewdefPaginatedParentParentChild_owner2': dvRestriction, 'ds_abViewdefPaginatedParentParentChild_owner': dpRestriction};
			
			//passing restrictions
			View.openPaginatedReportDialog("ab-sp-vw-rm-by-dv-dp-prnt.axvw", passedRestrictions);	
	}
})
