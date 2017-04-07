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
		this.rmUtilizationByDpChartGrid.show(true);
		this.rmUtilizationByDpChartGrid.refresh(restriction);
    },

    rmFilterConsole_onClear: function(){
		this.rmFilterConsole.clear();
		$('includeNullDp').checked=false;
		this.rmUtilizationByDpChartGrid.show(false);
    }
})


function onBarChartClick(obj){
	var restriction = new Ab.view.Restriction();
    var dvAndDp = obj.selectedChartData['rm.dv_dp'];
    var detailPanel = View.panels.get('rmGrid');
    if (dvAndDp == 'N/A') {
        detailPanel.addParameter('dvAndDp', " IS NULL");
    }
    else {
        detailPanel.addParameter('dvAndDp', "= '" + dvAndDp + "'");
    }
	var hotelableOnly =  $('hotelableOnly').checked;
	if(hotelableOnly){
        detailPanel.addParameter('hotelable', "=1");
	}
	else{
        detailPanel.addParameter('hotelable', ">=0");
	}
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 600,
        height: 400
    });
}

