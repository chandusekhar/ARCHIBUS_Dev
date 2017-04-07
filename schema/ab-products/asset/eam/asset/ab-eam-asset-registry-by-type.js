/**
 * Controller definition. 
 */
var abEamAssetByTypeCtrl = View.createController('abEamAssetByTypeCtrl', {
	
	visibleFields: null,
	
	assetByTypeConfig: null,
	
	abEamAssetRegistryByType_list_action_1_onClickHandler: null,

	abEamAssetRegistryByType_list_action_bar_1_onClickHandler: null,

	abEamAssetRegistryByType_row_action_1_config: null,
	
	abEamAssetRegistryByType_row_action_1_onClickHandler: null,


	abEamAssetRegistryByType_row_action_2_config: null,
	
	abEamAssetRegistryByType_row_action_2_onClickHandler: null,
	
	abEamAssetRegistryByType_row_icon_1_config: null,
	
	abEamAssetRegistryByType_row_icon_1_onClickHandler: null,

	abEamAssetRegistryByType_row_icon_2_config: null,
	
	abEamAssetRegistryByType_row_icon_2_onClickHandler: null,

	onShowDetailsHandler: null,

	isMultipleSelectionEnabled:false,
	
	onMultipleSelectionChangedHandler: null,
	
	afterViewLoad: function(){
		var controller = this;
		// customize grid columns
		this.abEamAssetRegistryByType_list.afterCreateCellContent = function(row, column, cellElement){
			if(column.id == 'bl.asset_type'){
				cellElement.childNodes[0].innerHTML = getMessage('asset_type_' + cellElement.childNodes[0].text);
			} else if (column.id == 'abEamAssetRegistryByType_row_action_1'){
				cellElement.childNodes[0].value = controller.abEamAssetRegistryByType_row_action_1_config['title'];
			}else if (column.id == 'abEamAssetRegistryByType_row_action_2'){
				cellElement.childNodes[0].value = controller.abEamAssetRegistryByType_row_action_2_config['title'];
			}else if (column.id == 'abEamAssetRegistryByType_row_icon_1'){
				cellElement.childNodes[0].value = controller.abEamAssetRegistryByType_row_icon_1_config['title'];
			}else if (column.id == 'abEamAssetRegistryByType_row_icon_2'){
				cellElement.childNodes[0].value = controller.abEamAssetRegistryByType_row_icon_2_config['title'];
			} else if (column.id == 'bl.asset_status'){
				var assetStatusDs = controller.abAssetRegistryStatus_ds;
				var status = row.row.getFieldValue('bl.asset_status');
				if(valueExistsNotEmpty(status)){
					var statusLayout = ''
					var assetType = row.row.getFieldValue('bl.asset_type');
					if(assetType == 'bl'){
						statusLayout = assetStatusDs.fieldDefs.get('bl.status').enumValues[status];
					}else if(assetType == 'property'){
						statusLayout = assetStatusDs.fieldDefs.get('property.status').enumValues[status];
					}else if(assetType == 'eq'){
						statusLayout = assetStatusDs.fieldDefs.get('eq.status').enumValues[status];
					}else if(assetType == 'ta'){
						statusLayout = assetStatusDs.fieldDefs.get('ta.status').enumValues[status];
					}
					cellElement.childNodes[0].innerHTML = statusLayout;
				}
			}
		}
	},
	
	afterInitialDataFetch: function(){
		var parentObj = null;
		if(valueExists(this.view.parentViewPanel) ){
			parentObj = this.view.parentViewPanel;
		} else if (valueExists(this.view.parentTab)) {
			parentObj = this.view.parentTab;
		}
		
		if(valueExists(parentObj.parameters) 
				&& valueExists(parentObj.parameters['visibleFields'])){
			this.visibleFields = parentObj.parameters['visibleFields'];
		}

		if(valueExists(parentObj.parameters) 
				&& valueExists(parentObj.parameters['assetByTypeConfig'])){
			this.assetByTypeConfig = parentObj.parameters['assetByTypeConfig'];
		}
		

		if(valueExists(this.assetByTypeConfig)){
			this.configureAssetByType(this.assetByTypeConfig);
		}
		// set multiple selection
		this.abEamAssetRegistryByType_list.multipleSelectionEnabled = this.isMultipleSelectionEnabled;
		this.abEamAssetRegistryByType_list.showColumn('multipleSelectionColumn', this.isMultipleSelectionEnabled);
		if (this.isMultipleSelectionEnabled) {
			// multiple selection change event listener
			this.abEamAssetRegistryByType_list.addEventListener('onMultipleSelectionChange', abEamAssetRegistryByType_list_onMultipleSelectionChange);
		}

		// show/ hide action bar
		this.abEamAssetRegistryByType_list.actionbar.toolbar.getEl().dom.style.display = this.isMultipleSelectionEnabled?'':'none';
		
		// show row action
		// KB 3050708  remove row action from columns object
		if(valueExists(this.abEamAssetRegistryByType_row_action_1_config)){
			this.abEamAssetRegistryByType_list.showColumn('abEamAssetRegistryByType_row_action_1', valueExists(this.abEamAssetRegistryByType_row_action_1_config));
			this.configColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_action_1', this.abEamAssetRegistryByType_row_action_1_config);
		} else {
			this.removeColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_action_1');
		}
		if(valueExists(this.abEamAssetRegistryByType_row_action_2_config)) {
			this.abEamAssetRegistryByType_list.showColumn('abEamAssetRegistryByType_row_action_2', valueExists(this.abEamAssetRegistryByType_row_action_2_config));
			this.configColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_action_2', this.abEamAssetRegistryByType_row_action_2_config);
		} else {
			this.removeColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_action_2');
		}

		if(valueExists(this.abEamAssetRegistryByType_row_icon_1_config)) {
			this.abEamAssetRegistryByType_list.showColumn('abEamAssetRegistryByType_row_icon_1', valueExists(this.abEamAssetRegistryByType_row_icon_1_config));
			this.configColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_icon_1', this.abEamAssetRegistryByType_row_icon_1_config);
		} else {
			this.removeColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_icon_1');
		}
		
		if(valueExists(this.abEamAssetRegistryByType_row_icon_2_config)) {
			this.abEamAssetRegistryByType_list.showColumn('abEamAssetRegistryByType_row_icon_2', valueExists(this.abEamAssetRegistryByType_row_icon_2_config));
			this.configColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_icon_2', this.abEamAssetRegistryByType_row_icon_2_config);
		} else {
			this.removeColumn(this.abEamAssetRegistryByType_list.columns, 'abEamAssetRegistryByType_row_icon_2');
		}

		this.setFieldEnumValue(this.abEamAssetRegistryByType_list, "bl.asset_type");
		// set category configuration
		this.abEamAssetRegistryByType_list.setCategoryColors({'property':'#000000', 'bl': '#6600CC', 'eq' : '#33CC33', 'ta':'#FF3300'});
		this.abEamAssetRegistryByType_list.setCategoryConfiguration({
    		fieldName: 'bl.asset_type',
    		order: ['property', 'bl','eq', 'ta'],
    		getStyleForCategory: this.getStyleForCategory
    	});
		// set visible field
		if(valueExists(this.visibleFields)){
			this.setVisibleField(this.visibleFields);
		}
		
    	this.abEamAssetRegistryByType_list.update();
	},

	configureAssetByType: function(config){
		this.assetByTypeConfig = config;
		// check multiple Selection
		if(valueExists(this.assetByTypeConfig['isMultipleSelectionEnabled'])){
			this.isMultipleSelectionEnabled = this.assetByTypeConfig['isMultipleSelectionEnabled'];
		}
		//onMultipleSelectionChanged
		if(valueExists(this.assetByTypeConfig['onMultipleSelectionChanged'])){
			this.onMultipleSelectionChangedHandler = this.assetByTypeConfig['onMultipleSelectionChanged'];
		}
		//onShowDetailsHandler
		if(valueExists(this.assetByTypeConfig['onShowDetailsHandler'])){
			this.onShowDetailsHandler = this.assetByTypeConfig['onShowDetailsHandler'];
		}
		// visible fields
		if(valueExists(this.assetByTypeConfig['visibleFields'])){
			this.visibleFields = this.assetByTypeConfig['visibleFields'];
		}
		// action button
		if(valueExists(this.assetByTypeConfig['abEamAssetRegistryByType_list_action_1'])){
			if(this.isMultipleSelectionEnabled){
				this.abEamAssetRegistryByType_list.actionbar.actions.get('abEamAssetRegistryByType_list_action_bar_1').setTitle(this.assetByTypeConfig['abEamAssetRegistryByType_list_action_1']['title']);
				this.abEamAssetRegistryByType_list_action_bar_1_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_list_action_1']['onClickHandler'];
				this.abEamAssetRegistryByType_list.actionbar.actions.get('abEamAssetRegistryByType_list_action_bar_1').show(true);

				this.abEamAssetRegistryByType_list.actions.get('abEamAssetRegistryByType_list_action_1').show(false);
			}else{
				this.abEamAssetRegistryByType_list.actions.get('abEamAssetRegistryByType_list_action_1').setTitle(this.assetByTypeConfig['abEamAssetRegistryByType_list_action_1']['title']);
				this.abEamAssetRegistryByType_list_action_1_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_list_action_1']['onClickHandler'];
				this.abEamAssetRegistryByType_list.actions.get('abEamAssetRegistryByType_list_action_1').show(true);

				this.abEamAssetRegistryByType_list.actionbar.actions.get('abEamAssetRegistryByType_list_action_bar_1').show(false);
			}
		}else{
			this.abEamAssetRegistryByType_list.actions.get('abEamAssetRegistryByType_list_action_1').show(false);
			this.abEamAssetRegistryByType_list.actionbar.actions.get('abEamAssetRegistryByType_list_action_bar_1').show(false);
		}
		// row action button
		if(valueExists(this.assetByTypeConfig['abEamAssetRegistryByType_row_action_1'])){
			this.abEamAssetRegistryByType_row_action_1_config = this.assetByTypeConfig['abEamAssetRegistryByType_row_action_1'];
			this.abEamAssetRegistryByType_row_action_1_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_row_action_1']['onClickHandler'];
		}
		// row action button
		if(valueExists(this.assetByTypeConfig['abEamAssetRegistryByType_row_action_2'])){
			this.abEamAssetRegistryByType_row_action_2_config = this.assetByTypeConfig['abEamAssetRegistryByType_row_action_2'];
			this.abEamAssetRegistryByType_row_action_2_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_row_action_2']['onClickHandler'];
		}
		// row action button
		if(valueExists(this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_1'])){
			this.abEamAssetRegistryByType_row_icon_1_config = this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_1'];
			this.abEamAssetRegistryByType_row_icon_1_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_1']['onClickHandler'];
		}
		// row action button
		if(valueExists(this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_2'])){
			this.abEamAssetRegistryByType_row_icon_2_config = this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_2'];
			this.abEamAssetRegistryByType_row_icon_2_onClickHandler = this.assetByTypeConfig['abEamAssetRegistryByType_row_icon_2']['onClickHandler'];
		}
		// show/ hide action bar
		this.abEamAssetRegistryByType_list.actionbar.toolbar.getEl().dom.style.display = this.isMultipleSelectionEnabled?'':'none';
	},
	
	//specify styling properties for category         
	getStyleForCategory: function(record) {
		var style = {};
		var status = record.getValue('bl.asset_type');
		var targetPanel = View.panels.get("abEamAssetRegistryByType_list");
		style.color = targetPanel.getCategoryColors()[status]; 
		return style;
	},
	
	setFieldEnumValue: function(panel, field){
		var fieldDef = panel.getFieldDef(field);
		if(fieldDef){
			fieldDef.isEnum = true;
			fieldDef.enumValues['bl'] = getMessage('asset_type_bl');
			fieldDef.enumValues['eq'] = getMessage('asset_type_eq');
			fieldDef.enumValues['ta'] = getMessage('asset_type_ta');
			fieldDef.enumValues['property'] = getMessage('asset_type_property');
		}
	},
	
	// this function should be used to refresh asset registry panel.
	refreshPanel: function(assetRegistryRestr, customViewRestriction){
		if(customViewRestriction == undefined){
			customViewRestriction = null;
		}
		var restriction = null;
		var blTypeRestriction = "1=1";
		var eqTypeRestriction = "1=1";
		var taTypeRestriction = "1=1";
		var propertyTypeRestriction = "1=1";
		var sqlTypeRestriction = "1=1";
		if(valueExists(assetRegistryRestr.restriction)){
			restriction = assetRegistryRestr.restriction;
		}
		
		if(valueExistsNotEmpty(assetRegistryRestr.sql)){
			sqlTypeRestriction = assetRegistryRestr.sql;
		}
		
		if(valueExistsNotEmpty(assetRegistryRestr.blSql)){
			blTypeRestriction = assetRegistryRestr.blSql;
		}
		
		if(valueExists(customViewRestriction) 
				&& valueExistsNotEmpty(customViewRestriction.blSql)){
			blTypeRestriction += " AND " + customViewRestriction.blSql;
		}
		
		if(valueExistsNotEmpty(assetRegistryRestr.eqSql)){
			eqTypeRestriction = assetRegistryRestr.eqSql;
		}
		if(valueExists(customViewRestriction) 
				&& valueExistsNotEmpty(customViewRestriction.eqSql)){
			eqTypeRestriction += " AND " + customViewRestriction.eqSql;
		}
		
		if(valueExistsNotEmpty(assetRegistryRestr.taSql)){
			taTypeRestriction = assetRegistryRestr.taSql;
		}
		if(valueExists(customViewRestriction) 
				&& valueExistsNotEmpty(customViewRestriction.taSql)){
			taTypeRestriction += " AND " + customViewRestriction.taSql;
		}
		
		if(valueExistsNotEmpty(assetRegistryRestr.propertySql)){
			propertyTypeRestriction = assetRegistryRestr.propertySql;
		}
		if(valueExists(customViewRestriction) 
				&& valueExistsNotEmpty(customViewRestriction.propertySql)){
			propertyTypeRestriction += " AND " + customViewRestriction.propertySql;
		}
		

		this.abEamAssetRegistryByType_list.addParameter('blTypeRestriction', blTypeRestriction);
		this.abEamAssetRegistryByType_list.addParameter('eqTypeRestriction', eqTypeRestriction);
		this.abEamAssetRegistryByType_list.addParameter('taTypeRestriction', taTypeRestriction);
		this.abEamAssetRegistryByType_list.addParameter('propertyTypeRestriction', propertyTypeRestriction);
		this.abEamAssetRegistryByType_list.addParameter('sqlTypeRestriction', sqlTypeRestriction);
		this.abEamAssetRegistryByType_list.refresh(restriction);
	},
	
	
	reloadPanel: function(){
		this.abEamAssetRegistryByType_list.refresh( this.abEamAssetRegistryByType_list.restriction);
	},
	
	/**
	 * visibilitySettings = {column : visible, ... }
	 */
	setVisibleField: function(visibilitySettings){
		for(column in visibilitySettings){
			this.abEamAssetRegistryByType_list.showColumn(column, visibilitySettings[column]);
		}
		this.abEamAssetRegistryByType_list.update();
	},
	
	showPanel: function(show){
		this.abEamAssetRegistryByType_list.show(show);
	},
	
	//KB3049256
	abEamAssetRegistryByType_list_onMultipleSelectionChange: function (row) {
		var panel = this.abEamAssetRegistryByType_list;
		if (Ext.isIE) {
			if (panel.getSelectedRows().length > 0) {
				jQuery("#abEamAssetRegistryByType_list_action_bar_1").removeClass('x-item-disabled');
			}
		}
		if (valueExists(this.onMultipleSelectionChangedHandler)) {
			return this.onMultipleSelectionChangedHandler(panel, row);
		}
	},
	
	removeColumn: function(columns, id){
		for (var i=0; i < columns.length; i++) {
			if(columns[i].id == id){
				columns.remove(columns[i]);
				break;
			}
		}
	},
	
	configColumn: function(columns, id, config){
		for (var i=0; i < columns.length; i++) {
			if(columns[i].id == id){
				if (columns[i].type == "image") {
					columns[i].tooltip = config['title'];
				} else if (columns[i].type == "button"){
					columns[i].text = config['title'];
				}else{
					columns[i].name = config['title'];
					columns[i].text = config['title'];
				}
				break;
			}
		}
	}
});


function onClickActionBar1(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_list_action_bar_1_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		controller.abEamAssetRegistryByType_list_action_bar_1_onClickHandler(panel, ctx);
	}else{
		return false;
	}
}

function onClickAction1(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_list_action_1_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		controller.abEamAssetRegistryByType_list_action_1_onClickHandler(panel, ctx);
	}else{
		return false;
	}
}

