var budgetDashConsoleController = View.createController('budgetDashConsoleController', {

	afterViewLoad: function() {
        onBudgetConsoleClear();
		this.setParentCotrollerValue(); 
	},

	setParentCotrollerValue:function(){
		var parentController = getDashMainController("dashBudgetAnalysisMainController");
		parentController.year =$('yearSelect').value;
		parentController.groupoption = $('groupoption').value;
		parentController.workType = $('worktype').value;

		var calYear = document.getElementsByName("cal_year");
		var isCalYear = calYear[0].checked;
 		parentController.isCalYear =calYear[0].checked;
		parentController.dateStart= parentController.year +"-01-01";
		parentController.dateEnd =parentController.year +"-12-31";
		if(!isCalYear){
			var scmprefRec = this.afmScmprefDS.getRecord();
			var startMonth =scmprefRec.getValue("afm_scmpref.fiscalyear_startmonth");
			var startDay =scmprefRec.getValue("afm_scmpref.fiscalyear_startday");
			if(startMonth!=1 || startDay!=1 ){
				var endMonth = startMonth-1;
				if(startMonth<10){
					parentController.dateStart=  (parentController.year-1)+"-0"+startMonth +"-01";
				}
				else{
					parentController.dateStart=  (parentController.year-1)+startMonth +"-01";
				}
				if(endMonth<10){
					parentController.dateEnd =parentController.year+"-0"+endMonth +"-"+getLastDayOfMonth(parentController.year, endMonth);
				}
				else{
					parentController.dateEnd =parentController.year+"-"+endMonth +"-"+getLastDayOfMonth(parentController.year, endMonth);
				}
			}
			else{
				parentController.dateStart=  parentController.year+"-01-01";
				parentController.dateEnd =parentController.year+"-12-31";
			}
		}
	}
 });

function onBudgetConsoleClear(){
		setDefaultValueForHtmlField(['groupoption','worktype'],['blcode','both']);
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
}

function onBudgetConsoleSearch(){
		View.controllers.get("budgetDashConsoleController").setParentCotrollerValue();
		getDashMainController("dashBudgetAnalysisMainController").refreshDashboard();
}

