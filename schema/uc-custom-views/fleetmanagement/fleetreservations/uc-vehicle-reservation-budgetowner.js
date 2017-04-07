var brgTest = false
var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reservationBoController = View.createController('reservationAdminController', {
        //on deny
		rowRecord:null,
		btn:null,
		
		afterViewLoad: function () {
			 this.reservations_grid.afterCreateCellContent = this.reservations_grid_render;
		},
		
		reservations_grid_render: function (row, col, cellElement) {
		
			if (col.id ==  "wr.acc") {
				var acct = row.grid.rows[row.index]['wr.ac_id'].split('-')
				
				var accHTML='<table border="0" cellpadding="0" cellspacing="0"><tr>'
				
				var ac = "UCALG"
				if (acct.length > 0){if (acct[0] !="") {ac = acct[0];}}
				accHTML += '<td>Bus. Unit<br/><input type="text" id="ac_id_part1_' + row.index + '" maxlength="5" size="5" value="' + ac + '"/></td>'
				ac=""
				if (acct.length > 1){ac = acct[1];}
				accHTML += '<td>Fund<br/><input type="text" id="ac_id_part2_' + row.index + '" maxlength="2" size="2"  value="' + ac + '"/></td>'
				ac=""
				if (acct.length > 2){ac = acct[2];}
				accHTML += '<td>Dept<br/><input type="text" id="ac_id_part3_' + row.index + '" maxlength="5" size="4"  value="' + ac + '"/></td>'
				ac=""
				if (acct.length > 3){ac = acct[3];}
				accHTML += '<td>Account<br/><input type="text" id="ac_id_part4_' + row.index + '" maxlength="8" size="8"  value="'+  ac + '"/></td>'
				ac=""
				if (acct.length > 4){ac = acct[4];}
				accHTML += '<td>Program<br/><input type="text" id="ac_id_part5_' + row.index + '" maxlength="8" size="8" value="' + ac + '"/></td>'
				ac=""
				if (acct.length > 5){ac = acct[5];}
				accHTML += '<td>Internal<br/><input type="text" id="ac_id_part6_' + row.index + '" maxlength="10" size="10"  value="' +  ac + '"/></td>'
				ac=""
				if (acct.length > 6){ac = acct[6];}
				accHTML += '<td>Proj<br/><input type="text" id="ac_id_part7_' + row.index + '" maxlength="10" size="10"  value="' + ac + '"/></td>'
				ac=""
				if (acct.length > 7){ac = acct[7];}
				accHTML += '<td>Activity<br/><input type="text" id="ac_id_part8_' + row.index + '" maxlength="8" size="8"  value="' + ac + '"/></td>'
				accHTML += '</tr></table>'
				cellElement.innerHTML = accHTML
				
			}
		},
		reservations_grid_save_onClick: function(row){
			this.btn="Save"
			this.checkAcc(row)
			
		},
		checkAcc:function(row){
			this.rowRecord = row.getRecord();
			var rw = row.getIndex()
			if (!brgTest) {
				var test = uc_psAccountCode(
				$('ac_id_part1_' + rw).value,
				$('ac_id_part2_' + rw).value,
				$('ac_id_part3_' + rw).value,
				$('ac_id_part4_' + rw).value,
				$('ac_id_part5_' + rw).value,
				$('ac_id_part6_' + rw).value,
				$('ac_id_part7_' + rw).value,
				$('ac_id_part8_' + rw).value,
				'checkForm', '1', 'SINGLE FUNDED');
			} else {
				var brgAc = $('ac_id_part1_' + rw).value + '-' + $('ac_id_part2_' + rw).value + '-' + $('ac_id_part3_' + rw).value + '-' + $('ac_id_part4_' + rw).value;
				brgAc = brgAc  + '-' + $('ac_id_part5_' + rw).value + '-' + $('ac_id_part6_' + rw).value + '-' + $('ac_id_part7_' + rw).value + '-' + $('ac_id_part8_' + rw).value;
				//Save ac record first
				if (brgAc != "") {
					var acRecord= new Ab.data.Record();
					acRecord.isNew = true;
					acRecord.setValue('ac.ac_id', brgAc);
					try {
						View.dataSources.get('ds_ac_check').saveRecord(acRecord);
					}
					catch (ex) {
						// already exists
					}
				}
				this.checkForm(brgAc); 
				
			}
		},
		
		checkForm:function(acct){
		
			var ac_id=acct.replace("\r\n\r\n", "");
			switch(ac_id){
			case "1":
				View.showMessage(getMessage('error_Account1'));
				return;
			case "2":
				View.showMessage(getMessage('error_Account2'));
				return;
			case "3":
				View.showMessage(getMessage('error_Account3'));
				return;
			case "4":
				View.showMessage(getMessage('error_Account4'));
				return;
			case "5":
				View.showMessage(getMessage('error_Account5'));
				return;
			case "6":
				View.showMessage(getMessage('error_Account6'));
				return;
			case "7":
				View.showMessage(getMessage('error_Account7'));
				return;
			case "8":
				View.showMessage(getMessage('error_Account8'));
				return;
			case "99":
				View.showMessage(getMessage('error_Account99'));
				return;
			case "0":
				View.showMessage(getMessage('error_invalidAccount'));
				return;
			};

			
			if ((ac_id.substr(0,5) == "UCALG") ||
				(ac_id.substr(0,5) == "FHOBO") ||
				(ac_id.substr(0,5) == "ARCTC") ||
				(ac_id == ""))
			{
				this.rowRecord.setValue('wr.ac_id',ac_id);
			}
			else {
				View.showMessage(getMessage('error_Account99'));
				return;
			}
			
			
			var currentWrId = this.rowRecord.getValue('wr.wr_id');
			try{
				this.ds_reservations3.saveRecord(this.rowRecord);
				if (this.btn=="Approve") {
					this.approveRow()
				}
				else {
					View.showMessage('Record Saved', 'Record Saved');
				}
			}
			catch(e){
				View.showMessage('error', 'Error when trying to save the reservation. Error details: cannot save record.', e.message, e.data);
			}
			
			
			
		},
		
	    reservations_grid_deny_onClick: function(row){
			this.rowRecord = row.getRecord();
			this.showInWindow(this.wrReject,{
			height:160,
			width:600,
			closeButton:false
			});
		
			this.wrReject.refresh(null,true);
		},
		
		wrReject_onReject: function(){
			if (!confirm("You are about to Deny this reservation.  Do you want to continue?")){return}
			var currentWrId = this.rowRecord.getValue('wr.wr_id');
			this.rowRecord.setValue('wr.status','Rej');
			var desc = this.wrReject.getFieldValue('wr.description') + '\r\n\r\n' + this.rowRecord.getValue('wr.description');
			this.rowRecord.setValue('wr.description',desc);
			 try{
				this.ds_reservations3.saveRecord(this.rowRecord);
			 }
			 catch(e){
				View.showMessage('error', 'Error when trying to Deny the reservation. Error details: cannot save record - in onDeny.', e.message, e.data);
			 }
			 this.reservations_grid.refresh();
			this.wrReject.closeWindow();
		 
		 //email requestor
		 //TO DO
		 
		 
	    },
		wrReject_onCancel:function(){
			this.wrReject.closeWindow();
		},
		
		reservations_grid_approve_onClick: function(row){
		 // alert ('Approve - pending');
			if (!confirm("You are about to Approve this reservation.  Do you want to continue?")){return}
			this.btn="Approve"
			this.checkAcc(row)
		},
		
		approveRow:function(){

		  //TO DO - bring in functionality from the admin screen
		  
		  var currWrId = this.rowRecord.getValue('wr.wr_id');
		  var newWoId = "";
		   //create wo object
		  var description = this.rowRecord.getValue("wr.description");
		  var dv_id = this.rowRecord.getValue("wr.dv_id");
		  var dp_id = this.rowRecord.getValue("wr.dp_id");
		  var ac_id = this.rowRecord.getValue("wr.ac_id"); 
		  var activity_log_id = this.rowRecord.getValue("wr.activity_log_id");
			 
		  var woObject = {'wo.dv_id':dv_id, 'wo.dp_id':dp_id, 'wo.description':description};
			 
		  //create wr array
		  var wrForWo = [{'wr.wr_id':currWrId}];
		  var result = {};
			 
		 //create new wo; status gets to AA by default
			 try {
			        this.view.openProgressBar();
				    result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveNewWorkorder', woObject, wrForWo,"","");
				    newWoId = result.data["wo_id"];
			
			        this.wr_other_grid.refresh("wr_id = " + currWrId);
					this.wr_other_grid.show(false);
		    	    // create Sub Work for all wr_other line items with other_rs_type = "VEHICLE-WORK"  **Sub Work with status of 'AA'
                    var allWrOtherForThisWrId = this.wr_other_grid.gridRows;
			
			        //fields that are used to populate the new subwork record - we mark it in description as a subwork
					var currType = "";
					var cost_estimated = 0.00;
					var cost_total = 0.00;
					var description = "";
					var date_est_completion = "";
					var vn_id = "";
					var requestor = "";
					var destination_type = "";
					var vehicle_type_req = "";
					var eq_id = "";
					var distance_est = "";
					var ac_id = "";
					var budget_owner = "";
					var dv_id = "";
					var dp_id = "";
					var parameters = null;
					
					for (var i=0; i < allWrOtherForThisWrId.length; i++)
					{
					   currType = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.other_rs_type");
					   if (currType == 'VEHICLE-WORK')
						 {
						  //populate fields for the new subwork that needs to be generated
						  cost_estimated = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.cost_estimated");
						  cost_total = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.cost_total");
						  description = "RESERVATION Sub-Work for Parent Wr Id: " + currWrId + " - " + allWrOtherForThisWrId.items[i].getFieldValue("wr_other.description");
						  date_est_completion = "20" + allWrOtherForThisWrId.items[i].getFieldValue("wr_other.date_used").dateFormat("y-m-d");
						  vn_id = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.vn_id");
						  requestor = this.rowRecord.getValue("wr.requestor"); 
						  destination_type = this.rowRecord.getValue("wr.destination_type"); 
						  vehicle_type_req = this.rowRecord.getValue("wr.vehicle_type_req");
						  eq_id = this.rowRecord.getValue("wr.eq_id");
						  distance_est = this.rowRecord.getValue("wr.distance_est");
						  ac_id = this.rowRecord.getValue("wr.ac_id");
						  budget_owner = this.rowRecord.getValue("wr.budget_owner");
						  dv_id = this.rowRecord.getValue("wr.dv_id");
						  dp_id = this.rowRecord.getValue("wr.dp_id");
						 
						  parameters = {
							 tableName: "wr",
							 fields: toJSON({
							    "wr.wo_id": newWoId,
								"wr.status": 'AA',
								"wr.cost_est_total": cost_estimated,
								"wr.cost_total":cost_total,
								"wr.description": description,
								"wr.date_est_completion": date_est_completion,
								"wr.vn_id": vn_id,
								"wr.requestor": requestor,
								"wr.destination_type":destination_type,
								"wr.vehicle_type_req": vehicle_type_req,
								"wr.distance_est": distance_est,
								"wr.ac_id": ac_id,
								"wr.budget_owner": budget_owner,
								"wr.work_team_id": "FLEET",
								"wr.tr_id": "FLEET",
								"wr.prob_type": "FLEET",
								"wr.dv_id":dv_id,
								"wr.dp_id": dp_id})
						 };
				         result = Workflow.call('AbCommonResources-saveRecord', parameters);
						 
						  //delete the record 
						  var record = [{'wr_other.date_used':date_est_completion, 'wr_other.other_rs_type':'VEHICLE-WORK', 'wr_other.wr_id': currWrId}];
						  result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', record, 'wr_other'); 
						 }//end if
					}//end for
					
					
					//TO DO
					//email requestor
					
					
					 this.view.closeProgressBar();
			}//try wo creation 
			catch (e) {
			    this.view.closeProgressBar();
				Workflow.handleError(e);
			}
		        this.reservations_grid.refresh();
	  
		},
		showInWindow: function (panel, config) {
			View.ensureInViewport(config);
			if (panel.window) {
				panel.window.show();
				if (valueExists(config.x) && valueExists(config.y)) {
					panel.window.setPosition(config.x, config.y)
				}
				panel.afterLayout();
				if (config.restriction) {
					panel.refresh(config.restriction);
				}
				return;
			}
			View.ensureInViewport(config);
			var A = {
				contentEl: panel.getWrapperElementId(),
				height: config.height,
				width: config.width,
				layout: "fit",
				modal: typeof (config.modal) !== "undefined" ? config.modal : true,
				shadow: true,
				autoScroll: true,
				closable: typeof (config.closable) !== "undefined" ? config.closable : true,
				maximizable: typeof (config.maximizable) !== "undefined" ? config.maximizable : true,
				collapsible: typeof (config.collapsible) !== "undefined" ? config.collapsible : true,
				closeAction: "hide",
				bodyStyle: "background-color: white;"
			};
			if((typeof (config.closeButton) !== "undefined" ? config.closeButton : true)){
				A.buttons = [{
					id: "closeButton",
					text: panel.getLocalizedString(View.z_TITLE_CLOSE),
					handler: panel.closeWindow.createDelegate(panel),
					hidden: (valueExists(config.closeButton) && config.closeButton == false),
					hideMode: "visibility"
				}]
			}
			panel.window = new Ext.Window(A);
			panel.window.show();
			if (valueExists(config.x) && valueExists(config.y)) {
				panel.window.setPosition(config.x, config.y)
			} if (valueExists(config.maximize) && config.maximize) {
				panel.window.maximize();
			}
			panel.afterLayout();
			if (config.restriction) {
				panel.refresh(config.restriction);
			}
		}
	})
