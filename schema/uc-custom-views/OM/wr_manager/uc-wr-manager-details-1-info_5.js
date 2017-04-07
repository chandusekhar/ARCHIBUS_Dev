// CHANGE LOG:
// 2010/04/06 - JJYCHAN - ISSUE 35: changed the Enabled for Create-Subrequest to a binding expr
// 2010/04/07 - EWONG - Added call to new page security function and created custom handler specific to the details view.
// 2010/04/07 - EWONG - ISSUE 29: Added onchange function for the tr_id (Primary Trade) to revert status back to AA on change.
// 2010/04/08 - JJYCHAN - ISSUE 67: Added function requestorInfo_afterRefresh().  Used for the Requestor Info.
// 2010/04/08 - JJYCHAN - ISSUE 69: work Requests can be cancelled without an account code.
// 2010/04/13 - JJYCHAN - ISSUE 79: Parts complete added to list of dropdown filtering.
// 2010/04/15 - EWONG - ISSUE 29: Added a listener onTradeChange for the Select Value to call the onchange event.
// 2010/04/15 - JJYCHAN - ISSUE 110: changed function validateAcct to check trade 'CCC' rather than 'CSC
// 2010/04/15 - JJYCHAN - ISSUE 59: Modified error reporting to show username and date.
// 2010/04/19 - JJYCHAN	- ISSUE 105: Moved placement of the 'case "HL":case "HA":' so that it doesn't call the
//						  hold for parts function.
// 2010/04/19 - EWONG - ISSUE 29: Fixed an issue where the status wasn't correctly saved the second time.
// 2010/04/19 - EWONG - ISSUE 83: Changed "Auto Select Account" button to Disabled depending on charge_type.
// 2010/04/19 - EWONG - ISSUE 108: Fixed the status display (removeStatusEnum function) for Parts Completed.
// 2010/04/19 - JJYCHAN - ISSUE 125: Removed Closed status from the dropdown status when WR is complete or stopped.
// 2010/04/20 - JJYCHAN - ISSUE 152: A change of trade does not activate prompt or status lockdown if the WR is already in 'AA'
// 2010/05/06 - EWONG - ISSUE:158 - Save cfnote directly to record to preserve line feeds.
// 2010/05/10 - EWONG - ISSUE:153 - Added updateAcctDesc function.
// 2010/05/10 - EWONG - ISSUE:159 - Enable Create Sub Request button for Parts Completed.
// 2010/05/11 - JJYCHAN	 - Added Field Work Complete to the dropdown menu.
// 2010/05/12 - EWONG	- Fixed linefeeds saving properly for cf notes and also re-query latest notes before appending.
// 2010/05/12 - EWONG	- Fixed issuing sub-request from issuing all related requests.
// 2010/06/02 - JJYCHAN - Revamped account code checker
// 2010/07/08 - JJYCHAN	 - Changed the audit function to be more legible.  Also removed wr.location from the list of
//						   audited fields.
// 2010/07/07 - EWONG - ISSUE 231: Added Equipment Information Popup.
// 2010/07/07 - EWONG - ISSUE 187: Send email to requestor on Reject (Cancel).
// 2010/07/07 - EWONG - ISSUE 246: Fixed an issue where changing a value back to the original value after saving will
//              not save the changes.
// 2010/07/13 - EWONG - ISSUE 240: Fixed a formatting issue when ac description is overly long.
// 2010/07/21 - EWONG - ISSUE 215: Added Requestor information the "Report Error" email.
// 2010/08/12 - EWONG - Changed workspace@ucalgary.ca to afm@ucalgary.ca
// 2010/08/12 - EWONG - Added 'Create New Request' button (enabled for UC-CSC).
// 2010/08/17 - EWONG - ISSUE 258: Fixed a formatting issue when ac description is overly long. Used a different method
//                      the previous method causes unintention formatting side-effects.
// 2010/09/02 - JJYCHAN - ISSUE 310: Added Rejected email text [Automated]
// 2010/09/16 - EWONG - Removed an early debug "return" causing the emailing to be skipped.
// 2010/09/23 - EWONG - ISSUE: 324 : Fixed issue with auditing a status change when it was aborted.  Checking
//                       validation for "Hold for Parts" moved to before the saveAudit.
// 2010/11/04 - JJYCHAN - Removed status' "Campus Planning Approval" and "FMIT Polyline" from the list of visible
// 2011/01/06 - JJYCHAN - Brought back status "FMIT Polyline"
// 2011/01/12 - EWONG - Allow wr with "RECORDS" trade to be completed without costs.
// 2011/01/12 - EWONG - ISSUE: 385 : Fixed issue with the POL status not showing the correct dropdown.  POL only shows up for tr_id = 'RECORDS'
// 2011/01-19 - JJYCHAN - Changed FMDCC number from 220-7777 to 210-7050
// 2011/03/15 - JJYCHAN	- Changed FMDCC number from 210-7050 to 220-7555
// 2012/07/19 - EWONG - For HP status, do not allow status changes (remove status options)
// 2014/06/02 - EWONG - Status change and prompt on change of work team instead of primary trade.
// 2016/01/14 - MSHUSSAI - WR358933 - Added new javascript function called sendEmailOnFWC in order to enable emails on change to FWC and also commented the code to send email on Complete.

var brgTest = false;
// *****************************************************************************
// View controller object for the Info tab.
// *****************************************************************************
var nameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;text-transform:lowercase;'>{0}</span>", nameFieldTemplate : "{0}",
        textColor : "#000000", defaultValue : "", raw : false };

var emNameLabelConfig = {lengthLimit : 100, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "<b>ph#:</b>  {0}<br/><b>cl#:</b>  {1}<br/><b>email:</b>  {2}",
        textColor : "#000000", defaultValue : "", raw : false };

