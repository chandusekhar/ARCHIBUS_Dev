var brgTest = false;
// CHANGE LOG
// 2010/04/12 - Priority removed from list of copied fields.
// 2010/04/12 - JJYCHAN - ISSUE:88 - Commented out line that autofills trade
// 2010/04/12 - JJYCHAN - ISSUE:87 - Included date_assigned as a copied field
// 2010/05/06 - EWONG - ISSUE:158 - Save description directly to record to preserve line feeds.
// 2010/05/12 - EWONG	- Fixed linefeeds saving properly for sub-request reason.
// 2010/05/12 - EWONG - Fixed issue with priority not properly setting from main record.
// 2012/03/12 - EWONG - Added Work Unit dropdown and writes the tr_id to the description
// 2012/12/12 - BH Added brgTest to bypass the account sql
// 2012/12/12 - BH Added vehicle fields
// 2015/12/08 - MSHUSSAI - Updated javascript function subReqForm_beforeSave to show Craftpersons Notes on sub request Description

// *****************************************************************************
// View controller object for the Create Sub Request Dialog.
// *****************************************************************************
var subRequestController = View.createController('subRequestController', {
	openerCallback: null,
	mainWrId: null,
	mainWoId: null,

	afterInitialDataFetch: function() {
		this.inherit();
	},

	subReqForm_afterRefresh: function() {
		this.createWorkTeamDropDown();
	},

	// ************************************************************************
	// Copies the needed information from the main
	// ************************************************************************
	copyInformation: function() {
		if (this.mainWrId != null) {
			// Query the db for the required record values
			var fieldNames = ['wr_id', 'wo_id', 'site_id', 'bl_id', 'fl_id', 'rm_id',
					'location',	'block_id', 'unit_id', 'charge_type', 'tr_id',
					'prob_type', 'requestor', 'supervisor',	'manager', 'priority',  'ac_id',
					'work_team_id', 'activity_type', 'eq_id', 'description',
					'dv_id', 'dp_id', 'serv_window_start', 'serv_window_end',
					'cause_type', 'towing', 'budget_owner', 'po','po_doc',
					'incident_no', 'ins_no', 'driver', 'comments_mgr','comments_risk','cf_notes'
					];


			var rest = "wr_id = "+ this.mainWrId;

			var mainRecord = UC.Data.getDataRecord('wr', fieldNames, rest);

			this.mainWoId = mainRecord["wr.wo_id"]['n'];		// Save the wo for attaching via wf.


			// Visible fields
			this.subReqForm.setFieldValue('wr.requestor', View.user.employee.id);
			this.subReqForm.setFieldValue('wr.phone', View.user.employee.phone);
			//this.subReqForm.setFieldValue('wr.tr_id', mainRecord["wr.tr_id"]);
			//this.subReqForm.setFieldValue('wr.date_assigned', mainRecord["wr.date_assigned"]);

			// Hidden fields
			this.subReqForm.setFieldValue('wr.site_id', mainRecord["wr.site_id"]['l']);
			this.subReqForm.setFieldValue('wr.bl_id', mainRecord["wr.bl_id"]['l']);
			this.subReqForm.setFieldValue('wr.fl_id', mainRecord["wr.fl_id"]['l']);
			this.subReqForm.setFieldValue('wr.rm_id', mainRecord["wr.rm_id"]['l']);
			this.subReqForm.setFieldValue('wr.location', mainRecord["wr.location"]['l']);
			this.subReqForm.setFieldValue('wr.block_id', mainRecord["wr.block_id"]['l']);
			this.subReqForm.setFieldValue('wr.unit_id', mainRecord["wr.unit_id"]['l']);
			this.subReqForm.setFieldValue('wr.charge_type', mainRecord["wr.charge_type"]['l']);
			this.subReqForm.setFieldValue('wr.prob_type', mainRecord["wr.prob_type"]['l']);
			this.subReqForm.setFieldValue('wr.supervisor', mainRecord["wr.supervisor"]['l']);
			this.subReqForm.setFieldValue('wr.manager', mainRecord["wr.manager"]['l']);
			this.subReqForm.setFieldValue('wr.priority', mainRecord["wr.priority"]['n']);
			this.subReqForm.setFieldValue('wr.work_team_id', 'CCC');
			this.subReqForm.setFieldValue('wr.activity_type', mainRecord["wr.activity_type"]['l']);
			this.subReqForm.setFieldValue('wr.eq_id', mainRecord["wr.eq_id"]['l']);
			this.subReqForm.setFieldValue('wr.description', mainRecord["wr.description"]['l']);
			this.subReqForm.setFieldValue('wr.dv_id', mainRecord["wr.dv_id"]['l']);
			this.subReqForm.setFieldValue('wr.dp_id', mainRecord["wr.dp_id"]['l']);
			this.subReqForm.setFieldValue('wr.cf_notes', mainRecord["wr.cf_notes"]['l']);
			this.subReqForm.setFieldValue('wr.serv_window_start', mainRecord["wr.serv_window_start"]['l']);
			this.subReqForm.setFieldValue('wr.serv_window_end', mainRecord["wr.serv_window_end"]['l']);

			this.subReqForm.setFieldValue('wr.cause_type', mainRecord["wr.cause_type"]['l']);
			this.subReqForm.setFieldValue('wr.towing', mainRecord["wr.towing"]['n']);
			this.subReqForm.setFieldValue('wr.budget_owner', mainRecord["wr.budget_owner"]['l']);
			this.subReqForm.setFieldValue('wr.po', mainRecord["wr.po"]['l']);
			this.subReqForm.setFieldValue('wr.po_doc', mainRecord["wr.po_doc"]['l']);
			this.subReqForm.setFieldValue('wr.incident_no', mainRecord["wr.incident_no"]['l']);
			this.subReqForm.setFieldValue('wr.ins_no', mainRecord["wr.ins_no"]['l']);
			this.subReqForm.setFieldValue('wr.driver', mainRecord["wr.driver"]['l']);
			this.subReqForm.setFieldValue('wr.comments_mgr', mainRecord["wr.comments_mgr"]['l']);
			this.subReqForm.setFieldValue('wr.comments_risk', mainRecord["wr.comments_risk"]['l']);

			var wrStatus = 'A'
			if ( mainRecord["wr.tr_id"]['l'] == "FLEET") {
				wrStatus = 'I'
				this.subReqForm.setFieldValue('wr.tr_id', mainRecord["wr.tr_id"]['l']);
			}







			//parse account code
			//if the Internal starts with FMD then replace it with FMD000000
			var acct = mainRecord["wr.ac_id"]['l'];
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
			//mark=acct.indexOf('-',mark+1);
			var affiliate= acct.substring(position);

			//If FMD is found in the internal replace with FMD000000
			if (internal.indexOf('FMD') != -1)
			{
				internal="FMD000000";
			}
			acct = bu + "-" + fund + "-" + dept + "-" + account + "-" + program + "-" + internal + "-" + project + "-" + affiliate;
			this.subReqForm.record.values['wr.ac_id'] = acct;
		//	this.subReqForm.record.values['wr.status'] = wrStatus;
if (!brgTest){
			uc_psAccountCode(bu,fund,dept,account,program,internal,project,affiliate,'doNothing',0);
}
			this.subReqForm.record.values['wr.status'] =wrStatus;
			this.subReqForm.setFieldValue('wr.status', wrStatus);
		}
	},

	// ************************************************************************
	// Handler for the before save function.
	//
	// Appends the Reason for the sub request to the description.
	// ************************************************************************
	subReqForm_beforeSave: function() {
		// append the parent wr_id and the comments to the description field

		var requestID = this.mainWrId;

		
		//var origDesc = UC.Data.getDataValue('wr', 'description', "wr_id="+requestID);
		//var origCFNotes = UC.Data.getDataValue('wr', 'cf_notes', "wr_id="+requestID);
		
		var origDesc = this.subReqForm.getFieldValue('wr.description') + "\n";
		var origCFNotes = this.subReqForm.getFieldValue('wr.cf_notes');
		
	

		var parentId = "Parent Request WR#: " + this.mainWrId + "\r\n";
		var parentCFNotesText = "Parent Request Craftpersons Notes: \r\n";
		
		
		/*
		var selectBox = $("workUnitDropDown");
		var selectedWorkUnit = selectBox.options[selectBox.selectedIndex].text;
		if (selectedWorkUnit == "") {
			View.showMessage("Please select a Work Unit for this Sub-Request.");
			return false;
		}
		*/

		var selectBox = $("workTeamDropDown");
		var selectedWorkTeam = selectBox.options[selectBox.selectedIndex].text;
		if (selectedWorkTeam == "") {
			View.showMessage("Please select a Work Team for this Sub-Request.");
			return false;
		}

		var newDesc = "REASON FOR SUB-REQUEST: (Assign To: "+ selectedWorkTeam +") " + replaceLF(this.subReqForm.getFieldValue('subwrcomments')) + "\r\n" + parentId + " " + origDesc;
		var newNotes = parentCFNotesText.concat(replaceLF(origCFNotes));

		
		// Need to set the record directly also, otherwise, the line feeds does
		// not save correctly.
		this.subReqForm.record.setValue('wr.description', newDesc);
		this.subReqForm.setFieldValue('wr.description', newDesc);
		
		this.subReqForm.record.setValue('wr.cf_notes', "");
		this.subReqForm.setFieldValue('wr.cf_notes', "**************************  \r\n" + replaceLF(newNotes) + "\r\n  **************************   ");
		

//		this.subReqForm.record.values['wr.description'] = parentId + origDesc +
//			"\r\n\r\nREASON FOR SUB-REQUEST: " + this.subReqForm.getFieldValue('subwrcomments');
	},

	// ************************************************************************
	// After Save "handler" for the form.
	//
	// After saving/creating of the sub work request:
	// 		- attach the work request to the wo.
	//		- execute the opener callback.
	//    - close dialog.
	// ************************************************************************
	subReqForm_afterSave: function() {
		// attach work request to the wo
        var wr_records = [{"wr.wr_id": this.subReqForm.record.getValue('wr.wr_id')}];
		var wrStatus = this.subReqForm.record.getValue('wr.status')
        var result = {};
        try {
            result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-assignWrToWo',wr_records, this.mainWoId);
			//If the status was originally set to I then we have to reset it to i since the assignWRToWo updated it to AA
			if (wrStatus == 'I') {
				var newRec = new Ab.data.Record();
				newRec.isNew = false;
				newRec.setValue('wr.wr_id', this.subReqForm.record.getValue('wr.wr_id'));
				newRec.setValue('wr.status', 'I');
				newRec.oldValues = new Object();
				newRec.oldValues['wr.wr_id'] = this.subReqForm.record.getValue('wr.wr_id');
				var ds = View.dataSources.get(this.subReqForm.dataSourceId);
				ds.saveRecord(newRec);
			}
            // successful, execute the opener callback function
			if (this.openerCallback != null) {
				this.openerCallback(this.subReqForm.getFieldValue('wr.wr_id'));
			}

			var openerView = View.getOpenerView();
			if (openerView != undefined || openerView != null) {
				openerView.closeDialog();
			}
        }
        catch (e) {
            Workflow.handleError(e);
        }
	},

	createWorkUnitDropDown: function() {
		var trRest = "1=1";
		var trRecords = UC.Data.getDataRecords("tr", ["tr_id"], trRest);

		var selectBox = $("workTeamDropDown");
		for (var i = 0; i < trRecords.length; i++) {
			var option = document.createElement("option");
			option.text = trRecords[i]["tr.tr_id"];
			try {
				// for IE earlier than version 8
				selectBox.add(option,selectBox.options[null]);
			}
			catch (e) {
				selectBox.add(option,null);
			}
		}
	},

	createWorkTeamDropDown: function() {
		var wtRest = "1=1";
		var wtRecords = UC.Data.getDataRecords("work_team", ["work_team_id"], wtRest);

		var selectBox = $("workTeamDropDown");
		for (var i = 0; i < wtRecords.length; i++) {
			var option = document.createElement("option");
			option.text = wtRecords[i]["work_team.work_team_id"];
			try {
				// for IE earlier than version 8
				selectBox.add(option,selectBox.options[null]);
			}
			catch (e) {
				selectBox.add(option,null);
			}
		}
	}
});

//doNothing function -- checking account codes needs to have a function as a parameter.
//This is called if no function is required to be run afterwards.
function doNothing()
{
}

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
