package chart
{
    import flash.display.Graphics;
    
    import mx.charts.chartClasses.LegendData;
    import mx.core.IDataRenderer;
    import mx.graphics.Stroke;
    import mx.skins.ProgrammaticSkin;

    public class AbChartLegendLineItemRenderer extends ProgrammaticSkin implements IDataRenderer
    {
        private var _chartItem:LegendData;
        private var _color:uint;
        
        public function AbChartLegendLineItemRenderer(color:uint) {
            super();
            _color = color;
        }
        
        public function get data():Object {
            return _chartItem;
        }
    
        public function set data(value:Object):void {
            _chartItem = value as LegendData;
        }
         
        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void{
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            
            var g:Graphics = graphics;
            g.clear();
            g.beginFill(_color, 1);
            g.drawRect(0, unscaledHeight / 2 - 2, unscaledWidth, 4);
            g.endFill();
        }
        
    }
}