var abRplmLsAdminLeaseTemplateLeaseTab_ctrl = View.createController('abRplmLsAdminLeaseTemplateLeaseTab_ctrl', {
	
	isLsContactsDef: null,

	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	
	//enable/disable ls_parent_id field if lease_sublease has SUBLEASE/(LEASE or N/A) value
    setParentLease: function(){
        if (this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.lease_sublease') == 'SUBLEASE') {
            this.abRplmLsAdminLeaseTemplateLeaseTab_form.enableField('ls.ls_parent_id', true);
        }
        else {
            this.abRplmLsAdminLeaseTemplateLeaseTab_form.enableField('ls.ls_parent_id', false);
        }
    },
    
    abRplmLsAdminLeaseTemplateLeaseTab_form_onSave: function(){
    	if (this.abRplmLsAdminLeaseTemplateLeaseTab_form.canSave()) {
    		this.abRplmLsAdminLeaseTemplateLeaseTab_form.save();
			addToLeaseContacts(this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.ls_id'), this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
			addToLeaseContacts(this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.ls_id'), this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
			var contactsController = View.controllers.get('abRepmLsTemplContactsController');
			contactsController.abRepmLsTemplContact_list.refresh(contactsController.getRestriction(this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.ls_id')));
    	}
    }
    
});

function abRplmLsAdminLeaseTemplateLeaseTab_form_afterRefresh(){
	abRplmLsAdminLeaseTemplateLeaseTab_ctrl.setParentLease();
	
	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
		abRplmLsAdminLeaseTemplateLeaseTab_ctrl.abRplmLsAdminLeaseTemplateLeaseTab_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + ", " + View.user.userCurrency.description);
	}else{
		abRplmLsAdminLeaseTemplateLeaseTab_ctrl.abRplmLsAdminLeaseTemplateLeaseTab_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
	}
}


function selectParentLease() {
   
	Ab.view.View.selectValue(
        'abRplmLsAdminLeaseTemplateLeaseTab_form', 'Parent Lease', ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        ['ls.ls_id'],
        'ls.use_as_template = 0  AND ls.lease_sublease !=  \'SUBLEASE\'', '', false, false, '', 300, 500);
}

function onSelectLdContact(){
	onSelectContact('ls.ld_contact');
}

function onSelectTnContact(){
	onSelectContact('ls.tn_contact');
}

function onSelectContact(fieldName){
	var form = View.panels.get('abRplmLsAdminLeaseTemplateLeaseTab_form');

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