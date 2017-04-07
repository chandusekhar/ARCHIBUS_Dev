var abRplmLsAdminLeaseTemplateSelectTab_ctrl = View.createController('abRplmLsAdminLeaseTemplateSelectTab_ctrl', {
    useTemplate: null,
    selectedLease: null
});



//onclick event listener for grid row button 'Delete'
function deleteLease(row){
    var record = new Ab.data.Record({
        'ls.ls_id': row['ls.ls_id']
    }, true);
    var controller = abRplmLsAdminLeaseTemplateSelectTab_ctrl;
    
    View.confirm(getMessage('message_confirm_delete'), function(button){
        if (button == 'yes') {
            //delete record
            controller.abRplmLsAdminLeaseTemplateSelectTab_ds.deleteRecord(record);
            
            //refresh grid panel
            controller.abRplmLsAdminLeaseTemplateSelectTab_grid.refresh();
        }
    })
}


//onclick event listener for grid row button 'Select'
function selectLease(row){
    var ls_id = row['ls.ls_id'];
    editLease(ls_id);
}

//refresh edit tabs and select 'Lease' tab
function editLease(ls_id){
    var openerController = View.controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl');
    
    //set ls_id to the wizard level
    openerController.ls_id = ls_id;
    
    //refresh panels
    var restriction = new Ab.view.Restriction();
    restriction.addClause('ls.ls_id', ls_id);
//    openerController.abRplmLsAdminLeaseTemplateLeaseTab_form.refresh(restriction);
   // openerController.documentsGrid.refresh(restriction);
    openerController.refreshContactsTree = true;
  //  openerController.gridBaseRents.refresh(restriction);
    openerController.gridLeaseAdminClauses.refresh(restriction);
    openerController.gridLeaseAdminOptions.refresh(restriction);
  //  openerController.gridLeaseAdminAmendments.refresh(restriction);
    
    
    //show tabs
 //   openerController.leaseTemplatesTabs.selectTab('leaseTab', null, false, false, true);
//    openerController.leaseTemplatesTabs.showTab("leaseTab", true);
   // openerController.leaseTemplatesTabs.showTab("documentsTab", true);
   // openerController.leaseTemplatesTabs.showTab("contactsTab", true);
   // openerController.leaseTemplatesTabs.showTab("baseRentsTab", true);
   
	//added since we are not showing the lease tab
	openerController.leaseTemplatesTabs.selectTab('clausesTab', null, false, false, true);
	
    openerController.leaseTemplatesTabs.showTab("clausesTab", true);
    openerController.leaseTemplatesTabs.showTab("optionsTab", true);
   // openerController.leaseTemplatesTabs.showTab("amendmentsTab", true);
}


function saveNewLease(){
    var controller = abRplmLsAdminLeaseTemplateSelectTab_ctrl;
    if (!validateData(controller.abRplmLsAdminNewLeaseTemplate_ds, controller.abRplmLsAdminNewLeaseTemplate_form)) {
        return;
    }
    var newLsId = controller.abRplmLsAdminNewLeaseTemplate_form.getFieldValue('ls.ls_id');
    if (controller.useTemplate) {
        try {
		//Note BRG Modified the workflow to only copy ls, op and clauses
            Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, controller.selectedLease, '1', '', '', 'LANDLORD_TENANT', 'ls.ls_parent_id', 'ls.lease_sublease');
            controller.abRplmLsAdminNewLeaseTemplate_form.closeWindow();
            editLease(newLsId);
            controller.abRplmLsAdminLeaseTemplateSelectTab_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
    else {
        controller.abRplmLsAdminNewLeaseTemplate_form.setFieldValue('ls.use_as_template', '1');
        if (controller.abRplmLsAdminNewLeaseTemplate_form.save()) {
            controller.abRplmLsAdminNewLeaseTemplate_form.closeWindow();
            editLease(newLsId);
            controller.abRplmLsAdminLeaseTemplateSelectTab_grid.refresh();
        }
    }
}

function validateData(dataSource, form){
    /*
     * check lease code (ls.id)
     */
    if (!form.getFieldValue('ls.ls_id')) {
        View.showMessage(getMessage('err_no_lease'));
        return false;
    }
    if (dataSource.getRecords('ls.ls_id = \'' + form.getFieldValue('ls.ls_id') + '\'').length > 0) {
        View.showMessage(getMessage('err_lsId'));
        return false;
    }
    return true;
}

function setUseTemplate(isTrue){
    abRplmLsAdminLeaseTemplateSelectTab_ctrl.useTemplate = isTrue;
    
}

function setSelectedLease(row){
    abRplmLsAdminLeaseTemplateSelectTab_ctrl.selectedLease = row['ls.ls_id'];
}
