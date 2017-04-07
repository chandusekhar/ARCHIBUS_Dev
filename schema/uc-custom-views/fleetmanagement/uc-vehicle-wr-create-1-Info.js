// 2010/05/10 - EWONG - Issue: 129. Clear fl/rm when changing bl, clear dp when changing dv.
// 2010/05/21 - EWONG - Issue: 167. Validate the pre-filled fields.
// 2010/05/21 - EWONG - Issue: 192. Error when CCC change and saves em.
// 2010/08/11 - JJYCHAN - ISSUE 241 - Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
// 2010/09/01 - JJYCHAN - ISSUE 26 - Added function to open unitis window.

// *****************************************************************************
// View controller object for the Info tab.
// *****************************************************************************
var infoTabController = View.createController('infoTabController', {
	formChanged: false,

	afterViewLoad: function() {


		this.inherit();
	},

	afterInitialDataFetch: function() {
		// load the current user information
		var emId = View.user.employee.id;
		emId.replace("'", "''");	// If id has single quotes change them to double single quote (sql)
		this.my_info_form.refresh("em_id='"+emId+"'");
	},

	my_info_form_afterRefresh: function() {
		// check the user's role and enable the requestor field
		var role = View.user.role;

		this.my_info_form.setFieldValue('dv.name.display', this.my_info_form.getRecord().getValue('dv.name'));
		this.my_info_form.setFieldValue('dp.name.display', this.my_info_form.getRecord().getValue('dp.name'));

		switch (role) {
		case "ARCHIBUS/FM SYSTEM ADMINISTRATOR":
		case "WORKPLACE ADMIN":		// add additional case statements for other roles.
		case "UC-CSC":
			// enable requestor field
			this.my_info_form.enableField("em.em_id", true);
			this.my_info_form.fields.get("em.em_id").actions.get("emSelect").show(true);
			break;
		default:
			break;
		}
	},


	openUnitisLink: function()
	{
		//establish the document for passing it on.
		//View.detailsDocument = document;

		View.openDialog('uc-unitis-link.axvw', null, true, {
				width: 820,
				height: 700,
				closeButton: true
		});

	},

	openRoomReportLink: function()
	{
			View.openDialog('uc-vehicle-wr-error-report.axvw', null, true, {
				width: 600,
				height: 600,
				closeButton: true
		});
	}

});

// *****************************************************************************
// Save record and go to the details tab.
// *****************************************************************************
function goToDetailsTab()
{
	var form = View.getControl('', 'my_info_form');
	infoTabController.formChanged = infoTabController.formChanged || afm_form_values_changed;
	
	/*
	if (form.canSave()) {
		// check if form has changed
		if (infoTabController.formChanged) {
				View.confirm(getMessage("confirmChangeSave"), function(button) {
						if (button == 'yes') {
							if (saveEmRecord()) {
								moveToNextTab();
							}
						}
						else	{
							moveToNextTab();
						}
					});
		}
		else {
			moveToNextTab();
		}
	}
	*/

	moveToNextTab();
}

