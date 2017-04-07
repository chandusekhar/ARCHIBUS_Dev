var energyExceptionReport = View.createController('energyExceptionReport', {
	billData: [],
	
	panel_measureVerifyConsole_onShow: function() {
		var billType = this.panel_measureVerifyConsole.getFieldValue('bill_archive.bill_type_id');
		if (billType == '')	{ 
			View.showMessage(getMessage('selectRequiredBillType')); 
			return; 
			}
		this.panel_missingPeriods.addParameter("billTypeId",billType);
		this.panel_prorate.addParameter("billTypeId",billType);
		this.panel_agregate.addParameter("billTypeId",billType);
		var blId = this.panel_measureVerifyConsole.getFieldValue('bill_archive.bl_id');
		if (blId == '')	{ 
			View.showMessage(getMessage('selectBuilding')); 
			return; 
			}
		this.panel_missingPeriods.addParameter("blId",blId);
		this.panel_prorate.addParameter("blId",blId);
		this.panel_agregate.addParameter("blId",blId);
		var vendor = this.panel_measureVerifyConsole.getFieldValue('bill_archive.vn_id');
		var vendorAccount = this.panel_measureVerifyConsole.getFieldValue('bill_archive.vn_ac_id');
		
		var consoleRestriction ='';
		var consoleRestrictionProrate ='';
		if(vendor != ''){
			consoleRestriction = consoleRestriction + " AND bill_archive.vn_id = '" + vendor + "'";
			consoleRestrictionProrate = consoleRestrictionProrate + " AND bill.vn_id = '" + vendor + "'";
			this.panel_missingPeriods.addParameter("vnId","vn_id = '" +vendor+ "'");
		}
		
		if(vendorAccount != ''){
			consoleRestriction = consoleRestriction + " AND bill_archive.vn_ac_id = '" + vendorAccount +"'";
			consoleRestrictionProrate = consoleRestrictionProrate + " AND bill.vn_ac_id = '" + vendorAccount + "'";
			this.panel_missingPeriods.addParameter("vnAcId","vn_ac_id = '" +vendorAccount+ "'");
		}
		
		this.panel_missingPeriods.addParameter("consoleRestriction",consoleRestriction);
		this.panel_missingPeriods.addParameter("consoleBillRestriction",consoleRestrictionProrate);
		this.panel_missingPeriods.refresh();
		this.panel_missingPeriods.show(true); 
		this.panel_prorate.addParameter("consoleRestriction",consoleRestrictionProrate);
		this.panel_prorate.refresh();
		this.panel_prorate.show(true); 
		this.panel_agregate.addParameter("consoleRestriction",consoleRestrictionProrate);
		this.panel_agregate.refresh();
		this.panel_agregate.show(true); 
	},
	
	panel_missingPeriods_onGenerate: function(){
		var panel = this.panel_missingPeriods;
		var bills = panel.getSelectedRows();
		if(bills.length<1){
			View.showMessage(getMessage('noBillSelected'));
			return;
		}
		for (var i=0; i<bills.length; i++){		
			var bill = bills[i];
			var rec = new Ab.data.Record();
			rec.isNew = true;
			rec.setValue("bill.time_period",bill["bill_archive.time_period"]);
			rec.setValue("bill.vn_id",bill["bill_archive.vn_id"]);
			rec.setValue("bill.vn_ac_id",bill["bill_archive.vn_ac_id"]);
			rec.setValue("bill.bill_type_id",bill["bill_archive.bill_type_id"]);
			rec.setValue("bill.bl_id",bill["bill_archive.bl_id"]);
			rec.setValue("bill.bill_id",bill["bill_archive.bill_id"]);
			rec.setValue("bill.site_id",bill["bill_archive.site_id"]);
			rec.setValue("bill.date_due",bill["bill_archive.date_due.raw"]);
			rec.setValue("bill.date_service_start",bill["bill_archive.date_service_start.raw"]);
			rec.setValue("bill.date_service_end",bill["bill_archive.date_service_end.raw"]);
			rec.setValue("bill.amount_expense","0");
			rec.setValue("bill.amount_income","0");
			rec.setValue("bill.qty_energy","0");
			rec.setValue("bill.qty_power","0");
			rec.setValue("bill.qty_kwh","0");
			rec.setValue("bill.qty_volume","0");
			
			try{ 
    		this.ds_billArchive.saveRecord(rec);
			}catch(e){
				View.showMessage(getMessage('billExist'));
			}
		}	
		panel.refresh();
	},
	
	panel_agregate_onAgregateBills: function(){
		var panel = this.panel_agregate;
		var bills = panel.getSelectedRows();
		var billsOld = panel.getSelectedRecords();
		var billAgregate = [];
		billAgregate["amount_expense"] = 0;
		billAgregate["amount_income"] = 0;
		billAgregate["qty_energy"] = 0;
		billAgregate["qty_power"] = 0;
		billAgregate["qty_kwh"] = 0;
		billAgregate["qty_volume"] = 0;
		if(bills.length < 2){
			View.showMessage(getMessage('noBillSelectedAggregate')); 
			return;
		}
		var vnAcId = bills[0]["bill.vn_ac_id"];
		var time_per = bills[0]["bill.time_period"];
		for (var i=0; i<bills.length; i++){		
			var bill = bills[i];
			billAgregate["amount_expense"] = billAgregate["amount_expense"] + parseFloat((bill["bill.amount_expense.raw"] == undefined) ? bill["bill.amount_expense"].substring(1) : bill["bill.amount_expense.raw"]);
			billAgregate["amount_income"] = billAgregate["amount_income"] + parseFloat((bill["bill.amount_income.raw"]== undefined) ? bill["bill.amount_income"].substring(1) : bill["bill.amount_income.raw"]);
			billAgregate["qty_energy"] = billAgregate["qty_energy"]+ parseFloat((bill["bill.qty_energy.raw"]== undefined) ? bill["bill.qty_energy"] : bill["bill.qty_energy.raw"]);
			billAgregate["qty_power"] = billAgregate["qty_power"] + parseFloat((bill["bill.qty_power.raw"]== undefined) ? bill["bill.qty_power"] : bill["bill.qty_power.raw"]);
			billAgregate["qty_kwh"] = billAgregate["qty_kwh"] + parseFloat((bill["bill.qty_kwh.raw"]== undefined) ? bill["bill.qty_kwh"] : bill["bill.qty_kwh.raw"]);
			billAgregate["qty_volume"] = billAgregate["qty_volume"] + parseFloat((bill["bill.qty_volume.raw"]== undefined) ? bill["bill.qty_volume"] : bill["bill.qty_volume.raw"]);
			if((bill["bill.vn_ac_id"] != vnAcId) || (bill["bill.time_period"] != time_per)){
				View.showMessage(getMessage('noBillSelectedAggregate')); 
				return;
			}
		}
		
		var rec = new Ab.data.Record();
		rec.isNew = true;
		rec.setValue("bill.time_period",bill["bill.time_period"]);
		rec.setValue("bill.vn_id",bill["bill.vn_id"]);
		rec.setValue("bill.vn_ac_id",bill["bill.vn_ac_id"]);
		rec.setValue("bill.bill_type_id",bill["bill.bill_type_id"]);
		rec.setValue("bill.bill_id","AGG-"+ bill["bill.time_period"] + "-"+bill["bill.bl_id"]+"-"+bill["bill.vn_id"]);
		rec.setValue("bill.bl_id",bill["bill.bl_id"]);
		rec.setValue("bill.site_id",bill["bill.site_id"]);
		rec.setValue("bill.date_due",bill["bill.date_due.raw"]);
		rec.setValue("bill.date_service_start",bills[0]["bill.date_service_start.raw"]);
		rec.setValue("bill.date_service_end",bills[bills.length-1]["bill.date_service_end.raw"]);
		rec.setValue("bill.amount_expense",billAgregate["amount_expense"]);
		rec.setValue("bill.amount_income",billAgregate["amount_income"]);
		rec.setValue("bill.qty_energy",billAgregate["qty_energy"]);
		rec.setValue("bill.qty_power",billAgregate["qty_power"]);
		rec.setValue("bill.qty_kwh",billAgregate["qty_kwh"]);
		rec.setValue("bill.qty_volume",billAgregate["qty_volume"]);
		rec.setValue("bill.prorated_aggregated","AGGREGATED");
		
		try{ 
		this.ds_billArchive.saveRecord(rec);
		}catch(e){
			View.showMessage(getMessage('billExist'));
		}
		
		for(var i = 0; i < billsOld.length; i++){
			var record = billsOld[i];
			record.setValue("bill.prorated_aggregated","NO");
			record.setValue("bill.reference_bill_id", "AGG-"+ bill["bill.time_period"] + "-"+bill["bill.bl_id"]+"-"+bill["bill.vn_id"]);
			try{ 
				this.ds_billArchive.saveRecord(record);
				}catch(e){
					View.showMessage(getMessage('billExist'));
				}
		}
		
		panel.refresh();
	},
	
	panel_missingPeriods_onEdit: function(){
		var panel = this.panel_missingPeriods;
		if(panel.getSelectedRows().length>1){
			View.showMessage(getMessage('selectBill')); 
			this.form_missingPeriods.closeWindow();
			return; 
		}
		var form = this.form_missingPeriods;
		var bill = panel.getSelectedRows()[0];
		form.setFieldValue("bill.vn_id", bill["bill_archive.vn_id"]);
		form.setFieldValue("bill.vn_ac_id",bill["bill_archive.vn_ac_id"]);
		form.setFieldValue("bill.bill_type_id",bill["bill_archive.bill_type_id"]);
		form.setFieldValue("bill.bl_id",bill["bill_archive.bl_id"]);
		form.setFieldValue("bill.bill_id",bill["bill_archive.bill_id"]);
		form.setFieldValue("bill.time_period",bill["bill_archive.time_period"]);
		form.setFieldValue("bill.site_id",bill["bill_archive.site_id"]);
		form.setFieldValue("bill.date_due",bill["bill_archive.date_due.raw"]);
		form.setFieldValue("bill.date_service_start",bill["bill_archive.date_service_start.raw"]);
		form.setFieldValue("bill.date_service_end",bill["bill_archive.date_service_end.raw"]);
		
	},
	
	panel_prorate_onProrate: function(){
		var panel = this.panel_prorate;
		var bills = panel.getSelectedRows();
		var records = panel.getSelectedRecords();
		if(bills.length<1){
			View.showMessage(getMessage('noBillSelected'));
			return;
		}
		for (var i=0; i<bills.length; i++){		
			var bill = bills[i];
			var record = records[i];
			var startMonth = new Date(bill["bill.date_service_start.raw"].substring(0,10));
			var endMonth = new Date(bill["bill.date_service_end.raw"].substring(0,10));
			var diff = endMonth.getMonth() - startMonth.getMonth() + (12 * (endMonth.getFullYear() - startMonth.getFullYear()));
			for(var j = 0; j <= diff; j++){
				var rec = new Ab.data.Record();
				rec.isNew = true;
				var dt = new Date(startMonth);
				dt = new Date(dt.setMonth(dt.getMonth() + j));
				var month = ("0" + (dt.getMonth() + 1)).slice(-2);
				var timePeriod = dt.getFullYear()+"-"+month;
				var lastDay = dt.getFullYear()+"-"+month+"-"+(new Date(dt.getFullYear(),dt.getMonth()+1,0).getDate());
				var firstDay = dt.getFullYear()+"-"+month+"-01";
				rec.setValue("bill.time_period",timePeriod);
				rec.setValue("bill.vn_id",bill["bill.vn_id"]);
				rec.setValue("bill.vn_ac_id",bill["bill.vn_ac_id"]);
				rec.setValue("bill.bill_type_id",bill["bill.bill_type_id"]);
				rec.setValue("bill.bl_id",bill["bill.bl_id"]);
				rec.setValue("bill.bill_id","PRO-"+timePeriod+"-"+bill["bill.bl_id"]+"-"+bill["bill.vn_id"]);
				rec.setValue("bill.site_id",bill["bill.site_id"]);
				rec.setValue("bill.date_due",bill["bill.date_due.raw"]);
				if(j==0){
					rec.setValue("bill.date_service_start",bill["bill.date_service_start.raw"]);
				}else{
					rec.setValue("bill.date_service_start",firstDay);
				}
				if(j == diff){
					rec.setValue("bill.date_service_end",bill["bill.date_service_end.raw"]);
				}else{
					rec.setValue("bill.date_service_end",lastDay);
				}
				var divide = diff+1;
				rec.setValue("bill.amount_expense",(record.getValue("bill.amount_expense")==undefined) ? '0' : record.getValue("bill.amount_expense")/divide);
				rec.setValue("bill.amount_income",(record.getValue("bill.amount_income")==undefined ) ? '0' : record.getValue("bill.amount_income")/divide);
				rec.setValue("bill.qty_energy",(record.getValue("bill.qty_energy")==undefined ) ? '0' : record.getValue("bill.qty_energy")/divide);
				rec.setValue("bill.qty_power",(record.getValue("bill.qty_power")==undefined ) ? '0' : record.getValue("bill.qty_power")/divide);
				rec.setValue("bill.qty_kwh",(record.getValue("bill.qty_kwh")==undefined ) ? '0' : record.getValue("bill.qty_kwh")/divide);
				rec.setValue("bill.qty_volume",(record.getValue("bill.qty_volume")==undefined ) ? '0' : record.getValue("bill.qty_volume")/divide);
				rec.setValue("bill.cost_kwh",(record.getValue("bill.cost_kwh")==undefined ) ? '0' : record.getValue("bill.cost_kwh"));
				rec.setValue("bill.cost_mmbtu",(record.getValue("bill.cost_mmbtu")==undefined ) ? '0' : record.getValue("bill.cost_mmbtu"));
				rec.setValue("bill.prorated_aggregated","PRORATED-TIME");
				rec.setValue("bill.reference_bill_id",bill["bill.bill_id"]);
				
				try{ 
	    		this.ds_billArchive.saveRecord(rec);
				}catch(e){
					View.showMessage(getMessage('billExist'));
				}
			}
		}	
		panel.refresh();
		
	}
			
});

function refreshPanel(){
	var controller = View.controllers.get('energyExceptionReport');
	controller.panel_missingPeriods.refresh();
}
