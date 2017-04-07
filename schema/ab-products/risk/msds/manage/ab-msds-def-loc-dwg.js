/**
 * @author Guo Jiangtao
 * Modified V.22.1 Eric_Maxfield@archibus.com
 */
var abRiskMsdsDefLocDwgController = View.createController('abRiskMsdsDefLocDwgController', {

	/**
	 * selected floors
	 */
	selectedFloors : [],
	
	/**
	 * selected rows in msds grid
	 */
	selectedMSDSRows : [],
	
	/**
	 * selected room primary key
	 */
	selecteRoomPK: null,

	afterViewLoad : function() {
		// Specify instructions for the Drawing Control
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("ondwgload", "", getMessage('selectMsds'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("abRiskMsdsDefLocDwgGridMsds", "onclick", getMessage('selectRoom'));
		this.abRiskMsdsDefLocDwgDrawingPanel.appendInstruction("abRiskMsdsDefLocDwgDrawingPanel", "onclick", getMessage('selectMsds'));

		// onclick event of the drawing panel
		this.abRiskMsdsDefLocDwgDrawingPanel.addEventListener('onclick', onRoomClicked);
		// ondwgload event of the drawing panel
		this.abRiskMsdsDefLocDwgDrawingPanel.addEventListener('ondwgload', onDwgLoaded);

		// set the all tree level as multi-selected
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(0);
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(1);
		this.abRiskMsdsDefLocDwgTreeBl.setMultipleSelectionEnabled(2);
		
    	this.abRiskMsdsDefLocDwgGridMsds.addEventListener('onMultipleSelectionChange', function(row) {
    		var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
    		var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
    		var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
    		var rows = grid.getSelectedRows();
    		abRiskMsdsDefLocDwgController.selectedMSDSRows = rows;
    		if (rows.length > 0) {
    			if(drawingPanel.dwgLoaded){
    				var msdsRes = "";
    				for(var i=0;i<rows.length;i++){
    					var msdsRow = rows[i];
    					var msds = msdsRow['msds_data.msds_id'];
    					if (msdsRow['msds_data.msds_id.raw']) {
    						msds = msdsRow['msds_data.msds_id.raw'];
    					}
    					msdsRes+="OR (msds_location.msds_id=" + msds + ")"
    				}
    				
    				msdsRes = "("+msdsRes.substring(2)+")";
    				ds.addParameter('msdsRes',msdsRes);
    				drawingPanel.applyDS('labels');
    				drawingPanel.applyDS('highlight');
    				drawingPanel.processInstruction('abRiskMsdsDefLocDwgGridMsds', 'onclick');
    				drawingPanel.setToAssign("msds_data.msds_id", '0');
    			}
    		}else{
    			if(drawingPanel.dwgLoaded){
    				ds.addParameter('msdsRes','1=1');
    				drawingPanel.applyDS('labels');
    				drawingPanel.applyDS('highlight');
    			}
    		}
    		
    		abRiskMsdsDefLocDwgController.showLocationGrid();
	    });
	},
	
	abRiskMsdsDefLocDwgGridMsds_afterRefresh: function() {
		var grid = this.abRiskMsdsDefLocDwgGridMsds;
		var selectedRows = this.selectedMSDSRows;
		var allRows = this.abRiskMsdsDefLocDwgGridMsds.rows;
		
		// KB 3048457 - Close the edit form if there are no longer any selected rows (e.g., if user changes all items' location to a value outside the location panel selection)
		if(allRows.length == 0){
			this.abRiskMsdsDefLocDwgAssignmentForm.closeWindow();
		}
		else {
			for(var i=0;i<selectedRows.length; i++) {
				var index = selectedRows[i].row.getIndex();
				grid.selectRowChecked(index, true);
			}
			
			var checkAllEl = Ext.get('abRiskMsdsDefLocDwgGridMsds_checkAll');
	        if (valueExists(checkAllEl)) {
	            var currentController = this;
	            checkAllEl.on('click', function(event, el) {
	            	currentController.selectAllMSDS(el.checked);
	            });
	        }
		}
		
		
        
	},
	
	abRiskMsdsDefLocDwgAssignmentForm_afterRefresh: function() {
		containerCodeAndNumberFieldCheck();
	},
	
	/**
	 * on click event handler of button 'Dispose'
	 */
	abRiskMsdsDefLocDwgAssignment_onDisposeSelected : function() {
		//KB 3047836 - Prompt user for confirmation before disposing		
		var doIt = confirm(getMessage("prompt_disposeSelected"));
		if(!doIt) return;
		
		var ds = this.abRiskMsdsDefLocsAssignmentDS;
		
		// first, update and save the record with status Disposed
		var assignmentRecords = this.abRiskMsdsDefLocDwgAssignment.getSelectedRecords();		
		if (assignmentRecords.length > 0) {
			var currentDateObj = new Date();
			var currentDate = this.abRiskMsdsDefLocsAssignmentDS.formatValue("msds_location.date_updated", currentDateObj, false);
			// loop all selected assignments, set status to Disposed, save, then delete them
			for ( var i = 0; i < assignmentRecords.length; i++) {							
				var record = assignmentRecords[i];
				record.setValue("msds_location.date_updated",currentDate);		
				record.setValue("msds_location.last_edited_by",abRiskMsdsDefLocDwgController.view.user.name);
				record.setValue("msds_location.container_status","DISPOSED");
				try {
					this.abRiskMsdsDefLocsAssignmentDS.saveRecord(record);
				} catch (e) {
				}
			}
		}
		// now delete the records
		var assignmentRows = this.abRiskMsdsDefLocDwgAssignment.getSelectedRows();		
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
			this.abRiskMsdsDefLocDwgAssignment.refresh(this.abRiskMsdsDefLocDwgAssignment.restriction);			
		}
	},
	
	// KB 3048453 - update highlights after changes to location info via edit form
	abRiskMsdsDefLocDwgAssignment_afterRefresh : function() {
		var drawingPanel = this.abRiskMsdsDefLocDwgDrawingPanel;
		drawingPanel.applyDS('labels');
		drawingPanel.applyDS('highlight');
	},

	abRiskMsdsDefLocDwgTreeBl_onShowSeletedFloorPlan : function() {
		if (this.checkSelection()) {
			// get all selected floor plans
			this.selectedFloorPlans = [];
			this.selectedFloors = [];
			var flNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(2);
			for ( var i = 0; i < flNodes.length; i++) {
				var floorPlan = {};
				floorPlan['bl_id'] = flNodes[i].parent.data['bl.bl_id'];
				floorPlan['fl_id'] = flNodes[i].data["fl.fl_id"]
				floorPlan['dwgname'] = flNodes[i].data["fl.dwgname"]
				this.selectedFloorPlans.push(floorPlan);
				this.selectedFloors.push(floorPlan);
			}
			// clear the drawing panel before loading
			this.abRiskMsdsDefLocDwgDrawingPanel.clear();
			// load first drawing, the other floor plans in array
			// selectedFloorPlans will be loaded in ondwgload method to avoid
			// loading exception
			this.addFirstDrawing();
			
			//show msds location list
			this.showLocationGrid();
		}
	},
	
	abRiskMsdsDefLocDwgGridMsds_onClearMSDS : function() {
		var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
		var rows = grid.getSelectedRows();
		if (rows.length > 0) {
			var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
			ds.addParameter('msdsRes','1=1');
			var drawingPanel = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel;
			drawingPanel.applyDS('labels');
			drawingPanel.applyDS('highlight');
			drawingPanel.processInstruction('abRiskMsdsDefLocDwgDrawingPanel', 'onclick');
			
			this.selectAllMSDS(false);
		}
	},
	
	/**
	 * unselect all msds rows
	 */
	selectAllMSDS : function(selected, disableListener) {
		var dataRows = this.abRiskMsdsDefLocDwgGridMsds.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            var selectionCheckbox = dataRow.firstChild.firstChild;
            selectionCheckbox.checked = selected;
        }
        
        // clear the Check All checkbox
        var checkAllEl = Ext.get('abRiskMsdsDefLocDwgGridMsds_checkAll');
        if (valueExists(checkAllEl)) {
            checkAllEl.dom.checked = selected;
        }
        
        if(disableListener){
        	return;
        }
        
        var listener = this.abRiskMsdsDefLocDwgGridMsds.getEventListener('onMultipleSelectionChange');
        if (listener) {
            listener();
        }
	},

	/**
	 * check the tree selection
	 */
	checkSelection : function() {
		// get all selected sites nodes
		var siteNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(0);
		for ( var i = 0; i < siteNodes.length; i++) {
			// if site node not expand, refresh it to load children
			if (siteNodes[i].children.length == 0) {
				this.abRiskMsdsDefLocDwgTreeBl.refreshNode(siteNodes[i]);
			}

			// make all building nodes in this site selected
			var blNodes = siteNodes[i].children;
			for ( var j = 0; j < blNodes.length; j++) {
				if (!blNodes[j].isSelected) {
					blNodes[j].setSelected(true);
				}
			}
		}

		// get all selected building nodes
		var blNodes = this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(1);
		for ( var i = 0; i < blNodes.length; i++) {
			// if building node not expand, refresh it to load children
			if (blNodes[i].children.length == 0) {
				this.abRiskMsdsDefLocDwgTreeBl.refreshNode(blNodes[i]);
			}

			// make all floor nodes in this building selected
			var flNodes = blNodes[i].children;
			for ( var m = 0; m < flNodes.length; m++) {
				if (!flNodes[m].isSelected) {
					flNodes[m].setSelected(true);
				}
			}
		}

		// get all floor nodes, if no one selected, give a warning
		if (this.abRiskMsdsDefLocDwgTreeBl.getSelectedNodes(2).length == 0) {
			View.showMessage(getMessage('error_noselection'));
			return false;
		}
		return true;
	},

	/**
	 * add first drawing to the drawing panel
	 */
	addFirstDrawing : function() {
		if (this.selectedFloorPlans.length > 0) {
			// load the first drawing, the other drawings in the list will be
			// loaded in listener onDwgLoaded
			// which can avoid bug when loading multiple drawing at the same
			// time
			this.floorPlan = this.selectedFloorPlans[0];
			var dcl = new Ab.drawing.DwgCtrlLoc(this.floorPlan['bl_id'], this.floorPlan['fl_id'], '', this.floorPlan['dwgname']);
			this.abRiskMsdsDefLocDwgDrawingPanel.addDrawing(dcl, null);

			// remove the first drawing name and related building and floor in
			// the array,
			// so the next one became the first one in the array
			this.selectedFloorPlans.shift();
		}
	},
	
	/**
	 * show location grid
	 */
	showLocationGrid: function() {
		var restriction = " 1=1 ";
		if (this.selecteRoomPK) {
			restriction += " and (msds_location.bl_id='" + this.selecteRoomPK[0] + "'" 
				+ " AND msds_location.fl_id='" + this.selecteRoomPK[1] + "'"
			    + " AND msds_location.rm_id='" + this.selecteRoomPK[2] + "')"; 
		}else if (this.selectedFloors.length > 0) {
		    var floorRes = "";
			for(var i=0;i<this.selectedFloors.length;i++){
				var floor = this.selectedFloors[i];
				floorRes+="OR (msds_location.bl_id='" + floor['bl_id'] + "'" 
				+ " AND msds_location.fl_id='" + floor['fl_id'] + "')"; 
			}
			
			restriction += " and ("+ floorRes.substring(2)+")";
		}
		
		if(this.selectedMSDSRows.length>0){
			var msdsRes = "";
			for(var i=0;i<this.selectedMSDSRows.length;i++){
				var msdsRow = this.selectedMSDSRows[i];
				var msds = msdsRow['msds_data.msds_id'];
				if (msdsRow['msds_data.msds_id.raw']) {
					msds = msdsRow['msds_data.msds_id.raw'];
				}
				msdsRes+="OR (msds_location.msds_id=" + msds + ")"
			}
			
			restriction += " and ("+ msdsRes.substring(2)+")";
		}
		
		this.abRiskMsdsDefLocDwgAssignment.refresh(restriction)
	},
	
	abRiskMsdsDefLocDwgDrawingPanel_onExportDOCX: function(){
		var doIt = confirm(getMessage("z_DRAWING_PRINTING"));
		if(!doIt) return;
		var panel = this.abRiskMsdsDefLocDwgDrawingPanel;
				
		var jobId = panel.callDOCXReportJob(getMessage("docxTitle"), panel.restriction, {});
		
		var jobStatus = Workflow.getJobStatus(jobId);
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}
		
		if (jobStatus.jobFinished) {
			var url  = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}
		
		View.closeProgressBar();
	},
	
	/**
	 *   This event handler adds the current user name and date to the form before saving.
	 *   It also prompts the user to confirm save (=unassign/delete) when status is set to "Disposed." 
	 */
	abRiskMsdsDefLocDwgAssignmentForm_beforeSave: function(){
		var form = this.abRiskMsdsDefLocDwgAssignmentForm;
		var currentDateObj = new Date();
		var currentDate = this.abRiskMsdsDefLocsAssignmentDS.formatValue("msds_location.date_updated", currentDateObj, false);
		form.setFieldValue("msds_location.date_updated", currentDate);		
		form.setFieldValue('msds_location.last_edited_by',this.view.user.name);
		
		// KB 3048400 - automate and clarify container disposal status handling
		var containerStatus = form.getFieldValue("msds_location.container_status");
		if(containerStatus=="DISPOSED"){
			var doIt = confirm(getMessage("prompt_disposeEditForm"));
			if(!doIt) {
				return false;
			}
			else {
				// override the ususal beforeSave handler in this case and save directly, then delete
				this.abRiskMsdsDefLocDwgAssignmentForm.removeEventListener('beforeSave');								
				this.abRiskMsdsDefLocDwgAssignmentForm.save();
				var locationRecord = form.getRecord();
				try {
					form.deleteRecord(locationRecord);
				} catch (e) {
				}
				// refresh the assignment list and hide the edit form
				this.abRiskMsdsDefLocDwgAssignment.refresh(this.abRiskMsdsDefLocDwgAssignment.restriction);
				this.abRiskMsdsDefLocDwgAssignmentForm.closeWindow();
				// restore the original beforeSave handler
				this.abRiskMsdsDefLocDwgAssignmentForm.addEventListener('beforeSave', this.abRiskMsdsDefLocDwgAssignmentForm_beforeSave.createDelegate(this));								
				return false;
			}
		}
	}
});

