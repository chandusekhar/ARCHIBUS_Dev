var projMngPkgActMsProjImpController = View.createController('projMngPkgActMsProjImp', {	
	project_id : '',
	work_pkg_id : '',
	
	afterInitialDataFetch : function() {
		var gridRestriction = View.getOpenerView().panels.get('projMngPkgActFilter').restriction;
		this.projMngPkgActMsProjImp_console.refresh(gridRestriction);
		this.project_id = gridRestriction.findClause('work_pkgs.project_id').value;
		this.work_pkg_id = gridRestriction.findClause('work_pkgs.work_pkg_id').value;
		
		/* clear any previously-created action transactions for this pkg */
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_id', this.project_id);
		restriction.addClause('activity_log_trans.work_pkg_id', this.work_pkg_id);
		var records = this.projMngPkgActMsProjImpDs1.getRecords(restriction);
		if (records.length > 0) {
			var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
			var parameters = {'project_work_pkg_id' : project_work_pkg_id};
			try{
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
	
	projMngPkgActMsProjImp_console_onImportActions : function() {
		if(this.checkFileName())
		{
			var parameters = {
					'project_id' : this.project_id,
					'work_pkg_id' : this.work_pkg_id};
			try{
				var result = Workflow.callMethodWithParameters('AbProjectManagement-MsProjectService-importFromMsProject', parameters);
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
	
	projMngPkgActMsProjImp_actionsGrid_onClearActionTransactions : function() {
		var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
		if (this.projMngPkgActMsProjImp_actionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : project_work_pkg_id};
			try{
				var result = Workflow.callMethodWithParameters('AbProjectManagement-MsProjectService-importClearTransactions', parameters);
			
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
	
	projMngPkgActMsProjImp_actionsGrid_onPostActionTransactions : function() {
		View.openProgressBar();
		View.updateProgressBar(1/4);
		var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
		if (this.projMngPkgActMsProjImp_actionsGrid.rows.length > 0)
		{
			var parameters = {'project_work_pkg_id' : project_work_pkg_id};
			try{
				var result = Workflow.callMethodWithParameters('AbProjectManagement-MsProjectService-importPostTransactions', parameters);
				if (result.code == 'executed') {
					View.updateProgressBar(2/4);
					this.projMngPkgActMsProjImp_actionsGrid_onClearActionTransactions();
					View.updateProgressBar(3/4);
					View.getOpenerView().panels.get('projMngPkgActGrid').refresh();
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
		restriction.addClause('activity_log_trans.project_id', this.project_id);
		restriction.addClause('activity_log_trans.work_pkg_id', this.work_pkg_id);
		this.projMngPkgActMsProjImp_actionsGrid.refresh(restriction);
		this.projMngPkgActMsProjImp_actionsGrid.actions.get('postActionTransactions').show(true);
	},
	
	checkFileName : function() {
		var fileName = this.projMngPkgActMsProjImp_console.getFieldValue('work_pkgs.doc_acts_xfer');

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