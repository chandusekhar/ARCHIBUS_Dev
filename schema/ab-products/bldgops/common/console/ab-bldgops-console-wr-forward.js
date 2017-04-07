/**
 * Controller for the Work request tools.
 */
var opsConsoleWrForwardController = View.createController('opsConsoleWrForwardController', {

    /**
     * After initial data fetch..
     */	
	afterInitialDataFetch: function(){
		jQuery('#forwardForm_forward_comments_labelCell').parent().hide();
	},

	/**
	 * Save Forward
	 */
	forwardForm_onSaveForward : function() {
		var supervisor = this.forwardForm.getFieldValue('wr.supervisor');
		var workTeam = this.forwardForm.getFieldValue('wr.work_team_id');

		if (supervisor && workTeam) {
			View.alert(getMessage('selectOneForward'));
		} else if (!supervisor && !workTeam) {
			View.alert(getMessage('noForward'));
		} else {
			
			if(this.forwardForm.forwardIssuedRequest){
				this.forwardIssuedRequest(supervisor, workTeam);
				return;
			}
			
			var wrIds = [];
			if(this.forwardForm.wrIdList){
				wrIds = this.forwardForm.wrIdList;
				
			}else if (this.cfGrid.restriction.clauses[0].op != '=') {
				wrIds = this.cfGrid.restriction.clauses[0].value;
			} else {
				wrIds.push(this.cfGrid.restriction.clauses[0].value);
			}
			

			if (this.checkWorkOrder(wrIds)) {

				for ( var i = 0; i < wrIds.length; i++) {
					var activityLogId = this.forwardDS.getRecord('wr.wr_id=' + wrIds[i]).getValue('wr.activity_log_id');
					try {
						result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-updateRequest', activityLogId, '0', '0', '0', supervisor, '0', workTeam, {});
					} catch (e) {
						Workflow.handleError(e);
					}
				}

				this.forwardForm.closeWindow();
				View.getOpenerView().panels.get('wrList').refresh();
				keepConsoleReqeustsSelectedAfterRefresh();
				View.getOpenerView().closeDialog();

			} else {
				View.showMessage(getMessage('notAllWrSelected'));
			}
		}
	},
	
	/**
	 * Forward issued work request.
	 */
	forwardIssuedRequest : function(supervisor, workTeam) {
		
		var comments = $('forward_comments').value;
		if(!valueExistsNotEmpty(comments)){
			View.showMessage(getMessage('noCommentsForForward'));
			return;
		}
		
		if(this.checkWorkOrder(this.forwardForm.wrIdList)){
			try {
				Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-forwardIssuedWorkRequests', this.forwardForm.wrIdList, supervisor, workTeam, comments);
				this.forwardForm.closeWindow();
				View.getOpenerView().panels.get('wrList').refresh();
				keepConsoleReqeustsSelectedAfterRefresh();
				View.getOpenerView().closeDialog();
			} catch (e) {
				Workflow.handleError(e);
			}			
		} else {
			View.showMessage(getMessage('notAllWrSelected'));
		}
		
	},

	/**
	 * Check if all work request for the same work order are selected.
	 */
	checkWorkOrder : function(wrIds) {
		var isOK = true;

		for ( var i = 0; i < wrIds.length; i++) {

			var woId = this.forwardDS.getRecord('wr.wr_id=' + wrIds[i]).getValue('wr.wo_id');
			if (woId) {

				var allWRs = this.forwardDS.getRecords('wr.wo_id=' + woId + ' AND wr.wr_id NOT IN(' + wrIds.toString() + ')');
				if (allWRs.length > 0) {
					isOK = false;
					break;
				}
			}
		}

		return isOK;
	}
});
