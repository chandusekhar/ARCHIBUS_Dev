var abRepmContactsController = View.createController('abRepmContactsController', {
	
	isLsContactsDef: false,
	
	itemType: null,
	itemCode: null,

	openerController: null,
    openerPanel: null,
    wizard: null,

    type: null,
    action: null,
    actionType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    contentDisabled: null,
    

	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	
	afterInitialDataFetch: function(){
		var openerView = this.getOpenerView('portfAdminWizard');
        if (openerView != undefined) {
            this.openerController = openerView.controllers.get('portfAdminWizard');
            this.openerPanel = openerView.panels.get('wizardTabs');
        }
        var openerView = this.getOpenerView('leaseAdminWizard');
        if (openerView != undefined) {
            this.openerController = openerView.controllers.get('leaseAdminWizard');
            this.openerPanel = openerView.panels.get('leaseAdminTabs');
        }
        var openerView = this.getOpenerView('tabsLeaseAdminMngByLocation');
        if (openerView != undefined) {
			this.panelContactAction.show(false, true);
            this.openerController = openerView.controllers.get('tabsLeaseAdminMngByLocation');
            this.openerPanel = openerView.panels.get('tabsLeaseAdminMngByLocation');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
	},
	
	getOpenerView: function(controllerName){
		if (View.controllers.get(controllerName) != undefined) {
			return View;
		} else if (View.getOpenerView().controllers.get(controllerName) != undefined){
			return View.getOpenerView();
		}
	},
	
	abRepmContact_list_afterRefresh: function(){
		//var title = getMessage("titleListPanel").replace('{0}', getMessage('type_' + this.itemType.toLowerCase())).replace('{1}', this.itemCode);
		var title = getMessage("titleListPanel");
		this.abRepmContact_list.setTitle(title);
	},
	
	getRestriction: function(itemId, itemType, isLsContactsDefined){
		var restriction = null;
		if (itemType.toLowerCase() === 'structure' 
				|| itemType.toLowerCase() === 'land' 
					|| itemType.toLowerCase() === 'property') {
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
				if (controller.actionType.toLowerCase() == 'lease') {
					restriction = controller.getRestriction(controller.leaseId, controller.actionType, controller.isLsContactsDef);
				}
				controller.abRepmContact_list.refresh(restriction);
			}
		});
	},

	abRepmContact_list_onAssign: function(){
		var restriction = null;
		if (this.itemType.toLowerCase() == 'property'
			|| this.itemType.toLowerCase() === 'land'
				|| this.itemType.toLowerCase() === 'structure') {
			restriction = "( contact.pr_id IS NULL OR contact.pr_id <> '" + convert2SafeSqlString(this.itemCode) + "' )"
		} else if (this.itemType.toLowerCase() == 'building') {
			restriction = "( contact.bl_id IS NULL OR contact.bl_id <> '" + convert2SafeSqlString(this.itemCode) + "' )"
		} else if (this.actionType.toLowerCase() == 'lease') {
			if (this.isLsContactsDef) {
				restriction = "NOT EXISTS(SELECT ls_contacts.contact_id FROM  ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(this.leaseId) + "' )";
			}else{
				restriction = "( contact.ls_id IS NULL OR contact.ls_id <> '" + convert2SafeSqlString(this.leaseId) + "' )"
			}
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
	
	abRepmContact_form_onDelete: function() {
		var controller = this;
		var contactId = this.abRepmContact_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmDelete'), function(button) {
			if (button == 'yes') {
				controller.onDeleteContact(contactId);
				var restriction = controller.getRestriction(controller.itemCode, controller.itemType, controller.isLsContactsDef);
				if (controller.actionType.toLowerCase() == 'lease') {
					restriction = controller.getRestriction(controller.leaseId, controller.actionType, controller.isLsContactsDef);
				}
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
					if (controller.actionType.toLowerCase() == 'lease') {
						restriction = controller.getRestriction(controller.leaseId, controller.actionType, controller.isLsContactsDef);
					}
					controller.abRepmContact_list.refresh(restriction);
					controller.abRepmContact_form.closeWindow();
				}
			}
		});
	},
	
	onAssignContact: function(contactId){
		if (this.actionType.toLowerCase() == 'lease' && this.isLsContactsDef) {
			var record = new Ab.data.Record({
				'ls_contacts.ls_id': this.leaseId,
				'ls_contacts.contact_id': contactId
			}, true);
			this.abRepmlsContacts_ds.saveRecord(record);
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('contact.contact_id', contactId, '=');
			var record = this.abRepmContact_ds.getRecord(restriction);
			if (this.itemType.toLowerCase() === 'property'
					|| this.itemType.toLowerCase() === 'land'
						|| this.itemType.toLowerCase() === 'structure') {
				record.setValue('contact.pr_id', this.itemCode);
			} else if (this.itemType.toLowerCase() === 'building') {
				record.setValue('contact.bl_id', this.itemCode);
			} else if (this.actionType.toLowerCase() === 'lease') {
				record.setValue('contact.ls_id', this.leaseId);
			}
			this.abRepmContact_ds.saveRecord(record);
		}
		this.abRepmContact_list.refresh(this.abRepmContact_list.restriction);
	},
	
	onUnassingContact: function(contactId){
		try {
			if (this.actionType.toLowerCase() == 'lease' && this.isLsContactsDef) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
				restriction.addClause('ls_contacts.contact_id', contactId, '=');
				var record =  this.abRepmlsContacts_ds.getRecord(restriction);
				this.abRepmlsContacts_ds.deleteRecord(record);
			}else{
				var restriction = this.getRestriction(this.itemCode, this.itemType, false);
				restriction.addClause('contact.contact_id', contactId, '=');
				var record = this.abRepmContact_ds.getRecord(restriction);
				if (this.itemType.toLowerCase() === 'property'
					|| this.itemType.toLowerCase() === 'land'
						|| this.itemType.toLowerCase() === 'structure') {
					record.setValue('contact.pr_id', '');
				} else if (this.itemType.toLowerCase() === 'building') {
					record.setValue('contact.bl_id', '');
				} else if (this.actionType.toLowerCase() === 'lease') {
					record.setValue('contact.ls_id', '');
				}
				this.abRepmContact_ds.saveRecord(record);
			}
			// if is landlord or tenant contact - update lease table
			if (this.actionType.toLowerCase() == 'lease') {
				resetLeaseContacts(contactId, this.leaseId);
			}
			return true;
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},
	
	onDeleteContact: function(contactId){
		var result = false;
		
		if (this.actionType.toLowerCase() == 'lease' && this.isLsContactsDef) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
			restriction.addClause('ls_contacts.contact_id', contactId, '=');
			var record =  this.abRepmlsContacts_ds.getRecord(restriction);
			 this.abRepmlsContacts_ds.deleteRecord(record);
		}
		
		// if is landlord or tenant contact - update lease table
		if (this.actionType.toLowerCase() == 'lease') {
			resetLeaseContacts(contactId, this.leaseId);
		}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.abRepmContact_ds.getRecord(restriction);
		this.abRepmContact_ds.deleteRecord(record);
	},
	
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;

        this.itemCode = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();

        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    
    restoreSettings: function(){
    	var openerView = this.getOpenerView('tabsLeaseAdminMngByLocation');
		if (openerView != undefined && openerView.controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
			this.panelContactAction.show(false, true);
		}

		/*
         * hide continue button if is portfolio administration
         */
        if (this.actionType.toLowerCase() != 'lease' || this.type.toLowerCase() =='portfolio') {
            this.panelContactAction.actions.items[this.panelContactAction.actions.indexOfKey('continue')].show(false);
        }
        
        var restriction = null;
        if (this.actionType.toLowerCase() == 'lease') {
            restriction = this.getRestriction(this.leaseId, this.actionType, this.isLsContactsDef);
        } else {
            restriction = this.getRestriction(this.itemCode, this.itemType, this.isLsContactsDef);
        }
        this.abRepmContact_list.refresh(restriction);

    },
    
    panelContactAction_onBack: function(){
        this.openerController.navigate('backward');
    },
    panelContactAction_onContinue: function(){
        this.openerController.navigate('forward');
    },
    panelContactAction_onFinish: function(){
        this.openerController.afterInitialDataFetch();
		this.openerPanel.tabs[0].loadView();
        this.openerController.navigateToTab(0);
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
