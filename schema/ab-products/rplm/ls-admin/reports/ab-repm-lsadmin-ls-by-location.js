/*
 * Overwrite/add some methods of/to report grid
 */
/*
 * Clone object function
 */
function Clone() { };
function clone(obj) {
    if (valueExists(obj)) {
        Clone.prototype = obj;
        return new Clone();
    } else {
    	return obj;
    }
};

/*
 * Overwrite getVisibleFieldDefs that is called by XLS and DOCX export command
 * Original function change fieldDef definition.
 */
Ab.grid.ReportGrid.prototype.getVisibleFieldDefs = function(){
	var ctx = this.createEvaluationContext();
	var fieldDefs = this.fieldDefs;  
	if(fieldDefs && fieldDefs.length == 0){
		this.getDataSource().fieldDefs.each(function (fieldDef) {
    		fieldDefs.push(fieldDef);
    	});
	}

	var visibleFieldDefs = [];
	for (var i = 0, column; column = this.columns[i]; i++) {
		 // return clone of fieldDef object
	     var field = clone(this.getFieldDefById(fieldDefs, column.fullName, i));
	     if(valueExists(field)){
	    	 if(field.controlType === '' || field.controlType === 'link'){
	    		 //XXX: evulate field.title and field.hidden proprties
	    		 field.title = Ab.view.View.evaluateString(field.title, ctx, false);
	    		 //field.hidden = Ab.view.View.evaluateString(field.hidden, ctx, false);
	    		 // evaluate field and column hidden parameter
	    		 field.hidden = (Ab.view.View.evaluateBoolean(field.hidden, ctx, false) || column.hidden);
	    		 visibleFieldDefs.push(field);
	    	 }
	     }
	}
	var listener = this.getEventListener('beforeExportReport');
    if (listener) {
    	visibleFieldDefs = listener(this, visibleFieldDefs);
    }
	return visibleFieldDefs;
}

/*
 * Set field title and label
 */

Ab.grid.ReportGrid.prototype.setFieldTitle = function (fieldName, fieldTitle) {
	var ctx = this.createEvaluationContext();
	var fieldDefs = this.fieldDefs;  
	if(fieldDefs && fieldDefs.length == 0){
		this.getDataSource().fieldDefs.each(function (fieldDef) {
    		fieldDefs.push(fieldDef);
    	});
	}
	
	for (var i = 0, column; column = this.columns[i]; i++) {
		if (column.fullName == fieldName){
			var field = this.getFieldDefById(fieldDefs, column.fullName, i);
			if(valueExists(field)){
				var evaluatedTitle = Ab.view.View.evaluateString(fieldTitle, ctx, false);
				field.title = evaluatedTitle;
				column.name = evaluatedTitle;
				this.setFieldLabel(fieldName, evaluatedTitle);
			}
		}
	}
}

/*
 * Controller definition
 */
