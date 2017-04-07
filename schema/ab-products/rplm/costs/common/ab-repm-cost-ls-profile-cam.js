var abRepmCostLsCAMProfileController = View.createController('abRepmCostLsCAMProfileController', {
	// selected lease code
	lsId: null,
	
	// lease record
	lsRecord: null,
	
	//most recent, active record from cost_tran_recur with cost_cat_id = "RENT - BASE RENT"
	rentCostRecord: null,
	
	// base rent cost category
	costCategoryValue: null,
	
	//CAM-ESTIMATE Category
	costCategoryCamEstimate: null,
	
	initialCamYearType: null,
	
	isNewProfile: null,
	
	afterViewLoad: function(){
		// add min max values for ls_index_profile.pct_change_adjust
		//this.abRepmCostLsProfileCamProfile.setMaxValue('ls_cam_profile.cam_rent_pct', 100);
		this.abRepmCostLsProfileCamProfile.setMinValue('ls_cam_profile.cam_rent_pct', 0);
		this.abRepmCostLsProfileCamCosts.afterCreateCellContent = this.abRepmCostLsProfileCamCosts_afterCreateCellContent;
	},
	
	refreshPage: function(lsRecord, costCategory, costCategoryCamEstimate){
		this.lsRecord = lsRecord;
		this.lsId = this.lsRecord.getValue("ls.ls_id");
		this.costCategoryValue = costCategory;
		this.costCategoryCamEstimate = costCategoryCamEstimate;
		this.isNewProfile = (this.lsRecord.getValue("ls.has_cam_profile") == 0);
		
		this.rentCostRecord = this.getRentCostRecord();

		var restriction = new Ab.view.Restriction();
		restriction.addClause("ls_cam_profile.ls_id", this.lsId, "=");
		this.abRepmCostLsProfileCamProfile.refresh(restriction, this.isNewProfile);
		
		if(this.isNewProfile || !this.rentCostRecord){
			this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_alloc_method", "F");
			this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_freq", "M");
		}
		
		// set year type value
		this.initialCamYearType = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_year_type");
		setRadioValue("rad_year_type", this.initialCamYearType);
		this.onChangeAllocationMethod(true);
		
		// set CAM Estimate Category options
		var costCatSelect = document.getElementById("vf_cost_cat_select");
		var costCatList = this.costCategoryCamEstimate.split(";");
		if(costCatSelect.options.length == 0){
			for(var i=0; i<costCatList.length; i++){
				var option=document.createElement("option");
				option.text=costCatList[i];
				option.value=costCatList[i];
				try{
				  // for IE earlier than version 8
					costCatSelect.add(option,costCatSelect.options[null]);
				}catch (e){
					costCatSelect.add(option,null);
				}
			}
		}
		
		var camEstimateRestriction = "('RENT - CAM ESTIMATE')";
		if(this.costCategoryCamEstimate){
			var camEstimateCostCateg = this.costCategoryCamEstimate.split(';');
			camEstimateRestriction = "('" + camEstimateCostCateg.join("','") + "')";
		}
		this.abRepmCostLsProfileCamCosts.addParameter("camEstimateRestriction", camEstimateRestriction);
		this.refreshCostsGrid();
	},
	
	/**
	 * Obtain the most recent active cost record having the cost category "RENT - BASE RENT"
	 */
	getRentCostRecord: function(){
		var record = null;
		
		var dsConfig = {id : 'costTranRecur_ds', 
				tableNames: ['cost_tran_recur'], 
				fieldNames: ['cost_tran_recur.cost_tran_recur_id', 'cost_tran_recur.ls_id', 'cost_tran_recur.status_active', 'cost_tran_recur.cost_cat_id',
				             'cost_tran_recur.amount_expense', 'cost_tran_recur.amount_income', 'cost_tran_recur.amount_expense_base_payment', 
				             'cost_tran_recur.amount_income_base_payment', 'cost_tran_recur.period', 'cost_tran_recur.date_trans_created', 'cost_tran_recur.currency_payment', 'cost_tran_recur.date_trans_created']};
		var baseRentCategories = this.costCategoryValue.split(";");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cost_tran_recur.ls_id", this.lsId, "=");
		restriction.addClause("cost_tran_recur.cost_cat_id", baseRentCategories, "IN");
		restriction.addClause("cost_tran_recur.status_active", 1, "=");
		restriction.addClause("cost_tran_recur.date_start", '${sql.currentDate}', "<=");
		restriction.addClause("cost_tran_recur.date_end", '${sql.currentDate}', ">=", ")AND(", false);
		restriction.addClause("cost_tran_recur.date_end", '', "IS NULL", "OR", false);
		var parameters = {
			sortValues: "[{'fieldName':'cost_tran_recur.cost_tran_recur_id', 'sortOrder':-1}]"
		};
		
		var dataSource = new Ab.data.createDataSourceForFields(dsConfig);
		if (dataSource){
			var records = dataSource.getRecords(restriction, parameters);
			if (records.length > 0){
				record = records[0];
			}
		}
		
		return record;
	},
	
	refreshCostsGrid: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cost_tran_recur.ls_id", this.lsId, "=");
		restriction.addClause("cost_tran_recur.cam_cost", "CAM", "=");
		this.abRepmCostLsProfileCamCosts.refresh(restriction);
	},
	
	setCustomLabels: function(){
		var custom = "";
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
			var camAllocMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");
			var currencyCode = View.user.userCurrency.code;
			if(valueExists(this.rentCostRecord)){
				currencyCode = this.rentCostRecord.getValue("cost_tran_recur.currency_payment");
			}
			var currencyDescription = getCurrencyDescription(currencyCode);
			custom = ", " + currencyDescription;
    	}
		this.abRepmCostLsProfileCamProfile.setFieldLabel("ls_cam_profile.cam_rent",getMessage("rentTitle") + custom);
		this.abRepmCostLsProfileCamProfile.setFieldLabel("ls_cam_profile.cam_cost_rent_pct",getMessage("camCostPctTitle") + custom);
		this.abRepmCostLsProfileCamProfile.setFieldLabel("ls_cam_profile.cam_cost_per_area",getMessage("camCostPerArea") + custom);
		this.abRepmCostLsProfileCamProfile.setFieldLabel("ls_cam_profile.cam_cost_area",getMessage("camCostArea") + custom);
		this.abRepmCostLsProfileCamProfile.setFieldLabel("ls_cam_profile.cam_cost_fixed",getMessage("camCostFixed") + custom);
	},
		
	abRepmCostLsProfileCamCosts_afterRefresh: function(){
		var title = getMessage("titleCamCostHistory");
		title = title.replace("{0}", this.lsId);
		this.abRepmCostLsProfileCamCosts.setTitle(title);
		
	},
	
	/*
	 * Custom create cell content.
	 * Show selection checkbox and edit button just for recurring and scheduled costs.
	 * Actual cost should not be changed or deleted. 
	 */
	abRepmCostLsProfileCamCosts_afterCreateCellContent: function(row, column, cellElement){
		var costType = row['cost_tran_recur.cost_type'];
		if ((column.id == 'edit' || column.id == 'multipleSelectionColumn') 
				&& costType == 'actual' ) {
			cellElement.firstChild.style.display = "none";
		}
		if (column.id == "costType") {
			var text = getMessage("costType_" + costType);
			cellElement.innerHTML = text;
		}
		if (column.id == "cost_tran_recur.cost_id") {
			var cost_id = removeGroupingSeparator(row['cost_tran_recur.cost_id']);
			row['cost_tran_recur.cost_id'] = cost_id;
			cellElement.innerHTML = cost_id;
		}
	},
	
	abRepmCostLsProfileCamProfile_onNew: function(){
		var controller = this;
		this.abRepmCostLsProfileCamProfile.clearValidationResult();
		if (this.validateForm()) {
			// add new recurring cost
			var costValues = this.getNewCostValues();
			var landlordTenant = this.lsRecord.getValue("ls.landlord_tenant");
			var lsId = this.lsRecord.getValue("ls.ls_id");
			var isLandlord = (landlordTenant == "LANDLORD");
			
	        var runtimeParameters = {
	        		isNewRecord: true,
	        		isBuilding: false,
	        		isProperty: false,
	        		isLease: true,
	        		isAccount: false,
	        		isLandlord: isLandlord,
	        		ls_id: lsId,
					pr_id: null,
					bl_id: null,
					ac_id: null,
					cost_tran_recur_id: null,
					openerController: this,
					gridPanel: this.abRepmCostLsProfileCamCosts,
					costValues: costValues
					
	        };	

	        View.openDialog("ab-rplm-cost-mgmt-add-edit-recurring.axvw", null, true, {
	            width: 900,
	            height: 700,
	            closeButton: true,
	            runtimeParameters: runtimeParameters,
	            callbackAfterSave: controller.saveCamProfile
	        });
			
			
		}else{
			this.abRepmCostLsProfileCamProfile.displayValidationResult();
		}
	},
	
	saveCamProfile: function(controller){
		controller.abRepmCostLsProfileCamProfile.save();
	},
	
	getNewCostValues: function(){
		var isLandlord = (this.lsRecord.getValue("ls.landlord_tenant") == "LANDLORD");
		var isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;

		var costObject = new Object();
		costObject["cost_tran_recur.ls_id"] = this.lsId;
		var costCategory = document.getElementById("vf_cost_cat_select").options[document.getElementById("vf_cost_cat_select").selectedIndex].value;
		costObject["cost_tran_recur.cost_cat_id"] = costCategory;
		costObject["cost_tran_recur.description"] = costCategory +' '+ getMessage('costForLease') +' '+ this.lsId;
		costObject["cost_tran_recur.cam_cost"] = 'CAM';
		costObject["cost_tran_recur.status_active"] = '1';
		costObject["cost_tran_recur.period"] = this.getCamFreqPeriod();
		
		var camYearType = getRadioValue('rad_year_type');
		var startDate = null;
		if(camYearType == 'F'){
			startDate = getFiscalYearStartDate();
		}else{
			startDate = getCalendarYearStartDate();
		}
		var objCostDs = this.abRepmCostLsProfileCamCosts_ds;
		
		costObject["cost_tran_recur.date_start"] = objCostDs.formatValue("cost_tran_recur.date_start", startDate, false);
		costObject["cost_tran_recur.date_end"] = objCostDs.formatValue("cost_tran_recur.date_end", this.lsRecord.getValue("ls.date_end"), false);
		
		// set amounts
		var costAmount = 0;
		var camAllocMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");
		switch(camAllocMethod){
			case 'F':{
				costAmount = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_fixed");
				break;
			}
			case 'P':{
				costAmount = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_rent_pct");
				break;
			}
			case 'A':{
				this.calculateForm();
				costAmount = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_area");
				break;
			}
		}
		
		if(isVATAndMCEnabled){
			var incomeBase = "0";
			var expenseBase = "0";
			
			if(isLandlord){
				costObject["cost_tran_recur.amount_income_base_payment"] = costAmount;
			}else{
				costObject["cost_tran_recur.amount_expense_base_payment"] = costAmount;
			}
			
			if(camAllocMethod == 'P' && valueExists(this.rentCostRecord)){
				costObject["cost_tran_recur.currency_payment"] = this.rentCostRecord.getValue("cost_tran_recur.currency_payment");
			}else{
				costObject["cost_tran_recur.currency_payment"] = View.user.userCurrency.code;
			}
			
		}else{
			if(isLandlord){
				costObject["cost_tran_recur.amount_income"] = costAmount;
			}else{
				costObject["cost_tran_recur.amount_expense"] = costAmount;
			}
		}
		return costObject;
	},
	
	// validate cam form
	validateForm: function(){
		// default form validation
		var valid =  this.abRepmCostLsProfileCamProfile.canSave();
		
		var camAllocMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");
		
		// custom form validation
		if (valid) {
			//validate mandatory field for selected cam_alloc_method
			switch(camAllocMethod){
				case 'F':{
					var camCostFixed = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_fixed");
					if (!valueExistsNotEmpty(camCostFixed)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_cost_fixed').setInvalid("");
				       return false;
				    }
					break;
				}
				case 'P':{
					var camRent = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_rent");
					if (!valueExistsNotEmpty(camRent)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_rent').setInvalid("");
				       return false;
				    }
					
					var dateRent = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.date_rent_last_update");
					if (!valueExistsNotEmpty(dateRent)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.date_rent_last_update').setInvalid("");
				       return false;
				    }
					
					var camRentPct = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_rent_pct");
					if (!valueExistsNotEmpty(camRentPct)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_rent_pct').setInvalid("");
				       return false;
				    }
					
					var camCostRentPct = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_rent_pct");
					if (!valueExistsNotEmpty(camCostRentPct)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_cost_rent_pct').setInvalid("");
				       return false;
				    }
					break;
				}
				case 'A':{
					var camAreaNegotiated = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_area_negotiated");
					if (!valueExistsNotEmpty(camAreaNegotiated)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_area_negotiated').setInvalid("");
				       return false;
				    }
					
					var camCostPerArea = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_per_area");
					if (!valueExistsNotEmpty(camCostPerArea)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_cost_per_area').setInvalid("");
				       return false;
				    }
					
					var camCostArea = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_cost_area");
					if (!valueExistsNotEmpty(camCostArea)) {
				       this.abRepmCostLsProfileCamProfile.fields.get('ls_cam_profile.cam_cost_area').setInvalid("");
				       return false;
				    }
					break;
				}
			}
			
		}
		return valid;
	},
	
	getCamFreqPeriod: function(){
		var period = "";
		var camFreq = this.abRepmCostLsProfileCamProfile.getFieldValue('ls_cam_profile.cam_freq');
		if (camFreq == "Q") {
			period = "QUARTER";
		} else if (camFreq == "Y") {
			period = "YEAR";
		} else {
			period = "MONTH";
		}
		return period;
	},
	
	abRepmCostLsProfileCamProfile_onDelete: function(){
		var confirmMessage = getMessage("confirmDeleteCamProfile").replace("{0}", this.lsId);
		var controller = this; 
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') {
		    	if (controller.abRepmCostLsProfileCamProfile.deleteRecord()) {
		    		controller.isNewProfile = true;
		    		var restriction = new Ab.view.Restriction();
		    		restriction.addClause("ls_cam_profile.ls_id", controller.lsId, "=");
		    		controller.abRepmCostLsProfileCamProfile.refresh(restriction, controller.isNewProfile);

		    		controller.refreshCostsGrid();
		    	}
		    } 
		});
	},
	
	// customize form fields based on allocation method value
	onChangeAllocationMethod: function(isFirstLoad){
		var allocationMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");
		switch (allocationMethod) {
			case 'F':
				{
					this.clearFields(["ls_cam_profile.cam_cost_area",  
					                  "ls_cam_profile.cam_cost_rent_pct", "ls_cam_profile.cam_cost_per_area", 
					                  "ls_cam_profile.cam_rent_pct"]);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_fixed", true);
					
					if(!isFirstLoad){
						this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_freq", 'M');
					}
	
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.date_rent_last_update", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent_pct", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_rent_pct", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_area_negotiated", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_per_area", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_area", false);
					break;
				}
			case 'P':
				{
					this.clearFields(["ls_cam_profile.cam_cost_area", "ls_cam_profile.cam_cost_fixed", 
					                  "ls_cam_profile.cam_cost_per_area"]);
					
					if(!isFirstLoad){
						this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_freq", 'M');
					}
					
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent", true);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent_pct", true);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_rent_pct", true);
					
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_fixed", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_area_negotiated", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_per_area", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_area", false);
					break;
				}
			case 'A':
				{
				this.clearFields(["ls_cam_profile.cam_cost_rent_pct", "ls_cam_profile.cam_cost_fixed", 
				                  "ls_cam_profile.cam_rent_pct"]);
				
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_area_negotiated", true);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_per_area", true);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_area", true);
					
					if(!isFirstLoad){
						this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_freq", 'M');
					}
					
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_fixed", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_rent_pct", false);
					this.abRepmCostLsProfileCamProfile.enableField("ls_cam_profile.cam_cost_rent_pct", false);
					break;
				}
		}
		var lsAreaNegotiated = this.lsRecord.getValue("ls.area_negotiated");
		if (valueExistsNotEmpty(lsAreaNegotiated)) {
			var localizedAreaNegociated = this.abRepmCostLsProfileCamProfile_ds.formatValue("ls_cam_profile.cam_area_negotiated", lsAreaNegotiated, true);
			this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_area_negotiated", localizedAreaNegociated);
		}

		this.displayRentValue();
		
		this.setCustomLabels();
		
	},
	
	clearFields: function(fields){
		for(var i=0; i<fields.length; i++){
			this.abRepmCostLsProfileCamProfile.setFieldValue(fields[i], "");
		}
	},
	
	displayRentValue: function(){
		var allocationMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");

		var rentInitial = 0.0;
		var dateRentUpdate = null;
		if (valueExists(this.rentCostRecord)) {
			rentInitial = this.getRentInitial();
			dateRentUpdate = this.abRepmCostLsProfileCamProfile_ds.parseValue('ls_cam_profile.date_rent_last_update', this.rentCostRecord.getValue("cost_tran_recur.date_trans_created"), false);
		}

		var calculatedRent = this.getCalculatedRent(rentInitial);
		
		var localizedRent = this.abRepmCostLsProfileCamProfile_ds.formatValue("ls_cam_profile.cam_rent", calculatedRent, true);
		this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.cam_rent", localizedRent);
		
		var localizedDate = this.abRepmCostLsProfileCamProfile_ds.formatValue("ls_cam_profile.date_rent_last_update", dateRentUpdate, true);
		this.abRepmCostLsProfileCamProfile.setFieldValue("ls_cam_profile.date_rent_last_update", localizedDate);
		
		this.calculateForm();
	},
	
	getRentInitial: function() {
		var rentInitialValue = null
		if (valueExists(this.rentCostRecord)) {
			var landlordTenant = this.lsRecord.getValue("ls.landlord_tenant");
			var isMcAndVATEnabled = (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1);
			var fieldName = "amount";
			if (landlordTenant == "LANDLORD") {
				fieldName += "_income";
			} else {
				fieldName += "_expense";
			}
			if (isMcAndVATEnabled) {
				fieldName += "_base_payment";
			} 
			
			rentInitialValue = this.rentCostRecord.getValue("cost_tran_recur." + fieldName);
			var recurringCostId = this.rentCostRecord.getValue("cost_tran_recur.cost_tran_recur_id"); 
			if (valueExistsNotEmpty(rentInitialValue)) {
				try{
					// create number instance
					rentInitialValue = 1 * rentInitialValue;
					recurringCostId = 1 * recurringCostId;
					var currentDate = this.abRepmCostLsProfileCamProfile_ds.formatValue("ls_cam_profile.date_rent_last_update", new Date(), false);
					var result = Workflow.callMethod("AbCommonResources-CostService-applyYearlyFactor", recurringCostId, rentInitialValue, currentDate);
					rentInitialValue = result.value;
					
				}catch(e){
					Workflow.handleError(e);
				}
			}
		}
		return rentInitialValue;
	},
	
	getCalculatedRent: function(rentInitial){
		var calculatedRent = 0;
		if (valueExists(this.rentCostRecord)) {
			
			var rentPeriod = this.rentCostRecord.getValue("cost_tran_recur.period");
			var camFreq = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_freq");
			switch(camFreq){
				case 'M':{
					camFreq = "MONTH";
					break;
				}
				case 'Q':{
					camFreq = "QUARTER";
					break;
				}
				case 'Y':{
					camFreq = "YEAR";
					break;
				}
			}
			
			if(rentPeriod == camFreq){
				calculatedRent = rentInitial;
			}else if(rentPeriod == "MONTH"){
				if(camFreq == "QUARTER"){
					calculatedRent = rentInitial * 3;
				}else if(camFreq == "YEAR"){
					calculatedRent = rentInitial * 12;
				}
			}else if(rentPeriod == "QUARTER"){
				if(camFreq == "YEAR"){
					calculatedRent = rentInitial * 4;
				}else if(camFreq == "MONTH"){
					calculatedRent = rentInitial / 3;
				}
			}else if(rentPeriod == "YEAR"){
				if(camFreq == "MONTH"){
					calculatedRent = rentInitial / 12;
				}else if(camFreq == "QUARTER"){
					calculatedRent = rentInitial / 4;
				}
			}
		}
		return calculatedRent;
	},
	
	abRepmCostLsProfileCamCosts_edit_onClick: function(row){
		this.editCost(row, false);
	},
	
	editCost: function(row, isNewRecord){
		var landlordTenant = this.lsRecord.getValue("ls.landlord_tenant");
		var lsId = this.lsRecord.getValue("ls.ls_id");
		var isLandlord = (landlordTenant == "LANDLORD");
		var costId = null;
		var costType = 'recurring'; 
		if (valueExists(row)) {
			var costType = row.getFieldValue("cost_tran_recur.cost_type");
			costId = row.getFieldValue("cost_tran_recur.cost_id");
		}
        var runtimeParameters = {
        		isNewRecord: isNewRecord,
        		isBuilding: false,
        		isProperty: false,
        		isLease: true,
        		isAccount: false,
        		isLandlord: isLandlord,
        		ls_id: lsId,
				pr_id: null,
				bl_id: null,
				ac_id: null,
				cost_tran_recur_id: costId,
				cost_tran_sched_id: costId,
				openerController: this,
				gridPanel: this.abRepmCostLsProfileCamCosts
        };	
        
        var fileName = (costType == 'recurring'?'ab-rplm-cost-mgmt-add-edit-recurring.axvw':'ab-rplm-cost-mgmt-add-edit-scheduled.axvw');
        
        View.openDialog(fileName, null, true, {
            width: 900,
            height: 700,
            closeButton: true,
            runtimeParameters: runtimeParameters
        });
	},
	
	abRepmCostLsProfileCamCosts_onDelete: function(){
		var selectedRows = this.abRepmCostLsProfileCamCosts.getSelectedRows();
		var controller = this;
        if (selectedRows.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        } else {
            View.confirm(getMessage('confirm_delete'), function(button){
                if (button == 'yes') {
                	var recurringCosts = new Array();
                	var scheduledCosts = new Array();
                	for (var i = 0; i < selectedRows.length; i++) {
                		var costType = selectedRows[i]['cost_tran_recur.cost_type']; 
                		var costId =  selectedRows[i]['cost_tran_recur.cost_id'];
                		var rowKey = new Object();
                		if (costType == 'recurring') {
                			rowKey['cost_tran_recur.cost_tran_recur_id'] = costId; 
                			recurringCosts.push(rowKey);
                		}else{
                			rowKey['cost_tran_sched.cost_tran_sched_id'] = costId;
                			scheduledCosts.push(rowKey);
                		}
                	}
                	
                    try {
                    	if (recurringCosts.length > 0) {
                            Workflow.call('AbCommonResources-deleteDataRecords', {
                                records: toJSON(recurringCosts),
    							viewName: 'ab-repm-cost-ls-profile-cam.axvw',
            					dataSourceId: 'costTranRecur_ds'
                            });
                    	}
                    	if (scheduledCosts.length > 0) {
                            Workflow.call('AbCommonResources-deleteDataRecords', {
                                records: toJSON(scheduledCosts),
    							viewName: 'ab-repm-cost-ls-profile-cam.axvw',
            					dataSourceId: 'costTranSched_ds'
                            });
                    	}
                    } 
                    catch (e) {
                        Workflow.handleError(e);
                    }
                    controller.abRepmCostLsProfileCamCosts.refresh();
                }
                
            });
        }

	},
	
	calculateForm: function(){
		var values = this.abRepmCostLsProfileCamProfile.getFieldValues();
		var camAllocMethod = this.abRepmCostLsProfileCamProfile.getFieldValue("ls_cam_profile.cam_alloc_method");
		var objDataSource = this.abRepmCostLsProfileCamProfile.getDataSource();
		try {
			var result  = Workflow.callMethod('AbCommonResources-CostService-calculateCamProfile', values);
			var calculatedValues = result.data;
			switch (camAllocMethod) {
			case 'F':
			{
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_rent_pct"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_rent_pct"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_rent_pct", objDataSource.formatValue("ls_cam_profile.cam_rent_pct", fieldValue, true));
				}
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_cost_per_area"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_cost_per_area"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_cost_per_area", objDataSource.formatValue("ls_cam_profile.cam_cost_per_area", fieldValue, true));
				}
				break;
			}
			case 'P':
			{
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_cost_rent_pct"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_cost_rent_pct"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_cost_rent_pct", objDataSource.formatValue("ls_cam_profile.cam_cost_rent_pct", fieldValue, true));
				}
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_cost_per_area"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_cost_per_area"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_cost_per_area", objDataSource.formatValue("ls_cam_profile.cam_cost_per_area", fieldValue, true));
				}
				break;
			}
			case 'A':
			{
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_cost_area"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_cost_area"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_cost_area", objDataSource.formatValue("ls_cam_profile.cam_cost_area", fieldValue, true));
				}
				if (valueExistsNotEmpty(calculatedValues["ls_cam_profile.cam_rent_pct"])) {
					var fieldValue = 1.0 * calculatedValues["ls_cam_profile.cam_rent_pct"];
					this.abRepmCostLsProfileCamProfile.setFieldValue( "ls_cam_profile.cam_rent_pct", objDataSource.formatValue("ls_cam_profile.cam_rent_pct", fieldValue, true));
				}
				break;
			}
		}
			
		} catch(e){
			Workflow.handleError(e);
		}
	},
	
	getFieldValue: function(fieldName){
		var value = this.abRepmCostLsProfileCamProfile.getFieldValue(fieldName);
		if (valueExistsNotEmpty(value)) {
			value = this.abRepmCostLsProfileCamProfile.getDataSource().parseValue(fieldName, value, false);
		}
		return value;
	}
	
	
});


