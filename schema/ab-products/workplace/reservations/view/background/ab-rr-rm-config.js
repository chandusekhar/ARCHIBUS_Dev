
/**
 * Open Dialog according the building Id, floor Id, reservable value.
 */
function onClickRmId() {
	var panel = View.panels.get("rm_config_form");
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id", panel.getFieldValue("rm_config.bl_id"), "=");
	restriction.addClause("rm.fl_id", panel.getFieldValue("rm_config.fl_id"), "=");
	restriction.addClause("rm.reservable", 1, "=");

	View.selectValue('rm_config_form', getMessage("roomId"), ['rm_config.rm_id'], 'rm', ['rm.rm_id'], ['rm.bl_id','rm.fl_id','rm.rm_id'], restriction);
}

/**
 * excluded config code.
 */
function onClickExcludedConfig() {
	var panel = View.panels.get("rm_config_form");
	
	var restriction = {
		'rm_config.bl_id': panel.getFieldValue('rm_config.bl_id'), 
		'rm_config.fl_id': panel.getFieldValue('rm_config.fl_id'), 
		'rm_config.rm_id': panel.getFieldValue('rm_config.rm_id')
	};
	 
	View.openDialog('ab-rr-rm-config-excluded.axvw', restriction, false);
}
