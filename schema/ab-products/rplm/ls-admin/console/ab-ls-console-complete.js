var abLsConsoleCompleteController = View.createController('abLsConsoleCompleteController', {
	lsId: null,

	isLsContactsDef: false,
	
	itemType: 'lease',

	
	afterViewLoad: function(){
		// check if new ls_contacts table is defined
		this.isLsContactsDef = schemaHasTables(['ls_contacts']);

		this.overrideScroller(this.abRepmContactComplete_list);
		this.overrideScroller(this.gridBaseRentsComplete);
		this.overrideScroller(this.gridLeaseAdminClausesComplete);
		this.overrideScroller(this.gridLeaseAdminOptionsComplete);
		this.overrideScroller(this.gridLeaseAdminAmendmentsComplete);
		this.overrideScroller(this.abRepmLsadminCommLogCompleteGrid);
		this.overrideScroller(this.abLsConsoleSuiteCompleteAvailable_list);
		this.overrideScroller(this.abLsConsoleSuiteCompleteAssigned_list);
		this.overrideScroller(this.abLsConsoleSuiteCompleteAssignedToOther_list);
		this.overrideScroller(this.abLsConsoleCompleteDocs_list);
	},

	/**
	 * KB 3046020: override ReportGrid.updateScroller to enable horizontal scrolling.
	 * @param grid The grid panel.
	 */
	overrideScroller: function(grid) {
		var updateScroller = grid.updateScroller.createDelegate(grid);
		grid.updateScroller = function() {
			updateScroller({
				verticalScrolling: false,
				horizontalScrolling: true
			});
		}
	},
	
	afterInitialDataFetch: function() {
		this.loadDetailsForLease('001', 'complete');
	},
	
	loadDetailsForLease: function(lsId, displayMode){
		this.lsId = lsId;
		this.displayMode = displayMode;
		
		this.abRepmLeaseDetailsComplete_info.refresh(new Ab.view.Restriction({'ls.ls_id': this.lsId}));
		
		var restriction = this.getContactRestriction(this.lsId, this.itemType, this.isLsContactsDef);
		this.abRepmContactComplete_list.refresh(restriction);

		this.gridBaseRentsComplete.refresh(new Ab.view.Restriction({'cost_tran_recur.ls_id': this.lsId}));
		this.gridLeaseAdminClausesComplete.refresh(new Ab.view.Restriction({'ls_resp.ls_id': this.lsId}));
		this.gridLeaseAdminOptionsComplete.refresh(new Ab.view.Restriction({'op.ls_id': this.lsId}));
		this.gridLeaseAdminAmendmentsComplete.refresh(new Ab.view.Restriction({'ls_amendment.ls_id': this.lsId}));
		this.abRepmLsadminCommLogCompleteGrid.refresh(new Ab.view.Restriction({'ls_comm.ls_id': this.lsId}));

		this.blId = this.getBuildingCode(this.lsId);
		var restrAvailable = new Ab.view.Restriction();
		restrAvailable.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAvailable.addClause('su.ls_id', null, 'IS NULL', false, 'AND');
		
		var restrAssigned = new Ab.view.Restriction();
		restrAssigned.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAssigned.addClause('su.ls_id', this.lsId, '=', false, 'AND');
		
		var restrAssignedOther = new Ab.view.Restriction();
		restrAssignedOther.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAssignedOther.addClause('su.ls_id', null, 'IS NOT NULL', false, 'AND');
		restrAssignedOther.addClause('su.ls_id', this.lsId, '<>', false, 'AND');
		
		this.abLsConsoleSuiteCompleteAvailable_list.refresh(restrAvailable);
		this.abLsConsoleSuiteCompleteAssigned_list.refresh(restrAssigned);
		this.abLsConsoleSuiteCompleteAssignedToOther_list.refresh(restrAssignedOther);
		

		this.abLsConsoleCompleteDocs_list.addParameter('typeLabelClause', getMessage('paramLabel_clause'));
		this.abLsConsoleCompleteDocs_list.addParameter('typeLabelOption', getMessage('paramLabel_option'));
		this.abLsConsoleCompleteDocs_list.addParameter('typeLabelAmendment', getMessage('paramLabel_amendment'));
		this.abLsConsoleCompleteDocs_list.addParameter('typeLabelCommLog', getMessage('paramLabel_comm_log'));
		this.abLsConsoleCompleteDocs_list.addParameter('typeLabelDocument', getMessage('paramLabel_document'));
		this.abLsConsoleCompleteDocs_list.addParameter('lsCode', this.lsId);
		this.abLsConsoleCompleteDocs_list.refresh();
	},
	
	abRepmLeaseDetailsComplete_info_onEdit: function(){
		var controller = this;
		var blId = this.abRepmLeaseDetailsComplete_info.getFieldValue('ls.bl_id'); 
		var prId = this.abRepmLeaseDetailsComplete_info.getFieldValue('ls.pr_id');
		var itemType = 'property';
		var itemId = prId;
		var item = this.lsId;
		if (valueExistsNotEmpty(blId)) {
			itemType = 'building';
			itemId = blId;
		}
		
		
		View.openDialog('ab-rplm-editlease.axvw',null, true, {
			width:1280,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('editLease');
					dialogController.editLease.showField('ls.bl_id', true);
					dialogController.editLease.showField('ls.pr_id', true);
					dialogController.editLease.showField('dummy_field', true);
					dialogController.itemId = itemId;
					dialogController.itemType = itemType;
					dialogController.itemType = item;
					dialogController.editLease.refresh(new Ab.view.Restriction({'ls.ls_id': item}), false);
				},
				callback: function(res){
					View.closeDialog();
					controller.loadDetailsForLease(controller.lsId, controller.displayMode);
				}
		});
	},

	getContactRestriction: function(itemId, itemType, isLsContactsDefined){
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

	abRepmContactComplete_list_onUnassign: function(){
		var selectedRows = this.abRepmContactComplete_list.getSelectedRows();
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
				var restriction = controller.getRestriction(controller.lsId, controller.itemType, controller.isLsContactsDef);
				controller.abRepmContactComplete_list.refresh(restriction);
			}
		});
	},

	abRepmContactComplete_list_onAssign: function(){
		var restriction = null;
		if (this.itemType.toLowerCase() == 'property') {
			restriction = "( contact.pr_id IS NULL OR contact.pr_id <> '" + convert2SafeSqlString(this.lsId) + "' )"
		} else if (this.itemType.toLowerCase() == 'building') {
			restriction = "( contact.bl_id IS NULL OR contact.bl_id <> '" + convert2SafeSqlString(this.lsId) + "' )"
		} else if (this.itemType.toLowerCase() == 'lease') {
			if (this.isLsContactsDef) {
				restriction = "NOT EXISTS(SELECT ls_contacts.contact_id FROM  ls_contacts WHERE ls_contacts.contact_id = contact.contact_id AND ls_contacts.ls_id = '" + convert2SafeSqlString(this.lsId) + "' )";
			}else{
				restriction = "( contact.ls_id IS NULL OR contact.ls_id <> '" + convert2SafeSqlString(this.lsId) + "' )"
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
	
	abRepmContactComplete_form_onDelete: function() {
		var controller = this;
		var contactId = this.abRepmContactComplete_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmDelete'), function(button) {
			if (button == 'yes') {
				controller.onDeleteContact(contactId);
				var restriction = controller.getRestriction(controller.lsId, controller.itemType, controller.isLsContactsDef);
				controller.abRepmContactComplete_list.refresh(restriction);
				controller.abRepmContactComplete_form.closeWindow();
			}
		});
	},
	
	abRepmContactComplete_form_onUnAssign: function(){
		var controller = this;
		var contactId = this.abRepmContactComplete_form.getFieldValue("contact.contact_id");
		View.confirm(getMessage('msgConfirmUnassign'), function(button) {
			if (button == 'yes') {
				if (controller.onUnassingContact(contactId)) {
					var restriction = controller.getRestriction(controller.lsId, controller.itemType, controller.isLsContactsDef);
					controller.abRepmContactComplete_list.refresh(restriction);
					controller.abRepmContactComplete_form.closeWindow();
				}
			}
		});
	},
	
	onAssignContact: function(contactId){
		if (this.itemType.toLowerCase() == 'lease' && this.isLsContactsDef) {
			var record = new Ab.data.Record({
				'ls_contacts.ls_id': this.lsId,
				'ls_contacts.contact_id': contactId
			}, true);
			this.abRepmLsContactsComplete_ds.saveRecord(record);
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('contact.contact_id', contactId, '=');
			var record = this.abRepmContactComplete_ds.getRecord(restriction);
			if (this.itemType.toLowerCase() === 'property') {
				record.setValue('contact.pr_id', this.lsId);
			} else if (this.itemType.toLowerCase() === 'building') {
				record.setValue('contact.bl_id', this.lsId);
			} else if (this.itemType.toLowerCase() === 'lease') {
				record.setValue('contact.ls_id', this.lsId);
			}
			this.abRepmContactComplete_ds.saveRecord(record);
		}
		this.abRepmContactComplete_list.refresh(this.abRepmContactComplete_list.restriction);
	},
	
	onUnassingContact: function(contactId){
		try {
			if (this.itemType.toLowerCase() == 'lease' && this.isLsContactsDef) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('ls_contacts.ls_id', this.lsId, '=');
				restriction.addClause('ls_contacts.contact_id', contactId, '=');
				var record =  this.abRepmLsContactsComplete_ds.getRecord(restriction);
				this.abRepmLsContactsComplete_ds.deleteRecord(record);
			}else{
				var restriction = this.getRestriction(this.lsId, this.itemType, false);
				restriction.addClause('contact.contact_id', contactId, '=');
				var record = this.abRepmContactComplete_ds.getRecord(restriction);
				if (this.itemType.toLowerCase() === 'property') {
					record.setValue('contact.pr_id', '');
				} else if (this.itemType.toLowerCase() === 'building') {
					record.setValue('contact.bl_id', '');
				} else if (this.itemType.toLowerCase() === 'lease') {
					record.setValue('contact.ls_id', '');
				}
				this.abRepmContactComplete_ds.saveRecord(record);
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
			restriction.addClause('ls_contacts.ls_id', this.lsId, '=');
			restriction.addClause('ls_contacts.contact_id', contactId, '=');
			var record =  this.abRepmLsContactsComplete_ds.getRecord(restriction);
			 this.abRepmLsContactsComplete_ds.deleteRecord(record);
		}
		
		var restriction = this.getRestriction(this.lsId, this.itemType, false);
		restriction.addClause('contact.contact_id', contactId, '=');
		var record = this.abRepmContactComplete_ds.getRecord(restriction);
		
		this.abRepmContactComplete_ds.deleteRecord(record);
	},
	
	gridBaseRentsComplete_onNew: function(){
		this.add_edit_cost(null, getMessage('add_base_rent'));
	},
	
	gridBaseRentsComplete_onCostProfile: function(){
		var leaseId = this.lsId;
		
		View.openDialog('ab-repm-cost-ls-profile.axvw', null, false, {
			width: 1024,
			height: 800,
			lsId: leaseId
		});
	},
	
	add_edit_cost: function(costTranRecurId , title){
		var leaseId = this.lsId;
		var openerController = this;
		// runtime parameters that are passed to pop-up view
		var runtimeParameters = {
				cost_tran_recur_id: costTranRecurId,
				leaseId: leaseId,
				refreshPanels: new Array('gridBaseRentsComplete'),
				title: title
		}
		
		/*
		 * 03/30/2010 IOAN 
		 * kb 3026730 increase height of pop-up
		 */
		View.openDialog('ab-rplm-lsadmin-add-edit-baserent.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
			runtimeParameters: runtimeParameters
		});
	},
	
	gridLeaseAdminClausesComplete_onCostProfile: function(){
		var leaseId = this.lsId;
		
		View.openDialog('ab-repm-cost-ls-profile.axvw', null, false, {
			width: 1024,
			height: 800,
			lsId: leaseId
		});
	},
	
    gridLeaseAdminClausesComplete_onNew: function(){
        this.add_edit_clause(this.lsId,  null, 0,  getMessage('add_new_clause'));
    },
    
    add_edit_clause: function(lsId, respId, matchLeaseDates,  title){
    	var itemId = null;
    	var itemType = null;
    	var leaseRecord = getLeaseRecord(lsId);
    	if (valueExistsNotEmpty(leaseRecord.getValue('ls.bl_id'))) {
    		itemId = leaseRecord.getValue('ls.bl_id');
    		itemType = 'BUILDING';
    	}else if (valueExistsNotEmpty(leaseRecord.getValue('ls.pr_id'))) {
    		itemId = leaseRecord.getValue('ls.pr_id');
    		itemType = 'PROPERTY';
    	}
    	
        View.openDialog('ab-rplm-lsadmin-add-edit-clause.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmClause');
                dialogController.selectedId = respId;
                dialogController.leaseId = lsId;
                dialogController.itemId = itemId;
                dialogController.itemType = itemType;
                dialogController.refreshPanels = new Array('gridLeaseAdminClausesComplete', 'abLsConsoleCompleteDocs_list');
                dialogController.formClause.setTitle(title);
                if (respId == null) {
                    dialogController.formClause.refresh(null, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formClause.setFieldValue('ls_resp.date_start', '');
                    dialogController.formClause.setFieldValue('ls_resp.date_end', '');
                }
                else {
                    dialogController.formClause.refresh({
                        'ls_resp.resp_id': respId,
                        'ls_resp.ls_id': lsId
                    }, false);
                    dialogController.formClause.enableField('ls_resp.resp_id', false);
                }
                if (matchLeaseDates == 1) {
                    dialogController.formClause.enableField('ls_resp.date_start', false);
                    dialogController.formClause.enableField('ls_resp.date_end', false);
                }
                
                var clauseType = dialogController.formClause.getFieldValue('ls_resp.clause_type_id');
                
                if (clauseType == 'Amenity') {
                    dialogController.formClause.fields.get('ls_resp.description').actions.items[0].enable(true);
                }
                else {
                    dialogController.formClause.fields.get('ls_resp.description').actions.items[0].enable(false);
                }
            }
        });
    },
    
    gridLeaseAdminOptionsComplete_onEdit: function(row){
        this.add_edit_option(row, getMessage('edit_option'));
    },
    
    gridLeaseAdminOptionsComplete_onNew: function(){
        this.add_edit_option(this.lsId, null, 0, getMessage('add_new_option'));
    },

    add_edit_option: function(lsId, opId, matchLeaseDates, title){

        View.openDialog('ab-rplm-lsadmin-add-edit-option.axvw', null, true, {
            width: 800,
            height: 700,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('rplmOption');
                dialogController.selectedId = opId;
                dialogController.leaseId = lsId;
                dialogController.refreshPanels = new Array('gridLeaseAdminOptionsComplete', 'abLsConsoleCompleteDocs_list');
                dialogController.formOption.setTitle(title);
                if (opId == null) {
					/*
					 * 03/29/2010 IOAN KB 3026736
					 */
					dialogController.formOption.refresh({'op.ls_id':lsId}, true);
                    //dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
                    dialogController.formOption.setFieldValue('op.date_option_introduced', '');
                    dialogController.formOption.setFieldValue('op.date_start', '');
                    dialogController.formOption.setFieldValue('op.date_exercised', '');
                    dialogController.formOption.setFieldValue('op.date_review', '');
                    dialogController.formOption.setFieldValue('op.date_option', '');
                    dialogController.formOption.setFieldValue('op.date_exercising_applicable', '');
                }
                else {
                    dialogController.formOption.refresh({'op.op_id':opId, 'op.ls_id':lsId}, false);
                    dialogController.formOption.enableField('op.op_id', false);
                }
                if (matchLeaseDates == 1) {
                    dialogController.formOption.enableField('op.date_start', false);
                    dialogController.formOption.enableField('op.date_option', false);
                }
				if (dialogController.formOption.getFieldValue('op.date_option_introduced')==''){
					var date = new Date();
					dialogController.formOption.setFieldValue('op.date_option_introduced', date.getDate+'/'+date.getMonth+'/'+date.getYear);
				}
            }
        });
    },
    
	gridLeaseAdminAmendmentsComplete_onNew: function(){
		this.add_edit_amendment(this.lsId, null ,getMessage('add_new_amendment'));
	},

	add_edit_amendment: function(lsId, lsAmendId, title){
		var controller = this;
		View.openDialog('ab-rplm-lsadmin-add-edit-amendment.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('rplmAmendment');
					dialogController.selectedId = lsAmendId;
					dialogController.leaseId = lsId;
					dialogController.refreshControllers = new Array();
					dialogController.refreshPanels = new Array();
					dialogController.formAmendment.setTitle(title);
					if(lsAmendId == null){
						dialogController.formAmendment.refresh(null, true);
						//dialogController.formClause.setFieldValue('cost_tran_recur.cost_cat_id', 'RENT - BASE RENT');
					}
					else{
						dialogController.formAmendment.refresh({'ls_amendment.ls_amend_id':lsAmendId}, false);
					}
				}, 
				callback: function(){
					controller.gridLeaseAdminAmendmentsComplete.refresh(controller.gridLeaseAdminAmendmentsComplete.restriction);
					controller.abLsConsoleCompleteDocs_list.refresh(controller.abLsConsoleCompleteDocs_list.restriction); 
					
				}
		});
	},
	
	abRepmLsadminCommLogCompleteGrid_onNew: function(){
		openAddEditDialog(true, 'abRepmLsadminCommLogCompleteGrid', {}, ['ls_comm.ls_id']);
	},
	
	
	getBuildingCode: function(lsId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls.ls_id', lsId, '=');
		var dataSource = View.dataSources.get('dsLeaseComplete');
		var record = dataSource.getRecord(restriction);
		var blId = record.getValue('ls.bl_id');
		return blId;
	},
	
	abLsConsoleSuiteCompleteAvailable_list_onNew: function(){
		var restriction = new Ab.view.Restriction({'su.ls_id': this.lsId, 'su.bl_id': this.blId });
		this.add_edit_suite(null, new Array('abLsConsoleSuiteCompleteAvailable_list','abLsConsoleSuiteCompleteAssigned_list','abLsConsoleSuiteCompleteAssignedToOther_list'), restriction, true,getMessage('add_new'));
	},
	
	abLsConsoleSuiteCompleteAvailable_list_split_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.abLsConsoleSuiteComplete_ds, this.abLsConsoleSuiteCompleteAvailable_list);
		}
	},

	abLsConsoleSuiteCompleteAssigned_list_split_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.abLsConsoleSuiteComplete_ds, this.abLsConsoleSuiteCompleteAssigned_list);
		}
	},

	split: function(row, dataSource, panel){
		try {
			var suId = row.getFieldValue('su.su_id');
			var flId = row.getFieldValue('su.fl_id');
			var blId = row.getFieldValue('su.bl_id');
			var result = Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-splitSuite", suId, flId, blId);
			if (result.code == "executed") {
				panel.refresh(panel.restriction);
			}
			
		} catch (e){
			Workflow.handleError(e);
		}
	},
	
	abLsConsoleSuiteCompleteAvailable_list_delete_onClick: function(row){
		var dsSuite = View.dataSources.get('abLsConsoleSuiteComplete_ds');
		var records = dsSuite.getRecords(new Ab.view.Restriction({'su.bl_id': this.blId}));
		if(records.length == 1){
			View.showMessage(getMessage('error_delete_one_bl_suite'));
			return;
		}
		
		var record = row.getRecord();
		var reportPanel = this.abLsConsoleSuiteCompleteAvailable_list;
		View.confirm(getMessage('message_suite_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
                	dsSuite.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
			}
		})
	},
	
	abLsConsoleSuiteCompleteAvailable_list_assign_onClick: function(row){
		var record = row.getRecord();
		record.setValue('su.ls_id', this.lsId);
		this.abLsConsoleSuiteComplete_ds.saveRecord(record);
		this.abLsConsoleSuiteCompleteAvailable_list.refresh(this.abLsConsoleSuiteCompleteAvailable_list.restriction);
		this.abLsConsoleSuiteCompleteAssigned_list.refresh(this.abLsConsoleSuiteCompleteAssigned_list.restriction);
	},

	abLsConsoleSuiteCompleteAssigned_list_unassign_onClick: function(row){
		var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                   var record = row.getRecord();
					record.setValue('su.ls_id', '');
					controller.abLsConsoleSuiteComplete_ds.saveRecord(record);
					controller.abLsConsoleSuiteCompleteAvailable_list.refresh(controller.abLsConsoleSuiteCompleteAvailable_list.restriction);
					controller.abLsConsoleSuiteCompleteAssigned_list.refresh(controller.abLsConsoleSuiteCompleteAssigned_list.restriction);
		
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
	},
	
	abLsConsoleSuiteCompleteAvailable_list_edit_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('su.su_id', row.getFieldValue('su.su_id'), '=');
		restriction.addClause('su.bl_id', row.getFieldValue('su.bl_id'), '=');
		restriction.addClause('su.fl_id', row.getFieldValue('su.fl_id'), '=');
		this.add_edit_suite(row, new Array('abLsConsoleSuiteAvailable_list','abLsConsoleSuiteAssigned_list','abLsConsoleSuiteAssignedToOther_list'), restriction, false,getMessage('edit'));
	},
	
	abLsConsoleSuiteCompleteAssigned_list_edit_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('su.su_id', row.getFieldValue('su.su_id'), '=');
		restriction.addClause('su.bl_id', row.getFieldValue('su.bl_id'), '=');
		restriction.addClause('su.fl_id', row.getFieldValue('su.fl_id'), '=');
		this.add_edit_suite(row, new Array('abLsConsoleSuiteAvailable_list','abLsConsoleSuiteAssigned_list','abLsConsoleSuiteAssignedToOther_list'), restriction, true,getMessage('edit'));
	},

	add_edit_suite: function(row, panels, restriction, withLease,title){
		var itemId = this.blId;
		var leaseId = this.lsId;
		
		View.openDialog('ab-rplm-add-edit-suite.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
			afterInitialDataFetch:function(dialogView){
				var dialogController = dialogView.controllers.get('addEditSuite');
				dialogController.itemId = itemId;
				dialogController.itemType = null;
				dialogController.leaseId = leaseId;
				dialogController.leaseType = null;
				dialogController.addEditSuiteForm.setTitle(title);
				if(row != null){
					dialogController.suiteId = row.getFieldValue('su.su_id');
					dialogController.addEditSuiteForm.refresh(restriction, false);
					dialogController.addEditSuiteForm.newRecord = false;
					
					/* KB 3027906 Allow modification of the Suite Code
					 * dialogController.addEditSuiteForm.enableField('su.su_id', false);
					 */
					if(withLease){
						dialogController.addEditSuiteForm.enableField('su.ls_id', false);
						dialogController.addEditSuiteForm.enableField('su.bl_id', false);
					}else{
						dialogController.addEditSuiteForm.enableField('su.ls_id', true);
					}
				}else{
					dialogController.addEditSuiteForm.refresh(null, true);
					dialogController.addEditSuiteForm.newRecord = true;
					
					if(withLease && valueExistsNotEmpty(leaseId)){
						dialogController.addEditSuiteForm.setFieldValue('su.ls_id', leaseId);
						dialogController.addEditSuiteForm.enableField('su.ls_id', false);
					}else{
						dialogController.addEditSuiteForm.enableField('su.ls_id', true);
					}
					if (valueExistsNotEmpty(itemId)) {
						dialogController.addEditSuiteForm.setFieldValue('su.bl_id', itemId);
						dialogController.addEditSuiteForm.enableField('su.bl_id', false);
					}
				}
				dialogController.refreshPanels = panels;
			}
		});
	},
	
	abLsConsoleCompleteDocs_list_onNew: function(){
		var controller = this;
		addEditDoc(null, this.lsId, 'LEASE', getMessage('add_new_doc'), new Array('abLsConsoleCompleteDocs_list'), function(){
			controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelClause', getMessage('paramLabel_clause'));
			controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelOption', getMessage('paramLabel_option'));
			controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelAmendment', getMessage('paramLabel_amendment'));
			controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelCommLog', getMessage('paramLabel_comm_log'));
			controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelDocument', getMessage('paramLabel_document'));
			controller.abLsConsoleCompleteDocs_list.addParameter('lsCode', controller.lsId);
			controller.abLsConsoleCompleteDocs_list.refresh();
			
		});
	},
	
	editRow: function(record) {
		var detailForm = this.getDetailsForm(record['docs_assigned.type']);
		var restriction = this.getDetailsFormRestriction(record);
		
		var dialogConfig = {
				width: 600,
				height: 200,
				closeButton: false
		};
		
		detailForm.refresh(restriction, false);
		detailForm.showInWindow(dialogConfig);
		
	},
	
	getDetailsForm: function(recordType) {
		var objForm = null;
		if (recordType == 'clause') {
			objForm = View.panels.get('abLsConsoleCompleteClause_form');
		} else if (recordType == 'option') {
			objForm = View.panels.get('abLsConsoleCompleteOption_form');
		} else if (recordType == 'amendment') {
			objForm = View.panels.get('abLsConsoleCompleteAmendment_form');
		} else if (recordType == 'comm_log') {
			objForm = View.panels.get('abLsConsoleCompleteCommLog_form');
		}else if (recordType == 'document') {
			objForm = View.panels.get('abLsConsoleCompleteDocAssigned_form');
		}
		return objForm;
	},
	
	getDetailsFormRestriction: function(record){
		var recordType = record['docs_assigned.type'];
		var leaseId = record['docs_assigned.ls_id'];
		var pKey = record['docs_assigned.doc_pk'];
		var restriction = new Ab.view.Restriction();
		
		if (recordType == 'clause') {
			restriction.addClause('ls_resp.ls_id', leaseId, '=');
			restriction.addClause('ls_resp.resp_id', pKey, '=');
		} else if (recordType == 'option') {
			restriction.addClause('op.ls_id', leaseId, '=');
			restriction.addClause('op.op_id', pKey, '=');
		} else if (recordType == 'amendment') {
			restriction.addClause('ls_amendment.ls_id', leaseId, '=');
			restriction.addClause('ls_amendment.ls_amend_id', parseInt(pKey), '=');
		} else if (recordType == 'comm_log') {
			restriction.addClause('ls_comm.ls_id', leaseId, '=');
			restriction.addClause('ls_comm.auto_number', parseInt(pKey), '=');
		}else if (recordType == 'document') {
			restriction.addClause('docs_assigned.ls_id', leaseId, '=');
			restriction.addClause('docs_assigned.doc_id', parseInt(pKey), '=');
		}
		
		return restriction;
	}
	
});


