var editLeaseController = View.createController('editLease', {
    itemId: null,
	item:null,
	itemType:null,
    refreshPanels: new Array(),
	isLsContactsDef: false,
	
	callbackFunction: null,
	

	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callbackFunction = View.parameters.callback;
		}

		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
		this.editLease.showField('ls.bl_id', false);
		this.editLease.showField('ls.pr_id', false);
		this.editLease.showField('dummy_field', false);
	},
	
	afterInitialDataFetch: function(){
		if(this.editLease.getFieldValue('ls.lease_sublease')!='SUBLEASE'){
			this.editLease.enableField('ls.ls_parent_id' ,false);
		}
	},
	
	editLease_afterRefresh: function(){
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.editLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + " ( " + View.user.userCurrency.symbol + " )");
    	}else{
    		this.editLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
    	}
	},
	
    editLease_onSave: function(){
        if (!this.editLease.fields.get('ls.bl_id').hidden && !this.editLease.fields.get('ls.pr_id').hidden) {
        	if (!valueExistsNotEmpty(this.editLease.getFieldValue('ls.bl_id')) && !valueExistsNotEmpty(this.editLease.getFieldValue('ls.pr_id'))) {
        		this.editLease.fields.get('ls.bl_id').fieldDef.required = true;
        		this.editLease.fields.get('ls.pr_id').fieldDef.required = true;
        	}else{
        		this.editLease.fields.get('ls.bl_id').fieldDef.required = false;
        		this.editLease.fields.get('ls.pr_id').fieldDef.required = false;
        	}
        }	

    	if (!validateData(this.dsEditLease, this.editLease)) {
            return;
        }
		
        
		if (this.editLease.getFieldValue('ls.lease_sublease') == 'SUBLEASE' && this.editLease.getFieldValue('ls.ls_parent_id').length > 0) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('ls.ls_id', this.editLease.getFieldValue('ls.ls_parent_id'), '=');
			var records = this.dsEditLease.getRecords(restriction);
			if(records.length > 0){
				if(this.saveLeaseRecord()){
					addToLeaseContacts(this.editLease.getFieldValue('ls.ls_id'), this.editLease.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
					addToLeaseContacts(this.editLease.getFieldValue('ls.ls_id'), this.editLease.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
	                for (var i = 0; i < this.refreshPanels.length; i++) {
	                    View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
	                }
	                if (valueExists(this.callbackFunction)) {
	                	this.callbackFunction(this.editLease.getFieldValue('ls.ls_id'));
	                }
	                View.closeThisDialog();
				}
			}else{
				View.showMessage(getMessage('error_leaseid'));
			}
        }
        else {
        	if(this.saveLeaseRecord()){
    			addToLeaseContacts(this.editLease.getFieldValue('ls.ls_id'), this.editLease.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
    			addToLeaseContacts(this.editLease.getFieldValue('ls.ls_id'), this.editLease.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
                for (var i = 0; i < this.refreshPanels.length; i++) {
                    View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
                }
                if (valueExists(this.callbackFunction)) {
                	this.callbackFunction(this.editLease.getFieldValue('ls.ls_id'));
                }
                View.closeThisDialog();
        	}
        }
    },
    editLease_onCancel: function(){
        View.closeThisDialog();
    },
    
    saveLeaseRecord: function(){
    	try{
	    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
	    		var dataSource = this.editLease.getDataSource();
	    		var amountSecurityDep = this.editLease.getFieldValue('ls.amount_security');
	    		var lsId =  this.editLease.getFieldValue('ls.ls_id');
	    		var record = this.editLease.getRecord();
	    		if(valueExistsNotEmpty(amountSecurityDep)){
	    			amountSecurityDep = 1* amountSecurityDep;
		    		var result = Workflow.callMethod("AbCommonResources-CostService-convertCostToBudget", amountSecurityDep, View.user.userCurrency.code , 'Budget');
		    		var convertedValue = result.value;
		    		record.setValue('ls.amount_security', convertedValue);
	    		}
	    		dataSource.saveRecord(record);
	    		return true;
	    	}else{
	    		this.editLease.save();
	    		return true;
	    	}
    	} catch(e){
    		Workflow.handleError(e);
    		return false;
    	}
    }
})