var infoTabController = View.createController('infoTabController', {
	afterSaveWorkflowFunc: null,
	returnedAcctString: null,
	returnToCCC:false,
	// ************************************************************************
	afterViewLoad: function() {
		this.inherit();


		// Set this controller as the InfoTabController in the opener controller.
		var openerView = View.getOpenerView();
		if (openerView != undefined) {
			var openerCtrl = openerView.controllers.get("managerDetailsController");
			openerCtrl.infoTabController = this;
		}

	},

	// ************************************************************************
	// After refresh event handler.
	nav_details_info_afterRefresh: function() {

		// apply security
		UC.FieldSecurity.applyFieldSecurityCustom = applyFieldSecurityCustom;
		UC.FieldSecurity.applyFieldSecurity(this.nav_details_info, 'wr', View.user.role);

		// restrict the status dropdown
		this.nav_details_info.setFieldValue(
			'wr.status.display', this.nav_details_info.getFieldValue('wr.status'));


		this.removeStatusEnum(this.nav_details_info.fields.get('wr.status.display'));

		// change the style of the readOnly cf_note to make it more readable.
		// Note: It's changed here instead of using the 'style' tag within the field
		// due to it causing other formatting issues.
		this.nav_details_info.fields.get('wr.cf_notes').dom.style.color = "#000000";

		// fill in zone_id
		this.nav_details_info.setFieldValue('bl.zone_id.display', this.nav_details_info.getRecord().getValue('bl.zone_id'));

		// fill in eq_std, description
		this.nav_details_info.setFieldValue('eq.eq_std.display', this.nav_details_info.getRecord().getValue('eq.eq_std'));

		//fill in date_requested,time_requested
		var d = new Date();
		d = this.nav_details_info.getRecord().getValue('wr.date_requested');
		var reqdate = formatDate(d);


		var t = new Date();
		t = this.nav_details_info.getRecord().getValue('wr.time_requested');
		var hours = formatTime(t);
		this.nav_details_info.setFieldValue('wr.date_requested.display', reqdate + ' ' + hours);

		// get current account code
		var acct = this.nav_details_info.getFieldValue('wr.ac_id');

		//parse account code
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

		$('ac_id_part1').value = bu;
		$('ac_id_part2').value = fund;
		$('ac_id_part3').value = dept;
		$('ac_id_part4').value = account;
		$('ac_id_part5').value = program;
		$('ac_id_part6').value = internal;
		$('ac_id_part7').value = project;
		$('ac_id_part8').value = affiliate;


		// Disable/Enable Account Button
		charge_type_change();

		// fill account code description
		//$("ac_desc_value").value = this.nav_details_info.getFieldValue('ac.acdesc');

		BRG.UI.addNameField('prob_cat_name', this.nav_details_info, 'wr.prob_type', 'probtype', 'prob_cat',
        {'probtype.prob_type' : 'wr.prob_type'},
        nameLabelConfig);

		BRG.UI.addNameField('eq_std_name', this.nav_details_info, 'wr.eq_id', 'eq', 'eq_std',
        {'eq.eq_id' : 'wr.eq_id'},
        nameLabelConfig);

		BRG.UI.addNameField('requestor_info', this.nav_details_info, 'wr.requestor', 'em', ['phone','cellular_number','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
        
        if(parseInt(this.nav_details_info.record.values['wr.hazard_count']) == 0) {
            document.getElementById('nav_details_info_hazard_icon_labelCell').innerHTML = '';
            document.getElementById('nav_details_info_hazard_icon_fieldCell').innerHTML = '';
        }
	},


	// ************************************************************************
	// Before save event handler.  Called automatically when "saveForm" command is
	// issued.  Do extra validation or processing here.
	nav_details_info_beforeSave: function() {
		var continueSave = true;
		var wrId = this.nav_details_info.getFieldValue('wr.wr_id');
		if (this.validateAcct(this.returnedAcctString)) {
			// after validation, we will copy the new notes (if there's a value) to the
			// cf_notes field with a user and timestamp.
			var newNotes = this.nav_details_info.getFieldValue('wr.cf_notes.new');
			if (newNotes != "") {
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

				//var cfNotes = this.nav_details_info.record.getValue('wr.cf_notes');
				// query database for the newest cf_notes.
				cfNotes = UC.Data.getDataValue('wr', 'cf_notes', "wr_id="+wrId);

				// For Firefox: (replace lone \n chars with \r\n)
				newNotes = replaceLF(newNotes);

				cfNotes = cfNotes + "\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

				//this.nav_details_info.record.setValue('wr.cf_notes', cfNotes);
				this.nav_details_info.setFieldValue('wr.cf_notes', cfNotes);
				this.nav_details_info.setFieldValue('wr.cf_notes.new', "");

				// For IE: doesn't refresh the cf_notes div.
				$('Shownav_details_info_wr.cf_notes').innerHTML = cfNotes.replace(/\r\n/g,"<br/>");
			}

			// do any necessary pre-checks and conditions based on status change.
			var oldStatus = this.nav_details_info.getFieldValue('wr.status');
			var newStatus = this.nav_details_info.getFieldValue('wr.status.display');
			if (newStatus != oldStatus) {
					// call the corresponding helper functions
					switch (newStatus) {
					case "HP":
						continueSave = this.precheckHoldParts();
						break;
					default:
						break;
					}
			}

			// check the priority, if set to Date Specific (5), check the date_assigned
			/*if (this.nav_details_info.getFieldValue('wr.priority') == 5 &&
				this.nav_details_info.getFieldValue('wr.date_assigned') == '') {
					View.showMessage(getMessage('noDateToPerformForPriority'));
					continueSave = false;
			}*/

			if (!continueSave) {
				return continueSave;
			}

			// after validations, save the audit values
			if (this.saveWrAuditValues()) {
				// Audit successful, continue with save.

				// check the old and new status.  If it's changed, we will need to run the
				// appropriate workflows before the record is saved.
				//
				// Note: status change workflows also updates the record with the field values,
				//       so the audit workflow must be called first.


				if (newStatus != oldStatus) {
					// call the corresponding helper functions

					switch (newStatus) {
					case "I":
						if (oldStatus == "AA") {
							// issueWorkRequest workflow need to be called after save.
							this.afterSaveWorkflowFunc = this.issueWorkRequest;
						} else {
							// statusChange is called before save.
							continueSave = this.workRequestStatusChange();
						}
						break;

					case "HP":
						continueSave = this.holdPartsWorkRequest();
						break;
					case "HL":
					case "HA":
					case "HD":
					case "PO":
					case "PC":
					case "S":
					case "Exp":
						// statusChange workflow is called before save
						continueSave = this.workRequestStatusChange();
						break;
					case "FWC":
						// statusChange workflow is called before save (for FWC does extra check to send email).						
						continueSave = this.workRequestStatusChange();
						this.afterSaveWorkflowFunc = this.sendEmailOnFWC;
						break;
					case "Com":
						// statusChange workflow is called before save (for Complete does extra check).
						continueSave = this.completeWorkRequest();
						this.afterSaveWorkflowFunc = this.sendEmailOnComplete;
						break;
					case "Can":
						// cancelWorkRequest workflow need to be called after save.
						this.afterSaveWorkflowFunc = this.cancelWorkRequest;
						break;
					case "Clo":
						// closeWorkRequest workflow need to be called after save.
						this.afterSaveWorkflowFunc = this.closeWorkRequest;
						break;
					default:	// no workflow needed, just copy over the status
						this.nav_details_info.record.setValue('wr.status', oldStatus);		// bug in Archibus always setting the old value as new value.
						this.nav_details_info.setFieldValue('wr.status', newStatus);
						continueSave = true;
						break;
					}
				}
			}
			else {
				continueSave = false;
			}

			if (continueSave && this.afterSaveWorkflowFunc == null) {
				this.afterSaveWorkflowFunc = this.refreshSearchGrid;
			}

			//alert("From the save:" + this.nav_details_info.getFieldValue('wr.ac_id'));
			// continue with saving
		}
		else {
			continueSave = false;
		}




		//********************
		//Save to Audit Table
		//********************
		var auditDescription;

		//insert wr number.
		auditDescription = "wr.wr_id:" + this.nav_details_info.getFieldValue('wr.wr_id') + "\n";
		//because of the dropdown, status is a special case for auditing.
		var oldStatus = this.nav_details_info.getFieldValue('wr.status');
		var newStatus = this.nav_details_info.getFieldValue('wr.status.display');
		if (oldStatus != newStatus) {
			auditDescription = auditDescription + "wr.status:" + oldStatus + "/" + newStatus + "\n";
		}
		//audit all of the other fields
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.requestor");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.prob_type");
		//auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.location");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.bl_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.fl_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.rm_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.eq_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.ac_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.priority");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.cf_notes");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.tr_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.charge_type");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.block_id");
		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.unit_id");

		//build the audit record
		var afmAuditRecord= new Ab.data.Record();
		var username = View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);

		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);


		return continueSave;
	},


	// ************************************************************************
	// Checks the Account Code (through PHP) and call the saveInfoForm function
	// if successful.
	// ************************************************************************
	checkAcctAndSave: function() {
		var wrid = this.nav_details_info.getFieldValue('wr.wr_id');
		var charge_type = this.nav_details_info.getFieldValue('wr.charge_type');

		//bh addded to check if the WR has been returned to CCC by a non CCC user - if so set to blank
		this.returnToCCC=(View.user.role != 'UC-CSC' && this.nav_details_info.record.values["wr.work_team_id"] !='CCC' && this.nav_details_info.getFieldValue('wr.work_team_id') =='CCC' && this.nav_details_info.getFieldValue('wr.charge_type') !='Core' && this.nav_details_info.getFieldValue('wr.prob_type').substr(0,5) !='FLEET')
		if (this.returnToCCC) {
			saveInfoFormCallback("")
			return;
		}

		//alert(charge_type.toUpperCase());
		if (brgTest) {
			var brgAc = $('ac_id_part1').value + '-' + $('ac_id_part2').value + '-' + $('ac_id_part3').value + '-' + $('ac_id_part4').value + '-' + $('ac_id_part5').value  ;
			if ( $('ac_id_part6').value=="") {
				brgAc = brgAc + '-FMD' + this.nav_details_info.getFieldValue('wr.wr_id')
			} else {
				brgAc = brgAc + '-' +  $('ac_id_part6')
			}
			if ( $('ac_id_part7').value=="") {
				brgAc = brgAc + '-00000000'
			} else {
				brgAc = brgAc + '-' +  $('ac_id_part7')
			}
			if ( $('ac_id_part8').value=="") {
				brgAc = brgAc + '-000000'
			} else {
				brgAc = brgAc + '-' +  $('ac_id_part8')
			}
			try{
				//Save ac record first
				var acRecord= new Ab.data.Record();
				acRecord.isNew = true;
				acRecord.setValue('ac.ac_id', brgAc);
				View.dataSources.get('ds_ac_check').saveRecord(acRecord);
			}
			catch(e) {
			}
			saveInfoFormCallback(brgAc)
		}
		else {
			uc_psAccountCode(
				$('ac_id_part1').value,
				$('ac_id_part2').value,
				$('ac_id_part3').value,
				$('ac_id_part4').value,
				$('ac_id_part5').value,
				$('ac_id_part6').value,
				$('ac_id_part7').value,
				$('ac_id_part8').value,
				'saveInfoFormCallback',wrid, charge_type.toUpperCase());
		}
	},

	// ************************************************************************
	// Provides the custom validation/save sequence for the nav_details_info
	// form.
	// ************************************************************************
	saveInfoForm: function() {
		View.openProgressBar("Saving. Please wait...");

		if (this.nav_details_info.save()) {
			// successful - call the afterSaveWorkflow
			this.afterSaveWorkflow();
			// refresh the left nav panel

			// copy the new values to the old values (archibus not updating it automatically)
			// need to call getRecord first to even update the record.values object.
			// This was causing an issue when changing a value, saving, then change the value
			// back to the original value and saving.  The second save will not reupdate the data.
			this.nav_details_info.getRecord();
			this.nav_details_info.record.oldValues = this.nav_details_info.record.values;
		}
		// close progress bar
		View.closeProgressBar();
	},

	// **********************************************************************
	// validateAcct: function(acct)
	// Checks to see if account code is valid from peoplesoft
	// parameter: acct - account code returned from PHP code
	// Returns: success - true false.
	// **********************************************************************
	validateAcct: function(acct) {
		var success = true;

		//bh added code to change account to blank if the WR is returned to 'CCC' (work_team_id is changed to 'CCC')
		if (this.returnToCCC) {
			this.nav_details_info.setFieldValue('wr.ac_id', '');
			this.nav_details_info.setFieldValue('wr.status', 'AA');
			$('ac_id_part1').value=""
			$('ac_id_part2').value=""
			$('ac_id_part3').value=""
			$('ac_id_part4').value=""
			$('ac_id_part5').value=""
			$('ac_id_part6').value=""
			$('ac_id_part7').value=""
			$('ac_id_part8').value=""
			return success
		}
		//check to see if the ac_id entered is null
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
		if (parsed_ac_id=="") {
			var ac_id="";
		}
		else {
			var ac_id=acct.replace("\r\n\r\n", "");
		};

		var ac_rest = "ac_id = '"+ac_id+"'";

		switch(ac_id)
		{
				case "1":
					View.showMessage(getMessage('error_Account1'));
					success = false;
					break;
				case "2":
					View.showMessage(getMessage('error_Account2'));
					success = false;
					break;
				case "3":
					View.showMessage(getMessage('error_Account3'));
					success = false;
					break;
				case "4":
					View.showMessage(getMessage('error_Account4'));
					success = false;
					break;
				case "5":
					View.showMessage(getMessage('error_Account5'));
					success = false;
					break;
				case "6":
					View.showMessage(getMessage('error_Account6'));
					success = false;
					break;
				case "7":
					View.showMessage(getMessage('error_Account7'));
					success = false;
					break;
				case "8":
					View.showMessage(getMessage('error_Account8'));
					success = false;
					break;
				case "99":
					View.showMessage(getMessage('error_Account99'));
					success = false;
					break;
				case "0":
					View.showMessage(getMessage('error_invalidAccount'));
					success = false;
					break;
		};

		if (success)
		{

			var split_ac_id = ac_id.split("-");
			//alert(split_ac_id.length);
			if (split_ac_id.length != "1" && split_ac_id.length != "8") {
				View.showMessage(getMessage('error_invalidAccount'));
				success = false;
			}
		}



		if (success)
		{

			if ((ac_id.substr(0,5) == "UCALG") ||
				(ac_id.substr(0,5) == "FHOBO") ||
				(ac_id.substr(0,5) == "ARCTC") ||
				(ac_id == ""))
			{
				this.nav_details_info.setFieldValue('wr.ac_id', ac_id);
			}
			else
			{
				View.showMessage(getMessage('error_Account99'));
				success = false;
			};
		}
		else
		{
			View.closeProgressBar();
			//View.showMessage(getMessage('error_invalidAccount'));
			//this.validationResult.valid = false;
		};




		//if the ac_id is null, and the status is not 'AA' or the trade is not 'CCC' then show error
		var status=this.nav_details_info.getFieldValue('wr.status.display');
		var workUnit=this.nav_details_info.getFieldValue('wr.work_team_id');

		if (ac_id == "") {
			//alert("ac_id is null");
			if (status != 'AA' && status != 'Can' && status != 'Rej') {
				success = false;
				View.showMessage("Status invalid without an account");
			}
			else if (workUnit != 'CCC') {
				success = false;
				View.showMessage("A Work Unit cannot be assigned without an account");
			}
		}

		return success;
	},

	// ************************************************************************
	// Updates the readonly acct description.
	// ************************************************************************
	updateAcctDesc: function() {
		// get the description of the current account string.
		var acId = $('ac_id_part1').value + "-" +
			$('ac_id_part2').value + "-" +
			$('ac_id_part3').value + "-" +
			$('ac_id_part4').value + "-" +
			$('ac_id_part5').value + "-" +
			$('ac_id_part6').value + "-" +
			$('ac_id_part7').value + "-" +
			$('ac_id_part8').value;
		var acctDescription = UC.Data.getDataValue('ac', 'description', "ac_id='"+acId.replace(/'/g, "''")+"'");
		$('Shownav_details_info_ac.acdesc').innerHTML = acctDescription;
	},

	// ************************************************************************
	// Calls any needed workflows after saving
	//
	// Used to call the Issue/Cancel/Close workflows
	// ************************************************************************
	afterSaveWorkflow: function() {

		// check if a afterSaveWorkflow function is set, if so, call it
		if (this.afterSaveWorkflowFunc != null) {
			this.afterSaveWorkflowFunc();
		}
		// reset the afterSave function.
		this.afterSaveWorkflowFunc = null;

		// update the status
		this.nav_details_info.setFieldValue(
			'wr.status', this.nav_details_info.getFieldValue('wr.status.display'));

		// copy the status selectBox to the status.display selectBox and reselect
		var statusEnum = UC.Data.getDataValue('afm_flds', 'enum_list', "table_name='wr' AND field_name='status'");
		UC.UI.setEnumSelect(this.nav_details_info.fields.get('wr.status.display').dom,
			statusEnum, 'R', 'Clo');

		this.nav_details_info.setFieldValue(
			'wr.status.display', this.nav_details_info.getFieldValue('wr.status'));
		this.removeStatusEnum(this.nav_details_info.fields.get('wr.status.display'));
		this.nav_details_info.enableField("wr.status.display", true);	// make editable in case it was set to readonly

		this.refreshCreateSubReqBtn();
		//this.nav_details_info.refresh();	// Disable for save message dropdown.

	},


	// ************************************************************************
	// (Helper) Function to Save the audit function.
	//
	// Calls the uc_auditWrSave workflow to save the audit values into the
	// audit table.
	saveWrAuditValues: function() {
			var parameters = {
					'user_name': View.user.employee.id,
					'wr_id': this.nav_details_info.getFieldValue('wr.wr_id'),
					'newValues': toJSON( {'wr.status':this.nav_details_info.getFieldValue('wr.status.display'),
										  'wr.tr_id': this.nav_details_info.getFieldValue('wr.tr_id'),
										  'wr.work_team_id': this.nav_details_info.getFieldValue('wr.work_team_id')})
			};

			var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
			if (result.code != 'executed') {
					Workflow.handleError(result);
					return false;
			}

			return true;
	},


	// ************************************************************************
	// (Helper) Function to return the form's record values for using in the
	// work request workflows.
	getWorkflowRecordValues: function() {
		/*
		var ds = View.dataSources.get(this.nav_details_info.dataSourceId);
		var record = this.nav_details_info.getRecord();
		var recordValues = ds.processOutboundRecord(record).values;
		*/

		var recordValues = {};

		var panel = this.nav_details_info;
		panel.getRecord();
		panel.fields.each(function(field){
			if (/^wr./.test(field.getFullName())) {
				recordValues[field.getFullName()] = panel.getFieldValue(field.getFullName());
			}
		});

		// remove record values that aren't part of the actual records.
		//delete recordValues['wr.cf_notes.new'];
		//delete recordValues['wr.status.display'];

		return recordValues;
	},


	// ************************************************************************
	// Calls the Archibus workflows for Cancelling work requests (from AA status).
	//
	// Note: For the SLA steps to be executed, be sure that the status in the form is not
	// updated/saved before this function is called.
	//
	// The workflow will also save the record.
	cancelWorkRequest: function() {
		var success = false;

		var wr_id = this.nav_details_info.getFieldValue('wr.wr_id');


		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequest',wr_id);
			this.sendEmailOnReject();
			this.refreshSearchGrid();

			View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href =
					"uc-wr-manager-hwr-details.axvw?wrId="+wr_id;


			success = true;
		} catch (e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
				Workflow.handleError(e);
			}
		}

		return success;
	},


	// ************************************************************************
	// Calls the Archibus workflows for updating work request status.
	//
	// Used for the status HA/HP/HL/Stop/Com.
	//
	// Note: For the SLA steps to be executed, be sure that the status in the form is not
	// updated/saved before this function is called.
	//
	// The workflow will also save the record.  beforeSave is explicitly called.
	workRequestStatusChange: function() {
		var success = false;

		var recordValues = this.getWorkflowRecordValues();
		var wr_id = this.nav_details_info.getFieldValue('wr.wr_id');
		var status = this.nav_details_info.getFieldValue('wr.status.display');

		var result = {};
		try {
			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, status);
			this.refreshSearchGrid();
			success = true;
		} catch(e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
			   Workflow.handleError(e);
			}
		}

		return success;
	},

	// ************************************************************************
	// Checks for any 0 costs in the wrcf/wrpt/wrtl/wr_other table before allowing a status
	// change to "Complete"
	completeWorkRequest: function() {
		var readyToComplete = true;
		var wrId = this.nav_details_info.record.getValue("wr.wr_id");
		var trId = this.nav_details_info.record.getValue("wr.tr_id");
		var record;

		// restriction works for wrcf/wrtl/wr_other (wrpt is cost_actual, but wrpt not used)
		//////////////////////////////////////////////////////////////////////////////////////////////
		var restCF = "wr_id="+wrId+" AND cost_total <= 0 AND (SELECT tr_id FROM wr WHERE wr.wr_id = wrcf.wr_id) <> 'RECORDS' AND entry_type = 'Timecard'";
		var restPT = "wr_id="+wrId+" AND cost_total <= 0 AND (SELECT tr_id FROM wr WHERE wr.wr_id = wrpt.wr_id) <> 'RECORDS'";
		var rest_other = "wr_id="+wrId+" AND fulfilled='0'";

		// check wrcf
		if (readyToComplete) {
			record = UC.Data.getDataRecord('wrcf', ['wr_id'], restCF);
			if (record != null) {
				readyToComplete = false;
			}
		}

		// check wrpt
		if (readyToComplete) {
			record = UC.Data.getDataRecord('wrtl', ['wr_id'], restPT);
			if (record != null) {
				readyToComplete = false;
			}
		}

		// check wrtl
		//if (readyToComplete) {
		//	record = UC.Data.getDataRecord('wr_other', ['wr_id'], rest);
		//	if (record != null) {
		//		readyToComplete = false;
		//	}
		//}


		//WR Other is different - 0 costs are accepted, but each request must be fulfilled
		if (readyToComplete) {
			record = UC.Data.getDataRecord('wr_other', ['wr_id'], rest_other);
			if (record != null) {
				readyToComplete = false;
			}
		}

		// run status change workflow if all costs are accounted for.
		if (readyToComplete) {
			return this.workRequestStatusChange();
		}
		else {
			View.showMessage(getMessage('error_zeroCosts'));
			var oldStatus = this.nav_details_info.getFieldValue('wr.status');
			this.nav_details_info.setFieldValue('wr.status.display', oldStatus);
			return false;
		}


		alert("You are completing this request");


	},

	// ************************************************************************
	// Checks for any unfulfilled parts wr_other table before allowing a status
	// change to "Hold for Parts"
	precheckHoldParts: function() {
		var readyToHold = true;
		var wrId = this.nav_details_info.record.getValue("wr.wr_id");

		var record;

		// restriction works for wrcf/wrtl/wr_other (wrpt is cost_actual, but wrpt not used)
		var rest = "wr_id="+wrId+" AND fulfilled='0'";

		// check wrcf
		if (readyToHold) {
			record = UC.Data.getDataRecord('wr_other', ['wr_id'], rest);
			if (record == null) {
				readyToHold = false;
			}
		}

		// run status change workflow if all costs are accounted for.
		if (!readyToHold) {
			View.showMessage(getMessage('error_noParts'));
			var oldStatus = this.nav_details_info.getFieldValue('wr.status');
			this.nav_details_info.setFieldValue('wr.status.display', oldStatus);
			return false;
		}

		return readyToHold;
	},

	// ************************************************************************
	// Run Work Request status change workflows
	holdPartsWorkRequest: function() {
		return this.workRequestStatusChange();
	},

	// ************************************************************************
	// Calls the Archibus workflows for Issuing work requests (from AA status).
	//
	// Note: For the SLA steps to be executed, be sure that the status in the form is not
	// updated/saved before this function is called.
	issueWorkRequest: function() {
		var success = false;

		// Determine if it's a sub-request (no activity id and not a prev. maint)
		if (this.nav_details_info.record.getValue('wr.activity_log_id') == "" &&
				this.nav_details_info.record.getValue('wr.prob_type') != 'PREV MAINT') {
			// For sub-requests, the parent workorder is already issued, so we will
			// only issue the work request (otherwise, re-issuing the wo will also
			// issue all other sibling requests).
			var wr_id = this.nav_details_info.record.getValue('wr.wr_id');

			var parameters = {
				'wr.wr_id':wr_id
			};

			try {
				Workflow.call('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequest', parameters);
				this.refreshSearchGrid();
				success = true;
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}
		else {
			// Issue the work order (which issues all underlying wr) for the
			// main request.
			var wo_id = this.nav_details_info.record.getValue('wr.wo_id');

			var result = {};
			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkorder', wo_id);
				this.refreshSearchGrid();
				success = true;
			} catch (e) {
			  if (e.code == 'ruleFailed') {
				  View.showMessage(e.message);
			  } else{
				  Workflow.handleError(e);
			  }
			}
		}

		/* Old code using issueWorkRequests workflow
	var wr_records = "[{wr_id:'" + this.nav_details_info.record.getValue('wr.wr_id')
			+ "',wo_id:'" + this.nav_details_info.record.getValue('wr.wo_id') + "'}]";

		var parameters = {
			'records':wr_records
		};

		try {
			Workflow.call('AbBldgOpsOnDemandWork-issueWorkRequests', parameters);
			this.refreshSearchGrid();
			success = true;
		}
		catch (e) {
			Workflow.handleError(e);
		}
		*/

		return success;
	},

	// ************************************************************************
	// Calls the Archibus workflows for Closing work requests.
	//
	// Note: For the SLA steps to be executed, be sure that the status in the form is not
	// updated/saved before this function is called.
	//
	// The workflow will also save the record.
	closeWorkRequest: function() {
		var success = false;
		var wr_id = this.nav_details_info.getFieldValue('wr.wr_id');

		var records = [{"wr.wr_id": wr_id}];

		var result = {};
		try{
			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkRequests', records);

			this.refreshSearchGrid();

			View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href =
					"uc-wr-manager-hwr-details.axvw?wrId="+wr_id;

			success = true;
		} catch(e){
			 if (e.code == 'ruleFailed') {
				View.showMessage(e.message);
			}
			else {
				Workflow.handleError(e);
			}
			return;
		}

		try {
			Workflow.call('AbBldgOpsOnDemandWork-closeWorkRequest', parameters);

			this.refreshSearchGrid();

			/*  //NOT SURE WHY THIS IS IN AN IF STATEMENT
			if (this.nav_details_info.getFieldValue('wr.wr_id') == '') {
				// Load the Historical Report Form since it is now archived.
				View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href =
					"uc-wr-manager-hwr-details.axvw?wrId="+wr_id;
			}
			*/

			View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href =
					"uc-wr-manager-hwr-details.axvw?wrId="+wr_id;

			/*
			// Disable Save Button
			this.nav_details_info.actions.get('save').enable(false);
			View.showMessage(getMessage('wrArchivedMessage'));

			// Close Details View (after 2 seconds)
			setTimeout("View.getControl('','wr_details_frame').frame.dom.contentWindow.location.href = null;",2000);
			*/

			success = true;
		}
		catch (e) {
			Workflow.handleError(e);
		}

		return success;
	},

	// ************************************************************************
	// (Helper) Function to remove non-relevant statuses from the status drop
	// down.
	removeStatusEnum: function(statusField) {
		if (statusField != undefined) {
			var statusValue = this.nav_details_info.getFieldValue('wr.status');
			var statusDropDown = statusField.dom;

			switch (statusValue) {
				case "R":
				case "Rej":
					UC.UI.restrictDropDown(statusDropDown, 'R', 'Rej');
					break;
				case "A":
					UC.UI.restrictDropDown(statusDropDown, 'A', 'AA');
					break;
				case "AA":
				case "Prj":
					UC.UI.restrictDropDown(statusDropDown, 'AA', 'Can');
					UC.UI.removeOption(statusDropDown, 'HP');
					UC.UI.removeOption(statusDropDown, 'HL');
					UC.UI.removeOption(statusDropDown, 'HA');
					UC.UI.removeOption(statusDropDown, 'HD');
					UC.UI.removeOption(statusDropDown, 'PC');
					UC.UI.removeOption(statusDropDown, 'Exp');
					UC.UI.removeOption(statusDropDown, 'Sto');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				case "I":
				case "HL":
				case "HA":
				case "HD":
					UC.UI.restrictDropDown(statusDropDown, 'I', 'Com');
					UC.UI.removeOption(statusDropDown, 'PC');
					UC.UI.removeOption(statusDropDown, 'Can');
					UC.UI.removeOption(statusDropDown, 'CPA');
					if (this.nav_details_info.getFieldValue('wr.tr_id') != 'RECORDS') {
						UC.UI.removeOption(statusDropDown, 'POL');
					}
					break;
				case "PC":
					UC.UI.restrictDropDown(statusDropDown, 'I', 'Com');
					UC.UI.removeOption(statusDropDown, 'Can');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				case "FWC":
				case "S":
				case "CPA":
				case "POL":
					UC.UI.removeOption(statusDropDown, 'PC');
					UC.UI.restrictDropDown(statusDropDown, 'I', 'Com');
					UC.UI.removeOption(statusDropDown, 'Exp');
					UC.UI.removeOption(statusDropDown, 'Can');
					if (statusValue != 'CPA') {
						UC.UI.removeOption(statusDropDown, 'CPA');
					}
					if (statusValue != 'POL') {
						UC.UI.removeOption(statusDropDown, 'POL');
					}
					break;
				case "HP":
					UC.UI.restrictDropDown(statusDropDown, 'I', 'Com');
					break;
				case "Exp":
					UC.UI.restrictDropDown(statusDropDown, 'S', 'Com');
					UC.UI.removeOption(statusDropDown, 'Can');
					//UC.UI.removeOption(statusDropDown, 'Clo');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				case "Com":
					//UC.UI.restrictDropDown(statusDropDown, 'S', 'Clo');
					UC.UI.restrictDropDown(statusDropDown, 'S', 'Com');
					UC.UI.removeOption(statusDropDown, 'Can');
					UC.UI.removeOption(statusDropDown, 'Exp');
					//UC.UI.removeOption(statusDropDown, 'Clo');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				case "Can":
					UC.UI.restrictDropDown(statusDropDown, 'Can', 'Clo');
					UC.UI.removeOption(statusDropDown, 'Clo');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				case "Clo":
					UC.UI.restrictDropDown(statusDropDown, 'Clo', 'Clo');
					UC.UI.removeOption(statusDropDown, 'CPA');
					UC.UI.removeOption(statusDropDown, 'POL');
					break;
				default:
					break;
			}
		}
	},

	// ************************************************************************
	// Checks the Form in the infoTab for changes.
	//
	// Returns true if there are changes that need saving, false otherwise.
	// ************************************************************************
	checkFormChanged: function()
	{
		// move the focus to another element so any onChange event is fired
		this.nav_details_info.fields.get('wr.bl_id').dom.focus();
		this.nav_details_info.fields.get('wr.status.display').dom.focus();

		var formChanged = afm_form_values_changed;

		return formChanged;
	},


	// ************************************************************************
	// Refreshes the searchGrid after a status update.
	// ************************************************************************
	refreshSearchGrid: function()
	{
		try {
			var mainPanelView = View.getOpenerView().getOpenerView();
			mainPanelView.panels.get('nav_tabs').refreshTab('page2');
		}
		catch (ex) {
		}

	},

	// ************************************************************************
	// Opens a dialog with the equipment information.
	// ************************************************************************
	openEqInfo: function() {
		var restriction = "eq.eq_id = '"+this.nav_details_info.getFieldValue("wr.eq_id").replace(/'/g,"''")+"'";
		this.eqInfo.refresh(restriction);
		this.eqInfo.showInWindow({
						newRecord: false,
			closeButton: false
		});
	},

	//*************************************************************************
	// Opens a dialog with the Room Information
	//*************************************************************************
	openRmInfo: function() {
		if (this.nav_details_info.getFieldValue("wr.rm_id")=="") {
			alert ("There is no room selected.");
		} else {

			var args = new Object ();

			args.width = 900;
			args.height = 600;
			args.closeButton = false;

			//var myDlgCmd = new Ab.command.openDialog(args);
			var r = new Ab.view.Restriction();
			r.addClause("rm.bl_id", this.nav_details_info.getFieldValue("wr.bl_id"), "=", true);
			r.addClause("rm.fl_id", this.nav_details_info.getFieldValue("wr.fl_id"), "=", true);
			r.addClause("rm.rm_id", this.nav_details_info.getFieldValue("wr.rm_id"), "=", true);


			View.openDialog('uc-rm-info.axvw', r, false, args);

		/*
			var restriction = "?blId="+this.nav_details_info.getFieldValue("wr.bl_id") +
				"&flId="+this.nav_details_info.getFieldValue("wr.fl_id") +
				"&rmId="+this.nav_details_info.getFieldValue("wr.rm_id");

			window.open('uc-rm-Info.axvw'+restriction, 'newWindow',
				'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

		*/

		}
	},

	//******************************************************************************
	// Send an email to the MO administrator or Drawing admin if an error is reported
	//******************************************************************************
	errorReportPanel_beforeSave: function()
	{
		var continueSave = true;

		var errorForm = View.getControl('', 'errorReportPanel');


		var description = errorForm.getFieldValue("uc_eq_error_report.description");
		var sendTo = "";
		var subject = "";


		//if description is blank, stop
		if (description == '') {
			continueSave = false;
			View.showMessage("Description must be entered.");
			return continueSave;
		}

		var wrId = errorForm.getFieldValue('uc_eq_error_report.wr_id');

		var emailMessage = 	  "<table>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Reference Work Request:</b>" +
							  "    </td>" +
							  "    <td>" +
							  errorForm.getFieldValue('uc_eq_error_report.wr_id') +
							  "    </td>" +
							  "  </tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Requestor:</b>" +
							  "    </td>" +
							  "    <td>" +
							  this.nav_details_info.getFieldValue('wr.requestor') +
							  "    </td>" +
							  "  </tr>" +
							  "<tr><td><b>Location:</b></td>" +
							  "<td>" + this.nav_details_info.getFieldValue('wr.bl_id') + "/" + this.nav_details_info.getFieldValue('wr.fl_id') + "/" + this.nav_details_info.getFieldValue('wr.rm_id') +"</td></tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Equipment Code:</b>" +
							  "    </td>" +
							  "    <td>" +
							  this.nav_details_info.getFieldValue('wr.eq_id') +
							  "    </td>" +
							  "  </tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Description:</b>" +
							  "    </td>" +
							  "    <td>" +
							  description +
							  "    </td>" +
							  "  </tr>" +
							  "</table><br><br><hr>";

	//alert(emailMessage);

		//get the value of the error type
		var errorType = errorForm.getFieldValue("uc_eq_error_report.error_type");

		//set the email address to send to
		if (errorType == "WR") {
			sendTo = "FMDCustomerCare@ucalgary.ca";
			bodyId = "UC_WRMANAGER_WRERROR_BODY";
			subjectId = "UC_WRMANAGER_WRERROR_SUBJECT";

			subject = "A Work Request Error has been reported";
			//email header
			emailBody = "<b>Archibus Work Request Error</b><br><br>" +
						"The following information is a summary of a submitted Work Request error<br><br>" + emailMessage;
		}
		else if (errorType == "EQUIP") {
			sendTo = "afmmaint@ucalgary.ca";
			subject = "An Equipment Error has been reported";
			//email header
			emailBody = "<b>Archibus Equipment/Bar Code Error</b><br><br>" +
						"The following information is a summary of a submitted equipment error<br><br>" + emailMessage;
			//email footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afmmaint@ucalgary.ca.*<br>" +
								    "*Contact afm@ucalgary.ca if you have any questions or for more information.*";
		}
		else if (errorType == "CONDITION") {
			sendTo = "afmmaint@ucalgary.ca";
			subject = "An Equipment Condition Error has been reported";
			//email header
			emailBody = "<b>Archibus Equipment/Bar Code Condition Change</b><br><br>" +
						"The following information is a summary of a submitted equipment condition change.<br><br>" + emailMessage;
			//email Footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afmmaint@ucalgary.ca.*<br>" +
								    "*Contact afm@ucalgary.ca if you have any questions or for more information.*";
		}
		else	{
			sendTo = "afm.records@ucalgary.ca";
			subject = "A Room Error has been reported";
			//email header
			emailBody = "<b>A Room Error has been reported by a craftsperson</b><br><br>The following information is a summary of a submitted room error<br><br>" + emailMessage;
			//email Footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afm.records@ucalgary.ca.*<br>" +
								    "*Contact afm@ucalgary.ca if you have any questions or for more information.*";

		}


		// Email
		uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
		/*
		try {
			var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRMANAGER_REJ_BODY','UC_WRMANAGER_REJ_SUBJECT','wr','wr_id',thisWrId,
			'', sendTo);
		}
		catch (ex) {

		}
		*/

		alert("Your error report has been sent. An email has been sent to " + sendTo + " regarding this issue.");
		return continueSave;
	},

	// ************************************************************************
	// Opens up the Create Sub Request dialog.
	// ************************************************************************
	createSubReq: function() {
		var thisController = this;

		View.openDialog('uc-wr-subrequest-create.axvw', null, true, {
			closeButton: false,
			// This gets called after the dialog views afterRefresh/afterInitialDataFetch.
			afterInitialDataFetch: function(dialogView) {
				// pass the callback to the dialog view and also the record (for copying information)
				var dialogController = dialogView.controllers.get('subRequestController');
				dialogController.openerCallback = thisController.createSubReq_callback.createDelegate(thisController);
				dialogController.mainWrId = thisController.nav_details_info.getFieldValue('wr.wr_id');

				// call the function to copy over the relevant wr information.
				dialogController.copyInformation();
			}
		});

	},

	// ************************************************************************
	// Callback function for the Create Sub Request dialog
	//
	// If subWrId is not undefined/null, it will update the description field
	// with a reference to the sub request id.
	// ************************************************************************
	createSubReq_callback: function(subWrId) {
		if (subWrId != undefined && subWrId != null) {
			var reqDescPrefix = "Additional Sub Request: ";
			var childReq = reqDescPrefix+subWrId+"\r\n";
			var origDesc = this.nav_details_info.getFieldValue('wr.description');
			var extraline = "";

			if (origDesc.substring(0, reqDescPrefix.length) != reqDescPrefix) {
				extraline = "\r\n";
			}

			var newDesc = childReq+extraline+origDesc;

			this.nav_details_info.setFieldValue('wr.description', newDesc);

			// save just the description
			var newRec = new Ab.data.Record();
			newRec.isNew = false;
			newRec.setValue('wr.wr_id', this.nav_details_info.getFieldValue('wr.wr_id'));
			newRec.setValue('wr.description', newDesc);
			newRec.oldValues = new Object();
			newRec.oldValues['wr.wr_id'] = this.nav_details_info.getFieldValue('wr.wr_id');

			View.dataSources.get(this.nav_details_info.dataSourceId).saveRecord(newRec);

			//View.showMessage(getMessage('subReqCreated'));
			this.nav_details_info.displayValidationResult({message:getMessage('subReqCreated')});
			this.refreshSearchGrid();

			// Show Work Package Tab.
			var openerView = View.getOpenerView();
			if (openerView != undefined) {
				openerView.controllers.get("managerDetailsController").showHideWrkPkgTab();
			}

		}
	},

	// ************************************************************************
	// Enables or disables the Create Sub Request button depending on the status
	// ************************************************************************
	refreshCreateSubReqBtn: function() {
		// enable create sub-request button (if status == I, HA, HP, HL)
		var wrStatus = this.nav_details_info.getFieldValue('wr.status');
		var enableBtn = false;

		switch (wrStatus) {

		case 'I':
			enableBtn = true;
			break;
		case 'HP':
			enableBtn = true;
			break;
		case 'HA':
			enableBtn = true;
			break;
		case 'HL':
			enableBtn = true;
			break;
		case 'HD':
			enableBtn = true;
			break;
		case 'PC':
			enableBtn = true;
			break;
		default:
			enableBtn = false;
		}

		this.nav_details_info.actions.get('createSubReq').enableButton(enableBtn);
		return enableBtn;
	},

	openAccountSelect: function()
	{
		//establish the document for passing it on.
		View.detailsDocument = document;


		View.openDialog('uc-accountselector.axvw', null, true, {
				width: 600,
				height: 300,
				closeButton: false
		});
	},

	openPaginatedReport: function() {
		var wrId = this.nav_details_info.getFieldValue('wr.wr_id');
		View.openDialog("ab-paginated-report-job.axvw?viewName=uc-wr-pagereport.axvw&newtab=true&showresult=true&wr.wr_id="+wrId+"");
	},

	// ************************************************************************
	// Sends an email to the requestor when the work request is cancelled(Rejected).
	//
	// Note: Send Email to original requestor if the request is rejected/cancelled.
	// ************************************************************************
	sendEmailOnReject: function() {
		var sendEmail = false;

		// check for the main wr
		var thisWrId = this.nav_details_info.getFieldValue('wr.wr_id');
		var thisWoId = this.nav_details_info.record.getValue('wr.wo_id');

		//var mainReqRest = "wr_id = (SELECT MIN(wr_id) FROM wr t WHERE t.wo_id = "+thisWoId+")";
		//var openReq = UC.Data.getDataValue('wo', 'qty_open_wr',  "wo_id = "+thisWoId);

		var sendToEmail = null;

		sendEmail = true;
		sendToEmail = this.getEmailForEm(this.nav_details_info.getFieldValue('wr.requestor'));
		/*
		if (openReq == 0) {
			// send email to original requestor.
			var mainRequestor = UC.Data.getDataValue('wr','requestor', mainReqRest);
			sendToEmail = this.getEmailForEm(mainRequestor);
			sendEmail = true;
		}
		else {
			// if not the main request, send email to the requestor (cf)
			var mainWrId = UC.Data.getDataValue('wr', 'wr_id', mainReqRest);
			if (mainWrId != thisWrId) {
				sendToEmail = this.getEmailForEm(this.nav_details_info.getFieldValue('wr.requestor'));
				sendEmail = true;
			}
		}
		*/

		if (sendEmail && sendToEmail != null) {
			var sendTo = sendToEmail;
			var subject = "[Automated] Work Request ["+thisWrId+"] Rejected";
			var emailMessage = "";

			//email header
			/*
			var emailBody = "The following Work Request has been Rejected.<br>" +
							"For more information on why this ticket has been rejected please " +
							"contact FMD Customer Care at fmdcustomercare@ucalgary.ca or 403-220-7555.<br><br>" + emailMessage;
			//email Footer

			emailBody = emailBody + "<table>";

			emailBody = emailBody +
					"<tr><td><b>Ticket ID:</b></td>" +
					"<td>" + thisWrId +"</td></tr>";

			emailBody = emailBody +
					"<tr><td><b>Description:</b></td>" +
					"<td>" + this.nav_details_info.getFieldValue('wr.description') +"</td></tr>";

			emailBody = emailBody +
				"</table><br/>Kind regards,<br/>Facilities Management and Development<br/><hr/>" +
				"*You have received this email because you are listed as the requestor.*<br>" +
				"* Contact FMDCustomerCare@ucalgary.ca if you have any questions or for more information.*";
			//emailBody = emailBody + "*Contact afm@ucalgary.ca if you have any questions or for more information.*";
			*/

			// Email
			alert("Sending Email to "+sendTo);
			//alert(emailBody);
			try {
				var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
				'UC_WRMANAGER_REJ_BODY','UC_WRMANAGER_REJ_SUBJECT','wr','wr_id',thisWrId,
				'', sendTo);
			}
			catch (ex) {

			}
			//uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
		}
	},

	// ************************************************************************
	// Sends an email to the requestor when the work request is completed.
	//
	// Note: Send Email to original requestor if all wr are completed (no open
	//       requests.  If sub-request completed send email to requestor.
	// ************************************************************************
	sendEmailOnComplete: function() {
		var sendEmail = false;

		// check for the main wr
		var thisWrId = this.nav_details_info.getFieldValue('wr.wr_id');
		var thisWoId = this.nav_details_info.record.getValue('wr.wo_id');
		var mainReqRest = "wr_id = (SELECT MIN(wr_id) FROM wr t WHERE t.wo_id = "+thisWoId+")";

		var openReq = UC.Data.getDataValue('wo', 'qty_open_wr',  "wo_id = "+thisWoId);

		var sendToEmail = null;

		if (openReq == 0) {
			// send email to original requestor.
			var mainRequestor = UC.Data.getDataValue('wr','requestor', mainReqRest);
			sendToEmail = this.getEmailForEm(mainRequestor);
			
			//Commented the below line to avoid sending emails on status change to Complete
			//sendEmail = true;
		}
		else {
			// if not the main request, send email to the requestor (cf)
			var mainWrId = UC.Data.getDataValue('wr', 'wr_id', mainReqRest);
			if (mainWrId != thisWrId) {
				sendToEmail = this.getEmailForEm(this.nav_details_info.getFieldValue('wr.requestor'));
				
				//Commented the below line to avoid sending emails on status change to Complete
				//sendEmail = true;
			}
		}

		if (sendEmail && sendToEmail != null) {
			var sendTo = sendToEmail;
			var subject = "[Automated] Work Request ["+thisWrId+"] Completed";
			var emailMessage = "";

			//email header
			/*
			var emailBody = "The following Work Request has been Completed:<br><br>" + emailMessage;
			//email Footer

			emailBody = emailBody + "<table>";

			emailBody = emailBody +
					"<tr><td><b>Ticket ID:</b></td>" +
					"<td>" + thisWrId +"</td></tr>";

			emailBody = emailBody +
					"<tr><td><b>Description:</b></td>" +
					"<td>" + this.nav_details_info.getFieldValue('wr.description') +"</td></tr>";

			emailBody = emailBody +
				"</table><br/>Kind regards,<br/>Facilities Management and Development<br/><hr/>" +
				"*You have received this email because you are listed as the requestor.*<br>" +
				"* Contact FMDCustomerCare@ucalgary.ca if you have any questions or for more information.*";
			//emailBody = emailBody + "*Contact afm@ucalgary.ca if you have any questions or for more information.*";
			*/

			// Email
			alert("Sending Email to "+sendTo);
			//alert(emailBody);
			try {
				var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
				'UC_WRMANAGER_COM_BODY','UC_WRMANAGER_COM_SUBJECT','wr','wr_id',thisWrId,
				'', sendTo);
			}
			catch (ex) {

			}
			//uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
		}
	},

	// *****************************************************************************************
	// Sends an email to the requestor when the work request is marked as Field Work Complete.
	//
	// Note: Send Email to original requestor of the Work Order and not the Work Request
	// when the ticket is marked as FWC (no open
	//       requests).  If all sub-requests completed send email to requestor of the work order.
	// ******************************************************************************************
	sendEmailOnFWC: function() {
		var sendEmail = false;

		var fwcCount = null;
		
		var totalCount = null;
		
		// check for the main wr
		var thisWrId = this.nav_details_info.getFieldValue('wr.wr_id');
		var thisWoId = this.nav_details_info.record.getValue('wr.wo_id');
		var workTeamId = this.nav_details_info.record.getValue('wr.work_team_id');
		var mainReqRest = "wr_id = (SELECT MIN(wr_id) FROM wr t WHERE t.wo_id = "+thisWoId+")";

		//var openReq = "SELECT COUNT(wr_id) countwr FROM wr WHERE wo_id = "+thisWoId+" and status='FWC'";
		//var openReqRest = "wo_id = "+thisWoId+" and status='FWC'";
		//var openReqCount = UC.Data.getDataValue('wr','countwr', openReq);
		//var fwcCount = this.nav_details_info.getFieldValue('wr.fwc_count');
		//var totalCount = this.nav_details_info.getFieldValue('wr.total_count');		
		
		var fwcCount = this.nav_details_info.record.getValue('wr.fwc_count');
		
		//We are using Totalcound -1 below since the status is not updated until the email is sent and the page reloads
		var totalCount = (this.nav_details_info.record.getValue('wr.total_count')) - 1;		

		var sendToEmail = null;

		if (fwcCount == totalCount) {
			// send email to original requestor.
			var mainRequestor = UC.Data.getDataValue('wr','requestor', mainReqRest);
			var mainWRID = UC.Data.getDataValue('wr','wr_id', mainReqRest);
			sendToEmail = this.getEmailForEm(mainRequestor);
			sendEmail = true;
		}
		else {
			// if not the main request, send email to the requestor (cf)
			/*var mainWrId = UC.Data.getDataValue('wr', 'wr_id', mainReqRest);
			if (mainWrId != thisWrId) {
				sendToEmail = this.getEmailForEm(this.nav_details_info.getFieldValue('wr.requestor'));
				sendEmail = true;
			}*/
			sendEmail = false;
		}

		if (sendEmail && sendToEmail != null) {
			var sendTo = sendToEmail;
			
			// Email
			alert("Sending Email to "+sendTo);
			
			try {
				if (workTeamId == 'RESIDENCE') {
					var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
					'UC_RESIDENCE_FWC_BODY','UC_RESIDENCE_FWC_SUBJECT','wr','wr_id',mainWRID,
					'', sendTo);
				}
				else {
					var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
					'UC_WRMANAGER_FWC_BODY','UC_WRMANAGER_FWC_SUBJECT','wr','wr_id',mainWRID,
					'', sendTo);
				}
			}
			catch (ex) {

			}	
		}
	},

	// ************************************************************************
	// Retrieves the email address of emId from the database.
	// ************************************************************************
	getEmailForEm: function(emId) {
		var rest = "em_id = '"+emId.replace(/\'/g, "''")+"'";
		var email = UC.Data.getDataValue("em", "email", rest);
		return email;
	},

	// ************************************************************************
	// Reverts status to 'AA' if the Work Team is changed
	// ************************************************************************
	onWorkTeamChanged: function() {
		// ensure that work_team_id can be changed (from record status)
		// otherwise revert back to original.
		var status = this.nav_details_info.getFieldValue("wr.status");
		switch(status) {
			case 'S':
			case 'Can':
			case 'Com':
			case 'Clo':
			case 'Rej':
				View.showMessage(getMessage("workTeamId_status_invalid").replace("%1", status));
				// revert the work_team_id back to original.
				this.nav_details_info.setFieldValue("wr.work_team_id", this.nav_details_info.record.oldValues["wr.work_team_id"]);
				return;
				break;
			default:
				break;
		}
		if (status != 'AA') {
			View.showMessage(getMessage("workTeamId_changed"));
			// if work team changed, change status back to "AA"
			// refill the enum_list
			UC.UI.setEnumSelect(this.nav_details_info.fields.get('wr.status.display').dom,
				UC.Data.getDataValue('afm_flds', 'enum_list', "table_name='wr' AND field_name='status'"), 'R', 'Clo');
			this.nav_details_info.setFieldValue("wr.status.display", "AA");
			this.nav_details_info.enableField("wr.status.display", false);	// make readonly so that cannot be changed further.
		}
	},

	// ************************************************************************
	// Shows Requestor information when the Info button is clicked
	// ************************************************************************
	requestorInfo_afterRefresh: function() {


		var thisRequestor = this.nav_details_info.getFieldValue('wr.requestor');
		var em_dataSource = View.dataSources.get('em_ds');

		var restriction = new Ab.view.Restriction();
		restriction.addClause("em.em_id", thisRequestor, "=", true);

		var records=em_dataSource.getRecords(restriction);

		if (records.length == 1) {
			//set the field values
			this.requestorInfo.setFieldValue("name_first", records[0].getValue("em.name_first"));
			this.requestorInfo.setFieldValue("name_last", records[0].getValue("em.name_last"));
			this.requestorInfo.setFieldValue("email", records[0].getValue("em.email"));
			//this.requestorInfo.setFieldValue("phone", records[0].getValue("em.phone"));
			this.requestorInfo.setFieldValue("dv_id", records[0].getValue("dv.name"));
			this.requestorInfo.setFieldValue("dp_id", records[0].getValue("dp.name"));

		}

	},

	// ************************************************************************
	// Returns true if the Create New Request button should be enabled
	// ************************************************************************
	enableCreateNewReqBtn: function() {
		var hidden = true;

		if (View.user.role == 'UC-CSC') {
			hidden = false;
		}

		return hidden;
	},

	enableCreateRecordsReqBtn: function() {
		var hidden = true;
		var tr_id = this.nav_details_info.getFieldValue("wr.tr_id");
		if (tr_id == 'RECORDS') {
			hidden = false;
		}

		return hidden;
	}
});

