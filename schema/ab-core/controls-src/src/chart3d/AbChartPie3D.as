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
package chart3d
{
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
    
	public class AbChartPie3D extends AbChartBase3D {
		
		//internal variables
		private var _categoryAxis:AbGroupingAxis = null;
		private var _dataAxisSeries:Array = null;
		
		public function AbChartPie3D(chartConfigObj:String) {
			super(chartConfigObj);
			
			this._chart = new PieChart3D();
			
			// set appropriate default values of control properties
			this._chart["depth"] = 10;
			
			// allow the application to set custom chart properties
			afterCreateControl();
		}
		
		override public function setCustomDataTip(item:HitData):String {
            var pieSeriesItem:PieSeries3DItem = item.chartItem as PieSeries3DItem;
            
            // Get a reference to the current series.        
	        var currentSeries:PieSeries3D = PieSeries3D(item.element);
			            
            return "<b>" + pieSeriesItem.item[currentSeries.nameField] + ": " +  pieSeriesItem.percentValue.toFixed(1) + "%</b><br />" +
                   "(<i>" + formatNumber(Number(pieSeriesItem.value)) + "</i>)";
        }

		/**
		 * This function will format the chart items's y value accroding to the passed
		 * deciaml separator, grouping seperator, number of decimal points
		 * This function is to display the localized numbers in chart
		 */
		private function setCustomLabel(item:Object, field:String, index:Number, percentValue:Number):String {
            for(var fieldName:String in item){
	           	if(fieldName == field){
    		        return formatNumber(Number(item[field]));
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
			var pieSeries:PieSeries3D = this._dataAxisSeries[0];
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
				
			var pieSeries:PieSeries3D = new PieSeries3D();
				
	        pieSeries.nameField = getNameField(_chartProps.groupingAxis);
			pieSeries.field = _chartDataAxis.field;
			pieSeries.displayName = _chartDataAxis.title;
			pieSeries.dataProvider = new ArrayCollection(data);
			
			//set the label according to the current locale number format
			pieSeries.labelFunction = setCustomLabel;
				
			//property "labelPosition" allows "callout", "inside", "outside", "insideWithCallout" or "none" values for Column charts
			// this value is validated inside the ab-chart.js file
			pieSeries.setStyle("labelPosition", _chartDataAxis.labelPosition);
			
			pieSeries.setStyle("calloutGap", _chartDataAxis.calloutGap);
			pieSeries.setStyle("insideLabelSizeLimit", _chartDataAxis.insideLabelSizeLimit);
		
			this._dataAxisSeries.push(pieSeries);
			
			this._chart.series = this._dataAxisSeries;
		}
		
        private function getNameField(groupingAxis:Object):String {
            var nameField:String = "";
            	
			if(groupingAxis.hasOwnProperty("field")){
				if(groupingAxis.hasOwnProperty("table")) { 
					nameField = groupingAxis.table + "." + groupingAxis.field;
				} else {
					nameField = groupingAxis.field;
				}
			}
			
			return nameField;
		}
	}	
}
