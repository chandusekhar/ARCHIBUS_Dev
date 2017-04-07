var ucWrCreateMwrReportController = View.createController("ucWrCreateMwrReportController", {


	afterViewLoad: function() {
		/*bh turned off
		docCntrl.docTable='wrhwr';
		docCntrl.docTitle = "Work Request";
		docCntrl.docPkeyLabel = ["wrhwr","Work Request"];
//		docCntrl.docShowTable = false ;
	*/
	},
	
	afterInitialDataFetch: function() {
		//var probType = this.wr_create_report.getFieldValue("wr.prob_type");
		//var rest = "prob_type = '" + probType + "'";
		//var probCat = UC.Data.getDataValue('probtype', 'prob_cat', rest);
		
		//this.wr_create_report.setFieldValue("wr.prob_cat", probCat);
		/*bh turned off
		var value = window.location.parameters['doc'];
		if (value == 'y') {
			this.doc_grid.actions.get("add").button.events.click.fire();
		}
		*/
		sendRequestorEmail();
	},
	
	wr_create_report_afterRefresh: function() {
  		/*bh turned off
		docCntrl.docPkey= this.wr_create_report.getFieldValue("wr.wr_id");
		rest = "(uc_docs_extension.table_name='"+docCntrl.docTable+"' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "')";
		
		View.panels.get('doc_grid').refresh(rest); 
		*/
	}
});

/* function createNewRequest()
{
// clear/reload the create tabs and change to the "My Information" tab
			
	View.getControl('', 'my_info_form').refresh();
	View.getControl('', 'wr_create_details').refresh();
	View.panels.get('wr_create_tabs').selectTab('create_wr_info');
} */

function sendRequestorEmail()
{
	//var infoForm = View.getControl('','my_info_form');
	var summaryForm = View.getControl('','wr_create_report');

	var eLocation = summaryForm.getFieldValue('wr.bl_id') + "/" + summaryForm.getFieldValue('wr.fl_id') + "/" + summaryForm.getFieldValue('wr.rm_id');
	var eEq_id = summaryForm.getFieldValue('wr.eq_id');
	var eAc_id = summaryForm.getFieldValue('wr.ac_id');
	var eDescription = summaryForm.getFieldValue('wr.description');

	//var eFullName = infoForm.getFieldValue('em.em_id');
	var eFullName = View.user.employee.id;
	//var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+infoForm.getFieldValue('em.em_id').replace(/'/g, "''")+"'");
	var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+View.user.employee.id.replace(/'/g, "''")+"'");
	
	if (emRecord != null) {
		eFullName = emRecord['em.name_first']['l'] + " " + emRecord['em.name_last']['l'];
	}

	var emailMessage = "<b>* For building-related emergencies such as water leaks, broken glass, and power outages, contact Facilities Management at 403-220-7555, Monday to Friday, 8:00 a.m. to 4:30 p.m. *</b> <br><br>" +
					eFullName + ",<br/><br/>Thank you for contacting us. This is an automated response confirming the receipt of your work request. One of our staff will get back to you as soon as possible. For your records, the details of the ticket are listed below. When contacting us (220-7555) please make sure to refer to this request number.<br>" +
					"<br/><table>";

	emailMessage = emailMessage +
					"<tr><td><b>Ticket ID:</b></td>" +
					"<td>" + summaryForm.getFieldValue('wr.wr_id') +"</td></tr>";

	if (eDescription != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Subject:</b>" +
					"    </td>" +
					"    <td>" +
					eDescription +
					"    </td>" +
					"  </tr>";
	}
	if (eLocation != '') {
		emailMessage = emailMessage +
					"<tr><td><b>Location:</b></td>" +
					"<td>" + eLocation +"</td></tr>";
	}
	if (eAc_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Account Code:</b>" +
					"    </td>" +
					"    <td>" +
					eAc_id +
					"    </td>" +
					"  </tr>";
	}
	/*
	if (eEq_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Equipment Code:</b>" +
					"    </td>" +
					"    <td>" +
					eEq_id +
					"    </td>" +
					"  </tr>";
	}
	*/

	// Status is always requested.  No need to do 2 extra queries (from wr and afm_flds enum_list).
	emailMessage = emailMessage +
				"<tr><td><b>Status:</b></td>" +
				"<td>Requested</td></tr>";

	emailMessage = emailMessage +
					"</table><br/><br/>You can check the status of your work request online at: <a href='http://afm.ucalgary.ca'>http://afm.ucalgary.ca/</a>."+
					"<br/><br/>Kind regards,<br/>Facilities Management & Development<br/><hr>" +
					"<span style='font-size:0.8em'>* You have received this email because you are listed as the requestor.*<br>" +
					"* Contact afm@ucalgary.ca if you have any questions or for more information.*</span>";

	//alert(emailMessage);

	try {
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRCREATE_REQ_BODY','UC_WRCREATE_REQ_SUBJECT','wr','wr_id',summaryForm.getFieldValue('wr.wr_id'),
			'', View.user.email);

	}
	catch (ex) {

	}


    /*
	uc_email(infoForm.getFieldValue('em.email'),
			 'afm@ucalgary.ca',
			 '[Automated] Archibus - Your Work Request #[' + summaryForm.getFieldValue('wr.wr_id') + '] has been submitted to FM.'
			 , emailMessage,
			 'standard.template');
    */
}