var abGbDefFpFuels_ctrl = View.createController('abGbDefFpFuels_ctrl', {
	
	
	
	/**
	 * Action listener for 'Save' action from 'abGbDefFpFuelsEdit_form' panel.
	 */
	abGbDefFpFuelsEdit_form_onSave:function(){
		
		this.abGbDefFpFuelsEdit_form.save();
		var listPanel = (this.abGbDefFpFuelsEdit_form.getFieldValue('gb_fp_fuels.fuel_mode') == 'F')?this.abGbDefFpFuelsList_grid:this.abGbDefFpTechnologiesList_grid;
		listPanel.refresh();
		
	},
	
	/**
	 * Action listener for 'Delete' action from 'abGbDefFpFuelsTypesEdit_form' panel.
	 */
	abGbDefFpFuelsTypesEdit_form_onDelete:function(){
		if(this.commonDelete(this.abGbDefFpFuelsTypesList_grid, this.abGbDefFpFuelsTypesEdit_form)) {
			this.abGbDefFpFuelsList_grid.show(false);
			this.abGbDefFpTechnologiesList_grid.show(false);
		}
	},
	
	/**
	 * Action listener for 'Delete' action from 'abGbDefFpFuelsEdit_form' panel.
	 */
	abGbDefFpFuelsEdit_form_onDelete:function(){
		var listPanel = (this.abGbDefFpFuelsEdit_form.getFieldValue('gb_fp_fuels.fuel_mode') == 'F')?this.abGbDefFpFuelsList_grid:this.abGbDefFpTechnologiesList_grid;
		if(this.commonDelete(listPanel, this.abGbDefFpFuelsEdit_form)) {
			this.abGbDefFpFuelsTypesEdit_form.show(true);
		}
	},
	
	
	
	/**
	 * 
	 * The common functionality for 'Delete' actions from all the form panels.
	 * 
	 * @param {Object} listPanel - the grid panel which will refreshed after the 'deleteRecord' action.
	 * @param {Object} editPanel - the form panel which contains the record that will be deleted.
	 */
	commonDelete:function(listPanel, editPanel){
		View.confirm(getMessage('confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                    editPanel.deleteRecord();
					editPanel.show(false);
                    listPanel.refresh();
                    return true;
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                    return false;
                }
                
            }
        });
		
		return false;
	}
	
});


/**
 * onClick event handler for rows of 'abGbDefFpFuelsTypesList_grid' grid panel.
 * 
 * @param {Object} row
 */
function onClickFuelsTypeGrid(row){
	
	abGbDefFpFuels_ctrl.abGbDefFpFuelsEdit_form.show(false);
	
	//Refresh fuelsList grid panel
	var fuelRestriction = new Ab.view.Restriction();
	fuelRestriction.addClause('gb_fp_fuels.fuel_base_code', row['gb_fp_fuel_types.fuel_base_code']);
	abGbDefFpFuels_ctrl.abGbDefFpFuelsTypesEdit_form.refresh(fuelRestriction);
	fuelRestriction.addClause('gb_fp_fuels.fuel_mode', 'F');
	abGbDefFpFuels_ctrl.abGbDefFpFuelsList_grid.refresh(fuelRestriction);
	
	//Refresh thechnologiesList grid panel
	var technologyRestriction = new Ab.view.Restriction();
	technologyRestriction.addClause('gb_fp_fuels.fuel_base_code', row['gb_fp_fuel_types.fuel_base_code']);
	technologyRestriction.addClause('gb_fp_fuels.fuel_mode', 'T');
	abGbDefFpFuels_ctrl.abGbDefFpTechnologiesList_grid.refresh(technologyRestriction);
}
