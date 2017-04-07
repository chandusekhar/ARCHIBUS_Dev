var roomsUtilizationByBlRmController = View.createController('roomsUtilizationByBlRmController', {
    
	blFlId: '',

	afterViewLoad: function() {
		this.blFlId = getURLParams();
		this.showFlChart();
	},

	showFlChart: function(){
		var restriction = new Ab.view.Restriction();
		if ( this.blFlId ) {
				restriction = " rtrim(rm.bl_id)${sql.concat}'-'${sql.concat}rtrim(rm.fl_id)='"+ this.blFlId+ "'";
		}
		this.rmUtilizationRmChart.show(true);
		this.rmUtilizationRmChart.refresh(restriction);
    }
})

