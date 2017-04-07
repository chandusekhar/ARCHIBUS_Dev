/**
 * Controller of the LaborAnalysis dashboard Work Team Performance view
 * @author Guo Jiangtao
 */
var abOndemandWorkTeamAllReportChartDashController = View.createController('abOndemandWorkTeamAllReportChartDashController', {

    //paren view controller, defined in ab-bldgops-rpt-dash-labor-analysis-main.js
    parentController: null,
    
    //tree filter restrciton
    treeRes: ' 1=1 ',
    
    //console filter selected year
    dateStart: '2010-01-01',
    dateEnd: '2010-12-31',
	surveyRes: ' 1=1 ',
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    	//KB3032267 - hide 'Create Service Request' button if no AbBldgOpsHelpDesk license
    	hideCreateServiceRequestButtonIfNoLicense(this.abOndemandWorkTeamAllReportChartDashChart);
    	
        //set parent controller and add current controller as a sub view controller
        this.parentController = getDashMainController('dashLaborAnalysisMainController');
        if (!this.parentController.isSubControllerRegistered(this)){
			this.parentController.addSubViewController(this);
			this.abOndemandWorkTeamAllReportChartDashChart.show(false);
		}
		else{
			this.refreshPanel();
		}
        
    },
    
    /**
     * apply tree restriction and console restriction to current view panels
     */
    refreshPanel: function(){
        if (valueExistsNotEmpty(this.parentController.treeRes)) {
            //allpy the restriction as sql parameter
            this.treeRes = this.parentController.treeRes.replace(/rm./g, "hwr.");
        }
		
		this.treeRes = appendWorkTypeRestriction(this.treeRes, this.parentController.workType, 'hwr');
 		this.surveyRes = this.treeRes.replace(/hwr./g, "a.");
       
        if (valueExistsNotEmpty(this.parentController.dateStart)) {
            //allpy the restriction as sql parameter
            this.dateStart = this.parentController.dateStart;
            this.dateEnd = this.parentController.dateEnd;
        }
        
        //set datasource parameters of panels
        this.setParameters();
        
		this.abOndemandWorkTeamAllReportChartDashChart.show(true);
        //refresh the chart
        this.abOndemandWorkTeamAllReportChartDashChart.refresh();
    },
    
    
    /**
     * set datasource parameters of panels
     */
    setParameters: function(){
        this.abOndemandWorkTeamAllReportChartDashChart.addParameter('treeRes', this.treeRes);
        this.abOndemandWorkTeamAllReportChartDashCrossTable.addParameter('treeRes', this.treeRes);
        this.abOndemandWorkTeamAllReportChartDashChart.addParameter('surveyRes', this.surveyRes);
        this.abOndemandWorkTeamAllReportChartDashCrossTable.addParameter('surveyRes', this.surveyRes);
        this.abOndemandWorkTeamAllReportChartDashChart.addParameter('dateStart', this.dateStart);
        this.abOndemandWorkTeamAllReportChartDashChart.addParameter('dateEnd', this.dateEnd);
        this.abOndemandWorkTeamAllReportChartDashCrossTable.addParameter('dateStart', this.dateStart);
        this.abOndemandWorkTeamAllReportChartDashCrossTable.addParameter('dateEnd', this.dateEnd);
    }
})
