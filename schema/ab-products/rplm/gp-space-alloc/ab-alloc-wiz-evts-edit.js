var allocWizEvtsEditController = View.createController('allocWizEvtsEdit',{
	oldBlId : '',
	type : '',
	
	allocWizEvtsEdit_eventEdit_afterRefresh: function() {
		var area = asFloat(this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.area'));
		var ls_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.ls_id');
		if (ls_id != '') this.allocWizEvtsEdit_eventEdit.enableField('gp.name', false);
		if (area > 0) {
			this.allocWizEvtsEdit_eventEdit.enableField('gp.area_manual',false);
			this.allocWizEvtsEdit_eventEdit.enableField('gp.pct_floor',false);
			this.allocWizEvtsEdit_eventEdit.fields.get('gp.count_em').actions.get(0).show(false);
			this.allocWizEvtsEdit_eventEdit.fields.get('gp.pct_floor').actions.get(0).show(false);
		} else {
			this.allocWizEvtsEdit_eventEdit.enableField('gp.area_manual',true);
			this.allocWizEvtsEdit_eventEdit.enableField('gp.pct_floor',true);
			this.allocWizEvtsEdit_eventEdit.fields.get('gp.count_em').actions.get(0).show(true);
			this.allocWizEvtsEdit_eventEdit.fields.get('gp.pct_floor').actions.get(0).show(true);
		}
		if (this.allocWizEvtsEdit_eventEdit.newRecord) {
			this.allocWizEvtsEdit_eventEdit.enableButton('delete', false);
			if (View.parameters.dateReview) {
				this.allocWizEvtsEdit_eventEdit.setFieldValue('gp.date_start', View.parameters.dateReview);
			}
		}
		else {
			this.allocWizEvtsEdit_eventEdit.enableButton('delete', true);
			this.oldBlId = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.bl_id');
		}
		if (View.parameters.isGapChartMonthly) {
			setFormReadOnly('allocWizEvtsEdit_eventEdit');
		}
		
		var record = this.allocWizEvtsEdit_eventEdit.getOutboundRecord();
		if (!this.allocWizEvtsEdit_eventEdit.newRecord) checkOverAlloc(record, View.panels.get('allocWizEvtsEdit_eventEdit'));
	},
	
	allocWizEvtsEdit_eventEdit_onSave: function() {
		this.allocWizEvtsEdit_eventEdit.clearValidationResult();
		if (!this.allocWizEvtsEdit_eventEdit.canSave()) return;
		var date_start = getDateObject(this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.date_start'));
    	var date_end = getDateObject(this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.date_end'));
    	if (date_end != '' && date_end < date_start) {
    		View.showMessage(getMessage('formMissingValues'));
    		this.allocWizEvtsEdit_eventEdit.addInvalidField('gp.date_end', getMessage('endBeforeStart'));
    		this.allocWizEvtsEdit_eventEdit.displayValidationResult('');
    		return false;
    	}
    	var bl_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.bl_id');
    	var fl_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.fl_id');
    	var area_usable = asFloat(getFlAreaUsable(bl_id, fl_id, this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.date_start')));
		if (area_usable == 0) {
			View.showMessage(getMessage('error_no_floor_area'));
			return false;			
		}
		var pct_floor = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.pct_floor');
		if (pct_floor > 120) {
			View.showMessage(getMessage('pctFloorExceedsHundred'));
		}
		
		if (!this.allocWizEvtsEdit_eventEdit.save()) return;
		if (View.parameters.callback) View.parameters.callback(date_start);
		
		var record = this.allocWizEvtsEdit_eventEdit.getOutboundRecord();
		var isOverAlloc = checkOverAlloc(record, View.panels.get('allocWizEvtsEdit_eventEdit'));
		
		if (!isOverAlloc) {
			View.closeThisDialog();
		}
	},
	
	allocWizEvtsEdit_eventEdit_onDelete: function() {
		var controller = this;
		var lastRecord = false;
		if (this.oldBlId != '') {
			var scn_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.portfolio_scenario_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.portfolio_scenario_id', scn_id);
			restriction.addClause('gp.bl_id', this.oldBlId);
			var records = this.allocWizEvtsEdit_ds0.getRecords(restriction);
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
		var date_start = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.date_start');
		if (!this.allocWizEvtsEdit_eventEdit.deleteRecord()) return;
		if (View.parameters.callback) View.parameters.callback(getDateObject(date_start));
		View.closeThisDialog();
	},

	onApplyHeadcount: function() {
		if (!checkRequiredFields('allocWizEvtsEdit_eventEdit')) return false;
		var headcount = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.count_em');
		var gp_area = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.area');
		if ((gp_area > 0 ) || ( headcount == 0)) {
			if (headcount == 0) View.showMessage(getMessage('error_zero_headcount'));
			return;
		}
		
		var bl_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.bl_id');
		var fl_id = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.fl_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', bl_id);
		restriction.addClause('fl.fl_id', fl_id);
		var records = View.dataSources.get('allocWizCommon_dsStdArea').getRecords(restriction);
		if (records.length < 1) {
			View.showMessage(getMessage('error_no_floor_std_area'));
			return;
		}
		
		var record = records[0];
		var std_area_per_em = asFloat(record.getValue('fl.std_area'));
		if (std_area_per_em > 0) {
			var area_per_employee = std_area_per_em;
		} else {
			var units = View.project.units;
			if (units == "imperial") {
				var area_per_employee = getMessage('area_per_employee_Imperial');
			}
			else {
				var area_per_employee = getMessage('area_per_employee_Metric');
			}
		}

		var gp_area_manual = headcount * area_per_employee;
		
		var date_start = this.allocWizEvtsEdit_eventEdit.getFieldValue('gp.date_start');
		var pct_floor = calcPctFloor(bl_id, fl_id, gp_area_manual, date_start);
		if (pct_floor == '') {
			View.showMessage(getMessage('error_no_floor_area'));
			return;			
		}
		if (pct_floor > 120.00) {
			View.showMessage(getMessage('pctFloorExceedsHundred'));
		}
		if (gp_area_manual > 0) {
			this.allocWizEvtsEdit_eventEdit.setFieldValue('gp.area_manual', gp_area_manual.toString());
			if (pct_floor != '') this.allocWizEvtsEdit_eventEdit.setFieldValue('gp.pct_floor', pct_floor.toString());
		}
	}
});