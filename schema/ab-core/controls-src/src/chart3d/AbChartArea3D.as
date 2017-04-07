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
package chart3d
{
	import flash.display.*;
	
    import flash.display.*;
    import flash.events.MouseEvent;
    import flash.utils.*;

    import mx.charts.*;
    import mx.collections.ArrayCollection;
    import mx.core.*;
        
    import com.adobe.serialization.json.JSON;
        
    import ilog.charts3d.*;
    import ilog.charts3d.series.*;
    import ilog.charts3d.series.items.*;

    import chart.*;
    
	public class AbChartArea3D extends AbChartBase3D {
		
		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;
		
		public function AbChartArea3D(chartConfigObj:String) {
			super(chartConfigObj);
			
			this._chart = new AreaChart3D();
            
            // set appropriate default values of control properties
            
            // allow the application to set custom chart properties
            afterCreateControl();
		}
		
		private function getYNumberForCurrentItem(areaSet:AreaSet3D, currentSeries:AreaSeries3D, areaSeriesItem:AreaSeries3DItem):Number{

			// find the index for the cuurent hitData's series
			var index:int = areaSet.series.indexOf(currentSeries);
			
			if(index>0){
				// the y-number is the stacked value of the item, we need to substract it from the previous series's
				// hitData's y-value
				var areaSeriesPrev:AreaSeries3D = areaSet.series[index-1];
				
				//loop through prev series, find the y-number
				for(var indexPrev:int=0; indexPrev<areaSeriesPrev.items.length; indexPrev++){
					var areaSeriesItemPrev:AreaSeries3DItem = areaSeriesPrev.items[indexPrev] as AreaSeries3DItem;
						    
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
                var areaSeriesItem:AreaSeries3DItem = item.chartItem as AreaSeries3DItem;
                
	            // Get a reference to the current series.        
		        var currentSeries:AreaSeries3D = AreaSeries3D(item.element);
				this.setNumberDecimals(currentSeries.yField);
				this.setCurrencySymbol(currentSeries.yField);

				return "<b>" + currentSeries.displayName + "</b><br />" +
                        areaSeriesItem.xValue + " <br/>" +
                        formatNumber(areaSeriesItem.yNumber);
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
			
			this._chart.dataTipFunction = setCustomDataTip;
			
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
			AreaChart3D(this._chart).horizontalAxis = _categoryAxis;
			
			//assign the render to horizontalAxis to control the show axis label
			var hAxisRenderer:AxisRenderer3D = getAxisRenderer3D(_chartProps.groupingAxis.showLabel, "bottom", true);
            hAxisRenderer.setStyle("labelRotation", _chartProps.groupingAxis.labelRotation);
			AreaChart3D(this._chart).horizontalAxisRenderer = hAxisRenderer;
			 
			// define data axis series array
			this._dataAxisSeries = [];
			this._chart.series = [];
			if(this._hasSecondaryGrouping){
				add2DAreaSeries(_chartProps.data);
			} else {
				add1DAreaSeries(_chartProps.data);
			}

			this._chart.series = this._dataAxisSeries;
		
			// if none of the axis has "displayAxis=true", then set vertical axis
			if(!checkIfRequiredDefaultVerticalAxisRenderer()){
				//assign the render to verticalAxis to control the show axis label
				var vAxisRenderer:AxisRenderer3D = getAxisRenderer3D(_chartProps.dataAxis[0].showLabel, "left", false);
				AreaChart3D(this._chart).verticalAxisRenderer = vAxisRenderer;
				vAxisRenderer.setStyle("labelRotation", _chartProps.dataAxis[0].labelRotation);
							
				if(!_chartProps.dataAxis[0].autoCalculateTickSizeInterval){
					// define a new vertical axis data
					var vAxis:LinearAxis = new LinearAxis();
					AreaChart3D(this._chart).verticalAxis = vAxis;
					
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
			
			this._chart.series = this._dataAxisSeries;
   			
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
				var areaSeries:AreaSeries3D = new AreaSeries3D();
				
				// add vertical axis		
				if(chartDataAxis.displayAxis){
					addAreaVerticalAxis(areaSeries, chartDataAxis);
				}

	        	areaSeries.xField= _categoryAxis.categoryField;
			    areaSeries.yField = chartDataAxis.field;
			    areaSeries.displayName = title;
				areaSeries.dataProvider = new ArrayCollection(data);
				
				// property "labelPosition" only works for Bar, Column and Pie charts	
				//areaSeries.setStyle("labelPosition", ...);
				  		
				_dataAxisSeries.push(areaSeries);	
		}    	
        
		//XXX: create 2D area series
		private function add2DAreaSeries(chartData:Array):void{
						
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
		
		private function addAreaVerticalAxis(colSeries:AreaSeries3D, chartDataAxis:AbDataAxis):void{
			// if the vertical axis has not been rendered
			if(!checkIfExisting(_displayAxisArray, chartDataAxis.field)){
				// define a new vertical axis data
				var vAxis:LinearAxis = new LinearAxis();
				vAxis.title = chartDataAxis.title;						

				// add the vertical axis renderer if it is not been added yet.				
				AreaChart3D(this._chart).verticalAxisRenderer = getVAxisRenderer3D(chartDataAxis.showLabel, vAxis, false );						
	
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