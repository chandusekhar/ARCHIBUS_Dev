// CHANGE LOG:
// 2010/04/15 - EWONG - ISSUE 94 - Remove/Hide the Work Package Tab when only one wr in package.
// 2010/04/19 - JJYCHAN - ISSUE 116 - Added code to remove top buttons

var managerDetailsController = View.createController('managerDetailsController', {
	infoTabController: null,
	infoTabControllerVehicle: null,
	wr_id: null,

	//afterInitialDataFetch: function() {
	afterViewLoad: function() {

		var sectionLabels = document.getElementsByName("sectionLabels");
		 for (var i = 0, len = sectionLabels.length; i < len; i++) {
					this.removeTextChildNodes(sectionLabels[i]);
					var td = sectionLabels[i].parentNode;
					this.removeTextChildNodes(td);
					var tr = td.parentNode;
					tr.deleteCell(0);
					td.colSpan = 3;
					td.width = '100%';
					td.style.padding = "0px";
		}

		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);


		var wr_id = window.location.parameters['wrId'];
		this.wr_id = wr_id;
		//this.details_tabs.refresh('wr_id='+wr_id);

		this.details_tabs.setTabRestriction('det_info', 'wr_id='+wr_id);

		var restriction = new Ab.view.Restriction();
		restriction.addClause("wr.wr_id", wr_id, "=");

		this.details_tabs.setTabRestriction('det_info_vehicle', restriction);
		//this.details_tabs.setTabRestriction('det_info_vehicle', 'wr_id='+wr_id);
		this.details_tabs.setTabRestriction('det_costs', 'wr_id='+wr_id);
		this.details_tabs.setTabRestriction('det_invoice', 'wr_id='+wr_id);
		this.details_tabs.setTabRestriction('det_audit_log', 'wr_id='+wr_id);
		this.details_tabs.setTabRestriction('det_sub_req', "wo_id=(SELECT wo_id FROM wr WHERE wr_id="+wr_id+")");

		this.details_tabs.addEventListener('beforeTabChange', this.details_tabs_beforeTabChange.createDelegate(this));
		this.details_tabs.addEventListener('afterTabChange', this.details_tabs_afterTabChange.createDelegate(this));

		this.details_tabs.showTab('det_info', this.checkEnableInfoTab());
		this.details_tabs.showTab('det_info_vehicle', this.checkEnableVehicleTab());
		this.details_tabs.showTab('det_sub_req', this.checkEnableWrkPkgTab());

		//this.details_tabs.findTab('det_sub_req').setTitle('<span style="color:red;font-weight:bold;">Work Package</span>');

	},

	removeTextChildNodes:function(element){
		var node =  undefined;
		var i = (element.childNodes.length)-1;
		for (;i>-1;i--){
			node = element.childNodes[i];
			if ((node!=undefined) && (node.nodeName=="#text")){
				element.removeChild(node);;
			}
		}
	},

	details_tabs_afterTabChange: function(tabPanel, selectedTabName){
		if (selectedTabName == "det_doc") {
			if (docCntrl.docPkey == this.wr_id){return};
			docCntrl.docTitle = "Documents";
			docCntrl.docPkey= this.wr_id;
			var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wr_id="+this.wr_id+" AND work_team_id = 'FLEET'");
			if (wrRecords != undefined && wrRecords.length > 0) {
				docCntrl.docTable='wr';
				docCntrl.docPkeyLabel = ['wr','Work Request'];
				rest = "uc_docs_extension.table_name='wr' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "'"
			}
			else {
				docCntrl.docTable='wrhwr';
				docCntrl.docPkeyLabel = ['wrhwr','Work Request'];
				rest = "uc_docs_extension.table_name='wrhwr' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "'"
			}
			tabPanel.restriciton = ""
			this.doc_grid.refresh(rest)
		}
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

	checkEnableInfoTab: function()
	{
		// Check if there are any related sub-requests.  If so, show the Sub-Request Tab
		var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wr_id="+this.wr_id+" AND work_team_id <> 'FLEET'");
		if (wrRecords != undefined && wrRecords.length > 0) {
			this.details_tabs.findTab('det_info').setTitle('<span style="color:red;font-weight:bold;">Info-Basic</span>');
			var tabPanel = View.panels.get('details_tabs');
			tabPanel.selectTab('det_info');
			return true;
		}
		else {
			return false;
		}
	},

	checkEnableVehicleTab: function()
	{
		// Check if FLEET
		//var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "ISNULL(wo_id,0)=(SELECT wo_id FROM wr WHERE wr_id="+this.wr_id+" and ISNULL(eq_id,'XAYBZC') in (select eq_id from vehicle))");
		var wrRecords = UC.Data.getDataRecords('wr', ['wr_id'], "wr_id="+this.wr_id+" AND work_team_id = 'FLEET'");
		if (wrRecords != undefined && wrRecords.length > 0) {
			this.details_tabs.findTab('det_info_vehicle').setTitle('<span style="color:red;font-weight:bold;">Info-Vehicle</span>');
			var tabPanel = View.panels.get('details_tabs');
			tabPanel.selectTab('det_info_vehicle');
			return true;
		}
		else {
			return false;
		}
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