// *****************************************************************************
// Helper function to move to next tab
// *****************************************************************************
function moveToNextTab()
{
	var infoPanel = View.panels.get('my_info_form');

	// verify that the information is valid for fields used for pre-filled
	// information (em.em_id, dp.dp_id, dp.dv_id)
	var em_id = UC.Data.getDataValue('em', 'em_id', "em_id='"+infoPanel.getFieldValue('em.em_id').replace(/'/g,"''")+"'");
	if (em_id == null) {
		infoPanel.fields.get('em.em_id').setInvalid(getMessage('invalidEmName'));
		infoPanel.displayValidationResult({message:''});
		return;
	}

	if (infoPanel.getFieldValue('em.dv_id') != "" && infoPanel.getFieldValue('em.dp_id').replace(/'/g,"''") != "") {
		var dp_id = UC.Data.getDataValue('dp', 'dp_id', "dv_id='"+infoPanel.getFieldValue('em.dv_id').replace(/'/g,"''")+
			"' AND dp_id='"+infoPanel.getFieldValue('em.dp_id').replace(/'/g,"''")+"'");
		if (dp_id == null) {
			infoPanel.fields.get('em.dv_id').setInvalid(getMessage('invalidDpId'));
			infoPanel.fields.get('em.dp_id').setInvalid(getMessage('invalidDpId'));
			infoPanel.displayValidationResult({message:''});
			return;
		}
	}

	// save (update email links if necessary) and move to next screen
	var newEmail = infoPanel.getFieldValue('em.email');
	var oldEmail = infoPanel.getOldFieldValues()['em.email'];

	if (infoPanel.save() != true) {
		// saving has errored. do not continue.
		return false;
	}
	if (newEmail != oldEmail) {
		// update the afm_users table
		var username = View.user.name;

		var afmUserRecord = new Ab.data.Record();
		afmUserRecord.isNew = false;
		afmUserRecord.setValue('afm_users.user_name', username);
		afmUserRecord.setValue('afm_users.email', newEmail);
		afmUserRecord.oldValues = new Object();
		afmUserRecord.oldValues['afm_users.user_name'] = username;
		View.dataSources.get('ds_afm_users').saveRecord(afmUserRecord);

		// update the cf table (if nessary)
		// get the cf record with the old email address.
		var cfRecord = View.dataSources.get('ds_cf').getRecord("cf.email = '"+oldEmail.replace("'","''")+"'");
		if (cfRecord.getValue('cf.cf_id') != null) {
			cfRecord.setValue('cf.email', newEmail);
			View.dataSources.get('ds_cf').saveRecord(cfRecord);
		}
	}

	// select the next tab and prefill information
	var detailsController = View.controllers.get('detailsTabController');
	if (detailsController != undefined) {
		detailsController.prefillInfo();
	}
	
	View.getControl('', 'wr_create_tabs').selectTab('create_wr_details');
}

// *****************************************************************************
// Saves Em record
// *****************************************************************************
function saveEmRecord()
{
	var success = false;

	var form = View.getControl('', 'my_info_form');

	// Check if the email has changed.
	// If email has changed, we *must* update the afm_users and cf (if they
	// are craftsperson, otherwise Archibus will lose the link.
	var newEmail = form.getFieldValue('em.email');
	var oldEmail = form.getOldFieldValues()['em.email'];

	//var oldDiv = form.getOldFieldValues()['em.dv_id'];
	//var oldDep = form.getOldFieldValues()['em.dp_id'];
	//var oldTel = form.getOldFieldValues()['em.phone'];


	var emailChanged = (newEmail != oldEmail);


	// Save function the form.
	if (form.save() != true) {
		// saving has errored. do not continue.
		return success;
	}

	if (emailChanged) {
		// update the afm_users table
		var username = View.user.name;

		var afmUserRecord = new Ab.data.Record();
		afmUserRecord.isNew = false;
		afmUserRecord.setValue('afm_users.user_name', username);
		afmUserRecord.setValue('afm_users.email', newEmail);
		afmUserRecord.oldValues = new Object();
		afmUserRecord.oldValues['afm_users.user_name'] = username;
		View.dataSources.get('ds_afm_users').saveRecord(afmUserRecord);

		// update the cf table (if nessary)
		// get the cf record with the old email address.
		var cfRecord = View.dataSources.get('ds_cf').getRecord("cf.email = '"+oldEmail.replace("'","''")+"'");
		if (cfRecord.getValue('cf.cf_id') != null) {
			cfRecord.setValue('cf.email', newEmail);
			View.dataSources.get('ds_cf').saveRecord(cfRecord);
		}
	}

	var emailString = "<table>" +
					  "  <tr>" +
					  "    <td><b>Username:</b></td>" +
					  "    <td>" + View.user.name + "</td>" +
					  "    <td>" + View.user.name + "</td>" +
					  "  </tr>" +
					  "  <tr>" +
					  "    <td><b>Phone:</b></td>" +
					  "    <td>" + form.getOldFieldValues()['em.phone'] + "<br>" + "</td>" +
					  "    <td>" + form.getFieldValue('em.phone') + "</td>" +
					  "  </tr>" +
					  "  <tr>" +
					  "    <td><b>Email:</b></td>" +
					  "    <td>" + oldEmail + "<br>" + "</td>" +
					  "    <td>" + newEmail + "</td>" +
					  "  </tr>" +
					  "</table><br><br><hr>";

	var footerUnitis = "* You have received this email because you are part of the mailing list workspace.unitis@ucalgary.ca.*<br>" +
					   "* Contact afm@ucalgary.ca if you have any questions or for more information.*";

	var footerReq = "* You have received this email because you have changed your personal information in Archibus.*<br>" +
					"* Contact afm@ucalgary.ca if you have any questions or for more information.*";

	uc_email('workspace.unitis@ucalgary.ca',
						 'afm@ucalgary.ca',
						 'A Request has been entered to change contact information.',
						 emailString + footerUnitis,
						 'standard.template');

	for (i=1;i<1000;i++)
	{
		//delay?
	}

	uc_email(newEmail,
			'afm@ucalgary.ca',
			'Contact information change requested.',
			'A request has been entered to update your contact information as seen below.  This change may take several days to be complete.<br>' + emailString + footerReq,
			'standard.template');

	success = true;
	return success;
}


function pausecomp(millis)
{
	var date=new Date();
	var curDate = null;

	do {curDate = newDate();}
	while (curDate-date < millis);

}

// *****************************************************************************
// Called after the em select value is
// *****************************************************************************
function afterEmChange(fieldName, selectedValue, previousValue)
{
	if (fieldName == "em.em_id" && selectedValue != previousValue) {
		infoTabController.my_info_form.refresh("em_id='"+selectedValue.replace("'", "''")+"'");
	}
	// return false so no fields are actually updated.
	return false;
}

// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearMyInfoFl() {
	var form = View.getControl('', 'my_info_form');
	form.setFieldValue('em.fl_id', '');
	form.setFieldValue('em.rm_id', '');
	return true;
}

// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearMyInfoDp() {
	var form = View.getControl('', 'my_info_form');
	form.setFieldValue('em.dp_id', '');
	form.setFieldValue('dp.name.display', '');
	return true;
}