var abRepmLsadminLsbyLocationController = View.createController('abRepmLsadminLsbyLocationController', {
	
	// show leases for
	showLeasesFor: 'building',
	
	// group by option
	groupBy: 'geo-region',
	
	// filter restriction
	restriction: null,
	
	// parent view restriction - when is called from another view
	parentRestriction: null,

	// displayed group by panel
	visibleGroupByPanel: null,

	blOptionObj: null,
	
	//printable restriction for Leases panel obtained from selected row
	printableRestriction: [],
	
	afterViewLoad: function(){
		// add panel parameters
		this.abRepmLsadminLsByLocLeases.addParameter('pipeline_landlord', getMessage('status_pipeline_landlord'));
		this.abRepmLsadminLsByLocLeases.addParameter('pipeline_tenant', getMessage('status_pipeline_tenant'));
		this.abRepmLsadminLsByLocLeases.addParameter('landlord', getMessage('status_landlord'));
		this.abRepmLsadminLsByLocLeases.addParameter('tenant', getMessage('status_tenant'));

		this.abRepmLsadminLsByLocLeaseDetails.addParameter('pipeline_landlord', getMessage('status_pipeline_landlord'));
		this.abRepmLsadminLsByLocLeaseDetails.addParameter('pipeline_tenant', getMessage('status_pipeline_tenant'));
		this.abRepmLsadminLsByLocLeaseDetails.addParameter('landlord', getMessage('status_landlord'));
		this.abRepmLsadminLsByLocLeaseDetails.addParameter('tenant', getMessage('status_tenant'));

		
	},
	
	abRepmLsadminLsByLocFilter_onFilter: function(){
		// hide panels
		if (valueExistsNotEmpty(this.visibleGroupByPanel)) {
			View.panels.get(this.visibleGroupByPanel).show(false, true);
			this.visibleGroupByPanel = null;
		}
		this.abRepmLsadminLsByLocLeases.show(false, true);
		
		this.showLeasesFor = getRadioButtonValue('ls_for');
		this.groupBy = $("group_by").value;
		
		this.restriction = this.getConsoleRestriction(this.showLeasesFor);
		
		if (this.showLeasesFor == "building") {
			this.visibleGroupByPanel = "abRepmLsadminGroupBy_bl";
		}else{
			this.visibleGroupByPanel = "abRepmLsadminGroupBy_property";
		}

		this.setGroupByPanelParameters(this.visibleGroupByPanel);
		View.panels.get(this.visibleGroupByPanel).refresh(this.restriction);
		this.updateGroupByPanel(this.visibleGroupByPanel);
		View.panels.get(this.visibleGroupByPanel).show(true, true);
		
		
	},
	
	abRepmLsadminLsByLocFilter_onCancel: function(){
		this.abRepmLsadminLsByLocFilter.clear();
		
		$("group_by").value = "geo_region";
		$("chk_ls_expired").checked =  false;
		
		setRadioButtonValue('ls_for', 'building');
		this.customizeFilterForType();
	},
	
	/*
	 * Display leases for selected row.
	 * @param selectedRow array with selected row values {id: fieldId, value: fieldValue}
	 */
	showLeasesForSelection: function(selectedRow){
		var tmpRestriction = new Ab.view.Restriction();
		var tableName = null;
		var propertyType = null;
		if (this.showLeasesFor == "building") {
			tableName = "bl";
			tmpRestriction.addClause("ls.bl_id", "", "IS NOT NULL", "AND", false);
			tmpRestriction.addClause("ls.pr_id", "", "IS NULL", "AND", false);
			this.abRepmLsadminLsByLocLeases.showColumn("bl.bl_id", true);
			this.abRepmLsadminLsByLocLeases.showColumn("property.pr_id", false);
		} else if (this.showLeasesFor == "structure"){
			tableName = "property";
			tmpRestriction.addClause("ls.bl_id", "", "IS NULL", "AND", false);
			tmpRestriction.addClause("ls.pr_id", "", "IS NOT NULL", "AND", false);
			tmpRestriction.addClause("property.property_type", "Structure", "=", "AND", false);
			this.abRepmLsadminLsByLocLeases.showColumn("bl.bl_id", false);
			this.abRepmLsadminLsByLocLeases.showColumn("property.pr_id", true);
		} else if (this.showLeasesFor == "land") {
			tableName = "property";
			tmpRestriction.addClause("ls.bl_id", "", "IS NULL", "AND", false);
			tmpRestriction.addClause("ls.pr_id", "", "IS NOT NULL", "AND", false);
			tmpRestriction.addClause("property.property_type", "Land", "=", "AND", false);
			this.abRepmLsadminLsByLocLeases.showColumn("bl.bl_id", false);
			this.abRepmLsadminLsByLocLeases.showColumn("property.pr_id", true);
		}
		
		this.abRepmLsadminLsByLocLeases.update();
		
		this.printableRestriction = [];
		
		// selected row restriction
		for (var i = 0; i < selectedRow.length; i++) {
			var objField = selectedRow[i];
			if (objField.id == 'bl.geo_region_id' || objField.id == 'property.geo_region_id') {
				tmpRestriction.addClause('ls.geo_region_id', objField.value, "=", "AND", false);
			}else {
				tmpRestriction.addClause(objField.id, objField.value, "=", "AND", false);
			}
			this.addToPrintableRestriction(objField);
		}
		// console restriction
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "ctry.geo_region_id", "ls.geo_region_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.ctry_id", tableName + ".ctry_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.regn_id", tableName + ".regn_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.state_id", tableName + ".state_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.city_id", tableName + ".city_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.site_id", tableName + ".site_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.pr_id", tableName + ".pr_id", tmpRestriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.bl_id", tableName + ".bl_id", tmpRestriction);
		
		var includeExpiredLeases = $("chk_ls_expired").checked;
		if(!includeExpiredLeases){
			tmpRestriction.addClause("ls.signed", "1", "=", ")AND(", false);
			tmpRestriction.addClause("ls.date_end", "", "IS NULL", ")AND(", false);
			tmpRestriction.addClause("ls.date_end", "${sql.currentDate}", ">=", "OR", false);
		}
		
		this.abRepmLsadminLsByLocLeases.refresh(tmpRestriction);
		this.abRepmLsadminLsByLocLeases.show(true, true);
	},
	
	// add to printable restriction if it's not a duplicate
	addToPrintableRestriction: function(objField){
		var isDuplicate = false;
		for(var i=0; i<this.printableRestriction.length; i++){
			if(this.printableRestriction[i].id == objField.id){
				isDuplicate = true;
			}
		}
		if(!isDuplicate){
			this.printableRestriction.push({'title': this.getFieldTitle(objField.id), 'value': objField.value, 'id':objField.id});
		}
	},
	
	//get field title from selection grid
	getFieldTitle: function(fieldId){
		var title = "";
		var grid = View.panels.get(this.visibleGroupByPanel);
		fieldId = fieldId.replace(".", ".vf_");
		
		var gridColumns = grid.columns;
		for(var i=0; i<gridColumns.length; i++){
			if(gridColumns[i].id == fieldId){
				title = gridColumns[i].name;
				break;
			}
		}
		
		return title;
	},
	
	updateGroupByPanel: function(panelId){
		var tableName = null;
		var panelObj = View.panels.get(panelId);
		if (this.showLeasesFor == "building") {
			tableName = "bl";
		} else {
			tableName = "property";
		}
		
		switch (this.groupBy){
			case "bl":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", true);
					panelObj.showColumn(tableName + ".vf_pr_id", true);
					panelObj.showColumn(tableName + ".vf_site_id", true);
					panelObj.showColumn(tableName + ".vf_city_id", true);
					panelObj.showColumn(tableName + ".vf_state_id", true);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "property":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", true);
					panelObj.showColumn(tableName + ".vf_site_id", true);
					panelObj.showColumn(tableName + ".vf_city_id", true);
					panelObj.showColumn(tableName + ".vf_state_id", true);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "site":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", true);
					panelObj.showColumn(tableName + ".vf_city_id", true);
					panelObj.showColumn(tableName + ".vf_state_id", true);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "city":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", false);
					panelObj.showColumn(tableName + ".vf_city_id", true);
					panelObj.showColumn(tableName + ".vf_state_id", true);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "state":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", false);
					panelObj.showColumn(tableName + ".vf_city_id", false);
					panelObj.showColumn(tableName + ".vf_state_id", true);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "regn":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", false);
					panelObj.showColumn(tableName + ".vf_city_id", false);
					panelObj.showColumn(tableName + ".vf_state_id", false);
					panelObj.showColumn(tableName + ".vf_regn_id", true);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "ctry":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", false);
					panelObj.showColumn(tableName + ".vf_city_id", false);
					panelObj.showColumn(tableName + ".vf_state_id", false);
					panelObj.showColumn(tableName + ".vf_regn_id", false);
					panelObj.showColumn(tableName + ".vf_ctry_id", true);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
			case "geo_region":
				{
					panelObj.showColumn(tableName + ".vf_bl_id", false);
					panelObj.showColumn(tableName + ".vf_pr_id", false);
					panelObj.showColumn(tableName + ".vf_site_id", false);
					panelObj.showColumn(tableName + ".vf_city_id", false);
					panelObj.showColumn(tableName + ".vf_state_id", false);
					panelObj.showColumn(tableName + ".vf_regn_id", false);
					panelObj.showColumn(tableName + ".vf_ctry_id", false);
					panelObj.showColumn(tableName + ".vf_geo_region_id", true);
					break;
				}
		}
		panelObj.update();
		panelObj.setTitle(getMessage("title_" + this.groupBy));
		panelObj.setFieldTitle(tableName + ".vf_name", getMessage("name_" + this.groupBy));
	},

	/*
	 * Set parameters for group by panel.
	 */
	setGroupByPanelParameters: function(panelId) {
		var tableName = null;
		var panelObj = View.panels.get(panelId);
		if (this.showLeasesFor == "building") {
			tableName = "bl";
		} else {
			tableName = "property";
		}
		
		var includeExpiredLeases = $("chk_ls_expired").checked;
		if (!includeExpiredLeases) {
			panelObj.addParameter("lsRestriction", "(ls.signed = 1 AND (ls.date_end IS NULL OR ls.date_end >= ${sql.currentDate}))");	
		}else{
			panelObj.addParameter("lsRestriction", "1 = 1");
		}
		
		switch (this.groupBy){
			case "bl":
				{
					panelObj.addParameter("field_name", tableName + ".vf_bl_name");
					panelObj.addParameter("key1", tableName + ".bl_id");
					panelObj.addParameter("key2", tableName + ".bl_id");
					break;
				}
			case "property":
				{
					panelObj.addParameter("field_name", tableName + ".vf_pr_name");
					panelObj.addParameter("key1", tableName + ".pr_id");
					panelObj.addParameter("key2", tableName + ".pr_id");
					break;
				}
			case "site":
				{
					panelObj.addParameter("field_name", tableName + ".vf_site_name");
					panelObj.addParameter("key1", tableName + ".site_id");
					panelObj.addParameter("key2", tableName + ".site_id");
					break;
				}
			case "city":
				{
					panelObj.addParameter("field_name", tableName + ".vf_city_name");
					panelObj.addParameter("key1", tableName + ".state_id");
					panelObj.addParameter("key2", tableName + ".city_id");
					break;
				}
			case "state":
				{
					panelObj.addParameter("field_name", tableName + ".vf_state_name");
					panelObj.addParameter("key1", tableName + ".state_id");
					panelObj.addParameter("key2", tableName + ".state_id");
					break;
				}
			case "regn":
				{
					panelObj.addParameter("field_name", tableName + ".vf_regn_name");
					panelObj.addParameter("key1", tableName + ".ctry_id");
					panelObj.addParameter("key2", tableName + ".regn_id");
					break;
				}
			case "ctry":
				{
					panelObj.addParameter("field_name", tableName + ".vf_ctry_name");
					panelObj.addParameter("key1", tableName + ".ctry_id");
					panelObj.addParameter("key2", tableName + ".ctry_id");
					break;
				}
			case "geo_region":
				{
					panelObj.addParameter("field_name", tableName + ".vf_geo_region_name");
					panelObj.addParameter("key1", tableName + ".geo_region_id");
					panelObj.addParameter("key2", tableName + ".geo_region_id");
					break;
				}
		}
		// Special case: geo region restriction
		var operator = null;
		var fieldValue = null;
		if (this.abRepmLsadminLsByLocFilter.hasFieldMultipleValues("ctry.geo_region_id")) {
			fieldValue = this.abRepmLsadminLsByLocFilter.getFieldMultipleValues("ctry.geo_region_id");
			operator = "IN";
		}else {
			fieldValue = this.abRepmLsadminLsByLocFilter.getFieldValue("ctry.geo_region_id");
			operator = "=";
		}
		var geoRegionParamValue = "1 = 1"; 
		if (valueExistsNotEmpty(fieldValue)) {
			if (operator == "IN") {
				geoRegionParamValue =  tableName + ".geo_region_id IN (${sql.literal('" + fieldValue.join("')}, ${sql.literal('") + "')})";
			} else {
				geoRegionParamValue =  tableName + ".geo_region_id = ${sql.literal('"+ fieldValue +"')}";
			}
		}
		
		panelObj.addParameter("geoRegionRestriction", geoRegionParamValue);
	},

	
	getConsoleRestriction: function(showLeasesFor){
		var tableName = null;
		var propertyType = null;
		if (showLeasesFor == "building") {
			tableName = "bl";
		} else if (showLeasesFor == "structure"){
			tableName = "property";
			propertyType = "Structure";
		} else if (showLeasesFor == "land") {
			tableName = "property";
			propertyType = "Land";
		}
		var restriction = new Ab.view.Restriction();
		
		if (valueExistsNotEmpty(propertyType)) {
			restriction.addClause("property.property_type", propertyType, "=", "AND", false);
		}
		
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "ctry.geo_region_id", tableName + ".geo_region_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.ctry_id", tableName + ".ctry_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.regn_id", tableName + ".regn_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.state_id", tableName + ".state_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.city_id", tableName + ".city_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.site_id", tableName + ".site_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.pr_id", tableName + ".pr_id", restriction);
		this.addFieldClause(this.abRepmLsadminLsByLocFilter, "bl.bl_id", tableName + ".bl_id", restriction);
		
		if (valueExistsNotEmpty(this.parentRestriction)) {
			restriction.addClauses(this.parentRestriction, false, true);
		}
		
		return restriction;
	},
	
	/**
	 * Add clause to restriction object.
	 * 
	 */
	addFieldClause: function(console, consoleField, clauseField, restriction){
		var operator = null;
		var fieldValue = null;
		if (console.hasFieldMultipleValues(consoleField)) {
			fieldValue = console.getFieldMultipleValues(consoleField);
			operator = "IN";
		}else {
			fieldValue = console.getFieldValue(consoleField);
			operator = "=";
		}
		
		if (valueExistsNotEmpty(fieldValue)) {
			restriction.addClause(clauseField, fieldValue, operator, "AND", false);
		}
	},

	customizeFilterForType: function(){
		var showLeasesFor = getRadioButtonValue('ls_for');
		var groupByObj = document.getElementById('group_by');
		if (showLeasesFor == 'building') {
			if (groupByObj.length == 7) {
				groupByObj.add(this.blOptionObj);
			}
		}else if (groupByObj.length == 8) {
			this.blOptionObj = groupByObj.options[7];
			groupByObj.remove(7);
		}
	}

}); 

