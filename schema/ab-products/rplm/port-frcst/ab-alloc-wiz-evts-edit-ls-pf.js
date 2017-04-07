var allocWizEvtsEditLsController = View.createController('allocWizEvtsEditLs',{
	oldBlId : '',
	type : '',
	
	allocWizEvtsEditLs_eventEdit_afterRefresh: function() {
		if (this.allocWizEvtsEditLs_eventEdit.newRecord) {
			this.allocWizEvtsEditLs_eventEdit.enableButton('delete', false);
			var description = getMessage('groupAllocation');
			this.allocWizEvtsEditLs_eventEdit.setFieldValue('gp.description', description);
			this.allocWizEvtsEditLs_eventEdit.setFieldValue('gp.name', getMessage('lease'));
			if (View.parameters.dateReview) {
				this.allocWizEvtsEditLs_eventEdit.setFieldValue('gp.date_start', View.parameters.dateReview);
			}
		}
		else {
			this.allocWizEvtsEditLs_eventEdit.enableButton('delete', true);
			this.oldBlId = this.allocWizEvtsEditLs_eventEdit.getFieldValue('gp.bl_id');
		}
		if (View.parameters.isGapChartMonthly) {
			setFormReadOnly('allocWizEvtsEditLs_eventEdit');
		}
		
		var record = this.allocWizEvtsEditLs_eventEdit.getOutboundRecord();
		if (!this.allocWizEvtsEditLs_eventEdit.newRecord) checkOverAlloc(record, View.panels.get('allocWizEvtsEditLs_eventEdit'));
	},
	
	allocWizEvtsEditLs_eventEdit_onSave: function() {
		this.allocWizEvtsEditLs_eventEdit.clearValidationResult();
		if (!this.allocWizEvtsEditLs_eventEdit.canSave()) return;
		var date_start = getDateObject(this.allocWizEvtsEditLs_eventEdit.getFieldValue('gp.date_start'));
    	var date_end = getDateObject(this.allocWizEvtsEditLs_eventEdit.getFieldValue('gp.date_end'));
    	if (date_end != '' && date_end < date_start) {
    		View.showMessage(getMessage('formMissingValues'));
    		this.allocWizEvtsEditLs_eventEdit.addInvalidField('gp.date_end', getMessage('endBeforeStart'));
    		this.allocWizEvtsEditLs_eventEdit.displayValidationResult('');
    		return false;
    	}
		
		if (!this.allocWizEvtsEditLs_eventEdit.save()) return;
		if (View.parameters.callback) View.parameters.callback(date_start);
		
		var record = this.allocWizEvtsEditLs_eventEdit.getOutboundRecord();
		var isOverAlloc = checkOverAlloc(record, View.panels.get('allocWizEvtsEditLs_eventEdit'));
		
		if (!isOverAlloc) {
			View.closeThisDialog();
		}
	},
	
	allocWizEvtsEditLs_eventEdit_onDelete: function() {
		var controller = this;
		var lastRecord = false;
		if (this.oldBlId != '') {
			var scn_id = this.allocWizEvtsEditLs_eventEdit.getFieldValue('gp.portfolio_scenario_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.portfolio_scenario_id', scn_id);
			restriction.addClause('gp.bl_id', this.oldBlId);
			var records = this.allocWizEvtsEditLs_ds0.getRecords(restriction);
			if (records.length == 1) lastRecord = true;
		}
		if (lastRecord) {
			View.confirm(getMessage('confirmDeleteLastRecord'), function(button){
		         if (button == 'yes') {
		        	 controller.deleteEvent();
		         }
			});	
		} else {
			View.confirm(getMessage('confirmDelete'), function(button){
	            if (button == 'yes') {
	            	controller.deleteEvent();
	            }
			});
		}
	},
	
	deleteEvent: function() {
		var date_start = this.allocWizEvtsEditLs_eventEdit.getFieldValue('gp.date_start');
		if (!this.allocWizEvtsEditLs_eventEdit.deleteRecord()) return;
		if (View.parameters.callback) View.parameters.callback(getDateObject(date_start));
		View.closeThisDialog();
	}
});
