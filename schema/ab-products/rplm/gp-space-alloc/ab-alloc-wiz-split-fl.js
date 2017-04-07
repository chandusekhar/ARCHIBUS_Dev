var allocWizSplitFlController = View.createController('allocWizSplitFl', {

	allocWizSplitFl_splitFloorForm1_onNext: function() {
		this.allocWizSplitFl_splitFloorForm1.clearValidationResult();
		var date_start = this.allocWizSplitFl_splitFloorForm1.getFieldValue('gp.date_start');
		var date_end = this.allocWizSplitFl_splitFloorForm1.getFieldValue('gp.date_end');
		if (!this.allocWizSplitFl_splitFloorForm1.canSave()) {
			return false;
		}
    	if (date_end < date_start) {
    		View.showMessage(getMessage('formMissingValues'));
    		this.allocWizSplitFl_splitFloorForm1.addInvalidField('gp.date_end', getMessage('endBeforeStart'));
    		this.allocWizSplitFl_splitFloorForm1.displayValidationResult('');
    		return false;
    	}
		this.allocWizSplitFl_tabs.selectTab('allocWizSplitFl_tab2');
		this.setFloorDetails();
	},
    
    setFloorDetails: function() {
    	var scn_id = View.getOpenerView().controllers.get('allocWizEvtsList').scn_id;
		var date_start = this.allocWizSplitFl_splitFloorForm1.getFieldValue('gp.date_start');
		var date_end = this.allocWizSplitFl_splitFloorForm1.getFieldValue('gp.date_end');
		
    	var restriction = this.allocWizSplitFl_splitFloorForm2.restriction;
		restriction.removeClause('gp.portfolio_scenario_id');
		this.allocWizSplitFl_ds1.addParameter('dateReview', date_start);
		var record = this.allocWizSplitFl_ds1.getRecord(restriction);
		var area_usable = record.getValue('fl.area_usable');
		this.allocWizSplitFl_splitFloorForm2.setFieldValue('fl.area_usable', area_usable);
		
		this.allocWizSplitFl_splitFloorForm2.setFieldValue('gp.portfolio_scenario_id', scn_id);
		this.allocWizSplitFl_splitFloorForm2.setFieldValue('gp.date_start', date_start);
		this.allocWizSplitFl_splitFloorForm2.setFieldValue('gp.date_end', date_end);
		this.allocWizSplitFl_splitFloorForm2.enableField('gp.date_start', false);
		this.allocWizSplitFl_splitFloorForm2.enableField('gp.date_end', false);
		
		if (area_usable == 0) {
			View.showMessage(getMessage('noFloorArea'));
		}
    },
    
    allocWizSplitFl_splitFloorForm2_beforeSave: function() {
    	var valid = true;
    	var date_start = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.date_start');
		var date_end = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.date_end');
    	
    	// field names
		var dv_id_field = '';
		var dp_id_field = '';
		var pct_floor_field = '';

		// form values
		var dv_id = '';
		var dp_id = '';
		var pct_floor = '';

		var gp_area_manual = 0;
		var pct_total = 0;
    	
		for (var i = 1; i < 11; i++){
			dv_id_field = "gp.dv_id." + i;
			dp_id_field = "gp.dp_id." + i;
			pct_floor_field = "gp.pct_floor." + i;

			dv_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue(dv_id_field);
			dp_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue(dp_id_field);
			pct_floor = this.allocWizSplitFl_splitFloorForm2.getFieldValue(pct_floor_field);
			
			if (i == 1 && dv_id == '') {
				this.allocWizSplitFl_splitFloorForm2.fields.get(dv_id_field).setInvalid('');
				valid = false;
			}
			
			if (i == 1 && dp_id == '') {
				this.allocWizSplitFl_splitFloorForm2.fields.get(dp_id_field).setInvalid('');
				valid = false;
			}

			if ((dv_id != '') && (dp_id != '') && (pct_floor != '')) {

				if (!valDpFields("dp.dv_id='" + dv_id + "' AND dp.dp_id = '" + dp_id + "'")) {
					this.allocWizSplitFl_splitFloorForm2.fields.get(dp_id_field).setInvalid(getMessage('error_invalid_dv_dp'));
					valid = false;
				}
				
				if ((dv_id != '') && (dp_id != '') && (pct_floor == '0')) {
					this.allocWizSplitFl_splitFloorForm2.fields.get(pct_floor_field).setInvalid(getMessage('error_no_pct'));
					valid = false;
				}

				pct_total = pct_total + asFloat(pct_floor);
			}
		}

		if (pct_total > 100) {
			this.allocWizSplitFl_splitFloorForm2.fields.get('gp.pct_floor.1').setInvalid(getMessage('error_pct_total'));
			valid = false;
		}
		return valid;
	},
	
	allocWizSplitFl_splitFloorForm1_onEditFl: function() {
		var restriction = this.allocWizSplitFl_splitFloorForm1.restriction;
		restriction.removeClause('gp.portfolio_scenario_id');
		View.openDialog('ab-alloc-wiz-fl-edit.axvw', restriction, false, {
    		width : 600,
			height : 500,
			closeButton : true,
			callback: function() {
				
		    }
		});
	},
	
	allocWizSplitFl_splitFloorForm2_onEditFl: function() {
		var restriction = this.allocWizSplitFl_splitFloorForm2.restriction;
		restriction.removeClause('gp.portfolio_scenario_id');
		View.openDialog('ab-alloc-wiz-fl-edit.axvw', restriction, false, {
    		width : 600,
			height : 500,
			closeButton : true,
			callback: function() {
				View.controllers.get('allocWizSplitFl').setFloorDetails();
		    }
		});
	},

	allocWizSplitFl_splitFloorForm2_onSave: function() {
		if (!this.allocWizSplitFl_splitFloorForm2.canSave()) {
			return false;
		}
		
		var bl_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.bl_id');
		var fl_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.fl_id');
		var date_start = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.date_start');
		var date_end = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.date_end');
		var portfolio_scenario_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue('gp.portfolio_scenario_id');
		var area_usable = asFloat(this.allocWizSplitFl_splitFloorForm2.getFieldValue('fl.area_usable'));

		// field names
		var dv_id_field = '';
		var dp_id_field = '';
		var pct_floor_field = '';

		// form values
		var dv_id = '';
		var dp_id = '';
		var pct_floor = '';

		var gp_area_manual = 0;
		var pct_total = 0;
		var record = {};

		for(var i = 1; i < 11; i++){

			dv_id_field = "gp.dv_id." + i;
			dp_id_field = "gp.dp_id." + i;
			pct_floor_field = "gp.pct_floor." + i;

			dv_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue(dv_id_field);
			dp_id = this.allocWizSplitFl_splitFloorForm2.getFieldValue(dp_id_field);
			pct_floor = this.allocWizSplitFl_splitFloorForm2.getFieldValue(pct_floor_field);
			
			if ((dv_id != '') && (dp_id != '') && (pct_floor != '')) {

				gp_area_manual = 0;

				if (area_usable > 0) {
					gp_area_manual = (asFloat(pct_floor) * area_usable) / 100.0;
				}
				
				var name = dv_id + '-' + dp_id;
				var description = String.format(getMessage('splitFloorDescription'));
				
				record = {};
	    		record['gp.bl_id'] = bl_id;
	    		record['gp.fl_id'] = fl_id;
	    		record['gp.dv_id'] = dv_id;
	    		record['gp.dp_id'] = dp_id;
	    		record['gp.name'] = name;
	    		record['gp.description'] = description;
	    		record['gp.pct_floor'] = pct_floor.toString();
	    		record['gp.area_manual'] = gp_area_manual.toString();
	    		record['gp.date_start'] = date_start;
	    		record['gp.date_end'] = date_end;
	    		record['gp.portfolio_scenario_id'] = portfolio_scenario_id;
				
				var parameters = {
					tableName: 'gp',
					fields: toJSON(record)
				};
				var result = Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
				if (result.code == 'executed') {
					View.getOpenerView().panels.get('allocWizEvtsList_events').refresh();
				} else   
				{
					alert(result.code + " :: " + result.message);
				}
			}
		}
		var outboundRecord = this.allocWizSplitFl_ds0.processOutboundRecord(record);
		var isOverAlloc = checkOverAlloc(outboundRecord, View.panels.get('allocWizSplitFl_splitFloorForm2'));
		
		if (!isOverAlloc) {
			View.closeThisDialog();
		} else {
			this.allocWizSplitFl_splitFloorForm2.enableButton('save', false);
		}
	}
		
});

function valDpFields(fieldsRestr){
	
	var parameters = {
		tableName: 'dp',
		fieldNames: toJSON(['dp.dp_id']),
		restriction: toJSON(fieldsRestr) 
	};

	try {
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);     		
		if (result.data.records.length == 0){
			return false;
		}
		else {
			return true;
		}
	} catch (e) {
		Workflow.handleError(e);
		return true;
	}
}


function asFloat(s) {
	var val = parseFloat(String(s).replace(/,/g, ""));
	if(isNaN(val)) val = 0;
	return val;
}