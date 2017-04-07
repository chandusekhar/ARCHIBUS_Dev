/**
 * @author Lei
 */
var abWasteRptRecentDispositionsController = View.createController('abWasteRptRecentDispositionsController', {
	
	afterInitialDataFetch: function(){
		this.abWasteRptRecentWasteGridExport.show(false);
		//  manully set the export command show='false' to avoid the hidden export panel be showed after exporting, it is required, so do not delete below code
		this.abWasteRptRecentWasteGrid.actions.get('exportPDF').command.commands[1].show = false;
		this.abWasteRptRecentWasteGrid.addParameter('recShipDisDays', View.activityParameters['AbRiskWasteMgmt-rec_ship_dis_days'] );
		this.abWasteRptRecentWasteGridExport.addParameter('recShipDisDays', View.activityParameters['AbRiskWasteMgmt-rec_ship_dis_days'] );
	},
	
	/**
	 * Show waste out details when we click waste details button on abWasteRptRecentWasteGrid grid row
	 */
	abWasteRptRecentWasteGrid_wasteDetail_onClick: function(row){

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
	
	abWasteRptRecentWasteGrid_afterRefresh:function(){
		//Set instruction for grid
		setInstruction(this.abWasteRptRecentWasteGrid);
		
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
		View.openPaginatedReportDialog('ab-waste-rpt-discharge-detail-paginate.axvw',{
			'abWasteDischargeFormDS': restriction 
		}, parameters);
	}

})


/**
 * Set Instruction for grid
 * @param grid,grid object
 */
function setInstruction(grid){
	 var instructions = "<span style='font-weight:bold'>"+getMessage("instructionMess1")+" "+View.activityParameters['AbRiskWasteMgmt-rec_ship_dis_days']+" "+getMessage("instructionMess2")+"</span>";
 		 grid.setInstructions(instructions);  
}
