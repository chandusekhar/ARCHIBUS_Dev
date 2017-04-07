package chart
{
	public class AbDataAxis
	{
		import mx.collections.ArrayCollection;
		
		public static const DATAAXISTYPE_LINE:String = "line"; // default
		public static const DATAAXISTYPE_COLUMN:String = "column"; // default
		
		public var field:String = null;
		public var data:Array = null;
		public var type:String = null;
		public var displayAxis:Boolean = false;

		public var showTitle:Boolean = true;
		public var title:String = null;
		
		public var autoCalculateTickSizeInterval:Boolean = true;
		public var tickSizeInterval:int = 1000;
		
		public var showLabel:Boolean = true;
		public var labelPosition:String = "none";
		public var labelRotation:int = 0;
		public var calloutGap:int = 10;
		public var insideLabelSizeLimit:int = 9;
		
		public var unitKey:String = "1";
		public var unitDivisor:int = 1;
		public var unitSuffix:String = "";

		public var showTick:Boolean = true;
		public var showMinorTick:Boolean = true;

		public function AbDataAxis(dataAxis:Object, arrCollChartData:Array)
		{
			if(dataAxis.hasOwnProperty("field")){
				if(dataAxis.hasOwnProperty("table")) 
					this.field = dataAxis.table + "." + dataAxis.field;
				else
					this.field = dataAxis.field;
			}
			
			if(dataAxis.hasOwnProperty("type"))
				this.type = dataAxis.type;
			
			if(dataAxis.hasOwnProperty("showTitle"))
				this.showLabel = dataAxis.showTitle;
	
			if(dataAxis.hasOwnProperty("title"))
				this.title = dataAxis.title;
				
			if(dataAxis.hasOwnProperty("displayAxis"))
				this.displayAxis = dataAxis.displayAxis;


			if(dataAxis.hasOwnProperty("showLabel"))
				this.showLabel = dataAxis.showLabel;

			if(dataAxis.hasOwnProperty("labelPosition"))
				this.labelPosition = dataAxis.labelPosition;

			if(dataAxis.hasOwnProperty("calloutGap"))
				this.calloutGap = dataAxis.calloutGap;

			if(dataAxis.hasOwnProperty("insideLabelSizeLimit"))
				this.insideLabelSizeLimit = dataAxis.insideLabelSizeLimit;

			if(dataAxis.hasOwnProperty("labelRotation"))
				this.labelRotation = dataAxis.labelRotation;

			if(dataAxis.hasOwnProperty("autoCalculateTickSizeInterval")){
				this.autoCalculateTickSizeInterval = dataAxis.autoCalculateTickSizeInterval;
				
				if(!this.autoCalculateTickSizeInterval && dataAxis.hasOwnProperty("tickSizeInterval")){
					this.tickSizeInterval = dataAxis.tickSizeInterval;
				}
			}
		
			if(dataAxis.hasOwnProperty("unitKey")){
				this.setUnitKey(dataAxis.unitKey);
			}		

			if(dataAxis.hasOwnProperty("unitSuffix")){
				this.unitSuffix = dataAxis.unitSuffix;
			}		

			if(dataAxis.hasOwnProperty("showTick"))
				this.showTick = dataAxis.showTick;
			
			if(dataAxis.hasOwnProperty("showMinorTick"))
				this.showMinorTick = dataAxis.showMinorTick;
				
			if(dataAxis.hasOwnProperty("data")){
				var arrDataAxisData:Array = (dataAxis.data as Array);
				this.data = arrDataAxisData;
			} else {
				this.data = arrCollChartData;
			}
		}
		
		public function setUnitKey(uKey:String):void{
			switch (uKey) { 
				case "K" :
					this.unitKey = "K";
					this.unitDivisor = 1000;
					break;
				case "M":
					this.unitKey = "M";
					this.unitDivisor = 1000000;
					break;
				case "B":
					this.unitKey = "B";
					this.unitDivisor = 1000000000;
					break;
				default:
					this.unitKey = "1";
					this.unitDivisor = 1;
				}
					
		}
	}
}