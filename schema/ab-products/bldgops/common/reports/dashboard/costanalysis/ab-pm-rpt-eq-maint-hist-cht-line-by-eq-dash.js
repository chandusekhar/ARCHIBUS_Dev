var eqHisLineByeqController = View.createController('eqHisLineByeqController', {
    afterViewLoad: function() {
		var openerC = View.getOpenerView().controllers.get("eqHisLineController");

		var panel=this.abPmRptEqMaintHistChlineByMonthByEqChart;
		var restriction=openerC.res;

		if( openerC.selectedEqstd){
			restriction =  restriction + " AND eq.eq_std='" + openerC.selectedEqstd+"' ";;
		}

		panel.addParameter('parentRestriction', restriction);
		var yearDS = View.dataSources.get('abPmRptEqMaintHistChlineGroupingAxisDS');
		yearDS.addParameter('dateStart', openerC.dateStart);
		yearDS.addParameter('dateStart', openerC.dateEnd);
		panel.refresh();
		panel.show(true);
	}

})