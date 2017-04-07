var brgTest = false;

var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };


var reservationAdminController = View.createController('reservationAdminController', {

	afterViewLoad: function(){
		this.addVehicleTypeLookupIcon("wr.vehicle_type");
		this.createReservations_grid()
		//this.addVehicleTypeLookupIcon("wr.eq_id");
	},
	createReservations_grid :function(){
		this.reservations_grid.afterCreateCellContent = function(row, col, cellElement) {

			if (col.id === "hwr.option1") {
				var dtn = new Date()
				var dtpu = new Date(row["hwr.option1"] )
				if (dtn>dtpu ){
					cellElement.style.backgroundColor="yellow"
				}

			}
			if (col.id === "hwr.option2") {
				var dtn = new Date()

				var dtdo = new Date(row["hwr.option2"] )
				if (dtn>dtdo ){
					cellElement.style.backgroundColor="red"
				}


			}
		};

	},

	reservations_form_afterRefresh: function() {
		BRG.UI.addNameField('wr_driver_info', this.reservations_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_requestor_info', this.reservations_form, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_budgetowner_info', this.reservations_form, 'wr.budget_owner', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.budget_owner'}, emNameLabelConfig);
//		BRG.UI.addNameField('report_vehicle_info', this.reservations_form, 'wr.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'wr.eq_id'}, vehicleIdLabelConfig);
		if (Ext.isIE) {
            this.addVehicleTypeLookupIcon("wr.vehicle_type");
		//	this.addVehicleTypeLookupIcon("wr.eq_id");
        }
		
		var acct = this.reservations_form.getFieldValue('wr.ac_id').split('-');
		$('ac_id_part1').value = 'UCALG';
		for (var a = 2; a <= 8 ;a++){
			$('ac_id_part' + a.toString()).value ="";
		}
		for (var a = 1; a <= acct.length ;a++){
			if (acct[a-1] !="") {$('ac_id_part' + a.toString()).value = acct[a-1];}
		}
		
		
	},


	reservations_form_onAvailable:function(){
		var vehicle_type = reservationAdminController.reservations_form.getFieldValue("wr.vehicle_type");
		var vehicle_type_req = reservationAdminController.reservations_form.getFieldValue("wr.vehicle_type_req");
		var start_date = reservationAdminController.reservations_form.getFieldValue("wr.date_pickup");
		var start_time = reservationAdminController.reservations_form.getFieldValue("wr.time_pickup");
		var end_date = reservationAdminController.reservations_form.getFieldValue("wr.date_dropoff");
		var end_time = reservationAdminController.reservations_form.getFieldValue("wr.time_dropoff");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("vehicle_type",vehicle_type);
		restriction.addClause("vehicle_type_req",vehicle_type_req);
		restriction.addClause("start_date",start_date);
		restriction.addClause("start_time",start_time);
		restriction.addClause("end_date",end_date);
		restriction.addClause("end_time",end_time);


		View.openDialog("uc-vehicle-types.axvw", restriction, false, {
			width: 1050,
			height: 800,
			closeButton: false
		});

	},

	addVehicleTypeLookupIcon:function(fieldName){
		var field =this.reservations_form.getFieldElement(fieldName);
		var icon = field.nextSibling;
		if (icon) {
			icon.src = "/archibus/schema/ab-core/graphics/icons/application_form.png";
			//icon.title = "Vehicle Availability";
			icon.style.cssText = "height: 22px;top: 3px !important;padding-left: 1px;cursor:pointer;";
			icon.removeAttribute("disabled");
			//field.style.border = "0px";
			//field.style.backgroundColor = "#FAFAFE";
			Ext.get(icon).removeAllListeners();
			icon.onclick = this.reservations_form_onAvailable;
		}

	},

	//	status is changed to Rejected (Rej)
    //  request disappears from screen
	//  email requestor
	reservations_form_onDeny: function(){
		var ds = View.dataSources.get(this.reservations_form.dataSourceId);
		var currWrId = this.reservations_form.getFieldValue("wr.wr_id")
		var rec = new Ab.data.Record();
		rec.isNew = false;
		rec.oldValues = new Object();
		rec.setValue('wr.wr_id', currWrId);
		rec.oldValues['wr.wr_id'] =currWrId
		rec.setValue('wr.status', 'Rej');
		ds.saveRecord(rec)
  	  //this.reservations_form.setFieldValue("wr.status","Rej");
	 // if (this.reservations_form.save()){
	      this.reservations_form.show(false);
		  this.wr_other_grid.show(false);
		  this.reservations_grid.refresh();
	      //email requestor
         this.sendUCEmail('requestor');
	  // }
	},

	wr_other_grid_onGenerate_cost: function(){
		if (!this.validateForm(true)) {return}
		if (this.reservations_form.save()){
			if (confirm("Do you want to generate estimated cost lines for this reservation? This will overwrite the existing cost lines for the current reservation if any.")){
				var currWrId = this.reservations_form.getFieldValue("wr.wr_id");
				this.cleanVehicleResTypesFromWrOther(currWrId);
				this.generateEstimateWrOtherDs.addParameter('theWr'," wr on v.vehicle_type_id in (wr.vehicle_type_req,wr.vehicle_type) and wr.wr_id=" + currWrId);
				var records = this.generateEstimateWrOtherDs.getRecords();
				this.generateEstimatedCosts(records, currWrId);
				this.wr_other_grid.refresh();
			}
		}
	},
	validateForm: function(genCosts) {

		var success = true;


		// Check to see if the description is null
		var form = View.getControl('', 'reservations_form');
		form.clearValidationResult();

		if (form.getFieldValue('wr.description') == "" && !genCosts) {
			form.addInvalidField('wr.description',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.vehicle_type_req') == "") {
			form.addInvalidField('wr.vehicle_type_req',getMessage('errorRequired'));
			success = false;
		}

		if (form.getFieldValue('wr.destination') == "" && !genCosts) {
			form.addInvalidField('wr.destination',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.passenger_count') == "" && !genCosts) {
			success = false;
		}
		if (form.getFieldValue('wr.passenger_count') < 1 && form.getFieldValue('wr.passenger_count') != "" && !genCosts) {
			form.addInvalidField('wr.passenger_count',"Must be greater than 0");
			success = false;
		}
		if (form.getFieldValue('wr.distance_est') < 1 && form.getFieldValue('wr.distance_est') != "" ) {
			form.addInvalidField('wr.distance_est',getMessage('errorRequired'));
			success = false;
		}

		if (form.getFieldValue('wr.date_pickup') == ""){
			form.addInvalidField('wr.date_pickup',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.date_dropoff') == '') {
			form.addInvalidField('wr.date_dropoff',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.time_dropoff') == '-') {
			form.addInvalidField('wr.time_dropoff',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.time_pickup') == '-') {
			form.addInvalidField('wr.time_pickup',getMessage('errorRequired'));
			success = false;
		}


		//var addDys = parseInt(advancedHours/24)
		//advancedHours = advancedHours - (addDys*24)

		var pd=""
		if (form.getFieldValue('wr.date_pickup') != "" && form.getFieldValue('wr.time_pickup') != '-') {
			pd = form.getFieldValue('wr.date_pickup') + ' '
			if (form.getFieldValue('wr.time_pickup').length <5) {pd +="0"}
			pd += form.getFieldValue('wr.time_pickup')
		}
		var dd=""
		if (form.getFieldValue('wr.date_dropoff') != "" && form.getFieldValue('wr.time_dropoff') != '-') {
			var dd = form.getFieldValue('wr.date_dropoff')  + ' '
			if (form.getFieldValue('wr.time_dropoff').length <5) {dd +="0"}
			dd+= form.getFieldValue('wr.time_dropoff')
		}
		if (pd >= dd && pd != "" && dd != "") {
			form.addInvalidField('wr.date_pickup',"Dropoff must be after Pickup");
			form.addInvalidField('wr.time_pickup',"Dropoff must be after Pickup");
			form.addInvalidField('wr.date_dropoff',"Dropoff must be after Pickup");
			form.addInvalidField('wr.time_dropoff',"Dropoff must be after Pickup");
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}

		if (!success) {
			var msg = form.validationResult.message
			if (genCosts) {
				form.validationResult.message ='Please fix the following fields prior to Generating Estimate Costs.';
			}


			form.displayValidationResult();
			form.validationResult.message  = msg
		}
		return success;
	},
	
	
	
	reservations_form_onSave: function(){
		if (!brgTest) {
			var test = uc_psAccountCode(
				$('ac_id_part1').value,
				$('ac_id_part2').value,
				$('ac_id_part3').value,
				$('ac_id_part4').value,
				$('ac_id_part5').value,
				$('ac_id_part6').value,
				$('ac_id_part7').value,
				$('ac_id_part8').value,
				'saveRec', '1', 'SINGLE FUNDED');
		} else {
			var brgAc = $('ac_id_part1').value + '-' + $('ac_id_part2').value + '-' + $('ac_id_part3').value + '-' + $('ac_id_part4').value;
			brgAc = brgAc  + '-' + $('ac_id_part5').value + '-' + $('ac_id_part6').value + '-' + $('ac_id_part7').value + '-' + $('ac_id_part8').value;
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
			this.saveRec(brgAc); 
			
		}
	},
	saveRec:function(acct){
		var parsed_ac_id = $('ac_id_part1').value +
					$('ac_id_part2').value +
					$('ac_id_part3').value +
					$('ac_id_part4').value +
					$('ac_id_part5').value +
					$('ac_id_part6').value +
					$('ac_id_part7').value +
					$('ac_id_part8').value;
		parsed_ac_id.replace(" ", "");
		if ((parsed_ac_id=="" || parsed_ac_id == "UCALG") ) {
			//View.showMessage("Account Code is required to submit.");
			//return  false;
			this.reservations_form.setFieldValue('wr.ac_id', "");
		}
		else {
			var ac_id=acct.replace("\r\n\r\n", "");
			var ac_rest = "ac_id = '"+ac_id+"'";
			switch(ac_id)
			{
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
				this.reservations_form.setFieldValue('wr.ac_id', ac_id);
			}
			else
			{
				View.showMessage(getMessage('error_Account99'));
				return;
			};
		}
	
		this.reservations_form.save()
	},
	
	

	/*
	if wr_other reservation line items ( other_rs_type = "VEHICLE-RESERVE" )
	do not exist generate them **wr_other
    exists and are different to the **wr_other calculation, ask if they should be recalculated
	*/
     reservations_form_onApprove: function(){
		if (!brgTest) {
			var test = uc_psAccountCode(
				$('ac_id_part1').value,
				$('ac_id_part2').value,
				$('ac_id_part3').value,
				$('ac_id_part4').value,
				$('ac_id_part5').value,
				$('ac_id_part6').value,
				$('ac_id_part7').value,
				$('ac_id_part8').value,
				'checkForm', '1', 'SINGLE FUNDED');
		} else {
			var brgAc = $('ac_id_part1').value + '-' + $('ac_id_part2').value + '-' + $('ac_id_part3').value + '-' + $('ac_id_part4').value;
			brgAc = brgAc  + '-' + $('ac_id_part5').value + '-' + $('ac_id_part6').value + '-' + $('ac_id_part7').value + '-' + $('ac_id_part8').value;
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
	 
		if (!this.validateForm()) {return}
	   //move data from time pickup to time_assigned and from time dropoff to time_completed
	   var pnl=this.reservations_form
	   
	   
	   //check to see if the ac_id entered is null
	   
		var parsed_ac_id = $('ac_id_part1').value +
					$('ac_id_part2').value +
					$('ac_id_part3').value +
					$('ac_id_part4').value +
					$('ac_id_part5').value +
					$('ac_id_part6').value +
					$('ac_id_part7').value +
					$('ac_id_part8').value;
		parsed_ac_id.replace(" ", "");

		//if parsed is null then change ac_id to null.
		
		if ((parsed_ac_id=="" || parsed_ac_id == "UCALG") ) {
			//View.showMessage("Account Code is required to submit.");
			//return  false;
			this.reservations_form.setFieldValue('wr.ac_id', "");
		}
		else {
			var ac_id=acct.replace("\r\n\r\n", "");
			var ac_rest = "ac_id = '"+ac_id+"'";
			switch(ac_id)
			{
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
				this.reservations_form.setFieldValue('wr.ac_id', ac_id);
			}
			else
			{
				View.showMessage(getMessage('error_Account99'));
				return;
			};
			
		};

	
	   
	   var currTimePickup = pnl.getFieldValue("wr.time_pickup");
	   var currTimDropOff =  pnl.getFieldValue("wr.time_dropoff");
	   pnl.setFieldValue("wr.time_assigned", currTimePickup);
	   pnl.setFieldValue("wr.time_completed", currTimDropOff);

	   var records = this.wr_other_grid.rows;
	   var existsR = false;
	   var countR = 0; //should be 4 if all are generated
	   var costEstimatedR = 0; //keeps track of the cost for the lines already generated
	   var costEstimated = 0; //keeps track of the cost for the lines already generated
	   var costEstimatedE = 0; //keeps track for the estimated cost of the new lines

	   for (var i = 0; i < records.length; i++){
			if (records[i]["wr_other.other_rs_type.key"] == 'VEHICLE-RES'){
				countR ++; //to keep track of how many costs are generated
				costEstimatedR = costEstimatedR + parseFloat(records[i]["wr_other.cost_estimated"]); //get the costs from the ones already there
				if (costEstimatedR.isNaN) costEstimatedR = 0;

			}
			else {
				costEstimated = costEstimated + parseFloat(records[i]["wr_other.cost_estimated"]); //get the costs from the ones already there
				if (costEstimated.isNaN) costEstimatedR = 0;
			}
			if (records[i]["wr_other.other_rs_type.key"] == 'VEHICLE-WORK' && pnl.getFieldValue("hwr.eq_id") == ""){
				alert("A vehicle must be entered to Approve Reservations with Sub Work requests")
				return false
			}
	    }


		//if no records in wr_other for this wr_id generate them
		//get current wr_id

		var currWrId = pnl.getFieldValue("wr.wr_id");
		//this.generateEstimateWrOtherDs.addParameter('theWrId',currWrId);

		var wrSql = " (select null wr_id, " + pnl.getFieldValue('wr.free_km') + " free_km"
		wrSql += ",'" + pnl.getFieldValue('wr.vehicle_type').replace(/'/g, "''") + "' vehicle_type"
		wrSql += ",'" + pnl.getFieldValue('wr.vehicle_type_req').replace(/'/g, "''") + "' vehicle_type_req"
		wrSql += ",'" + pnl.getFieldValue('wr.date_pickup') + "' date_pickup"
		wrSql += ",'1899-12-30 " + pnl.getFieldValue('wr.time_pickup') + "' time_pickup"
		wrSql += ",'" + pnl.getFieldValue('wr.date_dropoff') + "' date_dropoff"
		wrSql += ",'1899-12-30 " + pnl.getFieldValue('wr.time_dropoff') + "' time_dropoff"
		wrSql += "," + pnl.getFieldValue('wr.distance_est') + " distance_est"
		wrSql += ") wr on v.vehicle_type_id in (wr.vehicle_type_req,wr.vehicle_type)"
		this.generateEstimateWrOtherDs.addParameter('theWr',wrSql);
		//this.generateEstimateWrOtherDs.addParameter('theWr'," wr on v.vehicle_type_id in (wr.vehicle_type_req,wr.vehicle_type) and wr.wr_id=" + currWrId);
		var records = this.generateEstimateWrOtherDs.getRecords();
		if (records.length > 0) {
			var parameters = null;
			for (var i = 0; i < records.length; i++){
				var cost_estimated = records[i].values['wr_other.cost_estimated'];
				costEstimatedE = costEstimatedE + parseFloat(records[i].values['wr_other.cost_estimated']); //get the cost for the new ones
				if (costEstimatedE.isNaN) costEstimatedE = 0;
			}
		}

	    if (countR !=4){
			if (countR !=0){this.cleanVehicleResTypesFromWrOther(currWrId);}
            this.generateEstimatedCosts(records, currWrId);
		    costEstimatedR = costEstimatedE;
		}
    	else {
		 //compare costs and if they are not the same ask if they should be generated
		 if (costEstimatedE != costEstimatedR)
		     if (confirm("Current Estimated Costs are different than the Calculated Estimated Costs. Do you want to Re-Generate the Estimated Costs?")){
			    this.cleanVehicleResTypesFromWrOther(currWrId);
			    this.generateEstimatedCosts(records, currWrId);
			    costEstimatedR = costEstimatedE;
			 }
	    }//else

		if (parseFloat(costEstimatedR) + parseFloat(costEstimated) <= 250){
		     var newWoId = "";
		     //create wo object
		     var description = pnl.getFieldValue("wr.description");
			 var dv_id = pnl.getFieldValue("wr.dv_id");
			 var dp_id = pnl.getFieldValue("wr.dp_id");
			 var ac_id = pnl.getFieldValue("wr.ac_id");
			 var activity_log_id = pnl.getFieldValue("wr.activity_log_id");

			 var woObject = {'wo.dv_id':dv_id, 'wo.dp_id':dp_id, 'wo.description':description};

			 //create wr array
			 var wrForWo = [{'wr.wr_id':currWrId}];
			 var result = {};

			if (pnl.save()){

			 //create new wo; status gets to AA by default
			 try {
			        this.view.openProgressBar();
				    result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveNewWorkorder', woObject, wrForWo,"","");
				    newWoId = result.data["wo_id"];

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

					for (var i=0; i < allWrOtherForThisWrId.length; i++){
					   currType = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.other_rs_type");
					   if (currType == 'VEHICLE-WORK'){
						  //populate fields for the new subwork that needs to be generated
						  cost_estimated = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.cost_estimated");
						  cost_total = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.cost_total");
						  description = "RESERVATION Sub-Work for Parent Wr Id: " + currWrId + " - " + allWrOtherForThisWrId.items[i].getFieldValue("wr_other.description");
						  date_est_completion = "20" + allWrOtherForThisWrId.items[i].getFieldValue("wr_other.date_used").dateFormat("y-m-d");
						  vn_id = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.vn_id");
						  requestor = pnl.getFieldValue("wr.requestor");
						  destination_type = pnl.getFieldValue("wr.destination_type");
						  vehicle_type_req = pnl.getFieldValue("wr.vehicle_type_req");
						  eq_id = pnl.getFieldValue("wr.eq_id");
						  distance_est = pnl.getFieldValue("wr.distance_est");
						  ac_id = pnl.getFieldValue("wr.ac_id");
						  budget_owner = pnl.getFieldValue("wr.budget_owner");
						  dv_id = pnl.getFieldValue("wr.dv_id");
						  dp_id = pnl.getFieldValue("wr.dp_id");

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
				pnl.show(false);
		        this.wr_other_grid.show(false);
		        this.reservations_grid.refresh();
			}//if (this.reservations_form.save())
		 }//if <=250
		 else {
		    /*
			?	set status to Review On Hold (Rev)
			?	email budget owner
			*/
			var budget_owner_selected = pnl.getFieldValue("wr.budget_owner");
			if (budget_owner_selected== ""){
			  View.showMessage("Please select a budget owner name since this reservations requires budget owner approval.");
			  return;
			}
			pnl.setFieldValue("wr.status","Rev");
			if (pnl.save()){
			    		pnl.show(false);
		                this.wr_other_grid.show(false);
		                this.reservations_grid.refresh();
			  }
		  }


	},//function

	cleanVehicleResTypesFromWrOther: function(currWrId){
		var allWrOtherForThisWrId = this.wr_other_grid.gridRows;
		var date_est_completion = "";
		var currType = "";

		for (var i=0; i < allWrOtherForThisWrId.length; i++){
			currType = allWrOtherForThisWrId.items[i].getFieldValue("wr_other.other_rs_type");
			if (currType == 'VEHICLE-RES'){
				//populate fields for the new subwork that needs to be generated
				date_est_completion = "20" + allWrOtherForThisWrId.items[i].getFieldValue("wr_other.date_used").dateFormat("y-m-d");

				var record = [{'wr_other.date_used':date_est_completion, 'wr_other.other_rs_type':'VEHICLE-RES', 'wr_other.wr_id': currWrId}];
				try {
					result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', record, 'wr_other')
				}
				catch (ex) {

				}
			}
		}

	},

	//function that generates estimated costs
	generateEstimatedCosts: function(records, currWrId){
		   //add records to wr_other
	   for (var i = 0; i < records.length; i++){
		 var other_rs_type = records[i].values['wr_other.other_rs_type'];
		 var date_used = "20" + records[i].values['wr_other.date_used'].dateFormat("y-m-d");
		 var units_used = records[i].values['wr_other.units_used'];
		 var qty_est = records[i].values['wr_other.qty_est'];
		 var cost_estimated = records[i].values['wr_other.cost_estimated'];
		 var description = records[i].values['wr_other.description'];
		 parameters = {
		 tableName: "wr_other",
		 fields: toJSON({
				"wr_other.wr_id": currWrId,
				"wr_other.other_rs_type": other_rs_type,
				"wr_other.date_used": date_used,
				"wr_other.units_used": units_used,
				"wr_other.qty_est": qty_est,
				"wr_other.cost_estimated": cost_estimated,
				"wr_other.cost_total":cost_estimated,
				"wr_other.qty_used": qty_est,
				"wr_other.description": description})
				};
		  var result = Workflow.call('AbCommonResources-saveRecord', parameters);
	   }
	},

	/*function that sends the emails

	    /**
     * Sends an email to the specified recipients using a template from the messages table.
     *
     * @param activityId The activity_id of the message template from the messages table.
     * @param referencedBy The referenced_by field of the message template from the messages table.
     * @param bodyMessageCode  The message_id of the message template for the body of the email.
     * @param subjectMessageCode The message_id of the message template for the subject of the email.
     * @param tableName  The table name for the record being used to fill the message template.
     * @param keyField  The primary key field name for the record being used to fill the message template.
     * @param keyValue  The primary key value of the record used to fill the template.
     * @param axvwLink  The axvw page used for the {link} parameter in the template.
     * @param email   Semi-comma separated list of email recipients.

		public void sendEmail(String activityId, String referencedBy, String bodyMessageCode, String subjectMessageCode,
	 String tableName, String keyField, String keyValue, String axvwLink, String email) {
		}
	*/
	sendUCEmail: function(emailtype)
	{
	  var theRequestor = this.reservations_form.getFieldValue("wr.requestor");
	  var targetEmail = BRG.Common.getDataValue("afm_users","email","user_name='" + theRequestor + "'");

	  switch (emailtype)
	  {
	    case 'requestor':
		       {
				try {
				//the following line might need updating
				  var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
				   'UC_FLEET_RES_DENY_REQUESTOR_EMAIL_BODY','UC_FLEET_RES_DENY_REQUESTOR_EMAIL_SUBJECT','wr','wr_id',this.reservations_form.getFieldValue('wr.wr_id'),
				   'login.axvw', targetEmail);
				 }
				 catch (ex) {
				    this.view.showMessage ('There was an error when trying to send the Requestor email. ' + ex.code + '  ' + ex.message+ ' . Email is going to ' + targetEmail);
				 }
                break;
			   }//

       }//switch

	 },

	 wr_other_grid_addRequest: function(type){
	   //Opens wr_other popup in add mode
	   var currRest = this.reservations_form.getFieldValue("wr.wr_id");

	   View.openDialog('uc-vehicle-wr_other-popup.axvw', {'wr_other.wr_id':currRest}, false, {
			width: 650,
			height: 450,
			closeButton: false,
			addMode: true,
			addType: type,
			hideQtyUsedActualCosts: true
			});
	 },


	wr_other_EditRecord: function(){

	   var rowRecord = this.wr_other_grid.rows[this.wr_other_grid.selectedRowIndex];
	  //Opens wr_other popup in edit mode
	   var currWrId = rowRecord["wr_other.wr_id"];
	   var currType = rowRecord["wr_other.other_rs_type"];
	   var currDateUsed = rowRecord["wr_other.date_used.key"];

	   View.openDialog('uc-vehicle-wr_other-popup.axvw', {'wr_other.wr_id':currWrId, 'wr_other.other_rs_type': currType, 'wr_other.date_used':currDateUsed}, false, {
			width: 650,
			height: 450,
			closeButton: false,
			addMode: false
			});
	},

	 /**
	 * Helper function to create a Work Order for the Work Request if it doesn't
	 * already exists.
	 *
	 * Parameters:
	 *   status (optional) - Sends the status of the wr.  Use when status updated,
	 *                       panel has not been refreshed.
	 */
	createWo: function(status) {

		// create WO and add it to the WR if the wo_id is null
		var created = false;
		var record = this.reservations_form.record;
		var woId = record.getValue('wr.wo_id');
		var wrId = record.getValue('wr.wr_id');
        var status = record.getValue('wr.status');

		if (woId == ''){
				var wr_id = this.reservations_form.getFieldValue('wr.wr_id');

				var parameters = {
					wrid: wr_id,
					status: status
				};


				try {
					var result = Workflow.call('AbBldgOpsOnDemandWork-approveIssueWorkOrder', parameters);

					created = true;
					// update the cached data with the returned wo (not working, workflow not returning wo_id)
					//record.setValue('wr.wo_id', result.data.wo_id);

					// refresh
					this.reservations_form.refresh();
				}
				catch (e) {
					Workflow.handleError(e);
				}
		}

		return created;
	}//end create wo



})

/*
function updateVehicle() {
	var form = View.getControl('', 'reservations_form');
	var vId = form.getFieldValue('wr.eq_id');


	var vRecord =  UC.Data.getDataRecord('vehicle', ['eq_id'], "vehicle_id='"+vId.replace(/'/g, "''")+"'");
	if (vRecord != null) {
		form.setFieldValue('wr.eq_id',vRecord['vehicle.eq_id'].l);
	}
	else {
		form.setFieldValue('wr.eq_id',"");
	}
}
*/

