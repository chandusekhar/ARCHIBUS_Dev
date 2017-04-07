var costDashConsoleController = View.createController('costDashConsoleController', {

	afterViewLoad: function() {
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
		this.setParentControllerValues();
   },

   setParentControllerValues:function(){
		var mainController = getDashMainController("dashCostAnalysisMainController");

		var selectedEL = document.getElementById("worktype");
		var workType = selectedEL.options[selectedEL.selectedIndex].value;
		mainController.workType =workType;
		mainController.eqStd =this.consolePanel.getFieldValue("eq.eq_std");
		mainController.probType =this.consolePanel.getFieldValue("wr.prob_type");

		mainController.year =$('yearSelect').value;
		var calYear = document.getElementsByName("cal_year");
		var isCalYear = calYear[0].checked;
 		mainController.isCalYear =calYear[0].checked;
		mainController.dateStart= mainController.year +"-01-01";
		mainController.dateEnd =mainController.year +"-12-31";
		if(!isCalYear){
			var scmprefRec = View.dataSources.get("afmScmprefDS").getRecord();
			var startMonth =scmprefRec.getValue("afm_scmpref.fiscalyear_startmonth");
			var startDay =scmprefRec.getValue("afm_scmpref.fiscalyear_startday");
			if(startMonth!=1 || startDay!=1 ){
				var endMonth = startMonth-1;
				if(startMonth<10){
					mainController.dateStart=  (mainController.year-1)+"-0"+startMonth +"-01";
				}
				else{
					mainController.dateStart=  (mainController.year-1)+startMonth +"-01";
				}
				if(endMonth<10){
					mainController.dateEnd =mainController.year+"-0"+endMonth +"-"+getLastDayOfMonth(mainController.year, endMonth);
				}
				else{
					mainController.dateEnd =mainController.year+"-"+endMonth +"-"+getLastDayOfMonth(mainController.year, endMonth);
				}
			}
			else{
				mainController.dateStart=  mainController.year+"-01-01";
				mainController.dateEnd =mainController.year+"-12-31";
			}
		}		
   }
	
 });

function onCostDashConsoleSearch(){
		View.controllers.get("costDashConsoleController").setParentControllerValues();
		getDashMainController("dashCostAnalysisMainController").refreshDashboard();
}

function onCostDashConsoleClear(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);

		setDefaultValueForHtmlField(['worktype'],['both']);
		View.panels.get("consolePanel").clear();
}

