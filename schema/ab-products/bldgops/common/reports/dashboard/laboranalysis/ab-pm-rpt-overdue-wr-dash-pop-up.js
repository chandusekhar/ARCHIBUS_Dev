/**
 * Controller of report Overdue Work Requests chart pop up
 * @author Guo Jiangtao
 */
var abPmRptOverdueWrDashPopUpController = View.createController('abPmRptOverdueWrDashPopUpController', {

    //paren view controller
    parentController: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //set parent controller
        this.parentController = View.getOpenerView().controllers.get('abPmRptOverdueWrDashController');
        
        //set datasource patameter for panels
        this.setParameters();
        
        //refresh the grid panel
        this.abPmRptOverdueWrGrid.refresh();
    },
    
    /**
     * set datasource patameter for panels
     */
    setParameters: function(){
        this.abPmRptOverdueWrGrid.addParameter('treeRes', this.parentController.treeRes);
        this.abPmRptOverdueWrGrid.addParameter('over_days_diplay', this.parentController.OverDaysDisplayFieldDefine);
    }
});

