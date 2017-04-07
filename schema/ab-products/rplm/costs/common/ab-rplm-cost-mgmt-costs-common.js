/**
 * Obtain values for selected field from selected grid rows.
 * @param grid
 * @param fieldName
 * @returns {Array} list of values for selected field
 */
function getFieldValuesFromSelectedRows(grid, fieldName){
    var selectedCosts = grid.getSelectedRecords();
    var fieldDef = grid.getDataSource().fieldDefs.get(fieldName);
    var costIds = [];
    for (var i = 0; i < selectedCosts.length; i++) {
        var costId = selectedCosts[i].getValue(fieldName);
        // for autoincremented pkey integers are required
        if (fieldDef.isNumeric) {
        	costId = fieldDef.decimals == 0 ? parseInt(costId): parseFloat(costId);
        }
        costIds.push(costId);
    }
    return costIds;
}

/**
 * Update cam_cost field for selected costs.
 * @param grid
 * @param costTable cost table name
 * @param costFieldId cost field name
 * @param camFieldValue CAM field value
 */
function setCamValueForSelectedCosts(grid, costTable, costFieldId, camFieldValue){
	var costIds = getFieldValuesFromSelectedRows(grid, costTable + '.' + costFieldId);
    if (costIds.length == 0) {
        View.showMessage(getMessage('noItemSelected'));
        return;
    }
    try {
        Workflow.callMethod('AbCommonResources-CostService-updateSelectedCosts', 
        		costTable, "cam_cost", camFieldValue, costIds);
    }
    catch (e) {
        Workflow.handleError(e);
    }
    
    grid.refresh(grid.restriction);    
}

/**
 * Add CAM submenu actions for 'Set selected Costs' action button
 * @param grid
 * @param costTable
 * @param costFieldId
 * @param camFieldValue
 */
function addSubmenu(grid, costTable, costFieldId, camFieldValue){
	switch(camFieldValue){
		case "CAM":
			setCamValueForSelectedCosts(grid, costTable, costFieldId, camFieldValue);
			break;
		case "NON-CAM":
			setCamValueForSelectedCosts(grid, costTable, costFieldId, camFieldValue);
			break;
	}
}