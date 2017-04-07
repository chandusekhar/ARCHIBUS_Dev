var abRepmLsCamReviewAdjustController = View.createController('abRepmLsCamReviewAdjustController', {
	openerController: View.getOpenerView().controllers.get("abRepmLsCamReportController"),
	
	// selected lease code
	lsId: "",

	// selected cost year
	costYear: "",
	
	// true if on Add New should open the Add Scheduled Cost view
	openAddCost: true,
	
	activityParamCamReconciliation: ["RENT - CAM RECONCILIATION"],
	
	isMcAndVatEnabled: false,
	
	exchangeRate: "1",
	
	displayCurrency : {
		type : 'user',
		code : '',
		exchangeRateType: 'Payment'
	},

	afterViewLoad: function() {
        if(valueExistsNotEmpty(this.view.activityParameters["AbRPLMCosts-CAM_Reconciliation"])){
        	this.activityParamCamReconciliation = View.activityParameters['AbRPLMCosts-CAM_Reconciliation'].split(";");
        }
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
			this.displayCurrency = {
				type : 'user',
				code : View.user.userCurrency.code,
				exchangeRateType: 'Payment'
			};
			this.exchangeRate = "${sql.exchangeRateFromField('cost_tran.currency_payment', '" + this.displayCurrency.code + "', '" + this.displayCurrency.exchangeRateType + "')}";
			this.abRepmLsCamReviewAdjust_form.setFieldLabel("ls_cam_rec_report.vf_amount_income_text", getMessage("amount_income_total_payment"));
			this.abRepmLsCamReviewAdjust_form.setFieldLabel("ls_cam_rec_report.vf_amount_expense_text", getMessage("amount_expense_total_payment"));
		}
	},

	afterInitialDataFetch: function() {
		var viewRestriction = this.view.restriction;
		if (valueExistsNotEmpty(viewRestriction.findClause("ls_cam_rec_report.ls_id"))) {
			this.lsId = viewRestriction.findClause("ls_cam_rec_report.ls_id").value;
		}
		if (valueExistsNotEmpty(viewRestriction.findClause("ls_cam_rec_report.ls_rent_year"))) {
			this.costYear = viewRestriction.findClause("ls_cam_rec_report.ls_rent_year").value;
		}
		
		this.abRepmLsCamReviewAdjust_grid.addParameter("exchangeRateCostTran", this.exchangeRate);
		this.abRepmLsCamReviewAdjust_grid.addParameter("exchangeRateCostTranSched", this.exchangeRate.replace("cost_tran", "cost_tran_sched"));
		
		this.abRepmLsCamReviewAdjust_form.addParameter("exchangeRateCostTran", this.exchangeRate);
		this.abRepmLsCamReviewAdjust_form.addParameter("exchangeRateCostTranSched", this.exchangeRate.replace("cost_tran", "cost_tran_sched"));
		
		this.abRepmLsCamReviewAdjust_dsSchedCost.addParameter("exchangeRateCostTranSched", this.exchangeRate.replace("cost_tran", "cost_tran_sched"));
		
		this.abRepmLsCamReviewAdjust_grid.refresh();
		
		/* if there is no CAM adjustment for this lease and year,
		 * call Add New adjustment directly so that the user can enter a new adjustment
		 */
		if(this.abRepmLsCamReviewAdjust_grid.rows.length == 0){
			this.abRepmLsCamReviewAdjust_grid_onAddNew();
		}
	},
	
	abRepmLsCamReviewAdjust_grid_afterRefresh: function(){
		var gridTitle = getMessage("title_CamAdjustForLeaseAndYear").replace("{0}", this.lsId).replace("{1}", this.costYear);
		this.abRepmLsCamReviewAdjust_grid.setTitle(gridTitle);
	},
	
	abRepmLsCamReviewAdjust_grid_onAddNew: function(){
		this.openAddCost = true;
		this.abRepmLsCamReviewAdjust_form.refresh(this.abRepmLsCamReviewAdjust_grid.restriction, true);
	},

	
	afterSaveScheduledCost: function(costId){
		var controller = abRepmLsCamReviewAdjustController;
		var form = controller.abRepmLsCamReviewAdjust_form;
		var ds = controller.abRepmLsCamReviewAdjust_dsSchedCost;
		
		var schedCosts = ds.getRecords({"cost_tran_sched.cost_tran_sched_id": costId});
		if(schedCosts.length > 0){
			var schedCost = schedCosts[0];
			form.setFieldValue("ls_cam_rec_report.cost_tran_sched_id", schedCost.getValue("cost_tran_sched.cost_tran_sched_id"));
			form.setFieldValue("vf_cost_tran_sched_id", schedCost.getValue("cost_tran_sched.cost_tran_sched_id"));
			form.setFieldValue("ls_cam_rec_report.vf_cost_cat_id", schedCost.getValue("cost_tran_sched.cost_cat_id"));
			form.setFieldValue("ls_cam_rec_report.vf_cost_type", schedCost.getValue("cost_tran_sched.vf_cost_type"));

			// set the Amount Income and Amount Expense fields
			controller.setAmountFieldValue("income", schedCost, "cost_tran_sched.vf_amount_income");
			controller.setAmountFieldValue("expense", schedCost, "cost_tran_sched.vf_amount_expense");
			
			var stringDate = ds.formatValue("cost_tran_sched.date_due", schedCost.getValue("cost_tran_sched.date_due"), true);
			form.setFieldValue("ls_cam_rec_report.vf_date_due", stringDate);
			stringDate = ds.formatValue("cost_tran_sched.date_paid", schedCost.getValue("cost_tran_sched.date_paid"), true);
			form.setFieldValue("ls_cam_rec_report.vf_date_paid", stringDate);
			
			// try to save form record
			form.save();	
			
			// refresh the grid
			controller.abRepmLsCamReviewAdjust_grid.refresh();
			
    		// refresh the opener report
			if(!form.newRecord){
	    		controller.openerController.abRepmLsCamReportFilter_onFilter();
			}
		}
	},
	
	abRepmLsCamReviewAdjust_form_beforeSave: function(){
		var form = this.abRepmLsCamReviewAdjust_form;
		
		if(!valueExistsNotEmpty(form.getFieldValue("ls_cam_rec_report.cost_tran_sched_id"))
				&& !valueExistsNotEmpty(form.getFieldValue("ls_cam_rec_report.cost_tran_id"))){
			View.showMessage(getMessage("error_no_cost_associated"));
			return false;
		}
			
		return true;
	},
	
	abRepmLsCamReviewAdjust_form_afterRefresh: function(){
		var form = this.abRepmLsCamReviewAdjust_form;
		
		form.setFieldValue("vf_cost_tran_sched_id", form.getFieldValue("ls_cam_rec_report.cost_tran_sched_id"));
		
		// set the Amount Income and Amount Expense fields
		this.setAmountFieldValue("income", form.record, "ls_cam_rec_report.vf_amount_income");
		this.setAmountFieldValue("expense", form.record, "ls_cam_rec_report.vf_amount_expense");
		
		// set the Cost Category field
		if(form.newRecord){
			form.setFieldValue("ls_cam_rec_report.vf_cost_cat_id", this.activityParamCamReconciliation[0]);
    		var costCats = this.abRepmLsCamReviewAdjust_dsCostCat.getRecords({"cost_cat.cost_cat_id" : form.getFieldValue("ls_cam_rec_report.vf_cost_cat_id")});
    		if(costCats.length > 0){
    			form.setFieldValue("ls_cam_rec_report.vf_cost_type", costCats[0].getValue("cost_cat.cost_type"));
    		}
    		
    		if(this.openAddCost){
    			addEditScheduledCost();
    			this.openAddCost = false;
		}
		}
	},
	
	setAmountFieldValue: function(amountType, record, fieldName){
		var form = this.abRepmLsCamReviewAdjust_form;
		
		// set the Amount/Expense Income field
		var amountFieldName = "ls_cam_rec_report.vf_amount_" + amountType + "_text";
		form.setFieldValue(amountFieldName, "");
		
		var ds = this.abRepmLsCamReviewAdjust_dsSchedCost;
		var amount = "";
		var recordFieldName = fieldName + (this.isMcAndVatEnabled ? "_total_pay" : "");
		var localizedValue = record.getLocalizedValue(recordFieldName);
		if(!valueExistsNotEmpty(localizedValue) && valueExistsNotEmpty(record.getValue(recordFieldName))){
			var parsedValue = new Number(ds.parseValue(recordFieldName, record.getValue(recordFieldName), false));
			localizedValue = ds.formatValue("cost_tran_sched.vf_amount_income_total_pay", parsedValue);
		}
		if(valueExistsNotEmpty(localizedValue)){
			form.setFieldValue(amountFieldName, localizedValue);
		}
	},

	abRepmLsCamReviewAdjust_form_onDelete: function(){
		var form = this.abRepmLsCamReviewAdjust_form;
		var schedCostId = form.getFieldValue("ls_cam_rec_report.cost_tran_sched_id");
		var actualCostId = form.getFieldValue("ls_cam_rec_report.cost_tran_id");
		var confirmMessage = getMessage("confirmDelete");
		var controller = this;
		
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') {
	    		try{
		    		var adjusts = controller.abRepmLsCamReviewAdjust_dsAdjust.getRecords({"ls_cam_rec_report.ls_cam_rec_report_id" : form.getFieldValue("ls_cam_rec_report.ls_cam_rec_report_id")});
		    		if(adjusts.length > 0){
		    			controller.abRepmLsCamReviewAdjust_dsAdjust.deleteRecord(adjusts[0]);
		    		}

		    		if(valueExistsNotEmpty(schedCostId)){
			    		var costs = controller.abRepmLsCamReviewAdjust_dsSchedCost.getRecords({"cost_tran_sched.cost_tran_sched_id" : schedCostId});
			    		if(costs.length > 0){
			    			controller.abRepmLsCamReviewAdjust_dsSchedCost.deleteRecord(costs[0]);
			    		}
		    		} else {
			    		var costs = controller.abRepmLsCamReviewAdjust_dsCost.getRecords({"cost_tran.cost_tran_id" : actualCostId});
			    		if(costs.length > 0){
			    			controller.abRepmLsCamReviewAdjust_dsCost.deleteRecord(costs[0]);
			    		}
		    		}
		    		
		    		controller.abRepmLsCamReviewAdjust_form.show(false);
		    		controller.abRepmLsCamReviewAdjust_grid.refresh();
		    		
		    		// refresh the opener report
		    		controller.openerController.abRepmLsCamReportFilter_onFilter();
				}catch(e){
					Workflow.handleError(e);
					return false;
				}
		    } 
		});
	},
	
	getIsLandlord: function(){
		var landlordTenant = "";
		
		var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.landlord_tenant']),
			restriction: toJSON({
				'ls.ls_id': this.lsId
			})
		};
		try {
			var result = Workflow.call('AbCommonResources-getDataRecords', params);
			if(result.dataSet.records.length > 0){
				var record = result.dataSet.records[0];
				landlordTenant = record.getValue('ls.landlord_tenant');
	}
		} catch (e) {
			Workflow.handleError(e);
		}
		
		return (landlordTenant == "LANDLORD");
	}
});

