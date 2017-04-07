
/**
 * Called from the chart control. Sets custom properties for Column3D chart.
 */

function setColumn3DCustomPropertiesOverlaid() {  
    var chart = View.getControl('', 'chartColumnTwoSeries_chartOverlaid');
    chart.setControlProperty('type', 'overlaid');
}  

function setColumn3DCustomPropertiesClustered() {  
    var chart = View.getControl('', 'chartColumnTwoSeries_chartClusered');
    chart.setControlProperty('type', 'clustered');
}  

function setColumn3DCustomPropertiesStacked() {  
    var chart = View.getControl('', 'chartColumnTwoSeries_chartStacked');
    chart.setControlProperty('type', 'stacked');
}  

function setColumn3DCustomProperties100Percent() {  
    var chart = View.getControl('', 'chartColumnTwoSeries_chart100Percent');
    chart.setControlProperty('type', '100%');
}  
