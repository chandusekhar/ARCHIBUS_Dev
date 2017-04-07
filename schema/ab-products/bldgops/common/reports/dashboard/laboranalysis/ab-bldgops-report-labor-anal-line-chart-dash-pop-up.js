
/**
 * Controller of the LaborAnalysis dashboard Labor Analysis line chart pop up view
 * @author Guo Jiangtao
 */
var abBldopsReportLaborAnalLineChartDashPopUpController = View.createController('abBldopsReportLaborAnalLineChartDashPopUpController', {

    //paren view controller
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //set parent controller
        this.parentController = View.getOpenerView().controllers.get('abBldopsReportLaborAnalLineChartDashController');
        
        //apply tree restriction and console restriction to current view
        this.abBldgopsReportLaborAnalLineChartDashGrid.addParameter('treeRes', this.parentController.treeRes);
        this.abBldgopsReportLaborAnalLineChartDashGrid.addParameter('dateStart', this.parentController.dateStart);
         this.abBldgopsReportLaborAnalLineChartDashGrid.addParameter('dateEnd', this.parentController.dateEnd);
       
        //refresh the panel
        this.abBldgopsReportLaborAnalLineChartDashGrid.refresh(View.restriciton);
    }
})
