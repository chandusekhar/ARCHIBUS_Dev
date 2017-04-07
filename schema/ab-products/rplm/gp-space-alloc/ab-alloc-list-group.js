var allocListGroupController = View.createController('allocListGroup', {

	flAreaUsable: 0,
	flAreaManual: 0,
	type: '',

	afterInitialDataFetch: function() {
		setPortfolioScenario();
	},

	allocGroupConsole_onFilter : function() {
		this.restoreSelection();
	},
    
	allocGroupConsole_onClear : function() {
		this.allocGroupConsole.clear();
		this.restoreSelection();
	},

	restoreSelection: function(){
		var restArray = allocCommonController.getConsoleRestriction();

		try {
			this.groupGrid.refresh(restArray["restriction"]);
		} catch (e) {
			Workflow.handleError(e);
		}

		this.allocGroupConsole.setTitle(restArray["title"]);
	},

    groupGrid_onAddNew: function() {

		var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');
		var blId = this.tabs.wizard.getBl();
		var flId = this.tabs.wizard.getFl();

		this.editGroupForm.refresh(null, true);

		this.editGroupForm.enableField('gp.area_manual',true);
		this.editGroupForm.enableField('gp.pct_floor',true);
		this.editGroupForm.enableButton('applyPercent', true);
		this.editGroupForm.enableButton('applyHeadcount', true);

		this.editGroupForm.setTitle(getMessage('addGroupTitle'));

		if ((blId != '') && (blId != null)) { this.editGroupForm.setFieldValue('gp.bl_id',blId);}
		if ((flId != '') && (flId != null)) { this.editGroupForm.setFieldValue('gp.fl_id',flId);}

		if ((portfolio_scenario_id != '')) {this.editGroupForm.setFieldValue('gp.portfolio_scenario_id',portfolio_scenario_id);}

        this.editGroupForm.showInWindow({
			newRecord: true,
            closeButton: false
        });
    },
    
    groupGrid_onAddGroups: function(type) {
    	this.type = type;
    	this.addGroupsForm.showInWindow({
			newRecord: true,
            closeButton: true
        });
    },
    
    addGroupsForm_onContinue: function() {
    	this.addGroupsForm_onAddGroups(this.type);
    },
    
    addGroupsForm_onAddGroups: function(type) {
    	var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');
		var bl_id = this.tabs.wizard.getBl();
		var fl_id = this.tabs.wizard.getFl();
		
		var date_start = this.addGroupsForm.getFieldValue('gp.date_start');
		var date_end = this.addGroupsForm.getFieldValue('gp.date_end');
		
		var ruleName = 'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-addRmGroups';
		if (type == 'em') ruleName = 'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-addEmGroups';
		
		View.openProgressBar(getMessage('addingGroups'));
		try {
			var result =  Workflow.callMethod(ruleName, date_start, date_end, portfolio_scenario_id, bl_id, fl_id);
			View.closeProgressBar();
			this.addGroupsForm.closeWindow();
			this.groupGrid.refresh();
		}
		catch (e) {
			View.closeProgressBar();
			Workflow.handleError(result);
		} 	
    },

    groupGrid_onIncludeFloor: function() {

		var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');
		var blId = this.tabs.wizard.getBl();
		var flId = this.tabs.wizard.getFl();

		this.includeFloorForm.refresh(null, true);

		if ((blId != '') && (blId != null)) { this.includeFloorForm.setFieldValue('gp.bl_id',blId);}
		if ((flId != '') && (flId != null)) { this.includeFloorForm.setFieldValue('gp.fl_id',flId);}

		if ((portfolio_scenario_id != '')) {this.includeFloorForm.setFieldValue('gp.portfolio_scenario_id',portfolio_scenario_id);}

        this.includeFloorForm.showInWindow({
			newRecord: true,
            closeButton: false
        });
    },

	groupGrid_onEdit: function(row, action) {
		var restriction = {'gp.gp_id':row.getFieldValue('gp.gp_id')};

		this.editForm(restriction);
	},

	onClickLink: function() {
		var restriction = {'gp.gp_id':this['gp.gp_id']};
		allocListGroupController.editForm(restriction);
	},

    editForm: function(restriction) {

		this.editGroupForm.refresh(restriction, false);

		var area_cad = asFloat(this.editGroupForm.getFieldValue('gp.area'));

		// If the CAD Area is available we dissalow entering the Manual Area or the % of the floor

		if (area_cad > 0) {
			this.editGroupForm.enableField('gp.area_manual',false);
			this.editGroupForm.enableField('gp.pct_floor',false);
            this.editGroupForm.enableButton('applyPercent', false);
            this.editGroupForm.enableButton('applyHeadcount', false);
		} else {
			this.editGroupForm.enableField('gp.area_manual',true);
			this.editGroupForm.enableField('gp.pct_floor',true);
            this.editGroupForm.enableButton('applyPercent', true);
            this.editGroupForm.enableButton('applyHeadcount', true);
		}

        this.editGroupForm.showInWindow({
			newRecord: false,
            closeButton: false
        });
    },

    groupGrid_onSplitFloor: function() {

		var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');
		var blId = this.tabs.wizard.getBl();
		var flId = this.tabs.wizard.getFl();

		this.splitFloorForm.refresh(null, true);

		if ((blId != '') && (blId != null)) { this.splitFloorForm.setFieldValue('gp.bl_id',blId);}
		if ((flId != '') && (flId != null)) { 
			this.splitFloorForm.setFieldValue('gp.fl_id',flId);
			this.setFloorValues(blId,flId);
			this.splitFloorForm.setFieldValue('fl.area_usable',this.flAreaUsable);
			this.splitFloorForm.setFieldValue('fl.area_manual',this.flAreaManual);
		}

		if ((portfolio_scenario_id != '')) {this.splitFloorForm.setFieldValue('gp.portfolio_scenario_id',portfolio_scenario_id);}

        this.splitFloorForm.showInWindow({
			newRecord: true,
            closeButton: false
        });

    },

	editGroupForm_beforeSave: function() {
		var valid = true;
        var date_start_test = getDateObject(this.editGroupForm.getFieldValue('gp.date_start'));
        var date_end_test = getDateObject(this.editGroupForm.getFieldValue('gp.date_end'));
		var area_manual = asFloat(this.editGroupForm.getFieldValue('gp.area_manual'));
		var area_cad = asFloat(this.editGroupForm.getFieldValue('gp.area'));
		var pct_floor = asFloat(this.editGroupForm.getFieldValue('gp.pct_floor'));

        if ( date_end_test <= date_start_test ) {
            this.editGroupForm.fields.get('gp.date_end').setInvalid(getMessage('errorDateEnd'));
            valid = false;
        }
		if ((area_manual == 0) && (area_cad == 0)) {
			this.editGroupForm.fields.get('gp.area_manual').setInvalid(getMessage('error_no_area'));
			valid = false;
		}
		if ((area_manual < 0)) {
			this.editGroupForm.fields.get('gp.area_manual').setInvalid(getMessage('error_negative_area'));
			valid = false;
		}
		if ((pct_floor > 0)) {
			var bl_id = this.editGroupForm.getFieldValue('gp.bl_id');
			var fl_id = this.editGroupForm.getFieldValue('gp.fl_id');
			var portfolio_scenario_id = this.editGroupForm.getFieldValue('gp.portfolio_scenario_id');
			var date_start = this.editGroupForm.getFieldValue('gp.date_start');
			var date_end = this.editGroupForm.getFieldValue('gp.date_end');

			var totalDs = View.dataSources.get('pctTotal');
			var restriction = new Ab.view.Restriction();
			restriction.addClause("gp.bl_id", bl_id, "=", true);
			restriction.addClause("gp.fl_id", fl_id, "=", true);
			restriction.addClause("gp.portfolio_scenario_id", portfolio_scenario_id, "=", true);
			restriction.addClause("gp.date_start", date_start, "=", true);
			restriction.addClause("gp.date_end", date_end, "=", true);
			var records = totalDs.getRecords(restriction);
			var record = records[0];
			var pct_floor_total = asFloat(record.getValue('gp.pct_floor_sum'));

			if ((pct_floor + pct_floor_total) > 100) {
				this.editGroupForm.fields.get('gp.pct_floor').setInvalid(getMessage('error_pct_total_floor'));
				valid = false;
			}else{
				valid = true;
			}
		}

		return valid;
	},

	editGroupForm_onSave: function() {
        if (this.editGroupForm.save()) {

			this.editGroupForm.closeWindow();

			this.groupGrid.refresh();
		}
	},

	includeFloorForm_beforeSave: function() {
		var valid = true;

        var date_start_test = getDateObject(this.includeFloorForm.getFieldValue('gp.date_start'));
        var date_end_test = getDateObject(this.includeFloorForm.getFieldValue('gp.date_end'));

        if ( date_end_test <= date_start_test ) {
            this.includeFloorForm.fields.get('gp.date_end').setInvalid(getMessage('errorDateEnd'));
            valid = false;
        }

		return valid;
	},

	includeFloorForm_onSave: function() {
        if (this.includeFloorForm.save()) {

			this.includeFloorForm.closeWindow();

			this.groupGrid.refresh();
		}
	},

	splitFloorForm_beforeSave: function() {
		var valid = true;

		var bl_id = this.splitFloorForm.getFieldValue('gp.bl_id');
		var fl_id = this.splitFloorForm.getFieldValue('gp.fl_id');
		var date_start = this.splitFloorForm.getFieldValue('gp.date_start');
		var date_end = this.splitFloorForm.getFieldValue('gp.date_end');
		var portfolio_scenario_id = this.splitFloorForm.getFieldValue('gp.portfolio_scenario_id');

		if (fl_id == '') {
            this.splitFloorForm.fields.get('gp.fl_id').setInvalid(getMessage('error_no_fl_id'));
			valid = false;
		}
		if (portfolio_scenario_id == '') {
            this.splitFloorForm.fields.get('gp.portfolio_scenario_id').setInvalid(getMessage('error_no_portfolio_scenario_id'));
			valid = false;
		}
		if (date_start == '') {
            this.splitFloorForm.fields.get('gp.date_start').setInvalid(getMessage('error_no_dates'));
			valid = false;
		}
		if (date_end == '') {
            this.splitFloorForm.fields.get('gp.date_start').setInvalid(getMessage('error_no_dates'));
			valid = false;
		}

		var record = this.splitFloorForm.getRecord();
	    var date_start_test = record.getValue('gp.date_start');
		var date_end_test = record.getValue('gp.date_end');

		if (date_end_test <= date_start_test) {
            this.splitFloorForm.fields.get('gp.date_end').setInvalid(getMessage('errorDateEnd'));
			valid = false;
        }

		// field names
		var dv_id_field = '';
		var dp_id_field = '';
		var pct_floor_field = '';

		// form values
		var dv_id = '';
		var dp_id = '';
		var pct_floor = '';
		var pct_total = 0;

		for(var i=1;i<11;i++){

			dv_id_field = "gp.dv_id." + i;
			dp_id_field = "gp.dp_id." + i;
			pct_floor_field = "gp.pct_floor." + i;

			dv_id = this.splitFloorForm.getFieldValue(dv_id_field);
			dp_id = this.splitFloorForm.getFieldValue(dp_id_field);
			pct_floor = this.splitFloorForm.getFieldValue(pct_floor_field);

			if ((dv_id != '') && (dp_id != '') && (pct_floor != '')) {

				if (!valDpFields("dp.dv_id='" + dv_id + "' AND dp.dp_id = '" + dp_id + "'")) {
					this.splitFloorForm.fields.get(dp_id_field).setInvalid(getMessage('error_invalid_dv_dp'));
					valid = false;
				}
				
				if ((dv_id != '') && (dp_id != '') && (pct_floor == '0')) {
					this.splitFloorForm.fields.get(pct_floor_field).setInvalid(getMessage('error_no_pct'));
					valid = false;
				}

				pct_total = pct_total + asFloat(pct_floor);
			}
		}

		if (pct_total > 100) {
			this.splitFloorForm.fields.get('gp.pct_floor.1').setInvalid(getMessage('error_pct_total'));
			valid = false;
		}

		return valid;
	},

	splitFloorForm_onSave: function() {

		if (!this.splitFloorForm.canSave()) {
			return;
		}

		var bl_id = this.splitFloorForm.getFieldValue('gp.bl_id');
		var fl_id = this.splitFloorForm.getFieldValue('gp.fl_id');
		var date_start = this.splitFloorForm.getFieldValue('gp.date_start');
		var date_end = this.splitFloorForm.getFieldValue('gp.date_end');
		var portfolio_scenario_id = this.splitFloorForm.getFieldValue('gp.portfolio_scenario_id');

		var area_usable = asFloat(this.splitFloorForm.getFieldValue('fl.area_usable'));
		var area_manual = asFloat(this.splitFloorForm.getFieldValue('fl.area_manual'));

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

		for(var i=1;i<11;i++){

			dv_id_field = "gp.dv_id." + i;
			dp_id_field = "gp.dp_id." + i;
			pct_floor_field = "gp.pct_floor." + i;

			dv_id = this.splitFloorForm.getFieldValue(dv_id_field);
			dp_id = this.splitFloorForm.getFieldValue(dp_id_field);
			pct_floor = this.splitFloorForm.getFieldValue(pct_floor_field);
			
			if ((dv_id != '') && (dp_id != '') && (pct_floor != '')) {

				gp_area_manual = 0;

				if (area_usable > 0) {
					gp_area_manual = (asFloat(pct_floor) * area_usable) / 100.0;
				}
				if (area_manual > 0) {
					gp_area_manual = (asFloat(pct_floor) * area_manual) / 100.0;
				}

				var record = new Ab.data.Record({
					'gp.bl_id': bl_id,
					'gp.fl_id': fl_id,
					'gp.dv_id': dv_id,
					'gp.dp_id': dp_id,
					'gp.pct_floor': pct_floor.toString(),
					'gp.area_manual': gp_area_manual.toString(),
					'gp.date_start': date_start,
					'gp.date_end': date_end,
					'gp.portfolio_scenario_id': portfolio_scenario_id
				}, true);

				this.groupGrid_ds.saveRecord(record);
			}
		}

        this.splitFloorForm.closeWindow();

        this.groupGrid.refresh();
	},

	setFloorValues: function(blId, flId) {
		var restriction = new Ab.view.Restriction();
		var clause = new Ab.view.RestrictionClause('fl.bl_id', blId, '=', 'AND');
		restriction.clauses.push(clause);
		clause = new Ab.view.RestrictionClause('fl.fl_id', flId, '=', 'AND');
		restriction.clauses.push(clause);

		var parameters ={tableName: 'fl',
			fieldNames: toJSON(['fl.fl_id', 'fl.area_usable', 'fl.area_manual']),
			restriction: toJSON(restriction)
		};     

		try {
			var result1 = Workflow.call('AbCommonResources-getDataRecords', parameters);
			var rows = result1.data.records;
			var row = rows[0];
			if ( row != undefined) {
				this.flAreaUsable = row['fl.area_usable'];
				this.flAreaManual = row['fl.area_manual'];
			}
			else {
				this.flAreaUsable = 0;
				this.flAreaManual = 0;
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},
  
	onApplyPercent: function() {

		var editGroupForm = View.panels.get('editGroupForm');

		var blId = editGroupForm.getFieldValue('gp.bl_id');
		var flId = editGroupForm.getFieldValue('gp.fl_id');
		var pct_floor = editGroupForm.getFieldValue('gp.pct_floor');
		var gp_area = editGroupForm.getFieldValue('gp.area');

		// we will only calculate if the pct_floor value is within range and if there is no area from CAD in the area field
		if ((blId == '') || (flId == '') || (gp_area > 0 ) || ( (pct_floor <= 0) || (pct_floor > 100) )) {
			return;
		}

		this.setFloorValues(blId,flId);
		var area_usable = asFloat(this.flAreaUsable);
		var area_manual = asFloat(this.flAreaManual);
		
		if ((area_usable == 0) && (area_manual == 0)){
			View.showMessage(getMessage('error_no_floor_area'));
			return;			
		}

		var gp_area_manual = 0;

		if (area_usable > 0) {
			gp_area_manual = (pct_floor * area_usable) / 100.0;
		}
		if (area_manual > 0) {
			gp_area_manual = (pct_floor * area_manual) / 100.0;
		}

		if (gp_area_manual > 0) {
			gp_area_manual = Math.round(gp_area_manual*100)/100;
			editGroupForm.setFieldValue('gp.area_manual', gp_area_manual.toString());
		}
	},

	onApplyHeadcount: function() {

		var editGroupForm = View.panels.get('editGroupForm');
		var bl_id = editGroupForm.getFieldValue('gp.bl_id');
		var fl_id = editGroupForm.getFieldValue('gp.fl_id');
		
		if (fl_id == "") {
			alert(getMessage('error_no_fl_id'));
		} else {

			var dsStdArea = View.dataSources.get('ds_stdAreaPerEm');
			dsStdArea.addParameter('blId',bl_id);
			dsStdArea.addParameter('flId',fl_id);
			var records = dsStdArea.getRecords();
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

			var headcount = editGroupForm.getFieldValue('gp.count_em');
			var gp_area = editGroupForm.getFieldValue('gp.area');

			// we will only calculate if there is no CAD area and if the headcount is greated than 0
			if ((gp_area > 0 ) || ( headcount == 0)) {
				return;
			}

			var gp_area_manual = headcount * area_per_employee;

			if (gp_area_manual > 0) {
				editGroupForm.setFieldValue('gp.area_manual', gp_area_manual.toString());
			}
		}
	},

	groupGrid_onDeleteSelected: function() {
		if (confirm(getMessage("confirmDelete"))) {
			var grid = this.groupGrid;
			var records = grid.getPrimaryKeysForSelectedRows();

			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', records,'gp'); 
				this.groupGrid.refresh();
			}
			catch (e) {
				Workflow.handleError(result);
			}
		}	 
	},

	saveData: function(){
		var console = View.panels.get('allocGroupConsole');
		var date_report = console.getFieldValue('gp.date_start');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');
		this.tabs.wizard.setDateReport(date_report);
		this.tabs.wizard.setPortfolioScenario(portfolio_scenario_id);
	}

});

function onChangeFloor(fieldName,selectedValue,previousValue) {

	if ((fieldName == 'gp.fl_id') && (selectedValue != previousValue)) {
		var blId = allocListGroupController.splitFloorForm.getFieldValue('gp.bl_id');
		var flId = selectedValue;

		if ((flId != '') && (blId != '')) {
			allocListGroupController.setFloorValues(blId,flId);
			allocListGroupController.splitFloorForm.setFieldValue('fl.area_usable',allocListGroupController.flAreaUsable);
			allocListGroupController.splitFloorForm.setFieldValue('fl.area_manual',allocListGroupController.flAreaManual);
		}
	}
}

function onChangeFloorNoSelection() {
	var blId = allocListGroupController.splitFloorForm.getFieldValue('gp.bl_id');
	var flId = allocListGroupController.splitFloorForm.getFieldValue('gp.fl_id');

	if ((flId != '') && (blId != '')) {
		allocListGroupController.setFloorValues(blId,flId);
		allocListGroupController.splitFloorForm.setFieldValue('fl.area_usable',allocListGroupController.flAreaUsable);
		allocListGroupController.splitFloorForm.setFieldValue('fl.area_manual',allocListGroupController.flAreaManual);
	}
}

function localRestoreSelection(){
	allocListGroupController.restoreSelection();
}

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