/***********************************************************************
 * AbAxisTitleRenderer
 * Avoid Flex Core Excepion when parent object is null.
 * It seems a timing issue caused when panel has no enough space for charts or when charts are refreshed.
 */
package chart
{
    import mx.charts.chartClasses.ChartLabel;
	import mx.core.IDataRenderer; 
    public class AbAxisTitleRenderer  extends ChartLabel implements IDataRenderer 
    {
        override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void
		{
			//flex core doesn't check if parent == null
			if (parent == null){
				return;
			}
			super.updateDisplayList(unscaledWidth, unscaledHeight);
		}
	} 
}