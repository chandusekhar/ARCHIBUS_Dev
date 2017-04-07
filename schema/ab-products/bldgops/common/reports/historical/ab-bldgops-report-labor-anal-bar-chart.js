/**
 * Controller of the Labor Analysis Report Bar Chart
 * @author Guo Jiangtao
 */
var abBldgopsReportLaborAnalBarChartController = View.createController('abBldgopsReportLaborAnalBarChartController', {

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
        this.abBldgopsReportLaborAnalBarChart.refresh();
        
    },
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    
    //////////////////////////////////////////logic method//////////////////////////////////////////////////
    
    
    /**
     * set datasource parameters
     */
    setDatasourceParameters: function(){
        //set the parameter restriction of openner console restriction
        this.abBldgopsReportLaborAnalBarChart.addParameter('opennerConsoleRes', this.parentController.consoleRes);
        
        //set the parameter restriction of afm_cal_dates
        this.abBldgopsReportLaborAnalBarChart.addParameter('dateRange', this.parentController.dateRangRes.replace(/hwr.date_completed/g, "afm_cal_dates.cal_date"));
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

});
