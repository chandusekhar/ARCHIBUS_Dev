var showLineController = View.createController('showLine', {
    afterViewLoad: function() {
	 var openerController = View.getOpenerView().controllers.get('abEqMaintenanceHistoryController');
      var panel=this.abEqMaintHistChlineByMonthChart;
	 var restriction= openerController.consoleParam;
	 if(openerController.dateStart!=''){
	 	restriction=restriction+" AND hwr.date_completed >= ${sql.date('"+openerController.dateStart+"')}";
	 }
	  if(openerController.dateEnd!=''){
	 	restriction=restriction+" AND hwr.date_completed <=${sql.date('"+openerController.dateEnd+"')}";
	 }
		panel.addParameter('parentRestriction', restriction);
	    panel.refresh();
    }
})

function onLineChartClick(obj) {
    var openerController = View.getOpenerView().controllers.get('abEqMaintenanceHistoryController');
    var dateStart = openerController.dateStart;
    var dateEnd = openerController.dateEnd;
    var restriction = obj.restriction;
    if (dateStart) {
        restriction.addClause('hwr.date_completed', dateStart, '&gt;=');
    }
    if (dateEnd) {
        restriction.addClause('hwr.date_completed', dateEnd, '&lt;=');
    }
	
    var detailPanel = View.panels.get('abEqMaintHistChlineChartDetail');
	 var restrictionConsole= openerController.consoleParam;
	 //restrictionConsole for exsits son search
	detailPanel.addParameter('restrictionConsole', restrictionConsole);
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}
