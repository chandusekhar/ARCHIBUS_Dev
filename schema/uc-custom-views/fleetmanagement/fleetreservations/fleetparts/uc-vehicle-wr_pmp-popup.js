var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}<br/>{1}<br/>{2}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reservationBoController = View.createController('reservationAdminController', {
	openerView: null,
	
	afterViewLoad: function(){
	  this.openerView = View.getOpenerView();
	  try { 
			 var completeMode = this.view.parameters.completeMode;
			this.reservations_grid.actions.get('generateComplete').show(completeMode)
			this.reservations_grid.addParameter('wo',this.view.parameters.wo);
		} catch(e) {} ;
	},
	
	reservations_grid_onGenerateComplete: function(){
		if (confirm("Do you want to Complete this reservation?  Ensure you have added all Additional Costs and Sub Work Requests")){
			this.generatepms(true)
			this.openerView.panels.get('reservations_form').setFieldValue('wr.status','Com')
			if (this.openerView.panels.get('reservations_form').save()){
				this.openerView.panels.get('reservations_form').show(false,true)
				this.openerView.panels.get('wr_other_grid').show(false,true)
				this.openerView.panels.get('wr_subwork_grid').show(false,true)
				this.openerView.panels.get('reservations_grid').refresh()
				View.closeThisDialog();
			}
			
		}

	},
	
	//?	Creates **Sub Work for the selected rows  and closes the popup 
	reservations_grid_onGenerate: function(){
		if(this.generatepms(false)){
			this.reservations_grid.refresh();
			this.openerView.panels.get("wr_subwork_grid").refresh();  
			this.openerView.panels.get("reservations_form").refresh(); 
		}
	},
	
	generatepms: function(Compl){
		  var neededPanel = this.openerView.panels.get("reservations_form");
		  var currWrId = neededPanel.getFieldValue("wr.wr_id");
		  var currWoId = neededPanel.getFieldValue("wr.wo_id");
		  var currVn_id = neededPanel.getFieldValue("wr.vn_id");
		  var currRequestor = neededPanel.getFieldValue("wr.requestor");
		  var currDestinationType = neededPanel.getFieldValue("wr.destination_type");
		  var currVehicleTypeReq = neededPanel.getFieldValue("wr.vehicle_type_req"); 
		  var currEqId = neededPanel.getFieldValue("wr.eq_id");  
		  var currAcId = neededPanel.getFieldValue("wr.ac_id");
		  var currBudgetOwner= neededPanel.getFieldValue("wr.budget_owner");
		  var currDvId = neededPanel.getFieldValue("wr.dv_id");
		  var currDpId = neededPanel.getFieldValue("wr.dp_id");
		  var currDriver = neededPanel.getFieldValue("wr.driver");
		  //other info for the new request:
		  var currProbType = "FLEET";
		  var selectedRows = this.reservations_grid.getSelectedRows();
		  var tr_id = "FLEET";
		  var ac_id=""
		  var instructions = "";
		  var pmp_id = "";
		  var description = "";
		  var vn_id = "";
		  var requestor = "";
		  var destination_type = "";
		  var vehicle_type_req = "";
		  var ac_id = ""; var eq_id = ""; 
		  var dv_id = "";
		  var dp_id = "";
		  var parameters = null;
		  var result = null;
		  var driver = null;
		  //for each selected row generate a sub work request
		  if (selectedRows.length < 1){
			if (!Compl){
				View.showMessage ("There no selected rows. Please select at least one row for sub work to be generated.");
			}
			 return false;
		   }
		  //View.openProgressBar("Processing Your Request.");
		  try{
		   for (var i = 0; i < selectedRows.length; i++) {
		    tr_id = selectedRows[i]["pmp.tr_id"];
			instructions = selectedRows[i]["pmps.instructions"];
			pmp_id = selectedRows[i]["pmp.pmp_id"];
			description = "RESERVATION Post Sub-Work for Parent Wr Id: " + currWrId + " - " + instructions;
			vn_id = currVn_id;
			requestor = currRequestor; 
			destination_type = currDestinationType; 
			vehicle_type_req = currVehicleTypeReq;
			eq_id = currEqId;
  		    ac_id = currAcId;
			budget_owner = currBudgetOwner;
			dv_id = currDvId;
			dp_id = currDpId;
			driver = currDriver;
						 
			parameters = {
							 tableName: "wr",
							 fields: toJSON({
							    "wr.wo_id": currWoId,
								"wr.status": 'AA',
								"wr.prob_type": 'FLEET',
								"wr.description": description,
								"wr.vn_id": vn_id,
								"wr.requestor": requestor,
								"wr.destination_type":destination_type,
								"wr.vehicle_type_req": vehicle_type_req,
								"wr.ac_id": ac_id,
								"wr.driver": driver,
								"wr.budget_owner": budget_owner,
								"wr.dv_id":dv_id,
								"wr.dp_id": dp_id,
								"wr.eq_id": eq_id,
								"wr.tr_id": tr_id,
								"wr.pmp_id": pmp_id,
								"wr.work_team_id": 'FLEET'
								})
						 };
				         result = Workflow.call('AbCommonResources-saveRecord', parameters);
					  
		      }//end for
	      } //end try
		  
		  catch(e)  {  }
		  
		 // finally {View.closeProgressBar();}
	 
		  return true
		  //refresh openerview panels
		  //this.openerView.panels.get("wr_other_grid").refresh();
		  
		  
		  //close this popup
		  
		},
		
		reservations_grid_onAdd: function(){
		   // this.wrForm.show(true);
		   var pnl=this.openerView.panels.get('reservations_form')
			this.wrForm.refresh(null,true);
			this.wrForm.clear();
			this.wrForm.setFieldValue("wr.prob_type", "FLEET");
			this.wrForm.setFieldValue("wr.wo_id", pnl.getFieldValue("wr.wo_id"));
			this.wrForm.setFieldValue("wr.ac_id", pnl.getFieldValue("wr.ac_id"));
			this.wrForm.setFieldValue("wr.driver", pnl.getFieldValue("wr.driver"));
			this.wrForm.setFieldValue("wr.budget_owner", pnl.getFieldValue("wr.budget_owner"));
			this.wrForm.setFieldValue("wr.status", "AA");
			this.wrForm.setFieldValue("wr.dv_id", pnl.getFieldValue("wr.dv_id"));
			this.wrForm.setFieldValue("wr.dp_id", pnl.getFieldValue("wr.dp_id"));
			this.wrForm.setFieldValue("wr.eq_id", pnl.getFieldValue("wr.eq_id"));
			this.wrForm.setFieldValue("wr.work_team_id", 'FLEET');
		    this.wrForm.showInWindow({
				width: 1150,
				height: 800
			});	
			 
		
		},
		refreshTotals: function(){
			this.openerView.panels.get("wr_subwork_grid").refresh();  
			this.openerView.panels.get("wr_other_grid").refresh();
		}
	/*	
		wrForm_onSave: function(){
		  //create new pmp record
		  this.wrForm.newRecord = true;
		  this.wrForm.save();
		  //create new pmps record for the newly created record
		  var pmp_id = this.wrForm.getFieldValue("pmp.pmp_id");
		  var instructions = this.wrForm.getFieldValue("pmp.pmp_ids_to_suppress");
		  var parameters = null;
		  var result = null;
		  
		  parameters = {
							 tableName: "pmps",
							 fields: toJSON({
							    "pmps.pmps_id": 0,
							    "pmps.pmp_id": pmp_id,
								"pmps.instructions": instructions
								})
						 };
		
		 result = Workflow.call('AbCommonResources-saveRecord', parameters);
		 if (result.code != 'executed') {
					Ab.workflow.Workflow.handleError(result);
				}
		  
		  //refresh the grid
		  this.wrForm.closeWindow();
		  this.reservations_grid.refresh();
	}
	*/
		
	})
