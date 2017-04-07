/**
 * Controller of dashbord Archived Work Requests By Work Team
 * @author Guo Jiangtao
 */
var abOndemandRortWorkTeamDashPopUpController = View.createController('abOndemandRortWorkTeamDashPopUpController', {

    //paren view controller
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
    
        //set parent controller
        this.parentController = View.getOpenerView().controllers.get('abOndemandRortWorkTeamDashController');
        
        //apply tree restriction and console restriction to current view
        this.abOndemandRortWorkTeamDashPopUpChart.addParameter('treeRes', this.parentController.treeRes);
        this.abOndemandRortWorkTeamDashPopUpChart.addParameter('dateStart', this.parentController.dateStart);
        this.abOndemandRortWorkTeamDashPopUpChart.addParameter('dateEnd', this.parentController.dateEnd);
        
        //refresh the chart
        this.abOndemandRortWorkTeamDashPopUpChart.refresh(View.restriction);
    }
});

