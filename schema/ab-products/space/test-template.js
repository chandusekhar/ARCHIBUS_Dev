var controller = View.createController('abSpEnableRmtransController', {
		
	/**
	 * @inherit
	 */
	panel_abMoEditReviewEm_moForm_onSaveButton: function(){
		
		try{
			//workflow AllRoomPercentageUpdate.SynchronizePercentages()
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransaction-testTemplate',"The service request with id ${activity_log.activity_log_id} has already been accepted by  <#if step.em_id??>${step.em_id}<#else><#if step.vn_id??>${step.vn_id}<#else>${step.user_name}</#if></#if>. Your acceptance is no longer required.");

		}catch(e){
			Workflow.handleError(e);
		}
	
	}
});
