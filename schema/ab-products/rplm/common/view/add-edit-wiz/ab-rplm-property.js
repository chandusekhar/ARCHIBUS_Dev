var rplmPropertyController = View.createController('rplmProperty', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
	firstSave: true,
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
		if(this.action == 'ADD'){
			this.rplmPropertyOwnershipForm.setFieldValue('ot.date_sold', '');	
		}
		
    },
    
    rplmPropertyForm_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.rplmPropertyForm.setFieldLabel("property.value_book",getMessage("value_book_title") + ", " + View.user.userCurrency.description);
    		this.rplmPropertyForm.setFieldLabel("property.value_market",getMessage("value_market_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.rplmPropertyForm.setFieldLabel("property.value_book",getMessage("value_book_title"));
    		this.rplmPropertyForm.setFieldLabel("property.value_market",getMessage("value_market_title"));
    	}
    },
    
    rplmPropertyOwnershipForm_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.rplmPropertyOwnershipForm.setFieldLabel("ot.cost_purchase",getMessage("cost_purchase_title") + ", " + View.user.userCurrency.description);
    		this.rplmPropertyOwnershipForm.setFieldLabel("ot.cost_selling",getMessage("cost_selling_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.rplmPropertyOwnershipForm.setFieldLabel("ot.cost_purchase",getMessage("cost_purchase_title"));
    		this.rplmPropertyOwnershipForm.setFieldLabel("ot.cost_selling",getMessage("cost_selling_title"));
    	}
    },
    
    rplmPropertyForm_onSave: function(){
        if (this.contentDisabled) {
            return;
        }
        var itemId = this.rplmPropertyForm.getFieldValue('property.pr_id');
        if (this.itemType == 'LAND') {
            this.rplmPropertyForm.setFieldValue('property.property_type', 'Land');
            this.rplmPropertyForm.record.setValue('property.property_type', 'Land');
        }
        else 
            if (this.itemType == 'STRUCTURE') {
                this.rplmPropertyForm.setFieldValue('property.property_type', 'Structure');
                this.rplmPropertyForm.record.setValue('property.property_type', 'Structure');
            }
        
		if (!this.rplmPropertyForm.save()) {
            return false;
        }else
			this.firstSave = false;
			
		if(this.openerController.view.title == 'Action: Add New Land Property Code:  '|| this.openerController.view.title == 'Action: Add New Structure Property code:  '){
			this.openerController.view.setTitle(this.openerController.view.title+' '+this.rplmPropertyForm.getFieldValue('property.pr_id'));
		}
        this.itemId = itemId;
        
        if (this.itemIsOwned) {
            if (this.rplmPropertyOwnershipForm.getFieldValue('ot.ot_id') == '' ||
            this.rplmPropertyOwnershipForm.getFieldValue('ot.ot_id') == null) {
                var record = new Ab.data.Record({
                    'ot.pr_id': this.itemId,
                    'ot.cost_purchase': this.rplmPropertyOwnershipForm.getFieldValue('ot.cost_purchase'),
                    'ot.cost_selling': this.rplmPropertyOwnershipForm.getFieldValue('ot.cost_selling'),
                    'ot.status': this.rplmPropertyOwnershipForm.getFieldValue('ot.status'),
                    'ot.date_purchase': this.rplmPropertyOwnershipForm.getFieldValue('ot.date_purchase'),
                    'ot.date_sold': this.rplmPropertyOwnershipForm.getFieldValue('ot.date_sold'),
                    'ot.description': this.rplmPropertyOwnershipForm.getFieldValue('ot.description'),
                	'ot.comments': this.rplmPropertyOwnershipForm.getFieldValue('ot.comments')
                }, true);
                this.dsPropertyOwnership.saveRecord(record);
            }
            else {
                this.rplmPropertyOwnershipForm.save();
            }
            
        }
        this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
        this.rplmPropertyForm.refresh({
            'property.pr_id': this.itemId
        }, false);
        if (this.itemIsOwned) {
            this.rplmPropertyOwnershipForm.refresh('ot.pr_id = \'' + this.itemId + '\' AND ot.status NOT IN (\'disposed\') ', false);
        }
        this.rplmPropertyForm.enableButton('cancel', false);
        this.rplmPropertyForm.enableButton('finish', true);
        return true;
    },
    rplmPropertyForm_onCancel: function(){
        var tabsController = this.openerController;
        var tabsPanelId = (tabsController.id == 'portfAdminWizard' ? 'wizardTabs': 'leaseAdminTabs');
        View.confirm(getMessage('message_cancelconfirm'), function(button){
            if (button == 'yes') {
                tabsController.afterInitialDataFetch();
                tabsController.view.panels.get(tabsPanelId).tabs[0].loadView();
				tabsController.navigateToTab(0);
            }
            else{
				this.close();
			}
        })
    },
    rplmPropertyForm_onBack: function(){
        this.openerController.navigate('backward');
		if(!this.firstSave){
			if (this.openerController.id == 'portfAdminWizard') {
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemIsOwned = this.itemIsOwned;
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').action = 'EDIT';
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemId = this.rplmPropertyForm.getFieldValue('property.pr_id');
				this.firstSave = true;
			}else if(this.openerController.id == 'leaseAdminWizard'){
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemIsOwned = this.itemIsOwned;
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').action = 'EDIT';	
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemId = this.rplmPropertyForm.getFieldValue('property.pr_id');
				this.firstSave = true;
			}
		}
    },
    rplmPropertyForm_onContinue: function(){
		var controller = this;
        if (this.rplmPropertyForm.getFieldValue('property.ctry_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.regn_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.state_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.city_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.site_id').length == 0) {
			var message = getMessage('geo_warning_1');
			message += '\n'+getMessage('geo_warning_2');
        	message += '\n'+getMessage('geo_warning_3');
        	message += '\n'+getMessage('geo_warning_4');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    if (!controller.rplmPropertyForm_onSave()) {
                        return false;
                    }
					controller.firstSave = true;
                    controller.openerPanel.wizard.setAction(controller.action);
                    controller.openerPanel.wizard.setActionType(controller.actionType);
                    controller.openerPanel.wizard.setItemId(controller.itemId);
                    controller.openerPanel.wizard.setItemType(controller.itemType);
                    controller.openerPanel.wizard.setItemIsOwned(controller.itemIsOwned);
                    controller.openerPanel.wizard.setLeaseId(controller.leaseId);
                    controller.openerPanel.wizard.setLeaseType(controller.leaseType);
                    controller.openerController.navigate('forward');
                }
                else 
                    this.close();
            })
        }
        else {
			if (controller.rplmPropertyForm_onSave()) {
				controller.openerPanel.wizard.setAction(controller.action);
				controller.openerPanel.wizard.setActionType(controller.actionType);
				controller.openerPanel.wizard.setItemId(controller.itemId);
				controller.openerPanel.wizard.setItemType(controller.itemType);
				controller.openerPanel.wizard.setItemIsOwned(controller.itemIsOwned);
				controller.openerPanel.wizard.setLeaseId(controller.leaseId);
				controller.openerPanel.wizard.setLeaseType(controller.leaseType);
				controller.openerController.navigate('forward');
			}
        }
    },
    rplmPropertyForm_onFinish: function(){
       	 if(this.rplmPropertyForm.getFieldValue('property.ctry_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.regn_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.state_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.city_id').length == 0 || this.rplmPropertyForm.getFieldValue('property.site_id').length == 0) {
		 	var controller = this;
			var message = getMessage('geo_warning_1');
			message += '\n'+getMessage('geo_warning_2');
        	message += '\n'+getMessage('geo_warning_3');
        	message += '\n'+getMessage('geo_warning_4');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    controller.openerController.afterInitialDataFetch();
                    controller.openerPanel.tabs[0].loadView();
					controller.openerController.navigateToTab(0);
					controller.firstSave = true;
                }
                else 
                    this.close();
            })
        }
        else {
			this.openerPanel.tabs[0].loadView();
            this.openerController.navigateToTab(0);
			this.firstSave = true;
        }
    },
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    restoreSettings: function(){
        if (this.action == 'ADD' && this.itemId == null) {
            this.rplmPropertyForm.refresh(null, true);
            this.rplmPropertyOwnershipForm.refresh(null, true);
        }
        if (this.action == 'EDIT' || (this.action == 'ADD' && this.actionType == 'LEASE') ||
        (this.action == 'ADD' && this.itemId != null)) {
            this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
            this.rplmPropertyForm.enableField('property.pr_id', false);
            this.rplmPropertyOwnershipForm.enableField('ot.ot_id', false);
            this.rplmPropertyOwnershipForm.enableField('ot.pr_id', false);
            this.rplmPropertyForm.refresh({
                'property.pr_id': this.itemId
            }, false);
            this.rplmPropertyOwnershipForm.refresh({
                'ot.pr_id': this.itemId
            }, false);
        } else {
        	this.rplmPropertyForm.enableField('property.pr_id', true);
        }
        if (this.itemIsOwned) {
            this.rplmPropertyOwnershipForm.show(true, false);
        }
        else {
            this.rplmPropertyOwnershipForm.show(false, true);
        }
        if (this.openerPanel.tabsStatus[this.openerPanel.selectedTabName]) {
            this.rplmPropertyForm.enableButton('cancel', false);
            this.rplmPropertyForm.enableButton('finish', true);
        }
        else {
            this.rplmPropertyForm.enableButton('finish', false);
        }
    }
});
