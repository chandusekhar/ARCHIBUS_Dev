var roomsUtilizationController = View.createController('roomsUtilizationController', {

	rmFilterConsole_onSearch: function(){
		var dvId = this.rmFilterConsole.getFieldValue('rm.dv_id');
		var dpId = this.rmFilterConsole.getFieldValue('rm.dp_id');
		var isIncludeNullDp =  $('includeNullDp').checked;
		var hotelableOnly =  $('hotelableOnly').checked;

		var restriction = new Ab.view.Restriction();
		if(dvId){
			restriction.addClause('rm.dv_id', dvId, '=');
		}
		if(dpId){
			restriction.addClause('rm.dp_id', dpId, '=');
		}
		if(!isIncludeNullDp){
			restriction.addClause('rm.dp_id', null, '<>');
		}
		if(hotelableOnly){
			restriction.addClause('rm.hotelable', 1, '=');
		}
		this.rmUtilizationChartGrid.show(true);
		this.rmUtilizationChartGrid.refresh(restriction);
    },

    rmFilterConsole_onClear: function(){
		this.rmFilterConsole.clear();
		$('includeNullDp').checked=false;
		$('hotelableOnly').checked=false;
		this.rmUtilizationChartGrid.show(false);
    }
})
