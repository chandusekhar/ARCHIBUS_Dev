var addNewLeaseController = View.createController('addNewLease', {
    itemId: null,
    itemType: null,
	item: null,
    refreshPanels: new Array(),
	isLsContactsDef: false,
	
	callbackFunction: null,
	
	associateLease: false,
	
	afterViewLoad: function(){
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callbackFunction = View.parameters.callback;
		}

		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
		this.newLease.showField('ls.bl_id', false);
		this.newLease.showField('ls.pr_id', false);
		this.newLease.showField('dummy_field', false);
	},
    
    newLease_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.newLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + " ( " + View.user.userCurrency.symbol + " )");
    	}else{
    		this.newLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
    	}
    },
    
    newLease_onSave: function(){
    	if (valueExistsNotEmpty(this.itemType)) {
        	if (this.itemType.toLowerCase() == 'building') {
        		this.newLease.setFieldValue('ls.bl_id', this.itemId);
        	} else{
        		this.newLease.setFieldValue('ls.pr_id', this.itemId);
        	}
    	}
    	
        if (!this.newLease.fields.get('ls.bl_id').hidden && !this.newLease.fields.get('ls.pr_id').hidden) {
        	if (!valueExistsNotEmpty(this.newLease.getFieldValue('ls.bl_id')) && !valueExistsNotEmpty(this.newLease.getFieldValue('ls.pr_id'))) {
        		this.newLease.fields.get('ls.bl_id').fieldDef.required = true;
        		this.newLease.fields.get('ls.pr_id').fieldDef.required = true;
        	}else{
        		this.newLease.fields.get('ls.bl_id').fieldDef.required = false;
        		this.newLease.fields.get('ls.pr_id').fieldDef.required = false;
        	}
        }	

        if (!validateData(this.dsNewLease, this.newLease)) {
            return;
        }

        
        if (this.newLease.getFieldValue('ls.lease_sublease') == 'SUBLEASE' && this.newLease.getFieldValue('ls.ls_parent_id').length > 0) {
            var records = this.dsNewLease.getRecords();
            var existLease = false;
            for (i = 0; i < records.length; i++) {
                if (this.newLease.getFieldValue('ls.ls_parent_id') == records[i].getValue('ls.ls_id')) {
                	if(this.saveLeaseRecord()){
        				addToLeaseContacts(this.newLease.getFieldValue('ls.ls_id'), this.newLease.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
        				addToLeaseContacts(this.newLease.getFieldValue('ls.ls_id'), this.newLease.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
                        existLease = true;
                        for (var i = 0; i < this.refreshPanels.length; i++) {
                            View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
                        }
                        if (valueExists(this.callbackFunction)) {
                        	this.callbackFunction(this.newLease.getFieldValue('ls.ls_id'));
                        }
                        View.closeThisDialog();
                        break;
                	}
                }
            }
            if (!existLease) 
                View.showMessage(getMessage('error_leaseid'));
            
        }
        else {
        	if (this.saveLeaseRecord()){
				addToLeaseContacts(this.newLease.getFieldValue('ls.ls_id'), this.newLease.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
				addToLeaseContacts(this.newLease.getFieldValue('ls.ls_id'), this.newLease.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
	            for (var i = 0; i < this.refreshPanels.length; i++) {
	                View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
	            }
	            if (valueExists(this.callbackFunction)) {
	            	this.callbackFunction(this.newLease.getFieldValue('ls.ls_id'));
	            }
	            View.closeThisDialog();
        	}
        }
    },
    newLease_onCancel: function(){
        View.closeThisDialog();
    },

    saveLeaseRecord: function(){
    	try{
	    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
	    		var dataSource = this.newLease.getDataSource();
	    		var amountSecurityDep = this.newLease.getFieldValue('ls.amount_security');
	    		var lsId =  this.newLease.getFieldValue('ls.ls_id');
	    		var record = this.newLease.getRecord();
	    		if(valueExistsNotEmpty(amountSecurityDep)){
	    			amountSecurityDep = 1* amountSecurityDep;
		    		var result = Workflow.callMethod("AbCommonResources-CostService-convertCostToBudget", amountSecurityDep, View.user.userCurrency.code , 'Budget');
		    		var convertedValue = result.value;
		    		record.setValue('ls.amount_security', convertedValue);
	    		}
	    		dataSource.saveRecord(record);
	    		return true;
	    	}else{
	    		this.newLease.save();
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

	if (dataSource.getRecords('ls.ls_id = \'' + form.getFieldValue('ls.ls_id') + '\'').length > 0) {
        View.showMessage(getMessage('error_leaseid_exist'));
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
	var form = View.panels.get('newLease'); 
    var itemType = '';
	if(addNewLeaseController.itemType == 'BUILDING'){
		itemType = 'ls.bl_id'
	}else{
		itemType = 'ls.pr_id'
	}
	Ab.view.View.selectValue(
        'newLease', form.fields.get('ls.ls_parent_id').fieldDef.title, ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        [itemType,'ls.ls_id'],
		'ls.use_as_template = 0 and '+itemType +'= \''+this.addNewLeaseController.itemId+ '\' AND ls.lease_sublease !=  \'SUBLEASE\'', 'afterSelectParentLease', false, false, '', 1000, 500);
}

function afterSelectParentLease(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}


function onSelectLdContact(){
	onSelectContact('ls.ld_contact');
}

function onSelectTnContact(){
	onSelectContact('ls.tn_contact');
}

function onSelectContact(fieldName){
	var form = View.panels.get('newLease');

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
		var dataSource = View.dataSources.get('abRepmlsContacts_ds'); 
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
