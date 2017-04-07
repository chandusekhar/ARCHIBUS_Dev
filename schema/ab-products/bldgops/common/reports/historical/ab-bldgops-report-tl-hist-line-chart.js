/**
 * Controller of the Tool Usage History Chart Report Line Chart
 * @author Guo Jiangtao
 */
var abBldgopsReportTlHistLineChartController = View.createController('abBldgopsReportTlHistLineChartController', {
    //Restriction of openner console panel  type String
    //that restriction used for chart control second group as a datasource parameter, 
    //the console restriction cannot directly add to the second group, so set it as parameter
    opennerconsoleRes: "",
    
    //selected group field from the opener view console panel
    selectedGroupField: null,
    
    /**
     * Initializing
     */
    afterInitialDataFetch: function(){
        //get the console restriction of openner view
        this.opennerconsoleRes = View.restriction;
        
        //set the groupfield parameter of chart datasource
        this.selectedGroupField = View.getOpenerView().selectedGroupField;
        this.abBldgopsReportTlHistLineChart.addParameter('groupfield', this.selectedGroupField);
        
        //add openner console restriction to second group datasource because View.restriction can not directly 
        //add to the second group datasource so using a patameter to implement
        this.abBldgopsReportTlHistLineChart.addParameter('openerConsoleRestriction', " AND " + this.opennerconsoleRes);
        
        //refresh the chart
        this.abBldgopsReportTlHistLineChart.refresh(this.opennerconsoleRes);
    }
});
