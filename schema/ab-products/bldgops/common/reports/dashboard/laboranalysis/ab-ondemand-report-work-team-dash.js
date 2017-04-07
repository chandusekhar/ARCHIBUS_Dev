/**
 * Controller of dashbord Archived Work Requests By Work Team
 * @author Guo Jiangtao
 */
var abOndemandRortWorkTeamDashController = View.createController('abOndemandRortWorkTeamDashController', {

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
    
        //set parent controller and add current controller as a sub view controller
        this.parentController = getDashMainController('dashLaborAnalysisMainController');
        if (!this.parentController.isSubControllerRegistered(this)){
			this.parentController.addSubViewController(this);
			this.abOndemandRortWorkTeamDashChart.show(false);
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
        
		this.abOndemandRortWorkTeamDashChart.show(true);
        //refresh the chart
        this.abOndemandRortWorkTeamDashChart.refresh();
    },
    
    /**
     * set datasource parameters of panels
     */
    setParameters: function(){
        this.abOndemandRortWorkTeamDashChart.addParameter('treeRes', this.treeRes);
        this.abOndemandRortWorkTeamDashCrossTable.addParameter('treeRes', this.treeRes);
        this.abOndemandRortWorkTeamDashChart.addParameter('dateStart', this.dateStart);
        this.abOndemandRortWorkTeamDashChart.addParameter('dateEnd', this.dateEnd);
        this.abOndemandRortWorkTeamDashCrossTable.addParameter('dateStart', this.dateStart);
        this.abOndemandRortWorkTeamDashCrossTable.addParameter('dateEnd', this.dateEnd);
  }
});

