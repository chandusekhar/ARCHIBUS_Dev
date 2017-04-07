    /**
     * @Author Huang MuLiang
	 */
var abWasteRptDischargesController  = View.createController('abWasteRptDischargesController',
  {
	afterInitialDataFetch: function(){
		this.abWasteRptDischargesGridExportPanel.show(false);
		this.abWasteRptDischargesGridPanel.actions.get('exportPDF').command.commands[1].show = false;
	},
	/**
	 * Show waste out details when  user clicked waste details button on abWasteTrackShipmentsGrid grid row
	 */
	abWasteRptDischargesGridPanel_details_onClick: function(row){

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");

		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}
		var panel=this.abWasteRptDischargeFormPanel;
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
	abWasteRptDischargeFormPanel_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();
		var waste_id = this.abWasteRptDischargeFormPanel.getFieldValue("waste_out.waste_id");
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

	});
/*
 * Set export panel restriction
 */
function setExportRestriction(){
	var gridForm=View.panels.get("abWasteRptDischargesGridPanel");
	var reportForm=View.panels.get("abWasteRptDischargesGridExportPanel");
	var records = gridForm.getPrimaryKeysForSelectedRows();
	if(records.length < 1 ){
		View.showMessage(getMessage('noRecordSelected'));
		return false;
	}
	var wasteIdArr=[];
	var restriction = new Ab.view.Restriction();
	    for (var i = 0; i < records.length; i++) {
	    	wasteIdArr[i] = records[i]['waste_out.waste_id'];
	        }
	restriction.addClause('waste_out.waste_id', wasteIdArr, 'in');
	reportForm.restriction = restriction;
	return true;
}
