var controller = View.createController('scenarioCtrl',{
	vnId:"",
	vnComp:"",

	rVnId:"",
    isNewRecord: false,
	
	afterViewLoad:function(){
		var parameters = {
			tableName: 'afm_users',
			fieldNames: toJSON(['afm_users.vn_id']),
			restriction: "afm_users.user_name = '" + View.user.name  + "' AND afm_users.email = '" + View.user.email + "'"
		};
		
		var vnResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (vnResult.code == 'executed' && vnResult.data != "undefined" && vnResult.data.records[0]){
			rVnId = vnResult.data.records[0]['afm_users.vn_id'];
		}
		
		

		var parameters = {
			tableName: 'vn',
			fieldNames: toJSON(['vn.vn_id', 'vn.company']),
			restriction: "vn.vn_id = '" + rVnId.replace(/'/g, "''")  + "'"
		};


		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			this.vnId = result.data.records[0]['vn.vn_id'];
			this.vnComp = result.data.records[0]['vn.company'];
			
		}

//this.vnId = '3M CANADA COMPAN';

		var whichMode = this.view.parameters.mode;

		switch (whichMode){
			case 'newRecord':{
				this.bill_form.actions.get("new").show(false);
			
				this.bill_line_report.restriction = "1=2";
			
				break;
			}

			case 'editRecord':{
				//make fields readonly
				this.bill_form.actions.get("new").show(true);
			
		 
				break;
			}
		}
	
	},
	
	bill_line_form_afterRefresh: function(){
		var selectedVnId = this.bill_form.getFieldValue("bill.vn_id");
	   this.bill_line_form.setFieldValue("bill_line.vn_id", selectedVnId);
	   this.makeButtonsEnabled()
	    this.bill_line_form.setFieldLabel("bill_line.qty_energy", this.bill_form.getFieldValue("bill_type.bill_type_id"));
	 
	},
	
	bill_form_onSubmit: function(){
	
		//Check to see if the 
		if (!confirm("Do you want to Submit this bill. Once Submitted the bill cannot be edited.")){return}
		
		var oldStat = this.bill_form.getFieldValue("bill.status")
		this.bill_form.setFieldValue("bill.status","Pending Approval")
		if (this.saveData()){
			//Need to close the bill_line form and open the grid
			this.bill_line_form.show(false,true)
			this.bill_form.refresh();
		}
		else {
			this.bill_form.setFieldValue("bill.status",oldStat)
		}
	},

	
	bill_form_afterRefresh: function(){
		this.makeButtonsEnabled()
		if (this.bill_form.getFieldValue("bill_type.bill_type_id") !="") {
			this.bill_form.setFieldLabel("bill.qty_energy", this.bill_form.getFieldValue("bill_type.bill_type_id"));
		}
		if (this.bill_form.newRecord){
			//default the status to Approved or Pending Approval
			//this.bill_form.setFieldValue('bill.status', this.status);
			this.bill_form.setFieldValue('bill.vn_id',this.vnId);


			//default payment due date to todays date
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!

			var yyyy = today.getFullYear();
			if(dd<10){dd='0'+dd} 
			if(mm<10){mm='0'+mm} 
			today = mm+'/'+dd+'/'+yyyy;
			this.bill_form.setFieldValue('bill.date_due',today);
			
		}
		else {
		//	this.bill_line_report.refresh("bill_line.vn_id='" + this.bill_form.getFieldValue("bill.vn_id").replace(/'/g, "''") + "' and bill_line.bill_id='" + this.bill_form.getFieldValue("bill.bill_id").replace(/'/g, "''") + "'")
		}
		
	},
	
	bill_form_onNew: function(){
		var restriction = this.bill_form.restriction;
		var billCodeValue = $('bill_form_bill.bill_id').value;
		var billType = $('bill_form_bill.bill_type_id').value;
		this.bill_line_form.setFieldValue("bill_line.bill_id", billCodeValue.replace ('%',''));
		var maxLineItem = this.getMaxValue("bill_line","bill_line_id","bill_id='" + billCodeValue.replace(/'/g, "''") + "'");
		var nextBillLineId = parseInt(maxLineItem);
		
		if (isNaN(nextBillLineId)) {
			nextBillLineId = 1;
			this.bill_line_form.setFieldValue("bill_line.bill_line_id", nextBillLineId); //set the next bill line item id to be isnull(max(bill_line_id) +
		} else { 
			this.bill_line_form.setFieldValue("bill_line.bill_line_id", nextBillLineId+1); //set the next bill line item id to be isnull(max(bill_line_id) + 1),1)
		}
		
		$('bill_line_form_bill_line.bill_type_id').value = billType;
		$('bill_line_form_bill_line.bill_type_id').disabled = true;
	
	},
	
	getMaxValue: function(table_name, field_name, restriction, raw){

		var retVal = null;

		var parameters ={
			tableName: table_name,
			fieldNames: toJSON([field_name]),
			restriction: toJSON(restriction)
		};

		var result = BRG.Common.callWorkflow('AbCommonResources-getDataRecords', parameters);
		if (result != null) {
		    var count = result.data.records.length-1;
			var record = result.data.records[count];
			if (typeof(record) != 'undefined') {
				var fullFieldName = table_name + "." + field_name;
				retVal = (record[fullFieldName] == null ? null : record[fullFieldName]);

				var rawVal = (raw == null || raw) ? 'n' : 'l';
				retVal = typeof(retVal) == 'object' ? retVal[rawVal] : retVal;
			}
		}

		return retVal;
	},
	
    selectStream: function(){
	
		var selectedVnId = this.bill_form.getFieldValue("bill.vn_id");

		View.selectValue(
			'bill_form',
			'Stream',
			['bill.vn_ac_id'],
			'bill_type',
			['bill_type.bill_type_id'],
			['bill_type.bill_type_id',  'bill_type.description'],
			"bill_type.activity_id = 'AbRiskES1' and exists (select 1 from vn_ac a inner join bill_unit u on u.bill_type_id=a.vn_ac_id and u.status=1 where a.vn_ac_id=bill_type.bill_type_id and a.vn_id='" + selectedVnId.replace(/'/g, "''") + "')",
			this.onSelectStream,
			true,
			true,
			null,
			null,
			null,'grid'
		); //tree does not restrict
	
	
	
	},
	
    selectStreamUnit: function(){
		var selectedVnId = this.bill_form.getFieldValue("bill.vn_ac_id");

		 View.selectValue(
			'bill_line_form',
			'Stream Unit',
			['bill_line.bill_unit_id'],
			'bill_unit',
			['bill_unit.bill_unit_id'],
			['bill_unit.bill_unit_id',  'bill_unit.description'],
			"bill_unit.bill_type_id in (select vn_ac_id from bill where vn_ac_id ='" + selectedVnId.replace(/'/g, "''") + "') and bill_unit.status=1",
			null,
			true,
			true,
			null,
			null,
			null,'grid'); //tree does not restrict
	 
	
	},
	
   onSelectStream: function(fieldName,selectedValue,previousValue){
/*		if (selectedValue != null && selectedValue != '')
		{
			//get bl_id from vn_acloc and then get site_id from bl
			var bl_id = BRG.Common.getDataValue('uc_vn_acloc','bl_id', "vn_ac_id='"+selectedValue+"'", true);
			var site_id = BRG.Common.getDataValue('bl','site_id', "bl_id='"+bl_id+"'", true);
			if (site_id != null)
			   View.panels.get("bill_form").setFieldValue('bill.site_id',site_id);
			if (bl_id != null)
			   View.panels.get("bill_form").setFieldValue('bill.bl_id',bl_id);
		}
*/
   },
   
   afterStreamTyped: function(){
     var selectedValue = View.panels.get("bill_form").getFieldValue("bill.vn_ac_id");
	 this.onSelectStream('',selectedValue,'');
   },
	
	
/*	selectBuilding: function(){
		 var bill_site_id = null;
		 var rest = " 1=1 ";
		 try { bill_site_id = this.bill_form.getFieldValue("bill.site_id"); } catch (e) {}
		 
		 if (bill_site_id != null)
			 rest = "bl.site_id = '" + bill_site_id + "'";
			 
		 View.selectValue(
			'bill_form',
			'Building',
			['bill.bl_id'],
			'bl',
			['bl.bl_id'],
			['bl.bl_id',  'bl.name', 'bl.site_id'],
			rest,
			null,
			true,
			true, null, null,null,'grid'); //tree does not restrict
	
    },
*/
	selectTimePeriod: function(){
		//get from to dates
		 var date_start = this.bill_form.getFieldValue("bill.date_service_start");
		 var date_end = this.bill_form.getFieldValue("bill.date_service_end");
		 
		 if (!date_start)
		  {
			View.showMessage('Please select a value for Date Service Starts');
		   }
			
		if (!date_end)
		  {
			View.showMessage('Please select a value for Date Service Ends');
			return;
		  }
		  
		 var startI = date_start.split("-");
		 var time_periodI = startI[0] + "-"+ startI[1];
		 
		 var startE = date_end.split("-");
		 var time_periodE = startE[0] + "-"+ startE[1];
		 
		 var rest = "time_period >= '" + time_periodI + "' and time_period <= '" + time_periodE + "'";
		 
		  View.selectValue(
			'bill_form',
			'Period',
			['bill.time_period'],
			'energy_time_period',
			['energy_time_period.time_period'],
			['energy_time_period.time_period'],
			rest,
			null,
			true,
			true, null, null,null,'grid'); //tree does not restrict
	
	},
	
/*	bill_line_select_location: function(){
	  //show locations only for the current vn_ac_id - if another location is picked an invalid location is thrown
	  var currentVnAcId = this.bill_form.getFieldValue("bill.vn_ac_id");
	  var rest = " vn_ac_id like '" + currentVnAcId + "'";
	 
	  View.selectValue(
		'bill_line_form',
		'Location',
		['bill_line.loc_id'],
		'uc_vn_acloc',
		['uc_vn_acloc.loc_id'],
		['uc_vn_acloc.loc_id', 'uc_vn_acloc.bl_id', 'uc_vn_acloc.fl_id', 'uc_vn_acloc.rm_id'],
		rest,
		null,
		true,
		true, null, null,null,'grid'); //tree does not restrict
	},
*/	
	saveData: function(){
		var newRec = this.bill_form.newRecord
		var selectedStream  = this.bill_form.getFieldValue("bill.vn_ac_id");
		var selectedVn  = this.bill_form.getFieldValue("bill.vn_id");
		this.bill_form.setFieldValue("bill.bill_type_id", selectedStream);
		this.bill_form.setFieldValue("bill.vn_id", selectedVn);
		if (this.bill_form.save()){
			this.makeButtonsEnabled()
			var openerView = View.getOpenerView();
			openerView.panels.get("wpPanel").refresh();
			if (newRec) {
				this.bill_line_report.refresh("bill_line.vn_id='" + this.bill_form.getFieldValue("bill.vn_id").replace(/'/g, "''") + "' and bill_line.bill_id='" + this.bill_form.getFieldValue("bill.bill_id").replace(/'/g, "''") + "'")
			}
			
			return true
		}

		return false	 
	
	},
	
	validateAndSaveForm: function(){
		var currentDiverted = this.bill_line_form.getFieldValue("bill_line.diverted");
		var currDiverted = parseInt(currentDiverted, 10);
		if (currDiverted > 100 || currDiverted < 0){
			View.showMessage("Please enter a value between 0 and 100 for Diverted.");
			return;
		}

		//validate bill_unit_id is active
		var billUnitId = this.bill_line_form.getFieldValue("bill_line.bill_unit_id");
		var billTypeId = this.bill_form.getFieldValue("bill.vn_ac_id");

		var parameters = {
			tableName: 'bill_unit',
			fieldNames: toJSON(['bill_unit.status']),
			restriction: "bill_unit.bill_unit_id = '" + billUnitId + "' and bill_unit.bill_type_id = '" + billTypeId + "'"
		};

		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			if (result.data.records[0]['bill_unit.status'] == 'Inactive') {
				View.showMessage("Please select a Stream Unit that is active.");
				return;
			}
		}

		
		//save form
		if (this.bill_line_form.save()){
			//roll data up
			rollUp();
			this.bill_form.refresh();
			this.bill_line_report.refresh();
			this.bill_line_form.refresh();
			this.bill_line_report.show(false,true)
			var openerView = View.getOpenerView();
			openerView.panels.get("wpPanel").refresh();
			
		}
		
	},
	makeButtonsEnabled: function(){
		var showBtn = this.bill_form.getFieldValue("bill.status") == 'Created' || this.bill_form.getFieldValue("bill.status") == 'Rejected'
		this.bill_form.actions.get("save").show(showBtn);
		this.bill_line_form.actions.get("save").show(showBtn);
		
		if (this.bill_form.newRecord){showBtn=false};
		this.bill_form.actions.get("new").show(showBtn );
		
		if (showBtn) {
			showBtn = false
			
			var parameters = {
				tableName: 'bill_line',
				fieldNames: toJSON(['bill_line.bill_id']),
				restriction: "bill_line.qty>0 and bill_line.vn_id='" + this.bill_form.getFieldValue("bill.vn_id").replace(/'/g, "''") + "' and bill_line.bill_id='" + this.bill_form.getFieldValue("bill.bill_id").replace(/'/g, "''") + "'"
			};
		
			var vnResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
			if (vnResult.code == 'executed' && vnResult.data != "undefined" && vnResult.data.records[0]){
				showBtn=true
			}
		
		}
		this.bill_form.actions.get("submit").show(showBtn);
	}
});
function rejectBill(context){
	$('bill.status').value = 'Rejected';
}


function checkServiceGap(){
	var controller = this;
	var billId = $('bill_form_bill.bill_id').value;
	var vnId = $('bill_form_bill.vn_id').value;
	var vnAcId = $('bill_form_bill.vn_ac_id').value;
	var date_service_start = $('bill_form_bill.date_service_start').value;
	if(date_service_start.length == 9 ){
		date_service_start = 0 + date_service_start;
	}
	var start_time_period = $('bill_form_bill.time_period').value;

	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-checkServiceGap', billId, vnId, vnAcId, date_service_start, start_time_period);
	if (result.code == 'executed') {
		if(result.value == false){
			var msg = getMessage('msg_service_gap');
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					controller.operDataType = 'BILL';
					return true;
					//controller.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills');
				}
			});
		}else{
			return true;
		}
	}
}

function rollUp(){
//try
//{
	var billId = $('bill_line_form_bill_line.bill_id').value;
	var vnId = $('bill_line_form_bill_line.vn_id').value;
	var billLineId = $('bill_line_form_bill_line.bill_line_id').value;
	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-addNewBillLineItem', billId, vnId, billLineId);
	if (result.code == 'executed' && result.value == true) {
		return true;
	}

	else{
		View.showMessage(getMessage("msg_roll_up").replace('{0}', billId));
	}
	//}
	//catch(e) {}
}

/**
 * Print Bill
 * Print Paginated Report of Bill and its lines
 */
 
function printBill(){
		//a paginated view name 
		var reportViewName = "ab-energy-bill-print.axvw";
		var panel = View.getControl('', 'bill_form');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		restriction.addClause('bill.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		var anotherRestriction = new Ab.view.Restriction();
		anotherRestriction.addClause('bill_line.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		anotherRestriction.addClause('bill_line.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'ds_bill': restriction, 'ds_bill_line': anotherRestriction};
		
		//parameters
		var parameters = null;
		
		//passing restrictions
		View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
	}
	

