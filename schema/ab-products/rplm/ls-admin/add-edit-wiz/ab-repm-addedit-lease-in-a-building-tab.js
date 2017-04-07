/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 */
function afterGeneratingTreeNode(treeNode){

    if (treeNode.level.levelIndex == 3) {
        var label = treeNode.data['ls.ls_parent_id'];
        treeNode.restriction.addClause('ls.ls_parent_id', treeNode.data['ls.ls_parent_id']);
        treeNode.setUpLabel(label);
    }
}

/**
 * Update tree panel title with selected node title
 */
function updateTreeTitle(){
	try{
		var treePanel = View.panels.get("abRepmAddEditLeaseInABuildingCtryTree");
		var lastNodeClicked = treePanel.lastNodeClicked;
		var title = getMessage("tree_panel_title");
		if (lastNodeClicked.level.levelIndex == 2) {
			title += " " + lastNodeClicked.data["bl.bl_id"];
		} else if (lastNodeClicked.level.levelIndex == 3) {
			title += " " + lastNodeClicked.data["ls.ls_parent_id"];
		} else if (lastNodeClicked.level.levelIndex == 4) {
			title += " " + lastNodeClicked.data["ls.ls_id"];
		}
		treePanel.setTitle(title);
		return true;
	} catch (e){
		Workflow.handleError(e)
		return false;
	}
}

/**
 * Controller.
 */
