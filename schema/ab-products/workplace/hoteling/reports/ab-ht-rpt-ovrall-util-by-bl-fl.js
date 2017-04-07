var roomsUtilizationByBlController = View.createController('roomsUtilizationByBlController', {
    
	blId: '',

	afterViewLoad: function() {
		this.blId  = getURLParams();
		this.showFlChart();
	},

	showFlChart: function(){
		var restriction = new Ab.view.Restriction();
		if ( this.blId ) {
				restriction.addClause('rm.bl_id', this.blId, '=');
		}
		this.rmUtilizationFlChart.show(true);
		this.rmUtilizationFlChart.refresh(restriction);
    }
})

function onFlBarChartClick(obj){
    var blFlId = obj.selectedChartData['rm.bl_fl'];
	if(blFlId){
		var url = 'ab-ht-rpt-ovrall-util-by-bl-rm.axvw?blFlId=' + blFlId;
		window.open(url);
	}
}

