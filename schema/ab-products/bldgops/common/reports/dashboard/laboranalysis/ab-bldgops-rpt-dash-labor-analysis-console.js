/**
 * Controller of the LaborAnalysis dashboard console filter view
 * @author Guo Jiangtao
 */
var laborDashConsoleController = View.createController('laborDashConsoleController', {

    //paren view controller, defined in ab-bldgops-rpt-dash-labor-analysis-main.js
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    
        //get the year list from table afm_cal_dates
        var recs = this.dsYears.getRecords();
        
        //write the dom of the year list, populateYearSelectLists() is defined in ab-bldgops-report-common.js
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
        
        //set parent controller and default year value
        this.parentController = getDashMainController('dashLaborAnalysisMainController');
		this.parentController.categorizeBy = 'D';
		this.parentController.workType = "";
        this.parentController.year = yearSelect.value;
		this.parentController.dateStart= "'"+this.parentController.year +"-01-01"+"'";
		this.parentController.dateEnd ="'"+this.parentController.year +"-12-31"+"'";
    },
	
	/**
     * click event handler for button show in the console panel
     */
    consolePanel_onShow: function(){
		this.setParentContollerValue();
		this.parentController.refreshSubViews();
    
    },
	
    /**
     * click event handler for button clear in the console panel
     */
    consolePanel_onClear: function(){
        setDefaultValueForHtmlField(['work_type', 'categorize_by'], ['', 'D']);
        
        //get the year list from table afm_cal_dates
        var recs = this.dsYears.getRecords();
        
        //write the dom of the year list, populateYearSelectLists() is defined in ab-bldgops-report-common.js
        var yearSelect = $('yearSelect');
        populateYearSelectLists(recs, yearSelect);
        
    },
    
    /**
     * set parent controller value from the console
     */
    setParentContollerValue: function(){
        var year = "";
        
        if (valueExistsNotEmpty($('yearSelect').value)) {
            year =$('yearSelect').value;
        }
        
		var pc = this.parentController;
        pc.year = year;
		pc.categorizeBy = $('categorize_by').value;
		pc.workType = $('work_type').value;

		var calYear = document.getElementsByName("cal_year");
		var isCalYear = calYear[0].checked;
 		pc.isCalYear =calYear[0].checked;
		pc.dateStart= pc.year +"-01-01";
		pc.dateEnd =pc.year +"-12-31";
		if(!isCalYear){
			var scmprefRec = View.dataSources.get("afmScmprefDS").getRecord();
			var startMonth =scmprefRec.getValue("afm_scmpref.fiscalyear_startmonth");
			var startDay =scmprefRec.getValue("afm_scmpref.fiscalyear_startday");
			if(startMonth!=1 || startDay!=1 ){
				var endMonth = startMonth-1;
				if(startMonth<10){
					pc.dateStart=  (pc.year-1)+"-0"+startMonth +"-01";
				}
				else{
					pc.dateStart=  (pc.year-1)+startMonth +"-01";
				}
				if(endMonth<10){
					pc.dateEnd =pc.year+"-0"+endMonth +"-"+getLastDayOfMonth(pc.year, endMonth);
				}
				else{
					pc.dateEnd =pc.year+"-"+endMonth +"-"+getLastDayOfMonth(pc.year, endMonth);
				}
			}
			else{
				pc.dateStart = pc.year+"-01-01";
				pc.dateEnd = pc.year+"-12-31";
			}
		}
		pc.dateStart = "'"+pc.dateStart+"'";
		pc.dateEnd = "'"+pc.dateEnd+"'";
    }
});
