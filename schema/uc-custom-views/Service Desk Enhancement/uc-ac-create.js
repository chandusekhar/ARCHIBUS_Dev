
var ucAcCreateController = View.createController('ucAcCreateController', {
	wrId: '',
	
	afterViewLoad: function() {
	},

	afterInitialDataFetch: function() {
	}
});

function validate() {		
	var acReport = View.panels.get("ac_create_report");
	var acVal = acReport.getFieldValue("ac.ac_id");
	
 	if (acVal == '') {
		View.message("Please enter a Account Code before submitting.");
		return false;
	} 
	
	acReport.save();
	var wrId = View.controllers.items[0]['wrId'];
	var docCheck = View.controllers.items[0]['docCheck'];
	
	var record = View.dataSources.get('update_wr_ds').getRecord("wr_id='"+wrId+"'");
	record.values['wr.ac_id'] = acVal;
	View.dataSources.get('update_wr_ds').saveRecord(record);
	
	var parentView = View.getOpenerView();
	
	if (docCheck != '') {
		parentView.parentViewPanel.loadView("uc-wr-create-mwr-report.axvw?doc=y", "wr_id='"+wrId+"'", false);
	} else {
		parentView.parentViewPanel.loadView("uc-wr-create-mwr-report.axvw", "wr_id='"+wrId+"'", false);
	}
}

function closeDialog() {		
	var acReport = View.panels.get("ac_create_report");
	var acVal = acReport.getFieldValue("ac.ac_id");
	var wrId = View.controllers.items[0]['wrId'];
	var docCheck = View.controllers.items[0]['docCheck'];
	
	if (acVal == '') {
		View.confirm("Are you sure there is no Account Code?", function(button) { 
			if (button == 'yes') { 
				var parentView = View.getOpenerView();
				if (docCheck != '') {
					parentView.parentViewPanel.loadView("uc-wr-create-mwr-report.axvw?doc=y", "wr_id='"+wrId+"'", false);
				} else {
					parentView.parentViewPanel.loadView("uc-wr-create-mwr-report.axvw", "wr_id='"+wrId+"'", false);
				}
//				parentView.closeDialog();
			} 
		});
	}
}