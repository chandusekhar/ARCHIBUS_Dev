function getDashMainController(mainName){
	if(View.controllers.get(mainName)){
		return View.controllers.get(mainName);
	}
	return View.getOpenerView().controllers.get(mainName) ? View.getOpenerView().controllers.get(mainName): View.getOpenerView().getOpenerView().controllers.get(mainName);
}

function initialDashCtrl( dashCtrl ){
	dashCtrl.locMetricDashCtrl=getDashMainController('locMetricDashCtrl');
	if (dashCtrl.locMetricDashCtrl) {
		if ( !dashCtrl.locMetricDashCtrl.getChartControllerById( dashCtrl.id ) ) {  		
			dashCtrl.locMetricDashCtrl.registerChartCtrl(dashCtrl);
		}
		else {
			dashCtrl.refreshChart();
		}
	} 
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "1=1";
	if (consoleFieldValue) {
		if (field[2]) {
			restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
		}
		else {
			restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
		}
	}
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    return resultedString;
}




