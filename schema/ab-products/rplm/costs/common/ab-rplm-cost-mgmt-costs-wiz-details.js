/*
 *  TO DO :
 *  filter action
 */
var wizardDetailsController = View.createController('wizardDetailsCtrl',{
	itemType: null,
	itemId: null,
	parentItemId: null,
	costType: null,
	costCategory: null,
	costCam: null,
	
	isLandlord: false,
	isMcAndVatEnabled: false,
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: 'Budget'
	},	

	statisticAttibutesRecur:{
		formulas:['sum'],
		fields:['cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.amount_income_vat_payment', 'cost_tran_recur.amount_income_total_payment',
   		        'cost_tran_recur.amount_expense_base_payment', 'cost_tran_recur.amount_expense_vat_payment', 'cost_tran_recur.amount_expense_total_payment'],
		currencyCode: '',
		exchangeRateType: '',
		currencyFields: []
	},
	
	statisticAttibutesSched:{
		formulas:['sum'],
		fields:['cost_tran_sched.amount_income_base_payment', 'cost_tran_sched.amount_income_vat_payment', 'cost_tran_sched.amount_income_total_payment',
   		        'cost_tran_sched.amount_expense_base_payment', 'cost_tran_sched.amount_expense_vat_payment', 'cost_tran_sched.amount_expense_total_payment'],
		currencyCode: '',
		exchangeRateType: '',
		currencyFields: []
	},

	statisticAttibutesActual:{
		formulas:['sum'],
		fields:['cost_tran.amount_income_base_payment', 'cost_tran.amount_income_vat_payment', 'cost_tran.amount_income_total_payment',
		        'cost_tran.amount_expense_base_payment', 'cost_tran.amount_expense_vat_payment', 'cost_tran.amount_expense_total_payment'],
		currencyCode: '',
		exchangeRateType: '',
		currencyFields: []
	},

	/*
	 * Event handler.
	 */
	afterInitialDataFetch: function(){
		
		this.isMcAndVatEnabled = (valueExists(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) 
											&&  parseInt(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency']) == 1);
		if (this.isMcAndVatEnabled) {
			this.displayCurrency.type = 'user';
			this.displayCurrency.code = View.user.userCurrency.code; 
			this.displayCurrency.exchangeRateType = 'Payment';
			
			this.consoleFilter.displayCurrency = this.displayCurrency;
			
			this.statisticAttibutesRecur.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesRecur.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesRecur.currencyFields = ['cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.amount_income_vat_payment', 'cost_tran_recur.amount_income_total_payment',
			                               		        'cost_tran_recur.amount_expense_base_payment', 'cost_tran_recur.amount_expense_vat_payment', 'cost_tran_recur.amount_expense_total_payment'];
			
			this.statisticAttibutesSched.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesSched.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesSched.currencyFields = ['cost_tran_sched.amount_income_base_payment', 'cost_tran_sched.amount_income_vat_payment', 'cost_tran_sched.amount_income_total_payment',
			                               		        'cost_tran_sched.amount_expense_base_payment', 'cost_tran_sched.amount_expense_vat_payment', 'cost_tran_sched.amount_expense_total_payment'];

			this.statisticAttibutesActual.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesActual.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesActual.currencyFields = ['cost_tran.amount_income_base_payment', 'cost_tran.amount_income_vat_payment', 'cost_tran.amount_income_total_payment',
			                                		        'cost_tran.amount_expense_base_payment', 'cost_tran.amount_expense_vat_payment', 'cost_tran.amount_expense_total_payment'];
			
			//this.setParameters('recurringCostGrid', this.statisticAttibutesRecur);
			//this.setParameters('scheduledCostGrid', this.statisticAttibutesSched);
			//this.setParameters('actualCostGrid', this.statisticAttibutesActual);
			
			//this.consoleFilter.setInstructions(getMessage('infoTotalsConversion'));
		}
		
		this.showCamFilterField(false);
		populateConsole();
		this.setTabs();
	},
	
	initializeDetails: function(type, id, parentId){
		this.itemType = type;
		this.itemId = id;
		this.parentItemId = parentId;
		this.costType = null;
		this.costCategory = null;
		this.setConsole();
		this.setTabs();
	},
	
	showCamFieldAndButtons: function(showCam){
		//set CAM filter field visibility
		this.showCamFilterField(showCam)
		
		//set CAM action buttons visibility
		this.recurringCostGrid.actions.get("setSelectedRecur").show(showCam);
		this.scheduledCostGrid.actions.get("setSelectedSched").show(showCam);
		this.actualCostGrid.actions.get("setSelected").show(showCam);
		
		//set CAM grid field visibility
		this.recurringCostGrid.showColumn('cost_tran_recur.cam_cost', showCam);
		this.scheduledCostGrid.showColumn('cost_tran_sched.cam_cost', showCam);
		this.actualCostGrid.showColumn('cost_tran.cam_cost', showCam);
		this.recurringCostGrid.update();
		this.scheduledCostGrid.update();
		this.actualCostGrid.update();
	},
	
	showCamFilterField: function(showCam){
		if(showCam){
			$('titleCostCam').style.display = '';
			$('costCam').style.display = '';
		}else{
			$('titleCostCam').style.display = 'none';
			$('costCam').style.display = 'none';
		}
	},
	
	consoleFilter_onFilter: function(){
		if(valueExistsNotEmpty($('costType').value)){
			this.costType = $('costType').value;
		}else{
			this.costType = null;
		}
		if(valueExistsNotEmpty($('costCategoryId').value)){
			this.costCategory = $('costCategoryId').value;
		}else{
			this.costCategory = null;
		}
		if(valueExistsNotEmpty($('costCam').value)){
			this.costCam = $('costCam').value;
		}else{
			this.costCam = null;
		}
		if (valueExists(this.consoleFilter.displayCurrency)) {
			this.displayCurrency = this.consoleFilter.displayCurrency
		}
		this.setTabs();
	},
	
	consoleFilter_onClear: function(){
		$('costType').value = '';
		$('costCategoryId').value = '';
		$('costCam').value = 'ALL';
		this.costType = null;
		this.costCategory = null;
		this.costCam = null;
		this.setTabs();
	},
	
	setConsole:function(){
		var restriction = new Ab.view.Restriction();
		if(this.itemType == 'lease' || this.itemType == 'sublease'){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'LEASE%', 'LIKE', 'OR');
			if(isLandlord(this.itemId)){
				this.isLandlord = true;
				this.showCamFieldAndButtons(true);
			}else{
				this.isLandlord= false;
				this.showCamFieldAndButtons(false);
			}
		}else if(this.itemType == 'building'){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'BLDG%', 'LIKE', 'OR');
			if(hasLeaseAsLandlord(this.itemId, this.itemType)){
				this.showCamFieldAndButtons(true);
				this.isLandlord = true;
			}else{
				this.showCamFieldAndButtons(false);
				this.isLandlord = false;
			}
		}else if(this.itemType == 'structure' || this.itemType == 'land'){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'PROP%', 'LIKE', 'OR');
			if(hasLeaseAsLandlord(this.itemId, this.itemType)){
				this.showCamFieldAndButtons(true);
				this.isLandlord = true;
			}else{
				this.showCamFieldAndButtons(false);
				this.isLandlord = false;
			}
		}else if(this.itemType == 'parcel'){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'PROP%', 'LIKE', 'OR');
			this.showCamFieldAndButtons(false);
		}else if(this.itemType == 'account'){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			this.showCamFieldAndButtons(false);
		}
		var recCategory = this.dsFilter.getRecords(restriction);
		var recType = this.dsFilterCostType.getRecords(restriction);
		populateConsole(recType, recCategory);
	},
	
	setTabs: function(){
		var controller_0 = this.view.controllers.get('mgmtRecurringCost');
		var controller_1 = this.view.controllers.get('mgmtScheduledCost');
		var controller_2 = this.view.controllers.get('mgmtActualCost');
		
		controller_0.reset();
		controller_1.reset();
		controller_2.reset();
		
		var restriction_0 = new Ab.view.Restriction();
		var restriction_1 = new Ab.view.Restriction();
		var restriction_2 = new Ab.view.Restriction();
		
		var costRestriction = null;
		if( valueExistsNotEmpty( this.costType) && !valueExistsNotEmpty( this.costCategory)){
			costRestriction = ' cost_cat_id in( select cost_cat_id from cost_cat where cost_cat.cost_type =  \''+ this.costType + '\' ';
		}
		if(valueExistsNotEmpty(this.costCam) && this.costCam != 'ALL'){
			restriction_0.addClause('cost_tran_recur.cam_cost', this.costCam, '=');
			restriction_1.addClause('cost_tran_sched.cam_cost', this.costCam, '=');
			restriction_2.addClause('cost_tran.cam_cost', this.costCam, '=');
		}
		var cfgAction = null;
		if(this.itemType == 'lease' || this.itemType == 'sublease'){
			controller_0.ls_id = this.itemId;
			controller_0.isLease = true;
			controller_0.isLandlord = this.isLandlord;
			controller_1.ls_id = this.itemId;
			controller_1.isLease = true;
			controller_1.isLandlord = this.isLandlord;
			controller_2.ls_id = this.itemId;
			controller_2.isLease = true;
			controller_2.isLandlord = this.isLandlord;
			restriction_0.addClause('cost_tran_recur.ls_id', this.itemId, '=');
			restriction_1.addClause('cost_tran_sched.ls_id', this.itemId, '=');
			restriction_2.addClause('cost_tran.ls_id', this.itemId, '=');
			if(costRestriction != null){
				costRestriction += ' and ( cost_cat.rollup_prorate like \'ALL%\' or cost_cat.rollup_prorate like \'LEASE%\')) '
			}
			cfgAction = {
				enabled : "true",
				hidden : "false",
				id : "itemDetails",
				onclick : "showItemDetails",
				text : getMessage('button_detail_lease')
			};
		}else if(this.itemType == 'building'){
			controller_0.bl_id = this.itemId;
			controller_0.isBuilding = true;
			controller_0.isLandlord = this.isLandlord;
			controller_1.bl_id = this.itemId;
			controller_1.isBuilding = true;
			controller_1.isLandlord = this.isLandlord;
			controller_2.bl_id = this.itemId;
			controller_2.isBuilding = true;
			controller_2.isLandlord = this.isLandlord;
			restriction_0.addClause('cost_tran_recur.bl_id', this.itemId, '=');
			restriction_1.addClause('cost_tran_sched.bl_id', this.itemId, '=');
			restriction_2.addClause('cost_tran.bl_id', this.itemId, '=');
			if(costRestriction != null){
				costRestriction += ' and ( cost_cat.rollup_prorate like \'ALL%\' or cost_cat.rollup_prorate like \'BLDG%\')) '
			}
			cfgAction = {
				enabled : "true",
				hidden : "false",
				id : "itemDetails",
				onclick : "showItemDetails",
				text : getMessage('button_detail_bldg')
			};
		}else if(this.itemType == 'structure' || this.itemType == 'land'){
			controller_0.pr_id = this.itemId;
			controller_0.isProperty = true;
			controller_0.isLandlord = this.isLandlord;
			controller_1.pr_id = this.itemId;
			controller_1.isProperty = true;
			controller_1.isLandlord = this.isLandlord;
			controller_2.pr_id = this.itemId;
			controller_2.isProperty = true;
			controller_2.isLandlord = this.isLandlord;
			restriction_0.addClause('cost_tran_recur.pr_id', this.itemId, '=');
			restriction_1.addClause('cost_tran_sched.pr_id', this.itemId, '=');
			restriction_2.addClause('cost_tran.pr_id', this.itemId, '=');
			if(costRestriction != null){
				costRestriction += ' and ( cost_cat.rollup_prorate like \'ALL%\' or cost_cat.rollup_prorate like \'PROP%\')) '
			}
			cfgAction = {
				enabled : "true",
				hidden : "false",
				id : "itemDetails",
				onclick : "showItemDetails",
				text : getMessage('button_detail_property')
			};
		}else if(this.itemType == 'parcel'){
			controller_0.parcel_id = this.itemId;
			controller_0.isParcel = true;
			controller_1.parcel_id = this.itemId;
			controller_1.isParcel = true;
			controller_2.parcel_id = this.itemId;
			controller_2.isParcel = true;
			restriction_0.addClause('cost_tran_recur.parcel_id', this.itemId, '=');
			restriction_1.addClause('cost_tran_sched.parcel_id', this.itemId, '=');
			restriction_2.addClause('cost_tran.parcel_id', this.itemId, '=');
			if(costRestriction != null){
				costRestriction += ' and ( cost_cat.rollup_prorate like \'ALL%\' or cost_cat.rollup_prorate like \'PROP%\')) '
			}
			cfgAction = {
				enabled : "true",
				hidden : "false",
				id : "itemDetails",
				onclick : "showItemDetails",
				text : getMessage('button_detail_parcel')
			};
		}else if(this.itemType == 'account'){
			controller_0.ac_id = this.itemId;
			controller_0.isAccount = true;
			controller_1.ac_id = this.itemId;
			controller_1.isAccount = true;
			controller_2.ac_id = this.itemId;
			controller_2.isAccount = true;
			restriction_0.addClause('cost_tran_recur.ac_id', this.itemId, '=');
			restriction_1.addClause('cost_tran_sched.ac_id', this.itemId, '=');
			restriction_2.addClause('cost_tran.ac_id', this.itemId, '=');
			if(costRestriction != null){
				costRestriction += ' and ( cost_cat.rollup_prorate like \'ALL%\')) '
			}
			cfgAction = {
				enabled : "true",
				hidden : "false",
				id : "itemDetails",
				onclick : "showItemDetails",
				text : getMessage('button_detail_account')
			};
		}else{
			restriction_0.addClause('cost_tran_recur.cost_tran_recur_id', '0', '=');
			restriction_1.addClause('cost_tran_sched.cost_tran_sched_id', '0', '=');
			restriction_2.addClause('cost_tran.cost_tran_id', '0', '=');
		}
		controller_0.parentItemId = this.parentItemId;
		controller_1.parentItemId = this.parentItemId;
		controller_2.parentItemId = this.parentItemId;
		
		if(valueExistsNotEmpty( this.costCategory)){
			restriction_0.addClause('cost_tran_recur.cost_cat_id', this.costCategory, '=');
			restriction_1.addClause('cost_tran_sched.cost_cat_id', this.costCategory, '=');
			restriction_2.addClause('cost_tran.cost_cat_id', this.costCategory, '=');
		}
		if (costRestriction != null) {
			this.recurringCostGrid.addParameter('costFilter', costRestriction);
			this.scheduledCostGrid.addParameter('costFilter', costRestriction);
			this.actualCostGrid.addParameter('costFilter', costRestriction);
		}else{
			this.recurringCostGrid.addParameter('costFilter', ' 1 = 1 ');
			this.scheduledCostGrid.addParameter('costFilter', ' 1 = 1 ');
			this.actualCostGrid.addParameter('costFilter', ' 1 = 1 ');
		}
		this.detailsTabs.tabs[0].setTitle(getMessage('tab_0'));
		this.detailsTabs.tabs[1].setTitle(getMessage('tab_1'));
		this.detailsTabs.tabs[2].setTitle(getMessage('tab_2'));
		
		// MC & VAT
		if (this.isMcAndVatEnabled) {
			this.statisticAttibutesRecur.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesRecur.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesRecur.currencyFields = ['cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.amount_income_vat_payment', 'cost_tran_recur.amount_income_total_payment',
			                               		        'cost_tran_recur.amount_expense_base_payment', 'cost_tran_recur.amount_expense_vat_payment', 'cost_tran_recur.amount_expense_total_payment'];
			
			this.statisticAttibutesSched.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesSched.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesSched.currencyFields = ['cost_tran_sched.amount_income_base_payment', 'cost_tran_sched.amount_income_vat_payment', 'cost_tran_sched.amount_income_total_payment',
			                               		        'cost_tran_sched.amount_expense_base_payment', 'cost_tran_sched.amount_expense_vat_payment', 'cost_tran_sched.amount_expense_total_payment'];

			this.statisticAttibutesActual.currencyCode = this.displayCurrency.code;
			this.statisticAttibutesActual.exchangeRateType = this.displayCurrency.exchangeRateType;
			this.statisticAttibutesActual.currencyFields = ['cost_tran.amount_income_base_payment', 'cost_tran.amount_income_vat_payment', 'cost_tran.amount_income_total_payment',
			                                		        'cost_tran.amount_expense_base_payment', 'cost_tran.amount_expense_vat_payment', 'cost_tran.amount_expense_total_payment'];
			
			//this.setParameters('recurringCostGrid', this.statisticAttibutesRecur);
			//this.setParameters('scheduledCostGrid', this.statisticAttibutesSched);
			//this.setParameters('actualCostGrid', this.statisticAttibutesActual);
		}
		
		
		//KB3033262 - The buttons are enabled only after a valid selection is performed in the tree
		controller_0.enableButtons((this.itemType) ? true : false);
		controller_1.enableButtons((this.itemType) ? true : false);
		controller_2.enableButtons((this.itemType) ? true : false);
		
		addAction(controller_0.recurringCostGrid, 'itemDetails', cfgAction);
		addAction(controller_1.scheduledCostGrid, 'itemDetails', cfgAction);
		addAction(controller_2.actualCostGrid, 'itemDetails', cfgAction);
		
		controller_0.recurringCostGrid.refresh(restriction_0);
		controller_1.scheduledCostGrid.refresh(restriction_1);
		controller_2.actualCostGrid.refresh(restriction_2);
		
		controller_0.setTitle();
		controller_1.setTitle();
		controller_2.setTitle();
	},
	
	/**
	 * Set statistic attributes to grid object.
	 */
	setParameters: function(panelId, configObject) {
		var objPanel = View.panels.get(panelId);
		if (objPanel) {
			objPanel.setStatisticAttributes(configObject);
		}
	}
	
})

