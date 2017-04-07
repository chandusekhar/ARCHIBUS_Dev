		
var reservationManController = View.createController('reservationManController', {
	openerView: null,
	
	afterViewLoad: function()
	{
	  this.openerView = View.getOpenerView().getOpenerView();
	},
	
	//?	Creates **Sub Work for the selected rows  and closes the popup 
	reservations_form_onSave: function()
		{
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
		  //other info for the new request:
		  var pmp_id = "";
		  var description = this.reservations_grid.getFieldValue("wr.description");
		  var cause_type = this.reservations_grid.getFieldValue("wr.cause_type");
		  var vn_id = "";
		  var requestor = "";
		  var destination_type = "";
		  var vehicle_type_req = "";
		  var ac_id = ""; var eq_id = ""; 
		  var dv_id = "";
		  var dp_id = "";
		  var parameters = null;
		  var result = null;
		  //for each selected row generate a sub work request
		  View.openProgressBar("Processing Your Request.");
		  try
		  {
			description = "RESERVATION Post Manual Sub-Work for Parent Wr Id: " + currWrId + " - " + description;
			vn_id = currVn_id;
			requestor = currRequestor; 
			destination_type = currDestinationType; 
			vehicle_type_req = currVehicleTypeReq;
			eq_id = currEqId;
  		    ac_id = currAcId;
			budget_owner = currBudgetOwner;
			dv_id = currDvId;
			dp_id = currDpId;
						 
			parameters = {
							 tableName: "wr",
							 fields: toJSON({
							    "wr.wo_id": currWoId,
								"wr.status": 'A',
								"wr.prob_type": 'FLEET',
								"wr.description": description,
								"wr.cause_type": cause_type,
								"wr.vn_id": vn_id,
								"wr.requestor": requestor,
								"wr.destination_type":destination_type,
								"wr.vehicle_type_req": vehicle_type_req,
								"wr.ac_id": ac_id,
								"wr.budget_owner": budget_owner,
								"wr.dv_id":dv_id,
								"wr.dp_id": dp_id,
								"wr.eq_id": eq_id,
								"wr.tr_id": 'FLEET',
								"wr.pmp_id": pmp_id
								})
						 };
				         result = Workflow.call('AbCommonResources-saveRecord', parameters);
					  
	      } //end try
		  
		  catch(e)  {  }
		  
		  finally {View.closeProgressBar();}
	     
		  //update current wr status to Com
		/* parameters = {
		 tableName: "wr",
		 fields: toJSON({
				"wr.wr_id": currWrId,
				"wr.wo_id": currWoId,
				"wr.status": 'Com'})
				};
		  result = Workflow.call('AbCommonResources-saveRecord', parameters);
		  */
		  //refresh openerview panels
		 /* this.openerView.panels.get("wr_other_grid").show(false);
		  this.openerView.panels.get("wr_subwork_grid").show(false);  
		   this.openerView.panels.get("reservations_form").show(false); 
		  this.openerView.panels.get("reservations_grid").refresh();
		  
		  //close this dialog
		  View.closeThisDialog();*/
		}
	})
