
var controller = View.createController('testController', {
	
	groupingDsRestrict_grid1_select_onClick: function(row, action) {
		var year = row.getRecord().getValue('afm_cal_dates.year');
		this.groupingDsRestrict_grid2.addParameter('year', year);
		this.groupingDsRestrict_grid2.refresh();
		this.groupingDsRestrict_grid2.appendTitle(year);
	}
});
