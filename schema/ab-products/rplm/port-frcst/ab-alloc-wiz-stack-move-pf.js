var allocWizStackMoveController = View.createController('allocWizStackMove', {
	date_start : '',
	date_end : '',
	dateReview : '',
	new_bl_id : '',
	new_fl_id : '',
	
    afterInitialDataFetch: function() {
    	var old_bl_fl_value = View.parameters.old_bl_fl_value;
    	var new_bl_fl_value = View.parameters.new_bl_fl_value;
    	this.date_start = this.allocWizStackMove_eventEdit.getFieldValue('gp.date_start');
    	this.date_end = this.allocWizStackMove_eventEdit.getFieldValue('gp.date_end');
    	this.dateReview = View.parameters.dateReview;
    	this.allocWizStackMove_eventEdit.setFieldValue('gp.option1', new_bl_fl_value);
    	this.allocWizStackMove_eventEdit.setFieldValue('gp.date_start', this.dateReview);
    	
    	var flRestriction = new Ab.view.Restriction();
    	flRestriction.addClause('gp.bl_fl', View.parameters.new_bl_fl_value);
    	var flRecord = this.allocWizStackMove_ds1.getRecord(flRestriction);
    	this.new_bl_id = flRecord.getValue('fl.bl_id');
    	this.new_fl_id = flRecord.getValue('fl.fl_id');
    	
    	var old_bl_id = this.allocWizStackMove_eventEdit.getFieldValue('gp.bl_id');
    	var old_fl_id = this.allocWizStackMove_eventEdit.getFieldValue('gp.fl_id');
    	var description = String.format(getMessage('description'), old_bl_id, old_fl_id);
    	this.allocWizStackMove_eventEdit.setFieldValue('gp.description', description);
    },
    
    allocWizStackMove_eventEdit_onSave: function() {
    	var gp_id = this.allocWizStackMove_eventEdit.getFieldValue('gp.gp_id');
    	var description = this.allocWizStackMove_eventEdit.getFieldValue('gp.description');
    	var date_move = this.allocWizStackMove_eventEdit.getFieldValue('gp.date_start');
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('gp.gp_id', gp_id);
    	var record = this.allocWizStackMove_ds0.getRecord(restriction);
    	
    	if (date_move == this.date_start) {
	    	record.setValue('gp.bl_id', this.new_bl_id);
	    	record.setValue('gp.fl_id', this.new_fl_id);
	    	this.allocWizStackMove_ds0.saveRecord(record);
    	}
    	else {
    		var oldRecord = record;
    		if (date_move < this.date_start) {
    			View.showMessage(getMessage('moveDateBeforeStartDate'));
    			return false;
    		}
    		
    		if (this.date_end != '' && date_move > this.date_end) {
    			View.showMessage(getMessage('moveDateAfterEndDate'));
    			return false;
    		}
    		
    		var date = getDateObject(date_move);
    		date.setDate(date.getDate()-1);
    		oldRecord.setValue('gp.date_end', FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD"));
    		this.allocWizStackMove_ds0.saveRecord(oldRecord);
    		
    		var area = oldRecord.getValue('gp.area');
    		var area_manual = oldRecord.getValue('gp.area_manual');
    		var gp_area = area==0?area_manual:area;
    		var pct_floor = calcPctFloor(this.new_bl_id, this.new_fl_id, gp_area, date_move);
    		
    		record = new Ab.data.Record();
    		record.setValue('gp.description', description);
    		record.setValue('gp.bl_id', this.new_bl_id);
    		record.setValue('gp.fl_id', this.new_fl_id);
    		record.setValue('gp.date_start', date_move);
    		record.setValue('gp.date_end', this.date_end);
    		record.setValue('gp.portfolio_scenario_id', oldRecord.getValue('gp.portfolio_scenario_id'));
    		record.setValue('gp.name', oldRecord.getValue('gp.name'));
    		record.setValue('gp.planning_bu_id', oldRecord.getValue('gp.planning_bu_id'));
    		record.setValue('gp.dv_id', oldRecord.getValue('gp.dv_id'));
    		record.setValue('gp.dp_id', oldRecord.getValue('gp.dp_id'));
    		record.setValue('gp.area', area);
    		record.setValue('gp.area_manual', area_manual);
    		record.setValue('gp.count_em', oldRecord.getValue('gp.count_em'));
    		record.setValue('gp.pct_floor', pct_floor);   		
    		this.allocWizStackMove_ds0.saveRecord(record);
    	}
    	
    	if (View.parameters.callback) View.parameters.callback(getDateObject(date_move));
    	
    	var outboundRecord = this.allocWizStackMove_ds0.processOutboundRecord(record);
		var isOverAlloc = checkOverAlloc(outboundRecord, View.panels.get('allocWizStackMove_eventEdit'));
		
		if (!isOverAlloc) {
			View.closeThisDialog();
		}
		else {
			this.allocWizStackMove_eventEdit.enableField('gp.date_start', false);
			this.allocWizStackMove_eventEdit.enableField('gp.description', false);
			this.allocWizStackMove_eventEdit.enableButton('save', false);
		}
    }
});

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