function validateData(dataSource, form){
	if (!form.canSave()) {
		return false;
	}
    /*
     * check 'ls.amount_security', numeric , format money
     */
    if (parseFloat(form.getFieldValue('ls.amount_security')) != form.getFieldValue('ls.amount_security')) {
        View.showMessage(getMessage('error_amount_security_invalid'));
        return false;
    }
    /*
     * check 'ls.qty_occupancy' integer
     */
    if (parseInt(form.getFieldValue('ls.qty_occupancy')) != form.getFieldValue('ls.qty_occupancy')) {
        View.showMessage(getMessage('error_qty_occupancy_invalid'));
        return false;
    }
	// get the string value from field stard date
	var date_start = form.getFieldValue('ls.date_start').split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field move date
	var date_move = form.getFieldValue('ls.date_move').split("-");
	//create Date object
	var dateMove = new Date(date_move[0],date_move[1],date_move[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue('ls.date_end').split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);
	
	if (dateMove < dateStart) {
		View.showMessage(getMessage('error_date_move_before_date_start'));
		return false;
	}
	if (dateEnd < dateStart) {
			View.showMessage(getMessage('error_date_end_before_date_start'));
			return false;
	}
    return true;
}
function selectParentLease() {
    var itemType = '';
	if(editLeaseController.itemType == 'BUILDING'){
		itemType = 'ls.bl_id'
	}else{
		itemType = 'ls.pr_id'
	}
	
	Ab.view.View.selectValue(
        'editLease', 'Parent Lease', ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        [itemType,'ls.ls_id'],
        'ls.use_as_template = 0 AND ls.ls_id != \''+this.editLeaseController.itemId+'\' and '+itemType+' = \''+this.editLeaseController.item+'\' AND ls.lease_sublease !=  \'SUBLEASE\'', 'afterSelectParentLease', false, false, '', 1000, 500);
}

function afterSelectParentLease(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}
function setParentLease(){
	if(editLeaseController.editLease.getFieldValue('ls.lease_sublease')=='SUBLEASE'){
		editLeaseController.editLease.enableField('ls.ls_parent_id' ,true);
	}else {
		editLeaseController.editLease.enableField('ls.ls_parent_id' ,false);
	}
}

function onSelectLdContact(){
	onSelectContact('ls.ld_contact');
}

function onSelectTnContact(){
	onSelectContact('ls.tn_contact');
}

function onSelectContact(fieldName){
	var form = View.panels.get('editLease');

	View.openDialog('ab-contact.axvw', null, false, {
	    width: 1024, 
	    height: 800, 
	    closeButton: true,
	    maximize: false,	
	    restriction: null, 
	    isMultipleSelection: false,
	    callback: function(res){
	    	for (var i = 0; i < res.length; i++) {
		    	form.setFieldValue(fieldName, res[i]);
	    	}
	    	View.closeDialog();
	    }
	 });
}

/**
 * Add contact to lease contacts table.
 * 
 * @param leaseId lease code
 * @param contactId contact code
 * @param isLsContactsDef if lease contacts table exists
 */
function addToLeaseContacts(leaseId, contactId, isLsContactsDef){
	if (isLsContactsDef && valueExistsNotEmpty(contactId)) {
		var dataSource = View.dataSources.get('abRepmLsContacts_ds'); 
		var restriction =  new Ab.view.Restriction();
		restriction.addClause('ls_contacts.ls_id', leaseId, '=');
		restriction.addClause('ls_contacts.contact_id', contactId, '=');
		var record = dataSource.getRecord(restriction);
		if (!valueExists(record.getValue('ls_contacts.contact_id'))) {
			record = new Ab.data.Record({
				'ls_contacts.ls_id': leaseId,
				'ls_contacts.contact_id': contactId
			}, true);
			dataSource.saveRecord(record);
		}
	}
}