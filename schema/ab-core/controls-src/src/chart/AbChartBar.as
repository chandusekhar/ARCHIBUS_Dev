/***********************************************************************
 * Ab.chart.AbChartBar
 *
 * This class defines properties and methods of AbChartBar. It inherits from
 * Flex charting's mx.charts.BarChart class. Using the parameters from archibus
 * view files passed through javascript, user can dynamically build a Column Chart,
 * add the custom event and call back functions.
 *
 * This file is called by AbBarChart.mxml to build a AbBarChart.swf file.
 * The swf file is used to load into the flash control from ab-chart.js depending on
 * view defintions
 *
 * Author: Ying Qin
 * Date:   April, 2008
 *
 * YS(2008-5-22): implementing 2D column charts
 * YS(2008-5-25): implementing line-mixed charts
 * YS(2008-5-30): implementing display vertical-asix charts
 * YS(2008-6-2): implementing Legend disloag
 * YS(2008-6-3): implementing showOnLoad=false feature
 */
package chart
{
	import com.adobe.utils.StringUtil;

	import flash.display.*;

	import mx.utils.StringUtil;

	public class AbChartBar extends AbChartBase{

		import mx.charts.BarChart;

		import mx.charts.series.BarSeries;
		import com.adobe.serialization.json.JSON;
		import mx.collections.ArrayCollection;
		import mx.charts.*;
		import flash.events.MouseEvent;
		import mx.core.*;
		import mx.charts.series.BarSet;
		import flash.utils.*;
		import mx.formatters.NumberFormatter;
		import mx.charts.chartClasses.Series;
		import mx.charts.series.items.BarSeriesItem;
		import mx.charts.ChartItem;
		import mx.charts.series.BarSeries;

		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;

		public function AbChartBar(chartConfigObj:String) {
			super(chartConfigObj);

			this._chart = new BarChart();
		}

		private function getStackedTotalForXField(barSet:BarSet, yValue:Object):Number{

			var total:Number = 0;

			// find the top series
			var barSeries:BarSeries = barSet.series[barSet.series.length-1];

			//loop throught the top series's item, find the one that match the current hitdata's x-value
			for(var itemIndex:int=0; itemIndex<barSeries.items.length; itemIndex++){
				// get the area series's item
				var barSeriesItem:BarSeriesItem = barSeries.items[itemIndex] as BarSeriesItem;

				// if the x-value matches, return the y-number, this will be the total since it is a stack chart					    
				if(barSeriesItem.yValue == yValue){
					return barSeriesItem.xNumber;
				}
			}

			// if nothing found
			return 0;			
		}

		private function getYNumberForCurrentItem(barSet:BarSet, currentSeries:BarSeries, barSeriesItem:BarSeriesItem):Number{

			// find the index for the cuurent hitData's series
			var index:int = barSet.series.indexOf(currentSeries);

			if(index>0){
				// the x-number is the stacked value of the item, we need to substract it from the previous series's
				// hitData's y-value
				var barSeriesPrev:BarSeries = barSet.series[index-1];

				//loop through prev series, find the x-number
				for(var indexPrev:int=0; indexPrev<barSeriesPrev.items.length; indexPrev++){
					var barSeriesItemPrev:BarSeriesItem = barSeriesPrev.items[indexPrev] as BarSeriesItem;

					if(barSeriesItemPrev.yValue == barSeriesItem.yValue){
						//substract the number
						return (barSeriesItem.xNumber - barSeriesItemPrev.xNumber);
					}
				}
			}

			// if no other series before this, the y-number is the value for the item
			return barSeriesItem.xNumber;

		}

		override public function setCustomDataTip(item:HitData):String {
			var barSeriesItem:BarSeriesItem = item.chartItem as BarSeriesItem;
			item.item
			// Get a reference to the current series.        
			var currentSeries:BarSeries = BarSeries(item.element);
			this.setNumberDecimals(currentSeries.xField);
			this.setCurrencySymbol(currentSeries.xField);

			if(this._chartProps.type == AbChartProps.CHARTTYPE_STACKEDBAR){
				//stacked chart has only one AreaSet
				var barSet:BarSet = (this._chart.series[0] as BarSet);
				var barTotal:Number = this.getStackedTotalForXField(barSet,barSeriesItem.yValue); 
				var barNumber:Number = this.getYNumberForCurrentItem(barSet, currentSeries, barSeriesItem);
				var percentValue:Number = 0;
				if(barTotal>0){
					percentValue =(barNumber*100.00/barTotal); 
				}

				var panelId:String = Application.application.parameters.panelId;

				if(this._chartProps.showAllDataTips){
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>:" +  barSeriesItem.yValue + " <br/>" +
						"<b>" + this._categoryAxis.title + "</b>:" +  getFormattedValue(barSeriesItem.xNumber) + " (" + percentValue.toFixed(1) + "%)<br />" +
						"<b>" + getLocalizedString(panelId, "Total") + ":</b> " + getFormattedValue(barTotal) + " <br/>" +
						"<b>xField</b>: " + currentSeries.xField + " ( " + this.getMultilineHeadingForField(currentSeries.xField) +  " ) <br/>" +
						"<b>yField</b>: " + currentSeries.yField + " ( " + this.getMultilineHeadingForField(currentSeries.yField) +  " ) <br/>" +
						"<b>unitKey</b>: " + this._unitKey + " <br/>" +
						"<b>unitSuffix</b>: " + this._unitSuffix;

				} else {
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b><br />" +
						barSeriesItem.yValue + " <br/>" +
						getFormattedValue(barNumber) + " (" + percentValue.toFixed(1) + "%)<br />" +
						"<i>" + getLocalizedString(panelId, "Total") + ":</i> " + getFormattedValue(barTotal) ;
				}

			} else {    
				if(this._chartProps.showAllDataTips){
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>:" +  barSeriesItem.yValue + " <br/>" +
						"<b>" + this._categoryAxis.title + "</b>:" +  getFormattedValue(barSeriesItem.xNumber) + " <br/>" +
						"<b>xField</b>: " + currentSeries.xField + " ( " + this.getMultilineHeadingForField(currentSeries.xField) +  " ) <br/>" +
						"<b>yField</b>: " + currentSeries.yField + " ( " + this.getMultilineHeadingForField(currentSeries.yField) +  " ) <br/>" +
						"<b>unitKey</b>: " + this._unitKey + " <br/>" +
						"<b>unitSuffix</b>: " + this._unitSuffix;

				} else {
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b><br />" +
						barSeriesItem.yValue + " <br/>" +
						getFormattedValue(barSeriesItem.xNumber);
				}
			}
		}

		private function getDataDisplayTitle(currentSeries:BarSeries):String{
			var dataDisplayTitle:String = currentSeries.displayName;
			if(!dataDisplayTitle || dataDisplayTitle.length < 1) 
				dataDisplayTitle = this.getMultilineHeadingForField(currentSeries.xField);
			return dataDisplayTitle;
		}

		/**
		 * This function will format the chart items's y value accroding to the passed
		 * deciaml separator, grouping seperator, number of decimal points
		 * This function is to display the localized numbers in chart
		 */
		private function setCustomLabel(element:ChartItem, series:Series):String {
			// Get a refereence to the current data element.
			var barSeriesItem:BarSeriesItem = BarSeriesItem(element);        

			// Get a reference to the current series.        
			var currentSeries:BarSeries = BarSeries(series);
			this.setNumberDecimals(currentSeries.xField);
			this.setCurrencySymbol(currentSeries.xField);

			if(this._chartProps.type == AbChartProps.CHARTTYPE_STACKEDBAR){
				//stacked chart has only one AreaSet
				var barSet:BarSet = (this._chart.series[0] as BarSet);
				var barNumber:Number = this.getYNumberForCurrentItem(barSet, currentSeries, barSeriesItem);
				return getFormattedValue(barNumber);

			} else {
				// Create a return String and format the number.
				return getFormattedValue(barSeriesItem.xNumber);
			} 
		}


		/**
		 * This function will build the column control dynamically:
		 *  1. add horizontal axis (category axis)
		 *  2. add data axis (a set of column series)
		 *  3. defines legend
		 *  4. attach the column chart and legend to the current panel dynamically
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
				_hasSecondaryGrouping = true;
				// if there is secondary grouping, we will use the first grouping
				// data set as category axis data
				data = _chartProps.data[0]["data"]as Array;
			}

			// create category axis as Y-axis
			_categoryAxis = new AbGroupingAxis(_chartProps, data);

			BarChart(this._chart).verticalAxis = _categoryAxis;

			//assign the render to horizontalAxis to control the show axis label
			var vAxisRenderer:AxisRenderer = getAxisRenderer(_chartProps.groupingAxis.showLabel, "left", true, _chartProps.groupingAxis.showTick, _chartProps.groupingAxis.showMonirTick);
			BarChart(this._chart).verticalAxisRenderer = vAxisRenderer;
			vAxisRenderer.setStyle("labelRotation", _chartProps.groupingAxis.labelRotation);

			// define data axis series array
			this._dataAxisSeries = [];
			this._chart.series = [];

			if(this._hasSecondaryGrouping){
				add2DBarSeries(_chartProps.data);
			} else {
				add1DBarSeries(_chartProps.data);
			}

			// stack the chart for "stackedAreaChart" type
			if(_chartProps.type == AbChartProps.CHARTTYPE_STACKEDBAR)
			{
				var barSet:BarSet = new BarSet();
				barSet.type = "stacked";
				barSet.series = this._dataAxisSeries;
				this._chart.series = [barSet];
			} else {
				// none stacked area chart
				this._chart.series = this._dataAxisSeries;
			}


			// if none of the axis has "displayAxis=true", then set vertical axis
			if(BarChart(this._chart).horizontalAxisRenderers.length < 1){
				// define a new vertical axis data
				var hAxis0:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);;

				//set the decimals for the current axis
				this.setNumberDecimals(this._dataAxisSeries[0].xField);
				this.setCurrencySymbol(this._dataAxisSeries[0].xField);

				//retrieve the unit key and suffix from data axis properties
				this._unitKey = _chartProps.dataAxis[0].unitKey;
				var dAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[0], _chartProps.data);
				this._unitDivisor = dAxis.unitDivisor;
				this._unitSuffix = _chartProps.dataAxis[0].unitSuffix;
				hAxis0.labelFunction = super.defineVerticalAxisLabel;

				//assign the render to verticalAxis to control the show axis label
				var hAxisRenderer:AxisRenderer = getHAxisRenderer(_chartProps.dataAxis[0].showLabel, hAxis0, false, _chartProps.dataAxis[0].showTick, _chartProps.dataAxis[0].showMinorTick);
				BarChart(this._chart).horizontalAxisRenderer = hAxisRenderer;
				hAxisRenderer.setStyle("labelRotation", _chartProps.dataAxis[0].labelRotation);

				if(!_chartProps.dataAxis[0].autoCalculateTickSizeInterval){
					// define a new vertical axis data and set the horizontal axis data
					var hAxis:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);;

					BarChart(this._chart).horizontalAxis = hAxis;

					// set the custom interval
					hAxis.interval = _chartProps.dataAxis[0].tickSizeInterval;
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
			BarChart(this._chart).horizontalAxisRenderers = [];

			var arrChartData:Array = (JSON.decode(chartData) as Array);
			if(this._hasSecondaryGrouping){
				//XXX: 2D - regenerate bar series based on data
				var categData:Array = arrChartData[0]["data"]as Array;
				this._categoryAxis.dataProvider = new ArrayCollection(categData);
				add2DBarSeries(arrChartData);
			}else{	
				//XXX: 1D - resue bar series				
				//reset the data for the category axis
				this._categoryAxis.dataProvider = new ArrayCollection(arrChartData);
				add1DBarSeries(arrChartData);
			}

			// stack the chart for "stackedAreaChart" type
			if(_chartProps.type == AbChartProps.CHARTTYPE_STACKEDBAR)
			{
				var barSet:BarSet = new BarSet();
				barSet.type = "stacked";
				barSet.series = this._dataAxisSeries;
				this._chart.series = [barSet];
			} else {
				// none stacked area chart
				this._chart.series = this._dataAxisSeries;
			}

			loadComplete();	

		}

		private function add1DBarSeries(data: Array):void{


			// loop through each data axis and create a column series 
			for(var index:int=0; index<_chartProps.dataAxis.length; index++){
				// set nth data axis's properties
				var _chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[index], data);

				addBarSeries(_chartDataAxis, _chartDataAxis.title, index, data);
			}
		}

		/**
		 *
		 */ 
		private function addBarSeries(chartDataAxis:AbDataAxis, title:String, index:int, data: Array):void {

			// create a new column series and set its properties
			var barSeries:BarSeries = new BarSeries();

			// add vertical axis		
			// do not add if this is the first dataAxis since the vertical axis will always be added for the first dataAxis		
			if(chartDataAxis.displayAxis && this._chartProps.dataAxis.length > 1){
				addBarHorizontalAxis(barSeries, chartDataAxis, index);
			}

			barSeries.xField = chartDataAxis.field;
			barSeries.yField= _categoryAxis.categoryField;
			barSeries.displayName = title;
			barSeries.dataProvider = new ArrayCollection(data);

			//set the label according to the current locale number format
			barSeries.labelFunction = setCustomLabel;

			// for stacked bar charts, "inside", "outside or "none" are allowed and work.
			// for non-stacked bar with single series,  "inside", "outside" or "none" are allowed and work.
			// !!!! BUG in Flex for non-stacked bar with multiple series!!!
			// the label will NOT show even if you set the "LabelPosition" Property
			// to "inside" or "outside" values

			// only set the label position if it is not a stacked bar or have only one bar series.
			// !!!BUG in Flex: 
			// For stacked bar with multiple series, set "labelPosistion" will cause a runtime error:
			//TypeError: Error #1009: Cannot access a property or method of a null object reference.
			// mx.charts::BarChart/http://www.adobe.com/2006/flex/mx/internal::measureLabels()[C:\Work\flex\dmv_automation\projects\datavisualisation\src\mx\charts\BarChart.as:672]
			if(this._chartProps.type != AbChartProps.CHARTTYPE_STACKEDBAR || !this._hasSecondaryGrouping){
				barSeries.setStyle("labelPosition", chartDataAxis.labelPosition);
			}

			//Set color for the dataAxis
			this.setFills(index, _chartProps.fillType, barSeries); 

			_dataAxisSeries.push(barSeries);	
		}    	

		//XXX: create 2D column series
		private function add2DBarSeries(chartData:Array):void{

			//reset secondary grouping counter
			this._secondaryGroupingColorIndex = 0;

			for(var i:int=0; i<chartData.length; i++){
				var item:Object = chartData[i];
				var secondaryGroupingAxisValue:String = item[_chartProps.secondaryGroupingAxis.id];
				var seriesData:Array = item['data'] as Array;
				for(var index:int=0; index<_chartProps.dataAxis.length; index++){
					// set nth data axis's properties
					var chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[index], seriesData);

					var title:String = secondaryGroupingAxisValue;
					if(_chartProps.dataAxis.length > 1){
						title = secondaryGroupingAxisValue + ":" + chartDataAxis.title;
					}		        	

					addBarSeries(chartDataAxis, title, index, seriesData);
				}
			}
		}

		private function addBarHorizontalAxis(colSeries:BarSeries, chartDataAxis:AbDataAxis, index:int):void{
			// if the vertical axis has not been rendered
			if(!checkIfExisting(_displayAxisArray, chartDataAxis.field)){
				// define a new vertical axis data
				var hAxis:LinearAxis = getLinearAxis(_chartProps, chartDataAxis.showTitle, chartDataAxis.title);;

				//set the decimals for the current axis
				this.setNumberDecimals(colSeries.xField);
				this.setCurrencySymbol(colSeries.xField);

				//retrieve the unit key and suffix from data axis properties
				this._unitKey = _chartProps.dataAxis[0].unitKey;
				var dAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[0], _chartProps.data);
				this._unitDivisor = dAxis.unitDivisor;
				this._unitSuffix = _chartProps.dataAxis[0].unitSuffix;
				hAxis.labelFunction = super.defineVerticalAxisLabel;

				// add the vertical axis renderer if it is not been added yet.				
				// !!! The function does not work!!!
				// !!!the horizontal axis became the vertical axis!!!
				//BarChart(this._chart).horizontalAxisRenderers.push(getHAxisRenderer(chartDataAxis.showLabel, hAxis ));						
				// This is a workaround for the previous line
				if(index % 2 == 0){
					BarChart(this._chart).horizontalAxisRenderer = getHAxisRenderer(chartDataAxis.showLabel, hAxis, false, chartDataAxis.showTick, chartDataAxis.showMinorTick );
					BarChart(this._chart).horizontalAxisRenderers.push(BarChart(this._chart).horizontalAxisRenderer);					
				} else {
					BarChart(this._chart).secondHorizontalAxisRenderer = getHAxisRenderer(chartDataAxis.showLabel, hAxis, false, chartDataAxis.showTick, chartDataAxis.showMinorTick );						
					BarChart(this._chart).horizontalAxisRenderers.push(BarChart(this._chart).secondHorizontalAxisRenderer);					
				}

				// set the horizontal axis data for the bar series
				colSeries.horizontalAxis = hAxis;

				//add the value into the vertical axis array
				_displayAxisArray[chartDataAxis.field] = hAxis;

				if(!chartDataAxis.autoCalculateTickSizeInterval){
					// set the custom interval
					hAxis.interval = chartDataAxis.tickSizeInterval;
				}
			}
		}
	}	
}

