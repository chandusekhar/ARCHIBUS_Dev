/***********************************************************************
 * Ab.chart.AbChartArea
 *
 * This class defines properties and methods of AbChartArea. It inherits from
 * Flex charting's mx.charts.AreaChart class. Using the parameters from archibus
 * view files passed through javascript, user can dynamically build a Area Chart,
 * add the custom event and call back functions.
 *
 * This file is called by AbAreaChart.mxml to build a abareachart.swf file.
 * The swf file is used to load into the flash control from ab-chart.js depending on
 * view defintions
 *
 * Author: Ying Qin
 * Date:   June, 2008
 */
package chart
{
	import flash.display.*;

	public class AbChartArea extends AbChartBase{

		import mx.charts.AreaChart;

		import mx.charts.series.AreaSeries;
		import com.adobe.serialization.json.JSON;
		import mx.collections.ArrayCollection;
		import mx.charts.*;
		import flash.events.MouseEvent;
		import mx.core.*;
		import mx.charts.series.AreaSet;
		import flash.utils.*;
		import mx.charts.chartClasses.Series;
		import mx.charts.series.items.AreaSeriesItem;
		import mx.charts.ChartItem;
		import mx.charts.series.AreaSeries;

		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;

		public function AbChartArea(chartConfigObj:String) {
			super(chartConfigObj);

			this._chart = new AreaChart();
		}


		private function getStackedTotalForXField(areaSet:AreaSet, xValue:Object):Number{

			// find the top series
			var areaSeries:AreaSeries = areaSet.series[areaSet.series.length-1];

			//loop throught the top series's item, find the one that match the current hitdata's x-value
			for(var itemIndex:int=0; itemIndex<areaSeries.items.length; itemIndex++){
				// get the area series's item
				var areaSeriesItem:AreaSeriesItem = areaSeries.items[itemIndex] as AreaSeriesItem;

				// if the x-value matches, return the y-number, this will be the total since it is a stack chart					    
				if(areaSeriesItem.xValue == xValue){
					return areaSeriesItem.yNumber;
				}
			}
			// if nothing found
			return 0;			
		}

		private function getYNumberForCurrentItem(areaSet:AreaSet, currentSeries:AreaSeries, areaSeriesItem:AreaSeriesItem):Number{

			// find the index for the cuurent hitData's series
			var index:int = areaSet.series.indexOf(currentSeries);

			if(index>0){
				// the y-number is the stacked value of the item, we need to substract it from the previous series's
				// hitData's y-value
				var areaSeriesPrev:AreaSeries = areaSet.series[index-1];

				//loop through prev series, find the y-number
				for(var indexPrev:int=0; indexPrev<areaSeriesPrev.items.length; indexPrev++){
					var areaSeriesItemPrev:AreaSeriesItem = areaSeriesPrev.items[indexPrev] as AreaSeriesItem;

					if(areaSeriesItemPrev.xValue == areaSeriesItem.xValue){
						//substract the number
						return (areaSeriesItem.yNumber - areaSeriesItemPrev.yNumber);
					}
				}
			}

			// if no other series before this, the y-number is the value for the item
			return areaSeriesItem.yNumber;

		}

		override public function setCustomDataTip(item:HitData):String {
			var areaSeriesItem:AreaSeriesItem = item.chartItem as AreaSeriesItem;

			// Get a reference to the current series.        
			var currentSeries:AreaSeries = AreaSeries(item.element);
			this.setNumberDecimals(currentSeries.yField);
			this.setCurrencySymbol(currentSeries.yField);

			if(_chartProps.type == AbChartProps.CHARTTYPE_STACKEDAREA){
				//stacked chart has only one AreaSet
				var areaSet:AreaSet = (this._chart.series[0] as AreaSet);
				var areaTotal:Number = this.getStackedTotalForXField(areaSet,areaSeriesItem.xValue); 
				var areaNumber:Number = this.getYNumberForCurrentItem(areaSet, currentSeries, areaSeriesItem);
				var percentValue:Number = (areaNumber*100.00/areaTotal);

				var panelId:String = Application.application.parameters.panelId;

				if(this._chartProps.showAllDataTips){
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>:" +  areaSeriesItem.xValue + " <br/>" +
						"<b>" + this._categoryAxis.title + "</b>:" +  getFormattedValue(areaSeriesItem.yNumber) + " (" + percentValue.toFixed(1) + "%)<br />" +
						"<b>" + getLocalizedString(panelId, "Total") + ":</b> " + getFormattedValue(areaTotal) + " <br/>" +
						"<b>xField</b>: " + currentSeries.xField + " ( " + this.getMultilineHeadingForField(currentSeries.xField) +  " ) <br/>" +
						"<b>yField</b>: " + currentSeries.yField + " ( " + this.getMultilineHeadingForField(currentSeries.yField) +  " ) <br/>" +
						"<b>unitKey</b>: " + this._unitKey + " <br/>" +
						"<b>unitSuffix</b>: " + this._unitSuffix;

				} else {
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b><br />" +
						areaSeriesItem.xValue + " <br/>" +
						getFormattedValue(areaNumber) + " (" + percentValue.toFixed(1) + "%)<br />" +
						"<i>" + getLocalizedString(panelId, "Total") + ":</i> " + getFormattedValue(areaTotal) ;
				}
			} else {
				if(this._chartProps.showAllDataTips){
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b>:" +  areaSeriesItem.xValue + " <br/>" +
						"<b>" + this._categoryAxis.title + "</b>:" +  getFormattedValue(areaSeriesItem.yNumber) + " <br/>" +
						"<b>xField</b>: " + currentSeries.xField + " ( " + this.getMultilineHeadingForField(currentSeries.xField) +  " ) <br/>" +
						"<b>yField</b>: " + currentSeries.yField + " ( " + this.getMultilineHeadingForField(currentSeries.yField) +  " ) <br/>" +
						"<b>unitKey</b>: " + this._unitKey + " <br/>" +
						"<b>unitSuffix</b>: " + this._unitSuffix;

				} else {
					return "<b>" + this.getDataDisplayTitle(currentSeries) + "</b><br />" +
						areaSeriesItem.xValue + " <br/>" +
						getFormattedValue(areaSeriesItem.yNumber);
				}
			}
		}

		private function getDataDisplayTitle(currentSeries:AreaSeries):String{
			var dataDisplayTitle:String = currentSeries.displayName;
			if(!dataDisplayTitle || dataDisplayTitle.length < 1) 
				dataDisplayTitle = this.getMultilineHeadingForField(currentSeries.yField);
			return dataDisplayTitle;
		}

		/**
		 * This function will build the area control dynamically:
		 *  1. add horizontal axis (category axis)
		 *  2. add data axis (a set of area series)
		 *  3. defines legend
		 *  4. attach the area chart and legend to the current panel dynamically
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

			// create category axis as X-axis
			_categoryAxis = new AbGroupingAxis(_chartProps, data);

			AreaChart(this._chart).horizontalAxis = _categoryAxis;

			//assign the render to horizontalAxis to control the show axis label
			var hAxisRenderer:AxisRenderer = getAxisRenderer(_chartProps.groupingAxis.showLabel, "bottom", true, _chartProps.groupingAxis.showTick, _chartProps.groupingAxis.showMinorTick);
			AreaChart(this._chart).horizontalAxisRenderer = hAxisRenderer;
			hAxisRenderer.setStyle("labelRotation", _chartProps.groupingAxis.labelRotation);

			// define data axis series array
			this._dataAxisSeries = [];
			this._chart.series = [];
			if(this._hasSecondaryGrouping){
				add2DAreaSeries(_chartProps.data);
			} else {
				add1DAreaSeries(_chartProps.data);
			}

			// stack the chart for "stackedAreaChart" type
			if(_chartProps.type == AbChartProps.CHARTTYPE_STACKEDAREA)
			{
				var areaSet:AreaSet = new AreaSet();
				areaSet.type = "stacked";
				areaSet.series = this._dataAxisSeries;
				this._chart.series = [areaSet];
			} else {
				// none stacked area chart
				this._chart.series = this._dataAxisSeries;
			}

			// if none of the axis has "displayAxis=true", then set vertical axis
			if(AreaChart(this._chart).verticalAxisRenderers.length < 1){
				// define a new vertical axis data
				var vAxis0:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);

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
				AreaChart(this._chart).verticalAxisRenderer = vAxisRenderer;
				vAxisRenderer.setStyle("labelRotation", _chartProps.dataAxis[0].labelRotation);

				if(!_chartProps.dataAxis[0].autoCalculateTickSizeInterval){
					// define a new vertical axis data
					var vAxis:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, _chartProps.dataAxis[0].title);

					AreaChart(this._chart).verticalAxis = vAxis;

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
		 * This function will refresh the area chart with a new set of data
		 * It will reset the dataProvider parameter for chart, CategoryAxis and area series.
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
			AreaChart(this._chart).verticalAxisRenderers = [];

			var arrChartData:Array = (JSON.decode(chartData) as Array);
			if(this._hasSecondaryGrouping){
				//XXX: 2D - regenerate area series based on data
				var categData:Array = arrChartData[0]["data"]as Array;
				this._categoryAxis.dataProvider = new ArrayCollection(categData);
				add2DAreaSeries(arrChartData);
			}else{	
				//XXX: 1D - resue area series				
				//reset the data for the category axis
				this._categoryAxis.dataProvider = new ArrayCollection(arrChartData);

				add1DAreaSeries(arrChartData);
			}

			// stack the chart for "stackedAreaChart" type
			if(_chartProps.type == AbChartProps.CHARTTYPE_STACKEDAREA)
			{
				var areaSet:AreaSet = new AreaSet();
				areaSet.type = "stacked";
				areaSet.series = this._dataAxisSeries;
				this._chart.series = [areaSet];
			} else {
				// none stacked area chart
				this._chart.series = this._dataAxisSeries;
			}

			loadComplete();	

		}

		private function add1DAreaSeries(data: Array):void{

			// loop through each data axis and create a area series 
			for(var index:int=0; index<_chartProps.dataAxis.length; index++){
				// set nth data axis's properties
				var _chartDataAxis:AbDataAxis = new AbDataAxis(_chartProps.dataAxis[index], data);

				addAreaSeries(_chartDataAxis, _chartDataAxis.title, index, data);
			}

			this._chart.series = this._dataAxisSeries;
		}

		/**
		 *
		 */ 
		private function addAreaSeries(chartDataAxis:AbDataAxis, title:String, index:int, data: Array):void {

			// create a new area series and set its properties
			var areaSeries:AreaSeries = new AreaSeries();

			// add vertical axis		
			// do not add if this is the first dataAxis since the vertical axis will always be added for the first dataAxis		
			if(chartDataAxis.displayAxis && this._chartProps.dataAxis.length > 1){
				addAreaVerticalAxis(areaSeries, chartDataAxis);
			}

			areaSeries.xField= _categoryAxis.categoryField;
			areaSeries.yField = chartDataAxis.field;
			areaSeries.displayName = title;
			areaSeries.dataProvider = new ArrayCollection(data);


			//Set color for the dataAxis
			this.setFills(index, _chartProps.fillType, areaSeries);

			// property "labelPosition" only works for Bar, Column and Pie charts	
			//areaSeries.setStyle("labelPosition", ...);

			_dataAxisSeries.push(areaSeries);	
		}    	


		override protected function setFills(index:int, fillType:String, areaSeries:Series):void{

			//Set color for the dataAxis
			if(fillType == AbChartProps.FILLTYPE_SOLID){
				if(this._hasSecondaryGrouping){
					areaSeries.setStyle("areaFill", getSolidColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					areaSeries.setStyle("areaFill", getSolidColor(index));
				}
			}else if(fillType == AbChartProps.FILLTYPE_LINEARGRADIENT) {
				if(this._hasSecondaryGrouping){
					areaSeries.setStyle("areaFill", getLinearGradientColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					areaSeries.setStyle("areaFill", getLinearGradientColor(index));
				}
			} else if (fillType == AbChartProps.FILLTYPE_RADIALGRADIENT ){
				if(this._hasSecondaryGrouping){
					areaSeries.setStyle("areaFill", getLinearGradientColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					areaSeries.setStyle("areaFill", getRadialGradientColor(index));
				}
			}
		}

		//XXX: create 2D area series
		private function add2DAreaSeries(chartData:Array):void{

			//reset secondary grouping counter
			this._secondaryGroupingColorIndex = 0;

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

					addAreaSeries(_chartDataAxis, title, index, seriesData);

				}
			}
		}

		private function addAreaVerticalAxis(colSeries:AreaSeries, chartDataAxis:AbDataAxis):void{
			// if the vertical axis has not been rendered
			if(!checkIfExisting(_displayAxisArray, chartDataAxis.field)){
				// define a new vertical axis data
				var vAxis:LinearAxis = getLinearAxis(_chartProps, _chartProps.dataAxis[0].showTitle, chartDataAxis.title);

				//set the decimals for the current axis
				this.setNumberDecimals(colSeries.yField);
				this.setCurrencySymbol(colSeries.yField);

				//retrieve the unit key and suffix from data axis properties
				this._unitKey = chartDataAxis.unitKey;
				this._unitDivisor = chartDataAxis.unitDivisor;
				this._unitSuffix = chartDataAxis.unitSuffix;
				vAxis.labelFunction = super.defineVerticalAxisLabel;

				// add the vertical axis renderer if it is not been added yet.				
				AreaChart(this._chart).verticalAxisRenderers.push(getVAxisRenderer(chartDataAxis.showLabel, vAxis, false, chartDataAxis.showTick, chartDataAxis.showMinorTick ));						

				// set the vertical axis data for the area series
				colSeries.verticalAxis = vAxis;

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