/**
 * on click event handler when click tree node
 */
function onTreeClick(ob) {
	var treePanel = View.panels.get('abRiskMsdsDefLocDwgTreeBl')
	var currentNode = treePanel.lastNodeClicked;
	abRiskMsdsDefLocDwgController.selectedFloorPlans = [];
	abRiskMsdsDefLocDwgController.selectedFloors = [];
	abRiskMsdsDefLocDwgController.selecteRoomPK = null;
	var floorPlan = {};
	floorPlan['bl_id'] = currentNode.parent.data['bl.bl_id'];
	floorPlan['fl_id'] = currentNode.data["fl.fl_id"]
	floorPlan['dwgname'] = currentNode.data["fl.dwgname"]
	abRiskMsdsDefLocDwgController.selectedFloorPlans.push(floorPlan);
	abRiskMsdsDefLocDwgController.selectedFloors.push(floorPlan);
	// clear the drawing panel before loading
	abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel.clear();
	abRiskMsdsDefLocDwgController.addFirstDrawing();
	abRiskMsdsDefLocDwgController.showLocationGrid();
}

/**
 * on click event handler when click row of MSDSs grid
 */
function selectMSDS(row) {
	var grid = View.panels.get('abRiskMsdsDefLocDwgGridMsds');
	var ds = View.dataSources.get('abRiskMsdsDefLocDwgHlTypeDS');
	var msds = row['msds_data.msds_id'];
	var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
	
	abRiskMsdsDefLocDwgController.selectAllMSDS(false,true);
	grid.selectRowChecked(row.index, true);
}

