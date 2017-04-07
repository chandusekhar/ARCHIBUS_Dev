var arrReccurenceParameters = ["param_reccurence_type_once",
                     "param_reccurence_type_day",
                     "param_reccurence_type_week",
                     "param_reccurence_type_month",
                     "param_reccurence_type_year",
                     "param_recurrence_details_day",
                     "param_recurrence_details_week",
                     "param_recurrence_details_month",
                     "param_recurrence_details_month_one",
                     "param_recurrence_details_month_two",
                     "param_recurrence_details_year",
                     "param_recurrence_details_year_one",
                     "param_recurrence_end_after",
                     "param_on",
                     "param_recurrence_day_mon",
                     "param_recurrence_day_tue",
                     "param_recurrence_day_wed",
                     "param_recurrence_day_thu",
                     "param_recurrence_day_fri",
                     "param_recurrence_day_sat",
                     "param_recurrence_day_sun",
                     "param_recurrence_day_day",
                     "param_recurrence_day_weekday",
                     "param_recurrence_day_weekendday",
                     "param_recurrence_day_first",
                     "param_recurrence_day_second",
                     "param_recurrence_day_third",
                     "param_recurrence_day_fourth",
                     "param_recurrence_day_last",
                     "param_recurrence_month_jan",
                     "param_recurrence_month_feb",
                     "param_recurrence_month_mar",
                     "param_recurrence_month_apr",
                     "param_recurrence_month_may",
                     "param_recurrence_month_jun",
                     "param_recurrence_month_jul",
                     "param_recurrence_month_aug",
                     "param_recurrence_month_sep",
                     "param_recurrence_month_oct",
                     "param_recurrence_month_nov",
                     "param_recurrence_month_dec"];
/**
 * Initialize recurring pattern parameters for given panel
 * @param panelId
 */
function initializeReccuringParametersPanel(panelId){
	var objPanel = View.panels.get(panelId);
	if (objPanel) {
		for ( var i = 0; i < arrReccurenceParameters.length; i++){
			var paramName = arrReccurenceParameters[i];
			var messageName = paramName.replace("param_", "msg_");
			objPanel.addParameter(paramName, getMessage(messageName));
		}
		
	}
}

/**
 * Initialize recurring pattern parameters for given panel
 * @param panelId
 */
function initializeReccuringParametersRpt(parameters){
	if (parameters) {
		for ( var i = 0; i < arrReccurenceParameters.length; i++){
			var paramName = arrReccurenceParameters[i];
			var messageName = paramName.replace("param_", "msg_");
			parameters[paramName] = getMessage(messageName);
		}
	}
}
