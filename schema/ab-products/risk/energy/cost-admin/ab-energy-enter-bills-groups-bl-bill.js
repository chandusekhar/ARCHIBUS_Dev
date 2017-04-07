var ctrlAbEnergyBillsGroups = View.createController('ctrlAbEnergyBillsGroups',{
	
	
	bill_AbEnergyDefBills_onGenerateBills : function(){
		var form = this.bill_AbEnergyDefBills;
		var ds = View.dataSources.get("vendorAccount_ds");
		var res = new Ab.view.Restriction();
		res.addClause("vn_ac.vn_ac_id",form.getFieldValue("bill.vn_ac_id"));
		var record = ds.getRecord(res);
		var actionType = record.getValue("vn_ac.proration_action");
		var formRes = new Ab.view.Restriction();
		if(actionType == "MANUAL"){
			formRes.addClause("bill_proration_group.vn_id",form.getFieldValue("bill.vn_id"));
			formRes.addClause("bill_proration_group.vn_ac_id",form.getFieldValue("bill.vn_ac_id"));
			formRes.addClause("bill_proration_group.bill_id",form.getFieldValue("bill.bill_id"));
			View.openDialog('ab-energy-enter-bills-groups-bl-bill-generate.axvw',formRes,{
			    width: 800,
			    height: 700,
			    closeButton: true
			});
		}else if (actionType == "SUBMETERS"){
			//implement for submeters
		}else if(actionType == "BL_OCCUPANCY"){
			formRes.addClause("bill_proration_group.vn_id",form.getFieldValue("bill.vn_id"));
			formRes.addClause("bill_proration_group.vn_ac_id",form.getFieldValue("bill.vn_ac_id"));
			formRes.addClause("bill_proration_group.bill_id",form.getFieldValue("bill.bill_id"));
			formRes.addClause("bill_proration_group.action","2");
			View.openDialog('ab-energy-enter-bills-groups-bl-bill-generate-occupancy-area.axvw',formRes,{
			    width: 800,
			    height: 700,
			    closeButton: true
			});
		}else if(actionType == "BL_AREA"){
			formRes.addClause("bill_proration_group.vn_id",form.getFieldValue("bill.vn_id"));
			formRes.addClause("bill_proration_group.vn_ac_id",form.getFieldValue("bill.vn_ac_id"));
			formRes.addClause("bill_proration_group.bill_id",form.getFieldValue("bill.bill_id"));
			formRes.addClause("bill_proration_group.action","3");
			View.openDialog('ab-energy-enter-bills-groups-bl-bill-generate-occupancy-area.axvw',formRes,{
			    width: 800,
			    height: 700,
			    closeButton: true
			});
		}else if(actionType == "PERCENTAGE"){
			formRes.addClause("bill_proration_group.vn_id",form.getFieldValue("bill.vn_id"));
			formRes.addClause("bill_proration_group.vn_ac_id",form.getFieldValue("bill.vn_ac_id"));
			formRes.addClause("bill_proration_group.bill_id",form.getFieldValue("bill.bill_id"));
			View.openDialog('ab-energy-enter-bills-groups-bl-bill-generate-percentage.axvw',formRes,{
			    width: 800,
			    height: 700,
			    closeButton: true
			});
		}
	},
	
	bill_AbEnergyDefBills_onViewProratedBills: function(){
		var billId = this.bill_AbEnergyDefBills.getFieldValue("bill.bill_id");
		var res = new Ab.view.Restriction();
		res.addClause("bill.reference_bill_id",billId,"=");
		res.addClause("bill.prorated_aggregated","PRORATED-LOCATION","=");
		this.bill_grid.refresh(res);
		this.bill_grid.showInWindow({
		    width: 800,
		    height: 700,
		    closeButton: false
		});
	},
	
	bill_grid_onDeleteAll: function(){
		var gridRows = this.bill_grid.gridRows;
		var dataSource = this.bill_ds;
		for (var i=0; i<gridRows.length; i++){
			var record = gridRows.get(i).getRecord();
			dataSource.deleteRecord(record);
		}
		this.bill_grid.closeWindow();
		this.bill_AbEnergyDefBills.show(false);
	},
	
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
			   fieldNames: ['vn_ac.vn_ac_id','vn_ac.bill_type_id', 'vn_ac.vn_id', 'vn_ac.site_id','vn_ac.bl_id', 'vn_ac.proration_action']
			});
		var res = new Ab.view.Restriction();
		res.addClause('vn_ac.vn_ac_id',this.bill_AbEnergyDefBills.getFieldValue("bill.vn_ac_id"),'=');
		res.addClause('vn_ac.bill_type_id',this.bill_AbEnergyDefBills.getFieldValue("bill.bill_type_id"),'=');
		res.addClause('vn_ac.vn_id',this.bill_AbEnergyDefBills.getFieldValue("bill.vn_id"),'=');
		res.addClause('vn_ac.bl_id',this.bill_AbEnergyDefBills.getFieldValue("bill.bl_id"),'=');
		res.addClause('vn_ac.site_id',this.bill_AbEnergyDefBills.getFieldValue("bill.site_id"),'=');
		var record = dsVendorAcc.getRecord(res);
		if(valueExistsNotEmpty(record)){
			if(!valueExistsNotEmpty(record.getValue('vn_ac.vn_ac_id'))){
				View.showMessage(getMessage("consistency"));
				return false;
			}else{
				if(record.getValue('vn_ac.proration_action') == 'NONE'){
					View.showMessage(getMessage("multBld"));
					return false;
				}
			}
		}else{
			View.showMessage(getMessage("consistency"));
			return false;
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
				if(record.getValue('vn_ac.proration_action') == 'NONE'){
					this.bill_AbEnergyDefBills_grid.enableButton("addNew",false);
				}
			}
		}
	}
});