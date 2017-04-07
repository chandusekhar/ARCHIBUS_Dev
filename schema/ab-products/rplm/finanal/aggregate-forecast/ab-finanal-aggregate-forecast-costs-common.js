function setSelectParameters(tab, controller) {
	if(tab){
		if (!tab.parameters) {
			tab.parameters = {};
		}
		tab.parameters.assetType = controller.assetType;
		if (valueExists(controller.blId)) {
			tab.parameters.blId = controller.blId;
		} else {
			tab.parameters.blId = null;
		}
		if (valueExists(controller.prId)) {
			tab.parameters.prId = controller.prId;
		} else {
			tab.parameters.prId = null;
		}
		tab.parameters.projId = (controller.assetType == 'proj') ? controller.projId : null;
		tab.parameters.eqId = (controller.assetType == 'eq') ? controller.eqId : null;
		tab.parameters.subLoan = controller.subLoan;
		tab.parameters.autoNumber = controller.autoNumber;
	}
}

function getSelectParameters(tab, controller) {
	if(tab && tab.parameters){
		controller.assetType = tab.parameters.assetType;
		
		controller.blId = tab.parameters.blId;
		controller.isBuilding = valueExistsNotEmpty(controller.blId);
		
		controller.prId = tab.parameters.prId;
		controller.isProperty = valueExistsNotEmpty(controller.prId);
		
		controller.projId = tab.parameters.projId;
		
		controller.eqId = tab.parameters.eqId;
		
		controller.subLoan = tab.parameters.subLoan;
		controller.autoNumber = tab.parameters.autoNumber;
	}
}

function formatFieldWithoutCurrency(fieldName, value, dataSource) {
	var parsedValue = value;
	var fieldDef = dataSource.fieldDefs.get(fieldName);
	var currencySymbol = "";
	if (valueExists(fieldDef.currency)) {
    	currencySymbol = View.currencySymbolFor(fieldDef.currency)
	}
	
    if(valueExistsNotEmpty(currencySymbol)){
        parsedValue = trim(parsedValue.replace(currencySymbol, ''));
    }
    
    return parsedValue;
}