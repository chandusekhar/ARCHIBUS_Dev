function gaugeChange_JS(newValue){
	//do nothing
}

function getKnobData_JS(panelId){
	var flashControl = Ab.view.View.getControl('', panelId);
	flashControl.refreshDataFromDataSource();

	switch(flashControl.data){
		case "0":
		  return getMessage('no_rating');
		  break;
		case "1":
		  return getMessage('poor');
		  break;
		case "2":
		  return getMessage('below_average');
		  break;
		case "3":
		  return getMessage('average');
		  break;
		case "4":
		  return getMessage('above_average');
		  break;
		case "5":
		  return getMessage('exceptional');
		  break;
		default:
		  return getMessage('no_rating');
	}
}

View.createController('showGauge', {
		
	afterViewLoad: function(){
        var gaugeControl = new Ab.flash.Gauge(
        	'gauge',			//parent panel ID
        	'Knob',				//gauge type
         	"abGaugeSatisfaction_ds1",				//dataSourceId 
        	"activity_log.satisfaction",	// value field
        	false,				//editable
	       	null, 				//minValue
        	null,				//maxValue
        	null,				//minTickInterval
        	null,				//majTickInterval
        	null,				//trackMinimum
        	null,				//trackMaximum
        	null,				//trackType
	      	getMessage('no_rating') + '|' + getMessage('exceptional') + '|' + getMessage('above_average') + '|' + getMessage('average') + '|' + getMessage('below_average') + '|' + getMessage('poor')        	
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
		
   		var activitytype = console.getFieldValue('activity_log.activity_type');
   		if (activitytype!="") restriction += " AND (activity_log.activity_type ='"+activitytype+"') ";
   		
   		return restriction;		
	}	
 });