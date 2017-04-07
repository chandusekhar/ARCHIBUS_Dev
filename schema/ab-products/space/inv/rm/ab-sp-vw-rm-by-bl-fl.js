View.createController('vwRmbyBlFl', {

    flPanel_afterRefresh: function(){
        var flPanel = this.flPanel;
        if (this.flPanel.restriction != null) {
            flPanel.setTitle(getMessage('setTitleForFl') + ' ' + this.flPanel.restriction['bl.bl_id']);
        }
        else 
            flPanel.setTitle(getMessage('setTitleForFl'));
    },
    
    rmPanel_afterRefresh: function(){
        var rmPanel = this.rmPanel;
        rmPanel.setTitle(getMessage('setTitleForRm') + ' ' + this.rmPanel.restriction['fl.bl_id'] + "-" + this.rmPanel.restriction['fl.fl_id']);
    },

	blPanel_onOpenPaginateReport: function(){
			var blRestriction = new Ab.view.Restriction();
			var blGrid = this.blPanel;
			if ( blGrid.selectedRowIndex>=0 ) {
				var record = blGrid.gridRows.get(blGrid.selectedRowIndex).getRecord();
				var blId = record.getValue('bl.bl_id');
				blRestriction.addClause('bl.bl_id', blId , '=');
			}

			var flRestriction = new Ab.view.Restriction();
			var flGrid = this.flPanel;
			if ( flGrid.selectedRowIndex>=0 ) {
				var record = flGrid.gridRows.get(flGrid.selectedRowIndex).getRecord();
				var flId = record.getValue('fl.fl_id');
				flRestriction.addClause('fl.fl_id', flId , '=');
			}

			//paired dataSourceId with Restriction objects
			var passedRestrictions = {'ds_abViewdefPaginatedParentParentChild_owner2': blRestriction, 'ds_abViewdefPaginatedParentParentChild_owner': flRestriction};
			
			//passing restrictions
			View.openPaginatedReportDialog("ab-sp-vw-rm-by-bl-fl-prnt.axvw", passedRestrictions);	
	}
})
