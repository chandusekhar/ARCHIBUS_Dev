var projImportWorkpkgsMsProjectController = View.createController('projImportWorkpkgsMsProject', {	
	project_id : '',
	work_pkg_id : '',
	
	projImportWorkpkgsMsProjectGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
	},
	
	projImportWorkpkgsMsProjectGrid_onSelectWorkPkgId : function(row) {
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projImportWorkpkgsMsProjectConsole.refresh(restriction);
		this.projImportWorkpkgsMsProjectConsole.appendTitle(this.work_pkg_id);
		
		// clear any previously-created action transactions for this work package
		this.refreshGridWithProjectWorkpkgRestriction();
		this.projImportWorkpkgsMsProjectActionsGrid_onClearActionTransactions();	
	},
	
	projImportWorkpkgsMsProjectConsole_onImportActions : function() {
		if(this.checkFileName())
		{
			var parameters = {
					'project_id' : this.project_id, 
					'work_pkg_id' : this.work_pkg_id
			};
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
	
	projImportWorkpkgsMsProjectActionsGrid_onClearActionTransactions : function() {	
		if (this.projImportWorkpkgsMsProjectActionsGrid.rows.length > 0)
		{
			var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
			var parameters = {'project_work_pkg_id' : project_work_pkg_id};
			
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
	
	projImportWorkpkgsMsProjectActionsGrid_onPostActionTransactions : function() {
		if (this.projImportWorkpkgsMsProjectActionsGrid.rows.length > 0)
		{
			var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
			var parameters = {'project_work_pkg_id' : project_work_pkg_id};
			try{
				var result = Workflow.call('AbProjectManagement-MsProjectService-importPostTransactions', parameters);
			
				if (result.code == 'executed') {
					this.projImportWorkpkgsMsProjectActionsGrid_onClearActionTransactions();
				} else {
					View.showMessage(result.code + " :: " + result.message);
				}
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	refreshGridWithProjectWorkpkgRestriction : function() {
		var project_work_pkg_id = this.project_id + "|" + this.work_pkg_id;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log_trans.project_work_pkg_id', project_work_pkg_id);
		this.projImportWorkpkgsMsProjectActionsGrid.refresh(restriction);
	},
	
	checkFileName : function() {
		var fileName = this.projImportWorkpkgsMsProjectConsole.getFieldValue('work_pkgs.doc_acts_xfer');

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