function addAction(panel, id, config){
	if(config == null){
		return;
	}
	if(panel.actions.get(id) != undefined){
		panel.actions.get(id).setTitle(config.text);
	}else{
		panel.actions.add(id,new Ab.view.Action(panel, config));
	}
	
}

function showItemDetails(){
	var type = wizardDetailsController.itemType;
	var itemId = wizardDetailsController.itemId;
	var page = null;
	var width = 1000;
	var height = 600;
	if(type == 'lease' || type == 'sublease'){
		page = "ab-rplm-cost-lease-detail.axvw";
		width = 800;
		height = 300;
	}else if(type == 'building'){
		page = "ab-rplm-cost-bldg-detail.axvw";
	}else if(type == 'structure' || type == 'land'){
		page = "ab-rplm-cost-prop-detail.axvw";
	}else if(type == 'parcel'){
		page = "ab-rplm-cost-parcel-detail.axvw";
	}else if(type == 'account'){
		page = "ab-rplm-cost-account-detail.axvw";
		width = 800;
		height = 300;
	}
    View.openDialog(page, null, true, {
        width: width,
        height: height,
        closeButton: true,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('itemDetailCtrl');
            dialogController.itemId = itemId;
            dialogController.loadPanel();
        }
    });
	
}

function populateConsole(objType, objCategory){
	$('titleCostType').innerHTML = getMessage('labelCostType')+':';
	$('titleCostCategory').innerHTML = getMessage('labelCostCategory')+':';
	var objCostType = $('costType');
	var objCostCateg = $('costCategoryId');
	objCostType.length=0;
	objCostCateg.length=0;
	var typeOption = new Option(getMessage("selectTitle"), "");
	var categOption = new Option(getMessage("selectTitle"), "");
	objCostType.options[0] = typeOption;
	objCostCateg.options[0] = categOption;
	if(objCategory != undefined && objType != undefined){
		var indexType = 1;
		var indexCateg = 1;
		var lastType = '';
		var lastCateg = '';
		for(var i=0;i<objCategory.length;i++){
			if(i < objType.length){
				var recType = objType[i];
				var crtType = recType.getValue('cost_cat.cost_type');
				var crtLocalizedType = recType.getLocalizedValue('cost_cat.cost_type');
				if(lastType != crtType ){
					var typeOption = new Option(crtType, crtType);
					objCostType.options[indexType] = typeOption;
					indexType = indexType + 1;
					lastType = crtType;
				}
			}
			var recCategory = objCategory[i];
			var crtCateg = recCategory.getValue('cost_cat.cost_cat_id');
			var crtLocalizedCateg = recCategory.getLocalizedValue('cost_cat.cost_cat_id');
			if(lastCateg != crtCateg){
				var categOption = new Option(crtCateg, crtCateg);
				objCostCateg.options[indexCateg] = categOption;
				indexCateg = indexCateg + 1;
				lastCateg = crtCateg;
			}
		}
		if(wizardDetailsController.costType != null){
			objCostType.value = wizardDetailsController.costType;
		}
		if(wizardDetailsController.costCategory != null){
			objCostCateg.value = wizardDetailsController.costCategory;
		}
	}
}