var abRepmAddEditLeaseInABuilding_ctrl = View.createController('abRepmAddEditLeaseInABuilding_ctrl', {
	
	blId: null,
	
	regnId: null,
	
	siteId: null,
	
    leaseId: null,
    
    isLsContactsDef: false,
    
	afterViewLoad:function(){
		this.menuParent = Ext.get('addEdit');
		this.menuParent.on('click', this.showMenu, this, null);
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);
	},
	
	afterInitialDataFetch: function(){
		// set user country code to console field
		this.abRepmAddEditLeaseInABuildingConsole.setFieldValue("bl.ctry_id", this.view.user.country);
	},
	
	
	showMenu: function(e, item){
        var menuItem = null;
        var menuItems = [];
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addNew_lease')),
            handler: this.addNew_lease.createDelegate(this)
        });
        menuItems.push(menuItem);
        menuItem = new Ext.menu.Item({
            text: getMessage(getMessage('addEdit_bldgs')),
            handler: this.open_addEditBuildings.createDelegate(this)
        });
        menuItems.push(menuItem);
		menuItem = new Ext.menu.Item({
            text: getMessage('addEdit_geographical'),
            handler: this.open_addEditGeographicalLocations.createDelegate(this)
        });
        menuItems.push(menuItem);
		
		var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.show(this.menuParent, 'tl-bl?');
	},
	
	/**
	 * open 'Define Geographical Locations' view
	 */
    open_addEditGeographicalLocations:function(){
		
		var editMode = false;
		var country = "";
		var region = "";
		var state = "";
		var city = "";
		var site = "";
		
		if(this.abRepmAddEditLeaseInABuildingLease_form.visible){
			editMode = true;
			var treeSelection = this.getTreeSelection();
			country = treeSelection['country'];
			region = treeSelection['region'];
			state = treeSelection['state'];
			city = treeSelection['city'];
			site = treeSelection['site'];
		}
				
		View.openDialog('ab-def-geo-loc.axvw', null, true, {
				width: 1200,
				height: 600,
				closeButton: false,
				afterInitialDataFetch: function(dialogView){
					if(editMode){
						var dialogController = dialogView.controllers.get('ctrlAbDefGeoLoc');
						var consolePanel = dialogController.console_AbDefGeoLoc;
						consolePanel.setFieldValue('site.ctry_id', country);
						consolePanel.setFieldValue('site.regn_id', region);
						consolePanel.setFieldValue('site.state_id', state);
						consolePanel.setFieldValue('site.city_id', city);
						consolePanel.setFieldValue('site.site_id', site);
						dialogController.refreshTree.createDelegate(dialogController)();
						
						var treePanel = dialogController.tree_geo_AbDefGeoLoc;
						
						// This is an anonymous function which will expand all the tree nodes
                        (function(treeNode){
							if (!treeNode.isRoot()) {
								treePanel.refreshNode(treeNode);
								treeNode.expand();
							}
                            if(treeNode.hasChildren()){
                                for(i=0; i<treeNode.children.length; i++){
                                    var node = treeNode.children[i];
                                    arguments.callee(node);
                                }
                            }
                        })(dialogController.tree_geo_AbDefGeoLoc.treeView.getRoot());
					}
				}
			});
	},
	
	/**
	 * open 'Define Locations' view
	 */
	open_addEditBuildings:function(){
		var editMode = false;
		var building = "";
		var site = "";
        
        if (this.abRepmAddEditLeaseInABuildingLease_form.visible) {
            editMode = true;
            var treeSelection = this.getTreeSelection();
            building = treeSelection['building'];
			site = treeSelection['site'];
        }
        
        View.openDialog('ab-sp-def-loc.axvw', null, true, {
            width: 1200,
            height: 600,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                if (editMode) {
					var dialogController = dialogView.controllers.get('defineLocationFL');
					var consolePanel = dialogController.sbfFilterPanel;
					var treePanel = dialogController.site_tree;
					consolePanel.setFieldValue('fl.bl_id', building);
					consolePanel.setFieldValue('bl.site_id', site);
					dialogController.refreshTreeview.createDelegate(dialogController)();
						// This is an anonymous function which will expand all the tree nodes
                        (function(treeNode){
							if (!treeNode.isRoot()) {
								treePanel.refreshNode(treeNode);
								treeNode.expand();
							}
                            if(treeNode.hasChildren()){
                                for(i=0; i<treeNode.children.length; i++){
                                    var node = treeNode.children[i];
                                    arguments.callee(node);
                                }
                            }
                        })(dialogController.site_tree.treeView.getRoot());
				}
            }
        });
	},

	/**
	 * return in a JSON object the country , state , city and building selected from the tree
	 */
	
	getTreeSelection:function(){
		var treeSelection = {};
		var lastNodeClicked = this.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;
		if(lastNodeClicked.level.levelIndex == 3){
			treeSelection = {
				'building':lastNodeClicked.parent.data['bl.bl_id'],
				'region':lastNodeClicked.parent.data['bl.regn_id'],
				'site':lastNodeClicked.parent.data['bl.site_id'],
				'city':lastNodeClicked.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.data['ctry.ctry_id']
			};
		}else if (lastNodeClicked.level.levelIndex == 4){
			treeSelection = {
				'building':lastNodeClicked.parent.parent.data['bl.bl_id'],
				'region':lastNodeClicked.parent.parent.data['bl.regn_id'],
				'site':lastNodeClicked.parent.parent.data['bl.site_id'],
				'city':lastNodeClicked.parent.parent.parent.data['city.city_id'],
				'state':lastNodeClicked.parent.parent.parent.data['city.state_id.key'],
				'country':lastNodeClicked.parent.parent.parent.parent.data['ctry.ctry_id']
			};
		}
		return treeSelection;
	},
	
	
	addNew_lease: function(){
        var lastNodeClicked = this.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;
        if ((lastNodeClicked == null) || ((lastNodeClicked.level.levelIndex != 2) && (lastNodeClicked.level.levelIndex != 3))) {
            View.showMessage(getMessage('err_selection'));
            return;
        } else if (lastNodeClicked.level.levelIndex == 2) {
            hidePanels();
        	// if building is selected in tree
            this.abRepmAddEditLeaseInABuildingLease_form.refresh(null, true);
        } else if (lastNodeClicked.level.levelIndex == 3) {
            var landlord_tenant = this.abRepmAddEditLeaseInABuildingLease_form.getFieldValue('ls.landlord_tenant');
            if (landlord_tenant == 'LANDLORD') {
                View.showMessage(getMessage('err_ls_landlord'));
                return;
            }
            hidePanels();
            this.abRepmAddEditLeaseInABuildingLease_form.refresh(null, true);
        }
    },
    
    /**
     * Lease form after refresh event
     */
    abRepmAddEditLeaseInABuildingLease_form_afterRefresh: function(){
    	// set title 
    	if (this.abRepmAddEditLeaseInABuildingLease_form.newRecord) {
    		this.abRepmAddEditLeaseInABuildingLease_form.setTitle(getMessage("titleAddLease"));
    	}else {
    		this.abRepmAddEditLeaseInABuildingLease_form.setTitle(getMessage("titleEditLease"));
    	}
    	// set some values for new lease
    	if (this.abRepmAddEditLeaseInABuildingLease_form.newRecord) {
    		var lastNodeClicked = this.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked;
    		if (lastNodeClicked.level.levelIndex == 2) {
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.bl_id', lastNodeClicked.data['bl.bl_id']);
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.lease_sublease', 'LEASE');
                
                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.lease_sublease', false);
                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.ls_parent_id', false);
                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.landlord_tenant', true);
    		}else if (lastNodeClicked.level.levelIndex == 3){
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.bl_id', lastNodeClicked.parent.data['bl.bl_id']);
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.lease_sublease', 'SUBLEASE');
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.landlord_tenant', 'LANDLORD');
                this.abRepmAddEditLeaseInABuildingLease_form.setFieldValue('ls.ls_parent_id', lastNodeClicked.data['ls.ls_parent_id']);

                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.lease_sublease', false);
                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.landlord_tenant', false);
                this.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.ls_parent_id', false);
    		}
    	}
    	
    	// landlord tenant remove 'N\A' and 'BOTH' values
    	var objLandlordTenantField = this.abRepmAddEditLeaseInABuildingLease_form.fields.get("ls.landlord_tenant");
    	for (var i=0; i < objLandlordTenantField.dom.options.length; i++) {
    		if (objLandlordTenantField.dom.options[i].value == 'N/A' 
    			|| objLandlordTenantField.dom.options[i].value == 'BOTH' ) {
    			objLandlordTenantField.dom.remove(i);
    		}
    	}
    	
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.abRepmAddEditLeaseInABuildingLease_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.abRepmAddEditLeaseInABuildingLease_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
    	}
    },

    /**
     * Lease form on save 
     */
    abRepmAddEditLeaseInABuildingLease_form_onSave: function(){
    	var form  = this.abRepmAddEditLeaseInABuildingLease_form;
    	var isNewRecord = form.newRecord;
    	
    	if (!form.canSave()) {
    		return false;
    	}
    	
        if (!datesValidated(form, 'ls.date_start', 'ls.date_end', getMessage('error_date_end_before_date_start'))) {
        	return false;
        }
        
        if (!datesValidated(form, 'ls.date_start', 'ls.date_move', getMessage('error_date_move_before_date_start'))) {
        	return false;
        }
        
        if(this.saveLeaseRecord() && isNewRecord){
            var treePanel = this.abRepmAddEditLeaseInABuildingCtryTree;
            refreshTreePanelAfterUpdate(treePanel.lastNodeClicked);
            selectNewAddedTreeNode(treePanel.lastNodeClicked, form.getFieldValue('ls.ls_id'));
            showDetails(treePanel.lastNodeClicked);
            treePanel.setTitle(getMessage('tree_panel_title') + ' ' + form.getFieldValue('ls.ls_id'));
        }
        
		addToLeaseContacts(form.getFieldValue('ls.ls_id'), form.getFieldValue('ls.tn_contact'), this.isLsContactsDef);
		addToLeaseContacts(form.getFieldValue('ls.ls_id'), form.getFieldValue('ls.ld_contact'), this.isLsContactsDef);
		this.abRepmAddEditLeaseInABuildingContacts_grid.refresh(this.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
        
    },
    
    saveLeaseRecord: function(){
    	var form = this.abRepmAddEditLeaseInABuildingLease_form;
    	try{
	    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
	    		var dataSource = form.getDataSource();
	    		var amountSecurityDep = form.getFieldValue('ls.amount_security');
	    		var lsId =  form.getFieldValue('ls.ls_id');
	    		var record = form.getRecord();
	    		if(valueExistsNotEmpty(amountSecurityDep)){
	    			amountSecurityDep = 1* amountSecurityDep;
		    		var result = Workflow.callMethod("AbCommonResources-CostService-convertCostToBudget", amountSecurityDep, View.user.userCurrency.code , 'Budget');
		    		var convertedValue = result.value;
		    		record.setValue('ls.amount_security', convertedValue);
	    		}
	    		dataSource.saveRecord(record);
	    		form.refresh(new Ab.view.Restriction({'ls.ls_id':lsId}));
	    		return true;
	    	}else{
	    		form.save();
	    		return true;
	    	}
    	} catch(e){
    		Workflow.handleError(e);
    		return false;
    	}
    },
    

    abRepmAddEditLeaseInABuildingLease_form_onDelete: function(row){
        var leasePanelRecord = this.abRepmAddEditLeaseInABuildingLease_form.getRecord();
    	var leasePanelDataSource = this.abRepmAddEditLeaseInABuildingLease_ds; 
        var treePanel = this.abRepmAddEditLeaseInABuildingCtryTree;
        View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                	leasePanelDataSource.deleteRecord(leasePanelRecord);
                    hidePanels();
                    refreshTreePanelAfterUpdate(treePanel.lastNodeClicked.parent);
                    treePanel.lastNodeClicked = null;
                    treePanel.setTitle(getMessage('tree_panel_title'));
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
    },

    //event handler for 'Use Template' action
    abRepmAddEditLeaseInABuildingLease_form_onUseTemplate: function(){
    
        //check if 'ls.ls_id' field is empty
        if (!valueExistsNotEmpty(this.abRepmAddEditLeaseInABuildingLease_form.getFieldValue('ls.ls_id'))) {
            View.showMessage(getMessage('err_no_lease'));
            return;
        }
        
        // if 'ls.ls_id' field is not empty then show 'abRepmAddEditLeaseInABuildingLsTmp_grid' panel in a Open Dialog
        var restriction = new Ab.view.Restriction();
        restriction.addClause("ls.use_as_template", "1", "=");
        this.abRepmAddEditLeaseInABuildingLsTmp_grid.refresh(restriction);
        this.abRepmAddEditLeaseInABuildingLsTmp_grid.showInWindow({
            applyParentRestriction: false,
            newRecord: true,
            width: 600,
            height: 600
        });
    },
        
    //unassign a suite
    abRepmAddEditLeaseInABuildingSuites_grid_unassign_onClick: function(row){
    	var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                    var record = row.getRecord();
                    record.setValue('su.ls_id', '');
                    controller.abRepmAddEditLeaseInABuildingSuites_ds.saveRecord(record);
                    controller.abRepmAddEditLeaseInABuildingSuites_grid.refresh();
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
    },
    
    abRepmAddEditLeaseInABuildingSelectSuites_grid_onAddSuites: function(){
        var selectedRecords = this.abRepmAddEditLeaseInABuildingSelectSuites_grid.getSelectedRecords();
        for (i = 0; i < selectedRecords.length; i++) {
            var record = selectedRecords[i];
            record.setValue('su.ls_id', this.abRepmAddEditLeaseInABuildingLease_form.getFieldValue('ls.ls_id'));
            this.abRepmAddEditLeaseInABuildingSuites_ds.saveRecord(record);
        }
        this.abRepmAddEditLeaseInABuildingSuites_grid.refresh();
        this.abRepmAddEditLeaseInABuildingSelectSuites_grid.closeWindow();
    },
    
    
    //'Delete' actions
    abRepmAddEditLeaseInABuildingDocs_grid_onDeleteDocuments: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingDocs_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingDocs_grid);
    },
    
    abRepmAddEditLeaseInABuildingClauses_grid_onDeleteClauses: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingClauses_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingClauses_grid);
    },
    
    abRepmAddEditLeaseInABuildingOptions_grid_onDeleteOptions: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingOptions_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingOptions_grid);
    },
    
    abRepmAddEditLeaseInABuildingAmendments_grid_onDeleteAmendments: function(row){
        this.deleteRecord(this.abRepmAddEditLeaseInABuildingAmendments_ds, row.getRecord(), this.abRepmAddEditLeaseInABuildingAmendments_grid);
    },
    
    deleteRecord: function(dataSource, record, reportPanel){
        View.confirm(getMessage('message_confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
    },
    
    //'View Document' actions
    abRepmAddEditLeaseInABuildingDocs_grid_onViewDocuments: function(row){
        View.showDocument({
            'doc_id': row.getFieldValue('docs_assigned.doc_id')
        }, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
    },
    
    abRepmAddEditLeaseInABuildingClauses_grid_onDocumentClauses: function(row){
        View.showDocument({
            'resp_id': row.getFieldValue('ls_resp.resp_id'),
            'ls_id': row.getFieldValue('ls_resp.ls_id')
        }, 'ls_resp', 'doc', row.getFieldValue('ls_resp.doc'));
    },
    
    abRepmAddEditLeaseInABuildingOptions_grid_onDocumentOptions: function(row){
        View.showDocument({
            'op_id': row.getFieldValue('op.op_id'),
            'ls_id': row.getFieldValue('op.ls_id')
        }, 'op', 'doc', row.getFieldValue('op.doc'));
    },
    
    abRepmAddEditLeaseInABuildingAmendments_grid_onDocumentAmendments: function(row){
        View.showDocument({
            'ls_amend_id': row.getFieldValue('ls_amendment.ls_amend_id')
        }, 'ls_amendment', 'doc', row.getFieldValue('ls_amendment.doc'));
    },
    
    abRepmAddEditLeaseInABuildingContacts_grid_onAssign: function(){
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
			var record = this.abRepmAddEditLeaseInABuildingContacts_ds.getRecord(restriction);
			record.setValue('contact.ls_id', this.leaseId);

			this.abRepmAddEditLeaseInABuildingContacts_ds.saveRecord(record);
		}
		this.abRepmAddEditLeaseInABuildingContacts_grid.refresh(this.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
	},

    abRepmAddEditLeaseInABuildingContacts_grid_onUnassign: function(){
		var selectedRows = this.abRepmAddEditLeaseInABuildingContacts_grid.getSelectedRows();
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
				controller.abRepmAddEditLeaseInABuildingContacts_grid.refresh(controller.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
				controller.abRepmAddEditLeaseInABuildingLease_form.refresh(new Ab.view.Restriction({'ls.ls_id': controller.leaseId}));
			}
		});
    },
    
	onUnassingContact: function(contactId){
		try {
			if (this.isLsContactsDef) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
				restriction.addClause('ls_contacts.contact_id', contactId, '=');
				var record =  this.abRepmLsContacts_ds.getRecord(restriction);
				this.abRepmLsContacts_ds.deleteRecord(record);
			}
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('contact.contact_id', contactId, '=');
			var record = this.abRepmAddEditLeaseInABuildingContacts_ds.getRecord(restriction);
			record.setValue('contact.ls_id', '');

			this.abRepmAddEditLeaseInABuildingContacts_ds.saveRecord(record);
			resetLeaseContacts(contactId, this.leaseId);
			return true;
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},
	
	abRepmAddEditLeaseInABuildingContactsEdit_form_onSave: function(){
		if (this.abRepmAddEditLeaseInABuildingContactsEdit_form.canSave()) {
			this.abRepmAddEditLeaseInABuildingContactsEdit_form.save();
			this.abRepmAddEditLeaseInABuildingContacts_grid.refresh(this.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
			this.abRepmAddEditLeaseInABuildingContactsEdit_form.closeWindow();
		}
	},
	
	abRepmAddEditLeaseInABuildingContactsEdit_form_onDelete: function(){
		var controller = this;
		var contactId = this.abRepmAddEditLeaseInABuildingContactsEdit_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmDelete'), function(button) {
			if (button == 'yes') {
				controller.onDeleteContact(contactId);
				
				controller.abRepmAddEditLeaseInABuildingContacts_grid.refresh(controller.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
				controller.abRepmAddEditLeaseInABuildingLease_form.refresh(new Ab.view.Restriction({'ls.ls_id': controller.leaseId}));
				controller.abRepmAddEditLeaseInABuildingContactsEdit_form.closeWindow();
			}
		});
	},
	
	abRepmAddEditLeaseInABuildingContactsEdit_form_onUnassign: function(){
		var controller = this;
		var contactId = this.abRepmAddEditLeaseInABuildingContactsEdit_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmUnassign'), function(button) {
			if (button == 'yes') {
				if (controller.onUnassingContact(contactId)) {
					controller.abRepmAddEditLeaseInABuildingContacts_grid.refresh(controller.abRepmAddEditLeaseInABuildingContacts_grid.restriction);
					controller.abRepmAddEditLeaseInABuildingLease_form.refresh(new Ab.view.Restriction({'ls.ls_id': controller.leaseId}));
					controller.abRepmAddEditLeaseInABuildingContactsEdit_form.closeWindow();
				}
			}
		});
	},
	
	onDeleteContact: function(contactId){
		
		if (this.isLsContactsDef) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_contacts.ls_id', this.leaseId, '=');
			restriction.addClause('ls_contacts.contact_id', contactId, '=');
			var record =  this.abRepmLsContacts_ds.getRecord(restriction);
			this.abRepmLsContacts_ds.deleteRecord(record);
		}
		
		// if is landlord or tenant contact - update lease table
		resetLeaseContacts(contactId, this.leaseId);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.abRepmAddEditLeaseInABuildingContacts_ds.getRecord(restriction);
		this.abRepmAddEditLeaseInABuildingContacts_ds.deleteRecord(record);
	}
	
});

