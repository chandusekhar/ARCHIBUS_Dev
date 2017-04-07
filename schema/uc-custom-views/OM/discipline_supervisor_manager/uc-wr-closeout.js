var wrCloseoutController = View.createController('wrCloseoutController', {
	wrIdList: "",
	consoleRestriction: "",

	afterViewLoad: function() {

		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

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
					cellElement.style.color = "#2222AA";
				}
			}
			else if (col.id == 'wr.is_single_funded') {
				var value = row['wr.charge_type'];
				if (value == 'Single Funding') {
					cellElement.style.background = "#FF0000";
				}
			}
			else if (col.id == 'wr.has_contractor') {
				var value = row['wr.has_contractor'];
				if (value == 'C') {
					cellElement.style.background = "#FF0000";
					cellElement.style.color = "#FF0000";
				}
			}
			else if (col.id == 'wr.has_inv_time') {
				var value = row['wr.has_inv_time'];
				if (value == 'T') {
					cellElement.style.background = "#FF0000";
					cellElement.style.color = "#FF0000";
				}
			}
			else if (col.id == 'wr.has_unfulfilled') {
				var value = row['wr.has_unfulfilled'];
				if (value == 'P') {
					cellElement.style.background = "#FF0000";
					cellElement.style.color = "#FF0000";
				}
			}
		}

	},

	afterInitialDataFetch: function() {
		this.inherit();

		this.setupSelectbox_tr_id();
		this.setupSelectbox_status();
		this.consolePanel_onShow();


	},

	consolePanel_onShow: function(){
		var tr_id = $('selectbox_tr_id').value;
		var work_type = $('selectbox_work_type').value;
		//var assigned_to_cf = $('selectbox_assigned_to_cf').value;
		var zone_id = this.consolePanel.getFieldValue('bl.zone_id');
		var wr_id = this.consolePanel.getFieldValue('wr.wr_id');
		var requestor = this.consolePanel.getFieldValue('wr.requestor');
		var bl_id = this.consolePanel.getFieldValue('wr.bl_id');
		var eq_id = this.consolePanel.getFieldValue('wr.eq_id');
		var eq_std = this.consolePanel.getFieldValue('eq.eq_std');
		var cf_id = this.consolePanel.getFieldValue('wr.cf_id');
		var charge_type = this.consolePanel.getFieldValue('wr.charge_type');
		var status =  this.consolePanel.getFieldValue('wr.status');

		var restriction = "1=1";
		if(tr_id != ""){	restriction = restriction + " AND wr.tr_id = "+this.literalOrNull(tr_id);	}
		if(bl_id != ""){	restriction = restriction + " AND wr.bl_id = "+this.literalOrNull(bl_id);	}
		if(wr_id != ""){	restriction = restriction + " AND wr.wr_id = "+this.literalOrNull(wr_id);	}
		if(requestor != ""){	restriction = restriction + " AND wr.requestor = "+this.literalOrNull(requestor);	}
		if(charge_type != ""){	restriction = restriction + " AND wr.charge_type = "+this.literalOrNull(charge_type);	}
		if(zone_id != ""){	restriction = restriction + " AND EXISTS(select 1 from bl where wr.bl_id = bl.bl_id and bl.zone_id="+this.literalOrNull(zone_id)+" )";	}

		switch(work_type){
			case "Demand":
				restriction = restriction + " AND wr.prob_type <> 'PREVENTIVE MAINT'";
			break;
			case "Preventive":
				restriction = restriction + " AND wr.prob_type = 'PREVENTIVE MAINT'";
			break;
		}
		if(eq_id != ""){	restriction = restriction + " AND wr.eq_id = "+this.literalOrNull(eq_id);	}
		if(eq_std != ""){	restriction = restriction + " AND EXISTS(select 1 from eq where wr.eq_id = eq.eq_id and eq.eq_std="+this.literalOrNull(eq_std)+" )";	}

		if(status != "") {	restriction = restriction + " AND wr.status = "+this.literalOrNull(status);	}

		/*
		switch(assigned_to_cf){
			case "No":
				restriction = restriction + " AND NOT EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
			case "Yes":
				restriction = restriction + " AND EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id)";
			break;
		}
		*/

		if(cf_id != "") {
			restriction += " AND (EXISTS(select 1 from wrcf where wrcf.wr_id=wr.wr_id AND wrcf.cf_id = "+this.literalOrNull(cf_id)
				+") OR EXISTS (select 1 from wr_other where wr_other.wr_id = wr.wr_id AND wr.wr_id = wr_other.wr_id AND wr_other.other_rs_type = 'CONTRACTOR' and wr_other.vn_id="
				+this.literalOrNull(cf_id)+"))";
		}

		wrCloseoutController.wrIdList = "";
		this.wrListPanel.addParameter("consoleRest", restriction);
		this.wrListPanel.refresh();
	},

	//reset consolePanel
	consolePanel_onClear: function(){
		this.consolePanel.clear();
		$('selectbox_tr_id').selectedIndex=0;
		$('selectbox_work_type').selectedIndex=0;
		$('selectbox_assigned_to_cf').selectedIndex=0;
	},

	wrListPanel_afterRefresh: function() {
		// Hide the "Assigned CF" search in miniconsole
		var element = $('wrListPanel_filterColumn_wr.assigned_cf');
		if (element != null) {
			element.style.display = 'none';
		}

		element = $('wrListPanel_filterColumn_wr.is_single_funded');
		if (element != null) {
			element.style.display = 'none';
		}

		element = $('wrListPanel_filterColumn_wr.has_contractor');
		if (element != null) {
			element.style.display = 'none';
		}

		element = $('wrListPanel_filterColumn_wr.has_inv_time');
		if (element != null) {
			element.style.display = 'none';
		}

		element = $('wrListPanel_filterColumn_wr.has_unfulfilled');
		if (element != null) {
			element.style.display = 'none';
		}
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

		wrCloseoutController.wrIdList = "";
		View.panels.get("wrListPanel").refresh(restriction);

		wrCloseoutController.wrListPanelhideShowButton(status);
	},

	setupSelectbox_status: function(){
		var options = $('consolePanel_wr.status').options;
		for(var i = 0; i < options.length; i++){
			if("FWC" == options[i].value){
				$('consolePanel_wr.status').selectedIndex = i;
				break;
			}
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

		var detailsAxvw = "uc-ds-wr-manager-details.axvw?wrId="+wr_id;

		var thisController = wrCloseoutController;
		View.openDialog(detailsAxvw, null, null, {
			closeButton: false,
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
						var thisFunction = this;
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
			if ( wrCloseoutController.wrIdList != "" ) {
				wrCloseoutController.wrIdList += ",";
			}
			wrCloseoutController.wrIdList += selectedRecords[i].getValue("wr.wr_id");
		}

		var oldRestriction = wrCloseoutController.wrListPanel.restriction;
		//alert(oldRestriction);
		var newRestriction = oldRestriction;
		if (arrayLength != 0) {
			newRestriction = "("+oldRestriction+") OR wr_id IN ("+wrCloseoutController.wrIdList+")";
		}

		wrCloseoutController.wrListPanel.refresh(newRestriction);

		// reselect wr's
		var gridData = wrCloseoutController.wrListPanel.gridRows;
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

	wrListPanel_onCompleteRequests: function() {
		// Get all the selectedRecords
		var selectedRecords = this.wrListPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		View.openProgressBar("Completing Requests. Please wait...");

		for (var i = 0; i < selectedRecords.length; i++) {
			// check if the request is in the "FWC" state
			var status = selectedRecords[i].getValue("wr.status");
			if (status != "FWC") {
				View.closeProgressBar();
				View.showMessage("Not all selected records are in the Field Work Complete status.");
				return false;
			}
		}

		for (var i = 0; i < selectedRecords.length; i++) {
			// Save audit info
			this.saveWrAuditValue(selectedRecords[i], "FWC");

			var wr_id = selectedRecords[i].getValue("wr.wr_id");

			var recordValues = {};
			recordValues["wr.wr_id"] = wr_id;
			recordValues["wr.status"] = selectedRecords[i].getValue("wr.status"); // workflow need to update something.

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, "Com");
				success = true;
			} catch(e){
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}
		}

		this.wrListPanel.refresh();
		View.closeProgressBar();
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