var abMoveHistoryCtrl = View.createController('abMoveHistoryCtrl',{
	afterInitialDataFetch: function(){
		setDefaultValues();
	}
})

function setDefaultValues() {
	var console = View.panels.get('console_abMoveHistEm');
	var ds = console.getDataSource();
	var toDate = new Date();
	var fromDate = toDate.add(Date.YEAR, -1);
	console.setFieldValue('date_to_perform_to', ds.formatValue('mo.date_to_perform', toDate));
	console.setFieldValue('date_to_perform_from', ds.formatValue('mo.date_to_perform', fromDate));
}

function doFilter(){
	var console = View.panels.get('console_abMoveHistEm');
	var abRestriction = new Ab.view.Restriction();
	var sqlRestriction = "";
	
	var fromSiteId = console.getFieldValue('mo.from_fl_id');
	if(fromSiteId){
		sqlRestriction += " AND EXISTS(SELECT 1 FROM bl WHERE bl.bl_id = mo.from_bl_id AND bl.site_id = '" + fromSiteId + "' )";
	}
	var toSiteId = console.getFieldValue('mo.to_fl_id');
	if(toSiteId){
		sqlRestriction += " AND EXISTS(SELECT 1 FROM bl WHERE bl.bl_id = mo.to_bl_id AND bl.site_id = '" + toSiteId + "' )";
	}
	var fromBlId = console.getFieldValue('mo.from_bl_id');
	if(fromBlId){
		abRestriction.addClause('mo.from_bl_id', fromBlId, '=');
	}
	var toBlId = console.getFieldValue('mo.to_bl_id');
	if(toBlId){
		abRestriction.addClause('mo.to_bl_id', toBlId, '=');
	}
	var fromDvId = console.getFieldValue('mo.from_dv_id');
	if(fromDvId){
		abRestriction.addClause('mo.from_dv_id', fromDvId, '=');
	}
	var toDvId = console.getFieldValue('mo.to_dv_id');
	if(toDvId){
		abRestriction.addClause('mo.to_dv_id', toDvId, '=');
	}
	var fromDpId = console.getFieldValue('mo.from_dp_id');
	if(fromDpId){
		abRestriction.addClause('mo.from_dp_id', fromDpId, '=');
	}
	var toDpId = console.getFieldValue('mo.to_dp_id');
	if(toDpId){
		abRestriction.addClause('mo.to_dp_id', toDpId, '=');
	}
	var moType = console.getFieldValue('mo.mo_type');
	if(moType){
		abRestriction.addClause('mo.mo_type', moType, '=');
	}else{
		abRestriction.addClause('mo.mo_type', 'Employee', '=');
		console.setFieldValue('mo.mo_type', 'Employee');
	}
	var status = console.getFieldValue('mo.status');
	if(status){
		abRestriction.addClause('mo.status', status, '=');
	}
	var emId = console.getFieldValue('mo.em_id');
	if(emId){
		abRestriction.addClause('mo.em_id', emId, '=');
	}
	var fromDate = console.getFieldValue('date_to_perform_from');
	if(fromDate){
		abRestriction.addClause('mo.date_to_perform', fromDate, '>=');
	}
	var toDate = console.getFieldValue('date_to_perform_to');
	if(toDate){
		if(fromDate && fromDate > toDate){
			View.showMessage(getMessage('err_move_date'));
			return false;
		}
		abRestriction.addClause('mo.date_to_perform', toDate, '<=');
	}
	var report = View.panels.get('report_abMoveHistEm');
	report.addParameter('sqlFilter', sqlRestriction);
	report.refresh(abRestriction);
}

function customSelectValue(cmdConfig, field, type, parentField){
	var panel = cmdConfig.getParentPanel();
	var parentFieldValue = '';
	if(parentField != undefined){
		parentFieldValue = panel.getFieldValue(parentField);
	}
	if(type === 'site'){
		View.selectValue(panel.id, getMessage('msg_site'), 
						[field], 'site', ['site.site_id'],
						['site.site_id','site.name','site.city_id','site.state_id','site.ctry_id']);		
	}else if(type === 'bl'){
		var restriction = null;
		if(valueExistsNotEmpty(parentFieldValue)){
			restriction = new Ab.view.Restriction({'bl.site_id': parentFieldValue});
		}
		View.selectValue(panel.id, getMessage('msg_bl'), 
						[field], 'bl', ['bl.bl_id'],
						['bl.bl_id','bl.name','bl.site_id'], restriction);		
	}
}
