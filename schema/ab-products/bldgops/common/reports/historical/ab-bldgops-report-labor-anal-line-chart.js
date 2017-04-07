/**
 * Controller of the Labor Analysis Report Chart
 * @author Guo Jiangtao
 */
var abBldgopsReportLaborAnalLineChartController = View.createController('abBldgopsReportLaborAnalLineChartController', {

    //paren view controller, defined in ab-bldgops-report-labor-anal.js
    parentController: null,
    
    
    //////////////////////////////////////////event handler//////////////////////////////////////////////////
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //set parent controller
        this.parentController = View.getOpenerView().controllers.get('abBldgopsReportLaborAnalController');
        
        //gset datasource parameters
        this.setDatasourceParameters();
        
        //refresh the chart
        this.refreshPanel();
        
    },
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    
    //////////////////////////////////////////logic method//////////////////////////////////////////////////
    
    
    /**
     * set datasource parameters
     */
    setDatasourceParameters: function(){
        if (this.parentController.firstGrouping == '1') {
            this.abBldgopsReportLaborAnalLineChart1.addParameter('groupfield', this.parentController.selectedGroupField);
            this.abBldgopsReportLaborAnalLineChart1.addParameter('consoleRes', this.parentController.consoleRes);
        }
        else 
            if (this.parentController.firstGrouping == '4') {
                this.abBldgopsReportLaborAnalLineChart3.addParameter('groupfield', this.parentController.selectedGroupField);
                this.abBldgopsReportLaborAnalLineChart3.addParameter('consoleRes', this.parentController.consoleRes);
            }
            else {
                this.abBldgopsReportLaborAnalLineChart2.addParameter('groupfield', this.parentController.selectedGroupField);
                this.abBldgopsReportLaborAnalLineChart2.addParameter('consoleRes', this.parentController.consoleRes);
            }
    },
    
    
    /**
     * refresh panel according the first group option in the parent console
     */
    refreshPanel: function(){
        if (this.parentController.firstGrouping == '1') {
            this.abBldgopsReportLaborAnalLineChart1.show(true);
            this.abBldgopsReportLaborAnalLineChart2.show(false);
            this.abBldgopsReportLaborAnalLineChart3.show(false);
            this.abBldgopsReportLaborAnalLineChart1.refresh();
        }
        else 
            if (this.parentController.firstGrouping == '4') {
                this.abBldgopsReportLaborAnalLineChart1.show(false);
                this.abBldgopsReportLaborAnalLineChart2.show(false);
                this.abBldgopsReportLaborAnalLineChart3.show(true);
                this.abBldgopsReportLaborAnalLineChart3.refresh();
            }
            else {
                this.abBldgopsReportLaborAnalLineChart1.show(false);
                this.abBldgopsReportLaborAnalLineChart2.show(true);
                this.abBldgopsReportLaborAnalLineChart3.show(false);
                this.abBldgopsReportLaborAnalLineChart2.refresh();
            }
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
});