function showExistingSuite(){
	var controller = View.controllers.get("abRepmAddEditLeaseInABuilding_ctrl") 
    var restriction = new Ab.view.Restriction();
    restriction.addClause("su.bl_id", controller.blId, "=");
    controller.abRepmAddEditLeaseInABuildingSelectSuites_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingSelectSuites_grid.showInWindow({
        applyParentRestriction: false,
        newRecord: true,
        width: 600,
        height: 600
    });
	
}

/**
 * Refresh tree panel after save or delete
 * @param {Object} node
 */
function refreshTreePanelAfterUpdate(node){
	var treePanel = View.panels.get("abRepmAddEditLeaseInABuildingCtryTree");
	treePanel.refreshNode(node);
    node.expand();
}

/**
 * Refresh panels for selected lease
 * @param ls_id
 * @param treeLevel 
 */
function refreshPanels(ls_id, treeLevel){
	if (treeLevel ==  undefined) {
		treeLevel = -1;
	}
    var controller = View. controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
    controller.leaseId = ls_id;

    var restriction = new Ab.view.Restriction();
    restriction.addClause("ls.ls_id", ls_id);
    
    controller.abRepmAddEditLeaseInABuildingLease_form.refresh(restriction, false);
    
    //enable/disable 'landlord_tenant' field if a lease/sublease is selected from the tree
    var ldTnEnabled = (treeLevel == 3);
    controller.abRepmAddEditLeaseInABuildingLease_form.enableField('ls.landlord_tenant', ldTnEnabled);
    
    controller.abRepmAddEditLeaseInABuildingSuites_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingDocs_grid.refresh(restriction);
    
    var contactRestriction = null;
	if (controller.isLsContactsDef) {
		contactRestriction = "EXISTS(SELECT ls_contacts.contact_id FROM ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(ls_id) + "' )";
	} else {
		contactRestriction = new Ab.view.Restriction();
		contactRestriction.addClause('contact.ls_id', ls_id, '=');
	}
    
    controller.abRepmAddEditLeaseInABuildingContacts_grid.refresh(contactRestriction);
    controller.abRepmAddEditLeaseInABuildingBaseRents_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingClauses_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingOptions_grid.refresh(restriction);
    controller.abRepmAddEditLeaseInABuildingAmendments_grid.refresh(restriction);
    
}

