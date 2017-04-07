/**
 * Controller for the Return Work request from Supervisor.
 */
var opsConsoleWrReturnController = View.createController('opsConsoleWrReturnController', {
	
	/**
     * After initial data fetch.
     */	
	afterInitialDataFetch: function(){
		var openerView = View.getOpenerView();
		var wrId = openerView.selectedWrIdForReturnSupervisor;
		jQuery('#prior_status').text(openerView.selectedPriorStatusText);
		this.loadWorkflowSteps(wrId,openerView.selectedPriorStatus);
	},
	
	/**
     * Load workflow steps.
     */	
	loadWorkflowSteps: function(wrId, status){
		 var result = {};
		 try {
			  result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getReturnWorkflowSteps',parseInt(wrId),status);
		 } catch (e) {
			  Workflow.handleError(e);
		 }
		 
		 if(result.code == 'executed'){
			this.returnWorkflowSteps = eval('('+result.jsonExpression+')');
			if(this.returnWorkflowSteps.length > 0){
				for(var i=0;i<this.returnWorkflowSteps.length;i++){
					this.writeWorkflowStepsRadioHtml(i);
				}
				if(status != 'R' && status!= View.getOpenerView().selectedWrStatusForReturnSupervisor){
					jQuery('<tr><td><input type="radio" name="workflowStepsOptions" value="0">'+getMessage('noneStep')+'</input></td></tr>').appendTo(jQuery('#workflowSteps'));
					jQuery('[name=workflowStepsOptions][value=0]').get(0).checked = true;
				}else{
					jQuery('[name=workflowStepsOptions][value=1]').get(0).checked = true;
				}
				
			}else{
				jQuery('#workflowSteps').prev().hide();
			}
		 }
		 
	},
	
	
	/**
	 * Write workflow step radio html.
	 */
	writeWorkflowStepsRadioHtml : function(index) {
		 jQuery('<tr><td><input type="radio" name="workflowStepsOptions" value="'+(index+1)+'">'+getMessage(this.returnWorkflowSteps[index].step)+' '+ getMessage('by')+ ' '+this.returnWorkflowSteps[index].user_name+'</input></td></tr>').appendTo(jQuery('#workflowSteps'));
	},
	
	/**
     * Event handler of Update Request button.
     */	
	returnForm_onReturn: function(){
		var comments = $('return_comments').value;
		if(!valueExistsNotEmpty(comments)){
			View.showMessage(getMessage('noCommentsForReturn'));
			return;
		}
		var openerView = View.getOpenerView();
		var wrId = openerView.selectedWrIdForReturnSupervisor;
		var status = openerView.selectedPriorStatus;
		var optionValue = 0;
		var stepOrder = 0;
		var userName = '';
		if(jQuery(':checked[name=workflowStepsOptions]').length>0){
			optionValue = parseInt(jQuery(':checked[name=workflowStepsOptions]').val());
			if(optionValue>0 && this.returnWorkflowSteps.length > 0){
				userName = this.returnWorkflowSteps[optionValue-1].user_name;
				stepOrder = this.returnWorkflowSteps[optionValue-1].step_order;
			}
			
		}
		try {
			  result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-returnWorkRequestFromSupervisor',parseInt(wrId),status,stepOrder, comments);
				var wrFilter = openerView.controllers.get('wrFilter');
				if (valueExists(wrFilter)) {
					// refresh the result grid to the keep consistent with the filter
					wrFilter.wrFilter_onFilter();
					var closeXbuttons = jQuery(window.parent.document).find('.x-tool-close');
					if(closeXbuttons.length > 1){
						//jQuery(closeXbuttons[closeXbuttons.length-1]).click();
						jQuery(closeXbuttons[closeXbuttons.length-2]).click();
					}
					
				}
		 } catch (e) {
			  Workflow.handleError(e);
		 }
	},
	
	/**
     * Event handler of cancel button.
     */	
	returnForm_onCancel: function(){
		var openerView = View.getOpenerView();
		openerView.closeDialog();
	}
	
});