// Select form for Room Code
function selectRooms() {
	var form = View.getControl('', 'nav_details_info');



	var bl_id = form.getFieldValue('wr.bl_id');
	var fl_id = form.getFieldValue('wr.fl_id');

	var restriction = "";


	if (bl_id != '') {
		//alert("JJYCHAN - Debugging room restriction - Thanks for your patience.");
		restriction = "rm.bl_id='" + bl_id + "'" + "AND rm.fl_id LIKE '%" + fl_id + "%'";
	}


	Ab.view.View.selectValue(
        'nav_details_info', 												//form name
		'Room', 															//name of select box
		['wr.bl_id', 'wr.fl_id', 'wr.rm_id'], 								//fields to fill on form
		'rm',																//table to gather fields
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id'], 								//fields used to fill form
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id','rmtype.description'], 			//fields to display
		restriction,														//restriction
		'', 																//actionListener
		false, 																//applyFilter
		false, 																//showIndex
		'', 																//workflowRuleId
		1000, 																//width
		500,																//height
		null,																//selectvaluetype
		null,																//recordlimit
		 toJSON([{fieldName : "rm.bl_id"},{fieldName : "rm.fl_id"},{fieldName : "rm.rm_id"}]));											//sortfields
}

// *****************************************************************************
// Callback function used to call the saveInfoForm in the controller.
//
// Called by the uc_checkAcct PHP code
// *****************************************************************************
function saveInfoFormCallback(acct)
{

	var acSplit = acct.split("-")

	//fill in the internal, project and affiliate if it's blank
	if (acSplit.length >4) { $('ac_id_part6').value = acSplit[5];}
	if (acSplit.length >5) {$('ac_id_part7').value = acSplit[6];}
	if (acSplit.length >6) {$('ac_id_part8').value = acSplit[7];}



	// Save the returned account string to the controller.
	infoTabController.returnedAcctString = acct;
	infoTabController.saveInfoForm();
}