/**
 * Hide all detail panels
 */
function hidePanels(){
    var controller = View. controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
    // hide panels
    controller.abRepmAddEditLeaseInABuildingLease_form.show(false, true);
    controller.abRepmAddEditLeaseInABuildingSuites_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingDocs_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingContacts_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingBaseRents_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingClauses_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingOptions_grid.show(false, true);
    controller.abRepmAddEditLeaseInABuildingAmendments_grid.show(false, true);
}

/**
 * Show details for selected tree node.
 * @param node
 */
function showDetails(node){
	var treePanel = View.panels.get("abRepmAddEditLeaseInABuildingCtryTree");
	var controller = View. controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
	var lastNodeClicked = treePanel.lastNodeClicked;
	var lsId = null;
	if (lastNodeClicked.level.levelIndex == 2) {
		controller.blId = lastNodeClicked.data["bl.bl_id"];
		controller.regnId = lastNodeClicked.data["bl.regn_id"];
		controller.siteId = lastNodeClicked.data["bl.site_id"];
	}else if (lastNodeClicked.level.levelIndex == 3) {
		// maybe parent node was changed
		controller.blId = lastNodeClicked.parent.data["bl.bl_id"];
		controller.regnId = lastNodeClicked.parent.data["bl.regn_id"];
		controller.siteId = lastNodeClicked.parent.data["bl.site_id"];

		lsId = lastNodeClicked.data["ls.ls_parent_id"];
		refreshPanels(lsId, 3);
	} else if (lastNodeClicked.level.levelIndex == 4){
		// maybe parent node was changed
		controller.blId = lastNodeClicked.parent.parent.data["bl.bl_id"];
		controller.regnId = lastNodeClicked.parent.parent.data["bl.regn_id"];
		controller.siteId = lastNodeClicked.parent.parent.data["bl.site_id"];

		lsId = lastNodeClicked.data["ls.ls_id"];
		refreshPanels(lsId, 4);
	}
	return true;
}

