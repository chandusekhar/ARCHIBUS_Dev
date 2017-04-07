var allocWizEvtsEditUnavailController = View.createController('allocWizEvtsEditUnavail',{
	oldBlId : '',
	type : '',
	
	allocWizEvtsEditUnavail_eventEdit_afterRefresh: function() {
		if (this.allocWizEvtsEditUnavail_eventEdit.newRecord) {
			this.allocWizEvtsEditUnavail_eventEdit.setFieldValue('gp.is_available', '0');
			this.allocWizEvtsEditUnavail_eventEdit.enableButton('delete', false);
			var description = getMessage('groupAllocation');
			this.allocWizEvtsEditUnavail_eventEdit.setFieldValue('gp.description', description);
			this.allocWizEvtsEditUnavail_eventEdit.setFieldValue('gp.name', getMessage('unavail'));
			if (View.parameters.dateReview) {
				this.allocWizEvtsEditUnavail_eventEdit.setFieldValue('gp.date_start', View.parameters.dateReview);
			}
		}
		else {
			this.allocWizEvtsEditUnavail_eventEdit.enableButton('delete', true);
			this.oldBlId = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.bl_id');
		}
		if (View.parameters.isGapChartMonthly) {
			setFormReadOnly('allocWizEvtsEditUnavail_eventEdit');
		}
		
		var record = this.allocWizEvtsEditUnavail_eventEdit.getOutboundRecord();
		if (!this.allocWizEvtsEditUnavail_eventEdit.newRecord) checkOverAlloc(record, View.panels.get('allocWizEvtsEditUnavail_eventEdit'));
	},
	
	allocWizEvtsEditUnavail_eventEdit_onSave: function() {
		this.allocWizEvtsEditUnavail_eventEdit.clearValidationResult();
		if (!this.allocWizEvtsEditUnavail_eventEdit.canSave()) return;
		var date_start = getDateObject(this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.date_start'));
    	var date_end = getDateObject(this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.date_end'));
    	if (date_end != '' && date_end < date_start) {
    		View.showMessage(getMessage('formMissingValues'));
    		this.allocWizEvtsEditUnavail_eventEdit.addInvalidField('gp.date_end', getMessage('endBeforeStart'));
    		this.allocWizEvtsEditUnavail_eventEdit.displayValidationResult('');
    		return false;
    	}
    	var bl_id = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.bl_id');
    	var fl_id = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.fl_id');
    	var area_usable = asFloat(getFlAreaUsable(bl_id, fl_id, this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.date_start')));
		if (area_usable == 0) {
			View.showMessage(getMessage('error_no_floor_area'));
			return false;			
		}
		var pct_floor = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.pct_floor');
		if (pct_floor > 120) {
			this.allocWizEvtsEditUnavail_eventEdit.addInvalidField('gp.pct_floor', '');
			this.allocWizEvtsEditUnavail_eventEdit.displayValidationResult('');
			View.showMessage(getMessage('pctFloorExceedsHundred'));
			return false;
		}
		
		if (!this.allocWizEvtsEditUnavail_eventEdit.save()) return;
		if (View.parameters.callback) View.parameters.callback(date_start);
		
		var record = this.allocWizEvtsEditUnavail_eventEdit.getOutboundRecord();
		var isOverAlloc = checkOverAlloc(record, View.panels.get('allocWizEvtsEditUnavail_eventEdit'));
		
		if (!isOverAlloc) {
			View.closeThisDialog();
		}
	},
	
	allocWizEvtsEditUnavail_eventEdit_onDelete: function() {
		var controller = this;
		var lastRecord = false;
		if (this.oldBlId != '') {
			var scn_id = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.portfolio_scenario_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.portfolio_scenario_id', scn_id);
			restriction.addClause('gp.bl_id', this.oldBlId);
			var records = this.allocWizEvtsEditUnavail_ds0.getRecords(restriction);
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
		var date_start = this.allocWizEvtsEditUnavail_eventEdit.getFieldValue('gp.date_start');
		if (!this.allocWizEvtsEditUnavail_eventEdit.deleteRecord()) return;
		if (View.parameters.callback) View.parameters.callback(getDateObject(date_start));
		View.closeThisDialog();
	}
});
