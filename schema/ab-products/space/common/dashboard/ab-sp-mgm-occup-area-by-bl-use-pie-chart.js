var areaByBlUsecController = View.createController('areaByBlUsecController', {

	customFillColors : ['0x2979ad','0x6b3c9c','0x399e31','0x9cc7d6','0xadd384','0xff7d00','0xff9a9c','0xf7ba6b','0xc6aece','0xf7dd6b'],
	
	locMetricDashCtrl:null,
	
	afterInitialDataFetch: function(){
		initialDashCtrl(this);
		this.areaByBlUsePie.setSolidFillColors( this.customFillColors);
	},

	refreshChart:function(){
		var treeCtrl = this.locMetricDashCtrl.treeCtrl;
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;

		var blIdRes =  treeCtrl.treeRes+" AND "+consoleCtrl.blIdRes+" AND "+consoleCtrl.siteIdRes;
		this.areaByBlUsePie.addParameter('blId', blIdRes);

		this.areaByBlUsePie.show(true);
		this.areaByBlUsePie.refresh();
	},

	areaByBlUsePie_afterRefresh : function() {
		this.locMetricDashCtrl.pieRawData = this.areaByBlUsePie.data;			
	}
})