function addEditScheduledCost(){
	var controller = abRepmLsCamReviewAdjustController;
	var costTranSchedId = controller.abRepmLsCamReviewAdjust_form.getFieldValue("ls_cam_rec_report.cost_tran_sched_id");
	var isNew = !valueExistsNotEmpty(costTranSchedId);
	var defaultCostCat = controller.abRepmLsCamReviewAdjust_form.getFieldValue("ls_cam_rec_report.vf_cost_cat_id");
	var isLandlord = controller.getIsLandlord();

    var runtimeParameters = {
    		isNewRecord: isNew,
    		isLandlord: isLandlord,
    		isBuilding: false,
    		isProperty: false,
    		isLease: true,
    		isAccount: false,
    		ls_id: controller.lsId,
			pr_id: "",
			bl_id: "",
			ac_id: "",
			cost_tran_sched_id: costTranSchedId,
			openerController: controller,
			callbackAfterSave: controller.afterSaveScheduledCost,
			cam: true,
			camDefaultCostCat: defaultCostCat
    };
	
    View.openDialog('ab-rplm-cost-mgmt-add-edit-scheduled.axvw', null, true, {
        width: 900,
        height: 700,
        closeButton: true,
        runtimeParameters: runtimeParameters
    });
}

/**
 * Assure that either both cost and adjustment records are created OR none of them.
 * @param userAction 'cancel' or 'close' 
 */