function onShowDetails(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.onShowDetailsHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		var restriction = ctx.row.getRecord().toRestriction();
		controller.onShowDetailsHandler(panel, restriction);
	}else{
		return false;
	}
}


function onClickAbEamAssetRegistryByType_row_action_1(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_row_action_1_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		var restriction = ctx.row.getRecord().toRestriction();
		controller.abEamAssetRegistryByType_row_action_1_onClickHandler(panel, restriction);
	}
}

function onClickAbEamAssetRegistryByType_row_action_2(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_row_action_2_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		var restriction = ctx.row.getRecord().toRestriction();
		controller.abEamAssetRegistryByType_row_action_2_onClickHandler(panel, restriction);
	}
}

function onClickAbEamAssetRegistryByType_row_icon_1(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_row_icon_1_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		var restriction = ctx.row.getRecord().toRestriction();
		controller.abEamAssetRegistryByType_row_icon_1_onClickHandler(panel, restriction);
	}
}

function onClickAbEamAssetRegistryByType_row_icon_2(ctx){
	var controller = View.controllers.get('abEamAssetByTypeCtrl');
	if(valueExists(controller.abEamAssetRegistryByType_row_icon_2_onClickHandler)){
		var panel = controller.abEamAssetRegistryByType_list;
		var restriction = ctx.row.getRecord().toRestriction();
		controller.abEamAssetRegistryByType_row_icon_2_onClickHandler(panel, restriction);
	}
}

/**
 * On multiple selection change event listener.
 * @param row grid row
 */
function abEamAssetRegistryByType_list_onMultipleSelectionChange(row){
	View.controllers.get('abEamAssetByTypeCtrl').abEamAssetRegistryByType_list_onMultipleSelectionChange(row);
}

function onRefreshAssetRegistry(context){
	if(valueExists(context.command) 
			&& valueExists(context.command.parentPanelId)){
		var parentPanelId  = View.panels.get(context.command.parentPanelId);
		if (parentPanelId) {
			parentPanelId.refresh(parentPanelId.restriction);
		}
	}
}