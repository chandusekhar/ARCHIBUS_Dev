/**
 * @author Song
 */

var abWasteRptShipmentsController = View.createController('abWasteRptShipmentsController', {
	/**
	 * as a parameter for openDialog use
	 */
	wasteId: null,
	/**
	 * Hide Show console button after view loaded
	 */
	afterInitialDataFetch: function(){
		//this.abWasteRptShipmentsGrid.refresh('1=2');
		this.abWasteRptShipmentsManifestsExport.show(false);
		////  manully set the export command show='false' to avoid the hidden export panel be showed after exporting, it is required, so do not delete below code
		//this.abWasteRptShipmentsGrid.actions.get('pdfManifests').command.commands[1].show = false;
		//this.abWasteRptShipmentsGrid.actions.get('pdfWasteDetails').command.commands[1].show = false;
	},
	/**
	 * Clear console 
	 */
	abWasteRptShipmentsConsole_onClear: function(){
		this.abWasteRptShipmentsConsole.clear();
	},
	
	/**
	 * Show manifest details when we click manifest details button on abWasteRptShipmentsGrid grid row
	 */
	abWasteRptShipmentsGrid_manifestDetail_onClick: function(row){

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");
		var manifest_number = record.getValue("waste_out.manifest_number");
		if (valueExistsNotEmpty(manifest_number)) {
			restriction.addClause('waste_manifests.manifest_number', manifest_number, '=');
		}
		this.wasteId = waste_id;
	//	panel.addParameter('wasteId', wasteId);
		View.openDialog("ab-waste-rpt-manifest-details.axvw",restriction, false,null,null,1300,700);
	},
	
	/**
	 * Show waste out details when we click waste details button on abWasteRptShipmentsGrid grid row
	 */
	abWasteRptShipmentsGrid_wasteDetail_onClick: function(row){
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var waste_id = record.getValue("waste_out.waste_id");
		
		if (valueExistsNotEmpty(waste_id)) {
			restriction.addClause('waste_out.waste_id', waste_id, '=');
		}
		var panel=this.abWasteRptShipmentsViewWasteShipmentForm;
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
	abWasteRptShipmentsViewWasteShipmentForm_onExportPaginate: function(){
		var restriction = new Ab.view.Restriction();
		var waste_id = this.abWasteRptShipmentsViewWasteShipmentForm.getFieldValue("waste_out.waste_id");
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
/**
 * called when click button 'PDF Manifests'
 */
function exportManifests(panel1,panel2,messageName){
	var gridForm=View.panels.get(panel1);
	var command = gridForm.actions.get(0).command.commands[0];
	var reportGrid=View.panels.get(panel2);
	var records = gridForm.getSelectedRecords();
	if(records.length<1){
		//set return value for command chain,
		command.result = false;
		View.alert(getMessage(messageName));
		return;
	}else{
		var restriction = "";
		var restriction = new Ab.view.Restriction();
		var wasteIdArr=[];
		//kb 3031464 issue4
		var haveManifest = true;
		for(i=0;i<records.length;i++){
			wasteIdArr[i]=records[i].getValue('waste_out.waste_id');
			var manifest_number = records[i].getValue('waste_out.manifest_number');
			if (manifest_number!=null&&manifest_number!='') {
				haveManifest = false;
			}
		}
		if (haveManifest) {
			command.result = false;
			View.alert(getMessage('noManifestRecord'));
		}else {
			if(records.length!=0){
				restriction = " EXISTS (select 1 from waste_out where waste_manifests.manifest_number = waste_out.manifest_number" +
				" and waste_id in(" + wasteIdArr+ "))";
			}else{
				restriction = "1=2";
			}
			reportGrid.restriction = restriction;
//			reportGrid.refresh(restriction);
			command.result = true;
		}
	}
}
/**
 * Configure the selectValue dialog in JavaScript
 */
function selectValueTransporter(panelId) {
	View.selectValue({
    	formId: panelId,
    	title: 'Select Transporter',
    	fieldNames: ['waste_out.transporter_id','vn.company'],
    	selectTableName: 'vn',
    	selectFieldNames: ['vn.vn_id','vn.company'],
    	visibleFields: [
			{fieldName: 'vn.vn_id', title: getMessage('transporterCode')},
            {fieldName: 'vn.phone', title: getMessage('phoneNumber')},
			{fieldName: 'vn.company', title: getMessage('companyName') }
		],
    	restriction: "vn.vendor_type = 'WstTr'",
    	showIndex: false,
    	selectValueType: 'grid'
	});
}
