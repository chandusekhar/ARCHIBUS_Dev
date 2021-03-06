var brgTest = false;
var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };

var reservationAdminController = View.createController('reservationAdminController', {

	afterViewLoad: function(){
		this.addVehicleTypeLookupIcon("wr.vehicle_type");
		//this.addVehicleTypeLookupIcon("wr.eq_id");
		this.createWR_OtherGrid()
		this.createWR_SubGrid()
		this.createReservations_grid()
	},
	createReservations_grid :function(){
		this.reservations_grid.afterCreateCellContent = function(row, col, cellElement) {

			if (col.id === "wr.pu") {
				var dtn = new Date()
				var dtpu = new Date(row["wr.pu"] )
				if (dtn>dtpu ){
					cellElement.style.backgroundColor="yellow"
				}

			}
			if (col.id === "wr.do") {
				var dtn = new Date()

				var dtdo = new Date(row["wr.do"] )
				if (dtn>dtdo ){
					cellElement.style.backgroundColor="red"
				}


			}
		};

	},
	createWR_SubGrid :function(){
		this.wr_subwork_grid.afterCreateCellContent = function(row, col, cellElement) {

			if (col.id === "cancel") {
				switch(row["wr.status.raw"]){
					case "Rej":
					case "Clo":
					case "Com":
					case "FWC":
					case "Can":
						cellElement.style.visibility = "hidden";
						break
					//case "Can":
					//	cellElement.firstChild.value="Reopen"
					//	break

				}

			}
		};

	},

	createWR_OtherGrid :function(){
		this.wr_other_grid.afterCreateCellContent = function(row, col, cellElement) {

			if (col.id === "editRecord") {
				if (parseInt(row["wr_other.seq2.raw"]) > 1){
				}
				else {
					cellElement.style.visibility = "hidden";

					if (row["wr_other.seq1.raw"] === "0"){
						//make background dark blue and font white and font bold
						row.row.dom.style.cssText += ";background:#003DF5;font-weight:bold;color:white;";
					}
					else if (row["wr_other.seq2.raw"] === "0"){
						//make background light blue and font bold
						 row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
					}
					else if (row["wr_other.seq2.raw"] === "1"){
						//make background dark silver and font bold
						 row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";

					}
				}
			}

/*
			var state = row[(stateField || "activity_log.state")], link;
			 if (col.id === "assign" && (state == "sub-title" || state === "") ) {
				cellElement.style.visibility = "hidden";
			 }
            if (col.id === "changeState") {
                if(state === ""  || state == "sub-title" || state=="Edit" || state=="Nonedit"){
					if (me.expandList == me.expandList.replace("'" + row["bill_type.s1"].replace(/'/g,"''") + "',","")){
						row.row.dom.style.display = "none";
					}
					if(state == "Edit"){
						row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";
						//row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;text-align:center;";
					}else{
						cellElement.style.visibility = "hidden";
					}


                }
                else{
					if (state == "+" && me.expandList != me.expandList.replace("'" + row["bill_type.s1"].replace(/'/g,"''") + "',","")){
						row[stateField] = "-";
						state = "-";
					}

				    me.configureGridBtn(state, cellElement);
				    row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
				    Ext.get(cellElement).dom.style.cssText += "text-align:center;";
                }
            }else if(state == "sub-title"){
				//link = Ext.get(cellElement).child("a");
				//if(link){
					//link.dom.style.cssText += ";text-decoration:none;color:black;cursor:text;";

				//}
				row.row.dom.style.cssText += ";background:#E0E0E0;color:blue;font-weight:bold;text-align:center;";
				//row.row.dom.style.cssText += ";background:lightblue;font-weight:bold;text-align:center;";
				cellElement.style.textAlign = "left";
			}else if(state === "" || state == "sub-title"){
				row.row.dom.style.display = "none";
			}

*/
        };

	},
	reservations_form_afterRefresh: function() {
		BRG.UI.addNameField('wr_driver_info', this.reservations_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_requestor_info', this.reservations_form, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_budgetowner_info', this.reservations_form, 'wr.budget_owner', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.budget_owner'}, emNameLabelConfig);


	/*	if (this.reservations_form.getFieldValue("wr.date_assigned")=="") {
			var d = new Date();
			var cd = d.getFullYear() + '-'
			if (d.getMonth()+1 < 10) { cd+="0"}
			cd += (d.getMonth()+1) + '-'
			if (d.getDate() < 10) { cd+="0"}
			cd += d.getDate() + ' '

			this.reservations_form.setFieldValue("wr.date_assigned",cd)
		}
	*/
		if (this.reservations_form.getFieldValue("hwr.phone")!="") {
			if (this.reservations_form.getFieldValue("hwr.phone").substring(0,1)=="0") {
				this.reservations_form.setFieldValue("hwr.time_pickup",this.reservations_form.getFieldValue("hwr.phone").substring(1,5))
			}
			else {
				this.reservations_form.setFieldValue("hwr.time_pickup",this.reservations_form.getFieldValue("hwr.phone"))
			}
			if (this.reservations_form.getFieldValue("hwr.time_pickup")=="") {this.reservations_form.setFieldValue("hwr.time_pickup","-")}
		}
		var currentWoId = this.reservations_form.getFieldValue('wr.wo_id');
		var currentWrId = this.reservations_form.getFieldValue('wr.wr_id');

		this.wr_subwork_grid.refresh("wr.wr_id <> " + currentWrId + " and wr.wo_id = " + currentWoId); //subwork is from wr with same wo_id


		this.wr_other_grid.addParameter('wrID', currentWrId);
		this.wr_other_grid.addParameter('woID', currentWoId);
		this.wr_other_grid.refresh()

		if (Ext.isIE) {
           this.addVehicleTypeLookupIcon("wr.vehicle_type");
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
	reservations_form_onSave:function(){
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
		var success = true
		var form = View.getControl('', 'reservations_form');
		form.clearValidationResult();
		var dtpu = new Date(form.getFieldValue('hwr.option1'))
		var dtdo =  new Date(form.getFieldValue('hwr.option2'))

		if (form.getFieldValue('wr.date_assigned') == "" && form.getFieldValue('hwr.time_pickup') == '-'){
			form.setFieldValue('wr.time_assigned',"")
		}
		else {
			if (form.getFieldValue('wr.date_assigned') == ""){
				form.addInvalidField('wr.date_assigned',getMessage('If Time is filled in Date must be filled in '));
				success = false;
			}
			else if (form.getFieldValue('hwr.time_pickup') == '-') {
				form.addInvalidField('hwr.time_pickup',getMessage('If Date is filled in Time must be filled in '));
				success = false;
			}
			else if (success) {
				form.setFieldValue('wr.time_assigned',form.getFieldValue('hwr.time_pickup'))
				dtpu = new Date(form.getFieldValue('wr.date_assigned').replace(/-/g,'/') + " " + form.getFieldValue('hwr.time_pickup'))
			}
		}
		if (form.getFieldValue('wr.date_completed') == "" && form.getFieldValue('hwr.time_dropoff') == '-'){
			form.setFieldValue('wr.time_completed',"")
		}
		else {
			if (form.getFieldValue('wr.date_completed') == ""){
				form.addInvalidField('wr.date_completed',getMessage('Date must be filled in if Time is filled in '));
				success = false;
			}
			else if (form.getFieldValue('hwr.time_dropoff') == '-') {
				form.addInvalidField('hwr.time_dropoff',getMessage('Time must be filled in if Date is filled in'));
				success = false;
			}
			else if (success) {
				form.setFieldValue('wr.time_completed',form.getFieldValue('hwr.time_dropoff'))
				dtdo = new Date(form.getFieldValue('wr.date_completed').replace(/-/g,'/') + " " + form.getFieldValue('hwr.time_dropoff'))
			}
		}
		var msg = 'Please fix the following fields prior to Saving.'
		if (success) {
			if (dtpu>=dtdo){
				msg = 'Dropoff must be after Pickup'
				form.addInvalidField('hwr.time_dropoff',getMessage(msg));
				form.addInvalidField('wr.date_completed',getMessage(msg));
				form.addInvalidField('hwr.time_pickup',getMessage(msg));
				form.addInvalidField('wr.date_assigned',getMessage(msg));
				form.addInvalidField('hwr.option1',getMessage(msg));
				form.addInvalidField('hwr.option2',getMessage(msg));
				msg += ".  Please modify the Actual Pickup or Revised Dropoff dates"
				success=false

			}
		}
		if (!success) {
			var msg1 = form.validationResult.message

			form.validationResult.message =msg
			form.displayValidationResult();
			form.validationResult.message  = msg1

		}
		else {
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
			this.reservations_grid.refresh()

		}
	},
	reservations_form_onAvailable:function(){
		var vehicle_type = reservationAdminController.reservations_form.getFieldValue("wr.vehicle_type");
		var vehicle_type_req = reservationAdminController.reservations_form.getFieldValue("wr.vehicle_type_req");

		var d = new Date();
		var cd = d.getFullYear() + '-'
		if (d.getMonth()+1 < 10) { cd+="0"}
		cd += (d.getMonth()+1) + '-'
		if (d.getDate() < 10) { cd+="0"}
		cd += d.getDate() + ' '
		var start_date = cd //reservationAdminController.reservations_form.getFieldValue("wr.date_pickup");

		cd="";
		if (d.getHours() < 10) { cd+="0"}
		cd +=d.getHours() + ":"
		if (d.getMinutes() < 10) { cd+="0"}
		cd += d.getMinutes()  + ':00'
		var start_time = cd //reservationAdminController.reservations_form.getFieldValue("wr.time_pickup");

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
	validateForm: function(genCosts) {

		var success = true;


		// Check to see if the description is null
		// 2010/03/31 - JJYCHAN
		var form = View.getControl('', 'reservations_form');
		form.clearValidationResult();
		var dtpu = new Date(form.getFieldValue('hwr.option1'))
		var dtdo =  new Date(form.getFieldValue('hwr.option2'))

		if (form.getFieldValue('wr.vehicle_type_req') == "" && !genCosts) {
			form.addInvalidField('wr.vehicle_type_req',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.vehicle_type') == "" && !genCosts) {
			form.addInvalidField('wr.vehicle_type',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('hwr.eq_id') == "" && !genCosts) {
			form.addInvalidField('hwr.eq_id',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.destination') == "" && !genCosts) {
			form.addInvalidField('wr.destination',getMessage('errorRequired'));
			success = false;
		}
		if ((form.getFieldValue('wr.meter_start') == "" || form.getFieldValue('wr.meter_start') <=0) && !genCosts) {
			form.addInvalidField('wr.meter_start',getMessage('errorRequired'));
			success = false;
		}
		if ((form.getFieldValue('wr.distance_est') == "" || form.getFieldValue('wr.distance_est') <=0) && !genCosts) {
			form.addInvalidField('wr.distance_est',getMessage('errorRequired'));
			success = false;
		}

		if (form.getFieldValue('wr.description') == "" && !genCosts) {
			form.addInvalidField('wr.description',getMessage('errorRequired'));
			success = false;
		}

		if (form.getFieldValue('wr.date_assigned') == ""){
			form.addInvalidField('wr.date_assigned',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('hwr.time_pickup') == '-') {
			form.addInvalidField('hwr.time_pickup',getMessage('errorRequired'));
			success = false;
		}
		else if (success) {
			form.setFieldValue('wr.time_assigned',form.getFieldValue('hwr.time_pickup'))
			dtpu = new Date(form.getFieldValue('wr.date_assigned').replace(/-/g,'/') + " " + form.getFieldValue('hwr.time_pickup'))
		}

		if (form.getFieldValue('wr.date_completed') == "" && form.getFieldValue('hwr.time_dropoff') == '-'){
			form.setFieldValue('wr.time_completed',"")
		}
		else {
			if (form.getFieldValue('wr.date_completed') == ""){
				form.addInvalidField('wr.date_completed',getMessage('If Time is filled in Date must be filled in '));
				success = false;
			}
			else if (form.getFieldValue('hwr.time_dropoff') == '-') {
				form.addInvalidField('hwr.time_dropoff',getMessage('If Date is filled in Time must be filled in '));
				success = false;
			}
			else if (success) {
				form.setFieldValue('wr.time_completed',form.getFieldValue('hwr.time_dropoff'))
				dtdo = new Date(form.getFieldValue('wr.date_completed').replace(/-/g,'/') + " " + form.getFieldValue('hwr.time_dropoff'))
			}
		}
		var msg = 'Please fix the following fields prior to Generating Estimate Costs.'
		if (success) {
			if (dtpu>=dtdo){
				msg = 'Dropoff must be after Pickup'
				form.addInvalidField('hwr.time_dropoff',getMessage(msg));
				form.addInvalidField('wr.date_completed',getMessage(msg));
				form.addInvalidField('hwr.time_pickup',getMessage(msg));
				form.addInvalidField('wr.date_assigned',getMessage(msg));
				form.addInvalidField('hwr.option1',getMessage(msg));
				form.addInvalidField('hwr.option2',getMessage(msg));
				msg += ".  Please modify the Actual Pickup or Revised Dropoff dates"
				success=false

			}
		}

		if (!success) {
			var msg1 = form.validationResult.message
			if (genCosts) {
				form.validationResult.message =msg;
			}


			form.displayValidationResult();
			form.validationResult.message  = msg1
			//View.showMessage(getMessage('Please fill in the following required fields.'));
		}
		//form.setFieldValue('activity_log.description', desc);
		return success;
	},
	addVehicleTypeLookupIcon:function(fieldName){
		var field =this.reservations_form.getFieldElement(fieldName);
		var icon = field.nextSibling;
		if (icon) {
			icon.src = "/archibus/schema/ab-core/graphics/icons/application_form.png";
			//icon.title = "Vehicle Availability";
			icon.style.cssText = "height: 22px;top: 3px !important;padding-left: 1px;cursor:pointer;";
			//icon.removeAttribute("disabled");
			//field.style.border = "0px";
			//field.style.backgroundColor = "#FAFAFE";
			Ext.get(icon).removeAllListeners();
			icon.onclick = this.reservations_form_onAvailable;
		}

	},

	/* on PickedUp Click:
	?	status is changed to Issued (I)
    ?	request disappears from screen
	*/

	reservations_form_onPickedUp: function(){
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
		if (!this.validateForm()){return}
		
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

		//save time pickup to time_assigned field
		var selectedPickUpTime = this.reservations_form.getFieldValue("hwr.time_pickup");
		this.reservations_form.setFieldValue("wr.time_assigned", selectedPickUpTime);

		this.reservations_form.setFieldValue("wr.status","I");
		if (this.reservations_form.save()){
			//this.wr_updateSubworkStatus("I"); //update subwork to I status
			this.reservations_form.show(false);
			this.reservations_grid.refresh();
			this.wr_other_grid.show(false);
			this.wr_subwork_grid.show(false);
		}
	},

	/*? On Cancel click:
      ?	Warns the user that they about to Cancel the reservation - also let's them know if any sub wr status = 'I' and if there are costs associated
      ?	Sets status =  'Can'
      ?	updates sub work =  'Can' if status = 'AA', 'S if status = 'I'
	*/
	reservations_form_onCancel: function(){
		var currStatus = "";
		var currId = "";
		var allSubWrIds = "";

		if (confirm("You are about to Cancel this reservation. Proceed?")){
	   //?	Warns the user that they about to Cancel the reservation - also let's them know if any sub wr status = 'I' and if there are costs associated

		  //get all sub wr rows


			var allSubWrForThisWrId = this.wr_subwork_grid.gridRows;
		   //go through them and check to see if any have a status of I. If yes alert the user
			for (var i=0; i < allSubWrForThisWrId.length; i++){
				currStatus = allSubWrForThisWrId.items[i].getFieldValue("wr.status");
				currId = allSubWrForThisWrId.items[i].getFieldValue("wr.wr_id");
			     if (currStatus == 'I')
				 	allSubWrIds = allSubWrIds + " " + currId;

			 }//for

		 if (allSubWrIds != "")
		    if (!confirm("There are sub work entries (with Id(s):" + allSubWrIds + ") for this reservation in Issued status. Proceed?"))
		       return; //second confirm

			var ds = View.dataSources.get(this.reservations_form.dataSourceId);
			var rec = new Ab.data.Record();
			var currWrId = this.reservations_form.getFieldValue("wr.wr_id")
			rec.isNew = false;
			rec.oldValues = new Object();
			rec.setValue('wr.wr_id', currWrId);
			rec.oldValues['wr.wr_id'] =currWrId
			rec.setValue('wr.status', 'Can');
			ds.saveRecord(rec)

			this.wr_updateSubworkStatus("Can");
	        this.reservations_form.show(false);
		    this.reservations_grid.refresh();
		    this.wr_other_grid.show(false);
			this.wr_subwork_grid.show(false);
/*
		this.reservations_form.setFieldValue("wr.status","Can");
	      if (this.reservations_form.save())
	      {
		     this.wr_updateSubworkStatus("Can");
	         this.reservations_form.show(false);
		     this.reservations_grid.refresh();
		     this.wr_other_grid.show(false);
			 this.wr_subwork_grid.show(false);
           }
*/
		 }//first confirm


	},

	//?	Cancel Row level button
    //?	updates sub work =  'Can' if status = 'AA', 'S if status = 'I'
	wr_subwork_grid_cancel_onClick: function(row){

	   var rowRecord = row.getRecord();
	   var currWrId = row.getRecord().getValue('wr.wr_id');

	   if (confirm("Are you sure you want to cancel request with id: " + currWrId + " ? ")) {
			var currStatus = row.getRecord().getValue('wr.status');
			this.wr_updateSubworkStatusForOneRequest(currWrId, currStatus, "Can");
			this.wr_subwork_grid.refresh();
	   }

	},

	wr_subwork_grid_view_onClick: function(row){

	   var rowRecord = row.getRecord();
	   var wr_id = row.getRecord().getValue('wr.wr_id');

	  	window.open('uc-wr-manager-printCFVehicle.axvw?handler=com.archibus.config.ActionHandlerDrawing&wr.wr_id='+wr_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');


	},


	//method used to update the subwork requests to Can if original status is AA or S if it is I
	wr_updateSubworkStatus: function (status){
	    var parameters = null;
		var result = null;
		var currWrId = "";
		var currStatus = "";


	    var allSubWrForThisWrId = this.wr_subwork_grid.gridRows;
		//var allSubWrForThisWrId = containingGrid.gridRows;
		for (var i=0; i < allSubWrForThisWrId.length; i++){
		    currWrId = allSubWrForThisWrId.items[i].getFieldValue("wr.wr_id");
			currStatus = allSubWrForThisWrId.items[i].getFieldValue("wr.status");
			this.wr_updateSubworkStatusForOneRequest(currWrId, currStatus, status);
		}
	},

	wr_updateSubworkStatusForOneRequest: function(currWrId, currStatus, targetStatus)
	{
	  var parameters = null;
	  var result = null;
	  if (currStatus == 'I' && targetStatus == 'Can')
			    targetStatus  = 'S';
      if (currStatus == 'AA' && targetStatus == 'Can')
			    targetStatus  = 'Can';
	  parameters = {
							 tableName: "wr",
							 fields: toJSON({
							    "wr.wr_id": currWrId,
								"wr.status": targetStatus})
						  };
	  result = Workflow.call('AbCommonResources-saveRecord', parameters);
	},

	//wr_other_onEditRecord: function(){
	wr_other_grid_editRecord_onClick: function(row){
		var rowRecord = row.record
	  // var rowRecord = this.wr_other_grid.rows[this.wr_other_grid.selectedRowIndex];
	  //Opens wr_other popup in edit mode
	   var currWrId = rowRecord["wr_other.wr_id"];
	   var currType = rowRecord["wr_other.other_rs_type"];
	   var currDateUsed = rowRecord["wr_other.date_used.key"];

	   View.openDialog('uc-vehicle-wr_other-popup.axvw', {'wr_other.wr_id':currWrId, 'wr_other.other_rs_type': currType, 'wr_other.date_used':currDateUsed}, false, {
			width: 650,
			height: 450,
			closeButton: false,
			addMode: false,
			hideQtyUsedActualCosts:true
			});
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

	 wr_other_grid_onAdd: function()
	 {
	    //if (!this.reservations_form.save())
		//   return;
	   //Opens wr_other popup in add mode
	   var currRest = this.reservations_form.restriction["wr.wr_id"];

	   View.openDialog('uc-vehicle-wr_other-popup.axvw', {'wr_other.wr_id':currRest}, false, {
			width: 650,
			height: 450,
			closeButton: false,
			addMode: true,
			addType: 'miscellaneous',
			hideQtyUsedActualCosts:true
			});
	 }



})

/*
function updateVehicle() {
	var form = View.getControl('', 'reservations_form');
	var vId = form.getFieldValue('eq_id');


	var vRecord =  UC.Data.getDataRecord('vehicle', ['eq_id'], "vehicle_id='"+vId.replace(/'/g, "''")+"'");
	if (vRecord != null) {
		form.setFieldValue('wr.eq_id',vRecord['vehicle.eq_id'].l);
	}
	else {
		form.setFieldValue('wr.eq_id',"");
	}
}

*/