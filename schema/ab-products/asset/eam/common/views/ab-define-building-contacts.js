var abDefineBuilding_tabContactsController = View.createController('abDefineBuilding_tabContactsController', {
	blId: null,
	
	restriction: null,
	
	newRecord: null,
	
	afterInitialDataFetch: function () {
		this.refreshRestriction();
	},
	
	refreshRestriction: function() {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
			this.blId = this.restriction.clauses[0].value;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_contacts.refresh(null, this.newRecord);
			this.abDefineBuilding_contactsGrid.newRecord = this.newRecord;
			this.abDefineBuilding_contactsGrid.show(false);
		} else {
			this.abDefineBuilding_contacts.refresh(this.restriction);
			this.abDefineBuilding_contactsGrid.refresh(this.restriction);
		}
	},
	
	abDefineBuilding_contactsGrid_onAssign: function(){
		var restriction = "( contact.bl_id IS NULL OR contact.bl_id <> '" + convert2SafeSqlString(this.blId) + "' )"

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
	
	abDefineBuilding_contactsGrid_onUnassign: function(){
		var selectedRows = this.abDefineBuilding_contactsGrid.getSelectedRows();
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
				controller.abDefineBuilding_contactsGrid.refresh(controller.restriction);
			}
		});
	},

	onAssignContact: function(contactId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.ds_abDefineBuildingContacts_contacts.getRecord(restriction);
		record.setValue('contact.bl_id', this.blId);
		this.ds_abDefineBuildingContacts_contacts.saveRecord(record);
	
		this.abDefineBuilding_contactsGrid.refresh(this.abDefineBuilding_contactsGrid.restriction);
	},
	
	onUnassingContact: function(contactId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.bl_id', this.blId, '=');
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.ds_abDefineBuildingContacts_contacts.getRecord(restriction);
		record.setValue('contact.bl_id', '');
		this.ds_abDefineBuildingContacts_contacts.saveRecord(record);
		
		this.abDefineBuilding_contactsGrid.refresh(this.abDefineBuilding_contactsGrid.restriction);
	}
});

function setNewRestrictionForTabs() {
	var form = abDefineBuilding_tabContactsController.abDefineBuilding_contacts;
	setRestrictionForTabs(abDefineBuilding_tabContactsController, form);
}