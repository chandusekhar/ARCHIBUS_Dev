/**
 * @author Lei
 */
var abWasteRptStorageSummaryController = View.createController('abWasteRptStorageSummaryController', {
	
	afterInitialDataFetch: function(){
		this.abWasteRptStorageSummaryWasteDetailGridExport.show(false);
		this.abWasteRptStorageSummaryWasteDetailGrid.actions.get('exportPDF').command.commands[1].show = false;
	},
	
	/**
	 * Show waste out details when we click waste details button on abWasteRptStorageSummaryWasteDetailGrid grid row
	 */
	abWasteRptStorageSummaryWasteDetailGrid_wasteDetail_onClick: function(row){

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");

		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}
		var panel=this.abWasteShipmentForm;
		panel.refresh(restriction);
		panel.show(true);
		panel.showInWindow({
			width: 1300,
			height: 700,
			closeButton: false
		});
	},

	/**
	 * Export current waste detail to paginate report 
	 */
	abWasteShipmentForm_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();
		var waste_id = this.abWasteShipmentForm.getFieldValue("waste_out.waste_id");
		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}

		var parameters = {
				 'printRestriction':false, 
				 'printableRestriction':[]
		};
		
		//generate paginated report
		View.openPaginatedReportDialog('ab-waste-rpt-storage-summary-paginate.axvw',{
			'abWasteStorageFormDS': restriction 
		}, parameters);
	}
})