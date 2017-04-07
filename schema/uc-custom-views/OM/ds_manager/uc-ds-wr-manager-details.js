// CHANGE LOG:
// 2010/04/15 - EWONG - ISSUE 94 - Remove/Hide the Work Package Tab when only one wr in package.
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var managerDetailsController = View.createController('managerDetailsController', {
	infoTabController: null,
	wr_id: null,

	//afterInitialDataFetch: function() {
	afterViewLoad: function() {

		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);


		var wr_id = window.location.parameters['wrId'];
		this.wr_id = wr_id;
		//this.details_tabs.refresh('wr_id='+wr_id);

		this.details_tabs.setTabRestriction('det_info', 'wr_id='+wr_id);
		//this.details_tabs.setTabRestriction('det_costs', 'wr_id='+wr_id);
		//this.details_tabs.setTabRestriction('det_invoice', 'wr_id='+wr_id);

		if (this.details_tabs.findTab("det_audit_log") != null) {
			this.details_tabs.setTabRestriction('det_audit_log', 'wr_id='+wr_id);
		}

		this.details_tabs.setTabRestriction('det_sub_req', "wo_id=(SELECT wo_id FROM wr WHERE wr_id="+wr_id+")");

		this.details_tabs.addEventListener('beforeTabChange', this.details_tabs_beforeTabChange.createDelegate(this));

		this.details_tabs.showTab('det_sub_req', this.checkEnableWrkPkgTab())

		//this.details_tabs.findTab('det_sub_req').setTitle('<span style="color:red;font-weight:bold;">Work Package</span>');
	},

	/**
	 * Event Handler for the beforeTabChange event.
	 */
	details_tabs_beforeTabChange: function(tabPanel, currentTabName, newTabName)
	{
		var changeTab = true;
		var thisController = this;


		if (currentTabName == "det_info")
		{
			if (thisController.infoTabController != null && thisController.infoTabController.checkFormChanged())
			{
				changeTab = false;

				// confirm with user if changes should be saved or abandoned
				View.confirm(getMessage("confirmChangeTabSave"), function(button) {
					if (button == 'yes') {
						if (thisController.infoTabController.checkAcctAndSave()) {
							// save successful, change tab
							// Note: cannot automatically change tab due to the async nature
							//       of the check account function so the save function does not
							//       wait to return.
							tabPanel.selectTab(newTabName);
						}
					}
					else
						tabPanel.selectTab(newTabName);
				});
			}
		}
		else if (currentTabName == "det_info_vehicle")
		{
			if (thisController.infoTabControllerVehicle != null && thisController.infoTabControllerVehicle.checkFormChanged())
			{
				changeTab = false;

				// confirm with user if changes should be saved or abandoned
				View.confirm(getMessage("confirmChangeTabSave"), function(button) {
					if (button == 'yes') {
						if (thisController.infoTabControllerVehicle.checkAcctAndSave()) {
							// save successful, change tab
							// Note: cannot automatically change tab due to the async nature
							//       of the check account function so the save function does not
							//       wait to return.
							tabPanel.selectTab(newTabName);
						}
					}
					else
						tabPanel.selectTab(newTabName);
				});
			}
		}

		return changeTab;
	},

	// *************************  NOT  USED      *********************************
	// Returns whether the tab should be hidden depending on the number of reqs
	// in the package.
	// ***************************************************************************
	checkEnableWrkPkgTab: function()
	{
		// Check if there are any related sub-requests.  If so, show the Sub-Request Tab
		var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wo_id=(SELECT wo_id FROM wr WHERE wr_id="+this.wr_id+")");
		if (wrRecords != undefined && wrRecords.length > 1) {
			this.details_tabs.findTab('det_sub_req').setTitle('<span style="color:red;font-weight:bold;">Work Package</span>');
			return true;
		}
		else {
			return false;
		}
	},

	// ***************************************************************************
	// Function to show/hide the Work Package tab depending on the number
	// of work request in the package.
	// ***************************************************************************
	showHideWrkPkgTab: function()
	{
		//this.details_tabs.showTab('det_sub_req', this.checkEnableWrkPkgTab())
		// Check if there are any related sub-requests.  If so, show the Sub-Request Tab
		var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wo_id=(SELECT wo_id FROM wr WHERE wr_id="+this.wr_id+")");
		if (wrRecords != undefined && wrRecords.length > 1) {
			this.details_tabs.findTab('det_sub_req').setTitle('<span style="color:red;font-weight:bold;">Work Package</span>');
			return true;
		}
		else {
			return false;
		}
	}
});
