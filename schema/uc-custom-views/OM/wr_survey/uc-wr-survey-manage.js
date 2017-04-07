var wrSurveyController = View.createController('wrSurveyController', {
	afterViewLoad: function() {

		this.inherit();

	},
	
	afterInitialDataFetch: function() {
		this.inherit();
	
		if (View.restriction == null) {


		}
	}
});


function openWRDetails(row) {

	var navform = View.getControl('', 'surveyGrid');
	//var restriction = navform.getFieldRestriction();
	
	//var form = View.getControl('', 'nav_details_info');
	
	var wr_id = row['uc_wr_survey.wr_id'];
	//var status = row['uc_wr_survey.status.raw'];
	
	var detailsPanel = View.getControl('','wr_details_frame');
	var detailsAxvw;

	//if (status == 'Clo' || status == 'Rej' || status == 'Can') {
		// These requests can already be archived.  Check if they are in the hwr table.
	//	var hwrId = UC.Data.getDataValue('hwr', 'wr_id', "wr_id="+wr_id);
	//	if (hwrId != null) {
	//		detailsAxvw = "uc-wr-view-all-requests-fin-details-hwr.axvw?wrId="+wr_id;
	//	}	
	//	else {
			detailsAxvw = "uc-wr-survey-wr-details.axvw?wrId="+wr_id;
	//	}

	//}
	//else {
	//	detailsAxvw = "uc-wr-view-all-requests-fin-details.axvw?wrId="+wr_id;
	//}
	detailsPanel.frame.dom.contentWindow.location.href = detailsAxvw;
}