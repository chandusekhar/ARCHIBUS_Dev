
/**
 * Called from the chart control. Sets custom properties for Column3D chart.
 */
function setColumn3DCustomProperties() {  
    var chart = View.getControl('', 'chartCol_chart');
    
    // The depth of the chart relative to its width, between 1 and 100. The default value is 10. 
    chart.setControlProperty('depth', '5');

    // The elevation angle in degrees, within the range [-90 ; 90]. The default value is 35.            
    chart.setControlProperty('rotationAngle', '15');

    // The projection type: "orthographic" or "oblique". The default is "orthographic". 
    //chart.setControlProperty('projectionType', 'oblique');
}  
