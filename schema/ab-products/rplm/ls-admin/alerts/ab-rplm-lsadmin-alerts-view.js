
var formWizardController = View.createController('portfolioAdministrationAlerts', {

    afterViewLoad: function() {
		this.inherit();
        this.lsAlertsGrid.afterCreateCellContent = function(row, column, cellElement) {
        	var color = (row['ls_alert_definition.color.raw'] != undefined) ? row['ls_alert_definition.color.raw'] : row['ls_alert_definition.color'];
			if (column.id == 'ls.date_end')	{
				if (color == 'Red')	{
					cellElement.style.background = '#FF3333';
				}
				else if (color == 'Yellow') {
					cellElement.style.background = '#FFCC00';
				}
				else if (color == 'Green') {
					cellElement.style.background = '#00CC66';
				}
			}
        }
		this.lsAlertsGrid.columns[0].id='selectAlert'
        
    },
    afterInitialDataFetch: function() {
		this.lsAlertsGrid.addParameter('lease_due_date' , getMessage('lease_due_date'));
		this.lsAlertsGrid.addParameter('options_due_date' , getMessage('options_due_date'));
		this.lsAlertsGrid.refresh();
		if (this.lsAlertsGrid.gridRows.length > 0) {
			this.lsAlertsGrid.removeSorting();
		}
	},
    lsAlertsGrid_onSelectAlert: function(row, action) {
    	this.popupDetailsWindow(row, action);
    },
    lsAlertsGrid_onSelectLsId: function(row, action) {
    	this.popupDetailsWindow(row, action);
    },
    lsAlertsGrid_onSelectOpId: function(row, action) {
    	this.popupDetailsWindow(row, action);
    },
    lsAlertsGrid_onSelectDateStart: function(row, action) {
    	this.popupDetailsWindow(row, action);
    },
	
	popupDetailsWindow: function(row, action) {
		this.selectedRow = row;
		var ls_id = row.getRecord().getValue('ls.ls_id');
		var op_id = row.getRecord().getValue('ls.op_id');
		var restriction = new Ab.view.Restriction();
    	if (op_id == '') {
    		restriction.addClause('ls.ls_id', ls_id);
        	this.lsDetailsReport.refresh(restriction);
        	this.lsDetailsReport.showInWindow({
        		width: 500,
        		height: 500
        	});
    	}
    	else {
    		restriction.addClause('op.ls_id', ls_id);
    		restriction.addClause('op.op_id', op_id);
        	this.opDetailsReport.refresh(restriction);
        	this.opDetailsReport.showInWindow({
        		width: 500,
        		height: 500
        	});
    	}
	}
});