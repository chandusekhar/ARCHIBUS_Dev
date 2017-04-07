function gaugeChange_JS(newValue){
	//do nothing
}

View.createController('showGauge', {
		
	afterViewLoad: function(){
        var gaugeControl = new Ab.flash.Gauge(
        	'gauge',					//parent panel ID
        	'Vertical',					//gauge type
         	"abGaugeEmAvgAreaByBlDs_1",	//dataSourceId 
        	"em.avg_area_rm",			// value field
        	false,						//editable
	       	0, 					//minValue
        	500,				//maxValue
        	50,					//minTickInterval
        	100,				//majTickInterval
        	0,					//trackMinimum
        	500,				//trackMaximum
        	'ryg',				//trackType (red - yellow - green)
	        null      			//categories
        );
        this.panelHtml.setContentPanel(Ext.get('gauge'));
    },
    
    consolePanel_onFilter: function(){
    	var gaugeControl = Ab.view.View.getControl('', 'gauge');
		var restriction = this.getConsoleRestriction();
		
		gaugeControl.refresh(restriction);
    },
    
	getConsoleRestriction: function() {
		var console = View.panels.get('consolePanel');

		var restriction = "0=0";
		
   		var bl_id = console.getFieldValue('em.bl_id');
   		if (bl_id!="") restriction += " AND (em.bl_id ='"+bl_id+"') ";
   		
   		return restriction;		
	}	
 });