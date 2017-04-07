var abRepmAddeditSelectLeaseController = View.createController('abRepmAddeditSelectLeaseController', {
	// extended mixed collection with current filter values
	filterDef: null,
	
	displayMode: 'complete',
	
	leaseId: null,

	queryParameterNames: ['bl_id', 'pr_id'],
	queryParameters: null,
	isDemoMode: false,

	afterViewLoad: function(){
        this.isDemoMode = isInDemoMode();
        this.queryParameters =  readQueryParameters(this.queryParameterNames);
		this.filterDef = this.initializeFilter();
		this.setConsoleValues(this.filterDef);
		this.abLeaseConsole_mainTabs.showTab('abLeaseConsole_detailTab', (this.displayMode == 'standard' || this.displayMode == 'basic'));
		this.abLeaseConsole_mainTabs.showTab('abLeaseConsole_completeTab', this.displayMode == 'complete');
		var displayModeTitle = getMessage('titleDisplayMode') + ' ' + getMessage('titleDisplayMode_' + this.displayMode);
		this.abRepmLeaseConsole_basic.actions.get('showMode').setTitle(displayModeTitle);
		
	},
	
	afterInitialDataFetch: function(){
		var hasQueryParamValue = false;
		if(valueExistsNotEmpty(this.queryParameters['bl_id'])){
			this.filterDef.get('ls.bl_id').value = this.queryParameters['bl_id'];
			this.filterDef.get('ls.bl_id').dfltValue = this.queryParameters['bl_id'];
			hasQueryParamValue = true;
		}
		
		// do not apply property id
//		if(valueExistsNotEmpty(this.queryParameters['pr_id'])){
//			this.filterDef.get('ls.pr_id').value = this.queryParameters['pr_id'];
//			this.filterDef.get('ls.pr_id').dfltValue = this.queryParameters['pr_id'];
//			hasQueryParamValue = true;
//			var toggleAction = null;
//			this.abRepmLeaseConsole_basic.fieldsets.each(function(fieldset) {
//				if(valueExists(fieldset.actions.get('toggleMoreFields'))){
//					toggleAction = fieldset.actions.get('toggleMoreFields');
//				}
//			});
//			this.abRepmLeaseConsole_basic_onToggleMoreFields(this.abRepmLeaseConsole_basic, toggleAction);
//		}

		if(hasQueryParamValue) {
			this.setConsoleValues(this.filterDef);
		}
		
		this.abRepmLeaseConsole_basic_onFilter();
	},
	
	/**
	 * Initialize filter definition object.
	 */
	initializeFilter: function(){
		var result  = new Ext.util.MixedCollection();
		result.addAll(
				{id: 'ls.ld_name', type:'', value:'', dfltValue: ''},
				{id: 'ls.bl_id', type:'', value:'', dfltValue: ''},
				{id: 'bl.ctry_id', type:'', value:'', dfltValue: ''},
				{id: 'bl.city_id', type:'', value:'', dfltValue: ''},
				{id: 'ls.ls_id', type:'', value:'', dfltValue: ''},
				{id: 'ctry.geo_region_id', type:'', value:'', dfltValue: ''},
				{id: 'bl.state_id', type:'', value:'', dfltValue: ''},
				{id: 'bl.site_id', type:'', value:'', dfltValue: ''},
				{id: 'ls.ac_id', type:'', value:'', dfltValue: ''},
				{id: 'ls.landlord_tenant', type:'', value:'', dfltValue: ''},
				{id: 'ls.ld_contact', type:'', value:'', dfltValue: ''},
				{id: 'ls_end_date_range', type:'list', value: '', dfltValue: '-1'},
				{id: 'expired_dates', type:'checkbox', value:'', dfltValue: '0'},
				{id: 'ls.pr_id', type:'', value:'', dfltValue: ''},
				{id: 'bl.use1', type:'', value:'', dfltValue: ''},
				{id: 'associated_with', type:'checkbox', value:'', dfltValue: ['building']},
				{id: 'ls.tn_name', type:'', value:'', dfltValue: ''},
				{id: 'ls.tn_contact', type:'', value:'', dfltValue: ''},
				{id: 'opt_end_date_range', type:'list', value: '', dfltValue: '-1'},
				{id: 'show_predef_filter', type:'list', value: '', dfltValue: '-1'});
		
		return result;
	},
	
	/**
	 * Set console values.
	 */
	setConsoleValues: function(filterDef){
		var controller = this;
		var basicConsole = this.abRepmLeaseConsole_basic;
		var extendedConsole =  this.abRepmLeaseConsole_extended;
		filterDef.each(function(field){
			if (valueExists(basicConsole.fields.get(field.id))) {
				controller.setConsoleFieldValue(basicConsole, field.id, field.type, field.value, field.dfltValue);
			} else if (valueExists(extendedConsole.fields.get(field.id))) {
				controller.setConsoleFieldValue(extendedConsole, field.id, field.type, field.value, field.dfltValue);
			}
		});
	},
	
	/**
	 * Set console field value.
	 */
	setConsoleFieldValue: function(console, id, type, value, defaultValue ){
		if (!valueExistsNotEmpty(value)) {
			value = defaultValue;
		}
		
		if (valueExistsNotEmpty(value)) {
			if (type == 'checkbox') {
				var arrCheckboxes = document.getElementsByName('chk_' + id);
				if (arrCheckboxes.length > 1) {
					for (var i = 0; i < arrCheckboxes.length; i++) {
						arrCheckboxes[i].checked = (value.indexOf(arrCheckboxes[i].value) != -1)
					}
				}else if (arrCheckboxes.length == 1) {
					arrCheckboxes[0].checked = (value == '1')
				}
			} else if (type == 'list') {
				var objSelect = document.getElementById('cbo_' + id);
				if (objSelect) {
					for (var i=0; i < objSelect.options.length; i++){
						if(objSelect.options[i].value == value){
							objSelect.options[i].selected = true;
							objSelect.selectedIndex = i;
							break;
						}
					}
				}
			} else {
				var localizedValue = value;
				// is standard field
				if (isArray(value)) {
					localizedValue = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}
				console.setFieldValue(id, localizedValue);
			}
		}
	},
	
	/**
	 * Show/hide more fields event handler.
	 */
	abRepmLeaseConsole_basic_onToggleMoreFields: function(panel, action){
        this.abRepmLeaseConsole_extended.toggleCollapsed();
        
        action.setTitle(this.abRepmLeaseConsole_extended.collapsed ?
            getMessage('labelMore') : getMessage('labelLess'));

/*        
        var layout = View.getLayoutManager('mainLayout'); 
        if (this.abRepmLeaseConsole_extended.collapsed) {
        	layout.setRegionSize('north', 90);
        }else {
        	layout.setRegionSize('north', 180);
        }
*/        
	},
	
	/**
	 * Clear filter console handler.
	 */
	abRepmLeaseConsole_basic_onClear: function(panel, action){
		this.filterDef.each(function(field){
			field.value = field.dfltValue;
		});
		this.abRepmLeaseConsole_basic.clear();
		this.abRepmLeaseConsole_extended.clear();
		this.setConsoleValues(this.filterDef);
	},
	
	/**
	 * Filter handler.
	 */
	abRepmLeaseConsole_basic_onFilter: function(panel, action) {
		this.readFilter();
		var restriction = this.getRestriction(this.filterDef);
		this.abRepmLeaseList.refresh(restriction);
	},
	
	/**
	 * Read all filter values and save into filter object.
	 */
	readFilter: function(){
		var basicConsole = this.abRepmLeaseConsole_basic;
		var extendedConsole =  this.abRepmLeaseConsole_extended;
		var controller = this;
		this.filterDef.each(function(field){
			if (valueExists(basicConsole.fields.get(field.id))) {
				field.value = controller.getConsoleFieldValue(basicConsole, field.id, field.type, field.value, field.dfltValue);
			} else if (valueExists(extendedConsole.fields.get(field.id))) {
				field.value = controller.getConsoleFieldValue(extendedConsole, field.id, field.type, field.value, field.dfltValue);
			}
		});
	},
	
	getConsoleFieldValue: function(console, id, type, value, defaultValue){
		var value = null;
		if (type == 'checkbox') {
			var arrCheckboxes = document.getElementsByName('chk_' + id);
			if (arrCheckboxes.length > 1) {
				value = [];
				for (var i = 0; i < arrCheckboxes.length; i++) {
					if (arrCheckboxes[i].checked) {
						value.push(arrCheckboxes[i].value);
					}
				}
			}else if (arrCheckboxes.length == 1) {
				if (arrCheckboxes[0].checked) {
					value = '1';
				}
			}
		} else if (type == 'list') {
			var fieldElem = document.getElementById('cbo_' + id); 
			if (fieldElem) {
				if (fieldElem.selectedIndex != -1) {
					value = fieldElem.options[fieldElem.selectedIndex].value;
				}
			}
		} else {
			if(console.hasFieldMultipleValues(id)){
				value = console.getFieldMultipleValues(id);
			}else{
				value = console.getFieldValue(id);
			}		
		}
		return value;
	},
	
	getRestriction: function(filterDefs){
		var assocWith = filterDefs.get('associated_with').value;
		var isForBuilding = (assocWith.indexOf('building') != -1);
		var isForStructure = (assocWith.indexOf('structure') != -1);
		var isForLand = (assocWith.indexOf('land') != -1);
		
		// geographical fields
		var blStatement = "EXISTS(SELECT bl.bl_id FROM bl WHERE bl.bl_id = ls.bl_id ";
		var prStatement = "EXISTS(SELECT property.pr_id FROM property WHERE property.pr_id =  ls.pr_id ";
		// geo_region id
		var geoRegionId = filterDefs.get('ctry.geo_region_id').value;
		if (valueExistsNotEmpty(geoRegionId)) {
			blStatement += " AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id " + (isArray(geoRegionId)?"IN ('" + geoRegionId.join("','") + "')" : " = '" + geoRegionId + "'" ) + " )";
			prStatement += " AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = property.ctry_id AND ctry.geo_region_id " + (isArray(geoRegionId)?"IN ('" + geoRegionId.join("','") + "')" : " = '" + geoRegionId + "'" ) + " )";
		}
		// ctry_id
		var ctryId = filterDefs.get('bl.ctry_id').value;
		if (valueExistsNotEmpty(ctryId)) {
			blStatement += " AND bl.ctry_id " + (isArray(ctryId)?"IN ('" + ctryId.join("','") + "')": " = '" + ctryId + "'");
			prStatement += " AND property.ctry_id " + (isArray(ctryId)?"IN ('" + ctryId.join("','") + "')": " = '" + ctryId + "'");
		}
		
		// state_id
		var stateId = filterDefs.get('bl.state_id').value;
		if (valueExistsNotEmpty(stateId)) {
			blStatement += " AND bl.state_id " + (isArray(stateId)?"IN ('" + stateId.join("','") + "')": " = '" + stateId + "'");
			prStatement += " AND property.state_id " + (isArray(stateId)?"IN ('" + stateId.join("','") + "')": " = '" + stateId + "'");
		}

		// city_id
		var cityId = filterDefs.get('bl.city_id').value;
		if (valueExistsNotEmpty(cityId)) {
			blStatement += " AND bl.city_id " + (isArray(cityId)?"IN ('" + cityId.join("','") + "')": " = '" + cityId + "'");
			prStatement += " AND property.city_id " + (isArray(cityId)?"IN ('" + cityId.join("','") + "')": " = '" + cityId + "'");
		}
		
		// site_id
		var siteId = filterDefs.get('bl.site_id').value;
		if (valueExistsNotEmpty(siteId)) {
			blStatement += " AND bl.site_id " + (isArray(siteId)? "IN ('" + siteId.join("','") + "')": " = '" + siteId + "'");
			prStatement += " AND property.site_id " + (isArray(siteId)? "IN ('" + siteId.join("','") + "')": " = '" + siteId + "'");
		}
		// set associated with 
		if (isForStructure && !isForLand) {
			prStatement += " AND property.property_type = 'Structure')";
		} else if (isForLand && !isForStructure) {
			prStatement += " AND property.property_type = 'Land')";
		} else {
			prStatement += ")";
		}
		
		//bl.use1
		var blUse = filterDefs.get('bl.use1').value;
		if (valueExistsNotEmpty(blUse)) {
			blStatement += " AND bl.use1 " + (isArray(blUse)? "IN ('" + blUse.join("','") + "')": " = '" + blUse + "'");
		}
		
		blStatement += ")"; 
		
		var restriction = "1 = 1";
		if (isForBuilding && (isForStructure || isForLand)) {
			restriction += " AND (" +  blStatement + " OR "+ prStatement + ")";
		} else if (isForBuilding && !isForLand && !isForStructure){
			restriction += " AND " + blStatement;
		} else if (!isForBuilding && (isForStructure || isForLand)) {
			restriction += " AND " + prStatement;
		}
		
		//ls.pr_id
		var prId = filterDefs.get('ls.pr_id').value;
		if (valueExistsNotEmpty(prId)) {
			restriction += " AND ls.pr_id " + (isArray(prId)? "IN ('" + prId.join("','") + "')": " = '" + prId + "'");
		}
		//ls.bl_id
		var blId = filterDefs.get('ls.bl_id').value;
		if (valueExistsNotEmpty(blId)) {
			restriction += " AND ls.bl_id " + (isArray(blId)? "IN ('" + blId.join("','") + "')": " = '" + blId + "'");
		}
		//ls.ac_id
		var acId = filterDefs.get('ls.ac_id').value;
		if (valueExistsNotEmpty(acId)) {
			restriction += " AND ls.ac_id " + (isArray(acId)? "IN ('" + acId.join("','") + "')": " = '" + acId + "'");
		}
		//ls.ls_id
		var lsId = filterDefs.get('ls.ls_id').value;
		if (valueExistsNotEmpty(lsId)) {
			restriction += " AND ls.ls_id " + (isArray(lsId)? "IN ('" + lsId.join("','") + "')": " = '" + lsId + "'");
		}
		//ls.ld_name
		var ldName = filterDefs.get('ls.ld_name').value;
		if (valueExistsNotEmpty(ldName)) {
			restriction += " AND ls.ld_name " + (isArray(ldName)? "IN ('" + ldName.join("','") + "')": " = '" + ldName + "'");
		}
		//ls.ld_contact
		var ldContact = filterDefs.get('ls.ld_contact').value;
		if (valueExistsNotEmpty(ldContact)) {
			restriction += " AND ls.ld_contact " + (isArray(ldContact)? "IN ('" + ldContact.join("','") + "')": " = '" + ldContact + "'");
		}
		//ls.tn_name
		var tnName = filterDefs.get('ls.tn_name').value;
		if (valueExistsNotEmpty(tnName)) {
			restriction += " AND ls.tn_name " + (isArray(tnName)? "IN ('" + tnName.join("','") + "')": " = '" + tnName + "'");
		}
		//ls.tn_contact
		var tnContact = filterDefs.get('ls.tn_contact').value;
		if (valueExistsNotEmpty(tnContact)) {
			restriction += " AND ls.tn_contact " + (isArray(tnContact)? "IN ('" + tnContact.join("','") + "')": " = '" + tnContact + "'");
		}
		//ls.landlord_tenant
		var landlordTenant = filterDefs.get('ls.landlord_tenant').value;
		if (valueExistsNotEmpty(landlordTenant)) {
			restriction += " AND ls.landlord_tenant " + (isArray(landlordTenant)? "IN ('" + landlordTenant.join("','") + "')": " = '" + landlordTenant + "'");
		}
		
		var predefFilterValue = filterDefs.get('show_predef_filter').value;
		if (predefFilterValue != -1) {
			restriction += this.getPredefinedFilterRestriction(predefFilterValue, restriction);
			
		}else{
			var isExpiredDates = filterDefs.get('expired_dates').value == 1;
			var optExpiredConditions = "1 = 1";
			if (!isExpiredDates) {
				restriction += "  AND (ls.date_end IS NULL OR ls.date_end >= ${sql.currentDate}) ";
				optExpiredConditions = "(op.date_option IS NULL OR op.date_option >= ${sql.currentDate})";
			}
			
			// ls.date_end range
			var lsDateEndRange = filterDefs.get('ls_end_date_range').value;
			var currentDate = new Date();
			if (lsDateEndRange != -1) {
				var endDate = this.getRangeEndDate(currentDate, lsDateEndRange);
				restriction += " AND (ls.date_end IS NOT NULL AND ls.date_end >= " + this.getSqlDate(currentDate) + " AND ls.date_end < " + this.getSqlDate(endDate) + ")";
			}
			
			// options exp date range
			var optExpDateEndRange = filterDefs.get('opt_end_date_range').value;
			if (optExpDateEndRange != -1) {
				var endDate = this.getRangeEndDate(currentDate, optExpDateEndRange);
				restriction += " AND EXISTS(SELECT op.op_id FROM op WHERE op.ls_id = ls.ls_id AND " + optExpiredConditions + " AND (op.date_option IS NOT NULL AND op.date_option >= " + this.getSqlDate(currentDate) + " AND op.date_option < " + this.getSqlDate(endDate) + "))";
			} 
//			else if (!isExpiredDates) {
//				restriction += " AND EXISTS(SELECT op.op_id FROM op WHERE op.ls_id = ls.ls_id AND " + optExpiredConditions + " )";
//			}
		}
		return restriction;
	},
	
	getRangeEndDate: function(refDate, dateRange){
		var endMonth = DateMath.add(refDate, DateMath.MONTH, parseInt(dateRange));
		return DateMath.findMonthEnd(endMonth);
	},
	
	getSqlDate: function(date){
		var month = date.getMonth()+1;
		var day = date.getDate();
		var sqlYear = "" + date.getFullYear();
		var sqlMonth = "" + (month < 10 ? "0" + month : month);
		var sqlDay = "" + (day < 10 ? "0" + day : day);
		return "${sql.date('" + sqlYear	+ "-" + sqlMonth + "-" + sqlDay + "')}";
	},
	
	getLiteralDate: function(date){
		var month = date.getMonth()+1;
		var day = date.getDate();
		var sqlYear = "" + date.getFullYear();
		var sqlMonth = "" + (month < 10 ? "0" + month : month);
		var sqlDay = "" + (day < 10 ? "0" + day : day);
		return "'#" + sqlYear	+ "-" + sqlMonth + "-" + sqlDay + "'";
	},
	
	getPredefinedFilterRestriction: function(predefinedFilter, restriction) {
		var dbTypeDs = View.dataSources.get('dsIsOracle');
		var rec = dbTypeDs.getRecord();
		var isOracledDb = parseInt(rec.getValue('afm_tbls.table_name')) > 0;
		
		var sqlStatement = "";
		var currentDate = new Date();
		if (predefinedFilter == 'opt_filter_1') {
			//Overdue Leases
			sqlStatement = " AND (ls.date_end IS NOT NULL AND ls.date_end < " + this.getSqlDate(currentDate) + ")";
		} else if (predefinedFilter == 'opt_filter_2') {
			//Leases Expiring within 60 Days   
			sqlStatement = " AND (ls.date_end IS NOT NULL AND ls.date_end > " + this.getSqlDate(currentDate) + " AND ls.date_end < ${sql.dateAdd('day', 60, " + this.getLiteralDate(currentDate) + ")})";
		} else if (predefinedFilter == 'opt_filter_3') {
			//Leases with Options Expiring within 60 Days	
			sqlStatement = " AND EXISTS(SELECT op.op_id FROM op WHERE op.ls_id = ls.ls_id AND op.date_review > " + this.getSqlDate(currentDate) + " " +
					"AND op.date_review < ${sql.dateAdd('day', 60, " + this.getLiteralDate(currentDate) + ")})";
		} else if (predefinedFilter == 'opt_filter_4') {
			//Leases with Base Rent Escalations Within 60 Days
			sqlStatement = " AND EXISTS(SELECT ls_index_profile.ls_id FROM ls_index_profile WHERE ls_index_profile.ls_id = ls.ls_id " +
					"AND ls_index_profile.date_index_next > " + this.getSqlDate(currentDate) + " AND ls_index_profile.date_index_next < ${sql.dateAdd('day', 60, " + this.getLiteralDate(currentDate) + ")})";
		} else if (predefinedFilter == 'opt_filter_5') {
			//Leases with Active Alerts
			sqlStatement = " AND EXISTS(SELECT op.op_id FROM op WHERE op.ls_id = ls.ls_id AND ((ls.date_end IS NOT NULL AND ls.date_end > " + this.getSqlDate(currentDate) + " " +
					"AND ls.date_end < ${sql.dateAdd('day', 60, " + this.getLiteralDate(currentDate) + ")}) OR ( op.date_review > " + this.getSqlDate(currentDate) + " " +
							"AND op.date_review < ${sql.dateAdd('day', 60, " + this.getLiteralDate(currentDate) + ")}))) ";
		} else if(predefinedFilter == 'opt_filter_6') {
			if (isOracledDb) {
				sqlStatement = " AND ls.ls_id IN (SELECT ls_int.ls_id  FROM (SELECT ls.ls_id ${sql.as} ls_id, row_number() OVER (order by ls.date_start desc) ${sql.as} row_num " +
						"FROM ls WHERE ls.use_as_template = 0 AND ls.date_start IS NOT NULL AND ls.date_start <= " + this.getSqlDate(currentDate) + " AND " + restriction + ") ${sql.as} ls_int WHERE ls_int.row_num <= 10 ) ";
			}else{
				sqlStatement = " AND ls.ls_id IN (SELECT TOP 10 ls_int.ls_id FROM ls ${sql.as} ls_int WHERE ls_int.use_as_template = 0 AND ls_int.date_start IS NOT NULL " +
						"AND ls_int.date_start <= " + this.getSqlDate(currentDate) + " AND "  + restriction.replace('ls.', 'ls_int.') +  "  ORDER BY ls_int.date_start DESC) ";
			}
		} 
		return sqlStatement;
	},
	
	abRepmLeaseList_onNew: function(){
		var controller = this;
		
		View.openDialog('ab-rplm-addlease.axvw',null, true, {
			width:1280,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('addNewLease');
					dialogController.newLease.showField('ls.bl_id', true);
					dialogController.newLease.showField('ls.pr_id', true);
					dialogController.newLease.showField('dummy_field', true);
				},
				callback: function(res){
					View.closeDialog();
					controller.loadLease(res, true);
				}
		});
	},
	
	loadLease: function(leaseId, withRefresh) {
		if (valueExists(withRefresh) && withRefresh) {
			// set and apply filter for selected lease
			this.abRepmLeaseConsole_basic_onClear(this.abRepmLeaseConsole_basic, this.abRepmLeaseConsole_basic.actions.get('clear'));
			this.abRepmLeaseConsole_basic.setFieldValue('ls.ls_id', leaseId);
			this.abRepmLeaseConsole_basic_onFilter(this.abRepmLeaseConsole_basic, this.abRepmLeaseConsole_basic.actions.get('filter'));
		}
		var context = {
				restriction: {'ls.ls_id': leaseId}
		};
		showLeaseDetails(context);
	},
	
	onChangeDisplayMode: function(newDisplayMode){
		if (this.displayMode != newDisplayMode) {
			this.displayMode = newDisplayMode;
			var displayModeTitle = getMessage('titleDisplayMode') + ' ' + getMessage('titleDisplayMode_' + this.displayMode);
			this.abRepmLeaseConsole_basic.actions.get('showMode').setTitle(displayModeTitle);
			
			if (valueExistsNotEmpty(this.leaseId)) {
				this.loadLease(this.leaseId);
			}
		}
	}
	
});

