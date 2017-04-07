/**
 * @author Guo Jiangtao
 * @revised and expanded for Bali4/V.22.1 by Eric Maxfield
 */
var abRiskMsdsDefLocsController = View.createController('abRiskMsdsDefLocsController', {
	
	selectedMSDSLocationRows : [],
	
	checkAllBoxSelected: false,

	/**
	 * This event handler is called by show button in
	 * abRiskMsdsDefLocsMsdsConsole.
	 */
	abRiskMsdsDefLocsMsdsConsole_onShow : function() {

		// get restriction from the console
		var restriction = this.abRiskMsdsDefLocsMsdsConsole.getFieldRestriction();

		// refresh the msds list
		this.abRiskMsdsDefLocsMsdsList.refresh(restriction);
		this.abRiskMsdsDefLocsMsdsConsole.closeWindow();
	},

	/**
	 * This event handler is called by Assign to Selected Locations button in
	 * abRiskMsdsDefLocsMsdsList.
	 */
	abRiskMsdsDefLocsMsdsList_onAssign : function() {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		var msdsRows = this.abRiskMsdsDefLocsMsdsList.getSelectedRows();
		var locationRows = this.abRiskMsdsDefLocsLocationList.getSelectedRows();
		if (msdsRows.length > 0 && locationRows.length > 0) {
			
			var msdsRestriction = 'msds_location.msds_id IN (';
			
			// loop through all selected msds records and assign each to selected locations
			for (var r = 0; r < msdsRows.length; r++) {
				
				// get selected msds
				var msds = msdsRows[r]['msds_data.msds_id'];
				if (msdsRows[r]['msds_data.msds_id.raw']) {
					msds = msdsRows[r]['msds_data.msds_id.raw'];
				}
	
				if (r > 0) {
					msdsRestriction += ", "; 
				}
				msdsRestriction += msds;
				
				var locRestriction = '';
	
				// loop all selected locations and add records to msds_location
				for ( var i = 0; i < locationRows.length; i++) {
	
					if(locationRows[i]['rm.bl_id'] !='') {
						locRestriction += "OR (msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";
						if(locationRows[i]['rm.eq_id'] !=''){
							locRestriction += " AND msds_location.eq_id='" + locationRows[i]['rm.eq_id'] + "'";
						}
						else {
							locRestriction += " AND msds_location.eq_id IS NULL";
						}
						if(locationRows[i]['rm.fl_id'] !='') {
							locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
							if(locationRows[i]['rm.rm_id'] !='') {
								locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
								if(locationRows[i]['rm.aisle_id'] !='') {
									locRestriction += " AND msds_location.aisle_id='" + locationRows[i]['rm.aisle_id'] + "'";
									if(locationRows[i]['rm.cabinet_id'] !='') {
										locRestriction += " AND msds_location.cabinet_id='" + locationRows[i]['rm.cabinet_id'] + "'";
										if(locationRows[i]['rm.shelf_id'] !='') {
											locRestriction += " AND msds_location.shelf_id='" + locationRows[i]['rm.shelf_id'] + "'";
											if(locationRows[i]['rm.bin_id'] !='') {
												locRestriction += " AND msds_location.bin_id='" + locationRows[i]['rm.bin_id'] + "'";
											} else { locRestriction += " AND msds_location.bin_id IS NULL";}
										} else { locRestriction += " AND msds_location.shelf_id IS NULL";}
									} else { locRestriction += " AND msds_location.cabinet_id IS NULL";}
								} else { locRestriction += " AND msds_location.aisle_id IS NULL";}
							} else { locRestriction += " AND msds_location.rm_id IS NULL";}
						} else { locRestriction += " AND msds_location.fl_id IS NULL"; }
						
						locRestriction += ")";
					}
	
					if (!this.recordExists(locationRows[i], msds)) {
						var rec = new Ab.data.Record();
						rec.isNew = true;
						rec.setValue("msds_location.msds_id", msds);
						rec.setValue("msds_location.site_id", locationRows[i]['rm.site_id']);
						rec.setValue("msds_location.bl_id", locationRows[i]['rm.bl_id']);
						rec.setValue("msds_location.fl_id", locationRows[i]['rm.fl_id']);
						rec.setValue("msds_location.rm_id", locationRows[i]['rm.rm_id']);
						rec.setValue("msds_location.aisle_id", locationRows[i]['rm.aisle_id']);
						rec.setValue("msds_location.cabinet_id", locationRows[i]['rm.cabinet_id']);
						rec.setValue("msds_location.shelf_id", locationRows[i]['rm.shelf_id']);
						rec.setValue("msds_location.bin_id", locationRows[i]['rm.bin_id']);
						rec.setValue("msds_location.eq_id", locationRows[i]['rm.eq_id']);
						rec.setValue("msds_location.last_edited_by",this.view.user.name);
						try {
							ds.saveRecord(rec);
						} catch (e) {
						}
					}
				}
			}
			msdsRestriction += ')';
			// refresh the assignment panels restricted by the selected
			// locations and msds
			var restriction = msdsRestriction + " AND (" + locRestriction.substring(2) + ")"
			this.abRiskMsdsDefLocsAssignmentList.refresh(restriction);
		}
	},
	
	/**
	 * This event handler is called by the filter icon action button in
	 * abRiskMsdsDefLocsMsdsList.
	 */
	abRiskMsdsDefLocsMsdsList_onFilter : function() {
		//this.abRiskMsdsDefLocsMsdsConsole.newRecord = true;
		this.abRiskMsdsDefLocsMsdsConsole.show();
		this.abRiskMsdsDefLocsMsdsConsole.showInWindow({ width: 800, height: 300, closeButton: true });  
	},
	
	/**
	 * This event handler is called by the filter icon action button in
	 * abRiskMsdsDefLocationList.
	 */
	abRiskMsdsDefLocsLocationList_onFilter : function() {
		//this.abRiskMsdsDefLocsLocationConsole.newRecord = true;
		this.abRiskMsdsDefLocsLocationConsole.show();
		this.abRiskMsdsDefLocsLocationConsole.showInWindow({ width: 800, height: 300, closeButton: true });  
	}, 

	/**
	 * This event handler is called by the Dispose Selected button in
	 * abRiskMsdsDefLocsAssignmentList.
	 */
	abRiskMsdsDefLocsAssignmentList_onDisposeSelected : function() {
		//KB 3047836 - Prompt user for confirmation before disposing		
		var doIt = confirm(getMessage("prompt_disposeSelected"));
		if(!doIt) return;
		
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		
		// first, update and save the record with status Disposed
		var assignmentRecords = this.abRiskMsdsDefLocsAssignmentList.getSelectedRecords();		
		if (assignmentRecords.length > 0) {
			var currentDateObj = new Date();
			var currentDate = this.abRiskMsdsDefLocsAssignmentDS.formatValue("msds_location.date_updated", currentDateObj, false);
			// loop all selected assignments, set status to Disposed, save, then delete them
			for ( var i = 0; i < assignmentRecords.length; i++) {							
				var record = assignmentRecords[i];
				record.setValue("msds_location.date_updated",currentDate);		
				record.setValue("msds_location.last_edited_by",this.view.user.name);
				record.setValue("msds_location.container_status","DISPOSED");
				try {
					this.abRiskMsdsDefLocsAssignmentDS.saveRecord(record);
				} catch (e) {
				}
			}
		}
		// now delete the records
		var assignmentRows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();		
		if (assignmentRows.length > 0) {			
			// loop all selected assignment and delete them
			for ( var i = 0; i < assignmentRows.length; i++) {
				var autoNumber = assignmentRows[i]['msds_location.auto_number'];
				if (assignmentRows[i]['msds_location.auto_number.raw']) {
					autoNumber = assignmentRows[i]['msds_location.auto_number.raw'];
				}
				var rec = new Ab.data.Record();
				rec.isNew = false;				
				rec.setValue("msds_location.auto_number", autoNumber);
				try {
					ds.deleteRecord(rec);
				} catch (e) {
				}
			}

			// refresh the assignment list and hide the edit form
			this.abRiskMsdsDefLocsAssignmentList.refresh(this.abRiskMsdsDefLocsAssignmentList.restriction);			
		}
	},

	/**
	 * This event handler response when user clicks the 'Unassign Selected' action button
	 */
	abRiskMsdsDefLocsAssignmentList_onUnassignSelected : function () {
		var doIt = confirm(getMessage("prompt_unassignSelected"));
		if(!doIt) return;
		
		var assignmentRecords = this.abRiskMsdsDefLocsAssignmentList.getSelectedRecords();		
		if (assignmentRecords.length > 0) {
			var currentDateObj = new Date();
			var currentDate = this.abRiskMsdsDefLocsAssignmentDS.formatValue("msds_location.date_updated", currentDateObj, false);
			// loop all selected assignments, set status to Disposed, save, then delete them
			for ( var i = 0; i < assignmentRecords.length; i++) {							
				var record = assignmentRecords[i];
				record.setValue("msds_location.date_updated",currentDate);		
				record.setValue("msds_location.last_edited_by",this.view.user.name);
				record.setValue("msds_location.eq_id","");
				record.setValue("msds_location.bin_id","");
				record.setValue("msds_location.shelf_id","");
				record.setValue("msds_location.cabinet_id","");
				record.setValue("msds_location.aisle_id","");
				record.setValue("msds_location.rm_id","");
				record.setValue("msds_location.fl_id","");
				try {
					this.abRiskMsdsDefLocsAssignmentDS.saveRecord(record);
				} catch (e) {
				}
			}
			// refresh the assignment list and hide the edit form
			this.abRiskMsdsDefLocsAssignmentList.refresh(this.abRiskMsdsDefLocsAssignmentList.restriction);			
		}
	},

	/**
	 * This event handler is called by Show Assignments at Selected Locations button in
	 * abRiskMsdsDefLocsLocationList.
	 */
	abRiskMsdsDefLocsLocationList_onAssignmentshow : function() {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		var msdsRows = this.abRiskMsdsDefLocsMsdsList.getSelectedRows();
		var locationRows = this.abRiskMsdsDefLocsLocationList.getSelectedRows();
		var msdsRestriction = '';
		
		//KB 3047831 - If user has not selected any rows, prompt before continuing because of risk of long load time for many records.
		if(msdsRows.length==0 && locationRows.length==0){
			var doIt = confirm(getMessage("prompt_showAll"));
			if(!doIt) {
				this.abRiskMsdsDefLocsAssignmentList.clear();
				return false;
			}
		} 
		
		if (msdsRows.length > 0) {			
			// loop through all selected msds items and add records to msds restriction
			var msds = '';
			for (var j = 0; j < msdsRows.length; j++) {
				if(msdsRows[j]['msds_data.msds_id'] !='') {
					msds = msdsRows[j]['msds_data.msds_id'];
					if (msdsRows[j]['msds_data.msds_id.raw']) {
						msds = msdsRows[j]['msds_data.msds_id.raw'];
					}
					msdsRestriction += ", '" + msds + "'";
				}
			}
			msdsRestriction = 'msds_location.msds_id IN (' + msdsRestriction.substring(2) + ") "  
		}
		
		var locRestriction = '';
		if (locationRows.length > 0) {			
			// loop all selected locations and add records to msds_location restriction
			for (var i = 0; i < locationRows.length; i++) {
				if(locationRows[i]['rm.eq_id'] !='') {
					locRestriction += "OR (msds_location.eq_id='" + locationRows[i]['rm.eq_id'] + "'";
					if(locationRows[i]['rm.bl_id'] !='') {
						locRestriction += " AND msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";					
						if(locationRows[i]['rm.fl_id'] !='') {
							locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
							if(locationRows[i]['rm.rm_id'] !='') {
								locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
								if(locationRows[i]['rm.aisle_id'] !='') {
									locRestriction += " AND msds_location.aisle_id='" + locationRows[i]['rm.aisle_id'] + "'";
									if(locationRows[i]['rm.cabinet_id'] !='') {
										locRestriction += " AND msds_location.cabinet_id='" + locationRows[i]['rm.cabinet_id'] + "'";
										if(locationRows[i]['rm.shelf_id'] !='') {
											locRestriction += " AND msds_location.shelf_id='" + locationRows[i]['rm.shelf_id'] + "'";
											if(locationRows[i]['rm.bin_id'] !='') {
												locRestriction += " AND msds_location.bin_id='" + locationRows[i]['rm.bin_id'] + "'";
											}
											else {
												locRestriction += " AND msds_location.bin_id IS NULL";
											}
										}
										else {
											locRestriction += " AND msds_location.shelf_id IS NULL";
										}
									}
									else {
										locRestriction += " AND msds_location.cabinet_id IS NULL";
									}
								}
								else {
									locRestriction += " AND msds_location.aisle_id IS NULL";
								}
							}
							else {
								locRestriction += " AND msds_location.rm_id IS NULL";
							}
						}
						else {
							locRestriction += " AND msds_location.fl_id IS NULL";
						}						
					}
					locRestriction += ")";
				}
				else if(locationRows[i]['rm.bl_id'] !='') {
					locRestriction += "OR (msds_location.eq_id IS NULL";
					locRestriction += " AND msds_location.bl_id='" + locationRows[i]['rm.bl_id'] + "'";					
					if(locationRows[i]['rm.fl_id'] !='') {
						locRestriction += " AND msds_location.fl_id='" + locationRows[i]['rm.fl_id'] + "'";					
						if(locationRows[i]['rm.rm_id'] !='') {
							locRestriction += " AND msds_location.rm_id='" + locationRows[i]['rm.rm_id'] + "'";
							if(locationRows[i]['rm.aisle_id'] !='') {
								locRestriction += " AND msds_location.aisle_id='" + locationRows[i]['rm.aisle_id'] + "'";
								if(locationRows[i]['rm.cabinet_id'] !='') {
									locRestriction += " AND msds_location.cabinet_id='" + locationRows[i]['rm.cabinet_id'] + "'";
									if(locationRows[i]['rm.shelf_id'] !='') {
										locRestriction += " AND msds_location.shelf_id='" + locationRows[i]['rm.shelf_id'] + "'";
										if(locationRows[i]['rm.bin_id'] !='') {
											locRestriction += " AND msds_location.bin_id='" + locationRows[i]['rm.bin_id'] + "'";
										}
										else {
											locRestriction += " AND msds_location.bin_id IS NULL";
										}
									}
									else {
										locRestriction += " AND msds_location.shelf_id IS NULL";
									}
								}
								else {
									locRestriction += " AND msds_location.cabinet_id IS NULL";
								}
							}
							else {
								locRestriction += " AND msds_location.aisle_id IS NULL";
							}
						}
						else {
							locRestriction += " AND msds_location.rm_id IS NULL";
						}
					}
					else {
						locRestriction += " AND msds_location.fl_id IS NULL";
					}
					locRestriction += ")";
				}

			}
		}

			// refresh the assignment panels restricted by the selected
			// locations and msds
			var restriction = '';
			if (msdsRestriction != '' && locRestriction != '') {
				restriction += msdsRestriction + " AND (" + locRestriction.substring(2) + ")";
			}
			else if (locRestriction != '') {
				restriction += locRestriction.substring(2);
			}
			else if (msdsRestriction != '') {
				restriction += msdsRestriction;
			}			
			this.abRiskMsdsDefLocsAssignmentList.refresh(restriction);
	},	
		
	/**
	 * judge whether the assignment is existed abRiskMsdsDefLocsAssignmentList.
	 */
	recordExists : function(location, msds) {
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		
		var restriction = 'msds_location.msds_id=' + msds + " AND (msds_location.bl_id"; 
		if(location['rm.bl_id']){
			restriction += "='" + location['rm.bl_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}
		restriction += " AND msds_location.fl_id" 
		if(location['rm.fl_id']){
			restriction += "='" + location['rm.fl_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}
		restriction += " AND msds_location.rm_id"
		if(location['rm.rm_id']){
			restriction += "='" + location['rm.rm_id'] + "'";
		}
		else{
			restriction += " IS NULL";
		}
		restriction += " AND msds_location.aisle_id"
			if(location['rm.aisle_id']){
				restriction += "='" + location['rm.aisle_id'] + "'";
			}
			else{
				restriction += " IS NULL";
			}
		restriction += " AND msds_location.cabinet_id"
			if(location['rm.cabinet_id']){
				restriction += "='" + location['rm.cabinet_id'] + "'";
			}
			else{
				restriction += " IS NULL";
			}
		restriction += " AND msds_location.shelf_id"
			if(location['rm.shelf_id']){
				restriction += "='" + location['rm.shelf_id'] + "'";
			}
			else{
				restriction += " IS NULL";
			}
		restriction += " AND msds_location.bin_id"
			if(location['rm.bin_id']){
				restriction += "='" + location['rm.bin_id'] + "'";
			}
			else{
				restriction += " IS NULL";
			}
		if(location['rm.eq_id']){
			restriction +=  " AND msds_location.eq_id='" + location['rm.eq_id'] + "')";
		}
		else {
			restriction +=  " AND msds_location.eq_id IS NULL)";
		}
		
		var records = ds.getRecords(restriction);
		if (records.length > 0) {
			return true;
		} else {
			return false;
		}
	}, 
	
	/**
	 * close the location filter console window 
	 */
	closeAbRiskMsdsDefLocsLocationConsoleWindow : function() {
		this.abRiskMsdsDefLocsLocationConsole.closeWindow();
	}, 
	
	/**
	 * close the MSDS filter console window 
	 */
	closeAbRiskMsdsDefLocsMsdsConsoleWindow : function() {
		this.abRiskMsdsDefLocsMsdsConsole.closeWindow();
	},
	
	/**
	 * This event handler for grid abRiskMsdsDefLocsAssignmentList after refreshed
	 */
	abRiskMsdsDefLocsAssignmentList_afterRefresh : function() {
		var grid = this.abRiskMsdsDefLocsAssignmentList;
		var selectedRows = this.selectedMSDSLocationRows;
		var allRows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
		
		// KB 3048457 - Close the edit form if there are no longer any selected rows (e.g., if user changes all items' location to a value outside the location panel selection)
		if(allRows.length == 0){
			this.abRiskMsdsDefLocsAssignmentForm.closeWindow();
		}
		else {
			for(var i=0;i<selectedRows.length; i++) {
				var index = selectedRows[i].row.getIndex();
				grid.selectRowChecked(index, true);
			}
			
			if(this.checkAllBoxSelected){
				var checkAllEl = Ext.get('abRiskMsdsDefLocsAssignmentList_checkAll');
				checkAllEl.dom.checked = true;
			}
			
			this.selectedMSDSLocationRows = [];
			this.checkAllBoxSelected = false;
		}
				
	},
	
	/**
	 * This event handler is called by show button in
	 * abRiskMsdsDefLocsAssignmentList to open the location details edit form
	 */
	abRiskMsdsDefLocsAssignmentList_onEditselected : function() {
		var rows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
		
		if(rows.length > 0) {
			var keysString = '';
			var msdsId = '';
			var nonMatch = false;			
			for(var i=0; i<rows.length; i++){
				var rowKey = rows[i]['msds_location.auto_number.key'];
				//check for non-unique MSDS products in the selection set
				if(i>0 && (rows[i]['msds_location.msds_id'] != rows[i-1]['msds_location.msds_id'])) {
					nonMatch = true;
					continue;
				}
				else {
					keysString += ", '" + rowKey + "'";
				}				
			}
			var restriction = 'msds_location.auto_number IN (' + keysString.substring(2) + ')';
			this.abRiskMsdsDefLocsAssignmentForm.refresh(restriction);
			if(nonMatch == false) {
				document.getElementById('abRiskMsdsDefLocsAssignmentForm_instructionsText').style.display = 'none';				
			}
			else {
				document.getElementById('abRiskMsdsDefLocsAssignmentForm_instructionsText').style.display = '';
			}
			this.abRiskMsdsDefLocsAssignmentForm.showInWindow({ width: 900, height: 500, closeButton: true });			
		}
	},
	
	
	/**
	 * This event handler for abRiskMsdsDefLocsAssignmentForm processes data source values from multiple records and replaces
	 * initial form field entries for any visible field having non-distinct read-only text field values with a message string ("Various").  
	 */
	abRiskMsdsDefLocsAssignmentForm_afterRefresh : function() {
		var form=this.abRiskMsdsDefLocsAssignmentForm;		
		var rows = this.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
		var columns = this.abRiskMsdsDefLocsAssignmentForm.fields;		
		var comparisonValues = new Array();
		var variesMessageStr = getMessage('valuesVary');
		
		form.hidden=false;
		
				// Perform field-specific functions for container number and code fields
		if(rows.length == 1) {
			// Remove all placeholder values, in case any exist from a previous set of records in the panel.			
			for(var j=0;j<columns.length; j++) {							
				form.fields.items[j].dom.placeholder="";				
			}
			containerCodeAndNumberFieldCheck();			
		}
		else {
			// Iterate through all fields and set valuesVary message where applicable
			for(var i=0;i<rows.length; i++) {
				for(var j=0;j<columns.length; j++) {							
//					if(i>0 && comparisonValues[j] != variesMessageStr && (comparisonValues[j] != rows[i][columns.keys[j]])) {
					if(i>0 && valueExistsNotEmpty(comparisonValues[j]) && (comparisonValues[j] != rows[i][columns.keys[j]])) {
							comparisonValues[j] = variesMessageStr;
							if(columns.items[j].config.hidden == "false") {							
								form.fields.items[j].fieldDef.defaultValue="";
								form.setFieldValue(columns.keys[j],"");
								form.fields.items[j].dom.placeholder=variesMessageStr;
								if(columns.items[j].fieldDef.readOnly == true && columns.items[j].fieldDef.format == "AnyChar"){
									form.setFieldValue(columns.items[j].fieldDef.id, variesMessageStr); 
								}
							}
							else {
								form.fields.items[j].dom.placeholder="";
								form.fields.items[j].fieldDef.defaultValue=form.fields.items[j].config.defaultValue;
							}
					}
					else {
						comparisonValues[j] = rows[i][columns.keys[j]];
						form.fields.items[j].dom.placeholder="";
						form.fields.items[j].fieldDef.defaultValue=form.fields.items[j].config.defaultValue;
					}				
				}
			}
			// Disable the container code and number of containers fields if more than one record is selected
			// because these fields' values are location-specific and should not be multi-edited
			form.enableField('msds_location.container_code', false);
			form.enableField('msds_location.num_containers', false);
		}		
	}
});

/**
 * function to be invoked by callFunction in order to close the location filter console window
 */
function closeAbRiskMsdsDefLocsLocationConsoleWindow() {
	var controller = View.controllers.get('abRiskMsdsDefLocsController');
	controller.closeAbRiskMsdsDefLocsLocationConsoleWindow();
}

/**
 * function to be invoked by callFunction in order to close the MSDS filter console window
 */
function closeAbRiskMsdsDefLocsMsdsConsoleWindow() {
	var controller = View.controllers.get('abRiskMsdsDefLocsController');
	controller.closeAbRiskMsdsDefLocsMsdsConsoleWindow();
}

/**
 * function to be invoked by callFunction in order to save details to all selected assignments
 */
function applyToSelectedAssignments() {
	var form = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentForm;
	var grid = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentList;
	var rows = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentList.getSelectedRows();
	abRiskMsdsDefLocsController.selectedMSDSLocationRows = rows;
	var checkAllEl = Ext.get('abRiskMsdsDefLocsAssignmentList_checkAll');
	var variesMessageStr = getMessage('valuesVary');
	abRiskMsdsDefLocsController.checkAllBoxSelected = checkAllEl.dom.checked;
			
	// KB 3048400 - automate and clarify container disposal status handling
	// Prompt the user to confirm save (=unassign/delete) when status is set to "Disposed." 
	var containerStatus = form.getFieldValue("msds_location.container_status");
	if(containerStatus=="DISPOSED"){
		var doIt = confirm(getMessage("prompt_disposeEditForm"));
		if(!doIt) {
			return false;
		}		
	}
	
	if(form.canSave()){
		var rowKeys = [];
		var ds = View.dataSources.get('abRiskMsdsDefLocsAssignmentDS');

		//Set Updated By User Name (user_name) value to current user's ID
		form.setFieldValue('msds_location.last_edited_by', View.user.name);
		
		//Set Date Last Updated to current date 		
		var currentDateObj = new Date();
		var currentDate = ds.formatValue('msds_location.date_updated', currentDateObj, false);
		form.setFieldValue('msds_location.date_updated', currentDate);
		
		//Get the list of selected locations
		for(var i=0; i<rows.length; i++){
			rowKeys.push(rows[i]['msds_location.auto_number.key']);
		}

		//(KB3035357) Save gridRows -1 records using dataSource.saveRecord to disable result message
		for(var i=0; i < (rowKeys.length - 1); i++){
			form.setFieldValue('msds_location.auto_number',rowKeys[i]);
			var record = form.getRecord();
			
			//avoid updating the old record
			record.oldValues['msds_location.auto_number'] = rowKeys[i];
			
			//do not replace field values where preceding values vary and user has not changed values in the form
			var columns = form.fields; 
			for(var j=0;j<columns.length; j++) {							
				if(record.values[columns.keys[j]] == "" && form.fields.items[j].dom.placeholder==variesMessageStr) {
					record.setValue([columns.keys[j]], record.oldValues[columns.keys[j]]);
				}				
			}
			try {
				ds.saveRecord(record);
			} catch (e) {
			}			
			// KB 3048400 - automate and clarify container disposal status handling
			if(containerStatus=="DISPOSED") {				
				// delete the record from the active inventory table.  The data change event handler will archive the record automatically				
				try {
					ds.deleteRecord(record);
				} catch (e) {
				}
			}
		}
		
		//(KB3035357) Save the last record with form.save to display just one result message
		var i = rowKeys.length - 1;
		form.setFieldValue('msds_location.auto_number',rowKeys[i]);
		var ds = View.dataSources.get('abRiskMsdsDefLocsAssignmentDS');
		var record = ds.getRecord('msds_location.auto_number='+rowKeys[i]);
		form.record = record;
		form.save();
		
		// KB 3048400 - automate and clarify container disposal status handling
		if(containerStatus=="DISPOSED") {				
			// delete the record from the active inventory table.  The data change event handler will archive the record automatically
			try {
				ds.deleteRecord(record);
			} catch (e) {
			}
			// refresh the assignment list and hide the edit form
			grid.refresh(grid.restriction);
			form.closeWindow();
		}
	}
}

/**
 * This event handler for abRiskMsdsDefLocsAssignmentForm maintains a relationship between the container ID and
 * number of containers fields wherein the number of containers must be one if the record has a container ID value defined.
 * Also, the container ID field and number of containers fields become read only when the user selects multiple rows for editing.
 */
function containerCodeAndNumberFieldCheck() {	
	var form = abRiskMsdsDefLocsController.abRiskMsdsDefLocsAssignmentForm;
	var containerCode = form.getFieldValue('msds_location.container_code');
	var numberContainers = form.getFieldValue('msds_location.num_containers');
	
	if(numberContainers == 1 || !(valueExistsNotEmpty(numberContainers))) {
		form.enableField('msds_location.container_code', true);
	}
	else {
		form.enableField('msds_location.container_code', false);
		form.enableField('msds_location.num_containers', true);
	}
	if(!(valueExistsNotEmpty(containerCode))) {
		form.enableField('msds_location.num_containers', true);
	}
	else {
		form.setFieldValue('msds_location.num_containers','1');
		form.enableField('msds_location.num_containers', false);
	}			
}

/**
* This function is called when the user clicks field text of any grid row to toggle selection.
*/
function selectGridItem(row) {	
	var selectedState = row.row.isSelected();
	row.row.select(!selectedState);
}
