

// *****************************************************************************
// View controller object for the Details tab.
// *****************************************************************************
var detailsTabController = View.createController('detailsTabController', {
	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
	},
	
	wr_create_details_afterRefresh: function() {

	},
	
	// ***************************************************************************
	// Fills the information on the details with information from the Info Tab.
	// ***************************************************************************
	prefillInfo: function() {
		// Pre-fill fields with em information.
		
		// Cannot use the "user" object because the request may be completed
		// for someone else.
		// Get the information from the "my_info_form" in the prev tab.
		var infoForm = View.getControl('','my_info_form');

		this.wr_create_details.setFieldValue('activity_log.requestor', infoForm.getFieldValue('em.em_id'));
		this.wr_create_details.setFieldValue('activity_log.dv_id', infoForm.getFieldValue('em.dv_id'));
		this.wr_create_details.setFieldValue('activity_log.dp_id', infoForm.getFieldValue('em.dp_id'));
		this.wr_create_details.setFieldValue('activity_log.phone_requestor', infoForm.getFieldValue('em.phone'));
		this.wr_create_details.setFieldValue('activity_log.bl_id', infoForm.getFieldValue('em.bl_id'));
		this.wr_create_details.setFieldValue('activity_log.fl_id', infoForm.getFieldValue('em.fl_id'));
		this.wr_create_details.setFieldValue('activity_log.rm_id', infoForm.getFieldValue('em.rm_id'));
	},
	
	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	submitRequest: function() {
		if (this.validateForm()) {
			var ds = View.dataSources.get(this.wr_create_details.dataSourceId);
			var record = this.wr_create_details.getRecord();
			var recordValues = ds.processOutboundRecord(record).values;
			
			// get the activity_log_id if it's from a "created" record.
			// Mostly for error checking as it should always be new.
			var activity_log_id = 0;
			var activity_log_id_value = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value
			if ( activity_log_id_value != undefined && activity_log_id_value != '') {
				activity_log_id = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value;
			}
			
			var parameters = {
				tableName: 'activity_log',
				fieldName: 'activity_log_id',
				'activity_log.activity_log_id': activity_log_id,
				fields: toJSON(recordValues)
			};
			
			// Note: Can check for Duplication/Similar requests here.
			
			// Submit Request
			try {
				Workflow.call('AbBldgOpsHelpDesk-submitRequest', parameters);
				this.wr_create_details.actions.get("submit").enableButton(false);  // diable the submit button so it doesn't get submitted twice.
				
				// Switch to next tab after setting the restriction.
				var requestor = recordValues["activity_log.requestor"].replace("'", "''");
				var date_requested = recordValues["activity_log.date_requested"];
				var rest = "wr_id = (SELECT max(wr_id) FROM wr WHERE requestor='"+requestor+"' and date_requested ='"+date_requested+"')";
				
				var tabsPanel = View.getControl('', 'wr_create_tabs');
				tabsPanel.setTabRestriction('create_wr_report', rest);
				tabsPanel.refreshTab('create_wr_report');
				tabsPanel.selectTab('create_wr_report');
				
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	// ***************************************************************************
	// Validates the form fields before submitting the save to the server.
	//
	// Parameters:
	//   table_name - The table to retrieve the records from.
	//   field_names - The columns to retrieve from table_name.
	//   restriction - (Optional) The restriction to apply to the query.
	// ***************************************************************************
	validateForm: function() {
		var success = true;
		
		// Check the Account Code - Insert into actual field if valid
		
		
		var test = uc_psAccountCode(
				'UCALG',
				'10',
				'62100',
				'10005',
				'00672',
				'CI7029509',
				'RT703929',
				'CLBAK',
				'return_me');
		
		
		// Construct ac_id from the text fields
		var ac_id = $('ac_id_part1').value + $('ac_id_part2').value + $('ac_id_part3').value + $('ac_id_part4').value
			+ $('ac_id_part5').value + $('ac_id_part6').value + $('ac_id_part7').value + $('ac_id_part8').value;
		ac_id.replace(" ", "");
		
		
		var ac_rest = "ac_id = '"+ac_id+"'";
		if (ac_id == "" || this.ds_ac_check.getRecord(ac_rest).values["ac.ac_id"] != undefined) {
			this.wr_create_details.setFieldValue('activity_log.ac_id', ac_id);
		}
		else {
			success = false;
			this.wr_create_details.fields.get('account_code_fld').setInvalid(getMessage('error_invalidAccount'));	
			// setInvalid doesn't work??  Will show Message box for now...
			View.showMessage(getMessage('error_invalidAccount'));
		};
		
		//Check the Building Code - Building Code must be entered before request can be created.
		var bl_id = this.wr_create_details.getFieldValue('activity_log.bl_id');
		if (bl_id == "") {
			success = false;
			View.showMessage("Building Code is required");
		}
		
		return success;
	}
});



function checkAcct() {
	var test = uc_psAccountCode('UCALG','10','62100','10005','00672','CI7029509','RT703929','CLBAK','return_me');

}

function return_me(req) {
	if (req == 1) {
		alert("This PS Account code exists");
	}
	else {
		alert("This PS Account Code does not exist");
	}
}


// Calls the submitRequest function in the controller.
function submitRequest()
{
	detailsTabController.submitRequest();
}