/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}

/**
 * Edit cost record event handler.
 * @param ctx command context
 */
function onEditCostComplete(ctx){
	if (valueExists(ctx.restriction)) {
		var costTranRecurId = ctx.restriction['cost_tran_recur.cost_tran_recur_id'];
		var controller = View.controllers.get('abLsConsoleCompleteController'); 
		controller.add_edit_cost(costTranRecurId, getMessage('edit_base_rent'));
	}
}

function onOpenClauseDoc(ctx){
	var record = ctx.row.record;
    View.showDocument({
        'ls_id': record['ls_resp.ls_id'],
        'resp_id': record['ls_resp.resp_id']
    }, 'ls_resp', 'doc', record['ls_resp.doc']);
	
}

function onEditClauseComplete(ctx){
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('ls_resp.ls_id');
		var respId = ctx.row.getFieldValue('ls_resp.resp_id');
		var matchLeaseDates = ctx.row.getFieldValue('ls_resp.dates_match_lease');
		var controller = View.controllers.get('abLsConsoleCompleteController');
		controller.add_edit_clause(lsId, respId, matchLeaseDates, getMessage('edit_clause'));
		
	}
}

function onOpenOptionDoc(ctx){
	var record = ctx.row.record;
	View.showDocument({'op_id':record['op.op_id'], 'ls_id':record['op.ls_id']},'op','doc',record['op.doc']);
}

