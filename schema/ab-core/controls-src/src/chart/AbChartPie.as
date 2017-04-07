/***********************************************************************
 * Ab.chart.AbChartPie
 *
 * This class defines properties and methods of AbChartColumn. It inherits from
 * Flex charting's mx.charts.ColumnChart class. Using the parameters from archibus
 * view files passed through javascript, user can dynamically build a Column Chart,
 * add the custom event and call back functions.
 *
 * This file is called by AbPieChart.mxml to build a AbColumnChart.swf file.
 * The swf file is used to load into the flash control from ab-chart.js depending on
 * view defintions
 *
 * Author: Ying Qin
 * Date:   June, 2008
 */
package chart
{
	import flash.display.*;

	public class AbChartPie extends AbChartBase{

		import mx.charts.PieChart;
		import mx.charts.series.PieSeries;
		import com.adobe.serialization.json.JSON;
		import mx.collections.ArrayCollection;
		import mx.charts.*;
		import flash.events.MouseEvent;
		import mx.core.*;
		import flash.utils.*;
		import mx.formatters.NumberFormatter;
		import mx.charts.chartClasses.Series;
		import mx.charts.series.items.PieSeriesItem;
		import mx.charts.ChartItem;
		import mx.charts.series.PieSeries;
		import mx.utils.StringUtil;
		import mx.graphics.*;

		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;

		public function AbChartPie(chartConfigObj:String) {
			super(chartConfigObj);

			this._chart = new PieChart();
		}

		override public function setCustomDataTip(item:HitData):String {
			var pieSeriesItem:PieSeriesItem = item.chartItem as PieSeriesItem;
			// Get a reference to the current series.        
			var currentSeries:PieSeries = PieSeries(item.element);
			this.setNumberDecimals(currentSeries.field);
			this.setCurrencySymbol(currentSeries.field);
			if(this._chartProps.showAllDataTips){
				return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>: " +  formatNumber(Number(pieSeriesItem.percentValue.toFixed(1)), false) + "%" +
					"(<i>" + getFormattedValue(Number(pieSeriesItem.value)) + "</i>)<br/>" +
					"<b>" + this._categoryAxis.title + "</b>: " +  pieSeriesItem.item[currentSeries.nameField] + " <br/>" +
					"<b>xField</b>: " + currentSeries.nameField + " ( " + this.getMultilineHeadingForField(currentSeries.nameField) +  " ) <br/>" +
					"<b>yField</b>: " + currentSeries.field + " ( " + this.getMultilineHeadingForField(currentSeries.field) +  " ) <br/>" +
					"<b>unitKey</b>: " + this._unitKey + " <br/>" +
					"<b>unitSuffix</b>: " + this._unitSuffix;

			} else {
				return "<b>" + pieSeriesItem.item[currentSeries.nameField] + ": " +  formatNumber(Number(pieSeriesItem.percentValue.toFixed(1)), false) + "%</b><br />" +
					"(<i>" + getFormattedValue(Number(pieSeriesItem.value)) + "</i>)";
			} 
		}
		private function getDataDisplayTitle(currentSeries:PieSeries):String{
			var dataDisplayTitle:String = currentSeries.displayName;
			if(!dataDisplayTitle || dataDisplayTitle.length < 1) 
				dataDisplayTitle = this.getMultilineHeadingForField(currentSeries.field);
			return dataDisplayTitle;
		}

		/**
		 * This function will format the chart items's y value accroding to the passed
		 * deciaml separator, grouping seperator, number of decimal points
		 * This function is to display the localized numbers in chart
		 */
		private function setCustomLabel(item:Object, field:String, index:Number, percentValue:Number):String {
			for(var fieldName:String in item){
				if(fieldName == field){
					return getFormattedValue(Number(item[field]));
				}	
			}
			return "";
		}

		/**
		 * This function will build the column control dynamically:
		 *  1. add horizontal axis (category axis)
		 *  2. add data axis (a set of pie series)
		 *  3. defines legend
		 *  4. attach the pie chart and legend to the current panel dynamically
		 *  5. attach the panel to the applcation
		 *  6. register custom/default events
		 *  7. add the callback functions
		 */
		public function build(chartData:String) : void{	

			//if no data, then do not build the chart
			if(chartData == null || chartData.length < 1 || chartData == "[]")
				return;

			// the chart is being "built"
			this._isBuildUp = true;

			// set the chart properties from the passed in params
			this._chartProps.setChartData(chartData);

			// !!!do not move this pie to the base class - AbChartBase
			this._chart.showDataTips = _chartProps.showDataTips;

			this.setDataTipFunction(this._chartProps.showAllDataTips);

			// create category axis as X-axis
			this._categoryAxis = new AbGroupingAxis(_chartProps, JSON.decode(chartData));

			// define data axis series array
			this._dataAxisSeries = [];

			addPieSeries();

			this._chart.series = this._dataAxisSeries;

			//set the background color for the flex application
			if(_chartProps.backgroundColor!=null && _chartProps.backgroundColor!=""){
				mx.core.Application.application.setStyle("backgroundColor", uint(_chartProps.backgroundColor));
			}

			//XXX: default height and width as 100%
			this._chart.percentWidth=100;
			this._chart.percentHeight=100;

			// Create the chart panel dynamically and set its properties
			_chartPanel = new AbChartPanel(_chartProps);

			// Attach chart and legend to the display list.
			_chartPanel.addChild(this._chart);

			//attach the panel to the application
			mx.core.Application.application.addChild(_chartPanel);

			if(_chartProps.events != null && _chartProps.events.length > 0){
				// add the custom events defined in archibus view
				addCustomEvents(_chartProps.events);
			} else {
				// add the default events if the custom events are not defined	        
				this._chart.addEventListener(MouseEvent.CLICK, zoomIntoSeries);
			}

			if(_chartProps.showLegendOnLoad){
				if(_chartProps.showLegendAsPopUp){
					// resolve the timing issue for IE
					setTimeout(addLegend2Popup, 1000);
				} else {
					addLegend2Bottom();
				}	
			}	

			addContextMenu();	

			loadComplete();	

		}


		/**
		 * This function will refresh the column chart with a new set of data
		 * It will reset the dataProvider parameter for chart, CategoryAxis and column series.
		 * @parameter:
		 * 		chartData: JSON string, new set of data
		 * return void
		 */ 
		override protected function refreshData(chartData:String):void {	
			if(!this._isBuildUp){
				//build the chart!
				this.build(chartData);
				return;
			}

			//reset the data for pie series
			var arrChartData:Array = (JSON.decode(chartData) as Array);
			var pieSeries:PieSeries = this._dataAxisSeries[0];
			pieSeries.dataProvider = new ArrayCollection(arrChartData);

			loadComplete();	
		}

		private function addPieSeries():void{
			// get the data for the chart
			var data:Array = _chartProps.data;
			if(_chartProps.secondaryGroupingAxis != null){
				this._hasSecondaryGrouping = true;
				// if there is secondary grouping, we will use the first grouping
				// data set as category axis data
				data = _chartProps.data[0]["data"]as Array;
			}

			// loop through each data axis and create a column series 
			var _chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[0], data);

			var pieSeries:PieSeries = new PieSeries();

			pieSeries.nameField = getNameField(_chartProps.groupingAxis);
			pieSeries.field = _chartDataAxis.field;
			pieSeries.displayName = _chartDataAxis.title;
			pieSeries.dataProvider = new ArrayCollection(data);

			this._unitKey = _chartProps.dataAxis[0].unitKey;
			this._unitDivisor = _chartDataAxis.unitDivisor;
			this._unitSuffix = _chartProps.dataAxis[0].unitSuffix;

			//set the label according to the current locale number format
			pieSeries.labelFunction = setCustomLabel;

			//property "labelPosition" allows "callout", "inside", "outside", "insideWithCallout" or "none" values for Column charts
			// this value is validated inside the ab-chart.js file
			pieSeries.setStyle("labelPosition", _chartDataAxis.labelPosition);

			pieSeries.setStyle("calloutGap", _chartDataAxis.calloutGap);
			pieSeries.setStyle("insideLabelSizeLimit", _chartDataAxis.insideLabelSizeLimit);

			this.setNumberDecimals(pieSeries.field);
			this.setCurrencySymbol(pieSeries.field);

			//Set color for the dataAxis
			this.setPieFills(_chartProps.fillType, pieSeries);

			this._dataAxisSeries.push(pieSeries);

			this._chart.series = this._dataAxisSeries;
		}

		override protected function setFillColors(fillType:String, fillColors:Array, fillColorsDesaturated:Array, percentGradientChange: Number, percentTransparency: Number):void{
			this._chartProps.fillColor = fillColors;
			this._chartProps.fillType = fillType;
			if(fillType != AbChartProps.FILLTYPE_SOLID){
				this._chartProps.fillColorDesaturated = fillColorsDesaturated;
				this._chartProps.percentGradientChange = percentGradientChange;
				this._chartProps.percentTransparency = percentTransparency;
			} else {
				this._chartProps.percentGradientChange = 1.0;
				this._chartProps.percentTransparency = 1.0;
			}

			this.setPieFills(fillType, PieSeries(this._chart.series[0]));
		}

		private function setPieFills(fillType:String, pieSeries:PieSeries):void{
			if(fillType == AbChartProps.FILLTYPE_SOLID){
				pieSeries.setStyle("fills", getSolidColors());
			}else if(fillType == AbChartProps.FILLTYPE_LINEARGRADIENT) {
				pieSeries.setStyle("fills", getLinearGradientColors());
			} else if (fillType == AbChartProps.FILLTYPE_RADIALGRADIENT ){
				pieSeries.setStyle("fills", getRadialGradientColors());
			}
		}

		private function getNameField(groupingAxis:Object):String{	
			if(groupingAxis.hasOwnProperty("field")){
				if(groupingAxis.hasOwnProperty("table")) 
					return groupingAxis.table + "." + groupingAxis.field;
				else
					return groupingAxis.field;
			}

			return "";
		}
		private function getSolidColors():Array{
			var pieFills:Array = new Array();
			for(var index:int = 0; index < this._chartProps.fillColor.length; index++){
				var pieFill:SolidColor = new SolidColor();

				//always use the default chart color defined in ab-chart.js
				pieFill.color = uint(this._chartProps.fillColor[index]);
				pieFill.alpha = this._chartProps.percentTransparency;
				pieFills[index] = pieFill;
			}

			return pieFills;
		}

		private function getLinearGradientColors():Array{
			var pieFills:Array = new Array();
			var length:int = (this._chartProps.fillColor.length > this._chartProps.fillColorDesaturated.length ? this._chartProps.fillColor.length : this._chartProps.fillColorDesaturated.length);
			for(var index:int = 0; index < length; index++){
				var colorIndex:int = index%(this._chartProps.fillColor.length);
				var colorIndexDesatured:int = index%(this._chartProps.fillColorDesaturated.length);

				var g1:GradientEntry = new GradientEntry(this._chartProps.fillColor[colorIndex],0,_chartProps.percentTransparency);
				var g2:GradientEntry = new GradientEntry(this._chartProps.fillColorDesaturated[colorIndexDesatured],_chartProps.percentGradientChange,_chartProps.percentTransparency);

				var linearGradientFill:LinearGradient = new LinearGradient();    
				linearGradientFill.entries = [g1,g2];
				pieFills[index] = linearGradientFill;
			}			
			return pieFills;
		}

		private function getRadialGradientColors():Array{
			var pieFills:Array = new Array();
			var length:int = (this._chartProps.fillColor.length > this._chartProps.fillColorDesaturated.length ? this._chartProps.fillColor.length : this._chartProps.fillColorDesaturated.length);
			for(var index:int = 0; index < length; index++){
				var colorIndex:int = index%(this._chartProps.fillColor.length);
				var colorIndexDesatured:int = index%(this._chartProps.fillColorDesaturated.length);

				var g1:GradientEntry = new GradientEntry(this._chartProps.fillColor[colorIndex],0,_chartProps.percentTransparency);
				var g2:GradientEntry = new GradientEntry(this._chartProps.fillColorDesaturated[colorIndexDesatured],_chartProps.percentGradientChange,_chartProps.percentTransparency);

				var radialGradientFill:RadialGradient = new RadialGradient();    
				radialGradientFill.entries = [g1,g2];
				pieFills[index] = radialGradientFill;
			}			
			return pieFills;
		}	
	}	
}