/**
 * on click event handler when click row of MSDS assignment grid
 */
function selectMSDSLocation(row) {
	var autoNumber = row['msds_location.auto_number'];
	if (row['msds_location.auto_number.raw']) {
		autoNumber = row['msds_location.auto_number.raw'];
	}

	var detailsPanel = View.panels.get('abRiskMsdsDefLocDwgAssignmentForm');
	detailsPanel.refresh('msds_location.auto_number=' + autoNumber);
	detailsPanel.showInWindow({
		width : 800,
		height : 400
	});
}

/**
 * on click event handler when click drawing room
 */
function onRoomClicked(pk, selected) {
	if(selected){
		var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocsAssignmentDS;
		var locRestriction = "msds_location.bl_id='" + pk[0] + "' AND " + "msds_location.fl_id='" + pk[1] + "' AND " + "msds_location.rm_id='" + pk[2] + "' ";
		var selectedRows = abRiskMsdsDefLocDwgController.selectedMSDSRows;
		if (selectedRows.length > 0) {			
			// loop all selected msds and add records to msds_location
			for ( var i = 0; i < selectedRows.length; i++) {
				var msds = selectedRows[i]['msds_data.msds_id'];
				if (selectedRows[i]['msds_data.msds_id.raw']) {
					msds = selectedRows[i]['msds_data.msds_id.raw'];
				}

				if (!recordExists(pk, msds)) {
					var rec = new Ab.data.Record();
					rec.isNew = true;
					rec.setValue("msds_location.msds_id", msds);
					rec.setValue("msds_location.bl_id", pk[0]);
					rec.setValue("msds_location.fl_id", pk[1]);
					rec.setValue("msds_location.rm_id", pk[2]);
					rec.setValue("msds_location.site_id", getSiteCode(pk[0]));
					rec.setValue("msds_location.last_edited_by",this.abRiskMsdsDefLocDwgController.view.user.name);
					try {
						ds.saveRecord(rec);
					} catch (e) {
					}
				}

			}

			var drawingPanel = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgDrawingPanel;
			drawingPanel.applyDS('labels');
			drawingPanel.applyDS('highlight');
			drawingPanel.processInstruction('abRiskMsdsDefLocDwgGridMsds', 'onclick');
		}else{
			abRiskMsdsDefLocDwgController.selecteRoomPK = pk;
		}
		
	}else{
		abRiskMsdsDefLocDwgController.selecteRoomPK = null;
	}
	
	
	// refresh the assignment panels restricted by the selected
	// locations
	abRiskMsdsDefLocDwgController.showLocationGrid();
	abRiskMsdsDefLocDwgController.selecteRoomPK = null;

}

