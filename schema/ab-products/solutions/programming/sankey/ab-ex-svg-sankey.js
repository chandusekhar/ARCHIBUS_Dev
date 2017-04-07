/**
 * called by ab-ex-svg-sankey.axvw
 */

var exampleController = View.createController('example', {
	
	svgControl: null,
    
    afterInitialDataFetch: function() { 
    	// define parameters
    	var parameters = new Ab.view.ConfigObject();
    	
    	// override default units, which is " TWh"
    	parameters['unit'] = ' MWh';
    	
    	this.svgControl = new Ab.svg.SankeyControl("sankeyDiv", "sankeyPanel", parameters);
    	
    	// resize specified DOM element whenever the panel size changes
    	this.sankeyPanel.setContentPanel(Ext.get('sankeyPanel')); 
    	
    	//this.metricConsole.setFieldValue("afm_metric_trend_values.bl_id", "HQ");
    	//this.metricConsole.setFieldValue("afm_metric_trend_values.metric_date", "2014-03-31");
    },
    
    /**
     * Get data as JSON Object.
     */
    getEnergyData: function(bl_id, metric_date) {
    	var sankeyJsonData = null;
    	var parameters = new Ab.view.ConfigObject();
    	parameters['BL_ID'] = bl_id;
    	parameters['METRIC_DATE'] = metric_date;
    	
    	var result
        DrawingSvgService.getSankeyData(parameters, {
            async: false,
            callback: function(data) {
            	sankeyJsonData = data;
            },
            errorHandler: function(m) {
                console.log(m);
            }
        });
        	
    	//convert string into json object
    	sankeyJsonData = eval('(' + sankeyJsonData + ')');

    	return sankeyJsonData;
    },
    
    metricConsole_onFilter: function() {

    	var bl_id = this.metricConsole.getFieldValue("afm_metric_trend_values.bl_id");
    	var metric_date = this.metricConsole.getFieldValue("afm_metric_trend_values.metric_date");
   	  	    	
    	// update the sankey diagram
        this.svgControl.load({
            data: this.getEnergyData(bl_id, metric_date)
        });
    },
    
    metricConsole_onClear: function() {
    	this.metricConsole.setFieldValue("afm_metric_trend_values.bl_id", "");
    	this.metricConsole.setFieldValue("afm_metric_trend_values.metric_date", "");
    	
    	this.metricConsole_onFilter();
    }
});







