/**
 * 
 * The definition of a custom Gauge object.
 * 
 * 
 * 
 * @param {Object} controller - The controller of the View , where the Gauge is inserted
 * @param {Object} gaugePanelId - the id of the div element where the Gauge will be inserted
 * @param {Object} gaugeType
 * @param {Object} minorTicksInterval - The interval between two minor ticks of the Gauge
 */



function Gauge(controller, gaugePanelId, gaugeType, minorTicksInterval) {
	
	//The controller of the View , where the Gauge is inserted
	this.controller = controller;
	
	//DataSource of the Gauge
	this.dataSource = null; 
	
	//Field used for Gauge calculations
	this.field = null;
	
	//Min Gauge interval value
	this.minValue = 0;
	
	//Max Gauge interval value
	this.maxValue = 0;
	
	this.restriction = "1=1";
	
	// define 'calculateMinMax' function
	this.calculateMinMax = function (){
	 			
		//get min and max values 
		var record = this.dataSource.getRecord();	
		this.minValue = 0;
		this.maxValue = parseFloat(record.getValue(this.field));
		
		// if the field has the same value in all records then use an 100 units interval
		if(this.minValue == this.maxValue){
			this.maxValue = this.minValue + 100;
		}
		
	 };
	
	//define 'drawGauge' function
	this.drawGauge = function(){
		
		this.dataSource = this.controller.items[controller.indexSelected]['dataSource']; 
		this.field = this.controller.items[controller.indexSelected]['field'];
		
		this.calculateMinMax();
		
		//create Gauge object	
		this.gauge = new Ab.flash.Gauge(
        	gaugePanelId,							//parent panel ID	        
	        gaugeType, //Circular,Horizontal,Vertical or Knob
    		this.dataSource.id, //id of the datasource
    		this.field, //id of the value field (e.g. activity_log.activity_log_id)
    		false, //is editable
    		this.minValue, //The minimum value of the scale. (optional, not used for gaugeType Knob)
    		this.maxValue, //The maximum value of the scale. (optional, not used for gaugeType Knob)
    		parseFloat((this.maxValue-this.minValue)/minorTicksInterval).toFixed(2),//The interval between two minor ticks. (optional, not used for gaugeType Knob)
    		parseFloat((this.maxValue-this.minValue)/(minorTicksInterval/2)).toFixed(2), //The interval between two major ticks (optional, not used for gaugeType Knob)    		
    		this.minValue, //The minimum value of the track. (optional, not used for gaugeType Knob)
    		this.maxValue, //The maximum value of the track. (optional, not used for gaugeType Knob)
    		null, //trackType
    		null      	
        );
	};
	
	//define 'refreshGauge' function
	this.refreshGauge = function(){
		 
		this.gauge.setMinMaxValues(this.minValue,this.maxValue);
	   	this.gauge.setTickIntervals(parseFloat((this.maxValue-this.minValue)/minorTicksInterval),parseFloat((this.maxValue-this.minValue)/(minorTicksInterval/2)));
   		this.gauge.setMinMaxTrack(this.minValue,this.maxValue);
		
		this.dataSource.addParameter('treeSelection', this.restriction);
		this.gauge.refresh();
	 };
	
	
	this.drawGauge();
}
