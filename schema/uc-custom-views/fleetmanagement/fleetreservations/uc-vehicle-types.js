var K_START_DATE;
var K_START_TIME;


var vehicleCntrl = View.createController('vehicleCntrl', {
	pickup:false,
    afterViewLoad: function () {
	
		this.setOpenerRestriction();
    },

    afterInitialDataFetch: function () {

    },

	setOpenerRestriction:function(){
		var restiction = View.restriction || {};
		if(restiction && typeof restiction.findClause !== "undefined"){
			
			var vehicle_type = restiction.findClause("vehicle_type").value;
			var vehicle_type_req = restiction.findClause("vehicle_type_req").value;
			var start_date = restiction.findClause("start_date").value 
			var start_time = restiction.findClause("start_time").value;
			var end_date = restiction.findClause("end_date").value
			var end_time = restiction.findClause("end_time").value;
			var date_rest;	
			var start_date_rest = "1=1";	
			var end_date_rest = "1=1";	
		
			//var status = restiction.findClause("status").value;
			//if(status){
			//	pickup = true;
			//}
			
			this.vehicle_type_grid.addParameter("vt2", realEscape(vehicle_type_req));
			
			if(vehicle_type){
				this.vehicle_type_grid.addParameter("vt1", realEscape(vehicle_type));
			}
			else {
				this.vehicle_type_grid.addParameter("vt1", "''");
			}
			
			start_date_rest = "(dateadd(hour,1, replace(convert(varchar,wr.date_pickup,20), '00:00:00',case when wr.time_pickup='-' then '00:00:00' else wr.time_pickup end)) <= "+realEscape(end_date + " "+getTime(end_time)) + ")";
			end_date_rest = "(dateadd(hour,-1, replace(convert(varchar,wr.date_dropoff,20), '00:00:00',case when wr.time_dropoff='-' then '00:00:00' else wr.time_dropoff end)) >= "+realEscape(start_date + " "+getTime(start_time)) + ")"
			date_rest = start_date_rest + " and " + end_date_rest;
			
			this.vehicle_type_grid.addParameter("date_rest", date_rest);

			this.wr_grid.addParameter("date_rest", date_rest);
			
			date_rest = "exists (select 1 from wr where vehicle.eq_id=wr.eq_id and wr.work_team_id in ('FLEET-RESERVE','FLEET') and wr.status  not in ('Rej','Can','S','Com','FWC','Clo') AND " + date_rest + ")"
			this.vehicle_grid.addParameter("date_rest", " and not " + date_rest);
			this.vehicle_grid_inuse.addParameter("date_rest", " and " + date_rest);

		}
		
	},
	
    setDefaultDate: function () {
        var now = new Date();
        K_START_DATE = now.dateFormat("Y-m-d");
        K_START_TIME = x.dateFormat("1899-12-30 h:i:00.000");
    },
	
	vehicle_type_grid_onSelectVehicleType:function(row){
		if(window.parent){
			var controller = window.parent.reservationAdminController;
			controller.reservations_form.setFieldValue("wr.vehicle_type",row.record["vehicle_type.vehicle_type_id"]);
			controller.reservations_form.setFieldValue("wr.eq_id","");
		}
		View.closeThisDialog()
	},
	
	showVehicles:function(index){
		var panel = this.vehicle_type_grid;
		var row = panel.rows[index || panel.selectedRowIndex];
		var type = row["vehicle_type.vehicle_type_id"];
		this.vehicle_grid.refresh("vehicle.vehicle_type_id in ("+realEscape(type)+")");
		this.vehicle_grid_inuse.refresh("vehicle.vehicle_type_id in ("+realEscape(type)+")");
		this.wr_grid.refresh("1=2");
		this.clearHighlights(panel);
		this.vehicle_grid.appendTitle(type);
		this.vehicle_grid_inuse.appendTitle(type);
		row.row.dom.style.background = "#F7EBB0";
	},
	showOverduepu:function(index){
		var panel = this.vehicle_type_grid;
		var row = panel.rows[index || panel.selectedRowIndex];
		var type = row["vehicle_type.vehicle_type_id"];
		
		this.wr_grid_overdue.showInWindow({
			width:800,
			height:600
		});
		
		var rest = "wr.work_team_Id = 'FLEET-RESERVE' and wr.status ='AA' and wr.time_pickup not in ('-') and replace(convert(varchar,wr.date_pickup,120),' 00:00', ' ' + rtrim(wr.time_pickup)) < convert(varchar,getdate(),120)"
		rest += " and isnull(wr.vehicle_type,wr.vehicle_type_Req) in ("+realEscape(type)+")"
		this.wr_grid_overdue.addParameter("date_rest", "1=1");
		this.wr_grid_overdue.refresh(rest);
		
	},
	showOverduedo:function(index){
		var panel = this.vehicle_type_grid;
		var row = panel.rows[index || panel.selectedRowIndex];
		var type = row["vehicle_type.vehicle_type_id"];
		
		this.wr_grid_overdue.showInWindow({
			width:800,
			height:600
		});
		
	
		var rest = "wr.work_team_Id = 'FLEET-RESERVE' and wr.status ='I' and wr.time_dropoff not in ('-') and replace(convert(varchar,wr.date_dropoff,120),' 00:00', ' ' + rtrim(wr.time_dropoff)) < convert(varchar,getdate(),120)"
		rest += " and isnull(wr.vehicle_type,wr.vehicle_type_Req) in ("+realEscape(type)+")"
		this.wr_grid_overdue.addParameter("date_rest", "1=1");
		this.wr_grid_overdue.refresh(rest);
		
	},
	clearHighlights:function(panel){
		for(var i=0, j=panel.rows.length; i<j; i++){
			panel.rows[i].row.dom.style.background = "";
		}
	},
	vehicle_type_grid_afterRefresh:function(){
		this.vehicle_type_grid.removeSorting();
		setTimeout(function(){
			if(vehicleCntrl.vehicle_type_grid.rows.length){
				vehicleCntrl.showVehicles("0");
			}
		},500);
	},
	wr_grid_afterRefresh:function(){
		this.wr_grid.removeSorting();
	},
	
	vehicle_type_grid_onClose:function(){
		View.closeThisDialog();
	},
	
	vehicle_grid_onSelectVehicle:function(row){
		if(window.parent){
			var controller = window.parent.reservationAdminController;
			controller.reservations_form.setFieldValue("wr.eq_id",row.record["vehicle.eq_id"]);
			controller.reservations_form.setFieldValue("hwr.eq_id",row.record["vehicle.vehicle_id"]);
			controller.reservations_form.setFieldValue("wr.vehicle_type",row.record["vehicle.vehicle_type_id"]);
		}
		View.closeThisDialog()
	},
	
	showRequest:function(){
		var panel = this.vehicle_grid_inuse;
		var row = panel.rows[panel.selectedRowIndex];
		var eq = row["vehicle.eq_id"];
		this.wr_grid.refresh("wr.eq_id in ("+realEscape(eq)+")");
		this.wr_grid.appendTitle(row["vehicle.vehicle_id"]);
		this.clearHighlights(panel);
		row.row.dom.style.background = "#F7EBB0";
	}
});

function realEscape(val) {
	var rVal = "NULL";
	if (val.toString() != '') {
		if (typeof val.dateFormat === 'function') {
			if (val.dateFormat('Y-m-d') === '1899-12-30') {
				val = val.format('Y-m-d h:i:s.u');
			}
			else {
				val = val.dateFormat('Y-m-d');
			}
		}
		rVal = "'" + val.replace(/'/g, "''") + "'";
	}
	return rVal;
 }
 
 function getTime(timeString){
	var minutes = +timeString.split(":")[0];
	var seconds = timeString.split(":")[1];
	var time;
	
	//minutes = minutes == 0 ? 23 : minutes - 1;
	minutes = minutes < 10 ? "0"+minutes : ""+minutes;

	time = minutes+":"+seconds+":00.000";

	return time; 
 }