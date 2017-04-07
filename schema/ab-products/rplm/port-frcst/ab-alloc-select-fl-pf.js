var allocSelectFlController = View.createController('allocSelectFl',{

	gridRow:null,

    afterInitialDataFetch: function() {
		this.restoreSelection();
		this.flGrid.enableSelectAll(false);
    },

	editFloorForm_onSave: function() {
		this.restoreSelection();
	},

    flGrid_onAddNew: function() {
		var editFloorForm = View.panels.get('editFloorForm');
		var blId = this.tabs.wizard.getBl();;

		this.editFloorForm.refresh(null, true);

		this.editFloorForm.setTitle(getMessage('addFloorTitle'));

		if ((blId != '') && (blId != null)) { 
			editFloorForm.setFieldValue('fl.bl_id',blId);
		}

        this.editFloorForm.showInWindow({
			newRecord: true,
            closeButton: false
        });
    },

	flGrid_onNext: function(){
		this.saveData();
		View.controllers.get('allocWizard').navigateToTab('page2');
	},

	flGrid_multipleSelectionColumn_onClick: function(row){
		if(this.gridRow != null){
			this.gridRow.unselect();
		}
		if(row.isSelected()){
			this.gridRow = row;
			var fl = this.gridRow.getFieldValue('fl.fl_id');
			var bl = this.gridRow.getFieldValue('fl.bl_id');
			this.flGrid.setTitle(getMessage('buildingTitle') + ' ' + bl + ' ' + getMessage('floorTitle') + fl);
			/*
			 * 12/20/2010 IOAN KB 3028351
			 * reset command restriction and use selection restriction
			 */
			this.flGrid.actions.get('showGroups').command.restriction = null;
		}
		else{
			this.gridRow = null;
			this.flGrid.setTitle(getMessage('buildingTitle') + ' ' + this.tabs.wizard.getBl() + ' ' + getMessage('selectAllFloors'));
			/*
			 * 12/20/2010 IOAN KB 3028351
			 * we must put this restriction for show groups command
			 */
			this.flGrid.actions.get('showGroups').command.restriction = this.flGrid.restriction;
		}
	},

	checkValue: function(){
		this.gridRow = this.flGrid.gridRows.get(this.flGrid.selectedRowIndex);
		var fl = this.gridRow.getFieldValue('fl.fl_id');
		var bl = this.gridRow.getFieldValue('fl.bl_id');

		this.flGrid.setTitle(getMessage('buildingTitle') + ' ' + bl + ' Floor: ' + fl);

		for(var i=0;i<this.flGrid.gridRows.getCount();i++){
			if((fl == this.flGrid.gridRows.get(i).getFieldValue('fl.fl_id')) && (bl == this.flGrid.gridRows.get(i).getFieldValue('fl.bl_id'))){
				this.flGrid.gridRows.get(i).select(true);
			}
			else {
				this.flGrid.gridRows.get(i).select(false);
			}
		}

		this.saveData();
		//View.controllers.get('allocWizard').navigateToTab('page2');
	},

	saveData: function(){
		if(this.gridRow != null){
			this.tabs.wizard.setFl(this.gridRow.getRecord().getValue('fl.fl_id'));
			/*
			 * 12/20/2010 IOAN KB 3028351
			 * reset command restriction and use selection restriction
			 */
			this.flGrid.actions.get('showGroups').command.restriction = null;
		}
		else {
			this.tabs.wizard.setFl("");
			/*
			 * 12/20/2010 IOAN KB 3028351
			 * we must put this restriction for show groups command
			 */
			this.flGrid.actions.get('showGroups').command.restriction = this.flGrid.restriction;
		}
	},

	restoreSelection: function(){
		var bl_id = this.tabs.wizard.getBl();
		var fl_id = this.tabs.wizard.getFl();
		
//		var restriction = 'bl_id = \'';
//		restriction += bl_id;
//		restriction += '\'';
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', bl_id, '=');

		this.flGrid.refresh(restriction);
		/*
		 * 12/20/2010 IOAN KB 3028351
		 * we must put this restriction for show groups command
		 */
		this.flGrid.actions.get('showGroups').command.restriction = restriction;

		if(this.gridRow != null){
			this.flGrid.setTitle(getMessage('buildingTitle') + ' ' + bl_id + ' ' + getMessage('floorTitle') + this.gridRow.getRecord().getValue('fl.fl_id'));
		} else {
			this.flGrid.setTitle(getMessage('buildingTitle') + ' ' + bl_id + ' ' + getMessage('selectAllFloors'));
		}


		for(var i=0;i<this.flGrid.gridRows.getCount();i++){
			this.flGrid.gridRows.get(i).select(false);
			if(fl_id == this.flGrid.gridRows.get(i).getFieldValue('fl.fl_id')){
				this.gridRow = this.flGrid.gridRows.get(i);
				this.gridRow.select(true);
				break;
			}
		}
	},

	clearFloorSelection: function(){
		if(this.gridRow != null){
			this.gridRow.unselect();
			this.gridRow = null;
		}
	}
});
