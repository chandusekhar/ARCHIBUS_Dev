
/**
 * Export Osha 301 accident report formular.
 * @param cmdCtx
 */
function exportOsha301(cmdCtx) {
	try {
		var objForm = cmdCtx.command.getParentPanel();
		var incidentId = objForm.getFieldValue("ehs_incidents.incident_id");
		var dataSourceId = getDataSourceId(objForm);
		var restriction = 'ehs_incidents.incident_id = ' + incidentId ;
		
		var arrFieldNames = ['ehs_incidents.vf_recorded_by', 'ehs_incidents.em_title', 'ehs_incidents.phone', 'ehs_incidents.date_current',
		                     'ehs_incidents.affected_employee', 'ehs_incidents.address', 'ehs_incidents.city', 'ehs_incidents.state', 'ehs_incidents.zip','ehs_incidents.date_birth', 'ehs_incidents.date_hired', 'ehs_incidents.gender',
		                     'ehs_incidents.physician_name', 'ehs_incidents.medical_facility', 'ehs_incidents.medical_facility_address', 'ehs_incidents.medical_facility_city', 'ehs_incidents.medical_facility_state', 'ehs_incidents.medical_facility_zip', 'ehs_incidents.vf_emergency_rm_treatment', 'ehs_incidents.vf_is_hospitalized',
		                     'ehs_incidents.incident_id', 'ehs_incidents.date_incident', 'ehs_incidents.time_work_start', 'ehs_incidents.time_incident', 'ehs_incidents.time_incident_null', 'ehs_incidents.activity_before', 'ehs_incidents.description', 'ehs_incidents.incident_type', 'ehs_incidents.eq_id', 'ehs_incidents.date_death'];
		
		var arrPdfFieldNames = ['form1[0].oshaForm[0].completedByForm[0].ehs_incidents_recorded_by','form1[0].oshaForm[0].completedByForm[0].ehs_incidents_em_title', 'form1[0].oshaForm[0].completedByForm[0].ehs_incidents_phone', 'form1[0].oshaForm[0].completedByForm[0].ehs_incidents_date_current',
		                        'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_affected_employee', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_address', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_city', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_state', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_zip','form1[0].oshaForm[0].employeeForm[0].ehs_incidents_date_birth', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_date_hired', 'form1[0].oshaForm[0].employeeForm[0].ehs_incidents_gender[0]',
		                        'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_physician_name', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_medical_facility', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_medical_facility_address', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_medical_facility_city', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_medical_facility_state', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_medical_facility_zip', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_emergency_rm_treatment[0]', 'form1[0].oshaForm[0].medicalForm[0].ehs_incidents_is_hospitalized[0]',
		                        'form1[0].oshaForm[0].caseForm[0].ehs_incidents_incident_id', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_date_incident', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_time_work_start', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_time_incident', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_time_incident_null[0]', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_activity_before', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_description', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_incident_type', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_eq_id', 'form1[0].oshaForm[0].caseForm[0].ehs_incidents_date_death'];
		
		var arrPdfControlTypes = ['TextField', 'TextField', 'TextField', 'TextField',
		                          'TextField', 'TextField', 'TextField', 'TextField', 'TextField','TextField', 'TextField', 'CheckBox[male|female]',
		                          'TextField', 'TextField', 'TextField', 'TextField', 'TextField', 'TextField', 'CheckBox[yes|no]', 'CheckBox[yes|no]',
		                          'TextField', 'TextField', 'TextField', 'TextField', 'CheckBox[yes]', 'TextField', 'TextField', 'TextField', 'TextField', 'TextField'];
		
		var arguments = {};
		arguments.viewName = "ab-ehs-pdf-livecycle-datasources.axvw";
		arguments.dataSourceId = dataSourceId;
		arguments.restrictions = restriction;
		arguments.pdfTemplate = "ehs_osha_301.pdf";
		arguments.fieldNames = arrFieldNames.join(';');
		arguments.pdfFieldNames = arrPdfFieldNames.join(';');
		arguments.pdfControlTypes = arrPdfControlTypes.join(';');
		
		var pdfCommand = new Ab.command.openLiveCycleDialog (arguments);
		pdfCommand.handle();
		
	} catch (e){
		Workflow.handleError(e);
	}
}


function getDataSourceId(objForm){
	var dataSourceId = null;
	if (valueExistsNotEmpty(objForm.getFieldValue("ehs_incidents.em_id_affected"))) {
		dataSourceId = "abEhsPdfLiveCycleEmployee_ds";
	} else if (valueExistsNotEmpty(objForm.getFieldValue("ehs_incidents.contact_id"))) {
		dataSourceId = "abEhsPdfLiveCycleContact_ds";
	} else if (valueExistsNotEmpty(objForm.getFieldValue("ehs_incidents.non_em_name"))) {
		dataSourceId = "abEhsPdfLiveCycleNonEmployee_ds";
	}
	return dataSourceId;
}