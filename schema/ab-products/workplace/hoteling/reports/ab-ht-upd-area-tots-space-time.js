var controller = View.createController('updAreaTotsSpaceTimeController', {
    
    updateRuleId: 'AbCommonResources-SpaceService-updateAreaTotalsSpaceTimeAndPerformChargeBack',
    /**
     * Refresh parent view and close the current dialog
     */
    dateParameterPanel_onUpdate: function(){

		var dateStart = this.dateParameterPanel.getFieldValue("rmpct.date_start");
		var dateEnd = this.dateParameterPanel.getFieldValue("rmpct.date_end");
		if (!(dateStart && dateEnd)) {
			View.showMessage(getMessage("enterDateValue"));
			return;
		}
		if (compareLocalizedDates(this.dateParameterPanel.getFieldElement('rmpct.date_end').value, this.dateParameterPanel.getFieldElement('rmpct.date_start').value)) {
			View.showMessage(getMessage('errorDateStartEnd'));
			return;
		}
	   try{
			Workflow.callMethod(this.updateRuleId, dateStart, dateEnd);
		}
       catch (e) {
            Workflow.handleError(e);
        }
		View.getOpenerView().controllers.get('hotelCostRptController').onRefresh();
        View.getOpenerView().closeDialog();
    }
});