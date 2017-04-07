var abRepmLeaseDetails_tabContactController = View.createController('abRepmLeaseDetails_tabContactController', {
	
	isLsContactsDef: false,
	
	itemType: 'lease',
	itemCode: null,

	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	
	refreshView: function(lsId){
		this.itemCode = lsId;
		var restriction = this.getRestriction(this.itemCode, this.itemType, this.isLsContactsDef);
		this.abRepmContact_list.refresh(restriction);
	},
	
	
	abRepmContact_list_afterRefresh: function(){
		var title = getMessage("titleListPanel").replace('{0}', getMessage('type_' + this.itemType.toLowerCase())).replace('{1}', this.itemCode);
		this.abRepmContact_list.setTitle(title);
	},
	
	getRestriction: function(itemId, itemType, isLsContactsDefined){
		var restriction = null;
		if (itemType.toLowerCase() === 'property') {
			restriction = new Ab.view.Restriction();
			restriction.addClause('contact.pr_id', itemId, '=');
		} else if (itemType.toLowerCase() === 'building') {
			restriction = new Ab.view.Restriction();
			restriction.addClause('contact.bl_id', itemId, '=');
		} else if (itemType.toLowerCase() === 'lease') {
			if (isLsContactsDefined) {
				restriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(itemId) + "' )";
			} else {
				restriction = new Ab.view.Restriction();
				restriction.addClause('contact.ls_id', itemId, '=');
			}
		}
		return restriction;
	}, 
	
	abRepmContact_list_onUnassign: function(){
		var selectedRows = this.abRepmContact_list.getSelectedRows();
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
				var restriction = controller.getRestriction(controller.itemCode, controller.itemType, controller.isLsContactsDef);
				controller.abRepmContact_list.refresh(restriction);
			}
		});
	},

	abRepmContact_list_onAssign: function(){
		var restriction = null;
		if (this.itemType.toLowerCase() == 'property') {
			restriction = "( contact.pr_id IS NULL OR contact.pr_id <> '" + convert2SafeSqlString(this.itemCode) + "' )"
		} else if (this.itemType.toLowerCase() == 'building') {
			restriction = "( contact.bl_id IS NULL OR contact.bl_id <> '" + convert2SafeSqlString(this.itemCode) + "' )"
		} else if (this.itemType.toLowerCase() == 'lease') {
			if (this.isLsContactsDef) {
				restriction = "NOT EXISTS(SELECT ls_contacts.contact_id FROM  ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(this.itemCode) + "' )";
			}else{
				restriction = "( contact.ls_id IS NULL OR contact.ls_id <> '" + convert2SafeSqlString(this.itemCode) + "' )"
			}
		}
		var controller = this;
		var buttonsCfg =  [
				{id: 'saveSelected', visible: true, title: getMessage('titleAssign')},
				{id: 'clear', visible: false, title: null}
		];
		
		View.openDialog('ab-contact.axvw', null, false, {
		    width: 1024, 
		    height: 800, 
		    closeButton: true,
		    maximize: false,	
		    restriction: restriction, 
		    isMultipleSelection: true,
		    buttonConfig: buttonsCfg,
		    callback: function(res){
		    	for (var i = 0; i < res.length; i++) {
			    	controller.onAssignContact(res[i]);
		    	}
		    	View.closeDialog();
		    }
		 });
		
	},
	
	abRepmContact_form_onDelete: function() {
		var controller = this;
		var contactId = this.abRepmContact_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmDelete'), function(button) {
			if (button == 'yes') {
				controller.onDeleteContact(contactId);
				var restriction = controller.getRestriction(controller.itemCode, controller.itemType, controller.isLsContactsDef);
				controller.abRepmContact_list.refresh(restriction);
				controller.abRepmContact_form.closeWindow();
			}
		});
	},
	
	abRepmContact_form_onUnAssign: function(){
		var controller = this;
		var contactId = this.abRepmContact_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmUnassign'), function(button) {
			if (button == 'yes') {
				if (controller.onUnassingContact(contactId)) {
					var restriction = controller.getRestriction(controller.itemCode, controller.itemType, controller.isLsContactsDef);
					controller.abRepmContact_list.refresh(restriction);
					controller.abRepmContact_form.closeWindow();
				}
			}
		});
	},
	
	onAssignContact: function(contactId){
		if (this.itemType.toLowerCase() == 'lease' && this.isLsContactsDef) {
			var record = new Ab.data.Record({
				'ls_contacts.ls_id': this.itemCode,
				'ls_contacts.contact_id': contactId
			}, true);
			this.abRepmlsContacts_ds.saveRecord(record);
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('contact.contact_id', contactId, '=');
			var record = this.abRepmContact_ds.getRecord(restriction);
			if (this.itemType.toLowerCase() === 'property') {
				record.setValue('contact.pr_id', this.itemCode);
			} else if (this.itemType.toLowerCase() === 'building') {
				record.setValue('contact.bl_id', this.itemCode);
			} else if (this.itemType.toLowerCase() === 'lease') {
				record.setValue('contact.ls_id', this.itemCode);
			}
			this.abRepmContact_ds.saveRecord(record);
		}
		this.abRepmContact_list.refresh(this.abRepmContact_list.restriction);
	},
	
	onUnassingContact: function(contactId){
		try {
			if (this.itemType.toLowerCase() == 'lease' && this.isLsContactsDef) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls_contacts.ls_id', this.itemCode, '=');
				restriction.addClause('ls_contacts.contact_id', contactId, '=');
				var record =  this.abRepmlsContacts_ds.getRecord(restriction);
				this.abRepmlsContacts_ds.deleteRecord(record);
			}else{
				var restriction = this.getRestriction(this.itemCode, this.itemType, false);
				restriction.addClause('contact.contact_id', contactId, '=');
				var record = this.abRepmContact_ds.getRecord(restriction);
				if (this.itemType.toLowerCase() === 'property') {
					record.setValue('contact.pr_id', '');
				} else if (this.itemType.toLowerCase() === 'building') {
					record.setValue('contact.bl_id', '');
				} else if (this.itemType.toLowerCase() === 'lease') {
					record.setValue('contact.ls_id', '');
				}
				this.abRepmContact_ds.saveRecord(record);
			}
			return true;
		} catch (e) {
			Workflow.handleError(e);
			return false;
		}
		
	},
	
	onDeleteContact: function(contactId){
		var result = false;
		
		if (this.itemType.toLowerCase() == 'lease' && this.isLsContactsDef) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_contacts.ls_id', this.itemCode, '=');
			restriction.addClause('ls_contacts.contact_id', contactId, '=');
			var record =  this.abRepmlsContacts_ds.getRecord(restriction);
			 this.abRepmlsContacts_ds.deleteRecord(record);
		}
		
		var restriction = this.getRestriction(this.itemCode, this.itemType, false);
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.abRepmContact_ds.getRecord(restriction);
		
		this.abRepmContact_ds.deleteRecord(record);
	}
});
