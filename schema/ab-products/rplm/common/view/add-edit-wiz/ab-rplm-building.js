var rplmBuildingController = View.createController('rplmBuilding', {
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
			this.rplmBuildingOwnershipForm.setFieldValue('ot.date_sold','');			
		}
    },
    
    rplmBuildingForm_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.rplmBuildingForm.setFieldLabel("bl.value_book",getMessage("value_book_title") + ", " + View.user.userCurrency.description);
    		this.rplmBuildingForm.setFieldLabel("bl.value_market",getMessage("value_market_title") + ", " + View.user.userCurrency.description);
    		this.rplmBuildingForm.setFieldLabel("bl.cost_sqft",getMessage("cost_sqft_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.rplmBuildingForm.setFieldLabel("bl.value_book",getMessage("value_book_title"));
    		this.rplmBuildingForm.setFieldLabel("bl.value_market",getMessage("value_market_title"));
    		this.rplmBuildingForm.setFieldLabel("bl.cost_sqft",getMessage("cost_sqft_title"));
    	}
    },
    
    rplmBuildingOwnershipForm_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.rplmBuildingOwnershipForm.setFieldLabel("ot.cost_purchase",getMessage("cost_purchase_title") + ", " + View.user.userCurrency.description);
    		this.rplmBuildingOwnershipForm.setFieldLabel("ot.cost_selling",getMessage("cost_selling_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.rplmBuildingOwnershipForm.setFieldLabel("ot.cost_purchase",getMessage("cost_purchase_title"));
    		this.rplmBuildingOwnershipForm.setFieldLabel("ot.cost_selling",getMessage("cost_selling_title"));
    	}
    },
    
    rplmBuildingForm_onSave: function(){
        if (this.contentDisabled) {
            return;
        }
        var itemId = this.rplmBuildingForm.getFieldValue('bl.bl_id');
        if (!this.rplmBuildingForm.save()) {
            return false;
        }else{
			this.firstSave = false;
		}
		if(this.openerController.view.title == 'Action: Add New Building Building Code:  '){
			this.openerController.view.setTitle(this.openerController.view.title+' '+this.rplmBuildingForm.getFieldValue('bl.bl_id'));
		}
        this.itemId = itemId;
        
        if (this.itemIsOwned) {
            if (this.rplmBuildingOwnershipForm.getFieldValue('ot.ot_id') == '' ||
            this.rplmBuildingOwnershipForm.getFieldValue('ot.ot_id') == null) {
                var record = new Ab.data.Record({
                    'ot.bl_id': this.itemId,
                    'ot.cost_purchase': this.rplmBuildingOwnershipForm.getFieldValue('ot.cost_purchase'),
                    'ot.cost_selling': this.rplmBuildingOwnershipForm.getFieldValue('ot.cost_selling'),
                    'ot.status': this.rplmBuildingOwnershipForm.getFieldValue('ot.status'),
                    'ot.date_purchase': this.rplmBuildingOwnershipForm.getFieldValue('ot.date_purchase'),
                    'ot.date_sold': this.rplmBuildingOwnershipForm.getFieldValue('ot.date_sold'),
                    'ot.description': this.rplmBuildingOwnershipForm.getFieldValue('ot.description'),
                	'ot.comments': this.rplmBuildingOwnershipForm.getFieldValue('ot.comments')
                }, true);
                this.dsBuildingOwnership.saveRecord(record);
                var restriction = new Ab.view.Restriction();
                restriction.addClause('fl.bl_id', this.itemId, '=');
                if (this.dsFloor.getRecords(restriction).length == 0) {
                    var fl_record = new Ab.data.Record({
                        'fl.fl_id': '01',
                        'fl.bl_id': this.itemId,
                        'fl.name': 'Auto created floor'
                    }, true);
                    this.dsFloor.saveRecord(fl_record);
                }
                var restriction = new Ab.view.Restriction();
                restriction.addClause('su.bl_id', this.itemId, '=');
                if (this.dsSuite.getRecords(restriction).length == 0) {
                    var su_record = new Ab.data.Record({
                        'su.su_id': '001',
                        'su.name': null,
                        'su.description': null,
                        'su.facility_type_id': null,
                        'su.fl_id': '01',
                        'su.area_manual': this.rplmBuildingForm.getFieldValue('bl.area_gross_int'),
                        'su.bl_id': this.itemId
                    }, true)
                    this.dsSuite.saveRecord(su_record);
                }
            }
            else {
                this.rplmBuildingOwnershipForm.save();
            }
        }
        else {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('fl.bl_id', this.itemId, '=');
            if (this.dsFloor.getRecords(restriction).length == 0) {
                var fl_record = new Ab.data.Record({
                    'fl.fl_id': '01',
                    'fl.bl_id': this.itemId,
                    'fl.name': 'Auto created floor'
                }, true);
                this.dsFloor.saveRecord(fl_record);
            }
        }
        this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
        this.rplmBuildingForm.refresh({
            'bl.bl_id': this.itemId
        }, false);
        if (this.itemIsOwned) {
            this.rplmBuildingOwnershipForm.refresh('ot.bl_id = \'' + this.itemId + '\' AND ot.ot_id = (select MAX(x.ot_id) from ot x where x.bl_id = \'' + this.itemId + '\')', false);
        }
        this.rplmBuildingForm.enableButton('cancel', false);
        this.rplmBuildingForm.enableButton('finish', true);
        return true;
    },
    rplmBuildingForm_onCancel: function(){
        var tabsController = this.openerController;
        var tabsPanelId = (tabsController.id == 'portfAdminWizard' ? 'wizardTabs': 'leaseAdminTabs');
        View.confirm(getMessage('message_cancelconfirm'), function(button){
            if (button == 'yes') {
               tabsController.view.panels.get(tabsPanelId).tabs[0].loadView();
               tabsController.afterInitialDataFetch();
               tabsController.navigateToTab(0);
            }
            else 
                this.close();
        })
    },
    rplmBuildingForm_onBack: function(){
		this.openerController.navigate('backward');
		if(!this.firstSave){
			if (this.openerController.id == 'portfAdminWizard') {
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemIsOwned = this.itemIsOwned;
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').action = 'EDIT';
				this.openerController.wizardTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemId = this.rplmBuildingForm.getFieldValue('bl.bl_id');
				this.firstSave = true;
			}else if(this.openerController.id == 'leaseAdminWizard'){
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemIsOwned = this.itemIsOwned;
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').action = 'EDIT';	
				this.openerController.leaseAdminTabs.tabs[1].getContentFrame().View.controllers.get('rplmOwnership').itemId = this.rplmBuildingForm.getFieldValue('bl.bl_id');
				this.firstSave = true;
			}
		}
    },
    rplmBuildingForm_onContinue: function(){
		var controller = this;
        if (this.rplmBuildingForm.getFieldValue('bl.ctry_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.regn_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.state_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.city_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.site_id').length == 0) {
			var message = getMessage('geo_warning_1');
			message += '\n'+getMessage('geo_warning_2');
        	message += '\n'+getMessage('geo_warning_3');
        	message += '\n'+getMessage('geo_warning_4');
            View.confirm(message, function(button){
                if (button == 'yes') {
                    if (!controller.rplmBuildingForm_onSave()) {
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
			if (controller.rplmBuildingForm_onSave()) {
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
    rplmBuildingForm_onFinish: function(){
        if (this.rplmBuildingForm.getFieldValue('bl.ctry_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.regn_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.state_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.city_id').length == 0 || this.rplmBuildingForm.getFieldValue('bl.site_id').length == 0) {
			var controller = this;
			var message = getMessage('geo_warning_1');
			message += '\n'+getMessage('geo_warning_2');
        	message += '\n'+getMessage('geo_warning_3');
        	message += '\n'+getMessage('geo_warning_4');
            View.confirm(message, function(button){
                if (button == 'yes') {
					controller.openerPanel.tabs[0].loadView();
                    controller.openerController.afterInitialDataFetch();
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
            this.rplmBuildingForm.refresh(null, true);
            this.rplmBuildingOwnershipForm.refresh(null, true);
        }
        if (this.action == 'EDIT' || (this.action == 'ADD' && this.actionType == 'LEASE') ||
		(this.action == 'ADD' && this.itemId != null)) {
			this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
            this.rplmBuildingForm.enableField('bl.bl_id', false);
            this.rplmBuildingOwnershipForm.enableField('ot.ot_id', false);
            this.rplmBuildingOwnershipForm.enableField('ot.bl_id', false);
            this.rplmBuildingForm.refresh({
                'bl.bl_id': this.itemId
            }, false);
            this.rplmBuildingOwnershipForm.refresh({
                'ot.bl_id': this.itemId
            }, false);
        }else{
        	this.rplmBuildingForm.enableField('bl.bl_id', true);
        }
        if (this.itemIsOwned) {
            this.rplmBuildingOwnershipForm.show(true, false);
        }
        else {
            this.rplmBuildingOwnershipForm.show(false, true);
        }
        if (this.openerPanel.tabsStatus[this.openerPanel.selectedTabName]) {
            this.rplmBuildingForm.enableButton('cancel', false);
            this.rplmBuildingForm.enableButton('finish', true);
        }
        else {
            this.rplmBuildingForm.enableButton('finish', false);
        }
    }
})
