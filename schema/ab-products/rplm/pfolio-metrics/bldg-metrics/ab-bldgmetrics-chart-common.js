/**
 * Map into a JSON object the chart panels Ids with their correspondents controllers Ids
 * 
 * key - chart panel id
 * value - controller id
 * 
 */
var controllers = {
	'occupancyMetrics_chart':'abTableMetricsDashboardRow1Col2_ctrl',
	'kpiMetrics_chart':'abTableMetricsDashboardRow2Col2_ctrl'
};


/**
 * Override chart control getParameters function. Set dynamically the properties of 'groupingAxis' and 'dataAxis' objects. 
 * 
 * @param {Object} restriction
 */


Ab.chart.ChartControl.prototype.getParameters = function(restriction){
    var viewName = this.configObj.getConfigParameter('viewDef');
	var viewController = View.controllers.get(controllers[this.configObj.panelId]);
	
	 var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
	
	//Set custom properties for 'groupingAxis'
	groupingAxis[0].dataSourceId = viewController.items[viewController.indexSelected]['dataSourceId'];
	
    var dataAxis = this.configObj.getConfigParameter('dataAxis');
    
	//Set custom properties for 'groupingAxis'
	dataAxis[0].dataSourceId = viewController.items[viewController.indexSelected]['dataSourceId'];
	dataAxis[0].field = viewController.items[viewController.indexSelected]['dataAxisField'];
	dataAxis[0].id = 'bl.'+dataAxis[0].field;
	dataAxis[0].title = viewController.items[viewController.indexSelected]['panelTitle'].split('-')[1];
	
    var parameters = {
        version: '2',
        viewName: viewName,
        groupingAxis: toJSON(groupingAxis),
        dataAxis: toJSON(dataAxis),
        type: 'chart'
    };
    
    var secondaryGroupingAxis = this.configObj.getConfigParameter('secondaryGroupingAxis');
    if (valueExists(secondaryGroupingAxis)) {
        parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
    }
    
    if (valueExists(restriction)) {
        parameters.restriction = toJSON(restriction);
    }
    
    Ext.apply(parameters, this.parameters);
    return parameters;
}