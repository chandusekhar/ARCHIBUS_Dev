View.createController('addNewFl', {

	/**
	 * Set the dialog title.
	 */
	afterInitialDataFetch : function() {
		var openerView = View.getOpenerView();
		if (openerView && openerView.panels.get("createRequestForm")) {
			this.addNewFlForm.setFieldValue('fl.bl_id', openerView.panels.get("createRequestForm").getFieldValue('activity_log.bl_id'));
		}
	}

});
