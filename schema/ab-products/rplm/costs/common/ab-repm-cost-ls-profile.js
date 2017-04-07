var abRepmCostLsProfileController = View.createController('abRepmCostLsProfileController', {
	// selected lease code	
	lsId: null,
	
	costCategoryBaseRent: "RENT - BASE RENT",
	
	costCategoryCamEstimate: "RENT - CAM ESTIMATE",
	
	afterViewLoad: function(){
		var infoCostCategoryParamMissing = "";
		if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-Base_Rent_Category"])){
			this.costCategoryBaseRent = this.view.activityParameters["AbRPLMCosts-Base_Rent_Category"]; 
		}else{
			infoCostCategoryParamMissing += getMessage("infoNoBaseRentCostCategParameter").replace("{0}", this.costCategoryBaseRent);
		}
		
		if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-CAM_Estimate"])){
			this.costCategoryCamEstimate = this.view.activityParameters["AbRPLMCosts-CAM_Estimate"]; 
		}else{
			infoCostCategoryParamMissing += getMessage("infoNoCamEstimateCostCategParameter").replace("{0}", this.costCategoryCamEstimate);
		}
		if (valueExistsNotEmpty(infoCostCategoryParamMissing)) {
			View.showMessage(infoCostCategoryParamMissing);
		}
		this.abRepmCostLsProfileTabs.findTab("abRepmCostLsProfileTabs_Chargeback").loadView();
		
		if (valueExists(View.parameters) && valueExistsNotEmpty(View.parameters['lsId'])){
			this.lsId = View.parameters['lsId'];
		}else{
			this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_IndexProfile", false);
			this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_CamProfile", false);
			this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_Chargeback", false);
		}
		
	},
	
	afterInitialDataFetch: function(){
		if (valueExists(View.parameters) && valueExistsNotEmpty(View.parameters['lsId'])) {
			this.abRepmCostLsProfileTabs.findTab("abRepmCostLsProfileTabs_Chargeback").loadView();
			this.lsId = View.parameters['lsId'];
			this.abRepmCostLsProfileFilter.setFieldValue('ls.ls_id', this.lsId);
			this.abRepmCostLsProfileFilter.show(false, true);

			var layout = View.getLayoutManager('nestedLayout');
			layout.collapseRegion('north');

			this.abRepmCostLsProfileFilter_onFilter.defer(500, this);
		}
	},
	
	abRepmCostLsProfileFilter_onFilter: function(){
		this.lsId = this.abRepmCostLsProfileFilter.getFieldValue("ls.ls_id");
		if (!valueExistsNotEmpty(this.lsId)) {
			View.showMessage(getMessage("msgSelectLease"));
			return false;
		}
		if (!validateLeaseCode(this.lsId)) {
			View.showMessage(getMessage("msgSelectValidLease"));
			return false;
		}
		// if a dialog is opened we must close this
		View.closeDialog();
		View.closePanelWindows();
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ls.ls_id", this.lsId, "=");
		
		this.abRepmCostLsProfileLeaseInfo.refresh(restriction, false);
		this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_IndexProfile", true);
		this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_CamProfile", true);
		this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_Chargeback", true);
		
		//this.abRepmCostLsProfileTabs.showTab("abRepmCostLsProfileTabs_LeaseLiability", true);
		
		// initialize lease index profile page
		this.refreshLeaseIndexProfile(this.abRepmCostLsProfileLeaseInfo.getRecord(), this.costCategoryBaseRent);
		// initialize lease cam profile page
		this.refreshLeaseCamProfile(this.abRepmCostLsProfileLeaseInfo.getRecord(), this.costCategoryBaseRent, this.costCategoryCamEstimate);
		// initialize chargeback tab
		this.refreshChargebackTab(this.lsId);
		
		
	},
	
	refreshLeaseIndexProfile: function(lsRecord, costCategoryValue){
		var lsIndexProfileController = null;
		var indexProfileTab = this.abRepmCostLsProfileTabs.findTab("abRepmCostLsProfileTabs_IndexProfile");
		if (indexProfileTab.useFrame) {
			lsIndexProfileController = indexProfileTab.getContentFrame().View.controllers.get("abRepmCostLsIndexProfileController");
		}else{
			lsIndexProfileController = View.controllers.get("abRepmCostLsIndexProfileController");
		}
		lsIndexProfileController.refreshPage(lsRecord, costCategoryValue);
	},
	
	refreshLeaseCamProfile: function(lsRecord, costCategoryValue, costCategoryCamEstimate){
		var lsCamProfileController = null;
		var camProfileTab = this.abRepmCostLsProfileTabs.findTab("abRepmCostLsProfileTabs_CamProfile");
		if (camProfileTab.useFrame) {
			lsCamProfileController = camProfileTab.getContentFrame().View.controllers.get("abRepmCostLsCAMProfileController");
		}else{
			lsCamProfileController = View.controllers.get("abRepmCostLsCAMProfileController");
		}
		lsCamProfileController.refreshPage(lsRecord, costCategoryValue, costCategoryCamEstimate);
	},
	
	refreshChargebackTab: function(lsId){
		var chargeBackController = null;
		var chargebackTab = this.abRepmCostLsProfileTabs.findTab("abRepmCostLsProfileTabs_Chargeback");
		if (chargebackTab.useFrame) {
			chargeBackController = chargebackTab.getContentFrame().View.controllers.get('lsChrbkAgreeCtrl');
		}else{
			chargeBackController = View.controllers.get('lsChrbkAgreeCtrl');
		}
		chargeBackController.refreshView(lsId);
	}
});

/** 
 * Obtain currency descrition for code.
 * @param code currency code
 * @returns currency description
 */
function getCurrencyDescription(code){
    var currencyDescription = code;
    _.each(View.user.currencies, function(currency) {
        if (currency.code === code) {
            currencyDescription = currency.description;
        }
    });

    /*
	var dsConfig = {id : 'currencies_ds', 
			tableNames: ['afm_currencies'], 
			fieldNames: ['afm_currencies.currency_id', 'afm_currencies.description']};
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_currencies.currency_id", code, "=");
	
	var currencyDescription = getDbFieldValue('afm_currencies.description', dsConfig, restriction);
	*/

	return currencyDescription;
}

function validateLeaseCode(lsId){
	var isValid = false;
	var wfrParams = {
			tableName: "ls",
			fieldNames: toJSON(["ls.ls_id"]),
			restriction: toJSON(new Ab.view.Restriction({"ls.ls_id": lsId}))
	};
	try{
		var wfrResult = Workflow.call('AbCommonResources-getDataRecord', wfrParams);
		if (wfrResult.code == 'executed'){
			if(valueExists(wfrResult.dataSet) && wfrResult.data.records.length > 0){
				isValid = true;
			}
		}
	}catch(e){
		Workflow.handleError(e);
	}
	return isValid;
}