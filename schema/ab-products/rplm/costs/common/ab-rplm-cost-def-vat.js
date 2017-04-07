/**
 * Controller implementation.
 */
var abCostDefVatCtrl = View.createController('abCostDefVatCtrl', {
	
	//posibleValues: copyCostCategories, assignVatPercent
	actionType: '',
	
	abCostDefVatPercent_onCopyCostCategories: function(){
		this.actionType = 'copyCostCategories';
		this.abCostDefVatPercentDialog.refresh(null,true);
		this.abCostDefVatPercentDialog.showInWindow({
	        width: 500,
	        height: 250
	    });
		
		
	},
	
	abCostDefVatPercent_onAssignVatPercent: function(){
		this.actionType = 'assignVatPercent';
		
		//check that at least one Cost Category is selected in the grid
		if (this.abCostDefVatPercent.getSelectedRows().length == 0 ) {
			View.showMessage(getMessage("noCostCategoriesSelectedAssign"));
			return;
		}
		
		this.abCostDefVatPercentDialog.refresh(null,true);
		this.abCostDefVatPercentDialog.showInWindow({
	        width: 500,
	        height: 250
	    });
	},
	
	abCostDefVatPercent_onDelete: function(){
		//check that at least one Cost Category is selected in the grid
		if (this.abCostDefVatPercent.getSelectedRows().length == 0 ) {
			View.showMessage(getMessage("noCostCategoriesSelectedDelete"));
			return;
		}
		
		var controller = this;
		View.confirm(getMessage('confirm_delete_vat'), function(button){
            if (button == 'yes') {
            	var selectedCategories = controller.abCostDefVatPercent.getSelectedRecords();
        	    for (var i = 0; i < selectedCategories.length; i++) {
        	    	controller.abCostDefVatPercent_ds.deleteRecord(selectedCategories[i]);
        	    }
        	    controller.abCostDefVatPercent.refresh();	
            }
        });        
			
	},
	
	abCostDefVatPercentDialog_onSave: function(){
		switch (this.actionType){
			case 'copyCostCategories':
				try{
					Workflow.callMethod("AbRPLMLeaseAdministration-calculateCashFlowProjection-copyCostCategories", 
							this.abCostDefVatCtry.rows[this.abCostDefVatCtry.selectedRowIndex]["ctry.ctry_id"],
							this.abCostDefVatPercentDialog.getFieldValue("vat_percent.vat_percent_value"));
				} catch (e) {
				    Workflow.handleError(e);
				}
				
				this.abCostDefVatPercent.refresh();
				this.abCostDefVatPercentDialog.closeWindow();
				
				break;
				
			case 'assignVatPercent':
				var selectedCategories = getKeysForSelectedRows(this.abCostDefVatPercent, 'vat_percent.cost_cat_id');
				
				try{
					Workflow.callMethod("AbRPLMLeaseAdministration-calculateCashFlowProjection-assignVatPercent", 
							this.abCostDefVatCtry.rows[this.abCostDefVatCtry.selectedRowIndex]["ctry.ctry_id"],
							this.abCostDefVatPercentDialog.getFieldValue("vat_percent.vat_percent_value"),
							selectedCategories);
				} catch (e) {
				    Workflow.handleError(e);
				}
				
				this.abCostDefVatPercent.refresh();
				this.abCostDefVatPercentDialog.closeWindow();
				
				break;
		}
	}
	
});

/**
 * get field ids for selected rows
 * @param grid
 * @param fieldName
 * @returns {Array}
 */
function getKeysForSelectedRows(grid, fieldName){
	var fieldIds = [];
	var selectedRecords = grid.getSelectedRecords();
    for (var i = 0; i < selectedRecords.length; i++) {
        var fieldId = selectedRecords[i].getValue(fieldName);
        fieldIds.push(fieldId);
    }
    return fieldIds;
}

