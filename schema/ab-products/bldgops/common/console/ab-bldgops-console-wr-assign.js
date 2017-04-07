/**
 * Controller for the work request assign.
 */
View.createController('wrAssign', {
    /**
     * When a specific work order is selected  in the 'Assign to Existing Work Request' grid, assign to existing work order 
     * @param row
     * @param action
     */		
	assignWoGrid_assignWo_onClick: function(row, action) {
		var wrRecords = View.getOpenerView().WRrecords;
		var woPanel = View.panels.get('assignWoGrid');
		var woId = woPanel.rows[woPanel.selectedRowIndex]['wo.wo_id'];		
		assignWRs(wrRecords, woId);
	},

    /**
     * Assign to new work order
     * @param action
     */	
	createWoForm_onCreate: function(action) {
		this.createWo(false);
	},

    /**
     * Assign and issue to work order
     * @param action
     */			
	issueWoForm_onAssignAndIssueWRs: function(action) {
		this.createWo(true);
	},
	
	 /**
     * Assign and issue to work order
     * @param doIssue
     */			
	createWo: function(doIssue) {
		var formId = "createWoForm";
		if(doIssue){
			formId = "issueWoForm";
		}
		var woPanel = View.panels.get(formId);
		var description = woPanel.getFieldValue('wo.description');		
		if (description == "") {
			woPanel.clearValidationResult();
			woPanel.addInvalidField("wo.description", getMessage("noDescription"));
			woPanel.displayValidationResult();
			return;
		}
		
		var record = woPanel.getFieldValues();
		var recs = View.getOpenerView().WRrecords;
		
		if(doIssue){
			assignAndIssueWRs(record, recs);
		}else{
			createNewWo(record, recs);
		}
	}
});