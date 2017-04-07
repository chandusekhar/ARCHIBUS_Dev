var reservationAllController = View.createController('reservationAllController', {
       afterViewLoad: function(){
			var theDropDown = document.getElementById("wrConsolePanel_wr.status");
			//theDropDown.add (new Option("Active","Active"));
			//theDropDown.options[0] = new Option("Active","Active");
			
			this.reservations_grid.restriction = "wr.status in ('R','Rev','A','AA','I')"
			
			this.reservations_grid.afterCreateCellContent = function(row, col, cellElement) {
				var currentStatus = row["wr.status.raw"];
				
				if (col.id === "edit"){
					//if (currentStatus == 'Com' || currentStatus == 'Rej' || currentStatus == 'Can' || currentStatus == 'I'){
						col.text="View"
						cellElement.firstChild.value="View"
					//}
				}
				else if (col.id === "cancel"){
					if (currentStatus == 'Com' || currentStatus == 'Rej' || currentStatus == 'Can' || currentStatus == 'I'){
						cellElement.style.visibility = "hidden";
					}	
				}
				
				if (col.id === "wr.pu" && row["wr.status.raw"]=='AA') {
					var dtn = new Date()
					var dtdo = new Date(row["wr.pu"] )
					if (dtn>dtdo ){
						cellElement.style.backgroundColor="yellow"
					}
						
				}
				if (col.id === "wr.do"  && row["wr.status.raw"]=='I') {
					var dtn = new Date()
					var dtdo = new Date(row["wr.do"] )
					if (dtn>dtdo ){
						cellElement.style.backgroundColor="red"
					}
						
				}
			}
				
		   
		},
		
			
		
	   afterInitialDataFetch: function(){
		},
	/*   
	   rowButtons:function(){
	     			//for each row make the button display View if status is completed
			var rowCount = this.reservations_grid.gridRows.getCount();
			var row = null;
			var currentButton = null;
			var currentStatus = null;
            for (var i = 0; i < rowCount; i++) { 
                row = this.reservations_grid.gridRows.get(i);
				currentButton = row.actions.get('edit');
				currentStatus = row.record["wr.status.raw"];
				if (currentStatus == 'Com' || currentStatus == 'Rej' || currentStatus == 'Can' || currentStatus == 'I'){
				   currentButton.setTitle("View");
				   row.actions.get('cancel').show(false);
				}
				
				currentButton.setTitle("View");
			}
	   },
*/	   
	   wrConsolePanel_onShow: function() {
			var restriction = "1=1";
			//get user set values
			var requestor = this.wrConsolePanel.getFieldValue("wr.requestor");
			var date_pickup = this.wrConsolePanel.getFieldValue("wr.date_pickup");
			var date_dropoff = this.wrConsolePanel.getFieldValue("wr.date_dropoff");
			var vehicle_type = this.wrConsolePanel.getFieldValue("wr.vehicle_type_req");
			var vehicle_id = this.wrConsolePanel.getFieldValue("wr.eq_id");
			var budget_owner = this.wrConsolePanel.getFieldValue("wr.budget_owner");
			var wr = this.wrConsolePanel.getFieldValue("wr.wr_id");
			 //this.wrConsolePanel.getFieldValue("wr.status");
			var status = $('stat').value
			var subwr = $('subwr').value
			//build restriction
			if (requestor != '')
			restriction += " AND wr.requestor =" + this.restLiteral(requestor);
			if (date_pickup != '')
			restriction += " AND  isnull(wr.date_assigned,wr.date_pickup) =" + this.restLiteral(date_pickup);// + " OR wr.date_assigned = " + this.restLiteral(date_pickup) ;
			if (date_dropoff != '')
			restriction += " AND isnull(date_completed,wr.date_dropoff) =" + this.restLiteral(date_dropoff);
			if (vehicle_type != '')
			restriction += " AND isnull(wr.vehicle_type,wr.vehicle_type_req) =" + this.restLiteral(vehicle_type);
			if (vehicle_id != '')
			restriction += " AND wr.eq_id =" + this.restLiteral(vehicle_id);
			if (budget_owner != '')
			restriction += " AND wr.budget_owner =" + this.restLiteral(budget_owner); 
			if (wr != '')
			restriction += " AND wr.wr_id =" + wr; 
			
			if (status == 'Active'){
				restriction += " AND wr.status in ('R','Rev','A','AA','I') ";
			}
			else if (status == 'opu'){
				restriction += " AND wr.status='AA' AND convert(datetime,case when wr.date_assigned is null and wr.time_assigned is null then"
				restriction += " (select left(rtrim(wr.date_pickup),12) + e.edesc  from afm.brg_enum('wr','time_pickup') e where e.eid=wr.time_pickup)"
				restriction += " else (left(rtrim(wr.date_assigned),12) +  replace(replace(substring(convert(varchar,wr.time_assigned,0), 12,8),'AM',' AM'),'PM', ' PM')) end) <= getdate()"
			}
			else if (status == 'odo'){
				restriction += " AND wr.status='I' AND convert(datetime,case when wr.date_completed is null and wr.time_completed is null then"
				restriction += " (select left(rtrim(wr.date_dropoff),12) + e.edesc  from afm.brg_enum('wr','time_dropoff') e where e.eid=wr.time_dropoff)"
				restriction += " else (left(rtrim(wr.date_completed),12) +  replace(replace(substring(convert(varchar,wr.time_completed,0), 12,8),'AM',' AM'),'PM', ' PM')) end) <= getdate()"
			}
			else if (status != ''){
			  restriction += " AND wr.status =" + this.restLiteral(status);
			}
			var subwrrest = " exists (select 1 from wr subwr where subwr.wr_id<>wr.wr_id and subwr.wo_id=wr.wo_id union select 1 from wr_other subwr where subwr.wr_id=wr.wr_id and other_rs_type='VEHICLE-WORK')"
			if (subwr == 'Y'){
				restriction += " AND " + subwrrest
			}
			else if (subwr == 'N'){
				restriction += " AND NOT" + subwrrest
			}
			else if (subwr == 'A'){
				subwrrest = " exists (select 1 from wr subwr where subwr.wr_id<>wr.wr_id and subwr.wo_id=wr.wo_id and status not in ('Rej','Can','S','FWC','Com','Clo') union select 1 from wr_other subwr where subwr.wr_id=wr.wr_id and other_rs_type='VEHICLE-WORK')"
				restriction += " AND " + subwrrest
			}
		   
		 this.reservations_grid.refresh(restriction);
	   },
	   
	  reservations_grid_onCancel: function(row){
		if (!confirm("You are about to Cancel this request, continue?")){return;}
			var ds = View.dataSources.get(this.reservations_grid.dataSourceId);
			var wrRecord= new Ab.data.Record();
			wrRecord.oldValues = new Object();
			wrRecord.isNew = false;
			wrRecord.setValue('wr.wr_id',  row.record["wr.wr_id"]);
			wrRecord.oldValues['wr.wr_id'] =  row.record["wr.wr_id"];
			wrRecord.setValue('wr.status', 'Can');	
			wrRecord.oldValues['wr.status'] =  row.record["wr.status"];
			ds.saveRecord(wrRecord)	
			this.reservations_grid.refresh()
	  },
	  reservations_grid_onEdit: function(row){
	   //Opens wr_other popup in add mode 
	   var currWr = row.record["wr.wr_id"];
	   var currWo = row.record["wr.wo_id"];
	   var test = 1;
	   
	   var currStat = row.record["wr.status"];
	   
	   //Open differnt view depending on status
	   View.openDialog('uc-vehicle-edit-view-popup.axvw', {'wr.wr_id':currWr}, false, {
			width: 850,
			height: 650,
			closeButton: false,
			wr:currWr,
			wo:currWo
			});
	 },
	 
	
	   
	   
	   restLiteral: function(value) {
	              return "'"+value.replace(/'/g, "'")+"'";
       }
	   
	   
	})
