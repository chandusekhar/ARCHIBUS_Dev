
var formWizardController = View.createController('portfolioAdministrationAlerts', {

	panelTreeCtry: null,
	controllerTreeLeaseAdmin: null,
	lsId: null,
	
	afterInitialDataFetch: function() {
    	this.lsAlertsGrid.removeSorting();
		var restriction = new Ab.view.Restriction();

        for (var name in window.location.parameters) {
            var value = window.location.parameters[name];
            restriction.addClause(name, value);            
            if (name == 'ls.ls_id') {
            	this.lsId = value;
            }
        }
		this.lsAlertsGrid.refresh(restriction);
	},
	
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
        
        //var queryParameter = "AND ls.ls_id = '"+this.lsId+"'";
		//var queryParameterInt = "AND x.ls_id = '"+this.lsId+"'";

		//this.controllerTreeLeaseAdmin = this.panel_row2col1.contentView.controllers.get('treeLeaseAdmin');
		//this.controllerTreeLeaseAdmin.searchPattern = this.lsId;
		
		//this.panelTreeCtry = this.panel_row2col1.contentView.panels.get('treeCtry');
		//this.panelTreeCtry.addParameter('subquery', queryParameter);
		//this.panelTreeCtry.addParameter('subquery', queryParameter);
		//this.panelTreeCtry.addParameter('subquery', queryParameter);
		//this.panelTreeCtry.addParameter('subquery', queryParameter);
		//this.panelTreeCtry.addParameter('subquery_int', queryParameterInt);
		//this.panelTreeCtry.addParameter('subquery', queryParameter);
		//this.panelTreeCtry.refresh();
    },
    
    lsAlertsGrid_onSelectFind: function(row, action) {
    	var ls_id = row.getRecord().getValue('ls.ls_id');
		var queryParameter = "AND ls.ls_id = '"+ls_id+"'";
		var queryParameterInt = "AND x.ls_id = '"+ls_id+"'";

		this.controllerTreeLeaseAdmin = this.panel_row2col1.contentView.controllers.get('treeLeaseAdmin');
		this.controllerTreeLeaseAdmin.searchPattern = ls_id;
		
		this.panelTreeCtry = this.panel_row2col1.contentView.panels.get('treeCtry');
		this.panelTreeCtry.addParameter('subquery', queryParameter);
		this.panelTreeCtry.addParameter('subquery', queryParameter);
		this.panelTreeCtry.addParameter('subquery', queryParameter);
		this.panelTreeCtry.addParameter('subquery', queryParameter);
		this.panelTreeCtry.addParameter('subquery_int', queryParameterInt);
		this.panelTreeCtry.addParameter('subquery', queryParameter);
		this.panelTreeCtry.refresh();
    },
    
    lsAlertsGrid_onSelectAlertType: function(row, action) {
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