function setCustomPeriodForBaseRentsEditPanel(panel){
    if (panel.getFieldValue('cost_tran_recur.period') == 'CUSTOM') {
        panel.enableField('cost_tran_recur.period_custom', true);
    }
    else {
        panel.enableField('cost_tran_recur.period_custom', false);
    }
}

function checkClauseFields(panel){
    if (panel.getFieldValue('ls_resp.dates_match_lease') == 1) {
        
    	var controller = View.controllers.get('abRepmAddEditLeaseInABuilding_ctrl');
    	var lsRecord = getLeaseDates(controller.leaseId);
    	
		
		panel.enableField('ls_resp.date_start', false);
		panel.setFieldValue('ls_resp.date_start', lsRecord.getValue('ls.date_start'));
		panel.enableField('ls_resp.date_end', false);
		panel.setFieldValue('ls_resp.date_end', lsRecord.getValue('ls.date_end'));
    }
    else 
        if (panel.getFieldValue('ls_resp.dates_match_lease') == 0) {
            panel.enableField('ls_resp.date_start', true);
            panel.enableField('ls_resp.date_end', true);
        }
}

/**
 * get lease start / end dates
 * @param leaseId lease code
 * @returns record
 */
function getLeaseDates(leaseId){
	var record = null;
	var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.ls_id', 'ls.date_start', 'ls.date_end']),
			restriction: toJSON({
				'ls.ls_id': leaseId
			})
	};
	try{
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if(result.code == 'executed'){
			record = result.dataSet;
		}
		return record;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

function selectFloor(){
    Ab.view.View.selectValue('abRepmAddEditLeaseInABuildingSuitesEdit_form', 'Floor Code', ['su.fl_id'], 'fl', ['fl.fl_id'], ['fl.bl_id', 'fl.fl_id', 'fl.name'], 'fl.bl_id = \'' + this.abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingLease_form.getFieldValue("ls.bl_id") + '\'', '', true, false, '', 1000, 500);
}

function filter(){
	controller = View.controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
    var consolePanel = controller.abRepmAddEditLeaseInABuildingConsole;
    var restriction = '';
    if (consolePanel.getFieldValue('bl.ctry_id')) {
        restriction += " bl.ctry_id = '" + consolePanel.getFieldValue('bl.ctry_id') + "'";
    }
    if (consolePanel.getFieldValue('bl.city_id')) {
        restriction += (restriction != '') ? ' and ' : '';
        restriction += " bl.city_id = '" + consolePanel.getFieldValue('bl.city_id') + "'";
    }
    if (consolePanel.getFieldValue('bl.bl_id')) {
        restriction += (restriction != '') ? ' and ' : '';
        restriction += " bl.bl_id = '" + consolePanel.getFieldValue('bl.bl_id') + "'";
    }
    
    if (restriction) {
        controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console', restriction);
    }
    else {
        controller.abRepmAddEditLeaseInABuildingCtryTree.addParameter('console', ' 1=1 ');
    }
    hidePanels();
    controller.abRepmAddEditLeaseInABuildingCtryTree.refresh();
    
    controller.abRepmAddEditLeaseInABuildingCtryTree.setTitle(getMessage('tree_panel_title'));
    controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked = null;
}

function createNewLease(row){
    var controller = View.controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
    var leaseForm = View.panels.get("abRepmAddEditLeaseInABuildingLease_form");
    
    var newLsId = leaseForm.getFieldValue('ls.ls_id');
    var lsParentId = leaseForm.getFieldValue('ls.ls_parent_id');
    var blId = (valueExistsNotEmpty(controller.blId))? controller.blId : leaseForm.getFieldValue('ls.bl_id'); 

    var lease_sublease = leaseForm.getFieldValue('ls.lease_sublease');
    
    try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, row['ls.ls_id'], '0', 'building', blId, 'LANDLORD_TENANT', lsParentId, lease_sublease);
        controller.abRepmAddEditLeaseInABuildingLsTmp_grid.closeWindow();
        refreshPanels(newLsId, -1);
        refreshTreePanelAfterUpdate(controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked);
        selectNewAddedTreeNode(controller.abRepmAddEditLeaseInABuildingCtryTree.lastNodeClicked, newLsId);
    } 
    catch (e) {
        if (e.message == "Another record already exists with the same identifying value as this record -- the primary key for this record is not unique within the [{0}] table.") {
            View.showMessage(getMessage('err_lsId'));
        }
        else {
            Workflow.handleError(e);
        }
    }
}