/**
 * Show leases for group by option
 * @param ctx
 */
function showLeasesFor(ctx) {
	var selectedRow = ctx.row;
	var dataSource = ctx.grid.getDataSource();
	var selection = []; 
	// get group by selection from datasource definition
	dataSource.fieldDefs.each(function(fieldDef){
		if (fieldDef.groupBy) {
			//var fieldId = fieldDef.id;
			// we must read column name from parameters
			var paramName = fieldDef.id.substr(fieldDef.id.indexOf('.')+1);
			var columnId = selectedRow.panel.parameters[paramName];
			var fieldValue = selectedRow.getFieldValue(fieldDef.id);
			selection.push({id: columnId, value: fieldValue});
		}
	});
	var controller = View.controllers.get("abRepmLsadminLsbyLocationController");
	controller.showLeasesForSelection(selection);
}

/**
 * Export to DOCX
 * @param ctx command context
 */
function exportToDocx(ctx){
	var ctxRestr = ctx.restriction;
	var parameters = {
			"pipeline_landlord": getMessage("status_pipeline_landlord"),
			"pipeline_tenant": getMessage("status_pipeline_tenant"),
			"landlord": getMessage("status_landlord"),
			"tenant": getMessage("status_tenant"),
			'printRestriction': true,
			"printableRestriction": abRepmLsadminLsbyLocationController.printableRestriction
		};
	
	//KB3037912 on Oracle
	if (!valueExists(ctxRestr.clauses)){
		ctxRestr = new Ab.view.Restriction(ctxRestr);
	}
	var ctxRestrClauses = ctxRestr.clauses;
	for (var i=0; i<ctxRestrClauses.length; i++){
		if(ctxRestrClauses[i].value == "${sql.currentDate}"){
			ctxRestrClauses[i].value = getCurrentDate();
		}
	}

	View.openPaginatedReportDialog("ab-repm-lsadmin-ls-by-location-rpt.axvw",
			{'abRepmLsadminLsByLocLeaseRpt_ds': ctxRestr},
			parameters);
}
/**
 * Obtain current date as a string in format YYYY-MM-DD
 * @returns {String}
 */
