var abBldgopsRptWorkTeamPerfChartController = View.createController('abBldgopsRptWorkTeamPerfChartController', {

	afterViewLoad: function() {
		var openerController = View.getOpenerView().controllers.get("abondemandWorkTeamRptController");
		if(openerController && openerController.otherRes){
			var otherRes = openerController.otherRes.replace(/hwr_month.month/g, "${sql.yearOf('hwr.date_completed')}")
																						 .replace(/hwr_month./g, "hwr.");
			var surveyRes = otherRes.replace(/hwr/g, "a"); 
			this.workTeamPeformanceChart.addParameter("otherRes", otherRes);
			this.workTeamPeformanceChart.addParameter("surveyRes", surveyRes);
		}
		this.workTeamPeformanceChart.refresh();
    }
})

