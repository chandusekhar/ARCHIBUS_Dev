var abEqSurveyDetailsCtrl = View.createController('abEqSurveyDetailsController', {
	afterInitialDataFetch: function(){
		showPhoto('eqSurveyTasksDetails_form', 'eq_audit.survey_photo_eq', ['eq_audit.survey_id','eq_audit.eq_id'], 'image1_field');
		showPhoto('eqSurveyTasksDetails_form', 'eq_audit.survey_redline_eq', ['eq_audit.survey_id','eq_audit.eq_id'], 'image2_field');
	},
	
	exportDetailsDocx: function() {
		View.openPaginatedReportDialog('ab-eq-survey-details-pgrp.axvw',
				{'eqSurveyTasksDetailsPgrp_ds': this.view.restriction});
	}
});