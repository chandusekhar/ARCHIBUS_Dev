/**
*
*/
function getChartType_JS(panelId){
	var chart = Ab.view.View.getControl('', panelId);
	return chart.type;
	
}
/**
*
*/
function getChartConfigObj_JS(panelId){
	var chart = Ab.view.View.getControl('', panelId);
	return toJSON(chart.configObj);
}



/**
*
*/
function getChartData_JS(panelId) {
		var chart = Ab.view.View.getControl('', panelId);
		return chart.data;
}


/**
 * Called from the AS code after the Flex control content has been loaded.
 * @param panelId
 * @return
 */
function loadComplete_JS(panelId) {
	var chart = Ab.view.View.getControl('', panelId);
	chart.afterLoadComplete();
}

/**
 * Called from the AS code after the Flex control has been created.
 * Calls the JS control listener.
 * 
 * @param panelId
 * @return
 */
function afterCreateControl_JS(panelId) {
	var chart = View.getControl('', panelId);
	chart.afterCreateControl();
}

/**
*
*/
function onClickChart_JS(panelId){
	var chart = Ab.view.View.getControl('', panelId);
	chart.addLink(chart.getEventCommands("onClickChart"));
}
/**
*
*/
function onClickItem_JS(panelId, selectedChartData, dataSeriesDisplayName){
	//clikedChartData in json format as string
	selectedChartData = eval('(' + selectedChartData + ')');
	var chart = Ab.view.View.getControl('', panelId);
	if(chart.secondaryGroupingAxis != null && chart.secondaryGroupingAxis.length > 0 ) {
		var secondaryGroupingAxisID = chart.secondaryGroupingAxis[0].table + "." + chart.secondaryGroupingAxis[0].field;
		selectedChartData[secondaryGroupingAxisID]=dataSeriesDisplayName;
	}
	var pkFieldFullName = "";
	if(chart.groupingAxis != null){
		pkFieldFullName = chart.groupingAxis[0].table + "." + chart.groupingAxis[0].field;
	}
	var pkFieldValue = selectedChartData[pkFieldFullName];
	//loop all fields to change enum field's displayed values to stored values.
	if(valueExistsNotEmpty(pkFieldFullName) && valueExistsNotEmpty(pkFieldValue)){
		for(var key in selectedChartData){
			var fieldDef = chart.getFieldDef(key);
			var fieldValue = selectedChartData[key];
			if(valueExists(fieldDef) && fieldDef.isEnum){
				var enumValues = fieldDef.enumValues;
				for(var enumKey in enumValues){
					if(enumValues[enumKey] === fieldValue){
						selectedChartData[key]  = enumKey; break;
					}
				}
				if(key === pkFieldFullName){
					pkFieldValue = selectedChartData[key];
				}
			}
		}
	}
	var restriction = new Ab.view.Restriction();
	if(pkFieldFullName != ""){
		if ((pkFieldValue.indexOf(selectedChartData['nullValueTitle']) != -1)) { 
			 restriction.addClause(pkFieldFullName, '', 'IS NULL');
		} else {
		  	 restriction.addClause(pkFieldFullName, pkFieldValue, '=');
		}
    }
    //additional restriction applied from another panel (console, tree, etc); it must be added to the drill-down restriction
	if (chart.restriction != null && chart.restriction.constructor != String) {
		if(chart.restriction.clauses){
			restriction.addClauses(chart.restriction, false, true);
		}else{
			//KB3048161: chart.restriction is just object like bl.bl_id='HQ' rather than Ab.view.Restriction???
			for (var name in chart.restriction) {
				  if (chart.restriction.hasOwnProperty(name) && name.indexOf('.') > 0) {
					  restriction.addClause(name, chart.restriction[name], '=');
				  }
			}
		}
	}

	chart.addLink(chart.getEventCommands("onClickItem"), restriction, selectedChartData);
}
/**
*
*/
function onClickSeries_JS(panelId, e){
	alert("onClickSeries - " + e);
	
}

function getLocalizedString_JS(panelId, key){
	var chart = Ab.view.View.getControl('', panelId);
	return chart.getLocalizedString(key);

}

function getDecimalSeparator_JS(){
	return strDecimalSeparator;
}

function getGroupingSeparator_JS(){
	return strGroupingSeparator;
}