/**
 * Open lease console
 * @param ctx context
 */
function showLeaseDetails(ctx, navigateToTab){
	var restriction = null;
	var tabTitle = "";
	var lsId = null;
	if(navigateToTab == undefined ){
		navigateToTab = true;
	}
	if (valueExists(ctx.restriction)) {
		lsId = ctx.restriction['ls.ls_id'];
		tabTitle = getMessage("titleLeaseDetails").replace('{0}', lsId);
		restriction = new Ab.view.Restriction(ctx.restriction);
		var tabs = View.panels.get('abLeaseConsole_mainTabs');
		if (tabs) {
			var selLsController = View.controllers.get('abRepmAddeditSelectLeaseController');
			selLsController.leaseId = lsId;
			var displayMode = selLsController.displayMode;
			
			tabs.showTab('abLeaseConsole_detailTab', (displayMode == 'standard' || displayMode == 'basic'));
			tabs.showTab('abLeaseConsole_completeTab', displayMode == 'complete');
			var detailsTabName = null;
			var detailsTabControllerName = null;
			if (displayMode == 'complete') {
				detailsTabName = 'abLeaseConsole_completeTab';
				detailsTabControllerName = 'abLsConsoleCompleteController';
			}else{
				detailsTabName = 'abLeaseConsole_detailTab';
				detailsTabControllerName = 'abRepmAddeditLeaseDetailsController';
			}
			
			tabs.enableTab(detailsTabName, true);
			tabs.setTabTitle(detailsTabName, tabTitle);
			var detailsController = View.controllers.get(detailsTabControllerName);
			if (detailsController) {
				detailsController.loadDetailsForLease(lsId, displayMode);
			}
			if(navigateToTab){
				tabs.selectTab(detailsTabName, null, false, false, true);
				showLeaseProfile(ctx, false);
			}
		}
	}
}


