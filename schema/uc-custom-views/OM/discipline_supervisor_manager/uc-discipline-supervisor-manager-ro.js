// CHANGE LOG:
// 2012/06/27 - ASO - WR173261 - modify wrListPanelhideShowButton() to enable "Create Sub Request" when in "Completed-More Info Needed" Status
// 2012/06/27 - ASO - WR172913 - show completed work request added code in onSelectStatus() and wrListPanelhideShowButton()
// 2012/07/04 - ASO - WR173118 - add new function to re-issue wr  (wrListPanel_onReIssueRequests)
// 2012/09/05 - EW - added auto refresh of panels.

var dsManagerRefreshInterval = 10 * 60000; // in ms.

var disciplineSupervisorManagerController = View.createController('disciplineSupervisorManagerController', {
	wrIdList: "",
	consoleRestriction: "",

	afterViewLoad: function() {

		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

	},

	afterInitialDataFetch: function() {
		this.inherit();

		this.setupSelectbox_tr_id();
		this.consolePanel_onShow();

		// Overload the afterCreateCellContent to colour-code the status
		this.wrListPanel.afterCreateCellContent = function(row, col, cellElement) {
			if (col.id == 'wr.status') {
				var value = row['wr.status.raw'];
				switch (value) {
				case 'R':
					cellElement.style.color = '#FF0000';
					break;
				case 'A':
					cellElement.style.color = '#FF0000';
					break;
				case 'AA':
					cellElement.style.color = '#9932CC';
					break;
				case 'I':
					cellElement.style.color = '#008000';
					break;
				case 'HA':
				case 'HL':
				case 'HP':
					cellElement.style.color = '#3333FF';
					break;
				case 'FWC':
					cellElement.style.color = '#FFA500';
					break;
				case 'S':
				case 'Com':
				case 'Can':
					cellElement.style.color = '#000000';
					break;
				default:
					break;
				}
			}
			else if (col.id == 'wr.date_requested') {
				var value = row['wr.date_requested'];
				var daysOver = daysBetween(new Date(value), new Date());
				if (daysOver > 30) {
					cellElement.style.color = '#FF0000';
					cellElement.style.fontWeight = "bold";
				}
				else if (daysOver > 20) {
					cellElement.style.color = '#FFA500';
					cellElement.style.fontWeight = "bold";
				}
			}
			else if (col.id == 'wr.assigned_cf') {
				var value = row['wr.assigned_cf'];
				if (value == 'MULTIPLE') {
					cellElement.style.fontWeight = "bold";
				}
			}
			else if (col.id == 'wr.wr_id') {
				var value = row['wr.charge_type'];
				if (value == 'Single Funding') {
					cellElement.style.color = "#ffffff";
					//cellElement.style.fontWeight = "bold";
					cellElement.style.backgroundColor="#aaaadd";
					
				}
			}



		}


		var refreshTimeoutID = setTimeout("autoRefreshPanels()", dsManagerRefreshInterval);
	},

	consolePanel_onShow: function(){
		var tr_id = $('selectbox_tr_id').value;
		var work_type = $('selectbox_work_type').value;
		var assigned_to_cf = $('selectbox_assigned_to_cf').value;
		var zone_id = this.consolePanel.getFieldValue('bl.zone_id');
		var wr_id = this.consolePanel.getFieldValue('wr.wr_id');
		var requestor = this.consolePanel.getFieldValue('wr.requestor');
		var bl_id = this.consolePanel.getFieldValue('wr.bl_id');
		var cf_id = this.consolePanel.getFieldValue('wr.cf_id');
		var charge_type = this.consolePanel.getFieldValue('wr.charge_type');
		var restriction = "1=1";
		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
		if(bl_id != ""){	restriction = restriction + " AND wr.bl_id = "+this.literalOrNull(bl_id);	}
		if(wr_id != ""){	restriction = restriction + " AND wr.wr_id = "+this.literalOrNull(wr_id);	}
		if(requestor != ""){	restriction = restriction + " AND wr.requestor = "+this.literalOrNull(requestor);	}
		if(charge_type != ""){	restriction = restriction + " AND wr.charge_type = "+this.literalOrNull(charge_type);	}
		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wr.bl_id = bl.bl_id and bl.zone_id="+this.literalOrNull(zone_id)+" )";	}
		if(View.user.role == 'UC-DSRES' || View.user.role == 'UC-DSRES-RO') {
			restriction = restriction + " AND wr.bl_id IN ('BR','CA','CD','DC','GL','IH','KA','NO','OL','RU','YA','VCA','VCB','VCC','VCD','VCE','VCF','VCG','VCH','VCI','VCJ','VCK','VCL','VCM','VCN','VCO','VCP','VCQ','VCR','VCS','VCT','VCU','VCV','VCW','VCX','VCY') ";
		} else {
		}
		switch(work_type){
			case "Demand":
				restriction = restriction + " AND wr.prob_type <> 'PREVENTIVE MAINT'";
			break;
			case "Preventive":
				restriction = restriction + " AND wr.prob_type = 'PREVENTIVE MAINT'";
			break;
		}

		switch(assigned_to_cf){
			case "No":
				restriction = restriction + " AND NOT EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
			case "Yes":
				restriction = restriction + " AND EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
		}

		if(cf_id != "") {
			restriction += " AND (EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id AND wrcf.cf_id = "+this.literalOrNull(cf_id)
				+") OR EXISTS (select 1 from wr_other where wr_other.wr_id = wr.wr_id AND wr.wr_id = wr_other.wr_id AND wr_other.other_rs_type = 'CONTRACTOR' and wr_other.vn_id="
				+this.literalOrNull(cf_id)+"))";
		}

		disciplineSupervisorManagerController.wrIdList = "";
		this.statusPanel.addParameter("consoleRest", restriction);
		this.wrListPanel.addParameter("consoleRest", restriction);
		this.statusPanel.refresh();
	},

	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		$('selectbox_tr_id').selectedIndex=0;
		$('selectbox_work_type').selectedIndex=0;
		$('selectbox_assigned_to_cf').selectedIndex=0;
	},


	onSelectStatus: function(row){
		var status = row['wr.wr_status'];
		var restriction = "";
		switch(status){
			case 'Requested':
				restriction = " wr.status='AA'";
			break;
			case 'Issued and in Process':
				restriction = " wr.status='I'";
			break;
			case 'On Hold for Parts':
				restriction = " wr.status='HP' ";
			break;
			case 'On Hold for Labor':
				restriction = " wr.status='HL' ";
			break;
			case 'On Hold for Access':
				restriction = " wr.status='HA' ";
			break;
			case 'Parts Complete':
				restriction = " wr.status='PC' ";
			break;
			case 'Field Work Complete':
				restriction = " wr.status='FWC' ";
			break;
			case 'Complete-More Info Needed':
				restriction = " wr.status='IN' ";
			break;
			case 'Complete-Info Returned':
				restriction = " wr.status='IR' ";
			break;
			case 'Completed': //WR172913
				restriction = " wr.status='Com' ";
			break;
			case 'Overdue (Over 30 days)':
				restriction = "datediff(day,wr.date_assigned,getdate())>30 AND wr.status IN ('AA', 'I', 'HP', 'HA', 'HL', 'PC') ";
			break;
			case 'All':
				restriction = "wr.status IN ('AA', 'I', 'HP', 'HL', 'HA', 'PC', 'IN', 'FWC') ";
			break;
		}

		disciplineSupervisorManagerController.wrIdList = "";
		View.panels.get("wrListPanel").refresh(restriction);

		disciplineSupervisorManagerController.wrListPanelhideShowButton(status);

		// Hide the "Assigned CF" search in miniconsole
		var element = $('wrListPanel_filterColumn_wr.assigned_cf');
		if (element != null) {
			element.style.display = 'none';
		}
	},

	wrListPanelhideShowButton: function(status){
		var panel = View.panels.get("wrListPanel");

		var issueRequests = 'issueRequests';
		var assignCF = 'assignCF';
		var createSubReq = 'createSubReq';
		var fieldWorkComplete = 'fieldWorkComplete';
		var sendToCCC = "sendToCCC";
		var returnInformation = 'returnInformation';

		var reIssueRequests = 'reIssueRequests';
		panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118 - added new button for re-issue, only On Hold for Labor, On Hold for Access, Parts Complete and Field work Complete can see this
		panel.actions.get(issueRequests).button.setVisible(true);
		panel.actions.get(assignCF).button.setVisible(true);
		panel.actions.get(createSubReq).button.setVisible(true);
		panel.actions.get(fieldWorkComplete).button.setVisible(true);
		panel.actions.get(sendToCCC).button.setVisible(true);
		panel.actions.get(returnInformation).button.setVisible(true);

		switch(status){
			case 'Requested':
				panel.actions.get(createSubReq).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;

			case 'Issued and in Process':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;

			case 'On Hold for Parts':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
				break;
			case 'On Hold for Labor':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(true);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;
			case 'On Hold for Access':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(true);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(true);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;
			case 'Parts Complete':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				break;
			case 'Complete-More Info Needed':
				panel.actions.get(returnInformation).button.setVisible(true);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(true); //2012/06/27 - ASO - WR173261 - enable "Create Sub Request" when in "Complete-More Info Needed" Status
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
			case 'Complete-Info Returned':
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(true);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
			case 'Field Work Complete':
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(true);// 2012/07/04 - ASO - WR173118
			break;

			case 'Overdue (Over 30 days)':	break;

			case 'Completed': //WR172913 disable all button except print
				panel.actions.get(returnInformation).button.setVisible(false);
				panel.actions.get(assignCF).button.setVisible(false);
				panel.actions.get(createSubReq).button.setVisible(false);
				panel.actions.get(issueRequests).button.setVisible(false);
				panel.actions.get(fieldWorkComplete).button.setVisible(false);
				panel.actions.get(sendToCCC).button.setVisible(false);
				panel.actions.get(reIssueRequests).button.setVisible(false);// 2012/07/04 - ASO - WR173118
			break;
		}

	},

	//setup selectbox for Work Unit (tr_id)
	setupSelectbox_tr_id: function(){
		//add trades into options
		this.addTrSelectBoxOptionsOptions();
		//default to user's Work Unit (tr_id)
		this.setDefaultTrade();

	},

	setDefaultTrade:function(){
		var tr_id = this.getUsersTrade();
		var options = $('selectbox_tr_id').options;
		for(var i = 0; i < options.length; i++){
			if(tr_id == options[i].value){
				$('selectbox_tr_id').selectedIndex = i;
				break;
			}
		}
	},

	getUsersTrade: function(){
		var tr_id = null;
		var email = View.user.email;
		if(email != ""){
			tr_id = UC.Data.getDataValue('cf', 'tr_id', "email="+this.literalOrNull(email));
		}
		return tr_id;
	},

	addTrSelectBoxOptionsOptions: function(){
		var records = UC.Data.getDataRecords('tr', ['tr.tr_id'], "");
		this.addSelectBoxOptionsByRecords($('selectbox_tr_id'),records,'tr.tr_id',true);
	},

	consolePanel_onSelectCf:function(){
		var filter = "";
		if (this.consolePanel.getFieldValue("wr.cf_id") != "") {
			filter = "&filter=" + this.consolePanel.getFieldValue("wr.cf_id")
		}

		View.openDialog('uc-select-cf-vn-dialog.axvw?parentPanel=consolePanel&tragetTbl=wr&tragetFld=cf_id'+filter, "", false, {
				closeButton: true,
				maximize: false,
				callback: function(res) {
					/*var clause = res.clauses[2];
					var value = clause.value;
					View.panels.get('exWorkRequest_wrForm').setFieldValue('wr.rm_id', value); */
				}
			});
	},

	//------------------------------------------------------------utilities------------------------------------------------------------
	//generic method to add options into the selectbox
	addSelectBoxOptionsByRecords: function(selectBox, records,fieldName,includeEmptyOption){

		if(includeEmptyOption != undefined){
			if(includeEmptyOption){
				var optn = document.createElement("OPTION");
				optn.text = "";
				optn.value = "";
				selectBox.options.add(optn);	//add blank option at the top
			}
		}
		//This function is used in showInputs to add new items into the selectbox
		for(var i = 0; i< records.length; i++){
			var value = records[i][fieldName];
			var optn = document.createElement("OPTION");
			optn.text = value;
			optn.value = value;
			selectBox.options.add(optn);
		}
	},

	onViewRequest: function(row) {
		var wr_id = row['wr.wr_id'];

		var detailsAxvw = "uc-ds-wr-manager-details-ro.axvw?wrId="+wr_id;

		var thisController = disciplineSupervisorManagerController;
		View.openDialog(detailsAxvw, null, null, {
			dialogController: null,

			// This gets called after the dialog views afterRefresh/afterInitialDataFetch.
			afterInitialDataFetch: function(dialogView) {
				// add in the refresh function to the save
				this.dialogController = dialogView.controllers.get('managerDetailsController');
				this.addAfterSaveFunction();
			},

			addedAfterSave: false,
			addAfterSaveFunction: function() {
				if (!this.addedAfterSave) {
					if (this.dialogController.infoTabController != null) {
						this.addedAfterSave = true;
						var form = this.dialogController.infoTabController.nav_details_info;
						var thisDialogController = this.dialogController;
						var refreshFunc = function() {
							thisDialogController.infoTabController.origAfterSaveWorkflow();
							thisController.wrListPanelAfterSaveRefresh();
						};
						thisDialogController.infoTabController.origAfterSaveWorkflow =  this.dialogController.infoTabController.afterSaveWorkflow;
						thisDialogController.infoTabController.afterSaveWorkflow = refreshFunc;
					}
					else {
						thisFunction = this;
						setInterval(function() {thisFunction.addAfterSaveFunction()}, 1000);
					}
				}
			}
		});
	},

	wrListPanelAfterSaveRefresh: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();

		// Create a list of the selected wr_ids
		var arrayLength = selectedRecords.length;
		for (var i = 0; i < arrayLength; i++) {
			if ( disciplineSupervisorManagerController.wrIdList != "" ) {
				disciplineSupervisorManagerController.wrIdList += ",";
			}
			disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
		}

		var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
		//alert(oldRestriction);
		var newRestriction = oldRestriction;
		if (arrayLength != 0) {
			newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
		}
		disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

		// reselect wr's
		var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
		var gridLength = gridData.length;
		for (var i = 0; i < arrayLength; i++) {
			var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
			for (var j = 0 ; j < gridLength; j++ ) {
				if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
					gridData.items[j].select();
					break;	// found, continue to find the next selected.
				}
			}
		}
	},

	wrListPanel_onIssueRequests: function() {
		var success = false;

		var woList = new Array();
		var subReqList = new Array();

		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "AA" state
			if (selectedRecords[i].getValue("wr.status") != "AA") {
				View.showMessage("Not all selected records are in the Requested status.");
				return false;
			}

			if (selectedRecords[i].getValue("wr.ac_id") == "") {
				View.showMessage("Not all selected records have account codes assigned.");
				return false;
			}

			// check if it's a subrequest.  If subrequest.  issue separately using IssueWorkRequest workflow
			if (selectedRecords[i].getValue("wr.activity_log_id") == "" && selectedRecords[i].getValue('wr.prob_type') != 'PREV MAINT') {
				subReqList.push(selectedRecords[i].getValue("wr.wr_id"));
			}
			else {
				woList.push({"wr.wo_id":selectedRecords[i].getValue("wr.wo_id")});
			}
		}

		if (woList.length == 0 && subReqList.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		// Issue the selected work orders
		var result = {};
		try {
			View.openProgressBar("Issuing Requests. Please wait...");

			// Save audit and issue
			if (!this.saveWrAuditValues(selectedRecords,"I")) {
				//View.showMessage("Failed to save audit records.  Please contact an Adminstrator");
				success = false;
				return success;
			}

			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkOrders', woList);

			// Issue the sub requests.
			for (var i = 0; i < subReqList.length; i++) {
				var parameters = {
					'wr.wr_id':subReqList[i]
				};

				Workflow.call('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequest', parameters);
				alert(1);
			}


			this.afterIssueRequests(selectedRecords);
			success = true;
		} catch (e) {
			View.closeProgressBar();
		  if (e.code == 'ruleFailed') {
			  View.showMessage(e.message);
		  } else{
			  Workflow.handleError(e);
		  }
		}


		View.closeProgressBar();
		return success;
	},

	afterIssueRequests: function(selectedRecords) {
		View.panels.get('statusPanel').refresh();
		View.confirm("Do you want to print the Issued requests?", function(button) {
			if (button=='yes') {
				printCtrl.onPrintButtonPush("Preview");
			}

			// Create a list of the selected wr_ids
			var arrayLength = selectedRecords.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( disciplineSupervisorManagerController.wrIdList != "" ) {
					disciplineSupervisorManagerController.wrIdList += ",";
				}
				disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
			}

			// Refresh grid with selectedRecords still highlighted.
			var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
			//alert(oldRestriction);
			var newRestriction = oldRestriction;
			if (arrayLength != 0) {
				newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
			}
			disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

			// reselect wr's
			var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
			var gridLength = gridData.length;
			for (var i = 0; i < arrayLength; i++) {
				var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
				for (var j = 0 ; j < gridLength; j++ ) {
					if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
						gridData.items[j].select();
						break;	// found, continue to find the next selected.
					}
				}
			}
		});
	},

	wrListPanel_onAssignCF: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		this.assignPanel.refresh(null, true);
		this.assignPanel.show(true, true);
		this.assignPanel.showInWindow({
			width: 500,
			height: 300,
			newRecord: true,
			closeButton: false
        });

	},

	assignPanel_assignToSelect: function() {
		var assign_type = $('assign_cf_type').value;
		var title = "";
		var selectTableName = "";
		var selectFieldNames = "";
		var visibleFieldNames = "";
        var sortFields = null;

		switch(assign_type){
			case "Contractor":
				title = "Select Contractor";
				selectTableName = 'vn';
				selectFieldNames = ['vn.vn_id'];
				visibleFieldNames = ['vn.vn_id','vn.company','vn.vendor_type'];
			break;
			case "Craftsperson":
				title = "Select Craftsperson";
				selectTableName = 'cf';
				selectFieldNames = ['cf.cf_id'];
				visibleFieldNames = ['cf.cf_id','cf.tr_id'];
				sortFields = toJSON([{fieldName : "cf.tr_id"},{fieldName : "cf.cf_id"}]);
			break;
			default:
			return;
		}

		View.selectValue({
			formId: 'assignPanel',
			title: title,
			fieldNames: ['wrcf.cf_id'],
			selectTableName: selectTableName,
			selectFieldNames: selectFieldNames,
			visibleFieldNames: visibleFieldNames,
			applyFilter: true,
            sortValues: sortFields
		});
	},

	assignPanel_onAssignCF: function() {
		var assign_type = $('assign_cf_type').value;
		var assignTo = this.assignPanel.getFieldValue("wrcf.cf_id");
		var comments = this.assignPanel.getFieldValue("wrcf.comments");

		if (assignTo == "") {
			View.showMessage("No Assigned To selected.");
			return false;
		}

		// Get all the wr_id from the selectedRecords and assign the crafts or contractor.
		var wrListPanel = View.panels.get("wrListPanel");
		var selectedRecords = wrListPanel.getSelectedRecords();

		var dataSource = null;
		var saveRecord = null;
		var wrfieldName = "";

		switch(assign_type){
		case "Contractor":
			if (comments == "") {
				View.showMessage("Description is required when assigning Contractors");
				return false;
			}

			wrfieldName = "wr_other.wr_id";
			dataSource = View.dataSources.get("wrother_add_ds");
			newRecord = dataSource.getDefaultRecord();
			newRecord.setValue("wr_other.other_rs_type", "CONTRACTOR");
			newRecord.setValue("wr_other.qty_used", 1);
			newRecord.setValue("wr_other.vn_id", assignTo);
			newRecord.setValue("wr_other.fulfilled", 1);
			newRecord.setValue("wr_other.description", comments);
		break;
		case "Craftsperson":
			wrfieldName = "wrcf.wr_id";
			dataSource = View.dataSources.get("wrcf_add_ds");
			newRecord = dataSource.getDefaultRecord();
			newRecord.setValue("wrcf.cf_id", assignTo);
			newRecord.setValue("wrcf.entry_type", "Assignment");
		break;
		default:
		return false;
		}

		View.openProgressBar("Assigning Craftsperson/Contractor. Please wait...");
		try {
			// Save each new wrcf/wr_other record
			for (var i = 0; i < selectedRecords.length; i++) {
				var wr_id = selectedRecords[i].getValue("wr.wr_id");
				newRecord.oldValues = [];
				newRecord.isNew = true;
				newRecord.setValue(wrfieldName, wr_id);
				dataSource.saveRecord(newRecord);
			}
		}
		catch (ex) {
			if(ex.message != undefined)
				View.showMessage(ex.message); //give a more detail message
			else
				View.showMessage(ex);
		}
		View.closeProgressBar();

		this.afterAssignCF(selectedRecords);

		this.statusPanel.refresh();
		this.assignPanel.closeWindow();
		return true;
	},

	afterAssignCF: function(selectedRecords) {
		View.confirm("Do you want to print the Assigned requests?", function(button) {
			if (button=='yes') {
				printCtrl.onPrintButtonPush("Preview");
			}

			// Create a list of the selected wr_ids
			var arrayLength = selectedRecords.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( disciplineSupervisorManagerController.wrIdList != "" ) {
					disciplineSupervisorManagerController.wrIdList += ",";
				}
				disciplineSupervisorManagerController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
			}

			// Refresh grid with selectedRecords still highlighted.
			var oldRestriction = disciplineSupervisorManagerController.wrListPanel.restriction;
			var newRestriction = oldRestriction;
			if (arrayLength != 0) {
				newRestriction = "("+oldRestriction+") OR wr_id IN ("+disciplineSupervisorManagerController.wrIdList+")";
			}
			disciplineSupervisorManagerController.wrListPanel.refresh(newRestriction);

			// reselect wr's
			var gridData = disciplineSupervisorManagerController.wrListPanel.gridRows;
			var gridLength = gridData.length;
			for (var i = 0; i < arrayLength; i++) {
				var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
				for (var j = 0 ; j < gridLength; j++ ) {
					if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
						gridData.items[j].select();
						break;	// found, continue to find the next selected.
					}
				}
			}
		});
	},

	assign_cf_type_onchange: function() {
		var assign_type = $('assign_cf_type').value;

		switch(assign_type){
		case "Contractor":
			this.assignPanel.showField("wrcf.comments", true);
		break;
		case "Craftsperson":
			this.assignPanel.showField("wrcf.comments", false);
		break;
		default:
		return false;
		}
	},

	wrListPanel_onCreateSubReq: function() {
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		this.subReqFormPanel.show(true, true);
		this.subReqFormPanel.showInWindow({
			width: 500,
			height: 400,
			newRecord: true,
			closeButton: true
        });
	},

	subReqFormPanel_onSubmit: function() {
		// Copy and check logic taken from uc-wr-subrequest-create view.
		var wrListPanel = View.panels.get("wrListPanel");
		var dataSource = View.dataSources.get("subreq_add_ds");
		var selectedRecords = wrListPanel.getSelectedRecords();

		try {
			for (var i = 0; i < selectedRecords.length; i++) {
				var newRecord = new Ab.data.Record();
				var wr_id = selectedRecords[i].getValue("wr.wr_id");
				var wo_id = selectedRecords[i].getValue("wr.wo_id");
				newRecord.oldValues = [];
				newRecord.isNew = true;

				// Visible fields
				newRecord.setValue('wr.requestor', this.subReqFormPanel.getFieldValue("wr.requestor"));
				newRecord.setValue('wr.priority', this.subReqFormPanel.getFieldValue("wr.priority"));
				newRecord.setValue('wr.date_assigned', this.subReqFormPanel.getFieldValue("wr.date_assigned"));
				newRecord.setValue('wr.phone', this.subReqFormPanel.getFieldValue("wr.phone"));

				// description
				var origDesc = selectedRecords[i].getValue('wr.description');
				var parentId = "Parent Request ID: WR#" + wr_id + "\r\n";
				var newDesc = "REASON FOR SUB-REQUEST: " + replaceLF(this.subReqFormPanel.getFieldValue('subwrcomments')) + "\r\n\r\n" + parentId + origDesc;
				newRecord.setValue('wr.description', newDesc);

				// hidden Fields
				newRecord.setValue('wr.tr_id', "CCC");
				newRecord.setValue('wr.status', "AA");
				newRecord.setValue('wr.site_id', selectedRecords[i].getValue("wr.site_id"));
				newRecord.setValue('wr.bl_id', selectedRecords[i].getValue("wr.bl_id"));
				newRecord.setValue('wr.fl_id', selectedRecords[i].getValue("wr.fl_id"));
				newRecord.setValue('wr.rm_id', selectedRecords[i].getValue("wr.rm_id"));
				newRecord.setValue('wr.location', selectedRecords[i].getValue("wr.location"));
				newRecord.setValue('wr.block_id', selectedRecords[i].getValue("wr.block_id"));
				newRecord.setValue('wr.unit_id', selectedRecords[i].getValue("wr.unit_id"));
				newRecord.setValue('wr.charge_type', selectedRecords[i].getValue("wr.charge_type"));
				newRecord.setValue('wr.prob_type', selectedRecords[i].getValue("wr.prob_type"));
				newRecord.setValue('wr.supervisor', selectedRecords[i].getValue("wr.supervisor"));
				newRecord.setValue('wr.manager', selectedRecords[i].getValue("wr.manager"));
				newRecord.setValue('wr.work_team_id', selectedRecords[i].getValue("wr.work_team_id"));
				newRecord.setValue('wr.activity_type', selectedRecords[i].getValue("wr.activity_type"));
				newRecord.setValue('wr.eq_id', selectedRecords[i].getValue("wr.eq_id"));
				newRecord.setValue('wr.dv_id', selectedRecords[i].getValue("wr.dv_id"));
				newRecord.setValue('wr.dp_id', selectedRecords[i].getValue("wr.dp_id"));
				newRecord.setValue('wr.serv_window_start', selectedRecords[i].getValue("wr.serv_window_start"));
				newRecord.setValue('wr.serv_window_end', selectedRecords[i].getValue("wr.serv_window_end"));

				//parse account code
				//if the Internal starts with FMD then replace it with FMD000000
				var acct = selectedRecords[i].getValue("wr.ac_id");
				//business unit
				var position = 0;
				var mark = acct.indexOf('-', position);
				var bu = acct.substring(position, mark);
				//fund
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var fund= acct.substring(position, mark);
				//dept
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var dept= acct.substring(position, mark);
				//account
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var account= acct.substring(position, mark);
				//program
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var program= acct.substring(position, mark);
				//internal
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var internal= acct.substring(position, mark);
				//project
				position=mark+1;
				mark=acct.indexOf('-',mark+1);
				var project= acct.substring(position, mark);
				//affiliate
				position=mark+1;
				var affiliate= acct.substring(position);

				//If FMD is found in the internal replace with FMD000000
				if (internal.indexOf('FMD') != -1)
				{
					internal="FMD000000";
				}

				acct = bu + "-" + fund + "-" + dept + "-" + account + "-" + program + "-" + internal + "-" + project + "-" + affiliate;
				uc_psAccountCode(bu,fund,dept,account,program,internal,project,affiliate,'doNothing',0);
				newRecord.setValue('wr.ac_id', acct);

				var retRecord = dataSource.saveRecord(newRecord);

				// Attach new wr to the wo via wf.
				var wr_records = [{"wr.wr_id": retRecord.getValue('wr.wr_id')}];
				var result = {};
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-assignWrToWo', wr_records, wo_id);
			}

			this.subReqFormPanel.closeWindow();
			View.showMessage("Subrequests Created.");
		}
		catch (e) {
			Workflow.handleError(e);
		}
	},

	wrListPanel_onFieldWorkComplete: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Field Work Complete Requests. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "I" && status != "HL" && status != "HP" && status != "PC") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "FWC");

			var wr_id = selectedRecords[i].getValue("wr.wr_id");

			/* Converted to use SLA workflows
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"FWC");
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			dataSource.saveRecord(updateRecord);
            */

			var recordValues = {};
			recordValues["wr.wr_id"] = wr_id;
			recordValues["wr.status"] = selectedRecords[i].getValue("wr.status"); // workflow need to update something.

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, "FWC");
				success = true;
			} catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}
		}

		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();
	},




	wrListPanel_onReturnInformation: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Return Information Requests. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "IN") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "IR");

			var wr_id = selectedRecords[i].getValue("wr.wr_id");
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"IR");
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			dataSource.saveRecord(updateRecord);

			/* No Need for Workflow, just save.
			var recordValues = {};
			recordValues["wr.wr_id"] = wr_id;
			recordValues["wr.eq_id"] = selectedRecords[i].getValue("wr.eq_id"); // workflow need to update something.

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, "FWC");
				success = true;
			} catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}
			*/
		}

		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();
	},
















	wrListPanel_onSendToCCC: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "AA" && status != "I" && status != "HL" && status != "HP" && status != "PC") {
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			var assigned_cf = selectedRecords[i].getValue("wr.assigned_cf");
			if (assigned_cf != "")  {
				var thisController = this;
				View.confirm("One or more selected records have Craftsperson assigned.  Continue sending requests back to CCC?", function(button) {
					if (button == "yes") {
						thisController.sendToCCCPanel.show(true, true);
						thisController.sendToCCCPanel.showInWindow({
							width: 400,
							height: 400,
							newRecord: true,
							closeButton: false
						});
					}
				});
				return false;
			}
		}

		this.sendToCCCPanel.show(true, true);
		this.sendToCCCPanel.showInWindow({
			width: 400,
			height: 400,
			newRecord: true,
			closeButton: false
        });
	},

	sendToCCCPanel_onSendToCCCReturn: function() {
		// Get all the wo_id from the selectedRecords and issue them.
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Sending Requests back to CCC. Please wait...");

		var dataSource = View.dataSources.get("subreq_add_ds");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "I"/"HL"/"HP"/"PC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "AA" && status != "I" && status != "HL" && status != "HP" && status != "PC") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Issued or Hold statuses.");
				return false;
			}
		}

		// cf notes
		var reasonComments = replaceLF(this.sendToCCCPanel.getFieldValue('wr.cf_notes'));

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "AA", "CCC");

			var origDesc = selectedRecords[i].getValue('wr.cf_notes');

			var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
			var currentDate = new Date();
			var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
				+ "/" + currentDate.getDate();

			//Parse the hours to get the correct time.
			var curr_hour = currentDate.getHours();
			var am_pm = "";
			if (curr_hour < 12) {
				am_pm = "AM";
			}
			else {
				am_pm = "PM";
			}
			if (curr_hour == 0) {
				curr_hour = 12;
			}
			if (curr_hour > 12) {
				curr_hour = curr_hour - 12;
			}

			// add leading 0 to minutes if needed.
			var curr_min = currentDate.getMinutes();
			curr_min = curr_min + "";
			if (curr_min.length == 1) {
				curr_min = "0" + curr_min;
			}

			var timeString = curr_hour + ":" + curr_min + " " + am_pm;

			var newDesc = origDesc + "\r\n\r\n" + currentUser + " - " + dateString + "-" + timeString + ": RETURNED TO CCC - REASON: " + reasonComments ;

			var wr_id = selectedRecords[i].getValue("wr.wr_id");
			var updateRecord = new Ab.data.Record();

			updateRecord.isNew = false;
			updateRecord.setValue('wr.wr_id',wr_id);
			updateRecord.setValue('wr.status',"AA");
			updateRecord.setValue('wr.tr_id', "CCC");
			updateRecord.setValue('wr.cf_notes', newDesc);
			updateRecord.oldValues = {};
			updateRecord.oldValues["wr.wr_id"]  = wr_id;

			dataSource.saveRecord(updateRecord);
		}

		this.statusPanel.refresh();
		this.wrListPanel.refresh();
		View.closeProgressBar();

		this.sendToCCCPanel.closeWindow();
	},

	saveWrAuditValues: function(selectedRecords, newStatus, newTrade) {
		for (var i = 0; i < selectedRecords.length; i++) {
			if (!this.saveWrAuditValue(selectedRecords[i], newStatus, newTrade)) {
				return false;
			}
		}

		return true;
	},

	saveWrAuditValue: function(record, newStatus, newTrade) {
		var trade = (newTrade == null) ? record.getValue('wr.tr_id') : newTrade;
		var parameters = {
				'user_name': View.user.employee.id,
				'wr_id': record.getValue('wr.wr_id'),
				'newValues': toJSON( {'wr.status': newStatus,
									  'wr.tr_id': trade})
		};

		var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
		if (result.code != 'executed') {
				Workflow.handleError(result);
				return false;
		}

		return true;
	},

	/*WR173118 - add new function to re-issue wr */
	wrListPanel_onReIssueRequests: function() {
		var success = false;

		var selectedRecords = this.wrListPanel.getSelectedRecords();

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the On Hold for Labor (HL), On Hold for Access (HA), Parts Complete(PC) and Field work Complete (FWC)state
			var status = selectedRecords[i].getValue("wr.status");
			if ( (status != "HL") && (status != "HA") && (status != "PC") && (status != "FWC") ){
				View.showMessage("Not all selected records are in the On Hold for Labor, On Hold for Access, Parts Complete or Field work Complete status.");
				return false;
			}
			if (selectedRecords[i].getValue("wr.ac_id") == "") { //make sure ac_id already exists
				View.showMessage("Not all selected records have account codes assigned.");
				return false;
			}
		}

		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return false;
		}

		try {
			View.openProgressBar("Re-Issuing Requests. Please wait...");
			// re-issue each selected record 1 by 1
			for (var i = 0; i < selectedRecords.length; i++) {
				var result = {};
				var wrObject = new Object();
				var wr_id = "";
				var issueStatus = "I";
				// Save audit and issue
				if (!this.saveWrAuditValue(selectedRecords[i],issueStatus)) {
					//View.showMessage("Failed to save audit records.  Please contact an Adminstrator");
					success = false;
					return success;
				}
				wr_id = selectedRecords[i].getValue("wr.wr_id");
				wrObject["wr.wr_id"] = wr_id;
				wrObject["wr.status"] = selectedRecords[i].getValue("wr.status");
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', wrObject, issueStatus);
			}

			View.closeProgressBar();
			this.afterIssueRequests(selectedRecords);
			success = true;
		} catch (e) {
			View.closeProgressBar();
			if (e.code == 'ruleFailed') {
				View.showMessage(e.message);
			} else{
				Workflow.handleError(e);
			}
		}

		return success;
	},

	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	}
});

