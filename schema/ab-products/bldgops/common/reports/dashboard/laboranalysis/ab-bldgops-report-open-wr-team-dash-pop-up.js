/**
 * Controller
 * @author Guo Jiangtao
 */
var abBldgopsReportOpenWrTeamDashPopupController = View.createController('abBldgopsReportOpenWrTeamDashPopupController', {

    //paren view controller
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //set parent controller
        this.parentController = View.getOpenerView().controllers.get('abBldgopsReportOpenWrTeamDashController');
        
        //apply tree restriction and console restriction to current view
        this.abBldgopsReportOpenWrTeamDashGrid.addParameter('treeRes', this.parentController.treeRes);
        
        //refresh the panel
        this.abBldgopsReportOpenWrTeamDashGrid.refresh(View.restriction);
    }
    
});
