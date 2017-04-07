package chart
{
	import mx.charts.CategoryAxis;
		
	public class AbGroupingAxis extends CategoryAxis{
		import mx.collections.ArrayCollection;

		public var showLabel:Boolean = true;
		public var showTitle:Boolean = true;
		
		public var labelRotation:int = 0;
		
		public var showTick:Boolean = true;
		public var showMinorTick:Boolean = true;

		public function AbGroupingAxis(_chartProps:AbChartProps, arrCollChartData:Array){
			super();

			var groupingAxis:Object = _chartProps.groupingAxis;

			if(groupingAxis.hasOwnProperty("title"))
				this.title = groupingAxis.title;
			
			if(groupingAxis.hasOwnProperty("showTitle")){
				if(!groupingAxis.showTitle){
					this.title = "";
				}
			}

			
			if(groupingAxis.hasOwnProperty("field")){
				if(groupingAxis.hasOwnProperty("table")) 
					this.categoryField = groupingAxis.table + "." + groupingAxis.field;
				else
					this.categoryField = groupingAxis.field;
			}
			

			if(groupingAxis.hasOwnProperty("showLabel"))
				this.showLabel = groupingAxis.showLabel;
			
			if(groupingAxis.hasOwnProperty("labelRotation"))
				this.labelRotation = groupingAxis.labelRotation;
			
			if(groupingAxis.hasOwnProperty("showTick"))
				this.showTick = groupingAxis.showTick;
			
			if(groupingAxis.hasOwnProperty("showMinorTick"))
				this.showMinorTick = groupingAxis.showMinorTick;

			if(groupingAxis.hasOwnProperty("labelRotation"))
				this.labelRotation = groupingAxis.labelRotation;
				
			//if(groupingAxis.hasOwnProperty("labelFunction"))
				//this.labelFunction = groupingAxis.labelFunction;

			if(groupingAxis.hasOwnProperty("data")){
				var arrGroupingAxisData:Array = (groupingAxis.data as Array);
				this.dataProvider = new ArrayCollection(arrGroupingAxisData);
			} else {
				this.dataProvider = new ArrayCollection(arrCollChartData);
			}
			
		}
		
	}
}