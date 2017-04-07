var abEnergyArchiveBillLineList = View.createController('abEnergyArchiveBillLineListController',{
	
	afterInitialDataFetch:function(){		
		var ds = View.dataSources.get("ds_billArchive");
		var res = this.view.restriction;
		if(valueExistsNotEmpty(res)){
			var rec = ds.getRecord(res);
			var prorated = rec.getValue("bill_archive.prorated_aggregated");
			var refBillId = rec.getValue("bill_archive.reference_bill_id");
			var billId = rec.getValue("bill_archive.bill_id");
			var vnId = rec.getValue("bill_archive.vn_id");
			var newRes = new Ab.view.Restriction();
			var panel = View.panels.get("panelBill");
			var panelLines = View.panels.get("bill_line_archive_list");
			if((prorated == "PRORATED-TIME") || (prorated == "PRORATED-LOCATION") ){
				newRes.addClause('bill_archive.bill_id',refBillId,'=');
				newRes.addClause('bill_archive.vn_id',vnId,'=');
				panel.refresh(newRes);
				panel.setInstructions(getMessage("prorated"));
				panel.show(true);
				panelLines.show(false);
			}else if(prorated == "AGGREGATED"){
				newRes.addClause('bill_archive.reference_bill_id',billId,'=');
				newRes.addClause('bill_archive.vn_id',vnId,'=');
				panel.refresh(newRes);
				panel.setInstructions(getMessage("aggregated"));
				panel.show(true);
				panelLines.show(false);
			}else{
				panel.show(false);
				panelLines.show(true);
			}
		}
	},
	
	panelBill_onClickItem: function(row){
		var panelLines = View.panels.get("bill_line_archive_list");
		var restriction = new Ab.view.Restriction();
	    restriction.addClause('bill_line_archive.bill_id',row.getFieldValue('bill_archive.bill_id'),'=');
	    restriction.addClause('bill_line_archive.vn_id',row.getFieldValue('bill_archive.vn_id'),'=');
	    panelLines.refresh(restriction);
	    panelLines.show(true);
	}
	
});