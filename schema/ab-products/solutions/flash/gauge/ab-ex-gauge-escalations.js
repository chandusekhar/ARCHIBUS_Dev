function gaugeChange_JS(newValue){
	alert(newValue);
}

View.createController('showGauge', {
		
	afterViewLoad: function(){
        var gaugeControl = new Ab.flash.Gauge(
        	'gauge',							//parent panel ID	        
	        'Circular', //Circular,Horizontal,Vertical or Knob
    		"abGaugeEscalation_ds1", //id of the datasource
    		"activity_log_hactivity_log.count_percent_activity_log_id", //id of the value field (e.g. activity_log.activity_log_id)
    		false, //is editable
    		null, //The minimum value of the scale. (optional, not used for gaugeType Knob)
    		null, //The maximum value of the scale. (optional, not used for gaugeType Knob)
    		null,//The interval between two minor ticks. (optional, not used for gaugeType Knob)
    		null, //The interval between two major ticks (optional, not used for gaugeType Knob)    		
    		null, //The minimum value of the track. (optional, not used for gaugeType Knob)
    		null, //The maximum value of the track. (optional, not used for gaugeType Knob)
    		null, //trackType
    		null      	
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
		
   		var escalated_completion = console.getFieldValue('activity_log_hactivity_log.escalated_completion');
   		if (escalated_completion!="") restriction += " AND (activity_log_hactivity_log.escalated_completion ="+escalated_completion+") ";
   		
   		var escalated_response = console.getFieldValue('activity_log_hactivity_log.escalated_response');
   		if (escalated_response!="") restriction += " AND (activity_log_hactivity_log.escalated_response ="+escalated_response+") ";
   		
   		return restriction;		
	}
 });
 
 function updateGauge(){
	var minValue = document.getElementById("minValue").value;
   	var maxValue = document.getElementById("maxValue").value;
   	gaugeControl.setMinMaxValues(minValue,maxValue);
   	var minTick = document.getElementById("minTick").value;
   	var majTick = document.getElementById("majTick").value;
   	gaugeControl.setTickIntervals(minTick,majTick);
   	var trackMin = document.getElementById("trackMin").value;
   	var trackMax = document.getElementById("trackMax").value;
   	gaugeControl.setMinMaxTrack(trackMin,trackMax);
}