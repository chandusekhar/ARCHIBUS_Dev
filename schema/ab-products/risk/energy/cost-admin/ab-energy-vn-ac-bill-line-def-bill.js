var ctrlAbEnergyBillsGroups = View.createController('ctrlAbEnergyBillsGroups',{
		
	bill_AbEnergyDefBills_beforeSave: function(){
		var dateStart = this.bill_AbEnergyDefBills.getFieldValue("bill.date_service_start");
		var dateEnd = this.bill_AbEnergyDefBills.getFieldValue("bill.date_service_end");
		if(dateEnd<dateStart){
			View.showMessage(getMessage("date"));
			return false;
		}
		
		var dsVendorAcc = new Ab.data.createDataSourceForFields({
			   id: 'vn_ac_ds',
			   tableNames: ['vn_ac'],
			   fieldNames: ['vn_ac.vn_ac_id','vn_ac.bill_type_id', 'vn_ac.vn_id', 'vn_ac.site_id','vn_ac.bl_id','vn_ac.proration_action']
			});
		var res = new Ab.view.Restriction();
		res.addClause('vn_ac.vn_ac_id',this.bill_AbEnergyDefBills.getFieldValue("bill.vn_ac_id"),'=');
		res.addClause('vn_ac.bill_type_id',this.bill_AbEnergyDefBills.getFieldValue("bill.bill_type_id"),'=');
		res.addClause('vn_ac.vn_id',this.bill_AbEnergyDefBills.getFieldValue("bill.vn_id"),'=');
		res.addClause('vn_ac.bl_id',this.bill_AbEnergyDefBills.getFieldValue("bill.bl_id"),'=');
		res.addClause('vn_ac.site_id',this.bill_AbEnergyDefBills.getFieldValue("bill.site_id"),'=');
		var record = dsVendorAcc.getRecord(res);
		if(this.bill_AbEnergyDefBills.getFieldValue("bill.prorated_aggregated") != 'PRORATED-LOCATION'){
			if(valueExistsNotEmpty(record)){
				if(!valueExistsNotEmpty(record.getValue('vn_ac.vn_ac_id'))){
					View.showMessage(getMessage("consistency"));
					return false;
				}else{
					if(record.getValue('vn_ac.proration_action') != 'NONE'){
						View.showMessage(getMessage("multBld"));
						return false;
					}
				}
			}else{
				View.showMessage(getMessage("consistency"));
				return false;
			}
		}
	},
	bill_AbEnergyDefBills_grid_afterRefresh: function(){
		this.bill_AbEnergyDefBills_grid.enableButton("addNew",true);
		if(View.restriction){
			var clause = View.restriction.findClause('bill.vn_ac_id');
			if(valueExistsNotEmpty(clause)){
				var vnAcId = clause.value;
				var dataSource = this.vendorAccount_ds;
				var res = new Ab.view.Restriction();
				res.addClause("vn_ac.vn_ac_id",vnAcId,"=");
				var record = dataSource.getRecord(res);
				if(record.getValue('vn_ac.proration_action') != 'NONE'){
					this.bill_AbEnergyDefBills_grid.enableButton("addNew",false);
				}
			}
		}
	}
	
//	bill_AbEnergyDefBills_onSave: function(){
//		var form = this.bill_AbEnergyDefBills;
//		var objDataSource = View.dataSources.get("bill_AbEnergyDefBills_ds");
//		var res = "EXISTS(SELECT 1 FROM bill b WHERE b.prorated_aggregated IN ('PRORATED-TIME','AGGREGATED') AND b.reference_bill_id = '"+form.getFieldValue('bill.bill_id') +"' )";
//		var record = objDataSource.getRecords(res);
//		if(valueExistsNotEmpty(record)){
//			View.confirm(getMessage("prorateAggregate"), function(button) {
//			    if (button == 'yes') {
//			    	form.save();
//	            }
//			});
//		}
//	}
	
});