/**
 * Copy to Contact the location fields of the selected Company
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectCompany(fieldName, selectedValue, previousValue){
    var panel = View.panels.get("abRepmAddEditLeaseInABuildingContactsEdit_form");
    
    if (!panel.newRecord) 
        return;
    
    var dsCompany = View.dataSources.get("abRepmAddEditLeaseInABuildingTab_dsCompany");
    var companyRecord = dsCompany.getRecord(new Ab.view.Restriction({
        "company.company": selectedValue
    }));
    
    if (panel.getFieldValue("contact.address1") == "") 
        panel.setFieldValue("contact.address1", companyRecord.getValue("company.address1"));
    
    if (panel.getFieldValue("contact.address2") == "") 
        panel.setFieldValue("contact.address2", companyRecord.getValue("company.address2"));
    
    if (panel.getFieldValue("contact.city_id") == "") 
        panel.setFieldValue("contact.city_id", companyRecord.getValue("company.city_id"));
    
    if (panel.getFieldValue("contact.ctry_id") == "") 
        panel.setFieldValue("contact.ctry_id", companyRecord.getValue("company.ctry_id"));
    
    if (panel.getFieldValue("contact.regn_id") == "") 
        panel.setFieldValue("contact.regn_id", companyRecord.getValue("company.regn_id"));
    
    if (panel.getFieldValue("contact.state_id") == "") 
        panel.setFieldValue("contact.state_id", companyRecord.getValue("company.state_id"));
    
    if (panel.getFieldValue("contact.zip") == "") 
        panel.setFieldValue("contact.zip", companyRecord.getValue("company.zip"));
}

/**
 * Select the new added tree node
 * @param {Object} parentNode
 * @param {Object} lsId
 *
 */
