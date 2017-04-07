/***********************************************************************
 * Ab.chart.AbChartLine
 *
 * This class defines properties and methods of AbChartColumn. It inherits from
 * Flex charting's mx.charts.ColumnChart class. Using the parameters from archibus
 * view files passed through javascript, user can dynamically build a Column Chart,
 * add the custom event and call back functions.
 *
 * This file is called by AbLineChart.mxml to build a AbColumnChart.swf file.
 * The swf file is used to load into the flash control from ab-chart.js depending on
 * view defintions
 *
 * Author: Ying Qin
 * Date:   June, 2008
 */
package chart
{
	import flash.display.*;

	public class AbChartLine extends AbChartBase{

		import mx.charts.LineChart;
		import mx.charts.series.LineSeries;
		import com.adobe.serialization.json.JSON;
		import mx.collections.ArrayCollection;
		import mx.charts.*;
		import flash.events.MouseEvent;
		import mx.core.*;
		import flash.utils.*;
		import mx.formatters.NumberFormatter;
		import mx.charts.chartClasses.Series;
		import mx.charts.series.items.LineSeriesItem;
		import mx.charts.ChartItem;
		import mx.charts.series.LineSeries;
		import mx.charts.series.items.LineSeriesItem;

		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;

		public function AbChartLine(chartConfigObj:String) {
			super(chartConfigObj);

			this._chart = new LineChart();
		}

		override public function setCustomDataTip(item:HitData):String {
			var lineSeriesItem:LineSeriesItem = item.chartItem as LineSeriesItem;

			// Get a reference to the current series.        
			var currentSeries:LineSeries = LineSeries(item.element);
			this.setNumberDecimals(currentSeries.yField);
			this.setCurrencySymbol(currentSeries.yField);

			if(this._chartProps.showAllDataTips){
				return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>:" +  lineSeriesItem.xValue + " <br/>" +
					"<b>" + this._categoryAxis.title + "</b>:" +  getFormattedValue(lineSeriesItem.yNumber) + " <br/>" +
					"<b>xField</b>: " + currentSeries.xField + " ( " + this.getMultilineHeadingForField(currentSeries.xField) +  " ) <br/>" +
					"<b>yField</b>: " + currentSeries.yField + " ( " + this.getMultilineHeadingForField(currentSeries.yField) +  " ) <br/>" +
					"<b>unitKey</b>: " + this._unitKey + " <br/>" +
					"<b>unitSuffix</b>: " + this._unitSuffix;

			} else {
				return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b><br />" +  lineSeriesItem.xValue + " <br/>" +
					getFormattedValue(lineSeriesItem.yNumber);
			}
		}

		private function getDataDisplayTitle(currentSeries:LineSeries):String{
			var dataDisplayTitle:String = currentSeries.displayName;
			if(!dataDisplayTitle || dataDisplayTitle.length < 1) 
				dataDisplayTitle = this.getMultilineHeadingForField(currentSeries.yField);
			return dataDisplayTitle;
		}

		/**
		 * This function will build the column control dynamically:
		 *  1. add horizontal axis (category axis)
		 *  2. add data axis (a set of line series)
		 *  3. defines legend
		 *  4. attach the line chart and legend to the current panel dynamically
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

			this._displayAxisArray = new Object();

			// !!!do not move this line to the base class - AbChartBase
			this._chart.showDataTips = _chartProps.showDataTips;

			this.setDataTipFunction(this._chartProps.showAllDataTips);

			// get the data for the chart
			var data:Array = _chartProps.data;
			if(_chartProps.secondaryGroupingAxis != null){
				this._hasSecondaryGrouping = true;
				// if there is secondary grouping, we will use the first grouping
				// data set as category axis data
				data = _chartProps.data[0]["data"]as Array;
			}

			// create category axis as X-axis
			_categoryAxis = new AbGroupingAxis(_chartProps, data);
			LineChart(this._chart).horizontalAxis = _categoryAxis;

			//assign the render to horizontalAxis to control the show axis label
			var hAxisRenderer:AxisRenderer = getAxisRenderer(_chartProps.groupingAxis.showLabel, "bottom", true, _chartProps.groupingAxis.showTick, _chartProps.groupingAxis.showMinorTick);
			LineChart(this._chart).horizontalAxisRenderer = hAxisRenderer;
			hAxisRenderer.setStyle("labelRotation", _chartProps.groupingAxis.labelRotation);

			// define data axis series array
			this._dataAxisSeries = [];
			this._chart.series = [];
			if(this._hasSecondaryGrouping){
				add2DLineSeries(_chartProps.data);
			} else {
				add1DLineSeries(_chartProps.data);
			}
			this._chart.series = this._dataAxisSeries;

			// if none of the axis has "displayAxis=true", then set vertical axis
			if(LineChart(this._chart).verticalAxisRenderers.length < 1){
				// define a new vertical axis data
				var vAxis0:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);;

				//set the decimal for the current vertical axis
				this.setNumberDecimals(this._dataAxisSeries[0].yField);
				this.setCurrencySymbol(this._dataAxisSeries[0].yField);

				//retrieve the unit key and suffix from data axis properties
				this._unitKey = _chartProps.dataAxis[0].unitKey;
				var dAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[0], _chartProps.data);
				this._unitDivisor = dAxis.unitDivisor;
				this._unitSuffix = _chartProps.dataAxis[0].unitSuffix;
				vAxis0.labelFunction = super.defineVerticalAxisLabel;

				//assign the render to verticalAxis to control the show axis label
				var vAxisRenderer:AxisRenderer = getVAxisRenderer(_chartProps.dataAxis[0].showLabel, vAxis0, false, _chartProps.dataAxis[0].showTick, _chartProps.dataAxis[0].showMinorTick);
				LineChart(this._chart).verticalAxisRenderer = vAxisRenderer;
				vAxisRenderer.setStyle("labelRotation", _chartProps.dataAxis[0].labelRotation);

				if(!_chartProps.dataAxis[0].autoCalculateTickSizeInterval){
					// define a new vertical axis data
					var vAxis:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);

					LineChart(this._chart).verticalAxis = vAxis;

					// set the custom interval
					vAxis.interval = _chartProps.dataAxis[0].tickSizeInterval;
				}
			}

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

			this._dataAxisSeries = [];
			this._chart.series = [];

			this._displayAxisArray = new Object();

			//reset vertical axis renderer
			LineChart(this._chart).verticalAxisRenderers = [];

			var arrChartData:Array = (JSON.decode(chartData) as Array);

			try{
				if(this._hasSecondaryGrouping){
					//XXX: 2D - regenerate column series based on data
					var categData:Array = arrChartData[0]["data"]as Array;
					this._categoryAxis.dataProvider = new ArrayCollection(categData);
					add2DLineSeries(arrChartData);
				}else{	
					//XXX: 1D - resue column series				
					//reset the data for the category axis
					this._categoryAxis.dataProvider = new ArrayCollection(arrChartData);
					add1DLineSeries(arrChartData);
				}
				this._chart.series = this._dataAxisSeries;
			}catch(e:Error){
				//bypass the strange Flex "type error" when the chart is empty
			}

			loadComplete();	
		}

		private function add1DLineSeries(data: Array):void{

			// loop through each data axis and create a column series 
			for(var index:int=0; index<_chartProps.dataAxis.length; index++){
				// set nth data axis's properties
				var _chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[index], data);

				addLineSeries(_chartDataAxis, _chartDataAxis.title, index, data);
			}

			this._chart.series = this._dataAxisSeries;
		}

		/**
		 *
		 */ 
		private function addLineSeries(chartDataAxis:AbDataAxis, title:String, index:int, data: Array):void {

			// create a new column series and set its properties
			var lineSeries:LineSeries = new LineSeries();

			// add vertical axis		
			// do not add if this is the first dataAxis since the vertical axis will always be added for the first dataAxis		
			if(chartDataAxis.displayAxis && this._chartProps.dataAxis.length > 1 ){
				addLineVerticalAxis(lineSeries, chartDataAxis);
			}

			lineSeries.xField= _categoryAxis.categoryField;
			lineSeries.yField = chartDataAxis.field;
			lineSeries.displayName = title;

			//!!! DO NOT set this option. It will turn off the drilldown 
			//lineSeries.filterData = false;

			lineSeries.dataProvider = new ArrayCollection(data);

			// property "labelPosition" only works for Bar, Column and Pie charts	
			//lineSeries.setStyle("labelPosition", ...);

			_dataAxisSeries.push(lineSeries);	

		}    	

		//XXX: create 2D column series
		private function add2DLineSeries(chartData:Array):void{

			for(var i:int=0; i<chartData.length; i++){
				var item:Object = chartData[i];
				var secondaryGroupingAxisValue:String = item[_chartProps.secondaryGroupingAxis.id];
				var seriesData:Array = item['data'] as Array;
				for(var index:int=0; index<_chartProps.dataAxis.length; index++){
					// set nth data axis's properties
					var _chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[index], seriesData);

					var title:String = secondaryGroupingAxisValue;
					if(_chartProps.dataAxis.length > 1){
						title = secondaryGroupingAxisValue + ":" + _chartDataAxis.title;
					}		        	

					addLineSeries(_chartDataAxis, title, index, seriesData);
				}
			}
		}

		private function addLineVerticalAxis(lineSeries:LineSeries, chartDataAxis:AbDataAxis):void{
			// if the vertical axis has not been rendered
			if(!checkIfExisting(_displayAxisArray, chartDataAxis.field)){
				// define a new vertical axis data
				var vAxis:LinearAxis = getLinearAxis(_chartProps, chartDataAxis.showTitle, chartDataAxis.title);

				//set the decimals for the current axis
				this.setNumberDecimals(lineSeries.yField);
				this.setCurrencySymbol(lineSeries.yField);

				//retrieve the unit key and suffix from data axis properties
				this._unitKey = chartDataAxis.unitKey;
				this._unitDivisor = chartDataAxis.unitDivisor;
				this._unitSuffix = chartDataAxis.unitSuffix;
				vAxis.labelFunction = super.defineVerticalAxisLabel;

				// add the vertical axis renderer if it is not been added yet.				
				LineChart(this._chart).verticalAxisRenderers.push(getVAxisRenderer(chartDataAxis.showLabel, vAxis, false, chartDataAxis.showTick, chartDataAxis.showMinorTick ));						

				// set the vertical axis data for the line series
				lineSeries.verticalAxis = vAxis;

				//add the value into the vertical axis array
				_displayAxisArray[chartDataAxis.field] = vAxis;

				if(!chartDataAxis.autoCalculateTickSizeInterval){
					// set the custom interval
					vAxis.interval = chartDataAxis.tickSizeInterval;
				}
			}
		}
	}	
}


