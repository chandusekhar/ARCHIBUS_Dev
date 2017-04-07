var projImportMsProjectController = View.createController('projImportMsProject', {	
	project_id : '',
	
	projImportMsProjectConsole_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
		// clear any previously-created action transactions for this project
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_id', this.project_id)
		this.projImportMsProjectActionsGrid.refresh(restriction);
		this.projImportMsProjectActionsGrid_onClearActionTransactions();
	},
	
	projImportMsProjectConsole_onImportActions : function() {
		if(this.checkFileName())
		{
			var parameters = {
					'project_id' : this.project_id,
					'work_pkg_id' : ''};
			try{
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
	
	projImportMsProjectActionsGrid_onClearActionTransactions : function() {	
		if (this.projImportMsProjectActionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : this.project_id};
			try{
				var result = Workflow.call('AbProjectManagement-MsProjectService-importClearTransactions', parameters);
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
	
	projImportMsProjectActionsGrid_onPostActionTransactions : function() {
		if (this.projImportMsProjectActionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : this.project_id};
			try{
				var result = Workflow.call('AbProjectManagement-MsProjectService-importPostTransactions', parameters);
				if (result.code == 'executed') {
					this.projImportMsProjectActionsGrid_onClearActionTransactions();
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	refreshGridWithProjectWorkpkgRestriction : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_work_pkg_id', this.project_id);
		this.projImportMsProjectActionsGrid.refresh(restriction);
	},
	
	checkFileName : function() {
		var fileName = this.projImportMsProjectConsole.getFieldValue('project.doc_acts_xfer');

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