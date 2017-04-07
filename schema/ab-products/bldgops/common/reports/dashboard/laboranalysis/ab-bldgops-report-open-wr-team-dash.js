/**
 * Controller
 * @author Guo Jiangtao
 */
var abBldgopsReportOpenWrTeamDashController = View.createController('abBldgopsReportOpenWrTeamDashController', {

    //paren view controller, defined in ab-bldgops-rpt-dash-labor-analysis-main.js
    parentController: null,
    
    //tree filter restrciton
    treeRes: ' 1=1 ',
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    	
    	//KB3032267 - hide 'Create Service Request' button if no AbBldgOpsHelpDesk license
    	hideCreateServiceRequestButtonIfNoLicense(this.abBldgopsReportOpenWrTeamDashCrossTable);
    
        //set parent controller and add current controller as a sub view controller
        this.parentController = getDashMainController('dashLaborAnalysisMainController');
		if (!this.parentController.isSubControllerRegistered(this)){
			this.parentController.addSubViewController(this);
			this.abBldgopsReportOpenWrTeamDashCrossTable.show(false);
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
            this.treeRes = this.parentController.treeRes.replace(/rm./g, "wr.");
        }
		
		this.treeRes = appendWorkTypeRestriction(this.treeRes, this.parentController.workType, 'wr');
        
		this.abBldgopsReportOpenWrTeamDashCrossTable.show(true);
        //refresh the chart
        this.abBldgopsReportOpenWrTeamDashCrossTable.refresh(this.treeRes);
    },
    
    /**
     * Show details panel
     * @param ob {Object} click object.
     */
    showDetails: function(ob){
        View.openDialog('ab-bldgops-report-open-wr-team-dash-pop-up.axvw', ob.restriction);
    }
});



