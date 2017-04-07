var abDashRplmMapEmissCtrl = View.createController('abDashRplmMapEmissCtrl', {
	afterInitialDataFetch: function(){
		this.abDashRplmMapEmiss.config.showLegendOnLoad = (this.view.type != 'dashboard');
   	}
	
});