function selectNewAddedTreeNode(parentNode, lsId){

    var newAddedTreeNode = null;
    var childrenNodes = parentNode.children;
    var childDataIndex = (parentNode.level.levelIndex == 2) ? 'ls.ls_parent_id' : 'ls.ls_id';
    
    
    // find the node
    for (i = 0; i < childrenNodes.length; i++) {
        if (childrenNodes[i].data[childDataIndex] == lsId) {
            newAddedTreeNode = childrenNodes[i];
            break;
        }
    }
    
    //select the node
    parentNode.onLabelClick(newAddedTreeNode);
}

/**
 * Add Amenity Type and Comments to selected Clause's Description
 **/
function setAmenityType(){
    var selectedRows = View.panels.get('abRepmAddEditLeaseInABuildingClausesAmntType').getSelectedRows();
    panel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingClausesEdit_form;
    for (i = 0; i < selectedRows.length; i++) {
        var comments = (selectedRows[i]['bl_amenity.comments'])?" - Comments: "+selectedRows[i]['bl_amenity.comments']:"";
		panel.setFieldValue('ls_resp.description', panel.getFieldValue('ls_resp.description') + " Amenity Type: " + selectedRows[i]['bl_amenity.amenity_type'] + comments + ". ");
    }
    View.panels.get('abRepmAddEditLeaseInABuildingClausesAmntType').closeWindow();
    
}