function onEditOptionComplete(ctx){
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('op.ls_id');
		var opId = ctx.row.getFieldValue('op.op_id');
		var matchLeaseDates = ctx.row.getFieldValue('op.dates_match_lease');
		var controller = View.controllers.get('abLsConsoleCompleteController');
		controller.add_edit_option(lsId, opId, matchLeaseDates, getMessage('edit_option'));
		
	}
}

function onOpenAmendment(ctx){
	var record = ctx.row.record;
	View.showDocument({'ls_amend_id':record['ls_amendment.ls_amend_id']},'ls_amendment','doc',record['ls_amendment.doc']);
}

function onEditAmendmentComplete(ctx) {
	if (valueExists(ctx.row)) {
		var lsId = ctx.row.getFieldValue('ls_amendment.ls_id');
		var lsAmendId = ctx.row.getFieldValue('ls_amendment.ls_amend_id');
		var controller = View.controllers.get('abLsConsoleCompleteController');
		controller.add_edit_amendment(lsId, lsAmendId, getMessage('edit_amendment'));
		
	}
}

function onOpenCommLogDoc(ctx){
	var record = ctx.row.record;
	View.showDocument({'auto_number':record['ls_comm.auto_number']},'ls_comm','doc',record['ls_comm.doc']);
}

function onEditCommLogComplete(ctx){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls_comm.auto_number', ctx['ls_comm.auto_number'], '=');
	ctx.restriction = restriction;
	openAddEditDialog(false, ctx.grid.id, ctx, null);
}

