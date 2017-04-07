package chart
{
    import mx.core.*;
    import mx.charts.*;
    import mx.charts.chartClasses.*;
    import mx.charts.series.*;
    import mx.charts.series.items.*;
    import mx.collections.ArrayCollection;
    import mx.graphics.*;
    import mx.formatters.NumberFormatter;
    import com.adobe.serialization.json.JSON;
    import flash.display.*;
    import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    import flash.utils.*;
        
    /**
     * Base class for cartesian charts: area, bar, column, line, and plot.
     */ 
    public class AbCartesianChart extends AbChartBase
    {
        protected var _categoryAxis:AbGroupingAxis = null;
        protected var _dataAxisSeries:Array = null;
        protected var _canvas:CartesianDataCanvas = null; 
        
        public function AbCartesianChart(chartConfigObj:String) {
            super(chartConfigObj);
        }
        
        /**
         * Called after the specific underlying control (Flex chart or iLog control) has been created.
         * Cannot be called from the base class constructor because controls are created in subclasses.
         * Calls JS function defined in the host JS control. 
         */
        override protected function afterCreateControl():void {
            // create a canvas to draw on, and attach it to the chart
            createCanvas();
            
            if (ExternalInterface.available) {
                ExternalInterface.call("afterCreateControl_JS", Application.application.parameters.panelId);
            }
        }

        /**
         * Register the callback function so the javascript can call the corresponding AS functions.
         */
        override protected function addCallBackFunctions():void {
            super.addCallBackFunctions();            
            ExternalInterface.addCallback("addLine", addLine);
            ExternalInterface.addCallback("addTargetLine", addTargetLine);
        }
        
        // ------------------- drawing support ----------------------------------------------------
        
        /**
         * Creates the canvas for drawing and attaches it to the foreground of the chart.
         */ 
        private function createCanvas():void {
            _canvas = new CartesianDataCanvas();
            _chart.annotationElements[0] = _canvas;
        }
        
        /**
         * Draws a line from point 1 to point 2 on the chart canvas, and add its title to the chart legend.
         */  
        public function addLine(x1:String, y1:Number, x2:String, y2:Number, color:uint, title:String):void {
            // draw the line on the chart canvas
            _canvas.lineStyle(3, color, .75, true, LineScaleMode.NORMAL, CapsStyle.ROUND, JointStyle.MITER, 2);
            _canvas.moveTo(x1, y1);
            _canvas.lineTo(x2, y2);
            
            // add the color/title marker to the chart legend
            addLegendMarker(color, title);
        }

        /**
         * Draws a horizontal line on the chart canvas, and add its title to the chart legend.
         */  
        public function addTargetLine(y:Number, color:uint, title:String):void {
            // get the data field name             
            var fieldName:String = this._categoryAxis.categoryField;
            
            // get the first and the last data item
            var dataProvider:ArrayCollection = ArrayCollection(this._categoryAxis.dataProvider);
            var firstItem:Object = dataProvider.getItemAt(0);
            var lastItem:Object = dataProvider.getItemAt(dataProvider.length - 1);

            // draw horizontal line on the chart canvas, from the first to the last item
            _canvas.lineStyle(3, color, .75, true, LineScaleMode.NORMAL, CapsStyle.ROUND, JointStyle.MITER, 2);
            _canvas.moveTo(firstItem[fieldName], y);
            _canvas.lineTo(lastItem[fieldName], y);
            
            // add the color/title marker to the chart legend
            addLegendMarker(color, title);
        }
        
        /**
         * Add the color/title marker to the chart legend. 
         */
        protected function addLegendMarker(color:uint, title:String):void {
        }
        
        

    }
}
