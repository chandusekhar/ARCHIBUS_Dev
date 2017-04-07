var commEqDetailsDocController = View.createController('commEqDetailsDoc', {
	activitytype : '',
	eqRecord : null,
	
	afterInitialDataFetch : function() {
		this.activitytype = 'CX - CONSTRUCTION CHECKLISTS';
	},
	
	commEqDetailsDoc_eqForm_afterRefresh: function() {
		var eq_id = View.getOpenerView().panels.get('commEqDetailsForm').getFieldValue('eq.eq_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq.eq_id', eq_id);
		this.commEqDetailsDoc_actionGrid.refresh(restriction);
		
		this.eqRecord = this.commEqDetailsDoc_ds0.getRecord(restriction);
	},
	
	commEqDetailsDoc_actionGrid_onAddNew : function() {
		var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	
        var controller = this;
        var dialog = View.openDialog('ab-comm-eq-details-doc-create.axvw', restriction, true, {
            closeButton: false,
            maximize: true,

            afterInitialDataFetch: function(dialogView) {
                var dialogController = dialogView.controllers.get('commEqDetailsDocCreate');   
                dialogController.commEqDetailsDocCreateForm1.setFieldValue('activity_log.activity_type', controller.activitytype);
                dialogController.onCompleteForm = controller.commEqDetailsDoc_onCompleteForm.createDelegate(controller);
                dialogController.eqRecord = controller.eqRecord;
            }
        });
	},
	
	 /**
     * Callback for Create New Action dialog.
     */
	commEqDetailsDoc_onCompleteForm: function(dialogController) {
    	this.commEqDetailsDoc_actionGrid.refresh();
    }
});

