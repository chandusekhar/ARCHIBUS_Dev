var selectedRoomsEmployeesTabController = View.createController('selectedRoomsEmployeesTabController', {
	
	isMultiRoomFormVisible: false,
	isMultipleEmployeeFormVisible: false,
	isSingleRoomFormVisible: false,
	isSingleEmployeeFormVisible: false,

	variesValue: '',
	
	/**
	 * Initialize the event listener to edit selected rooms or employees.
	 */
	afterCreate: function() {
        this.on('app:space:express:console:onSelectedResourcesChanged', this.onSelectedResourcesChanged);
    },
    
    /**
     * Enable field actions of multiple room form.
     */
    afterInitialDataFetch: function() {
		this.variesValue = '<'+ getMessage('variesText') +'>';
    	this.multipleRoomForm.enableFieldActions("employee_capacity", false);
    	this.multipleRoomForm.enableFieldActions("total_room_area", false);
    },
    
    /**
     * As for certain rows selected, the app decides which editing form should be displayed. 
     */
    onSelectedResourcesChanged: function(type, rows) {
    	
    	if (type === 'room') {
    		this.displayEditingRoomForm(rows);
    	} else if (type === 'employee') {
    		this.displayEditingEmployeeForm(rows);
    	} else if (type === 'team') {
    		this.displayEditingTeamForm(rows);
    	} else {
    		View.alert(getMessage('noSuchResource'));
    		View.alert("no such resource.Only support room, employee and teams.");
    	}
    },
    
    //  ------- STRAT Logics for editing room(s).  

	/**
     * Display editing form for rooms.
     */
    displayEditingRoomForm: function(rows) {
    	if (rows.length == 0) {
    		this.hideAllEditForms();
    	} else {
    		if (rows.length == 1) {
    			this.editSingleRoom(rows[0]);
    		} else {
    			this.displayDifferentValues(rows);
    		}
    	}

		// after show edit form, need to resize the layout region.
		var layout = View.getLayoutManager('selectedRoomsLayout');
		layout.recalculateLayout();
},
    
    /**
	 * Edit a room which is selected through the checkbox.
	 */
	editSingleRoom: function(row) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id',row['rm.bl_id']);
		restriction.addClause('rm.fl_id',row['rm.fl_id']);
		restriction.addClause('rm.rm_id',row['rm.rm_id']);
		if (!this.isSingleRoomFormVisible) {
			this.hideAllEditForms();
			this.isSingleRoomFormVisible = true;
		}
		this.singleRoomForm.refresh(restriction);
		this.singleRoomForm.show(true);
	},

    displayDifferentValues: function(rows) {
    	if (!this.isMultiRoomFormVisible) {
    		this.hideAllEditForms();
    		this.isMultiRoomFormVisible = true;
    		this.multipleRoomForm.show(true);
    	}
		//Set the total room area
		var totalRoomArea = 0.0;
		var differentFields = [];
		for(var i = 0; i < rows.length; i++) {
			var rmAreaValue = rows[i]['rm.area'];
			if (valueExistsNotEmpty(rows[i]["rm.area.raw"])) {
			    rmAreaValue = rows[i]["rm.area.raw"];
			}
			totalRoomArea = totalRoomArea + parseFloat(rmAreaValue);
		}
		this.multipleRoomForm.setFieldValue('total_room_area', insertGroupingSeparator(totalRoomArea.toFixed(2), true));
		this.initializeMultiRoomForm(rows);
		this.setVariesFields(rows);
    },
    
    initializeMultiRoomForm: function(rows) {
    	this.multipleRoomForm.setFieldValue('rm.dv_id', rows[0]['rm.dv_id']);
		this.multipleRoomForm.setFieldValue('rm.dp_id', rows[0]['rm.dp_id']);
		this.multipleRoomForm.setFieldValue('rm.rm_cat', rows[0]['rm.rm_cat']);
		this.multipleRoomForm.setFieldValue('rm.rm_type', rows[0]['rm.rm_type']);
		this.multipleRoomForm.setFieldValue('employee_capacity', rows[0]['rm.cap_em']);
    },
    
    setVariesFields: function(rows) {
    	var formDv = this.multipleRoomForm.getFieldValue('rm.dv_id');
    	var formDp = this.multipleRoomForm.getFieldValue('rm.dp_id');
    	var formCat = this.multipleRoomForm.getFieldValue('rm.rm_cat');
    	var formType = this.multipleRoomForm.getFieldValue('rm.rm_type');
    	var formCapEm = this.multipleRoomForm.getFieldValue('employee_capacity');
    	
    	for(var i = 1; i < rows.length; i++) {
        	
    		var dataRow = rows[i];
    		if (formDv != this.variesValue) {
    			if (formDv != dataRow['rm.dv_id']) {
    				this.multipleRoomForm.setFieldValue('rm.dv_id', this.variesValue);
    			}
    		}
    		
    		if (formDp != this.variesValue) {
    			if (formDp != dataRow['rm.dp_id']) {
    				this.multipleRoomForm.setFieldValue('rm.dp_id', this.variesValue);
    			}
    		}
    		
    		if (formCat != this.variesValue) {
    			if (formCat != dataRow['rm.rm_cat']) {
    				this.multipleRoomForm.setFieldValue('rm.rm_cat', this.variesValue);
    			}
    		}
    		
    		if (formType != this.variesValue) {
    			if (formType != dataRow['rm.rm_type']) {
    				this.multipleRoomForm.setFieldValue('rm.rm_type', this.variesValue);
    			}
    		}
    		
    		if (formCapEm != this.variesValue) {
    			if (formCapEm != dataRow['rm.cap_em']) {
    				this.multipleRoomForm.setFieldValue('employee_capacity', this.variesValue);
    			}
    		}
    	}
    },
    	
    /**
	 * call the workflow rule to save multiple rooms for editing.
	 */
	multipleRoomForm_onSaveMultiRoom: function() {
		var validation = this.validateEmCapacity(this.multipleRoomForm.getFieldElement('employee_capacity'));
		if(!validation){
			return;
		}
		var newValueArray = this.getNewFormValueForRoomsBulkEdit();
		var rooms = [];
		var rows = this.selectedRoomsGrid.getSelectedRows();
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var blId = row['rm.bl_id'];
			var flId = row['rm.fl_id'];
			var roomId = row['rm.rm_id'];
			var roomJsonArray = {'rm.bl_id':blId, 'rm.fl_id':flId, 'rm.rm_id':roomId};
			rooms.push(roomJsonArray);
		}
		
		try{
			Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-updateMultipleRooms", rooms, newValueArray);
			this.refreshRoomsGrid();
		} catch (e) {
			//The user may just set division or room category but not department or room type, we display a error message.
			this.multipleRoomForm.displayTemporaryMessage(e.message, 4000);
		}
	},
	
	/**
	 * Get the new value for bulk rooms edit.
	 */
	getNewFormValueForRoomsBulkEdit: function() {
		var selectedRoomsGrid = View.panels.get('selectedRoomsGrid');
		var rows = selectedRoomsGrid.getSelectedRows();
		var inputDivisionId = this.multipleRoomForm.getFieldValue('rm.dv_id');
		var inputDepartmentId = this.multipleRoomForm.getFieldValue('rm.dp_id');
		var inputRoomCategory = this.multipleRoomForm.getFieldValue('rm.rm_cat');
		var inputRoomType = this.multipleRoomForm.getFieldValue('rm.rm_type');
		var employeeCapacity = this.multipleRoomForm.getFieldValue('employee_capacity');
		
		var newValueArray = [
				{'fieldName':'rm.dv_id','fieldValue':inputDivisionId},
				{'fieldName':'rm.dp_id','fieldValue':inputDepartmentId},
				{'fieldName':'rm.rm_cat','fieldValue':inputRoomCategory},
				{'fieldName':'rm.rm_type','fieldValue':inputRoomType},
				{'fieldName':'rm.cap_em','fieldValue':employeeCapacity}
		];
		return newValueArray;
	},
	
	/**
	 * Refresh the rooms grid after update operation.
	 */
	refreshRoomsGrid: function() {
		this.hideAllEditForms();
		this.selectedRoomsGrid.refresh();
		this.updateDrawingPanel();
	},

	/**
	 * Delete multiple employees.
	 */
	deleteMultipleRooms: function() {
        var rows = this.selectedRoomsGrid.getSelectedRows();
		var thisCtrl = selectedRoomsEmployeesTabController;
		View.confirm(getMessage("deleteRooms"), function(result) {
			if (result == 'yes') {
				for (var i = 0; i < rows.length; i++) {
					var record = new Ab.data.Record({
						'rm.bl_id': rows[i]["rm.bl_id"],
						'rm.fl_id': rows[i]["rm.fl_id"],
						'rm.rm_id': rows[i]["rm.rm_id"]
					}, true);
					try {
						thisCtrl.selectedViewedRoomsDS.deleteRecord(record);
					} 
					catch (e) {
						var message = getMessage('errorDeleteRoom');
						View.showMessage('error', message+": "+rows[i]["rm.bl_id"]+'-'+rows[i]["rm.fl_id"]+'-'+rows[i]["rm.rm_id"], e.message, e.data);
						return;
					}
				}
				thisCtrl.multipleRoomForm.show(false);
				thisCtrl.selectedRoomsGrid.refresh();
				thisCtrl.updateDrawingPanel();
			} 
		});

	},

    //  ------- END Logics for editing room(s).  

	//  ------- START Logics for editing employee(s).  
    /**
     * Display editing form for employees.
     */
    displayEditingEmployeeForm: function(rows) {
    	if (rows.length==0) {
			this.hideAllEditForms();
		} else {
			if (rows.length == 1) {
				this.editSingleEmployee(rows[0]);
			} else {
				this.isMultiEmployeeFormVisible = true;
				this.editMultipleEmployees(rows);
			}
		}

		// after show edit form, need to resize the layout region.
		var layout = View.getLayoutManager('selectedEmployeesLayout');
		layout.recalculateLayout();
    },
    
    /**
	 * Edit an employee which is selected through the checkbox.
	 */
	editSingleEmployee: function(row) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('em.em_id',row['em.em_id']);
		
		if (!this.isSingleEmployeeFormVisible) {
			this.hideAllEditForms();
			this.isSingleEmployeeFormVisible = true;
		}
		this.singleEmployeeForm.refresh(restriction);
		this.singleEmployeeForm.show(true);
	},
	
	/**
	 * Edit multiple employees. When the field values are identical, the field will be set to normal value, otherwise <varies>
	 */
	editMultipleEmployees: function(rows) {
		if (this.isMultiEmployeeFormVisible) {
    		this.hideAllEditForms();
    		this.isMultiEmployeeFormVisible = true;
    		this.multipleEmployeeForm.show(true);
		}
		var escapedFields = [];
		var comparedFields = ['rm.bl_id','rm.fl_id','rm.rm_id','em.em_std', 'dv.dv_id','dp.dp_id'];
		for (var i = 0; i < rows.length; i++) {
			var baseRow = rows[i];
			for (var j = i + 1; j < rows.length; j++) {
				var comparedRow = rows[j];
				escapedFields = escapedFields.concat(this.compareRows(comparedFields, baseRow, comparedRow, escapedFields));
			}
		}
		
		var dataRow = rows[0];
		this.multipleEmployeeForm.setFieldValue('em.bl_id', dataRow['rm.bl_id']);
		this.multipleEmployeeForm.setFieldValue('em.fl_id', dataRow['rm.fl_id']);
		this.multipleEmployeeForm.setFieldValue('em.rm_id', dataRow['rm.rm_id']);
		this.multipleEmployeeForm.setFieldValue('em.dv_id', dataRow['dv.dv_id']);
		this.multipleEmployeeForm.setFieldValue('em.dp_id', dataRow['dp.dp_id']);
		this.multipleEmployeeForm.setFieldValue('em.em_std', dataRow['em.em_std']);
		
		var fieldMap = {'rm.bl_id':'em.bl_id', 'rm.fl_id':'em.fl_id','rm.rm_id':'em.rm_id','dv.dv_id':'em.dv_id', 'dp.dp_id':'em.dp_id', 'em.em_std':'em.em_std'};
		for (var k = 0; k < escapedFields.length; k++) {
			var fieldName = escapedFields[k];
			this.multipleEmployeeForm.setFieldValue(fieldMap[fieldName], this.variesValue);
		}
	},
	
	/**
	 * Bulk edit employees as to any field which has no this.variesValue value.
	 */
	multipleEmployeeForm_onSave: function() {
		var newValues = this.getNewFormValueForEmployeeBulkEdit();
		var rows = this.selectedRmsEmsGrid.getSelectedRows();
		var employees = [];
		for (var i = 0; i < rows.length; i++) {
			var currentRow = rows[i];
			var emId = currentRow['em.em_id'];
			var employee = {'em.em_id':emId};
			employees.push(employee);
		}
		
		try {
			Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-updateMultipleEmployees", employees, newValues);
			this.multipleEmployeeForm.show(false);
			this.selectedRmsEmsGrid.refresh();
			this.updateDrawingPanel();
		} catch(e) {
			this.multipleEmployeeForm.displayTemporaryMessage(e.message, 4000);
		}
	},
	
	/**
	 * As for multi-edit function, we get the new values first.
	 */
	getNewFormValueForEmployeeBulkEdit: function() {
		var blId = this.multipleEmployeeForm.getFieldValue('em.bl_id');
		var flId = this.multipleEmployeeForm.getFieldValue('em.fl_id');
		var rmId = this.multipleEmployeeForm.getFieldValue('em.rm_id');
		var dvId = this.multipleEmployeeForm.getFieldValue('em.dv_id');
		var dpId = this.multipleEmployeeForm.getFieldValue('em.dp_id');
		
		var newValues = [
		    {'fieldName':'rm.bl_id','fieldValue':blId},
		    {'fieldName':'rm.fl_id','fieldValue':flId},
		    {'fieldName':'rm.rm_id','fieldValue':rmId},
		    {'fieldName':'rm.dv_id','fieldValue':dvId},
		    {'fieldName':'rm.dp_id','fieldValue':dpId}
		];
		
		return newValues;
	},
	
	/**
	 * Save an employee.
	 */
	saveSingleEmployee: function() {
		this.singleEmployeeForm.show(false);
		this.selectedRmsEmsGrid.refresh();
		this.updateDrawingPanel();
	},
	
	/**
	 * Delete an employee.
	 */
	deleteSingleEmployee: function() {
		this.singleEmployeeForm.show(false);
		this.selectedRmsEmsGrid.refresh();
		this.updateDrawingPanel();
	},
	
	/**
	 * Delete multiple employees.
	 */
	deleteMultipleEmployees: function() {
        var rows = this.selectedRmsEmsGrid.getSelectedRows();
		var thisCtrl = selectedRoomsEmployeesTabController;
		View.confirm(getMessage("deleteEmployees"), function(result) {
			if (result == 'yes') {
				for (var i = 0; i < rows.length; i++) {
					var emId = rows[i]["em.em_id"];
					var record = new Ab.data.Record({
						'em.em_id': emId
					}, true);
					try {
						thisCtrl.editEmployeeDetailsDS.deleteRecord(record);
					} 
					catch (e) {
						var message = getMessage('errorDeleteEmployee');
						View.showMessage('error', message+": "+emId, e.message, e.data);
						return;
					}
				}
				thisCtrl.multipleEmployeeForm.show(false);
				thisCtrl.selectedRmsEmsGrid.refresh();
				thisCtrl.updateDrawingPanel();
			} 
		});
	},
	
	/**
	 * Cancels edit and just hide the edit forms.
	 */
	cancelEditEmployee: function() {
		this.multipleEmployeeForm.show(false);
		this.singleEmployeeForm.show(false);
		this.selectedRmsEmsGrid.refresh();
	},
	/**
	 * Validates user's input value for em_capacity field - only allow user's input value in integer format.
	 */
	validateEmCapacity: function(elem){
		if(elem.value === this.variesValue){
			return true;
		}
		return validationIntegerOrSmallint(elem,true, this.selectedViewedRoomsDS.fieldDefs.get('rm.cap_em'));
	},
	//  ------- END Logics for editing employee(s).  

	//  ------- START Logics for editing team(s).  
    /**
     * Display editing form for team-room assignment.
     */
    displayEditingTeamForm: function(rows) {
    	if (rows.length==0) {
			this.hideAllEditForms();
		} else {
			if (rows.length == 1) {
				this.editSingleTeam(rows[0]);
			} else {
				this.editMultipleTeams(rows);
			}
		}
		// after show edit form, need to resize the layout region.
		var layout = View.getLayoutManager('selectedTeamsLayout');
		layout.recalculateLayout();
    },
    
    /**
	 * Edit a team-rm assignment which is selected through the checkbox.
	 */
	editSingleTeam: function(row) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm_team.rm_team_id',row['rm_team.rm_team_id.key']);
		
		if ( !this.isSingleTeamFormVisible ) {
			this.hideAllEditForms();
			this.isSingleTeamFormVisible = true;
		}
		this.singleTeamForm.refresh(restriction);
		this.singleTeamForm.show(true);
	},

	/**
	 * Edit multiple team-rm assignments. When the field values are identical, the field will be set to normal value, otherwise <varies>
	 */
	editMultipleTeams: function(rows) {
		this.hideAllEditForms();
		this.isMultiTeamFormVisible = true;
		this.multipleTeamForm.show(true);

		var escapedFields = [];
		var comparedFields = ['rm_team.bl_id','rm_team.fl_id','rm_team.rm_id','rm_team.team_id','rm_team.date_start', 'rm_team.date_end'];
		for (var i = 0; i < rows.length; i++) {
			var baseRow = rows[i];
			for (var j = i + 1; j < rows.length; j++) {
				var comparedRow = rows[j];
				escapedFields = escapedFields.concat(this.compareRows(comparedFields, baseRow, comparedRow, escapedFields));
			}
		}
		
		var dataRow = rows[0];
		this.multipleTeamForm.setFieldValue('rm_team.bl_id', dataRow['rm_team.bl_id']);
		this.multipleTeamForm.setFieldValue('rm_team.fl_id', dataRow['rm_team.fl_id']);
		this.multipleTeamForm.setFieldValue('rm_team.rm_id', dataRow['rm_team.rm_id']);
		this.multipleTeamForm.setFieldValue('rm_team.team_id', dataRow['rm_team.team_id']);
		this.multipleTeamForm.setFieldValue('rm_team.date_start', dataRow['rm_team.date_start']);
		this.multipleTeamForm.setFieldValue('rm_team.date_end', dataRow['rm_team.date_end']);
		
		for (var k = 0; k < escapedFields.length; k++) {
			var fieldName = escapedFields[k];
			if (fieldName==='rm_team.date_start' || fieldName==='rm_team.date_end' ){
				$('multipleTeamForm_'+fieldName).value = this.variesValue;
			} else {
				this.multipleTeamForm.setFieldValue(fieldName, this.variesValue, this.variesValue, false);
			}
		}
	},

	/**
	 * Bulk edit teams as to any field which has no this.variesValue value.
	 */
	multipleTeamForm_onSave: function() {
		//var newValues = this.getNewFormValueForTeamBulkEdit();
		//var rows = this.selectedTeamsGrid.getSelectedRecords();
		var selectedRecords = this.selectedTeamsGrid.getSelectedRecords();
		var teams = [];
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i];
			var teamId = this.multipleTeamForm.getFieldValue('rm_team.team_id');
			if ( this.variesValue != teamId){
				record.setValue('rm_team.team_id', teamId); 
			}

			var dateStart = this.multipleTeamForm.getRecord().values['rm_team.date_start'];
			if ( dateStart && this.variesValue != dateStart){
				record.setValue('rm_team.date_start', dateStart); 
			}

			var dateEnd = this.multipleTeamForm.getRecord().values['rm_team.date_end'];
			if ( dateEnd && this.variesValue != dateEnd){
				record.setValue('rm_team.date_end', dateEnd); 
			}
			this.editTeamDetailsDS.saveRecord(record);
		}
		
		this.multipleTeamForm.show(false);
		this.selectedTeamsGrid.refresh();
		this.updateDrawingPanel();
	},
	
	/**
	 * As for multi-edit function, we get the new values first.
	 */
	getNewFormValueForTeamBulkEdit: function() {
		var blId = this.multipleEmployeeForm.getFieldValue('rm_team.bl_id');
		var flId = this.multipleEmployeeForm.getFieldValue('rm_team.fl_id');
		var rmId = this.multipleEmployeeForm.getFieldValue('rm_team.rm_id');
		var teamId = this.multipleEmployeeForm.getFieldValue('rm_team.team_id');
		var dateStart = this.multipleEmployeeForm.getFieldValue('rm_team.date_start');
		var dateEnd = this.multipleEmployeeForm.getFieldValue('rm_team.date_end');
		
		var newValues = [
		    {'fieldName':'rm_team.bl_id','fieldValue':blId},
		    {'fieldName':'rm_team.fl_id','fieldValue':flId},
		    {'fieldName':'rm_team.rm_id','fieldValue':rmId},
		    {'fieldName':'rm_team.team_id','fieldValue':teamId},
		    {'fieldName':'rm_team.date_start','fieldValue':dateStart},
		    {'fieldName':'rm_team.date_end','fieldValue':dateEnd}
		];
		
		return newValues;
	},
	
	/**
	 * Save an team.
	 */
	saveSingleTeam: function() {
		this.singleTeamForm.show(false);
		this.selectedTeamsGrid.refresh();
		this.updateDrawingPanel();
	},
	
	/**
	 * Delete an team.
	 */
	deleteSingleTeam: function() {
		this.singleTeamForm.show(false);
		this.selectedTeamsGrid.refresh();
		this.updateDrawingPanel();
	},
	
	/**
	 * Delete multiple employees.
	 */
	deleteMultipleTeams: function() {
        var rows = this.selectedTeamsGrid.getSelectedRows();
		var thisCtrl = selectedRoomsEmployeesTabController;
		View.confirm(getMessage("deleteTeams"), function(result) {
			if (result == 'yes') {
				for (var i = 0; i < rows.length; i++) {
					var rmTeamId = rows[i]["rm_team.rm_team_id"];
					var record = new Ab.data.Record({
						'rm_team.rm_team_id': rmTeamId
					}, true);
					try {
						thisCtrl.selectedViewedTeamsDS.deleteRecord(record);
					} 
					catch (e) {
						var message = getMessage('errorDeleteTeam');
						View.showMessage('error', message+": "+rmTeamId, e.message, e.data);
						return;
					}
				}
				thisCtrl.multipleTeamForm.show(false);
				thisCtrl.selectedTeamsGrid.refresh();
				thisCtrl.updateDrawingPanel();
			} 
		});
	},

	/**
	 * Cancels edit and just hide the edit forms.
	 */
	cancelEditTeam: function() {
		this.multipleTeamForm.show(false);
		this.singleTeamForm.show(false);
		this.selectedTeamsGrid.refresh();
	},
	//  ------- END Logics for editing team(s).  

	//  ------- Common Functions Section.  
    /**
     * Hide all editing forms.
     */
    hideAllEditForms: function() {
    	this.singleRoomForm.show(false);
		this.multipleRoomForm.show(false);
		this.isSingleRoomFormVisible = false;
		this.isMultiRoomFormVisible = false;

		this.singleEmployeeForm.show(false);
		this.multipleEmployeeForm.show(false);
		this.isSingleEmployeeFormVisible = false;
		this.isMultipleEmployeeFormVisible = false;
		
		if ( this.singleTeamForm ) {
			this.singleTeamForm.show(false);
			this.multipleTeamForm.show(false);
			this.isSingleTeamFormVisible = false;
			this.isMultipleTeamFormVisible = false;
		}
    },

	/**
	 * Compared two rows of employee grid and return the different value's fields.
	 * Any field that has been compared with a different value will not been compared again.
	 */
	compareRows: function(comparedFields, baseRow, comparedRow, escapedFields) {
		var difFields = [];
		for (var i = 0 ; i < comparedFields.length; i++) {
			var escape = false;
			for (var j = 0; j < escapedFields.length; j++) {
				if (comparedFields[i]==escapedFields[j]) {
					escape = true;
				}
			}
			if (!escape) {
				var fieldName = comparedFields[i];
				if (baseRow[fieldName] != comparedRow[fieldName]) {
					difFields.push(fieldName);
				}
			}
		}
		return difFields;
	},

	/**
	 * After save, delete or cancel operation, need to update drawing panel's action bar and floor plan inside it.
	 */
	updateDrawingPanel: function() {
		var spConsoleCtrl = View.getOpenerView().controllers.get('spaceExpressConsole');
		spConsoleCtrl.trigger('app:space:express:console:cancelSelectedRooms');
		spConsoleCtrl.trigger('app:space:express:console:commitRoomsAlteration');
	}
});