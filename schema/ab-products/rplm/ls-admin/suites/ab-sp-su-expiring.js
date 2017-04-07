View.createController('abSpSuExpiringCtrl',{
	fromDate: null,
	toDate: null,
	afterInitialDataFetch: function(){
		var toDate = new Date();
		var fromDate = toDate.add(Date.YEAR, -1);
		var console = View.panels.get('abSpSuExpiring_console');
		var ds = console.getDataSource();
		console.setFieldValue('from_date', ds.formatValue('ls.date_end', fromDate));
		console.setFieldValue('to_date', ds.formatValue('ls.date_end', toDate));
	},
	abSpSuExpiring_console_onClear: function(){
		this.afterInitialDataFetch();
		var blPanel = View.panels.get('abSpSuExpiring_detailsBl');
		var suPanel = View.panels.get('abSpSuExpiring_detailsSu');
		blPanel.show(false, true);
		suPanel.show(false, true);
	},
	abSpSuExpiring_console_onShow: function(){
		var console = View.panels.get('abSpSuExpiring_console');
		var blPanel = View.panels.get('abSpSuExpiring_detailsBl');
		var suPanel = View.panels.get('abSpSuExpiring_detailsSu');
		if(this.validateDates()){
			var dateRestr = " EXISTS(SELECT su.su_id FROM su, ls WHERE su.ls_id = ls.ls_id AND su.bl_id = bl.bl_id ";
			if(this.fromDate){
				dateRestr += " AND ls.date_end >= ${sql.date(\'" + this.fromDate + " \')}";
			}
			if(this.toDate){
				dateRestr += " AND ls.date_end <= ${sql.date(\'" + this.toDate + " \')}";
			}
			dateRestr += ")";
			blPanel.refresh(dateRestr);
			suPanel.show(false, true);
		}
	},
	validateDates: function(){
		var console = View.panels.get('abSpSuExpiring_console');
		var ds = console.getDataSource();
		var fromDate = console.getFieldValue('from_date');
		var toDate = console.getFieldValue('to_date');
		if (fromDate && toDate) {
			var dtFrom = ds.parseValue('ls.date_end', fromDate, false);
			var dtTo = ds.parseValue('ls.date_end', toDate, false);
			if (dtFrom.getTime() > dtTo.getTime()) {
				View.showMessage(getMessage('errToDateSmallerFromDate'));
				return false;
			}
		}
		this.fromDate = fromDate;
		this.toDate = toDate;
		return true;
	},
	abSpSuExpiring_detailsSu_afterRefresh: function(){
        var suPanel = this.abSpSuExpiring_detailsSu;
		var clause = suPanel.restriction.findClause('su.bl_id');
        suPanel.setTitle(getMessage('setTitleForSu') + ' ' + clause.value);
	},
	
	abSpSuExpiring_detailsBl_onReport: function(){
		var suRestriction = new Ab.view.Restriction();
		if(this.fromDate){
			suRestriction.addClause('ls.date_end', this.fromDate, '>=');
		}
		if(this.toDate){
			suRestriction.addClause('ls.date_end', this.toDate, '<=');
		}
		
		var restriction = {'abSpSuExpiringPgrp_blDs': this.abSpSuExpiring_detailsBl.restriction,
                'abSpSuExpiringPgrp_suDs': suRestriction}
		
		View.openPaginatedReportDialog('ab-sp-su-expiring-pgrp.axvw', restriction);
	}
});

function showSuites(row, action){
	var controller = View.controllers.get('abSpSuExpiringCtrl');
	var blPanel = View.panels.get('abSpSuExpiring_detailsBl');
	var suPanel = View.panels.get('abSpSuExpiring_detailsSu');
	var bl_id = row.row.getFieldValue('bl.bl_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('su.bl_id', bl_id, '=');	
	if(controller.fromDate){
		restriction.addClause('ls.date_end', controller.fromDate, '>=');
	}
	if(controller.toDate){
		restriction.addClause('ls.date_end', controller.toDate, '<=');
	}
	suPanel.refresh(restriction);
}