// *****************************************************************************
// Fill in (readonly/hidden) primary key fields in Equipment Error Report
// *****************************************************************************
function fillErrorInfo()
{
	var tablename = "uc_eq_error_report";
	var editPanelName = "errorReportPanel";


	var infoForm = View.getControl('','nav_details_info');
	var errorForm = View.getControl('', 'errorReportPanel');


	// fill in wr_id and date/time
	if (tablename != undefined) {
		var panel = View.getControl('',editPanelName);
		//var record = panel.getRecord();
		record = panel.record;

		// get the wr_id from the restriction (the form is wr_id=23434)
		// we'll use substring, but need to ensure that the restriction is passed in
		// the above form (no quotes, no table_name) from uc-wr-manager-details.js
		var rest = View.restriction;
		var wrId = rest.substring(6);

		panel.setFieldValue(tablename+".user_name", View.user.name);

		panel.setFieldValue(tablename+".wr_id", wrId);
		//var eqId = infoForm.getFieldValue("wr.eq_id");
		//panel.setFieldValue(tablename+".eq_id", infoForm.getFieldValue("wr.eq_id"));
		//alert(eqId);

		emailMessage = "We have received your error report:<br><br>" +
				errorForm.getFieldValue(tablename + ".description") + "<br><br>" +
				"Thank you for your assistance.";
//		alert(View.user.email);

//		uc_email('jjychan@ucalgary.ca',
//						 'afm@ucalgary.ca',
//						 '[Automated] Your error report [' + errorForm.getFieldValue(tablename) + ".error_type")
//							+ '] has been submitted. '
//						 , emailMessage,
//						 'standard.template')


	}
}

