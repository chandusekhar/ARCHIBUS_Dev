var projMngActsMsProjImpController = View.createController('projMngActsMsProjImp', {	
	project_id : '',
	
	afterInitialDataFetch : function() {
		var gridRestriction = View.getOpenerView().panels.get('projMngActsFilter').restriction;
		this.projMngActsMsProjImp_console.refresh(gridRestriction);
		this.project_id = gridRestriction.findClause('project.project_id').value;
		
		/* clear any previously-created action transactions for this project */
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_id', this.project_id);
		var records = this.projMngActsMsProjImpDs1.getRecords(restriction);
		if (records.length > 0) {
			var parameters = {'project_work_pkg_id' : this.project_id};
			
			try {
				var result = Workflow.call('AbProjectManagement-MsProjectService-importClearTransactions', parameters);
				if (result.code == 'executed') {
					
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	projMngActsMsProjImp_console_onImportActions : function() {
		if(this.checkFileName())
		{
			try {
				var parameters = {
						'project_id' : this.project_id,
						'work_pkg_id' : ''};
				var result = Workflow.call('AbProjectManagement-MsProjectService-importFromMsProject', parameters);
				if (result.code == 'executed') {
					this.refreshGridWithProjectWorkpkgRestriction();
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	projMngActsMsProjImp_actionsGrid_onClearActionTransactions : function() {	
		if (this.projMngActsMsProjImp_actionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : this.project_id};
			
			try {
				var result = Workflow.call('AbProjectManagement-MsProjectService-importClearTransactions', parameters);
				if (result.code == 'executed') {
					var restriction = new Ab.view.Restriction();
					restriction.addClause('activity_log_trans.project_work_pkg_id', this.project_id);
					this.projMngActsMsProjImp_actionsGrid.refresh(restriction);
					this.projMngActsMsProjImp_actionsGrid.actions.get('postActionTransactions').show(false);
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	projMngActsMsProjImp_actionsGrid_onPostActionTransactions : function() {
		View.openProgressBar();
		View.updateProgressBar(1/4);
		if (this.projMngActsMsProjImp_actionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : this.project_id};
			try {
				var result = Workflow.call('AbProjectManagement-MsProjectService-importPostTransactions', parameters);
			
				if (result.code == 'executed') {
					View.updateProgressBar(2/4);
					this.projMngActsMsProjImp_actionsGrid_onClearActionTransactions();
					View.updateProgressBar(3/4);
					View.getOpenerView().panels.get('projMngActsGrid').refresh();
					View.closeThisDialog();
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
		View.closeProgressBar();
	},
	
	refreshGridWithProjectWorkpkgRestriction : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_work_pkg_id', this.project_id);
		this.projMngActsMsProjImp_actionsGrid.refresh(restriction);
		this.projMngActsMsProjImp_actionsGrid.actions.get('postActionTransactions').show(true);
	},
	
	checkFileName : function() {
		var fileName = this.projMngActsMsProjImp_console.getFieldValue('project.doc_acts_xfer');

		if(fileName == '')
	    {
			View.showMessage(getMessage("alert_select_valid_msproject_file"));
	        return false;
	    }

		var pos = fileName.lastIndexOf('.');
		if(pos > 0)
		{
			var docFileExtension = fileName.substring(pos+1);
			if(docFileExtension != "mpp")
			{
	        	View.showMessage(getMessage("alert_select_valid_msproject_file"));
	            return false;
			}
		}
	    return true;
	}
});