function onEditDocumentComplete(ctx){
	var record = ctx.row.record;
	var controller = View. controllers.get('abLsConsoleCompleteController');
	controller.editRow(record);
}

function addEditDoc(row, itemId, itemType, title, refreshPanels, callbackMethod){
    View.openDialog('ab-rplm-add-edit-document.axvw', null, true, {
        width: 800,
        height: 400,
        closeButton: true,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('addEditDoc');
            dialogController.itemId = itemId;
            dialogController.itemType = itemType;
            dialogController.addEditDoc.setTitle(title)
            if (row != null) {
                dialogController.docId = row.getFieldValue('docs_assigned.doc_id');
                dialogController.addEditDoc.refresh({
                    'docs_assigned.doc_id': row.getFieldValue('docs_assigned.doc_id')
                }, false);
            }
            else {
                dialogController.docId = null;
                dialogController.addEditDoc.newRecord = true;
            }
            dialogController.refreshPanels = refreshPanels;
        }, 
        callback: function(res){
        	if (valueExists(callbackMethod)) {
        		callbackMethod.call();
        	}
        }
    });
}

function onClosePopupComplete(ctx){
	var parentPanel = View.panels.get(ctx.command.parentPanelId);
	var controller = View.controllers.get('abLsConsoleCompleteController');

	controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelClause', getMessage('paramLabel_clause'));
	controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelOption', getMessage('paramLabel_option'));
	controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelAmendment', getMessage('paramLabel_amendment'));
	controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelCommLog', getMessage('paramLabel_comm_log'));
	controller.abLsConsoleCompleteDocs_list.addParameter('typeLabelDocument', getMessage('paramLabel_document'));
	controller.abLsConsoleCompleteDocs_list.addParameter('lsCode', controller.lsId);
	controller.abLsConsoleCompleteDocs_list.refresh();
	refreshDocTabsComplete();
	
	parentPanel.closeWindow();
}


