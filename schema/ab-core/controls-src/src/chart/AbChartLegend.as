package chart
{
	import mx.charts.Legend;
	import mx.core.ScrollPolicy;
	
	public class AbChartLegend extends Legend
	{
		public function AbChartLegend(legendLocation:String, direction:String)
		{
			super();
			
			this.setStyle("labelPlacement", legendLocation);
	        this.direction=direction;
	        
	        //turn the legend scroll bar off
	        // there is a default scroll bar (auto) in the chart container
	        this.verticalScrollPolicy = ScrollPolicy.OFF;
	        this.horizontalScrollPolicy = ScrollPolicy.OFF;
	        
		}
		
	}
}