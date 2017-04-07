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
var abRepmPfadminItemsByLocationController = View.createController('abRepmPfadminItemsByLocationController', {
	/*
	 * Pnav location - from where was opened
	 * values 'building', 'structure', 'land' and 'all' (default)
	 */
	viewLocation: 'all',
	
	// selected item type
	itemType: 'building',
	
	// group by option
	groupBy: 'geo_region',
	
	// filter restriction
	restriction: null,
	
	// displayed group by panel
	visibleGroupByPanel: null,
	
	// displayed list panel
	visibleListPanel: null,
	
	// parent restriction when is called from another view
	parentRestriction: null,
	
	// property option object
	prOptionObj: null,
	
	afterViewLoad: function(){
		/*
		 * Suppress form refresh when is opened from URL bar
		 * URL query parameters are converted into restriction object 
		 * and form is refreshed.
		 * reset form restriction object to null
		 */
		this.abRepmPfadminItemsByLocBuildingDetails.restriction = null;
		this.abRepmPfadminItemsByLocPropertyDetails.restriction = null;
		
		// add datasource parameters for status
		this.abRepmPfadminItemsByLocBuildings.addParameter("owned", getMessage("status_owned"));
		this.abRepmPfadminItemsByLocBuildings.addParameter("leased", getMessage("status_leased"));
		this.abRepmPfadminItemsByLocBuildings.addParameter("neither", getMessage("status_neither"));

		this.abRepmPfadminItemsByLocBuildingDetails.addParameter("owned", getMessage("status_owned"));
		this.abRepmPfadminItemsByLocBuildingDetails.addParameter("leased", getMessage("status_leased"));
		this.abRepmPfadminItemsByLocBuildingDetails.addParameter("neither", getMessage("status_neither"));
				
		this.abRepmPfadminItemsByLocProperties.addParameter("owned", getMessage("status_owned"));
		this.abRepmPfadminItemsByLocProperties.addParameter("leased", getMessage("status_leased"));
		this.abRepmPfadminItemsByLocProperties.addParameter("neither", getMessage("status_neither"));
		
		this.abRepmPfadminItemsByLocPropertyDetails.addParameter("owned", getMessage("status_owned"));
		this.abRepmPfadminItemsByLocPropertyDetails.addParameter("leased", getMessage("status_leased"));
		this.abRepmPfadminItemsByLocPropertyDetails.addParameter("neither", getMessage("status_neither"));
		
	},
	
	afterInitialDataFetch: function(){

		// get view location
		this.getInitialParameters()

		// customize view and fields titles
		this.customizeTitles();

		this.customizeConsoleForItemType();
		
		if (valueExistsNotEmpty(this.parentRestriction)) {
			// is called from manage by location we must show group by panel
			this.abRepmPfadminItemsByLocFilter_onFilter();
		}
		
	},
	
	/* Read initial parameters for view: from where is opened, 
	 * item type, group by value, parent view restriction
	 */
	getInitialParameters: function(){
		// if URL query parameters exists 
		if (valueExistsNotEmpty(window.location.parameters["itemType"]) 
				&& valueExistsNotEmpty(window.location.parameters["groupBy"])) {
			this.itemType = window.location.parameters["itemType"];
			this.viewLocation = this.itemType;
			this.groupBy = window.location.parameters["groupBy"];
			// disable group by selection
			$("group_by").value = this.groupBy;
			$("group_by").disabled = true;
			
		} else if (valueExistsNotEmpty(View.parameters)
				&& valueExistsNotEmpty(View.parameters["itemType"]) 
				&& valueExistsNotEmpty(View.parameters["groupBy"])
				&& valueExistsNotEmpty(View.parameters["parentRestriction"])) {
			// is called from manage by location
			this.itemType = View.parameters["itemType"];
			this.viewLocation = this.itemType;
			this.groupBy = View.parameters["groupBy"];
			this.parentRestriction = View.parameters["parentRestriction"];
			
		} else if(valueExistsNotEmpty(View.parameters)
				&& valueExistsNotEmpty(View.parameters["itemType"]) 
				&& valueExistsNotEmpty(View.parameters["viewLocation"])) {
			
			this.itemType = View.parameters["itemType"];
			this.viewLocation = this.itemType;
			
		} else {
			// is opened from Pnav
			this.viewLocation = "all";
			
			if (this.view.taskInfo.activityId == "AbRPLMPortfolioAdministration" && this.view.taskInfo.processId == "Buildings"){
				this.viewLocation = "building";
			} else if (this.view.taskInfo.activityId == "AbRPLMPortfolioAdministration" && this.view.taskInfo.processId == "Structures") {
				this.viewLocation = "structure";
			} else if (this.view.taskInfo.activityId == "AbRPLMPortfolioAdministration" && this.view.taskInfo.processId == "Land") {
				this.viewLocation = "land";
			}
		}

		//disable items type selection
		if (this.viewLocation != "all") {
			this.itemType = this.viewLocation;
			setRadioButtonValue("item_type", this.itemType);
			enableRadioButton("item_type", false);
		}
		
	},
	
	// set custom titles for view and fields
	customizeTitles: function(){
		// set view title
		var itemTitle = getMessage("item_type_" + this.viewLocation);
		var viewTitle = getMessage("title_view").replace("{0}", itemTitle);
		this.view.setTitle(viewTitle);
		// set title for group by field
		var fieldTitle = getMessage("title_group_by").replace("{0}", itemTitle);
		this.abRepmPfadminItemsByLocFilter.setFieldLabel("fld_group_by", fieldTitle);
	},
	
	/*
	 * Customize filter console for selected portfolio item type
	 * If selected item type is building show group by property option and property field
	 * otherwise hide them.
	 */
	customizeConsoleForItemType: function(){
		var itemType = getRadioButtonValue("item_type");
		var selObject = document.getElementById('group_by');
		if (itemType == "building") {
			if (selObject.length == 6) {
				selObject.add(this.prOptionObj);
			}
		} else if (selObject.length == 7) {
			this.prOptionObj = selObject.options[6];
			selObject.remove(6);
		}
		//$('group_by_pr').style.display = (itemType == 'building'?'':'none');
		// we must reset pr_id field if value was selected
		if (itemType != 'building') {
			this.abRepmPfadminItemsByLocFilter.setFieldValue("bl.pr_id", '');
		}
		this.abRepmPfadminItemsByLocFilter.showField("bl.pr_id", (itemType == 'building'));
	},
	
	/*
	 * On Filter handler.
	 */
	abRepmPfadminItemsByLocFilter_onFilter: function(){
		// hide visible panels
		if (valueExistsNotEmpty(this.visibleGroupByPanel)) {
			View.panels.get(this.visibleGroupByPanel).show(false, true);
			this.visibleGroupByPanel = null;
		}
		if (valueExistsNotEmpty(this.visibleListPanel)) {
			View.panels.get(this.visibleListPanel).show(false, true);
			this.visibleListPanel = null;
		}
		
		// read filter restriction
		this.itemType = getRadioButtonValue("item_type");
		this.groupBy = $("group_by").value;
		
		this.restriction = this.getConsoleRestriction(this.itemType);
		
		
		if (this.itemType == "building") {
			this.visibleGroupByPanel = "abRepmPfadminGroupBy_bl";
		}else{
			this.visibleGroupByPanel = "abRepmPfadminGroupBy_property";
		}

		this.setGroupByPanelParameters(this.visibleGroupByPanel);
		View.panels.get(this.visibleGroupByPanel).refresh(this.restriction);
		this.updateGroupByPanel(this.visibleGroupByPanel);
		View.panels.get(this.visibleGroupByPanel).show(true, true);
		
	},
	
	updateGroupByPanel: function(panelId){
		var tableName = null;
		var panelObj = View.panels.get(panelId);
		if (this.itemType == "building") {
			tableName = "bl";
		} else {
			tableName = "property";
		}
		
		switch (this.groupBy){
			case "property":
				{
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
		if (this.itemType == "building") {
			tableName = "bl";
		} else {
			tableName = "property";
		}
		
		switch (this.groupBy){
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
		if (this.abRepmPfadminItemsByLocFilter.hasFieldMultipleValues("ctry.geo_region_id")) {
			fieldValue = this.abRepmPfadminItemsByLocFilter.getFieldMultipleValues("ctry.geo_region_id");
			operator = "IN";
		}else {
			fieldValue = this.abRepmPfadminItemsByLocFilter.getFieldValue("ctry.geo_region_id");
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
	
	
	/*
	 * On Cancel handler.
	 */
	abRepmPfadminItemsByLocFilter_onCancel: function(){
		this.abRepmPfadminItemsByLocFilter.clear();
		
		$("group_by").value = "geo_region";
		
		if (this.viewLocation == 'all') {
			setRadioButtonValue("item_type", "building");
		} 
		
		this.customizeConsoleForItemType();
	},
	
	/*
	 * Get filter console restriction.
	 */
	getConsoleRestriction: function(itemType){
		var tableName = null;
		var propertyType = null;
		if (itemType == "building") {
			tableName = "bl";
		} else if (itemType == "structure"){
			tableName = "property";
			propertyType = "Structure";
		} else if (itemType == "land") {
			tableName = "property";
			propertyType = "Land";
		}
		var restriction = new Ab.view.Restriction();
		
		if (valueExistsNotEmpty(propertyType)) {
			restriction.addClause("property.property_type", propertyType, "=", "AND", false);
		}
		
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "ctry.geo_region_id", tableName + ".geo_region_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.ctry_id", tableName + ".ctry_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.regn_id", tableName + ".regn_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.state_id", tableName + ".state_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.city_id", tableName + ".city_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.site_id", tableName + ".site_id", restriction);
		this.addFieldClause(this.abRepmPfadminItemsByLocFilter, "bl.pr_id", tableName + ".pr_id", restriction);
		
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
	
	/*
	 * Display portfolio items for selected row.
	 * @param selectedRow array with selected row values {id: fieldId, value: fieldValue}
	 */
	showPortfolioItemsFor: function(selectedRow) {
		var tmpRestriction = new Ab.view.Restriction();
		tmpRestriction.addClauses(this.restriction, false, true);
		
		for (var i = 0; i < selectedRow.length; i++) {
			var objField = selectedRow[i];
			tmpRestriction.addClause(objField.id, objField.value, "=", "AND", true);
		}
		
		var listPanel = "abRepmPfadminItemsByLocBuildings";
		if (this.itemType == "structure" || this.itemType == "land") {
			listPanel = "abRepmPfadminItemsByLocProperties";
		}
		
		View.panels.get(listPanel).setSingleVisiblePanel(true);
		View.panels.get(listPanel).refresh(tmpRestriction);
		if (this.itemType == "structure" || this.itemType == "land") {
			View.panels.get(listPanel).setTitle(getMessage("item_type_" + this.itemType));
		}
		if (!valueExistsNotEmpty(this.visibleListPanel)) {
			this.visibleListPanel = listPanel;
			View.panels.get(listPanel).show(true, true);
		}
	},
	
	abRepmPfadminItemsByLocBuildingDetails_afterRefresh: function(){
		// show building photo
		if(valueExistsNotEmpty(this.abRepmPfadminItemsByLocBuildingDetails.getFieldValue('bl.bldg_photo'))){
			this.abRepmPfadminItemsByLocBuildingDetails.showImageDoc('bl_image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.abRepmPfadminItemsByLocBuildingDetails.fields.get('bl_image_field').dom.src = null;
			this.abRepmPfadminItemsByLocBuildingDetails.fields.get('bl_image_field').dom.alt = getMessage('text_no_image');
		}
		// format currency fields
		formatCurrency(this.abRepmPfadminItemsByLocBuildingDetails);
	},
	
	
	abRepmPfadminItemsByLocPropertyDetails_afterRefresh: function(){
		// show property photo
		if(valueExistsNotEmpty(this.abRepmPfadminItemsByLocPropertyDetails.getFieldValue('property.prop_photo'))){
			this.abRepmPfadminItemsByLocPropertyDetails.showImageDoc('pr_image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.abRepmPfadminItemsByLocPropertyDetails.fields.get('pr_image_field').dom.src = null;
			this.abRepmPfadminItemsByLocPropertyDetails.fields.get('pr_image_field').dom.alt = getMessage('text_no_image');
		}
		// format currency fields
		formatCurrency(this.abRepmPfadminItemsByLocPropertyDetails);
	}
});

/**
 * On select portfolio item type.
 * @param type selected type
 */
function onSelectType(type){
	/*
	 * if selected type is structure or land and selected group by option is property
	 * we must reset group by option to ctry
	 */
	if (type == "structure" || type == "land") {
		var groupBy = $("group_by").value;
		if (groupBy == "property") {
			$("group_by").value = "geo_region";
		}
	}
	var controller = View.controllers.get("abRepmPfadminItemsByLocationController");
	controller.customizeConsoleForItemType();
}

/**
 * Show portfolio items for group by selection
 * @param ctx command context
 */
function showItemsFor(ctx){
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
	var controller = View.controllers.get("abRepmPfadminItemsByLocationController");
	controller.showPortfolioItemsFor(selection);
}



/**
 * Export to DOCX
 * @param ctx command context
 */
function exportToDocx(ctx){
	var ctxRestr = ctx.restriction;
	var parentPanelId = ctx.command.getParentPanel().id;
	var parameters = {
			"owned": getMessage("status_owned"),
			"leased": getMessage("status_leased"),
			"neither": getMessage("status_neither"),
			'printRestriction': true
		};

	if (parentPanelId == "abRepmPfadminItemsByLocBuildings" || parentPanelId == "abRepmPfadminItemsByLocBuildingDetails") {
		View.openPaginatedReportDialog("ab-repm-pfadmin-item-by-location-bl-rpt.axvw",
				{'abRepmItemByLocationBlRpt_ds': ctxRestr},
				parameters);
	} else if (parentPanelId == "abRepmPfadminItemsByLocProperties" || parentPanelId == "abRepmPfadminItemsByLocPropertyDetails") {
		View.openPaginatedReportDialog("ab-repm-pfadmin-item-by-location-pr-rpt.axvw",
				{'abRepmItemByLocationPrRpt_ds': ctxRestr},
				parameters);
	}
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
 * Enable/disable radio button
 * @param name element name
 * @param enabled boolean enabled/disabled
 */
function enableRadioButton(name, enabled){
	var objRadio = document.getElementsByName(name);
	if (objRadio) {
		for (var i = 0; i < objRadio.length; i++) {
			var optRadio = objRadio[i];
			optRadio.disabled =  !enabled;
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

