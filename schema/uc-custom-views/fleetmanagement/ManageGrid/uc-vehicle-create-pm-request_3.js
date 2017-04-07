
var createWRController = View.createController('createWRController',{

	afterViewLoad: function() {
	
		
	},

	submitRequest: function(sTab) {
		var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details);
		var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0,submitRecord);
		var resultid = submitResult.data.activity_log_id;
		
		var wr = UC.Data.getDataValue("wr", "wr_id", "activity_log_id='" + resultid + "'");
		
		var eq_id=this.wr_create_details.getFieldValue("activity_log.eq_id");
		var vehicle_id = UC.Data.getDataValue("vehicle", "vehicle_id", "eq_id='" + eq_id + "'");
		var pmp_cat = UC.Data.getDataValue("pmp", "pmp_cat", "pmp_id='" + this.wr_create_details.getFieldValue('activity_log.pmp_id') + "'");
		
		
		//CHANGE WORK REQUEST DETAILS
		var work_team="FLEET";
		var budget_owner=this.wr_create_details.getFieldValue("activity_log.budget_owner");
		var date_dropoff=this.wr_changes.getFieldValue("wr.date_dropoff");
		var time_dropoff=this.wr_changes.getFieldValue("wr.time_dropoff");
		var date_pickup=this.wr_changes.getFieldValue("wr.date_pickup");
		var time_pickup=this.wr_changes.getFieldValue("wr.time_pickup");
		var pmp_id=this.wr_create_details.getFieldValue("activity_log.pmp_id");
		var date_assigned=this.wr_create_details.getFieldValue("date_assigned");
	
		var wrRestriction = new Ab.view.Restriction();
		wrRestriction.addClause("wr.wr_id", wr, "=");
		
		var dsWR = new Ab.data.createDataSourceForFields({
		   id: 'dsWRSave',
		   tableNames: ['wr'],
		   fieldNames: ['wr.wr_id', 'wr.work_team_id', 'wr.budget_owner', 'wr.date_dropoff', 'wr.time_dropoff','wr.date_pickup', 'wr.time_pickup','wr.pmp_id', 'wr.date_assigned']
		});
		var record = dsWR.getRecord(wrRestriction);
		record.setValue("wr.work_team_id", work_team);
		record.setValue("wr.budget_owner", budget_owner);
		record.setValue("wr.date_dropoff", date_dropoff);
		record.setValue("wr.time_dropoff", time_dropoff);
		record.setValue("wr.date_pickup", date_pickup);
		record.setValue("wr.time_pickup", time_pickup);
		record.setValue("wr.pmp_id", pmp_id);
		record.setValue("wr.date_assigned", date_assigned);
		dsWR.saveRecord(record);
		
		
		
		//update the schedule.
		var maintRestriction = new Ab.view.Restriction();
		var maint_id=this.wr_create_details.getFieldValue("maint_id");
		maintRestriction.addClause("uc_fleetmaintsched.maint_id", maint_id, "=");
		
		var dsSched = new Ab.data.createDataSourceForFields({
			id: 'dsMaintRec',
			tableNames: ['uc_fleetmaintsched'],
			fieldNames: ['uc_fleetmaintsched.maint_id', 'uc_fleetmaintsched.status', 'uc_fleetmaintsched.wr_id']
		});
		
		var maintrecord = dsSched.getRecord(maintRestriction);
		maintrecord.setValue("uc_fleetmaintsched.status", "WR");
		maintrecord.setValue("uc_fleetmaintsched.wr_id", wr);
		dsSched.saveRecord(maintrecord);
		
		
		// ADD VEHICLE PARTS BASED ON SCHEDULE
		if (pmp_cat == "Vehicle A" || pmp_cat == "Vehicle B" || pmp_cat == "Vehicle C" || pmp_cat == "Vehicle D" || pmp_cat == "Vehicle E") {
			var qty_column = "";
			switch (pmp_cat) {
				case "Vehicle A":	qty_column = 'qty_a'; break;
				case "Vehicle B":	qty_column = 'qty_b'; break;
				case "Vehicle C":	qty_column = 'qty_c'; break;
				case "Vehicle D":	qty_column = 'qty_d'; break;
				case "Vehicle E":	qty_column = 'qty_e'; break;
				default:
					break;
			}
	
	
			//SAVE THE ASSOCIATED PARTS
			var part_restriction="vehicle_id='" + vehicle_id + "' AND " + qty_column + " IS NOT NULL";
			//var part_records = UC.Data.getDataRecords("uc_vehiclept", ["uc_vehiclept.vehicle_id","uc_vehiclept.part_id","uc_vehiclept.qty_a","uc_vehiclept.qty_b","uc_vehiclept.qty_c","uc_vehiclept.qty_d","uc_vehiclept.qty_e"],"vehicle_id='" + vehicle_id + "' AND " + qty_column + " IS NOT NULL");
			var part_records = UC.Data.getDataRecords("uc_vehiclept", ["uc_vehiclept.vehicle_id","uc_vehiclept.part_id","uc_vehiclept.qty_a","uc_vehiclept.qty_b","uc_vehiclept.qty_c","uc_vehiclept.qty_d","uc_vehiclept.qty_e"],part_restriction);
			
			if (part_records.length > 0) {	//if there are parts to add, add them to the work request
				for (var i = 0; i < part_records.length; i++) {
					var record=part_records[i];
					if (record["uc_vehiclept." + qty_column] != null) {
						var saveRecord = new Ab.data.Record({
							'wrpt.wr_id': wr,
							'wrpt.part_id': record["uc_vehiclept.part_id"],
							'wrpt.qty_estimated':record["uc_vehiclept." + qty_column],
							'wrpt.fulfilled':'1',
							'wrpt.date_assigned':new Date(),
							'wrpt.time_assigned':new Date()},
							true); // true means new record
						this.ds_part.saveRecord(saveRecord);
					}
				}
			}
			
			//SAVE THE ASSOCIATED VMRS TASKS
			var pmp_restriction = "pmp_id='" + this.wr_create_details.getFieldValue('activity_log.pmp_id') + "'";
			var vmrs_records = UC.Data.getDataRecords("uc_vmrs_pmp", ["uc_vmrs_pmp.pmp_id", "uc_vmrs_pmp.vmrs_int_id", "uc_vmrs_pmp.vmrs_maj_id", "uc_vmrs_pmp.vmrs_repairtype", "uc_vmrs_pmp.est_hours", "uc_vmrs_pmp.notes"], pmp_restriction); 
			
			
			
			if (vmrs_records.length > 0) {
				for (var i = 0; i < vmrs_records.length; i++) {
					var record = vmrs_records[i];
					var repairtypeValue = '';
					
					//lazy coding - get the repair type value.
					switch (record["uc_vmrs_pmp.vmrs_repairtype"]) {
						case "CHECK":	repairtypeValue = '1'; break;
						case "REPAIR":	repairtypeValue = '2'; break;
						case "REPLACE":	repairtypeValue = '3'; break;
						case "DAMAGE":	repairtypeValue = '4'; break;
						case "PM":	repairtypeValue = '5'; break;
						case "OUTSIDE":	repairtypeValue = '6'; break;
						default:
							repairtypeValue = '5';
							break;
					}
					
					//var repairtypeValue = getEnumValue("uc_vmrs_pmp", "vmrs_repairtype", record["uc_vmrs_pmp.vmrs_repairtype"]);
					if (record["uc_vmrs_pmp.pmp_id"] != null) {
						var saveRecord = new Ab.data.Record({
							'uc_vmrs_record.wr_id': wr,
							'uc_vmrs_record.vmrs_maj_id': record["uc_vmrs_pmp.vmrs_maj_id"],
							'uc_vmrs_record.vmrs_int_id': record["uc_vmrs_pmp.vmrs_int_id"],
							'uc_vmrs_record.vmrs_repairtype': repairtypeValue,
							'uc_vmrs_record.est_hours': record["uc_vmrs_pmp.est_hours"],
							'uc_vmrs_record.notes': record["uc_vmrs_pmp.notes"]},
							true); //true means new record
						this.ds_vmrs.saveRecord(saveRecord);
					} //if
				} //for
			}
			
		}
		
		
		
	}, //submitRequest
	
	

	
});






