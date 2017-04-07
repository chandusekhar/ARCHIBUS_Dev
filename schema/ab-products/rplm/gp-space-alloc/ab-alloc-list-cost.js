var allocListCostController = View.createController('allocListCost', {

	allocCostConsole_onFilter : function() {
		this.restoreSelection();
	},
    
	allocCostConsole_onClear : function() {
		var console = View.panels.get('allocCostConsole');
		console.clear();
	},

    costGrid_onAddNew: function() {
		var bl_id = this.tabs.wizard.getBl();

		this.editCostForm.refresh(null, true);

		if ((bl_id != '') && (bl_id != null)) { this.editCostForm.setFieldValue('cost_tran_recur.bl_id',bl_id);}

        this.editCostForm.showInWindow({
			newRecord: true,
            closeButton: false
        });
    },

    editCostForm_onSave: function(){
		this.restoreSelection();
    },

	restoreSelection: function(){
		var restriction = this.getConsoleRestriction();

		this.costGrid.refresh(restriction);

		this.updatePanelTitle();
	},

	updatePanelTitle: function(){
		var bl_id = this.tabs.wizard.getBl();
		var panel = View.panels.get('allocCostConsole');
		var date_report = panel.getFieldValue('cost_tran_recur.date_start');
		var title = getMessage('buildingTitle') + bl_id;
		if (date_report != "") { title = title + " " + getMessage('reviewDateTitle') + " " + date_report;}
		panel.setTitle(title);
	},

	getConsoleRestriction: function() {
		var restriction = this.getBlRestriction();
		var console = View.panels.get('allocCostConsole');
		var date_report = console.getFieldValue('cost_tran_recur.date_start');

		var arrayDate = [];
		arrayDate = date_report.split("-");
		var year = arrayDate[0];

		var dateStartYear = year + '-01-01';
		var dateEndYear = year + '-12-31';

		// show recurring expenses from the start to the end of the year
		if (date_report != "") {
   			restriction = restriction + " AND ((cost_tran_recur.date_end  >= #Date%" + dateStartYear + "% OR cost_tran_recur.date_end IS NULL) AND (cost_tran_recur.date_start <= #Date%" + dateEndYear + "%))";
        }
		return restriction;	
	},

	getBlRestriction: function(){
		var bl_id = this.tabs.wizard.getBl();

		var restriction = 'cost_tran_recur.bl_id = \'';
		restriction += bl_id;
		restriction += '\'';

		return restriction;
	},

	costGrid_onDeleteSelected: function() {
		if (confirm(getMessage("confirmDelete"))) {
			var grid = this.costGrid;
			var records = grid.getPrimaryKeysForSelectedRows();
			
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', records,'cost_tran_recur'); 
				this.costGrid.refresh();
			}
			catch (e) {
				Workflow.handleError(result);
			}
		}	 
	},

	saveData: function(){
		var console = View.panels.get('allocCostConsole');
		var date_report = console.getFieldValue('cost_tran_recur.date_start');
		this.tabs.wizard.setDateReport(date_report);
	}
});

function setCustomPeriod(){
	if(allocListCostController.editCostForm.getFieldValue('cost_tran_recur.period')=='CUSTOM'){
		allocListCostController.editCostForm.enableField('cost_tran_recur.period_custom' ,true);
	}else {
		allocListCostController.editCostForm.enableField('cost_tran_recur.period_custom' ,false);
	}
}