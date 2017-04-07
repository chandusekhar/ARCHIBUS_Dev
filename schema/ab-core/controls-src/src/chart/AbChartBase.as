package chart
{
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.ui.*;
	import flash.utils.*;
	
	import mx.charts.*;
	import mx.charts.chartClasses.*;
	import mx.charts.events.*;
	import mx.charts.series.*;
	import mx.core.*;
	import mx.graphics.*;
	import mx.graphics.codec.PNGEncoder;
	import mx.managers.PopUpManager;
	
	public class AbChartBase
	{
		include "AbChartEvent.as";
	    include "AbChartCommon.as";

		protected var _chartPanel:AbChartPanel = null;
		protected var _chartProps:AbChartProps = null;
		protected var _chartLegend:AbChartLegend = null;
		protected var _legendPopupDialog:AbPopupDialog = null;
		protected var _isBuildUp:Boolean = false;
		protected var _chartConfigObj:String = null;
		protected var _chart:ChartBase = null;
		protected var _displayAxisArray:Object = null;
		protected var _decimalSeparator:String = ".";
		protected var _groupingSeparator:String = ",";
		protected var _decimals:int = 0;
		protected var _currency:String = "";
		
		protected var _unitKey:String = "1";
		protected var _unitDivisor:int = 1;
		protected var _unitSuffix:String = "";
		protected var _hasSecondaryGrouping:Boolean = false;
		protected var _secondaryGroupingColorIndex:int = 0;
				
		public function AbChartBase(chartConfigObj:String)
		{
			this._chartConfigObj = chartConfigObj;
		
			this._chart = new ChartBase();
			
			this._decimalSeparator = getDecimalSeparator();
			this._groupingSeparator = getGroupingSeparator();

			this._chartProps = new AbChartProps(this._chartConfigObj);

			// addd the call back function so that JS can call the corresponding AS functions
			addCallBackFunctions();	
			
			//default: white
			mx.core.Application.application.setStyle("backgroundColor", "0xFFFFFF");
		}

        /**
         * Called after the specific underlying control (Flex chart or iLog control) has been created.
         * Cannot be called from the base class constructor because controls are created in subclasses.
         * Calls JS function defined in the host JS control. 
         */
        protected function afterCreateControl():void {
            if (ExternalInterface.available) {
                ExternalInterface.call("afterCreateControl_JS", Application.application.parameters.panelId);
            }
        }

        /**
         * Sets control property specified by name.
         * Can be called from JS code to set properties not supported in AXVW format.
         * Should be called from the afterCreateControl event handler.
         */     
        public function setControlProperty(propertyName:String, propertyValue:Object):void {
            this._chart[propertyName] = propertyValue;
        }
        
        /**
         * Sets style property specified by name.
         * Can be called from JS code to set properties not supported in AXVW format.
         */  
        public function setStyleProperty(propertyName:String, propertyValue:Object):void { 
        	this._chart.setStyle(propertyName,propertyValue);
        }

        public function setSeriesStyleProperty(propertyName:String, propertyValue:Object):void { 
			for(var index:int = 0; index < this._chart.series.length; index++){
        		//Set color for the dataAxis
				this._chart.series[index].setStyle(propertyName, propertyValue);
        	}
        }
        
	
		// dummy function that will be replace with actual function in chart
		public function setCustomDataTip(item:HitData):String {
			return ""
		};


		//set the tool tips to be most relevant info		
		public function setCustomDefaultDataTip(item:HitData):String {
			this._chartProps.showAllDataTips = false;
			return this.setCustomDataTip(item);
		}

		//set the tool tips to be all available info		
		public function setCustomAllDataTip(item:HitData):String {

				this._chartProps.showAllDataTips = true;
				
				return this.setCustomDataTip(item);
				
		}
		
		//callback function to set the tooltip function based on the parameter
	  	public function setDataTipFunction(showAllTips:Boolean):void { 
			if(showAllTips){
				this._chart.dataTipFunction = setCustomAllDataTip;
			} else {
				this._chart.dataTipFunction = setCustomDefaultDataTip;
			}
        } 
		   
		protected function loadComplete():void{;
			try{
  				if (ExternalInterface.available) {
	    			var wrapperFunction:String = "loadComplete_JS";
	    			var panelId:String = Application.application.parameters.panelId;
     		
	        		ExternalInterface.call(wrapperFunction, panelId);
		  		} 
		 	}catch(error:Error){
		  		// ??? display the error
		  	}
		}
		
        /**
         * Register the callback function so the javascript can call the corresponding AS functions.
         */
		protected function addCallBackFunctions():void {			
			// the callback function when the data set is changed
			ExternalInterface.addCallback("refreshData", refreshData);
			ExternalInterface.addCallback("isReady", isReady);
			ExternalInterface.addCallback("getImageBytes", getImageBytes);		
            ExternalInterface.addCallback("setControlProperty", setControlProperty);
            ExternalInterface.addCallback("setStyleProperty", setStyleProperty);
            ExternalInterface.addCallback("setSeriesStyleProperty", setSeriesStyleProperty);
            ExternalInterface.addCallback("setFillColors", setFillColors);
            ExternalInterface.addCallback("setDataTipFunction", setDataTipFunction);
            
		}
		
		private function isReady():Boolean{
			return true;
		}
		
		protected function refreshData(chartData:String):void{};

        protected function defineVerticalAxisLabel(cat:Object, pcat:Object, ax:LinearAxis):String {
        	return Number(cat).toString();
        }
        
        /**
         * This method formats X or Y axis label as a proper number with thousand separators, 
         * provided that the label is actually a number. 
         */
        protected function axisLabelFunction(o:Object, v:Object):String {
            return getFormattedValue(v);
        }
        
        protected function getFormattedValue(v:Object):String {
        	var result:String = "";
            if (v is Number) {
                // value is a number - format it
                result = formatNumber(Number(v)/this._unitDivisor);
                result = addUnitKeyOrSuffix(result);
            } else {
                // value is not a number - convert to a number
                var n:Number = Number(v)/this._unitDivisor;
                if (isNaN(n)) {
                    // cannot be converted to a number - display as is
                    result = v.toString();
                } else if (Math.floor(n) == n) {
                    // integer - format with thousands
                    result = formatNumber(n);
	                result = addUnitKeyOrSuffix(result);
                } else  {
                    // floating point number (small, typically less than 10) - display as is
                    result = (n).toString();
                    result = addUnitKeyOrSuffix(result);
	            }
            }
           
            return result;
        }
        
        private function addUnitKeyOrSuffix(result:String):String{
			var newResult:String = result;
             if(this._unitSuffix.length > 0)
                	newResult += this._unitSuffix;
             else if(this._unitKey != '1')
                	newResult += this._unitKey;
			return newResult;
        }   
                     
		protected function getAxisRenderer(showLabel:Boolean, placement:String, isCategory:Boolean, showTicks:Boolean, showMinorTicks:Boolean):AxisRenderer
		{
			var axisRenderer:AxisRenderer = new AxisRenderer();
			axisRenderer.titleRenderer = new ClassFactory(AbAxisTitleRenderer);
			axisRenderer.setStyle("showLabels", showLabel);
			if(!showTicks)
				axisRenderer.setStyle("tickPlacement", "none");
			if(!showMinorTicks)
				axisRenderer.setStyle("minorTickPlacement", "none");
			
			if(!isCategory){			
            	axisRenderer.labelFunction = axisLabelFunction;  
   			}              
			axisRenderer.placement = placement;	
			return axisRenderer;
		}


		private function getImageBytes() : Array {
			var chartCtrl:DisplayObject = null;
			try{
				chartCtrl = mx.core.Application.application.getChildAt(0);
			}catch(error:Error){
				return null;

			}
			
			var width:int = chartCtrl.width;
			var height:int = chartCtrl.height;
		
			var screenshotData:BitmapData = new BitmapData(width, height);
			screenshotData.draw(chartCtrl);
		
			var pngBytes:flash.utils.ByteArray   = new PNGEncoder().encode(screenshotData);	
			
			var arr:Array = new Array();
			for(var i:Number = 0;i<pngBytes.length;i++){
				arr[i] = pngBytes[i];
			}
			
			return arr;
		}

		protected function getHAxisRenderer(showLabel:Boolean, hAxis:LinearAxis, isCategory:Boolean, showTicks:Boolean, showMinorTicks:Boolean):AxisRenderer
		{
			// add the vertical axis renderer if it is not been added yet.				
			var placement:String = "bottom";
			if(getDisplayAxisArrayLength()% 2 != 0){
				placement="top";
			}
			
			var axisRenderer:AxisRenderer = getAxisRenderer(showLabel, placement, isCategory, showTicks, showMinorTicks);
			axisRenderer.highlightElements = true;
			axisRenderer.axis = hAxis;
			
			return axisRenderer;
		}

		protected function getVAxisRenderer(showLabel:Boolean, vAxis:LinearAxis, isCategory:Boolean, showTicks:Boolean, showMinorTicks:Boolean):AxisRenderer
		{
			// add the vertical axis renderer if it is not been added yet.				
			var placement:String = "left";
			if(getDisplayAxisArrayLength()% 2 != 0){
				placement="right";
			}
			
			var axisRenderer:AxisRenderer = getAxisRenderer(showLabel, placement, isCategory, showTicks, showMinorTicks);
			axisRenderer.highlightElements = true;
			axisRenderer.axis = vAxis;
			
			return axisRenderer;
		}
		
		protected function addContextMenu():void{
			var myMenu:ContextMenu = new ContextMenu();
			myMenu.hideBuiltInItems();

			var copyright:ContextMenuItem = new ContextMenuItem("ARCHIBUS, Inc.");
			copyright.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, openArchibus);
			myMenu.customItems.push(copyright);
			
			var panelId:String = Application.application.parameters.panelId;
     		
			var displayPopupLegend:ContextMenuItem = new ContextMenuItem(getLocalizedString(panelId, "Display Legend As Popup"));
			displayPopupLegend.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, showPopupLegend);
			myMenu.customItems.push(displayPopupLegend);
			
			var displayRegularLegend:ContextMenuItem = new ContextMenuItem(getLocalizedString(panelId, "Display Legend At Bottom"));
			displayRegularLegend.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, showRegularLegend);
			myMenu.customItems.push(displayRegularLegend);
			
			var noLegend:ContextMenuItem = new ContextMenuItem(getLocalizedString(panelId, "Hide Legend"));
			noLegend.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, hideLegend);
			myMenu.customItems.push(noLegend);
			
			_chartPanel.contextMenu  = myMenu;
		}
		
		private function openArchibus(event:ContextMenuEvent):void{
			navigateToURL(new URLRequest("http://www.archibus.com"), "_blank");
		}
		
		private function showPopupLegend(event:ContextMenuEvent):void{

			addLegend2Popup();
		}
		
		private function showRegularLegend(event:ContextMenuEvent):void{
			
			addLegend2Bottom();               
		}

		private function hideLegend(event:ContextMenuEvent):void{

			//remove popup legend
			if(_legendPopupDialog != null){
				PopUpManager.removePopUp(_legendPopupDialog);
               _legendPopupDialog = null;
   			}
   			
   			// remove the bottom legend
   			if(_chartLegend!=null){
   				if(_chartPanel.contains(_chartLegend)){				
					_chartPanel.removeChild(_chartLegend);
   				}
   				_chartLegend=null;
			}
		}

		protected function addLegend2Bottom():void{
						//remove the legend pop up dialog
			if(_legendPopupDialog != null){
				PopUpManager.removePopUp(_legendPopupDialog);
               _legendPopupDialog = null;
   			}
   			
   			if(_chartLegend!=null){
   				if(_chartPanel.contains(_chartLegend)){				
					_chartPanel.removeChild(_chartLegend);
   				}
   				_chartLegend=null;
			}
			
			//create new chart legend
   			_chartLegend = new AbChartLegend(_chartProps.legendLocation, "horizontal");
	        
		    //define the legend data
		    _chartLegend.dataProvider = this._chart;
   			
   			_chartPanel.addChild(_chartLegend);
	   
		}

		protected function addLegend2Popup():void{
			//remove the legend pop up dialog
			if(_legendPopupDialog != null){
				PopUpManager.removePopUp(_legendPopupDialog);
               _legendPopupDialog = null;
   			}

   			if(_chartLegend!=null){
   				if(_chartPanel.contains(_chartLegend)){				
					_chartPanel.removeChild(_chartLegend);
   				}
   				_chartLegend=null;
			}
			
			// Create a legend.
	        _chartLegend = new AbChartLegend(_chartProps.legendLocation, "vertical");

	      	//define the legemd data
	        _chartLegend.dataProvider = this._chart;
          
			_legendPopupDialog = new AbPopupDialog(_chartProps, this._chart.screen.width, this._chart.screen.height);
			_legendPopupDialog.addLegend(_chartLegend);
				
			PopUpManager.addPopUp(_legendPopupDialog, this._chart, false);
	          
	        _legendPopupDialog.setPosition(this._chart.screen.width - _legendPopupDialog.width - 25);
	            
			_legendPopupDialog.addEventListener(Event.CLOSE, closePopUpListener);
			
			this._chart.addEventListener(Event.RESIZE, windowResizingListener);

		}
		
		private function closePopUpListener(evt:Event):void {
                PopUpManager.removePopUp(_legendPopupDialog);
                _legendPopupDialog = null;
        }

		private function windowResizingListener(e:Event):void{
			if(_legendPopupDialog != null){
				_legendPopupDialog.setPosition(this._chart.screen.width - _legendPopupDialog.width - 25);
			}
		}
		
		protected function addCustomEvents(events:Array):void{
			var bClickItem:Boolean = false;
			var bClickSeries:Boolean = false;
	
			for(var index:int=0; index < events.length; index++){
				switch(events[index]["type"]){
					case "onClickChart":
						this._chart.addEventListener(ChartEvent.CHART_CLICK, onClickChart);
						break;
					case "onClickItem":
						this._chart.addEventListener(ChartItemEvent.ITEM_CLICK, onClickItem);
						bClickItem = true;
						break;
					case "onClickSeries":
						this._chart.addEventListener(ChartItemEvent.ITEM_CLICK, onClickSeries);
						bClickSeries = true;
						break;
				}
			}			
		}
		
		protected function setFills(index:int, fillType:String, colSeries:Series):void{
         	
         	//Set color for the dataAxis
			if(fillType == AbChartProps.FILLTYPE_SOLID){
				if(this._hasSecondaryGrouping){
					colSeries.setStyle("fill", getSolidColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					colSeries.setStyle("fill", getSolidColor(index));
				}
			}else if(fillType == AbChartProps.FILLTYPE_LINEARGRADIENT) {
				if(this._hasSecondaryGrouping){
					colSeries.setStyle("fill", getLinearGradientColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					colSeries.setStyle("fill", getLinearGradientColor(index));
				}
			} else if (fillType == AbChartProps.FILLTYPE_RADIALGRADIENT ){
   				if(this._hasSecondaryGrouping){
					colSeries.setStyle("fill", getLinearGradientColor(this._secondaryGroupingColorIndex));
					this._secondaryGroupingColorIndex++;
				} else {
					colSeries.setStyle("fill", getRadialGradientColor(index));
				}
    		}
        }

        protected function setFillColors(fillType:String, fillColors:Array, fillColorsDesaturated:Array, percentGradientChange: Number, percentTransparency: Number):void{
        	this._secondaryGroupingColorIndex = 0;
        	
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
       		
        	for(var index:int = 0; index < this._chart.series.length; index++){
        		//Set color for the dataAxis
				this.setFills(index, fillType, this._chart.series[index]); 
        	}
        };

		protected function getSolidColor(index:int):SolidColor{
			var colFill:SolidColor = new SolidColor();
			var colorIndex:int = index%(this._chartProps.fillColor.length);

			//always use the default chart color defined in ab-chart.js
			colFill.color = uint(this._chartProps.fillColor[colorIndex]);
			colFill.alpha = this._chartProps.percentTransparency;
			
			return colFill;
		}
		
		protected function getLinearGradientColor(index:int):LinearGradient{
			
			var colorIndex:int = index%(this._chartProps.fillColor.length);
			var colorIndexDesatured:int = index%(this._chartProps.fillColorDesaturated.length);
			
			var g1:GradientEntry = new GradientEntry(this._chartProps.fillColor[colorIndex],0,_chartProps.percentTransparency);
			var g2:GradientEntry = new GradientEntry(this._chartProps.fillColorDesaturated[colorIndexDesatured],_chartProps.percentGradientChange,_chartProps.percentTransparency);
								
			var linearGradientFill:LinearGradient = new LinearGradient();    
			linearGradientFill.entries = [g1,g2];
	
			return 	linearGradientFill;
		}

		protected function getRadialGradientColor(index:int):RadialGradient{

			var colorIndex:int = index%(this._chartProps.fillColor.length);
			var colorIndexDesatured:int = index%(this._chartProps.fillColorDesaturated.length);
			
			var g1:GradientEntry = new GradientEntry(this._chartProps.fillColor[colorIndex],0,_chartProps.percentTransparency);
			var g2:GradientEntry = new GradientEntry(this._chartProps.fillColorDesaturated[colorIndexDesatured],_chartProps.percentGradientChange,_chartProps.percentTransparency);
	
			var radialGradientFill:RadialGradient = new RadialGradient();    
			radialGradientFill.entries = [g1,g2];
			
			return radialGradientFill;
		}	
		
		protected function checkIfExisting(hashMap:Object, id:String):Boolean{
			var result:Boolean = false;
			for (var key:Object in hashMap){
				if(key.toString()==id){
					result = true; break;
				} 
			}
			return result;
		}
		
		protected function getDisplayAxisArrayLength():int{
			var length:int = 0;
			for (var key:Object in _displayAxisArray){
				length++;
			}
			return length;
		}
		
		 /**
		 * This function is used to display the localized numbers in chart
		 */
		protected function formatNumber(yNumber:Number, withCurrencySign:Boolean = true):String{
			//if decimalSeparator not provided, use the default US ones
			if(this._decimalSeparator == null) this._decimalSeparator = ".";
			if(this._groupingSeparator == null) this._groupingSeparator = ",";
			
			var formatter:AbNumberFormatter = new AbNumberFormatter(this._decimalSeparator, this._groupingSeparator, this._decimals);
			if(withCurrencySign && this._currency!=null){
				return this._currency + formatter.fomat(yNumber);
			} else {
				return formatter.fomat(yNumber);
			}
		}
		
		public function getLocalizedString(panelId:String, key:String):String {

			try{
		  		if (ExternalInterface.available) {
			      var wrapperFunction:String = "getLocalizedString_JS";
			      return ExternalInterface.call(wrapperFunction, panelId, key);
			    } 
		  	} catch(error:Error){
		  		// ??? display the error
		  	}
		  	
		  	return key;
		}
		
		protected function setNumberDecimals(fieldId:String):void{
			
			for(var index:int = 0; index < this._chartProps.fieldDefs.length; index++){
				var strIndex:String = index.toString();
				if(_chartProps.fieldDefs[index].hasOwnProperty("id") &&  _chartProps.fieldDefs[index].id == fieldId){
					this._decimals = _chartProps.fieldDefs[index].decimals;
				}
			}
		}

		protected function setCurrencySymbol(fieldId:String):void{
			
			for(var index:int = 0; index < this._chartProps.fieldDefs.length; index++){
				var strIndex:String = index.toString();
				if(_chartProps.fieldDefs[index].hasOwnProperty("id") &&  _chartProps.fieldDefs[index].id == fieldId){
					this._currency = _chartProps.fieldDefs[index].currencySymbol;
				}
			}
		}
		
		protected function getMultilineHeadingForField(fieldId:String):String{
			for(var index:int = 0; index < this._chartProps.fieldDefs.length; index++){
				var strIndex:String = index.toString();
				if(_chartProps.fieldDefs[index].hasOwnProperty("id") &&  _chartProps.fieldDefs[index].id == fieldId){
					return _chartProps.fieldDefs[index].title;
				}
			}
			return fieldId;
		}
		
		/**
		 * Get Linear Axis with/without title.
		 */
		public function getLinearAxis(chartProperties:AbChartProps, showTitle:Boolean, title:String):LinearAxis{
			var linearAxis:LinearAxis = new LinearAxis();

			if(showTitle){				
				linearAxis.title = (chartProperties.dataAxisTitle != null && chartProperties.dataAxisTitle.length > 0) ? chartProperties.dataAxisTitle : title;
			}else{
				linearAxis.title = "";
			}
			return linearAxis;
		}
	}
	
}