/**
 * listener of the drawing onload event
 */
function onDwgLoaded() {
	// add next drawing in the drawing name array until all drawings are loaded
	abRiskMsdsDefLocDwgController.addFirstDrawing();
	var drawingPanel = View.panels.get('abRiskMsdsDefLocDwgDrawingPanel');
	drawingPanel.processInstruction('abRiskMsdsDefLocDwgDrawingPanel', 'onclick');
	drawingPanel.setToAssign("msds_data.msds_id", '0');
}


/**
 * judge whether the assignment is existed.
 */
function recordExists(location, msds) {
	var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocsAssignmentDS;
	var restriction = 'msds_location.msds_id=' + msds + " AND (msds_location.bl_id='" + location[0] + "'" + " AND msds_location.fl_id='" + location[1] + "'" + " AND msds_location.rm_id='"
		+ location[2] + "')";
	var records = ds.getRecords(restriction);
	if (records.length > 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * get site code base on building code
 */
function getSiteCode(blId) {
	var ds = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgTreeSiteDS;
	var restriction = "exists(select 1 from bl where bl.site_id = site.site_id and bl.bl_id='" + blId + "')";
	var records = ds.getRecords(restriction);
	if (records.length > 0) {
		return records[0].getValue('site.site_id');
	} else {
		return '';
	}
}

/**
 * This event handler for abRiskMsdsDefLocDwgAssignmentForm maintains a relationship between the container ID and
 * number of containers fields wherein the number of containers must be one if the record has a container ID value defined.
 */
function containerCodeAndNumberFieldCheck() {	
	var form = abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgAssignmentForm;
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
 * Execute when user clicks 'Unassign' action button
 */
function unassignSelected() {
	var doIt = confirm(getMessage("prompt_unassignSelected"));
	if(!doIt) return;
	
	var assignmentRecords = this.abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgAssignment.getSelectedRecords();		
	if (assignmentRecords.length > 0) {
		var currentDateObj = new Date();
		var currentDate = this.abRiskMsdsDefLocDwgController.abRiskMsdsDefLocsAssignmentDS.formatValue("msds_location.date_updated", currentDateObj, false);
		// loop all selected assignments, set status to Disposed, save, then delete them
		for ( var i = 0; i < assignmentRecords.length; i++) {							
			var record = assignmentRecords[i];
			record.setValue("msds_location.date_updated",currentDate);		
			record.setValue("msds_location.last_edited_by",abRiskMsdsDefLocDwgController.view.user.name);
			record.setValue("msds_location.eq_id","");
			record.setValue("msds_location.bin_id","");
			record.setValue("msds_location.shelf_id","");
			record.setValue("msds_location.cabinet_id","");
			record.setValue("msds_location.aisle_id","");
			record.setValue("msds_location.rm_id","");
			record.setValue("msds_location.fl_id","");
			try {
				this.abRiskMsdsDefLocDwgController.abRiskMsdsDefLocsAssignmentDS.saveRecord(record);
			} catch (e) {
			}
		}
		// refresh the assignment list and hide the edit form
		abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgAssignment.refresh(abRiskMsdsDefLocDwgController.abRiskMsdsDefLocDwgAssignment.restriction);			
	}
}