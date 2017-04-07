var viewPersonFinderController = View.createController('viewPersonFinderController', {

	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
		//this.consolePanel_onShow();
	},
	
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},
	
	//console filter
	consolePanel_onShow: function() {
	
		var unit_id = this.consolePanel.getFieldValue('vehicle.vehicle_id');
		var vehicle_type = this.consolePanel.getFieldValue('vehicle.vehicle_type_id');
		var date_add_from = this.consolePanel.getFieldValue('vehicle.date_ins.from');
		var date_add_to = this.consolePanel.getFieldValue('vehicle.date_ins.to');
		var date_can_from = this.consolePanel.getFieldValue('vehicle.date_ins_cancelled.from');
		var date_can_to = this.consolePanel.getFieldValue('vehicle.date_ins_cancelled.to');
		//var active_only = $('active_flag').checked;
		var hail_writeoff = $('is_hail_writeoff').value;
		var vehicle_status = $('vehicle_status').value;
		/*
		
		var bl_id = this.consolePanel.getFieldValue('uc_rm_audit_log.bl_id');
		var fl_id = this.consolePanel.getFieldValue('uc_rm_audit_log.fl_id');
		var rm_id = this.consolePanel.getFieldValue('uc_rm_audit_log.rm_id');
		var dp_id = this.consolePanel.getFieldValue('uc_rm_audit_log.dp_id');
		var date_from = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_date.from');
		var date_to = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_date.to');
		var modification_type = this.consolePanel.getFieldValue('uc_rm_audit_log.modification_type');

		*/
		
		var restriction="1=1";
		

		if (unit_id != "") {restriction = restriction + " AND vehicle.vehicle_id = '"+unit_id+"'"; }	
		if (vehicle_type != "") {restriction = restriction + " AND vehicle.vehicle_type_id = '"+vehicle_type+"'"; }	


		if (date_add_from != "") {	restriction = restriction + " AND vehicle.date_ins >= "+this.literalOrNull(date_add_from); }	
		if (date_add_to != "") {	restriction = restriction + " AND vehicle.date_ins <= "+this.literalOrNull(date_add_to);	}
		
		if (date_can_from != "") {	restriction = restriction + " AND vehicle.date_ins_cancelled >= "+this.literalOrNull(date_can_from); }	
		if (date_can_to != "") {	restriction = restriction + " AND vehicle.date_ins_cancelled <= "+this.literalOrNull(date_can_to);	}
		

		
		if(hail_writeoff == "Only") {
			restriction = restriction + " AND vehicle.hailstorm_writeoff = 1 ";
		}
		if(hail_writeoff == "No") {
			restriction = restriction + " AND vehicle.hailstorm_writeoff = 0 ";
		}
		
		if(vehicle_status == "Active") {
			restriction = restriction + " AND vehicle.status <> 'DISP' ";
		}
		if(vehicle_status == "Disposed") {
			restriction = restriction + " AND vehicle.status = 'DISP' ";
		}
		
		
		this.detailsPanel.show(true, false);
		this.detailsPanel.refresh(restriction);
	},
	
	
	consolePanel_onRep10: function() {
		//REP 10 = 2A-21B - Vehicles Added to the Insurer
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var currentInsuranceYear = getFiscalY(date);
		var insuranceFrom = '07/01/'+ currentInsuranceYear;
		var insuranceTo = '06/30/' + (currentInsuranceYear + 1);
		
		
		var fromMonth = firstDay.getMonth()+1;
		var fromYear = firstDay.getFullYear();
		var fromDay = firstDay.getDate();
		
		var toMonth = lastDay.getMonth()+1;
		var toYear = lastDay.getFullYear();
		var toDay = lastDay.getDate();
		
		
		
		this.consolePanel.clear();
		

		this.consolePanel.setFieldValue('vehicle.date_ins.from',insuranceFrom);
		this.consolePanel.setFieldValue('vehicle.date_ins.to',insuranceTo);

		
		$('is_hail_writeoff').value='All';
		$('vehicle_status').value='Active';
	},
	
	consolePanel_onRep20: function() {
		//REP 20 = 2B-21B - Vehicles Deleted to the Insurer
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var currentInsuranceYear = getFiscalY(date);
		var insuranceFrom = '07/01/'+ currentInsuranceYear;
		var insuranceTo = '06/30/' + (currentInsuranceYear + 1);
		
		this.consolePanel.clear();
		
		this.consolePanel.setFieldValue('vehicle.date_ins_cancelled.from',insuranceFrom);
		this.consolePanel.setFieldValue('vehicle.date_ins_cancelled.to',insuranceTo);
		
		$('is_hail_writeoff').value='All';
		$('vehicle_status').value='Disposed';
	},
	
	consolePanel_onRep30: function() {
		//REP 30 = 2C - Vehicles List after Add-Del to Insurer
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var currentInsuranceYear = getFiscalY(date);
		var insuranceFrom = '07/01/'+ currentInsuranceYear;
		var insuranceTo = '06/30/' + (currentInsuranceYear + 1);
		
		this.consolePanel.clear();
		
		//this.consolePanel.setFieldValue('vehicle.vehicle_id','');
		//this.consolePanel.setFieldValue('vehicle.vehicle_type_id','');
		//this.consolePanel.setFieldValue('vehicle.date_ins','');
		//this.consolePanel.setFieldValue('vehicle.date_ins_cancelled','');
		//this.consolePanel.setFieldValue('vehicle.status','');
		
		$('is_hail_writeoff').value='All';
		$('vehicle_status').value='Active';
	},
	
	
	consolePanel_onRep40: function() {
		//REP 40 = 3B - Active Vehicles - Non Hailstorm Write-off
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var currentInsuranceYear = getFiscalY(date);
		var insuranceFrom = '07/01/'+ currentInsuranceYear;
		var insuranceTo = '06/30/' + (currentInsuranceYear + 1);
		
		
		//this.consolePanel.setFieldValue('vehicle.vehicle_id','');
		//this.consolePanel.setFieldValue('vehicle.vehicle_type_id','');
		//this.consolePanel.setFieldValue('vehicle.date_ins','');
		//this.consolePanel.setFieldValue('vehicle.date_ins_cancelled','');
		//this.consolePanel.setFieldValue('vehicle.status','');
		
		$('is_hail_writeoff').value='No';
		$('vehicle_status').value='Active';
	},
	
	
	consolePanel_onRep50: function() {
		//REP 50 = 3C - Active Vehicles - Non Hailstorm Write-off
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth()-1, 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
		
		var currentInsuranceYear = getFiscalY(date);
		var insuranceFrom = '07/01/'+ currentInsuranceYear;
		var insuranceTo = '06/30/' + (currentInsuranceYear + 1);
		
		this.consolePanel.clear();
		
		//this.consolePanel.setFieldValue('vehicle.vehicle_id','');
		//this.consolePanel.setFieldValue('vehicle.vehicle_type_id','');
		//this.consolePanel.setFieldValue('vehicle.date_ins','');
		//this.consolePanel.setFieldValue('vehicle.date_ins_cancelled','');
		//this.consolePanel.setFieldValue('vehicle.status','');
		
		$('is_hail_writeoff').value='Only';
		$('vehicle_status').value='Active';
	},
	
	
	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
	},
	
	
		//refresh list
	ucWrcfStagingListPanel_onRefresh: function(){
		this.detailsPanel.refresh();
	},
	
	
	//utility functions
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},
	
	

	
});

function getFiscalY(d)
{
		var fiscalYear;
		if (d.getMonth() > 7)
			{ fiscalYear = d.getFullYear();}
        else {
            fiscalYear = d.getFullYear()-1;}
        return fiscalYear
}	