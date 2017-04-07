var wrsurveyformController = View.createController('wrsurveyformController', {

	afterInitialDataFetch: function() {
	
		var currentdate = new Date();
		var wr_id = window.location.parameters['pkey'];
		var currentRating = this.detailPanel.getFieldValue("uc_wr_survey.rating1");

		//var a = refresh_rating1();
		
		if (wr_id != undefined) {
			this.detailPanel.clear();
			this.detailPanel.setFieldValue("uc_wr_survey.wr_id",wr_id);
			
			this.detailPanel.newRecord="true";
			//this.wr_survey_form.setFieldValue("uc_wr_survey.uc_wr_survey_id","1");
			this.detailPanel.setFieldValue("uc_wr_survey.rating1","7");	
			refresh_rating1();
			
			this.detailPanel.setFieldValue("uc_wr_survey.date_modified", currentdate);
		}
	},
	
	detailPanel_afterRefresh: function() {

	},
	
	
});

function set_rating1(value) {
	var form = View.panels.get('detailPanel');
    form.setFieldValue('uc_wr_survey.rating1', value);
}


	
function refresh_rating1() {
	var form = View.panels.get('detailPanel');
	var rating = form.getFieldValue("uc_wr_survey.rating1");
	var radioButtons = document.getElementsByName("formPanelRadioButtons_ranking1");
	for (var i=0; i < radioButtons.length; i++){
		if (rating == radioButtons[i].value) {

			radioButtons[i].checked=1; 
			break;
		}
	}
	
}
