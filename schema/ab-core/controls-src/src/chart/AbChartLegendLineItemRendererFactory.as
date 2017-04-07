package chart
{
    import mx.core.IFactory;
    
    public class AbChartLegendLineItemRendererFactory implements IFactory
    {
        private var _color:uint;
        
        public function AbChartLegendLineItemRendererFactory(color:uint):void {
            _color = color;
        }
        
        public function newInstance():* {
            return new AbChartLegendLineItemRenderer(_color);
        }
    }
}