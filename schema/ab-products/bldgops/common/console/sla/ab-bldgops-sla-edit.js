/**
 * Controller for edit details wizard.
 */
View.createController('editDetailsWizard', {
	/**
	 * The selected sla object.
	 */
	selectedSLA : null,

	/**
	 * Load selected sla.
	 */
	afterInitialDataFetch : function() {
		this.selectedSLA = View.getOpenerView().selectedSLA;
		this.trigger('app:operation:express:sla:showSlaSummary', this.selectedSLA);
		this.trigger('app:operation:express:sla:loadSLA', this.selectedSLA);
		
		//hide horizontal scroll bar of the tab
		jQuery('.x-tab').parent().css('overflow-x','hidden')
	}

});