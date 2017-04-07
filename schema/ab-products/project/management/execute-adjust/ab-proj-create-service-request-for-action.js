var projCreateServiceRequestController = View.createController('projCreateServiceRequest', {
	isValidUserProcess : true,
	
	afterInitialDataFetch: function() {
		var helpDeskProcess = [{activityId: 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		this.isValidUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);
	},
	
	projCreateServiceRequestForm_afterRefresh: function(){
		if(!this.isValidUserProcess) this.projCreateServiceRequestForm.enableAction('createRequest', false);
	},
	
	projCreateServiceRequestGrid_onSelectAction: function(row){
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
		var actionRestriction = new Ab.view.Restriction();
		actionRestriction.addClause('activity_log.activity_log_id', activity_log_id);
		this.projCreateServiceRequestForm.refresh(actionRestriction);
		this.projCreateServiceRequestForm.appendTitle(activity_log_id);
		this.projCreateServiceRequestForm.show(true);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE');
		restriction.addClause('activity_log.copied_from', activity_log_id);
		this.projCreateServiceRequestGridRequests.refresh(restriction);
		this.projCreateServiceRequestGridRequests.appendTitle(activity_log_id);
		this.projCreateServiceRequestGridRequests.show(true);
	},

	projCreateServiceRequestForm_onCreateRequest: function(){
		this.projCreateServiceRequestForm.save();
		this.projCreateServiceRequestGrid.refresh();
		
		var controller = this;
		if(!createWorkRequest(this.view, this.projCreateServiceRequestForm.getRecord(), function(){
			controller.projCreateServiceRequestGridRequests.refresh();
			controller.projCreateServiceRequestGrid.refresh();
		})){
			return;
		}
	}
});
/**
 * Create work request for deficiency
 * message 'siteCodeMandatToCreateServReq' must be defined in opener view
 * row must contains the following fields:
 * 	activity_log.site_id,activity_log.bl_id, activity_log.fl_id, activity_log.rm_id
 *  activity_log.location, activity_log.eq_id, activity_log.requestor,activity_log.phone_requestor
 *  activity_log.description, activity_log.activity_log_id, activity_log.date_scheduled
 *  
 * @param {Object} row - selected row from grid
 * @param {Object} callbackMethod
 */
function createWorkRequest(opener, record, callbackMethod){
	var status = record.getValue('activity_log.status');
	var site_id = record.getValue('activity_log.site_id');
	if (status != 'SCHEDULED' && status != 'IN PROGRESS') {
		View.showMessage(getMessage("statusScheduled"));
		return false;
	}
	if (!valueExistsNotEmpty(site_id)) {
		View.showMessage(getMessage("siteCodeMandatToCreateServReq"));
		return false;
	}
	var restriction = new Ab.view.Restriction({
		'activity_log.site_id': record.getValue('activity_log.site_id'),
		'activity_log.bl_id': record.getValue('activity_log.bl_id'),
		'activity_log.fl_id': record.getValue('activity_log.fl_id'),
		'activity_log.rm_id': record.getValue('activity_log.rm_id'),
		'activity_log.location': record.getValue('activity_log.location'),
		'activity_log.eq_id': record.getValue('activity_log.eq_id'),
		'activity_log.requestor': record.getValue('activity_log.requestor'),
		'activity_log.phone_requestor': record.getValue('activity_log.phone_requestor'),
		'activity_log.description': record.getValue('activity_log.description'),
		'activity_log.copied_from': record.getValue('activity_log.activity_log_id'),
		'activity_log.date_scheduled': record.getValue('activity_log.date_scheduled'),
		'activity_log.activity_type': 'SERVICE DESK - MAINTENANCE'
	});
	/*
	 * we must force the callback event on close dialog 
	 * action to refresh the main view
	 */
	opener.closeDialog = function(){
        if (this.dialog != null) {
    		this.dialog.close();
			if(this.dialogConfig.callback){
				this.dialogConfig.callback();
			}
			this.dialog = null;
        }
	}
	
	opener.openDialog('ab-ondemand-request-create.axvw', restriction, true, { 
		callback: function() {
			if(typeof callbackMethod == 'function'){
				callbackMethod();
			}
		}
	});	
}
