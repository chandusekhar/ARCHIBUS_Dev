
/**
 * Controller of the LaborAnalysis dashboard Labor Analysis line chart view
 * @author Guo Jiangtao
 */
var abBldopsReportLaborAnalLineChartDashController = View.createController('abBldopsReportLaborAnalLineChartDashController', {

    //paren view controller, defined in ab-bldgops-rpt-dash-labor-analysis-main.js
    parentController: null,
    
    //tree filter restrciton
    treeRes: ' 1=1 ',
    
    //console filter selected year
    dateStart: '2010-01-01',
    dateEnd: '2010-12-31',
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    	//KB3032267 - hide 'Create Service Request' button if no AbBldgOpsHelpDesk license
    	hideCreateServiceRequestButtonIfNoLicense(this.abBldgopsReportLaborAnalLineChartDash);
    
        //set parent controller and add current controller as a sub view controller
        this.parentController = getDashMainController('dashLaborAnalysisMainController');
		if (!this.parentController.isSubControllerRegistered(this)){
			this.parentController.addSubViewController(this);
			this.abBldgopsReportLaborAnalLineChartDash.show(false);
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
        
        if (valueExistsNotEmpty(this.parentController.dateStart)) {
            //allpy the restriction as sql parameter
            this.dateStart = this.parentController.dateStart;
            this.dateEnd = this.parentController.dateEnd;
        }
        
        //set datasource parameters of panels
        this.setParameters();
        
		this.abBldgopsReportLaborAnalLineChartDash.show(true);
        //refresh the chart
        this.abBldgopsReportLaborAnalLineChartDash.refresh();
    },
    
    
    /**
     * set datasource parameters of panels
     */
    setParameters: function(){
        this.abBldgopsReportLaborAnalLineChartDash.addParameter('treeRes', this.treeRes);
        this.abBldgopsReportLaborAnalLineChartDash.addParameter('dateStart', this.dateStart);
        this.abBldgopsReportLaborAnalLineChartDash.addParameter('dateEnd', this.dateEnd);
        this.abBldgopsReportLaborAnalLineChartDashCrossTable.addParameter('treeRes', this.treeRes);
        this.abBldgopsReportLaborAnalLineChartDashCrossTable.addParameter('dateStart', this.dateStart);
        this.abBldgopsReportLaborAnalLineChartDashCrossTable.addParameter('dateEnd', this.dateEnd);
    },
    
    /**
     * Show details panel
     * @param ob {Object} click object.
     */
    showDetails: function(ob){
		var restriction = this.createPopUpRestriction(ob);
        View.openDialog('ab-bldgops-report-labor-anal-line-chart-dash-pop-up.axvw', restriction);
    },
	
	/**
     * create restriction for pop up grid
     */
    createPopUpRestriction: function(clickObject){
        var restriction = '1=1'
        if (clickObject.restriction.clauses) {
            for (var i = 0; i < clickObject.restriction.clauses.length; i++) {
                if (clickObject.restriction.clauses[i].name.indexOf('x_month')!=-1) {
                    restriction += " AND ${sql.yearMonthOf('hwr.date_completed')} ='" + clickObject.restriction.clauses[i].value + "'";
                }
                if (clickObject.selectedChartData['hwrcf.work_team_id']) {
                    restriction += " AND hwr.work_team_id = '" + clickObject.selectedChartData['hwrcf.work_team_id'] + "'";
                }
            }
        }
        
        return restriction;
    }
})
