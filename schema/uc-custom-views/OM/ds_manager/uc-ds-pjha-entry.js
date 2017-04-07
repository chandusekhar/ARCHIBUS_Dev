var pjhaTabController = View.createController('pjhaTabController', {

	afterViewLoad: function() {
		var wr_id = window.location.parameters['wrId'];
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);

		
	},
	
	pjhaFormPanel_afterRefresh: function() {
		var wr_id = window.location.parameters['wrId'];
		//alert("AFterrefresh");
		this.pjhaFormPanel.clear();
		this.pjhaFormPanel.setFieldValue('uc_pjha_value.wr_id', wr_id);
	},
	
	afterInitialDataFetch: function() {
		this.inherit();
	},
	
	selectDate:function() {
		var enteredDate = this.pjhaFormPanel.getFieldValue("uc_pjha_value.pjha_submit_date");
		if (!enteredDate) {
			View.showMessage("Please enter a date.");
			return false;
		} else {
			var tabPanel = View.panels.get('pjha_tabs');
			tabPanel.selectTab('pjha_activity_select');
		}
	},
	
	startOver:function() {
		var tabPanel = View.panels.get('pjha_tabs');
		tabPanel.selectTab('pjha_date');
	},
	
	selectActivities:function() {
		var selectedRecords = this.pjhaActivityPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No activities were selected.");
			return false;
		} else {
			//var tabPanel = View.panels.get('pjha_tabs');
			//tabPanel.selectTab('pjha_hazard_show');
		}
		
	},
	
	submitPJHA: function() {
		
		var saveToDS = this.pjhaFormPanel.getDataSource();
		var selectedRecords = this.pjhaControlPanel.getSelectedRecords();
		
		
		if (selectedRecords.length == 0) {
			View.showMessage("No controls were selected.");
			return;
		}
		
		View.openProgressBar("Submitting PJHA. Please wait...");

		
		var dateSubmit=this.pjhaFormPanel.getFieldValue("uc_pjha_value.pjha_submit_date");
		var wr_id=this.pjhaFormPanel.getFieldValue("uc_pjha_value.wr_id");
		var cf_id=this.pjhaFormPanel.getFieldValue("uc_pjha_value.cf_id");

		
		for (var i = 0; i < selectedRecords.length; i++) {
			var record=selectedRecords[i];

			var saveRecord = new Ab.data.Record({
					'uc_pjha_value.wr_id': wr_id,
					'uc_pjha_value.hazcat_id': record.getValue("uc_pjha_control.hazcat_id"),
					'uc_pjha_value.control_id':record.getValue("uc_pjha_control.control_id"),
					'uc_pjha_value.pjha_submit_date':dateSubmit,
					'uc_pjha_value.cf_id':cf_id},
					true); // true means new record
					
			this.pjha_wr_ds1.saveRecord(saveRecord);
			View.showMessage("PJHA submitted");
			
			
			var tabPanel = View.panels.get('pjha_tabs');
			tabPanel.selectTab('pjha_date');
			
		
		}

		View.closeProgressBar();
	},
	
	
	testOnClick: function() {
		//alert("OnClick");
	},
});