// *****************************************************************************
// Open the Craftsperson Print window
//******************************************************************************
function openPrintWindow()
{
	var form = View.getControl('', 'nav_details_info');
	var wr_id = form.getFieldValue('wr.wr_id');
	window.open('uc-wr-manager-printcf.axvw?handler=com.archibus.config.ActionHandlerDrawing&wr.wr_id='+wr_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");
	alert(cookies);
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

}

function buildAuditString(auditString, formName, fieldName) {

	var form = View.getControl('', formName);
	var newVal = form.getFieldValue(fieldName);
	var oldVal = form.getOldFieldValues()[fieldName];
	var newstring = auditString;


	if (oldVal != newVal) {
			newstring = newstring + fieldName + "\nOld\n[" + oldVal + "]\nNew\n[" + newVal + "]\n\n";
	}

	return newstring;
}


// When the charge type is changed, enable or disable the Account selector
function charge_type_change() {
	var form = View.getControl('', 'nav_details_info');
	var charge_type = form.getFieldValue('wr.charge_type');
	if (charge_type == "Single Funding") {
		$('autoSelAcctBtn').disabled = true;
	}
	else {
		$('autoSelAcctBtn').disabled = false;
	}
}

// *****************************************************************************
// Custom Security Handler
// *****************************************************************************
function applyFieldSecurityCustom(form, field_name, allow)
{
	switch(field_name)
	{
	case "wr.status":
		form.enableField("wr.status.display", allow);
		break;
	case "wr.ac_id":
		if (!allow) {
			$('ac_id_part1').readOnly = true;
			$('ac_id_part2').readOnly = true;
			$('ac_id_part3').readOnly = true;
			$('ac_id_part4').readOnly = true;
			$('ac_id_part5').readOnly = true;
			$('ac_id_part6').readOnly = true;
			$('ac_id_part7').readOnly = true;
			$('ac_id_part8').readOnly = true;
		}
		break;
	default:
		// do nothing.
	}
}

// ********************************************************************************
// Date/Time handlers
// ********************************************************************************

function formatDate(d) {
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'pm' : 'am',
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	return days[d.getDay()]+' ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() ;
}

function formatTime(d) {
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'pm' : 'am',
	hoursfixed = hours > 12 ? hours-12 : hours,
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	return ' (' + hoursfixed + ':' + minutes + ampm + ')';
}

// *****************************************************************************
// Action Listener for the Trade (Primary Trade) Select Value box
// *****************************************************************************
function onWorkTeamSelect(fieldname, previousVal, selectedVal)
{
	if (fieldname == "wr.work_team_id" && previousVal != selectedVal) {
		infoTabController.onWorkTeamChanged();
	}
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

function emailRequest() {
    try {
        var wr_id = infoTabController.nav_details_info.getFieldValue('wr.wr_id')
        alert("Sending Email " + wr_id);
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-UCWorkRequestService-sendWrEmail',parseInt(wr_id),'ewong@brg.com');
        success = true;
    } catch (e){
        if (e.code == 'ruleFailed'){
            View.showMessage(e.message);
        }else{
            Workflow.handleError(e);
        }
    }
}

function showHazardsByRoom() {
    var restriction = {};
    restriction['uc_env_hazard_by_room.bl_id'] = infoTabController.nav_details_info.record.values['wr.bl_id'];
    restriction['uc_env_hazard_by_room.fl_id'] = infoTabController.nav_details_info.record.values['wr.fl_id'];
    restriction['uc_env_hazard_by_room.rm_id'] = infoTabController.nav_details_info.record.values['wr.rm_id'];
    
    View.openDialog('uc-hazard-by-room.axvw', restriction, false, {
        width: 580,
        height: 300
    });
}