// ActionScript file incuded into each MXML application file.

include "../chart/AbChartCommon.as";

/**
 * Initializes the applications. 
 */
public function initApplication():void {
    try{
        // ensure that the control occupies 100% of the panel area        
        this.percentHeight=100;
        this.percentWidth=100;
        
        // ensure that the control occupies 100% of the panel area        
        this.setStyle("paddingBottom",0);
        this.setStyle("paddingLeft",0);
        this.setStyle("paddingRight",0);
        this.setStyle("paddingTop",0);

        // set title bar height to 0
        this.setStyle("headerHeight",0);

        // retrieve the config object from ab-chart-common.js class
        var panelId:String = Application.application.parameters.panelId;
        var controlConfig:String = getChartConfigObj(panelId);

        // retrive the control data from ab-chart-common.js class
        var controlData:String = getChartData(panelId);
        
        // initialize the control - this function is defined in each MXML file
        initControl(controlConfig, controlData);
        
    } catch (error:Error){
        trace("initApplication error: " + error.toString());
    }
}
