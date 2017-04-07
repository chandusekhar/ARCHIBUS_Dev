package chart3d
{
	import chart.*;
	
	import flash.events.MouseEvent;
	
	import ilog.charts3d.*;
	import ilog.charts3d.charts3dClasses.CartesianChart3D;
	
	import mx.charts.LinearAxis;
	import mx.core.Application;
	import mx.formatters.NumberFormatter;
	
	public class AbChartBase3D extends AbChartBase
	{
	    private var nf:NumberFormatter = new NumberFormatter();
	    
	    /**
	     * Constructor.
	     */
		public function AbChartBase3D(chartConfigObj:String) {
		    super(chartConfigObj);
		}
		
        /**
         * Called after the specific underlying control (Flex chart or iLog control) has been created.
         */
        override protected function afterCreateControl():void {
            super.afterCreateControl();
            
            if (_chart is CartesianChart3D) {
                _chart.addEventListener(MouseEvent.MOUSE_DOWN, downListener);
                _chart.addEventListener(MouseEvent.MOUSE_WHEEL, wheelListener);
            }        
        }
        
        /**
         * Support for mouse-driven rotation (click and drag) and zooming (wheel), for column and line charts.
         * Adapted from Tour de Flex (http://www.adobe.com/devnet/flex/tourdeflex/web/#sampleId=14100).
         * 
         * TODO: zoom works in Tour de Flex, but does not work in our charts.
         */
		
        private var downX:int;
        private var downY:int;
        private var downElevation:Number;
        private var downRotation:Number;
                
        private function downListener(e:MouseEvent):void {
            _chart.removeEventListener(MouseEvent.MOUSE_DOWN, downListener);          
            Application.application.addEventListener(MouseEvent.MOUSE_UP, upListener);
            Application.application.addEventListener(MouseEvent.ROLL_OUT, rollOutListener);
            _chart.addEventListener(MouseEvent.MOUSE_MOVE, moveListener);
            downX = e.stageX;
            downY = e.stageY;
            downElevation = CartesianChart3D(_chart).elevationAngle;
            downRotation = CartesianChart3D(_chart).rotationAngle;
        }
        		
        private function rollOverListener(e:MouseEvent):void {
            Application.application.removeEventListener(MouseEvent.ROLL_OVER, rollOverListener);
            if (! e.buttonDown) {
                upListener(e);
            }
        } 
               
        private function rollOutListener(e:MouseEvent):void {
            Application.application.removeEventListener(MouseEvent.ROLL_OUT, rollOutListener);
            Application.application.addEventListener(MouseEvent.ROLL_OVER, rollOverListener);
        }
          
        private function moveListener(e:MouseEvent):void {
            var dx:Number = e.stageX - downX;
            var dy:Number = e.stageY - downY;
            CartesianChart3D(_chart).elevationAngle = downElevation + dy/5;
            CartesianChart3D(_chart).rotationAngle = downRotation - dx/5;
        }
      
        private function wheelListener(e:MouseEvent):void {
            if (e.delta < 0) {
                CartesianChart3D(_chart).zoom += 0.15;
            } else {
                CartesianChart3D(_chart).zoom -= 0.15;
            }
        }
          
        private function upListener(e:MouseEvent):void {
            _chart.addEventListener(MouseEvent.MOUSE_DOWN, downListener);          
            Application.application.removeEventListener(MouseEvent.MOUSE_UP, upListener);
            _chart.removeEventListener(MouseEvent.MOUSE_MOVE, moveListener);          
        }
        
        /**
         * Helper methods. 
         */
        protected function checkIfRequiredDefaultVerticalAxisRenderer():Boolean{
			var length:int = getDisplayAxisArrayLength();
			
			return _chartProps.dataAxis.length == length;
		}
		  
		protected function getAxisRenderer3D(showLabel:Boolean, placement:String, isCategory:Boolean):AxisRenderer3D
		{
			var axisRenderer:AxisRenderer3D = new AxisRenderer3D();
			axisRenderer.setStyle("showLabels", showLabel);
			if(!isCategory){
				axisRenderer.labelFunction = axisLabelFunction;				
			}
			//axisRenderer.placement = placement;
						
			return axisRenderer;
		}

		protected function getHAxisRenderer3D(showLabel:Boolean, hAxis:LinearAxis, isCategory:Boolean):AxisRenderer3D
		{
			// add the vertical axis renderer if it is not been added yet.				
			var placement:String = "bottom";
			if(getDisplayAxisArrayLength()% 2 != 0){
				placement="top";
			}
			
			var axisRenderer:AxisRenderer3D = getAxisRenderer3D(showLabel, placement, isCategory);
			//axisRenderer.highlightElements = true;
			axisRenderer.axis = hAxis;
			
			return axisRenderer;
		}

		protected function getVAxisRenderer3D(showLabel:Boolean, vAxis:LinearAxis, isCategory:Boolean):AxisRenderer3D
		{
			// add the vertical axis renderer if it is not been added yet.				
			var placement:String = "left";
			if(getDisplayAxisArrayLength()% 2 != 0){
				placement="right";
			}
			
			var axisRenderer:AxisRenderer3D = getAxisRenderer3D(showLabel, placement, isCategory);
			//axisRenderer.highlightElements = true;
			axisRenderer.axis = vAxis;
			
			return axisRenderer;
		}
		
	}
}