function isLandlord(lsId){
	var result = false;
	var wfrParams = {
			tableName: "ls",
			fieldNames: toJSON(["ls.landlord_tenant"]),
			restriction: toJSON(new Ab.view.Restriction({"ls.ls_id": lsId}))
	};
	try{
		var wfrResult = Workflow.call('AbCommonResources-getDataRecord', wfrParams);
		if (wfrResult.code == 'executed'){
			if(valueExists(wfrResult.dataSet) && valueExistsNotEmpty(wfrResult.dataSet.getValue("ls.landlord_tenant"))){
				var landlord_tenant = wfrResult.dataSet.getValue("ls.landlord_tenant");
				result = (landlord_tenant == 'LANDLORD') ? true : false;
			}
		}
	}catch(e){
		Workflow.handleError(e);
	}
	return result;
}

/**
 * Verify if current building or property has at least one lease where ls.landlord_tenant = 'LANDLORD' 
 * @param currentId Current building or property id
 * @param type values: 'building', 'structure', 'land'
 * @returns {Boolean}
 */
function hasLeaseAsLandlord(currentId, type){
	var result = false;
	var restriction = new Ab.view.Restriction();
	restriction.addClause("ls.landlord_tenant", "LANDLORD", "=");
	if(type == 'building'){
		restriction.addClause("ls.bl_id", currentId, "=");
	}else if(type == 'structure' || type == 'land'){
		restriction.addClause("ls.pr_id", currentId, "=");
	}
	var wfrParams = {
			tableName: "ls",
			fieldNames: toJSON(["ls.landlord_tenant"]),
			restriction: toJSON(restriction)
	};
	try{
		var wfrResult = Workflow.call('AbCommonResources-getDataRecords', wfrParams);
		if (wfrResult.code == 'executed'){
			if(valueExists(wfrResult.dataSet) && wfrResult.dataSet.records.length > 0){
				result = true;
			}
		}
	}catch(e){
		Workflow.handleError(e);
	}
	return result;
}
