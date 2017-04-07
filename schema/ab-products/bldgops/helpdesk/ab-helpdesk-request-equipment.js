

var helpdeskRequestShowEquipmentController = View.createController("helpdeskRequestShowEquipmentController",{
	
	afterInitialDataFetch: function(){
		var record = this.equipmentPanel.getRecord();
	 	var values = record.values;
	 	
	 	if(valueExists(values["eq.policy_id"]) && values["eq.policy_id"] != ''){
	 		this.policyPanel.setRecord(record);
	 		this.policyPanel.show(true);
		}
		
		if(valueExists(values["eq.warranty_id"]) && values["eq.warranty_id"] != ''){
	 		this.warrantyPanel.setRecord(record);
	 		this.warrantyPanel.show(true);
		}

		if(valueExists(values["eq.ta_lease_id"]) && values["eq.ta_lease_id"] != ''){
			this.taLeasePanel.setRecord(record);
			this.taLeasePanel.show(true);
			showTaLeasePanel = true;
		}

		if(valueExists(values["eq.servcont_id"]) && values["eq.servcont_id"] != ''){
			this.servcontPanel.setRecord(record);
			this.servcontPanel.show(true);
		}
	}
});