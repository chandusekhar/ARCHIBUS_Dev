View.createController('addNewRm', {

	/**
	 * Set the dialog title.
	 */
	afterInitialDataFetch : function() {
		var openerView = View.getOpenerView();
		if (openerView && openerView.panels.get("createRequestForm")) {
			this.addNewRmForm.setFieldValue('rm.bl_id', openerView.panels.get("createRequestForm").getFieldValue('activity_log.bl_id'));
			this.addNewRmForm.setFieldValue('rm.fl_id', openerView.panels.get("createRequestForm").getFieldValue('activity_log.fl_id'));
		}
	}

});
