var abRepmCostLsIndexProfileController = View.createController('abRepmCostLsIndexProfileController', {
	// selected lease code
	lsId: null,
	
	// lease record
	lsRecord: null,
	
	// last base rent cost record
	baseRentRecord: null,
	
	// base rent cost category
	costCategoryValue: null,
	
	isNewProfile: null,
	
	afterViewLoad: function(){
		// add min max values for ls_index_profile.pct_change_adjust
		this.abRepmCostLsProfileLsIndex.setMaxValue('ls_index_profile.pct_change_adjust', 100);
		this.abRepmCostLsProfileLsIndex.setMinValue('ls_index_profile.pct_change_adjust', 0);
		this.abRepmCostLsProfileLsIndex.setMaxValue('ls_index_profile.rent_round_to', 2);
		this.abRepmCostLsProfileLsIndex.setMinValue('ls_index_profile.rent_round_to', 0);		
	},
	
	refreshPage: function(lsRecord, costCategory){
		this.lsRecord = lsRecord;
		this.lsId = this.lsRecord.getValue("ls.ls_id");
		this.costCategoryValue = costCategory;
		this.isNewProfile = (this.lsRecord.getValue("ls.has_index_profile") == 0);
		
		this.setFieldsAsReadOnly(!this.isNewProfile);
		
		this.baseRentRecord = getRentInitialRecord(this.lsId, this.lsRecord.getValue("ls.landlord_tenant"), this.costCategoryValue);

		var restriction = new Ab.view.Restriction();
		restriction.addClause("ls_index_profile.ls_id", this.lsId, "=");
		this.abRepmCostLsProfileLsIndex.refresh(restriction, this.isNewProfile);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cost_tran_recur.ls_id", this.lsId, "=");
		restriction.addClause("cost_tran_recur.cost_cat_id", this.costCategoryValue.split(";"), "IN");
		this.abRepmCostLsProfileCostTranRecur.refresh(restriction);
		
	},
	
	/**
	 * Lock-down (as read-only) some fields when Lease Index Profile is saved(KB3039231).
	 */
	setFieldsAsReadOnly: function(isReadOnly){
		var fields = this.abRepmCostLsProfileLsIndex.fields;
		var fieldIds = ['ls_index_profile.cost_index_id', 'ls_index_profile.date_index_start', 
		                	'ls_index_profile.date_index_next', 'ls_index_profile.date_index_end',
		                	'ls_index_profile.index_value_initial', 'ls_index_profile.rent_initial'];
		for (var i=0; i<fieldIds.length; i++){
			fields.get(fieldIds[i]).fieldDef.readOnly = isReadOnly;
			$(fieldIds[i]).style.readOnly = isReadOnly;
			$(fieldIds[i]).disabled = isReadOnly;
		}
	},
	
	abRepmCostLsProfileLsIndex_afterRefresh: function(){
		if(!valueExistsNotEmpty(this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.ls_id"))){
			this.abRepmCostLsProfileLsIndex.setFieldValue("ls_index_profile.ls_id", this.lsId);
		}
		
		if (this.isNewProfile){
			// we don't have a profile yet and we must update cost_index from ls record
			this.abRepmCostLsProfileLsIndex.setFieldValue("ls.cost_index", this.lsRecord.getValue("ls.cost_index"));
		}
		$("chkIndexCosts").checked = (this.abRepmCostLsProfileLsIndex.getFieldValue("ls.cost_index") == 1);
		$("chkResetInitialValues").checked = (this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.reset_initial_values") == 1);
		
		if (this.isNewProfile) {
			//if is new profile check date fields 
			var startDate = this.lsRecord.getValue("ls.date_start");
			if (valueExists(this.baseRentRecord)) {
				startDate = this.baseRentRecord.getValue("cost_tran_recur.date_start");
			}
			this.abRepmCostLsProfileLsIndex.setFieldValue("ls_index_profile.date_index_start", this.getDateIndexStart(startDate) );
			
			if (valueExistsNotEmpty(this.lsRecord.getLocalizedValue("ls.date_end"))) {
				this.abRepmCostLsProfileLsIndex.setFieldValue("ls_index_profile.date_index_end", this.lsRecord.getLocalizedValue("ls.date_end"));
			}
			
			var rentInitial = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.rent_initial");
			if (!valueExistsNotEmpty(rentInitial)) {
				rentInitial = getRentInitial(this.baseRentRecord, this.lsRecord.getValue("ls.landlord_tenant"));
				if (valueExistsNotEmpty(rentInitial)) {
					var formattedValue = this.abRepmCostLsProfileLsIndex.getDataSource().formatValue("ls_index_profile.rent_initial", rentInitial);
					this.abRepmCostLsProfileLsIndex.setFieldValue("ls_index_profile.rent_initial", formattedValue);
				}
			}
		}
		
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
			var rentCurrency = null;
			if (valueExists(this.baseRentRecord)) {
				rentCurrency = this.baseRentRecord.getValue("cost_tran_recur.currency_payment");
			}
			var currencyDescription = getCurrencyDescription(rentCurrency);
			if(!valueExistsNotEmpty(currencyDescription)){
				currencyDescription = "";
			}else{
				currencyDescription = ", " + currencyDescription;
			}
    		this.abRepmCostLsProfileLsIndex.setFieldLabel("ls_index_profile.rent_initial",getMessage("rentInitialTitle") + currencyDescription);
    	}else{
    		this.abRepmCostLsProfileLsIndex.setFieldLabel("ls_index_profile.rent_initial",getMessage("rentInitialTitle"));
    	}
		
		if (!valueExistsNotEmpty(this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_next"))) {
			this.checkDateIndexNext();
		}
		this.showRunWfrButton();
		
	},
	
	abRepmCostLsProfileCostTranRecur_afterRefresh: function(){
		var title = getMessage("titleLeaseIndexHistory");
		title = title.replace("{0}", this.costCategoryValue);
		title = title.replace("{1}", this.lsId);
		this.abRepmCostLsProfileCostTranRecur.setTitle(title);
	},
	
	abRepmCostLsProfileCostTranRecur_onRefresh: function(){
		this.abRepmCostLsProfileCostTranRecur.refresh(this.abRepmCostLsProfileCostTranRecur.restriction);
	},
	
	abRepmCostLsProfileLsIndex_onDelete: function(){
		var confirmMessage = getMessage("confirmDeleteIndexProfile").replace("{0}", this.lsId);
		var controller = this; 
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') {
		    	if (controller.abRepmCostLsProfileLsIndex.deleteRecord()) {
		    		controller.isNewProfile = true;
		    		var restriction = new Ab.view.Restriction();
		    		restriction.addClause("ls_index_profile.ls_id", controller.lsId, "=");
		    		controller.abRepmCostLsProfileLsIndex.refresh(restriction, controller.isNewProfile);
		    		
		    		var restriction = new Ab.view.Restriction();
		    		restriction.addClause("cost_tran_recur.ls_id", controller.lsId, "=");
		    		restriction.addClause("cost_tran_recur.cost_cat_id", controller.costCategoryValue.split(";"), "IN");
		    		controller.abRepmCostLsProfileCostTranRecur.refresh(restriction);
		    	}
		    } 
		});
	},
	
	abRepmCostLsProfileLsIndex_onSave: function(){
		// index cost not checked
		var result = false;
		var lsCostIndex = this.abRepmCostLsProfileLsIndex.getFieldValue("ls.cost_index");
		if (lsCostIndex == 0){
			var controller = this;
			View.confirm(getMessage("msgLeaseIndexCostsActive"), function(button) { 
			    if (button == 'yes') {
			    	result =  controller.doSave();
			    	this.setFieldsAsReadOnly(true);
			    } 
			});		
		}else{
			result = this.doSave();
			this.setFieldsAsReadOnly(true);
		}		
		return result;
	},
	
	doSave: function(){
		if (this.validateForm()) {
			
			var lsCostIndex = this.abRepmCostLsProfileLsIndex.getFieldValue("ls.cost_index");
			try {
				// update lease table
				var dsLease = new Ab.data.createDataSourceForFields({
					id: 'lease_ds',
					tableNames: ['ls'],
					fieldNames: ['ls.ls_id', 'ls.cost_index']
				});
				
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls.ls_id', this.lsId, "=");
				var record = dsLease.getRecord(restriction);
				record.setValue("ls.cost_index", lsCostIndex);
				dsLease.saveRecord(record);
				
				this.isNewProfile = false;
				
				// save lease index profile record
				this.abRepmCostLsProfileLsIndex.save()
				
				this.showRunWfrButton();
				return true;
			} catch (e){
				Workflow.handleError(e);
				return false;
			}
		}
	},
	
	abRepmCostLsProfileLsIndex_onRunWfr: function(){
		if (this.abRepmCostLsProfileLsIndex_onSave()) {
			try {
				
				var today = new Date();
				
				var lsId = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.ls_id");
				today = this.abRepmCostLsProfileLsIndex.getDataSource().formatValue("ls_index_profile.date_index_next", today, false);
				Workflow.callMethod('AbCommonResources-CostIndexingService-applyIndexesForLeaseOnDate', today, lsId);

				var restriction = new Ab.view.Restriction();
				restriction.addClause("ls_index_profile.ls_id", this.lsId, "=");
				this.abRepmCostLsProfileLsIndex.refresh(restriction);
				
				restriction = new Ab.view.Restriction();
	    		restriction.addClause("cost_tran_recur.ls_id", this.lsId, "=");
	    		restriction.addClause("cost_tran_recur.cost_cat_id", this.costCategoryValue.split(";"), "IN");
	    		this.abRepmCostLsProfileCostTranRecur.refresh(restriction);
	    		
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	validateForm: function(){
		// default form validation
		var valid =  this.abRepmCostLsProfileLsIndex.canSave();
		var message = null;
		// custom form validation
		if (valid) {
			var objLsStartDate = this.lsRecord.getValue("ls.start_date");
			var dateIndexStart = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_start");
			var objDateIndexStart = this.abRepmCostLsProfileLsIndex.getDataSource().parseValue("ls_index_profile.date_index_start", dateIndexStart, false);
			var objCurrentDate = new Date().clearTime();
			
			// date start should be in future errDateInFuture 
/*			if (objDateIndexStart < objCurrentDate) {
				var fieldDateIndexStart = this.abRepmCostLsProfileLsIndex.fields.get("ls_index_profile.date_index_start");
				message = getMessage("errDateInFuture").replace("{0}", fieldDateIndexStart.fieldDef.title);
				valid = false;
			}
*/			
			// check date_index_start should be greater (or equal) than lease start date
			if (valid && objDateIndexStart < objLsStartDate) {
				message = getMessage("errDateStartBeforeLsStartDate");
				valid = false;
			}
			
			// check date next indexing
			var dateIndexNext = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_next");
			var dateIndexEnd = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_end");
			if (valid && valueExistsNotEmpty(dateIndexNext) && valueExistsNotEmpty(dateIndexEnd)){
				var objDateIndexNext = this.abRepmCostLsProfileLsIndex.getDataSource().parseValue("ls_index_profile.date_index_next", dateIndexNext, false);
				var objDateIndexEnd = this.abRepmCostLsProfileLsIndex.getDataSource().parseValue("ls_index_profile.date_index_end", dateIndexEnd, false);
				if(objDateIndexNext > objDateIndexEnd){
					var fieldDateNext = this.abRepmCostLsProfileLsIndex.fields.get("ls_index_profile.date_index_next");
					var fieldDateEnd = this.abRepmCostLsProfileLsIndex.fields.get("ls_index_profile.date_index_end");
					message = getMessage("errDate0AfterDate1").replace("{0}", fieldDateNext.fieldDef.title).replace("{1}", fieldDateEnd.fieldDef.title);
					valid = false;
				}
			}
		}
		if (!valid && valueExistsNotEmpty(message)) {
			View.showMessage(message);
		}
		return valid;
	},
	
	getDateIndexStart: function(lsStartDate){
		var objDataSource = this.abRepmCostLsProfileLsIndex.getDataSource();
		var objIndexStartDate = new Date().clearTime();
		if (valueExistsNotEmpty(lsStartDate)) {
			var objLsStartDate = objDataSource.parseValue("ls_index_profile.date_index_start", lsStartDate, false);
			/*if (objLsStartDate.getTime() > objIndexStartDate.getTime()) {
				objIndexStartDate = objLsStartDate;
			}*/
			objIndexStartDate = objLsStartDate;
		}
		return objDataSource.formatValue("ls_index_profile.date_index_start", objIndexStartDate, true);
	},
	
	// check and complete date index next
	checkDateIndexNext: function(){
		var indexingFrequency = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.indexing_frequency");
		var dateIndexStart = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_start");
		var dateIndexNext = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_next");
		var dateIndexEnd = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_end");
		var dataSource = this.abRepmCostLsProfileLsIndex.getDataSource();
		// TODO: check logic for date index next
		if (valueExistsNotEmpty(dateIndexStart)){
			var objDateStart = dataSource.parseValue("ls_index_profile.date_index_start", dateIndexStart, false);
			var objDateIndexNextCalc = getDateNext(objDateStart, indexingFrequency);
			var objDateIndexNext = new Date();
			if (valueExistsNotEmpty(dateIndexNext)){
				objDateIndexNext = dataSource.parseValue("ls_index_profile.date_index_next", dateIndexNext, false);
			}
			// if not equal set date next to new calculated date next
			if (objDateIndexNext.getTime() != objDateIndexNextCalc.getTime()){
				dateIndexNext = dataSource.formatValue("ls_index_profile.date_index_next", objDateIndexNextCalc, true);
				this.abRepmCostLsProfileLsIndex.setFieldValue("ls_index_profile.date_index_next", dateIndexNext);
			}
			this.showRunWfrButton();
		}
	},
	
	showRunWfrButton: function(){
		var dateIndexNext = this.abRepmCostLsProfileLsIndex.getFieldValue("ls_index_profile.date_index_next");
		if (valueExistsNotEmpty(dateIndexNext)) {
			var objDateIndexNext = this.abRepmCostLsProfileLsIndex.getDataSource().parseValue("ls_index_profile.date_index_next", dateIndexNext, false);
			var today = new Date();
			
			if(objDateIndexNext < today) {
				this.abRepmCostLsProfileLsIndex.actions.get("runWfr").show(true);
			}else{
				this.abRepmCostLsProfileLsIndex.actions.get("runWfr").show(false);
			}
			
		}else{
			this.abRepmCostLsProfileLsIndex.actions.get("runWfr").show(false);
		}
	}
	
})

/**
 * Returns date interval properties (date part and interval value) for selected frequency
 * @param indexingFrequency frequency (m;Monthly;q;Quarterly;s;Semi-Annually;y;Annually)
 * @returns dateInterval object ( {datePart: value, interval: value} )
 */
function getDateInterval(indexingFrequency){
	var result = {datePart: null, interval: null};
	switch (indexingFrequency){
		case 'm' :
			{
				result.datePart = Date.MONTH;
				result.interval = 1;
				break;
			}
		case 'q' :
			{
				result.datePart = Date.MONTH;
				result.interval = 3;
				break;
			}
		case 's' :
			{
				result.datePart = Date.MONTH;
				result.interval = 6;
				break;
			}
		case 'y' :
			{
				result.datePart = Date.YEAR;
				result.interval = 1;
				break;
			}
		case 'b' :
			{
				result.datePart = Date.YEAR;
				result.interval = 2;
				break;
			}
		}
	return result;
}

/**
 * Get date next index
 * @param dateStart date start
 * @param frequency index frequency
 */
function getDateNext(dateStart, frequency){
	var objDateInterval = getDateInterval(frequency);
	var objDateNext = dateStart.add(objDateInterval.datePart, objDateInterval.interval);
	return objDateNext;
}

/**
 * Open Cost Index transaction details
 * @param context
 */
function showCostIndexTransDetails(context){
	var costIndexTransId = context.row.getFieldValue("cost_tran_recur.cost_index_trans_id");
	if (valueExistsNotEmpty(costIndexTransId)) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cost_index_trans.cost_index_trans_id", costIndexTransId, "=");
		View.panels.get("abRepmCostLsProfileCostIndexTrans").refresh(restriction);
		View.panels.get("abRepmCostLsProfileCostIndexTrans").showInWindow({closeButton: true});
	}
}

/**
 * On change field value.
 * @param fieldName field full name
 * @param value field value
 */
function onChangeField(fieldName, value){
	var controller = View.controllers.get("abRepmCostLsIndexProfileController");
	value = View.panels.get("abRepmCostLsProfileLsIndex").getFieldValue(fieldName);
	if (fieldName == "ls_index_profile.indexing_frequency" 
		|| fieldName == "ls_index_profile.date_index_start" || fieldName == "ls_index_profile.date_index_end"){
		controller.checkDateIndexNext();
		if (fieldName == "ls_index_profile.date_index_start") {
			var indexId = View.panels.get("abRepmCostLsProfileLsIndex").getFieldValue("ls_index_profile.cost_index_id");
			setIndexInitialValue(indexId, value);
		}
	}
	
}

/**
 * After select value listener - lease_index_profile.cost_index_id
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectCostIndex(fieldName, newValue, oldValue){
	if ((valueExistsNotEmpty(newValue) && !valueExistsNotEmpty(oldValue))
			|| (valueExistsNotEmpty(newValue) && valueExistsNotEmpty(oldValue) && newValue != oldValue)) {
		var dateIndexStart = View.panels.get("abRepmCostLsProfileLsIndex").getFieldValue("ls_index_profile.date_index_start");
		setIndexInitialValue(newValue, dateIndexStart);
	}
}

/**
 * Set index initial value.
 * @param indexId index code 
 * @param dateIndexStart date index start
 */
function setIndexInitialValue(indexId, dateIndexStart){
	if (!valueExistsNotEmpty(indexId)){
		return;
	}
	if(!valueExistsNotEmpty(dateIndexStart)){
		dateIndexStart = "${sql.currentDate}"; 
	}
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("cost_index_values.cost_index_id", indexId, "=");
	restriction.addClause("cost_index_values.date_index_value", dateIndexStart, "<=");
	
	var parameters = {
			sortValues: "[{'fieldName':'cost_index_values.date_index_value', 'sortOrder':-1}]"
		};
	var dsConfig = {id : 'costIndexValues_ds', 
			tableNames: ['cost_index_values'], 
			fieldNames: ['cost_index_values.cost_index_id', 'cost_index_values.date_index_value', 'cost_index_values.index_value']};
	
	var costIndexValue = getDbFieldValue('cost_index_values.index_value', dsConfig, restriction, parameters);
	if (valueExistsNotEmpty(costIndexValue)){
		var form = View.panels.get("abRepmCostLsProfileLsIndex");
		if (form){
			var formattedValue = form.getDataSource().formatValue("ls_index_profile.index_value_initial", costIndexValue);
			form.setFieldValue("ls_index_profile.index_value_initial", formattedValue);
		}
	}
}

/**
 * Get last rent base cost record.
 * @param leaseCode lease code 
 * @param landlordTenant landlord tenant
 * @param costCategory base rent cost category
 */
function getRentInitialRecord(leaseCode, landlordTenant, costCategory){
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
	
	var parameters = {
			sortValues: "[{'fieldName':'cost_tran_recur.cost_tran_recur_id', 'sortOrder':-1}]"
		};
	var dsConfig = {id : 'costTranRecur_ds', 
			tableNames: ['cost_tran_recur'], 
			fieldNames: ['cost_tran_recur.' + fieldName, 'cost_tran_recur.ls_id', 'cost_tran_recur.status_active', 'cost_tran_recur.cost_cat_id', 
			             'cost_tran_recur.cost_tran_recur_id', 'cost_tran_recur.currency_payment', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end']};
	var restriction = new Ab.view.Restriction();
	restriction.addClause("cost_tran_recur.ls_id", leaseCode, "=");
	restriction.addClause("cost_tran_recur.status_active", 1, "=");
	restriction.addClause("cost_tran_recur.cost_cat_id", costCategory.split(";"), "IN");
	
	var record = null;
	try{
		var dataSource = new Ab.data.createDataSourceForFields(dsConfig);
		if (dataSource){
			var records = dataSource.getRecords(restriction, parameters);
			if (records.length > 0){
				record = records[0];
			}
		}
	} catch (e) {
		Workflow.handleError(e);
		record = null;
	}

	return record;
}


/**
 * Get rent initial from base rent record
 * @param record  base rent record
 * @returns field value
 */
function getRentInitial(record, landlordTenant) {
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
	var rentInitialValue = null;
	if (valueExists(record)) {
		rentInitialValue = record.getValue("cost_tran_recur." + fieldName);
	}
	return rentInitialValue;
}

/**
 * Get field value from database
 * @param fieldName field full name
 * @param dataSourceConfig data source definition 
 * @param restriction restriction object
 * @param parameters wfr parameters
 * @returns object
 */
function getDbFieldValue(fieldName, dataSourceConfig, restriction, parameters){
	var result = null;
	try{
		var dataSource = new Ab.data.createDataSourceForFields(dataSourceConfig);
		if (dataSource){
			var records = dataSource.getRecords(restriction, parameters);
			if (records.length > 0){
				var record = records[0];
				result = record.getValue(fieldName);
			}
		}
	} catch (e){
		Workflow.handleError(e);
		result = null;
	}
	return result;
}
