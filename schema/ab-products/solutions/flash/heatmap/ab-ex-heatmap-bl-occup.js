View.createController('showHeatMap', {

	afterViewLoad: function(){
		var colorEntries = [];
		
		colorEntries.push({color:'0xFFFF00',limit:0,alpha:0.1});
		colorEntries.push({color:'0xFF7700',limit:1000,alpha:0.5});
		colorEntries.push({color:'0xFF0000',limit:2000,alpha:0.9});
		
        var mapControl = new Ab.flash.HeatMap(
        	'heatmap',//controlId
        	'world', //mapType
        	'dsHeatMapBlOccup', //dataSourceId
        	'bl.bl_id', //primaryKeyField
        	'bl.lat', //latField
        	'bl.lon', //lonField
        	'bl.count_occup', //colorValueField
        	'bl.cost_sqft', //sizeValueField
        	'bl.bl_id;bl.count_occup;bl.cost_sqft',//labelField
        	true,	//showLegend
         	false,	//showPins
         	colorEntries								
        );
        this.panelHtml.setContentPanel(Ext.get('heatmap'));
    }
});