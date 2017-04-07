var abRepmLsTemplContactsController = View.createController('abRepmLsTemplContactsController', {
	
	isLsContactsDef: null,
	leaseId: null,
	restriction: null,
	
	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);

	},
	
	abRepmLsTemplContact_list_afterRefresh: function(){
		var title = getMessage("titleListPanel");
		this.abRepmLsTemplContact_list.setTitle(title);
	},
	
	getRestriction: function(lsId){
		this.leaseId = lsId;
		var restriction = null;
		if (this.isLsContactsDef) {
			restriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(this.leaseId) + "' )";
		} else {
			restriction = new Ab.view.Restriction();
			restriction.addClause('contact.ls_id', this.leaseId, '=');
		}
		this.restriction = restriction;
		return this.restriction;
	}, 
	
	abRepmLsTemplContact_list_onUnassign: function(){
		var selectedRows = this.abRepmLsTemplContact_list.getSelectedRows();
		if (selectedRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}
		var controller = this;
		View.confirm(getMessage('msgConfirmUnassign'), function(button) {
			if (button == 'yes') {
				for (var i = 0; i < selectedRows.length; i++) {
					var row = selectedRows[i].row;
					var contactId = row.getFieldValue('contact.contact_id');
					controller.onUnassingContact(contactId);
				}
				var restriction = controller.getRestriction(controller.leaseId);
				controller.abRepmLsTemplContact_list.refresh(restriction);
			}
		});
	},

	abRepmLsTemplContact_list_onAssign: function(){
		var restriction = null;
		if (this.isLsContactsDef) {
			restriction = "NOT EXISTS(SELECT ls_contacts.contact_id FROM  ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(this.leaseId) + "' )";
		}else{
			restriction = "( contact.ls_id IS NULL OR contact.ls_id <> '" + convert2SafeSqlString(this.leaseId) + "' )"
		}
		var controller = this;
		View.openDialog('ab-contact.axvw', null, false, {
		    width: 1024, 
		    height: 800, 
		    closeButton: true,
		    maximize: false,	
		    restriction: restriction, 
		    isMultipleSelection: true,
		    callback: function(res){
		    	for (var i = 0; i < res.length; i++) {
			    	controller.onAssignContact(res[i]);
		    	}
		    	View.closeDialog();
		    }
		 });
		
	},
	
	abRepmLsTemplContact_form_onDelete: function() {
		var controller = this;
		var contactId = this.abRepmLsTemplContact_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmDelete'), function(button) {
			if (button == 'yes') {
				controller.onDeleteContact(contactId);
				var restriction = controller.getRestriction(controller.leaseId);
				controller.abRepmLsTemplContact_list.refresh(restriction);
				controller.abRepmLsTemplContact_form.closeWindow();
			}
		});
	},
	
	abRepmLsTemplContact_form_onUnAssign: function(){
		var controller = this;
		var contactId = this.abRepmLsTemplContact_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmUnassign'), function(button) {
			if (button == 'yes') {
				if (controller.onUnassingContact(contactId)) {
					var restriction = controller.getRestriction(controller.leaseId);
					controller.abRepmLsTemplContact_list.refresh(restriction);
					controller.abRepmLsTemplContact_form.closeWindow();
				}
			}
		});
	},
	
	onAssignContact: function(contactId){
		if (this.isLsContactsDef) {
			var record = new Ab.data.Record({
				'ls_contacts.ls_id': this.leaseId,
				'ls_contacts.contact_id': contactId
			}, true);
			this.abRepmLsContacts_ds.saveRecord(record);
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('contact.contact_id', contactId, '=');
			var record = this.abRepmLsTemplContact_ds.getRecord(restriction);
			record.setValue('contact.ls_id', this.leaseId);
			this.abRepmLsTemplContact_ds.saveRecord(record);
		}
		this.abRepmLsTemplContact_list.refresh(this.abRepmLsTemplContact_list.restriction);
	},
	
	onUnassingContact: function(contactId){
		try {
			if (this.isLsContactsDef) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
				restriction.addClause('ls_contacts.contact_id', contactId, '=');
				var record =  this.abRepmLsContacts_ds.getRecord(restriction);
				this.abRepmLsContacts_ds.deleteRecord(record);
			}else{
				var restriction = this.getRestriction(this.itemCode, this.itemType, false);
				restriction.addClause('contact.contact_id', contactId, '=');
				var record = this.abRepmLsTemplContact_ds.getRecord(restriction);
				record.setValue('contact.ls_id', '');
				this.abRepmLsTemplContact_ds.saveRecord(record);
			}
			resetLeaseContacts(contactId, this.leaseId);
			View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').abRplmLsAdminLeaseTemplateLeaseTab_form.refresh(new Ab.view.Restriction({'ls.ls_id': this.leaseId}));
			return true;
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},
	
	onDeleteContact: function(contactId){
		var result = false;
		
		if (this.isLsContactsDef) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
			restriction.addClause('ls_contacts.contact_id', contactId, '=');
			var record =  this.abRepmLsContacts_ds.getRecord(restriction);
			this.abRepmLsContacts_ds.deleteRecord(record);
		}
		
		resetLeaseContacts(contactId, this.leaseId);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.abRepmContact_ds.getRecord(restriction);
		this.abRepmLsTemplContact_ds.deleteRecord(record);
	}
});


function resetLeaseContacts(contactId, leaseId){
	var dataSource = View.dataSources.get('abRepmLease_ds');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', leaseId, '=', 'AND', false);
	restriction.addClause('ls.tn_contact', contactId, '=', ')AND(', false);
	restriction.addClause('ls.ld_contact', contactId, '=', 'OR', false);
	var records = dataSource.getRecords(restriction);
	for (var i= 0; i < records.length; i++ )  {
		var rec = records[i];
		rec.isNew = false;
		if (rec.getValue('ls.tn_contact') == contactId) {
			rec.setValue('ls.tn_contact', '');
		}
		if (rec.getValue('ls.ld_contact') == contactId) {
			rec.setValue('ls.ld_contact', '');
		}
		dataSource.saveRecord(rec);
	}
}
