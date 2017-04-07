
/**
 * Called from the chart control. Sets custom properties for Pie3D chart.
 */
function setPie3DCustomProperties() {  
    var chart = View.getControl('', 'chartPie_chart');
    
    // The intensity of the ambient light, between 0 and 1. The default value is 0.1. 
    chart.setControlProperty('ambientLight', '0.05');
    
    // The depth of the chart relative to its width, between 1 and 100. The default value is 10. 
    chart.setControlProperty('depth', '5');

    // The elevation angle in degrees, within the range [-90 ; 90]. The default value is 45.            
    chart.setControlProperty('elevationAngle', '60');
}  