function onAddAdjustmentCancellation(userAction){
	var controller = abRepmLsCamReviewAdjustController;
	var form = controller.abRepmLsCamReviewAdjust_form;
	var schedCostId = form.getFieldValue("ls_cam_rec_report.cost_tran_sched_id");
	
	if(!form.visible && userAction == "close"){
		View.closeThisDialog();
		return;
	}
	
	if(!form.newRecord
			|| !valueExistsNotEmpty(schedCostId)) {
		if(userAction == "close"){
			View.closeThisDialog();
		} else{
			controller.abRepmLsCamReviewAdjust_form.show(false);
		}
		return;
	}

	/*
	var confirmMessage = getMessage("confirmAddCancellation");
	View.confirm(confirmMessage, function(button) {
	    if (button == 'yes') {
	    	// user chose to save the adjustment
	    	if(controller.abRepmLsCamReviewAdjust_form.save()){
    			controller.openerController.abRepmLsCamReportCosts.refresh();
	    		if(userAction == "close"){
	    			View.closeThisDialog();
	    		} else{
	    			controller.abRepmLsCamReviewAdjust_grid.refresh();
	    			controller.abRepmLsCamReviewAdjust_form.show(false);
	    		}
	    	}
	    } else {
	    	// user chose to cancel creation of adjustment, and delete the scheduled cost
	    	try{
	    		var costs = controller.abRepmLsCamReviewAdjust_dsSchedCost.getRecords({"cost_tran_sched.cost_tran_sched_id" : schedCostId});
	    		if(costs.length > 0){
	    			controller.abRepmLsCamReviewAdjust_dsSchedCost.deleteRecord(costs[0]);
	    		}
	    		
	    		if(userAction == "close"){
	    			View.closeThisDialog();
	    		} else{
	    			controller.abRepmLsCamReviewAdjust_form.show(false);
	    		}
			}catch(e){
				Workflow.handleError(e);
			}
	    }
	});*/
}