function getCurrentDate(){
	var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

/*
 * On select Lease for handler
 */
function onShowLsForType(type){
	if (type == "structure" || type == "land") {
		var groupBy = $("group_by").value;
		if (groupBy == "bl"){
			$("group_by").value = "geo_region"
		}
	}
	var controller = View.controllers.get("abRepmLsadminLsbyLocationController");
	controller.customizeFilterForType();
}

/**
 * Set background color for lease status cell.
 * @param grid The leases grid
 */
function setColorForLeaseStatus(grid){
	grid.gridRows.each(function(row){
		var bgColor = row.getFieldValue("ls.vf_color");
		if (valueExistsNotEmpty(bgColor)) {
			row.cells.get("ls.vf_status").dom.style.backgroundColor = bgColor;
		}
	});
}

/**
 * Get radio button selected value.
 * @param name element name
 */
function getRadioButtonValue(name){
	var result = null;
	var objRadio = document.getElementsByName(name);
	if (objRadio) {
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			if (optRadio.checked) {
				result = optRadio.value;
				break;
			}
		}
	}
	return result;
}

/**
 * Set radio button selected value
 * @param name element name
 * @param value selected value
 */
function setRadioButtonValue(name, value){
	var objRadio = document.getElementsByName(name);
	if (objRadio) {
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			if (optRadio.value == value) {
				optRadio.checked = true;
				break;
			}
		}
	}
}

/**
 * Format form field to show currency symbol for read only fields.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly
						&& valueExistsNotEmpty(form.getFieldValue(fieldName))){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly 
						&& valueExistsNotEmpty(form.getFieldValue(fieldName))){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}
	});
}
