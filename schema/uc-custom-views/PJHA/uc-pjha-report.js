function filterReport(){
	var panel = View.panels.get("filterPanel");
	var reportPanel = View.panels.get("reportPanel");
	var restriction = "1=1";
	
	if(panel.getFieldValue("uc_pjha_value.bl_id")){
		restriction += "AND bl_id = '" + panel.getFieldValue("uc_pjha_value.bl_id") + "'";
	}
	if(panel.getFieldValue("uc_pjha_value.fl_id")){
		restriction += "AND fl_id = '" + panel.getFieldValue("uc_pjha_value.bl_id") + "'";
	}
	if(panel.getFieldValue("submit_date_from")){
		restriction += "AND pjha_submit_date >= '" + panel.getFieldValue("submit_date_from") + "'";
	}
	if(panel.getFieldValue("submit_date_to")){
		restriction += "AND pjha_submit_date <= '" + panel.getFieldValue("submit_date_to") + "'";
	}
	if(panel.getFieldValue("uc_pjha_value.hazcat_id")){
		restriction += "AND hazcat_id = '" + panel.getFieldValue("uc_pjha_value.hazcat_id") + "'";
	}
	if(panel.getFieldValue("uc_pjha_value.hazard_id")){
		restriction += "AND hazard_id = '" + panel.getFieldValue("uc_pjha_value.hazard_id") + "'";
	}
	if(panel.getFieldValue("uc_pjha_value.cf_id")){
		restriction += "AND cf_id = '" + panel.getFieldValue("uc_pjha_value.cf_id") + "'";
	}
	if(panel.getFieldValue("uc_pjha_value.control_id")){
		restriction += "AND control_id = '" + panel.getFieldValue("uc_pjha_value.control_id") + "'";
	}
	
	reportPanel.refresh(restriction);
	
};
