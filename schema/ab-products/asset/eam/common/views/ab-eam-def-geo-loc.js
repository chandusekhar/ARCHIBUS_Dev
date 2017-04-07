/**
 * Controller definition
 */
var abEamDefGeoLocController = View.createController('abEamDefGeoLocController', {
	
	tabsByType:{
		'geo_region': 'abEamDefGeoLocTabs_geoRegion',
		'ctry': 'abEamDefGeoLocTabs_ctry',
		'regn': 'abEamDefGeoLocTabs_regn',
		'state': 'abEamDefGeoLocTabs_state',
		'city': 'abEamDefGeoLocTabs_city',
		'site': 'abEamDefGeoLocTabs_site',
		'bl': 'abEamDefGeoLocTabs_bl',
		'fl': 'abEamDefGeoLocTabs_fl',
		'rm': 'abEamDefGeoLocTabs_rm'
	},

	formsByType:{
		'geo_region': 'abEamDefGeoLocGeoRegion',
		'ctry': 'abEamDefGeoLocCtry',
		'regn': 'abEamDefGeoLocRegn',
		'state': 'abEamDefGeoLocState',
		'city': 'abEamDefGeoLocCity',
		'site': 'abEamDefGeoLocSite',
		'bl': 'abEamDefGeoLocBl',
		'fl': 'abEamDefGeoLocFl',
		'rm': 'abEamDefGeoLocRm'
	},
	
	type: null,
	
	callbackFunction: null,
	
	customActionCommand: null,
	
	restriction: null,
	
	newRecord: null,
	
	hideTabs: false,
	
	afterViewLoad: function(){
		if(valueExists(View.parameters) && valueExists(View.parameters.callback)){
			this.callbackFunction = View.parameters.callback;
		}
		if(valueExists(View.parameters) && valueExists(View.parameters.type)){
			this.type = View.parameters.type;
		}
		if(valueExists(View.parameters) && valueExists(View.parameters.eamReceiptParameters)){
			this.customActionCommand = View.parameters.eamReceiptParameters.onClickActionEventHandler;
		}
		if(valueExists(View.restriction)){
			this.restriction = View.restriction;
		}
		if(valueExists(View.parameters) && valueExists(View.parameters.hideTabs)){
			this.hideTabs =  View.parameters.hideTabs;
		}
		this.newRecord = View.newRecord;
	},
	
	afterInitialDataFetch: function(){
		var selectedTab = this.tabsByType[this.type];
		var selectedForm = this.formsByType[this.type];
		this.abEamDefGeoLocTabs.selectTab(selectedTab, this.restriction, this.newRecord);
		if (this.view.panels.get(selectedForm)) {
			this.view.panels.get(selectedForm).show(true, true);
		}
		for(type in this.tabsByType){
			if(this.hideTabs && type != this.type){
				var tabName = this.tabsByType[type];
				this.abEamDefGeoLocTabs.showTab(tabName, false);
			}
		}
	},
	
	commonDelete: function(type, form){
		var controller = this;
		var primaryKeyValues = "";
		var pkValues = form.getPrimaryKeyFieldValues();
		for(pkField in pkValues){
			primaryKeyValues += pkValues[pkField] + ",";
		}
		var confirmMessage = getMessage('messageConfirmDelete').replace('{0}', primaryKeyValues.substring(0, primaryKeyValues.length -1));
		View.confirm(confirmMessage, function(button){
			if(button == 'yes'){
				if(form.deleteRecord(form.getRecord())){
					if(valueExists(controller.callbackFunction)){
						controller.callbackFunction();
						View.closeThisDialog();
					}
				}
			}
		});
	},
	
	commonSave: function(type, form){
		if(form.save()){
			var primaryKeyValues = form.getPrimaryKeyFieldValues();
			if(valueExists(this.callbackFunction)){
				this.callbackFunction(primaryKeyValues);
				View.closeThisDialog();
			}
		}
	},
	
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
});

function afterRefreshHandler(form){
	var title = 'titleEdit';
	if(form.newRecord){
		title = 'titleAddNew';
	}
	form.setTitle(getMessage(title));
}

function deleteCommand(ctx){
	var controller = View.controllers.get('abEamDefGeoLocController');
	var form = ctx.command.getParentPanel();
	controller.commonDelete(controller.type, form);
}

function saveCommand(ctx){
	var controller = View.controllers.get('abEamDefGeoLocController');
	var form = ctx.command.getParentPanel();
	controller.commonSave(controller.type, form);
}

function customCommand(ctx){
	var controller = View.controllers.get('abEamDefGeoLocController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}


/**
 * check the ownership of an item
 * a datasource is needed for this
 * 	<dataSource id="ds_ownership">
*		<table name="ot" role="main"/>
*		<field table="ot" name="ot_id"/>
*		<field table="ot" name="bl_id"/>
*		<field table="ot" name="pr_id"/>
*		<field table="ot" name="status"/>
*	</dataSource>
*	
 * @param {Object} item
 * @param {Object} type
 */

function getOwnership(item, type){
	var ds = View.dataSources.get('ds_ownership');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ot.status', 'disposed', '<>');
	if(type.toUpperCase() == 'BUILDING'){
		restriction.addClause('ot.bl_id', item, '=');
	}else if(type.toUpperCase() == 'LAND' || type.toUpperCase() == 'STRUCTURE'){
		restriction.addClause('ot.pr_id', item, '=');
	}
	var records = ds.getRecords(restriction);
	if(typeof(records) ==  "object" && records.length && records.length > 0){
		return true;
	}else{
		return false;
	}
}

