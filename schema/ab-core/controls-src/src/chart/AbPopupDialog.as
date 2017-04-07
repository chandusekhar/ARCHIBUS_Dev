package chart
{
	import mx.containers.TitleWindow;
		
	public class AbPopupDialog extends TitleWindow
	{
		import mx.charts.Legend;
		import flash.events.Event;
	  	import mx.managers.PopUpManager;

	  	public function AbPopupDialog(chartProps:AbChartProps, screenWidth:Number, screenHeight:Number)
		{
			super();
			
			this.showCloseButton = true;

			this.width = screenWidth/3;
			this.height = (screenHeight*2)/3;
 	   
	    	this.setStyle("borderThicknessBottom",0);
		  	this.setStyle("borderThicknessRight",0);
		   	this.setStyle("borderThicknessLeft",0);
	   		
	   		if(chartProps.backgroundColor!=null && chartProps.backgroundColor!=""){
				this.setStyle("backgroundColor", uint(chartProps.backgroundColor));
			}
		}

		public function addLegend(chartLegend:Legend):void
		{
			this.addChild(chartLegend);
		}
		
		public function setPosition(popupStart:Number):void
		{
			if(popupStart <= 10){
	           	popupStart = 10;
	        }
			this.x= popupStart;
			this.y=25;
		}
	}
}