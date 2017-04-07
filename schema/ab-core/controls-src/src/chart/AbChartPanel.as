package chart
{
	import mx.containers.Panel;
	import mx.core.ScrollPolicy;

	public class AbChartPanel extends Panel
	{
		public function AbChartPanel(chartProps:AbChartProps)
		{
			super();

	        this.id = chartProps.panelId;
	        			
			this.percentWidth=100;
		    this.percentHeight=100;		    
		    
		    //turn the panel's scroll bar off
	        // there is a default scrollbar in the chart container
			this.verticalScrollPolicy = ScrollPolicy.OFF;
	        this.horizontalScrollPolicy = ScrollPolicy.OFF;
	        
		    //remove the chart control's border 
		    this.setStyle("borderStyle", "none");
		   	
		   	// set title bar height to 0
			this.setStyle("headerHeight",0);

		   	if(chartProps.backgroundColor!=null && chartProps.backgroundColor!=""){
				this.setStyle("backgroundColor", uint(chartProps.backgroundColor));
			}

		}
	}
}