function onOpenDocumentComplete(ctx) {
	var restriction = null;
	var tableName = null;
	var docFieldName = null;
	var docFieldValue = null;

	var record = ctx.row.record; 
	var recordType = record['docs_assigned.type'];
	var docPkValue = record['docs_assigned.doc_pk'];
	var docFieldValue = record['docs_assigned.doc'];
	var lsId = View.controllers.get('abLsConsoleCompleteController').lsId;

	if (recordType == 'clause') {
		tableName = 'ls_resp';
		docFieldName = 'doc';
		restriction = {'resp_id': record['docs_assigned.doc_pk'], 'ls_id': lsId};
	} else if (recordType == 'option') {
		tableName = 'op';
		docFieldName = 'doc';
		restriction = {'op_id': record['docs_assigned.doc_pk'], 'ls_id': lsId};
	} else if (recordType == 'amendment') {
		tableName = 'ls_amendment';
		docFieldName = 'doc';
		restriction = {'ls_amend_id': record['docs_assigned.doc_pk']};
	} else if (recordType == 'comm_log') {
		tableName = 'ls_comm';
		docFieldName = 'doc';
		restriction = {'auto_number': record['docs_assigned.doc_pk']};
	}else if (recordType == 'document') {
		tableName = 'docs_assigned';
		docFieldName = 'doc';
		restriction = {'doc_id': record['docs_assigned.doc_pk']};
	}
	

	View.showDocument(restriction,tableName,docFieldName,docFieldValue);
}

/**
 * get lease start / end dates
 * @param leaseId lease code
 * @returns record
 */
function getLeaseRecord(leaseId){
	var record = null;
	var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.ls_id', 'ls.bl_id', 'ls.pr_id']),
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


function refreshDocTabsComplete(){
	var controller = View.controllers.get('abLsConsoleCompleteController');
	controller.gridLeaseAdminClausesComplete.refresh(controller.gridLeaseAdminClausesComplete.restriction);
	controller.gridLeaseAdminOptionsComplete.refresh(controller.gridLeaseAdminOptionsComplete.restriction);
	controller.gridLeaseAdminAmendmentsComplete.refresh(controller.gridLeaseAdminAmendmentsComplete.restriction);
	controller.abRepmLsadminCommLogCompleteGrid.refresh(controller.abRepmLsadminCommLogCompleteGrid.restriction);
}