function onDisplayModeStandard(){
	View.controllers.get('abRepmAddeditSelectLeaseController').onChangeDisplayMode('standard');
}

function onDisplayModeBasic(){
	View.controllers.get('abRepmAddeditSelectLeaseController').onChangeDisplayMode('basic');
}

function onDisplayModeComplete(){
	View.controllers.get('abRepmAddeditSelectLeaseController').onChangeDisplayMode('complete');
}

/**
 * Open lease profile tab
 * @param ctx command context
 */
function showLeaseProfile(ctx, navigateToTab){
	var lsId = null;
	var blId = null;
	var prId = null;
	var tabTitle = "";
	
	if(navigateToTab == undefined){
		navigateToTab = true;
	}
	if(valueExists(ctx.restriction)){
		lsId = ctx.restriction['ls.ls_id'];
		
		var parameters = {
				tableName: 'ls',
				fieldNames:toJSON(['ls.ls_id', 'ls.bl_id', 'ls.pr_id']),
				restriction: toJSON({'ls.ls_id':lsId})
			}
			var result = Workflow.call('AbCommonResources-getDataRecord', parameters);
			if (result.code == 'executed') {
				blId = result.dataSet.getValue('ls.bl_id');
				prId = result.dataSet.getValue('ls.pr_id');
			}else{
				Workflow.handleError(result);
			}
		
		
		tabTitle = getMessage("titleLeaseProfile").replace('{0}', lsId);
		var tabs = View.panels.get('abLeaseConsole_mainTabs');
		if (tabs){
			tabs.enableTab('abLeaseConsole_profileTab', true);
			tabs.setTabTitle('abLeaseConsole_profileTab', tabTitle);
			var profileController = View.controllers.get('repLeaseDetails');
			if (profileController) {
				profileController.ls_id = lsId;
				profileController.bl_id = blId;
				profileController.pr_id = prId;
				profileController.initializeView();
			}
			if(navigateToTab){
				tabs.selectTab('abLeaseConsole_profileTab', null, false, false, true);
				// initiallize details tab also
				showLeaseDetails(ctx, false);
			}
		}
	}
}

/**
 * Check if value is array.
 *  
 * @param value value
 * @returns boolean
 */
function isArray(value){
	return (typeof(value) === 'object' && value instanceof Array)?true:false;
}

/**
 * Make safe value for sql.
 * 
 * @param value string value
 * @return object 
 */
function safeSqlValue(value){
	if (isArray(value)) {
		for (var i = 0; i < value.length; i++) {
			value[i] = string2SafeSqlString(value[i]);
		}
	}else {
		value = string2SafeSqlString(value);
	}
	return value;
}

/**
 * Make safe sql string.
 *  
 * @param value
 * @return string
 */
function string2SafeSqlString(value){
	if (valueExistsNotEmpty(value)) {
		value = value.replace(/\'/g, "''");
	}
	return value;
}






