
/**
 * Called from the chart control. Sets custom properties for Area3D chart.
 */

function setArea3DCustomPropertiesStacked() {  
    var chart = View.getControl('', 'chartArea_stacked');
    // Area rendering type: "overlaid" (default type), "stacked", or "100%".
    chart.setControlProperty('type', 'stacked');
}  

function setArea3DCustomProperties100Percent() {  
    var chart = View.getControl('', 'chartArea_100Percent');
    // Area rendering type: "overlaid" (default type), "stacked", or "100%".
    chart.setControlProperty('type', '100%');
}  
