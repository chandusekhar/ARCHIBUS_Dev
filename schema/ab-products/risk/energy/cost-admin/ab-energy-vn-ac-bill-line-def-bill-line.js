var ctrlAbEnergyBillLine = View.createController('ctrlAbEnergyBillLine',{
	bill_line_AbEnergyDefBills_grid_afterRefresh: function(){
		this.bill_line_AbEnergyDefBills_grid.enableButton("addNew",true);
		if(View.restriction){
			var clause = View.restriction.findClause('bill.vn_ac_id');
			if(valueExistsNotEmpty(clause)){
				var vnAcId = clause.value;
				var dataSource = this.vendorAccount_ds;
				var res = new Ab.view.Restriction();
				res.addClause("vn_ac.vn_ac_id",vnAcId,"=");
				var record = dataSource.getRecord(res);
				if(record.getValue('vn_ac.proration_action') != 'NONE'){
					this.bill_line_AbEnergyDefBills_grid.enableButton("addNew",false);
				}
			}
			else{
				var clause = View.restriction.findClause('bill.bill_id');
				if(valueExistsNotEmpty(clause)){
					var billId = clause.value;
					var dataSource = this.bill_line_AbEnergyDefBills_ds;
					var res =  new Ab.view.Restriction();
					res.addClause("bill_line.bill_id",billId,"=");
					var record = dataSource.getRecord(res);
					if(valueExistsNotEmpty(record.getValue('bill.vn_ac_id'))){
						var vnAcId = record.getValue('bill.vn_ac_id');
						var dataSource = this.vendorAccount_ds;
						var res = new Ab.view.Restriction();
						res.addClause("vn_ac.vn_ac_id",vnAcId,"=");
						var record = dataSource.getRecord(res);
						if(record.getValue('vn_ac.proration_action') != 'NONE'){
							this.bill_line_AbEnergyDefBills_grid.enableButton("addNew",false);
						}
						
					}
				}
			}
		}
	}
});
