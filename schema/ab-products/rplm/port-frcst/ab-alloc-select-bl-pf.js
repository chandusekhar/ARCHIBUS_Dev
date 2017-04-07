var allocSelectBlController = View.createController('allocSelectBl', {
	gridRow:null,

	afterInitialDataFetch: function(){
		this.blGrid.isCollapsed = false;
		this.blGrid.enableSelectAll(false);
	},

	blGrid_onNext: function(){
		if (this.gridRow != null){
			this.saveData();
			View.controllers.get('allocWizard').navigateToTab('page1');
		}
		else
		{
			View.showMessage(getMessage('error_bl_id'));
		}
	},	

	blGrid_multipleSelectionColumn_onClick: function(row){
		if(this.gridRow != null){
			this.gridRow.select(false);
		}
		if(row.isSelected()){
			this.gridRow = row;
		}
		else{
			this.gridRow = null;
		}
	},

	restoreSelection:function(){
		var blId = this.tabs.wizard.getBl();
		for(var i=0;i<this.blGrid.gridRows.getCount();i++){
			this.blGrid.gridRows.get(i).select(false);
			if(blId == this.blGrid.gridRows.get(i).getFieldValue('bl.bl_id')){
				this.gridRow = this.blGrid.gridRows.get(i);
				this.gridRow.select(true);
			}
		}
	},

	checkValue: function(){
		this.gridRow = this.blGrid.gridRows.get(this.blGrid.selectedRowIndex);
		var bl = this.gridRow.getFieldValue('bl.bl_id');
		for(var i=0;i<this.blGrid.gridRows.getCount();i++){
			if(bl == this.blGrid.gridRows.get(i).getFieldValue('bl.bl_id')){
				this.blGrid.gridRows.get(i).select(true);
			}
			else {
				this.blGrid.gridRows.get(i).select(false);
			}
		}

		if (this.gridRow != null){
			this.saveData();
			// View.controllers.get('allocWizard').navigateToTab('page1');
		}
		else
		{
			View.showMessage(getMessage('error_bl_id'));
		}
	},

	saveData: function(){
		if(this.gridRow != null && this.tabs.wizard.getBl() != this.gridRow.getFieldValue('bl.bl_id')){
			this.tabs.wizard.setBl(this.gridRow.getFieldValue('bl.bl_id'));
			var controller = View.controllers.get('allocSelectFl');
			if (controller != undefined) {
				this.tabs.wizard.setFl("");
				controller.clearFloorSelection();
			}
		}else if(this.gridRow == null){
			this.tabs.wizard.setBl("");
		}
	}
});
