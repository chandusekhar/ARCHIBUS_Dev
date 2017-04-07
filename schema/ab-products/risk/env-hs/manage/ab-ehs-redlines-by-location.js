var abEhsRedlinesByLocationCtrl = View.createController('abEhsRedlinesByLocationCtrl', {
	
	// incident id
	incidentId: null,
	// site code
	siteId: null,
	// property code
	prId: null,
	// building code
	blId: null,
	// floor code
	flId: null,
	
	// selected floor row
	selectedRow: null,
	
	// document name
	docName: null,
	// document description
	docDescription: null,
	// document id
	docId: null,
	
	// file name pattern
	filePattern: "ehs_incidents-{0}-redline.png",
	
	afterViewLoad: function() {
		// add custom event listener
		this.abEhsRedlinesDrawing_list.addEventListener('onMultipleSelectionChange', this.onChangeMultipleSelection);
		// append instructions
		
		this.abEhsRedlinesDrawing_cad.appendInstruction('default','', getMessage('selectDrawing'));
		this.abEhsRedlinesDrawing_cad.appendInstruction('ondwgload','', getMessage('createRedlines'));
		
		this.abEhsRedlinesDrawing_cad.redmarksEnabled = true;
		// get input parameters incident code, building code and floor code
		if (valueExists(this.view.parameters['incidentId'])) {
			this.incidentId = this.view.parameters['incidentId'];
		}
		if (valueExists(this.view.parameters['siteId'])) {
			this.siteId = this.view.parameters['siteId'];
		}
		if (valueExists(this.view.parameters['prId'])) {
			this.prId = this.view.parameters['prId'];
		}
		if (valueExists(this.view.parameters['blId'])) {
			this.blId = this.view.parameters['blId'];
		}
		if (valueExists(this.view.parameters['flId'])) {
			this.flId = this.view.parameters['flId'];
		}
		
	},
	
	afterInitialDataFetch: function(){
		// disable select all  for drawing list
		this.abEhsRedlinesDrawing_list.enableSelectAll(false);
		this.applyFilterRestriction();
		this.docId =  this.getCurrentRedlineId(this.incidentId, this.filePattern);
		
		//KB3036592 - automatically load drawing if one floor is selected
		if(valueExistsNotEmpty(this.blId) && valueExistsNotEmpty(this.flId) && this.abEhsRedlinesDrawing_list.rows.length == 1){
			this.abEhsRedlinesDrawing_list.selectRowChecked(0);
		} 
	},
	
	// apply restriction using mini-console functionality
	applyFilterRestriction: function(){
		if (valueExistsNotEmpty(this.siteId)) {
			this.abEhsRedlinesDrawing_list.filterValues.push({"fieldName":  "bl.site_id", "filterValue": this.siteId});
		}
		if (valueExistsNotEmpty(this.prId)) {
			this.abEhsRedlinesDrawing_list.filterValues.push({"fieldName":  "bl.pr_id", "filterValue": this.prId});
		}
		if (valueExistsNotEmpty(this.blId)) {
			this.abEhsRedlinesDrawing_list.filterValues.push({"fieldName":  "rm.bl_id", "filterValue": this.blId});
			this.abEhsRedlinesDrawing_list.setFilterValue("rm.bl_id", this.blId);
		}
		if (valueExistsNotEmpty(this.flId)) {
			this.abEhsRedlinesDrawing_list.filterValues.push({"fieldName":  "rm.fl_id", "filterValue": this.flId});
			this.abEhsRedlinesDrawing_list.setFilterValue("rm.fl_id", this.flId);
		}
		
		if (this.abEhsRedlinesDrawing_list.filterValues.length > 0) {
			var parameters = this.abEhsRedlinesDrawing_list.getParameters(
					this.abEhsRedlinesDrawing_list.getCurrentSortValues(), 
					new Ab.grid.IndexValue(this.abEhsRedlinesDrawing_list.indexColumnID, this.abEhsRedlinesDrawing_list.indexValue, this.abEhsRedlinesDrawing_list.indexLevel));
			
			parameters.filterValues = toJSON(this.abEhsRedlinesDrawing_list.filterValues);
			try {
			    var result = this.abEhsRedlinesDrawing_list.getData(parameters);
				this.abEhsRedlinesDrawing_list.reloadOnFilter(result.data);
			} catch (e) {
				this.abEhsRedlinesDrawing_list.handleError(e);
			}
		}
	},
	
	/**
	 * Clear floors restriction panel.
	 */
	abEhsRedlinesDrawing_list_onClear: function(){
		this.abEhsRedlinesDrawing_list.clearAllFilterValues();
		this.abEhsRedlinesDrawing_list.refresh();
	},
	
	// behave like single selection
	onChangeMultipleSelection: function(row){
		var cadPanel = View.panels.get('abEhsRedlinesDrawing_cad');
		var legendPanel = View.panels.get('abEhsRedlinesLegend_list');
		var controller = View.controllers.get('abEhsRedlinesByLocationCtrl');
		if (row.row.isSelected()) {
			row.grid.unselectAll();
			row.row.select(true);
			controller.selectedRow = row;
		}else{
			controller.selectedRow = null;
			cadPanel.processInstruction('default', '');
			legendPanel.show(false, true);
		}
		
		var opts = null;
		cadPanel.addDrawing(row, opts);
	},
	
	// on save redmarks event handler
	abEhsRedlinesDrawing_cad_onSaveRedmarks: function(){
		// open document details panel
		var restriction = new Ab.view.Restriction();
		var isNew = true;
		if (valueExistsNotEmpty(this.docId)) {
			restriction.addClause('docs_assigned.doc_id', this.docId, '=');
			isNew = false;
		}
		var docsPanel = View.panels.get('abEhsRedlinesDoc_form');
		var windowConfig = {
	            width: 600, 
	            height: 400,
	            closeButton: true
		}
		docsPanel.refresh(restriction, isNew);
		docsPanel.showInWindow(windowConfig);
	},
	
	abEhsRedlinesDoc_form_afterRefresh: function(){
		if(this.abEhsRedlinesDoc_form.newRecord
				&& valueExistsNotEmpty(this.incidentId)){
			this.abEhsRedlinesDoc_form.setFieldValue('docs_assigned.name', getMessage("default_doc_name").replace("{0}", this.incidentId));
		}
	},
	
	// save redline file
	abEhsRedlinesDoc_form_onSave: function(){
		if (this.abEhsRedlinesDoc_form.canSave()) {
			this.docName = this.abEhsRedlinesDoc_form.getFieldValue('docs_assigned.name');
			this.docDescription = this.abEhsRedlinesDoc_form.getFieldValue('docs_assigned.description');
			// submit redmark file
			if (this.submitRedmarkFile()) {
				// update incident record
				this.updateIncident();
		    	if(this.abEhsRedlinesDoc_form.isShownInWindow()){
		    		this.abEhsRedlinesDoc_form.closeWindow();
		    	}else{
		    		this.abEhsRedlinesDoc_form.show(false, true);
		    	}
			}
		}
	},
	
	// submit file
	submitRedmarkFile: function(){
		try {
			var currentDate = this.abEhsRedlinesDoc_form.getFieldValue('docs_assigned.date_doc'); 
			var loggedEmployeeId = this.abEhsRedlinesDoc_form.getFieldValue('docs_assigned.doc_author');
			var result = Workflow.callMethod("AbRiskEHS-EHSService-submitRedlineToIncident", parseInt(this.incidentId), this.docName, this.docDescription, this.abEhsRedlinesDrawing_cad.getImageBytes(), loggedEmployeeId, currentDate);
			return (result.code == "executed");
		} catch (e) {
			Workflow.handleError(e);
			return false;
		}
	},
	
	// get current redline document id
	getCurrentRedlineId: function(incidentId, namePattern) {
		var docsDs = View.dataSources.get('abEhsRedlinesDoc_ds');
		var fileName = namePattern.replace('{0}', incidentId);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('docs_assigned.incident_id', incidentId, '=');
		restriction.addClause('docs_assigned.doc', fileName, '=');
		var recDoc = docsDs.getRecord(restriction);
		var docId = null;
		if (valueExists(recDoc.getValue('docs_assigned.doc_id'))) {
			docId = recDoc.getValue('docs_assigned.doc_id');
		}
		return docId;
	},
	
	// update incident location
	updateIncident: function() {
		var siteId = this.selectedRow.row.getFieldValue('bl.site_id');
		var prId = this.selectedRow.row.getFieldValue('bl.pr_id');
		var blId = this.selectedRow.row.getFieldValue('rm.bl_id');
		var flId = this.selectedRow.row.getFieldValue('rm.fl_id');
		var rmId = null;
		if (siteId != this.siteId || prId != this.prId || blId != this.blId || flId != this.prId) {
			rmId = "";
		}
		
		if (valueExistsNotEmpty(this.siteId) || valueExistsNotEmpty(this.prId) 
				|| valueExistsNotEmpty(this.blId) || valueExistsNotEmpty(this.flId)) {
			siteId = "";
			prId = "";
			blId = "";
			flId = "";
			rmId = "";
		}
		
		var message = getMessage("msgRedlineSaved");
		
		if (valueExists(this.view.parameters.callback)) {
			this.view.parameters.callback(siteId, prId, blId, flId, rmId, message);
		}
	}
	
});