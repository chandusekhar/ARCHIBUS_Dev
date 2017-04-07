View.createController('addNewBl', {

	/**
	 * Set the dialog title.
	 */
	afterInitialDataFetch : function() {
		var openerView = View.getOpenerView();
		if (openerView && openerView.panels.get("createRequestForm")) {
			this.addNewBlForm.setFieldValue('bl.site_id', openerView.panels.get("createRequestForm").getFieldValue('activity_log.site_id'));
		}
	}

});
