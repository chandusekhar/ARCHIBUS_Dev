var abPropertiesDefineForm_tabContactsController = View.createController('abPropertiesDefineForm_tabContactsController', {
	prId: null,
	
	afterInitialDataFetch: function () {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		if(newRecord){
			this.abPropertiesDefineForm_contacts.newRecord = newRecord;
			this.abPropertiesDefineForm_contacts.show(false);
			this.abPropertiesDefineForm_contactsGrid.show(false);
		}else{
			if(tabsRestriction){
				if(tabsRestriction["property.pr_id"]) {
					restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
					this.prId = tabsRestriction["property.pr_id"];
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
					this.prId = tabsRestriction.clauses[0].value;
				}
			}
			this.abPropertiesDefineForm_contacts.refresh(restriction);
			this.abPropertiesDefineForm_contactsGrid.refresh(restriction);
		}
	},
	
	abPropertiesDefineForm_contacts_beforeRefresh: function() {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		
		if(tabs) {
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abPropertiesDefineForm_contacts.newRecord = newRecord;
				this.abPropertiesDefineForm_contacts.show(false);
				this.abPropertiesDefineForm_contactsGrid.show(false);
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["property.pr_id"]) {
						restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
						this.prId = tabsRestriction["property.pr_id"];
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
						this.prId = tabsRestriction.clauses[0].value;
					}
				}
				this.abPropertiesDefineForm_contacts.restriction = restriction;
				this.abPropertiesDefineForm_contactsGrid.refresh(restriction);
			}
		}
	},
	
	abPropertiesDefineForm_contacts_onSave: function() {
		var propertyForm = this.abPropertiesDefineForm_contacts;
		if (valueExistsNotEmpty(propertyForm.record.getValue("property.pr_id"))) {
			beforeSaveProperty(this);
			var isSaved = propertyForm.save();
			setTimeout(function(){
				if (isSaved){
					afterSaveProperty(abPropertiesDefineForm_tabContactsController, propertyForm);
					propertyForm.refresh();
				}
			}, 1000);
		} else {
			View.alert(getMessage("missingPrId"));
		}
	},
	
	abPropertiesDefineForm_contactsGrid_onAssign: function(){
		var restriction = "( contact.pr_id IS NULL OR contact.pr_id <> '" + convert2SafeSqlString(this.prId) + "' )"

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
	
	abPropertiesDefineForm_contactsGrid_onUnassign: function(){
		var selectedRows = this.abPropertiesDefineForm_contactsGrid.getSelectedRows();
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
				var restriction = controller.getRestriction(controller.prId, controller.itemType, controller.isLsContactsDef);
				if (controller.actionType.toLowerCase() == 'lease') {
					restriction = controller.getRestriction(controller.leaseId, controller.actionType, controller.isLsContactsDef);
				}
				controller.abPropertiesDefineForm_contactsGrid.refresh(restriction);
			}
		});
	},

	onAssignContact: function(contactId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.ds_abPropertiesDefineFormContacts.getRecord(restriction);
		record.setValue('contact.pr_id', this.prId);
		this.ds_abPropertiesDefineFormContacts.saveRecord(record);
	
		this.abPropertiesDefineForm_contactsGrid.refresh(this.abPropertiesDefineForm_contactsGrid.restriction);
	},
	
	onUnassingContact: function(contactId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.pr_id', this.prId, '=');
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.ds_abPropertiesDefineFormContacts.getRecord(restriction);
		record.setValue('contact.pr_id', '');
		this.ds_abPropertiesDefineFormContacts.saveRecord(record);
		
		this.abPropertiesDefineForm_contactsGrid.refresh(this.abPropertiesDefineForm_contactsGrid.restriction);
	}
});