/***********************************************************************
 * Ab.chart.AbChartEvent ActionScript file
 * 
 * This file defines the default and custom events functions for All Chart class.
 * It is included in chart's actionscript file.
 * 
 * Supported Default Events are:
 * 		 * zoomIntoSeries
 * 
 * Supported Custom Events are:
 * 		 * onClickChart 
 * 		 * onClickSeries
 * 		 * onClickItem
 * 
 * Author: Ying Qin
 * Date:   April, 2008
 */

import com.adobe.serialization.json.JSON;
import flash.external.ExternalInterface;
import mx.charts.chartClasses.Series;
import mx.charts.events.ChartEvent;
import mx.charts.events.ChartItemEvent;


/**
 * function zoomIntoSeries
 * This functions defines the default event when user click on Chart data item
 * or the data series.
 * If there are multiple data series, when user clicks mouse once, 
 * the chart will zoom into the current series that user clicks
 * when click again, it will go back to the original set of chart sereis.
 * If there is only one data series, nothing happens.
 */    
 
// level - the data series level (1 means original series, 2 means the subseries.       
private var level:Number = 1;
private var newSeries:Array = null;
public function zoomIntoSeries(e:MouseEvent):void {
	//XXX: disabled
	/*
    newSeries = new Array();
    try{
    	// only zoom in if user click on chart item.
    	if(typeof(e.target.items) != "undefined" ) {
	    	if (level == 1 ) {
		    	// set the current data series that user clicked on
		    	newSeries.push(e.target);   
		    	level = 2; 
		    } else {
		    	// if user clicks on area outside of data item
		    	// go back to the original data series
		        newSeries = _dataAxisSeries;
		        level = 1;
		    }           
		    // set data series
    		this.series = newSeries;
    	}
    } catch(error:Error) {
    	// go back to the original data series
	    newSeries = _dataAxisSeries;
	    level = 1;

   	    // set data series
    	this.series = newSeries;
	}     */     
} 
	    		
/** 
 * This function defines the custom event when user click on points of the chart 
 * but outside of chart data items. It will call "onClickChart" javascript function 
 * where the custom javascritp event behaviors are defined.
 */
public function onClickChart(e:ChartEvent):void {
	try {
		if (ExternalInterface.available) {
	    	var wrapperFunction:String = "onClickChart_JS";
	    	var panelId:String = Application.application.parameters.panelId;
     		
	        ExternalInterface.call(wrapperFunction, panelId);
	  	} 
	} catch(error:Error) {
   		// ??? display the error
	}
}
     	
/** 
 * This function defines the custom event when user click on data series of the chart 
 * It will call the corresponding "onClickSeries" javascript function 
 * where the custom javascript event behaviors are defined.
 */
 public function onClickSeries(e:ChartItemEvent):void {
	try {
		if (ExternalInterface.available) {
			var wrapperFunction:String = "onClickSeries_JS";
		    var panelId:String = Application.application.parameters.panelId;
			
			ExternalInterface.call(wrapperFunction, panelId,  e.hitSet);
		}	
	} catch(error:Error) {
  		// ??? display the error
   	}
}
 
/** 
 * This function defines the custom event when user click on data items of the chart 
 * It will call the corresponding "onClickItem" javascript function 
 * where the custom javascript event behaviors are defined.
 */  	
public function onClickItem(e:ChartItemEvent):void {   	
   	try{
	  	if (ExternalInterface.available) {
	    	var wrapperFunction:String = "onClickItem_JS";
	    	var dataItem:String = JSON.encode(e.hitData.item);
	    	var panelId:String = Application.application.parameters.panelId;
	    	var dataSeries:Series = Series(e.hitData.element);
	    	var dataSeriesDisplayName:String = dataSeries.displayName;
	    	ExternalInterface.call(wrapperFunction, panelId, dataItem, dataSeriesDisplayName);
	  	} 
   	} catch(error:Error) {
   	  		// ??? display the error
   	}
}
