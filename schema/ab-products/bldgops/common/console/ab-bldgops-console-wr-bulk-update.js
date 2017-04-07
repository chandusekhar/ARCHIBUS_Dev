/**
 * Controller for the bulk work request update.
 */
var wrBulkUpdate=View.createController('wrBulkUpdate', {

	records : null,
	
	/**
	 * After view loaded.
	 */
	afterViewLoad : function() {
		// KB3016857 -Allow craftspersons to be members of more than one team
		var cfSelectValueRestriction = 'cf.work_team_id IS NULL OR cf.work_team_id IN (select cf.work_team_id from cf where cf.email= ${sql.literal(user.email)})';
		if (Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting', 'cf_work_team', 'cf_id').value) {
			cfSelectValueRestriction = "cf.work_team_id IS NULL OR cf.cf_id IN (SELECT cf_work_team.cf_id FROM cf_work_team WHERE cf_work_team.work_team_id IN (SELECT cf_work_team.work_team_id FROM cf_work_team,cf where cf_work_team.cf_id = cf.cf_id and cf.email= ${sql.literal(user.email)}))";
		}
		
		this.wrcfForm.fields.get("wrcf.cf_id").actions.get(0).command.commands[0].dialogRestriction = cfSelectValueRestriction;
	},

	/**
	 * After initial data fetch. collapse some panels.
	 */
	afterInitialDataFetch : function() {
		var isPlanner = this.cfPlannerDS.getRecord().getValue('cf.is_planner');
		// set field values for multiple work request
		var wrRecords = View.getOpenerView().WRrecords;
		if (valueExistsNotEmpty(wrRecords)) {
			this.setValueForMultipleWr(wrRecords);
		}
		
		var selectedWrRecordsForAction = View.getOpenerView().controllers.get("opsConsoleWrListActionController").selectedWrRecordsForAction;
		for(var i=0;i<selectedWrRecordsForAction.length;i++){
			if(selectedWrRecordsForAction[i].getValue('wr.isRequestSupervisor') == 'false' && isPlanner !='1' ){
				this.wrUpdates.actions.get('addCf').show(false);
				break;
			}
		}
		
		for(var i=0;i<selectedWrRecordsForAction.length;i++){
			if(selectedWrRecordsForAction[i].getValue('wr.isRequestSupervisor') == 'false' && selectedWrRecordsForAction[i].getValue('wr.isRequestCraftsperson') == 'true' ){
				jQuery('#forwardIssuedRequest').hide();
				break;
			}
		}
		
	},
	
	/**
	 * forward all selected work requests
	 */
	wrUpdates_onForwardIssuedRequest : function() {
		var wrRecords = this.records;
		var wrIdList = [];
		if (valueExistsNotEmpty(wrRecords)) {
			for ( var i = 0; i < wrRecords.length; i++) {
				var record = wrRecords[i];
				var wrId = record.getValue('wr.wr_id');
				wrIdList.push(parseInt(wrId));
			}
			
			this.forwardForm.forwardIssuedRequest = true;
			this.forwardForm.wrIdList = wrIdList;
			jQuery('#forwardForm_forward_comments_labelCell').parent().show();
			this.forwardForm.showInWindow({
				x : 10,
				y : 100,
				modal : true,
				width : 600,
				height : 300,
				title : getMessage('forwordFormTitle')
			});
		}

	},

	/**
	 * update selected work request
	 */
	wrUpdates_onUpdateRequest : function() {
		var wrRecords = this.records;
		if (valueExistsNotEmpty(wrRecords)) {
			for ( var i = 0; i < wrRecords.length; i++) {
				var record = wrRecords[i];
				var wrId = record.getValue('wr.wr_id');
				var status = record.getValue('wr.status');
				record = this.updateValueForEdit(record);

				try {
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', record.values, status);
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		}

		View.closeThisDialog();
	},

	/**
	 * set field values for multiple work request
	 */
	setValueForMultipleWr : function(wrRecords) {
		var restriction = new Ab.view.Restriction();
		if (wrRecords.length > 1) {
			var wrIds = [];
			for ( var i = 0; i < wrRecords.length; i++) {
				wrIds.push(wrRecords[i]['wr.wr_id']);
			}
			restriction.addClause('wr.wr_id', wrIds, 'IN');
		} else {
			restriction.addClause('wr.wr_id', wrRecords[0]['wr.wr_id'], '=');
		}

		this.records = this.wrDetailsDS.getRecords(restriction);

		var fields = [ 'wr.ac_id', 'wr.cause_type', 'wr.repair_type', 'wr.cf_notes' ];
		for ( var i = 0; i < fields.length; i++) {
			this.setFieldValue(fields[i], this.records);
		}
	},

	/**
	 * set field value in the form for multiple records
	 */
	setFieldValue : function(fieldName, records) {
		var fieldValue = records[0].getValue(fieldName);
		for ( var i = 0; i < records.length; i++) {
			if (records[i].getValue(fieldName) != fieldValue) {
				fieldValue = '<VARIES>';
				break;
			}
		}

		this.wrUpdates.setFieldValue(fieldName, fieldValue);
	},

	/**
	 * update value for multiple edit panel
	 */
	updateValueForEdit : function(record) {
		var fields = [ 'wr.ac_id', 'wr.cause_type', 'wr.repair_type', 'wr.cf_notes' ];
		for ( var i = 0; i < fields.length; i++) {
			var fieldValue = this.wrUpdates.getFieldValue(fields[i]);
			if (fieldValue != '<VARIES>') {
				record.setValue(fields[i], fieldValue);
			}
		}

		return this.wrDetailsDS.processOutboundRecord(record);
	},
	
	/**
	 * Template function to get selected record from dialog from
	 */
	openFindPartDialog: function(){
		var form = View.panels.get('wrptForm');
		var wrIds = [];
		
		var wrRecords = View.getOpenerView().WRrecords;
		
		if (wrRecords.length > 1) {
			for ( var i = 0; i < wrRecords.length; i++) {
				wrIds.push(wrRecords[i]['wr.wr_id']);
			}
		} else {
			wrIds.push(wrRecords[0]['wr.wr_id']);
		}
		
		//Define parameter panel
		View.parameterPanel=View.panels.get('wrptForm');
		//Test 'XC' building
		View.workRequestIds= wrIds;
		
		View.openDialog('ab-bldgops-find-parts.axvw',null,false,{maximize: true, title: getMessage('findPartDialogTitle'), width:1200, height:1000});
	}
});

/**
 * Bulk update for all selected work requests
 */
function runBulkUpdate(form, tableName, ruleId) {
	var panel = View.panels.get(form);
	var fields = panel.getFieldValues();
	
	//KB3041184 - From Fred - We are going to omit using Other Resource Type for now, 
	//because it requires more sample data that we can probably safely remove from the Quick-Start process 
	if(form == 'wrotherForm'){
		//KB3042802 - Many user ask add Other Resource Type, so add other resource type again, comment out below code
		//fields['wr_other.other_rs_type'] = ' ';
	}else{
		if(!panel.canSave()){
			return false;
		}
	}
	
	var result = {};
	var bulkUpdateController = View.controllers.get('wrBulkUpdate');
	var wrRecords = bulkUpdateController.records;
	
	if (valueExistsNotEmpty(wrRecords)) {
		var actualHours = 0;
		var doubleHours = 0;
		var overTimeHours = 0;
		
		var isDivideTime = false;
		
		//for update craftsperson, check isDivideTime check box, if true, divide hours to every work request
		if (tableName == 'wrcf') {
			isDivideTime = $('divideTime').checked;
			if (isDivideTime) {
				actualHours = fields['wrcf.hours_straight'];
				doubleHours = fields['wrcf.hours_double'];
				overTimeHours = fields['wrcf.hours_over'];
				if (actualHours) {
					actualHours = actualHours / wrRecords.length;
				}
				if (doubleHours) {
					doubleHours = doubleHours / wrRecords.length;
				}
				if (overTimeHours) {
					overTimeHours = overTimeHours / wrRecords.length;
				}
			}
		}

		//Call wfr to update every record
		for ( var i = 0; i < wrRecords.length; i++) {
			var record = wrRecords[i];
			var wrId = record.getValue('wr.wr_id');
			var values = WRBU_Clone(fields);
			values[tableName + ".wr_id"] = wrId;
			
			//reset the craftsperson actual hour of isDivideTime is checked
			if (tableName == 'wrcf') {
				if (isDivideTime) {
					values['wrcf.hours_straight'] = actualHours;
					values['wrcf.hours_double'] = doubleHours;
					values['wrcf.hours_over'] = overTimeHours;
				}
				
				//KB3041457 - consider a way to change the bulk Update feature to update existing wrcf records	
				checkExistingWrcf(values);
			}
			
			try {
				result = Workflow.callMethod(ruleId, values);
			} catch (e) {
				panel.validationResult.valid = false;
				panel.displayValidationResult(e);
				return false;
			}
		}
	}
	
	View.getOpenerView().panels.get('wrList').refresh();
	View.getOpenerView().controllers.get('opsConsoleWrListActionController').keepReqeustsSelectedAfterRefresh();
	panel.closeWindow();
}

/**
 * Check if existing wrcf match to update - KB3041457
 */
function checkExistingWrcf(wrcfValues) {
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('wrcf.cf_id',wrcfValues['wrcf.cf_id'], '=');
	restriction.addClause('wrcf.wr_id',wrcfValues['wrcf.wr_id'], '=');
	var wrcfDS = View.dataSources.get('wrcfDS');
	var wrcfRecords = wrcfDS.getRecords(restriction);
	var existingRecord = null;
	if(wrcfRecords.length>0){
		for(var i=0;i<wrcfRecords.length;i++){
			var wrcfRecord = wrcfDS.processOutboundRecord(wrcfRecords[i]);
			var actualHours = formatNumber(wrcfRecord.getValue('wrcf.hours_straight'));
			var doubleHours = formatNumber(wrcfRecord.getValue('wrcf.hours_double'));
			var overTimeHours = formatNumber(wrcfRecord.getValue('wrcf.hours_over'));
			var dateStart = wrcfRecord.getValue('wrcf.date_start');
			var timeStart = wrcfRecord.getValue('wrcf.time_start');
			var dateEnd = wrcfRecord.getValue('wrcf.date_end');
			var timeEnd = wrcfRecord.getValue('wrcf.time_end');
			var workType = wrcfRecord.getValue('wrcf.work_type');
			
			if(((actualHours =='0.00' && wrcfValues['wrcf.hours_straight']!='0.00') || wrcfValues['wrcf.hours_straight']=='0.00')
					&& ((doubleHours =='0.00' && wrcfValues['wrcf.hours_double']!='0.00') || wrcfValues['wrcf.hours_double']=='0.00')
					&& ((overTimeHours =='0.00' && wrcfValues['wrcf.hours_over']!='0.00') || wrcfValues['wrcf.hours_over']=='0.00')
					&& ((dateStart =='' && valueExistsNotEmpty(wrcfValues['wrcf.date_start'])) || !valueExistsNotEmpty(wrcfValues['wrcf.date_start']))
					&& ((timeStart =='' && valueExistsNotEmpty(wrcfValues['wrcf.time_start'])) || !valueExistsNotEmpty(wrcfValues['wrcf.time_start']))
					&& ((dateEnd =='' && valueExistsNotEmpty(wrcfValues['wrcf.date_end'])) || !valueExistsNotEmpty(wrcfValues['wrcf.date_end']))
					&& ((timeEnd =='' && valueExistsNotEmpty(wrcfValues['wrcf.time_end'])) || !valueExistsNotEmpty(wrcfValues['wrcf.time_end']))
					&& ((workType =='UnSp' && wrcfValues['wrcf.work_type']!='UnSp') || wrcfValues['wrcf.work_type']=='UnSp')
			){
				existingRecord = wrcfRecord;
				break;
			}
			
		}
		
		if(existingRecord){
			wrcfValues['wrcf.date_assigned'] =  existingRecord.getValue('wrcf.date_assigned');
			wrcfValues['wrcf.time_assigned'] =  existingRecord.getValue('wrcf.time_assigned');
			wrcfValues['wrcf.hours_straight'] =  formatNumber(existingRecord.getValue('wrcf.hours_straight'))=='0.00'? wrcfValues['wrcf.hours_straight'] :existingRecord.getValue('wrcf.hours_straight') ;
			wrcfValues['wrcf.hours_double'] =  formatNumber(existingRecord.getValue('wrcf.hours_double'))=='0.00'? wrcfValues['wrcf.hours_double'] :existingRecord.getValue('wrcf.hours_double') ;
			wrcfValues['wrcf.hours_over'] =  formatNumber(existingRecord.getValue('wrcf.hours_over'))=='0.00'? wrcfValues['wrcf.hours_over'] :existingRecord.getValue('wrcf.hours_over') ;
			
			if(valueExistsNotEmpty(wrcfValues['wrcf.date_start'])){
				wrcfValues['wrcf.date_start'] =  existingRecord.getValue('wrcf.date_start')==''? wrcfValues['wrcf.date_start'] :existingRecord.getValue('wrcf.date_start') ;
			}
			if(valueExistsNotEmpty(wrcfValues['wrcf.time_start'])){
				wrcfValues['wrcf.time_start'] =  existingRecord.getValue('wrcf.time_start')==''? wrcfValues['wrcf.time_start'] :existingRecord.getValue('wrcf.time_start') ;
			}
			if(valueExistsNotEmpty(wrcfValues['wrcf.date_end'])){
				wrcfValues['wrcf.date_end'] =  existingRecord.getValue('wrcf.date_end')==''? wrcfValues['wrcf.date_end'] :existingRecord.getValue('wrcf.date_end') ;
			}
			if(valueExistsNotEmpty(wrcfValues['wrcf.time_end'])){
				wrcfValues['wrcf.time_end'] =  existingRecord.getValue('wrcf.time_end')==''? wrcfValues['wrcf.time_end'] :existingRecord.getValue('wrcf.time_end') ;
			}
			
			wrcfValues['wrcf.work_type'] =  existingRecord.getValue('wrcf.work_type')=='UnSp'? wrcfValues['wrcf.work_type'] :existingRecord.getValue('wrcf.work_type') ;
		}
	}
}

function WRBU_Clone(originalObject) {
	var newObject = {};
	
	for ( var key in originalObject )
    {
	    if ( typeof(originalObject[key]) == 'object')
        { 
            newObject[key] = WRBU_Clone(originalObject[key]);
        }
        else
        {
            newObject[key] = originalObject[key];
        }
    }
    return newObject;
}

function formatNumber(value) {
	if(value == '0'){
		return '0.00'
	}else{
		return value;
	}
}


/**
 * Over write core API to open Add new dialog and close select value dialog.
 */
Ab.grid.SelectValue.prototype.onAddNew = function() {
	var parameters = Ab.view.View.selectValueParameters;
	var title = parameters.title;
	View.closeDialog();
	View.openDialog(this.addNewDialog, null, false, {
		x : 100,
		y : 100,
		width : 850,
		height : 800,
		title : this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_ADD_NEW) + ' ' + title,
		useAddNewSelectVDialog : false,
		closeButton : false
	});
}