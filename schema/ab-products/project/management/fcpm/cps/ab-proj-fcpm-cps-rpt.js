var projFcpmCpsRptController = View.createController('projFcpmCpsRpt',{
	
	afterViewLoad: function() {
    	var grid = this.projFcpmCpsRpt_cps;
    	
    	grid.afterCreateCellContent = function(row, column, cellElement) {
    	    var value = row[column.id + '.raw'];
    		if (column.id == 'work_pkgs.pct_claims' && value != '' && value > 110)	{
    			cellElement.style.background = '#ff7733';//Orange
    			//cellElement.style.color = 'Red';
    		} else {
    			cellElement.style.background = 'transparent';
    			//cellElement.style.color = 'Black';
    		}
    	}
    },
	
	projFcpmCpsRpt_cps_afterRefresh: function() {
		var projFcpmCpsController = View.getOpenerView().controllers.get('projFcpmCps');
		var project_name = projFcpmCpsController.project_name;
		var project_id = projFcpmCpsController.project_id;
		var title = "[" + project_id + "] ";
		if (project_name != '') title += project_name;
		this.projFcpmCpsRpt_cps.appendTitle(title);
		
	    this.projFcpmCpsRpt_cps.gridRows.each(function (row) {
	       var record = row.getRecord();
	 		   
	       var statusTick = row.actions.get('status_tick');
		   var pct_claims = record.getValue('work_pkgs.pct_claims');
		   var status = record.getValue('work_pkgs.status');
		   if (pct_claims >= 100 || status == 'Completed-Pending' || status == 'Completed-Not Ver' || status == 'Completed-Verified' || status == 'Closed') {		  
			   statusTick.show(true);
		   }
		   else statusTick.show(false);
	 	});
	}

});

function showWorkpkg(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projFcpmCps');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projFcpmCpsTabs, 'projFcpmCpsPkg', openerController.projFcpmCpsPkgTabs, 'projFcpmCpsPkgProf', restriction);
	openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', work_pkg_id);
}

function showChgOrds(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projFcpmCps');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projFcpmCpsTabs, 'projFcpmCpsPkg', openerController.projFcpmCpsPkgTabs, 'projFcpmCpsPkgChg', restriction);
	openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', work_pkg_id);
}

function showInvs(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projFcpmCps');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projFcpmCpsTabs, 'projFcpmCpsPkg', openerController.projFcpmCpsPkgTabs, 'projFcpmCpsPkgInv', restriction);
	openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', work_pkg_id);
}