/**
 * Set radio button value.
 * @param name: radio button object name
 * @param value: new value
 */
function setRadioValue(name, value){
	var objRadioEl = document.getElementsByName(name);
	if (objRadioEl) {
		for (var i = 0; i < objRadioEl.length; i++) {
			var optionEl = objRadioEl[i];
			if (optionEl.value == value) {
				optionEl.checked = true;
				break;
			}
		}
	}
}

/**
 * Get radio button selected value.
 * @param name: radio button name
 * @returns selected value or null
 */
function getRadioValue(name){
	var value = null;
	var objRadioEl = document.getElementsByName(name);
	if (objRadioEl) {
		for (var i = 0; i < objRadioEl.length; i++) {
			var optionEl = objRadioEl[i];
			if (optionEl.checked) {
				value = optionEl.value;
				break;
			}
		}
	}
	return value;
}

/**
 * Obtain the start date of the current calendar year.
 * @returns startDate
 */
function getCalendarYearStartDate(){
	var sDate = new Date();
	sDate.setDate(1);
	sDate.setMonth(0);
	return sDate;
}

/**
 * Obtain the start date of the current fiscal year.
 * @returns startDate
 */
function getFiscalYearStartDate(){
	var fiscalDateFull = new Date();
	var currentDate = new Date();
	var fiscalYearDay = 1;
	var fiscalYearMonth = 1;
	var params = {
		tableName: 'afm_scmpref',
		fieldNames: toJSON(['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth', 'afm_scmpref.afm_scmpref']),
		restriction: toJSON({
			'afm_scmpref.afm_scmpref': 0
		})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		var record = result.dataSet.records[0];
		fiscalYearDay = record.getValue('afm_scmpref.fiscalyear_startday');
		fiscalYearMonth = record.getValue('afm_scmpref.fiscalyear_startmonth');
		fiscalDateFull.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
		if (currentDate.getTime() < fiscalDateFull.getTime()) {
			fiscalDateFull = fiscalDateFull.add(Date.YEAR, -1);
		}
		return(fiscalDateFull);
	} catch (e) {
		Workflow.handleError(e);
	}
}