/**
 * Enable/Disable 'Add Amenity Description' button if Clause Type is/is not 'Amenity'
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 **/
function setAmenityButton(fieldName, selectedValue, previousValue){
    var panel = abRepmAddEditLeaseInABuilding_ctrl.abRepmAddEditLeaseInABuildingClausesEdit_form;
    var clauseType = (selectedValue) ? selectedValue : panel.getFieldValue('ls_resp.clause_type_id');
    
    if (clauseType == 'Amenity') {
        panel.fields.get('ls_resp.description').actions.items[0].enable(true);
    }
    else {
        panel.fields.get('ls_resp.description').actions.items[0].enable(false);
    }
}


/**
 * if dateEnd < dateStart it shows an error message
 * @param {Object} form
 * @param {Object} startDateField
 * @param {Object} endDateField
 * @param {Object} errMessage
 **/
function datesValidated(form, startDateField, endDateField, errMessage){
    // get the string value from field start date
    var date_start = form.getFieldValue(startDateField).split("-");
    //create Date object
    var dateStart = new Date(date_start[0], date_start[1], date_start[2]);
    
    // get the string value from field end date
    var date_end = form.getFieldValue(endDateField).split("-");
    //create Date object
    var dateEnd = new Date(date_end[0], date_end[1], date_end[2]);
    
    if (dateEnd < dateStart) {
        View.showMessage(errMessage);
        return false;
    }
    return true;
}

/**
 * 'Save' action when adding or editing: assigned documents , base rents, clauses, options and amendments
 * @param {Object} editFormPanel
 * @param {Object} detailsGridPanel
 * @param {Object} datesJSON
 * @param {Object} closeWindowIfIsNewRec
 **/
function saveRecord(editFormPanel, detailsGridPanel, datesJSON, closeWindowIfIsNewRec){

    if (datesJSON) {
    
        for (i = 0; i < datesJSON.dates.length; i++) {
        
            var startDateField = datesJSON.dates[i].startDateField;
            var endDateField = datesJSON.dates[i].endDateField;
            var errMessage = datesJSON.dates[i].errMessage;
            
            if (!datesValidated(editFormPanel, startDateField, endDateField, errMessage)) {
                return;
            }
        }
    }
    
    var isNewRecord = editFormPanel.newRecord;
    
    editFormPanel.save();
    detailsGridPanel.refresh();
    
    if ((closeWindowIfIsNewRec && isNewRecord) || !isNewRecord) {
        editFormPanel.closeWindow();
    }
}

/**
 * Add new base rent
 * @param ctx
 */
function addBaseRent(){
	var title = getMessage("add_base_rent");
	var controller = View.controllers.get("abRepmAddEditLeaseInABuilding_ctrl");
	var leaseId = controller.leaseId;
	addEditBaseRent(null, leaseId, title, "abRepmAddEditLeaseInABuildingBaseRents_grid");
}

/**
 * Function edit base rent
 * @param ctx
 */
function editBaseRent(ctx){
	var gridRow = ctx.row;
	var leaseId = gridRow.getFieldValue("cost_tran_recur.ls_id");
	var costTranRecurId = gridRow.getFieldValue("cost_tran_recur.cost_tran_recur_id");
	var title = getMessage("edit_base_rent");
	addEditBaseRent(costTranRecurId, leaseId, title, "abRepmAddEditLeaseInABuildingBaseRents_grid");
}

function addEditBaseRent(costTranRecurId, leaseId, title, panelId){
	// runtime parameters that are passed to pop-up view
	var runtimeParameters = {
			cost_tran_recur_id: costTranRecurId,
			leaseId: leaseId,
			refreshPanels: new Array(panelId),
			title: title
	}
	View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
		width:800,
		height:700, 
		closeButton:true,
		runtimeParameters: runtimeParameters
	});

}


function onSelectLdContact(){
	onSelectContact('ls.ld_contact');
}

function onSelectTnContact(){
	onSelectContact('ls.tn_contact');
}

function onSelectContact(fieldName){
	var form = View.panels.get('abRepmAddEditLeaseInABuildingLease_form');

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

function resetLeaseContacts(contactId, leaseId){
	var dataSource = View.dataSources.get('abRepmAddEditLeaseInABuildingLease_ds');
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