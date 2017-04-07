//Global variables
// filter config options
var registryFilterConfig = new Ext.util.MixedCollection();

registryFilterConfig.addAll(
		{id: 'alignment_field_1', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'deprec_method', fieldConfig: {type: 'enumList', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
		{id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
		{id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},
		
		{id: 'system_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'assembly_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.stakeholder_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.criticality_function', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.criticality_mission', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'activity_log.csi_id', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}}
	);


var abEamAssetRegistryController = View.createController('abEamAssetRegistryController', {
	// filter console controller
	filterController: null,
	
	filterRestriction: null,
	
	// main controller - tabs
	mainController: null,
	
	afterViewLoad: function(){
		// customize mini console
		this.abEamAssetRegistry_list.addEventListener('afterBuildHeader', this.abEamAssetRegistry_list_customizeHeader, this);
		
		var controller = this;
		// customize grid columns
		this.abEamAssetRegistry_list.afterCreateCellContent = function(row, column, cellElement){
			controller.customizeAssetRegistryFields(row, column, cellElement);
		};
		
		this.abEamLifecycleAssetSummaryByType_table.afterGetData = function(dataSet){
			controller.customizeAssetSummaryFields(dataSet);
		}
		
		this.initializeFilterConfig();
		this.filterController = View.controllers.get('abEamAssetFilterCtrl');
		this.filterController.initializeConfigObjects(registryFilterConfig);
		var controller = this;
		this.filterController.onFilterCallback = function(restriction){
			controller.onFilter(restriction);
		};
		this.filterController.onClickActionButton1Handler = function(buttonElem){
			controller.onClickReportMenu(buttonElem);
		};
		this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
	
	},
	
	configureMapPanel: function(){
		// for case when view panel has frame
		this.abAssetSelectLocation.parameters["showMapTools"] = false;
		this.abAssetSelectLocation.parameters["panelTitle"] = getMessage('titleMapPanel');
		
		var parentTab = this.mainController.abEamAssetLifecycleConsoleTabs.findTab('abEamAssetLifecycleConsoleTabs_registry');
		if(parentTab){
			if(!valueExists(parentTab.parameters)){
				parentTab.parameters = {};
			}
			parentTab.parameters["showMapTools"] = false;
			parentTab.parameters["panelTitle"] = getMessage('titleMapPanel');
		}

		// configure map tools action button
    	this.initializeMapTools();
	},

	afterInitialDataFetch: function(){
		// get main Controller
		this.mainController = this.getMainController();
		// set filter restriction if was applied from another tab
		this.filterController.setRestriction(this.mainController.filterRestriction);
		// initialize filter
		this.filterController.initializeFilter();
		
		if(valueExistsNotEmpty(this.mainController.queryParameters['bl_id'])) {
			this.filterController.setFieldValue('bl.bl_id', this.mainController.queryParameters['bl_id']);
		}
		if(valueExistsNotEmpty(this.mainController.queryParameters['project_id'])) {
			this.filterController.setFieldValue('bl.project_id', this.mainController.queryParameters['project_id']);
		}
		
		this.configureMapPanel();
		// load initial data
		this.filterController.abEamAssetFilter_onFilter();
	},
	
	/**
	 * Customize fields for asset registry panel
	 */
	customizeAssetRegistryFields: function(row, column, cellElement){
		if(column.id == 'bl.asset_type'){
			cellElement.childNodes[0].innerHTML = getMessage('asset_type_' + cellElement.childNodes[0].text);
		}else if (column.id == 'bl.asset_status'){
			var status = row.row.getFieldValue('bl.asset_status');
			var assetType = row.row.getFieldValue('bl.asset_type');
			var localizedValue = this.getLocalizedAssetStatus(assetType, status);
			cellElement.childNodes[0].innerHTML = localizedValue;
		}
	},
	
	/**
	 * Customize asset summary by type table
	 */
	customizeAssetSummaryFields: function(dataSet){
		if (valueExists(dataSet) && valueExists(dataSet.rowValues)) {
			for(var i = 0; i < dataSet.rowValues.length; i++){
				dataSet.rowValues[i].l = getMessage('asset_type_' + dataSet.rowValues[i].n);
			}
		}
	},

	/**
	 * On filter event handler
	 * @param restriction restriction object 
	 */
	onFilter: function(restriction){
		//set current restriction  to main controller.
		this.mainController.filterRestriction = restriction;
		
		var assetRestriction = getRestrictionForAssetRegistryFromFilter(restriction);
		var objRestriction = assetRestriction.restriction;
		var sqlTypeRestriction = valueExistsNotEmpty(assetRestriction.sql)?assetRestriction.sql:"1=1";
		var blTypeRestriction = valueExistsNotEmpty(assetRestriction.blSql)?assetRestriction.blSql:"1=1";
		var eqTypeRestriction = valueExistsNotEmpty(assetRestriction.eqSql)?assetRestriction.eqSql:"1=1";
		var taTypeRestriction = valueExistsNotEmpty(assetRestriction.taSql)?assetRestriction.taSql:"1=1";
		var propertyTypeRestriction = valueExistsNotEmpty(assetRestriction.propertySql)?assetRestriction.propertySql:"1=1";
		
		this.abEamAssetRegistry_list.addParameter('blTypeRestriction', blTypeRestriction);
		this.abEamAssetRegistry_list.addParameter('eqTypeRestriction', eqTypeRestriction);
		this.abEamAssetRegistry_list.addParameter('taTypeRestriction', taTypeRestriction);
		this.abEamAssetRegistry_list.addParameter('propertyTypeRestriction', propertyTypeRestriction);
		this.abEamAssetRegistry_list.addParameter('sqlTypeRestriction', sqlTypeRestriction);
		
		this.abEamAssetRegistry_list.refresh(objRestriction);
		
		//cross table issue if restriction is empty previous restriction is kept
		// convert sql restriction object to sql restriction - custom datasource has virtual fields
		sqlTypeRestriction += (valueExistsNotEmpty(sqlTypeRestriction)?" AND ": "") + restrictionToSql(objRestriction);
		
		this.abEamLifecycleAssetSummaryByType_table.restriction = null;
		this.abEamLifecycleAssetSummaryByType_table.addParameter('blTypeRestriction', blTypeRestriction);
		this.abEamLifecycleAssetSummaryByType_table.addParameter('eqTypeRestriction', eqTypeRestriction);
		this.abEamLifecycleAssetSummaryByType_table.addParameter('taTypeRestriction', taTypeRestriction);
		this.abEamLifecycleAssetSummaryByType_table.addParameter('propertyTypeRestriction', propertyTypeRestriction);
		this.abEamLifecycleAssetSummaryByType_table.addParameter('sqlTypeRestriction', sqlTypeRestriction);
		this.abEamLifecycleAssetSummaryByType_table.refresh();
		
	},	
	
	// initialize filter config objects
	initializeFilterConfig: function(){
		
	},
	
	getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamAssetConsoleController'))) {
			controller = this.view.getOpenerView().controllers.get('abEamAssetConsoleController');
		}
		return controller;
	},
	
	showAssetDetails: function(record){
		var assetId = record.getValue('bl.asset_id');
		var assetType = record.getValue('bl.asset_type');
		var mapController = this.view.controllers.get('abEamGisMapController');
		if(mapController) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bl.asset_id', assetId, '=');
			restriction.addClause('bl.asset_type', assetType, '=');
			
			mapController.refreshMap(restriction, null, assetId, assetType);
		}
	},
	
	onAddEditAsset: function(type, viewName, restriction, newRecord){
		var controller = this;
		var dialogConfig = null;
		if(type == 'bl'){
			dialogConfig = {
					width: 1024, 
					height: 800, 
					closeButton: true, 
					type: type, 
					hideTabs: true,
					callback: function(){
						controller.abEamAssetRegistry_list.refresh(controller.abEamAssetRegistry_list.restriction);
					}};  
		}else{
			dialogConfig = {
					width: 1024, 
					height: 800, 
					closeButton: true, 
					callback: function(){
						controller.abEamAssetRegistry_list.refresh(controller.abEamAssetRegistry_list.restriction);
					}};  
		}
		
		View.getOpenerView().openDialog(viewName, restriction, newRecord, dialogConfig);
	},
	
	abEamAssetRegistry_list_customizeHeader: function(panel, parentElement){
		var columnIndex = 0;
		for (var i=0, col; col = panel.columns[i]; i++) {
			if(col.id == 'bl.asset_type' && !col.hidden){
				var headerRows = parentElement.getElementsByTagName("tr");
				// customize filter row if this exists
				if (headerRows.length > 1 && headerRows[1].id == panel.id + '_filterRow' ) {
					var filterInputId = panel.getFilterInputId(col.id);
					this.updateMiniConsole(panel, headerRows[1], columnIndex, filterInputId);
				}
			}
			if (!col.hidden) {
				columnIndex++;
			}
		}
	},

	/**
	 * Customize filter row for recurring pattern column.
	 * 
	 * @param panel grid panel
	 * @param rowElement filter row element
	 * @param columnIndex column index
	 * @param filterInputId filter input id
	 */
	updateMiniConsole: function(panel, rowElement, columnIndex, filterInputId) {
		var recurringTypes = {
				'bl': getMessage('asset_type_bl'),
				'eq': getMessage('asset_type_eq'),
				'ta': getMessage('asset_type_ta'),
				'property': getMessage('asset_type_property')
			};

		var headerCells = rowElement.getElementsByTagName("th");
		var headerCell = headerCells[columnIndex];
		// remove input element if exists
		var inputElements = headerCell.getElementsByTagName("input");
		if (inputElements[filterInputId]) {
			headerCell.removeChild(inputElements[filterInputId]); 
		}
		// add select element
		var i = 0;
		var input = document.createElement("select");
		input.options[i++] = new Option("","", true);
		for(var storedValue in recurringTypes){
			input.options[i++] = new Option(recurringTypes[storedValue], storedValue);
		}	
		input.className="inputField_box";				

		// run filter when user click on one enum value
		Ext.EventManager.addListener(input, "change", panel.onFilter.createDelegate(panel));
		input.id = filterInputId;
		if (headerCell.childNodes.length > 0) {
			headerCell.insertBefore(input,headerCell.childNodes[0]);
		}else{
			headerCell.appendChild(input);
		}
	},
	
	/**
	 * Returns localized status value for asset.
	 * @param type  asset type
	 * @param value status value
	 * @return string
	 */
	getLocalizedAssetStatus: function(type, value){
		var localizedValue = '';
		if(valueExistsNotEmpty(value)){
			var assetStatusDs = this.abAssetRegistryStatus_ds;
			if(type == 'bl'){
				localizedValue = assetStatusDs.fieldDefs.get('bl.status').enumValues[value];
			}else if(type == 'property'){
				localizedValue = assetStatusDs.fieldDefs.get('property.status').enumValues[value];
			}else if(type == 'eq'){
				localizedValue = assetStatusDs.fieldDefs.get('eq.status').enumValues[value];
			}else if(type == 'ta'){
				localizedValue = assetStatusDs.fieldDefs.get('ta.status').enumValues[value];
			}
		}
		return localizedValue;
	},
	
	onEditRow: function(row){
		var record = row.row.getRecord();
		var assetId = record.getValue('bl.asset_id');
		var assetType = record.getValue('bl.asset_type');
		var viewName = '';
		var restriction = new Ab.view.Restriction();
		if(assetType == 'bl'){
			restriction.addClause('bl.bl_id', assetId, '=');
			viewName = 'ab-eam-def-geo-loc.axvw';
		} else if(assetType == 'property'){
			restriction.addClause('property.pr_id', assetId, '=');
			viewName = 'ab-rplm-properties-define-form.axvw';
		} else if(assetType == 'eq'){
			restriction.addClause('eq.eq_id', assetId, '=');
			viewName = 'ab-eq-edit-form.axvw';
		} else if(assetType == 'ta'){
			restriction.addClause('ta.ta_id', assetId, '=');
			viewName = 'ab-ta-edit-form.axvw';
		}
		View.controllers.get('abEamAssetRegistryController').onAddEditAsset(assetType, viewName, restriction, false);
		View.controllers.get('abEamAssetRegistryController').showAssetDetails(record);
	},
	
	onProfileRow: function(row){
		var record = row.row.getRecord();
		var assetId = record.getValue('bl.asset_id');
		var assetType = record.getValue('bl.asset_type');
		var viewName = null;
		var restriction = new Ab.view.Restriction();
		if(assetType == 'bl'){
			viewName = 'ab-profile-building.axvw';
			restriction.addClause('bl.bl_id', assetId, '=');
		} else if(assetType == 'property'){
			viewName = 'ab-profile-property.axvw';
			restriction.addClause('property.pr_id', assetId, '=');
		} else if(assetType == 'eq'){
			viewName = 'ab-profile-equipment.axvw';
			restriction.addClause('eq.eq_id', assetId, '=');
		} else if(assetType == 'ta'){
			viewName = 'ab-profile-ta.axvw';
			restriction.addClause('ta.ta_id', assetId, '=');
		}
		
		View.getOpenerView().openDialog(viewName, restriction, false, {
			width:1024,
			height: 600,
			closeButton: true
		})
		
	},
	
	onActivitiesRow: function(row){
		var record = row.row.getRecord();
		var assetType = record.getValue('bl.asset_type');
		var assetId = record.getValue('bl.asset_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.asset_type', assetType, '=');
		restriction.addClause('bl.asset_id', assetId, '=');
		
		View.openDialog('ab-eam-disposal-asset-summary.axvw', restriction, false, {
			applyActionStatusRestriction: true,
			width: 1024,
			heigth:800,
			closeButton: true
		});
		
	},
	
	onShowDetails: function(row){
		var record = row.row.getRecord();
		View.controllers.get('abEamAssetRegistryController').showAssetDetails(row.row.getRecord());
	},

	onClickReportMenu: function(buttonElem){
    	
    	var reportMenuItem = new MenuItem({
    		menuDef: {
    			id: 'reportsMenu',
    			type: 'menu',
    			viewName: null, 
    			isRestricted: false, 
    			parameters: null},
    		onClickMenuHandler: onClickMenu,
    		onClickMenuHandlerRestricted: onClickMenuWithRestriction,
    		submenu: abEamReportsCommonMenu
    	});
    	reportMenuItem.build();
    	
		var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
		menu.show(buttonElem, 'tl-bl?');
    },
    
    initializeMapTools: function(){
    	var menuActions = new Ext.util.MixedCollection();
    	menuActions.addAll(
		     {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},     
		     {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},     
		     {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}     
    	);
    	
    	var mapToolsActionConfig = new Ext.util.MixedCollection();
    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

    	var mapController = this.view.controllers.get('abEamGisMapController');
    	if(mapController){
    		mapController.configureMapAction(mapToolsActionConfig);
    	}
    } 
});

function onAddAsset(assetType){
	var controller = View.controllers.get('abEamAssetRegistryController');
	var viewName = '';
	if(assetType == 'bl'){
		viewName = 'ab-eam-def-geo-loc.axvw';
	} else if(assetType == 'property'){
		viewName = 'ab-rplm-properties-define-form.axvw';
	} else if(assetType == 'eq'){
		viewName = 'ab-eq-edit-form.axvw';
	} else if(assetType == 'ta'){
		viewName = 'ab-ta-edit-form.axvw';
	}
	
	controller.onAddEditAsset(assetType, viewName, null, true);
}


function onShowDetailsRegistryRow(row){
	var record = row.row.getRecord();
	View.controllers.get('abEamAssetRegistryController').showAssetDetails(row.row.getRecord());
}

function onClickMenu(menu){
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

function onClickMenuWithRestriction(menu){
	// TODO : pass restriction to view name
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}