// *****************************************************************************
// Replaces lone LF (\n) with CR+LF (\r\n)
// *****************************************************************************
function replaceLF(value)
{
	String.prototype.reverse = function () {
		return this.split('').reverse().join('');
	};

	return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
}

function daysBetween(firstDay, secondDay) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
    var two = new Date(secondDay.getFullYear(), secondDay.getMonth(), secondDay.getDate());

    // Do the math.
    var millisecondsPerDay = 86400000;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
}


function autoRefreshPanels()
{
	refreshPanels();
	refreshTimeoutID = setTimeout("autoRefreshPanels()", dsManagerRefreshInterval);
}

function refreshPanels()
{
	View.panels.get('statusPanel').refresh();

	var listPanel = View.panels.get("wrListPanel");
	var selectedRecords = listPanel.getSelectedRecords();
	var wrIdList = ""

	if (listPanel.visible == true) {
		// Create a list of the selected wr_ids
		var arrayLength = selectedRecords.length;
		for (var i = 0; i < arrayLength; i++) {
			if (wrIdList != "" ) {
				wrIdList += ",";
			}
			wrIdList += selectedRecords[i].getValue("wr.wr_id");
		}

		listPanel.refresh();

		// reselect wr's
		var gridData = listPanel.gridRows;
		var gridLength = gridData.length;
		for (var i = 0; i < arrayLength; i++) {
			var selectedWrId = selectedRecords[i].getValue("wr.wr_id");
			for (var j = 0 ; j < gridLength; j++ ) {
				if (gridData.items[j].getFieldValue("wr.wr_id") == selectedWrId) {
					gridData.items[j].select();
					break;	// found, continue to find the next selected.
				}
			}
		}
	}
}