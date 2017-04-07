var costMgmtActualInfoController = View.createController('costMgmtActualInfo', {
	cost_tran_id:'',
	
	openerController: null,
	
	isVATAndMCEnabled: false,
	
	formId: null, 
	
	isLandlord: false,
	
	isAccount: false,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters.openerController)){
			this.openerController = this.view.parameters.openerController;
		}
		
		if(valueExists(this.view.parameters.actualCostId)){
			this.cost_tran_id = this.view.parameters.actualCostId;
		}
		
		if(valueExists(this.view.parameters.isLandlord)){
			this.isLandlord = this.view.parameters.isLandlord;
		}
		
		if(valueExists(this.view.parameters.isAccount)){
			this.isAccount = this.view.parameters.isAccount;
		}
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(this.isVATAndMCEnabled){
			this.formId = "reportCostMgmtActualInfoVAT";
			View.panels.get("reportCostMgmtActualInfoVAT").show(true, true);
			View.panels.get("reportCostMgmtActualInfo").show(false, true);
		}else{
			this.formId = "reportCostMgmtActualInfo";
			View.panels.get("reportCostMgmtActualInfoVAT").show(false, true);
			View.panels.get("reportCostMgmtActualInfo").show(true, true);
		}
	},
	
	afterInitialDataFetch: function(){
		var objForm = View.panels.get(this.formId);
		var title = getMessage('actual_cost');
		
		// set title
		objForm.setTitle(title);
		
		var showCam = (this.isLandlord && !this.isAccount);
		objForm.showField("cost_tran.cam_cost", showCam);
		
		objForm.refresh({
			"cost_tran.cost_tran_id": this.cost_tran_id
		}, false);
	},
	
	reportCostMgmtActualInfo_onSave: function(){
		if(this.reportCostMgmtActualInfo.save()){
			var restriction = this.openerController.actualCostGrid.restriction;
			this.openerController.actualCostGrid.refresh(restriction);
		}
	},
	
	reportCostMgmtActualInfo_onCancel: function(){
		this.reportCostMgmtActualInfo.refresh({
					"cost_tran.cost_tran_id": this.cost_tran_id
				}, false);
	}, 
	
	reportCostMgmtActualInfoVAT_onSave: function(){
		if(this.reportCostMgmtActualInfoVAT.save()){
			var restriction = this.openerController.actualCostGrid.restriction;
			this.openerController.actualCostGrid.refresh(restriction);
		}
	},
	
	reportCostMgmtActualInfoVAT_onCancel: function(){
		this.reportCostMgmtActualInfoVAT.refresh({
					"cost_tran.cost_tran_id": this.cost_tran_id
				}, false);
	}
})