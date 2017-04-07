var energyBillProratePieController = View.createController('energyBillProratePie',{
	afterViewLoad: function() {
		var chart = this.energyBillProratePie_chart;
		var openerController = View.getOpenerView().controllers.get('energyBillProrate');
		
		var titleGroupBy = getMessage(openerController.groupBy);
		View.groupBy = titleGroupBy;				
		var title = " " + String.format(getMessage('crossTablePanelTitle'), titleGroupBy);
		title += " - " + openerController.vn_id + " - " + openerController.bill_id;
		
		chart.addParameter("group_field", openerController.groupField);
		chart.addParameter("vn_id", openerController.vn_id);
		chart.addParameter("bill_id", openerController.bill_id);
		View.initializeProgressBar();
		chart.refresh();
		View.closeProgressBar();
		chart.show(true);
		chart.appendTitle(title);
	}
});

