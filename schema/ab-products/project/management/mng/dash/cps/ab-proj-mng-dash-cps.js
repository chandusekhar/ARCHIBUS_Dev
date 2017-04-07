var projMngDashCpsController = View.createController('projMngDashCps',{
	moreShown: false,
	menuOptions: new Array('option1','option2','option3','option4','option5','option6','option7','option8','option9','option10','option11','option12'),
	
	afterViewLoad: function() {		
    	var grid = this.projMngDashCps_cps;
    	
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
    
    afterInitialDataFetch: function() {
    	var titleObjOptions = Ext.get('projMngDashCps_cps_optionsMenu');
        titleObjOptions.on('click', this.showOptionsMenu, this, null);
    },
    
    showOptionsMenu: function(e, item){
    	var menuArr = this.menuOptions;
		var handler = this.onOptionsButtonPush;
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			if (this.moreShown && i==0) continue;
			else if (!this.moreShown && i==1) continue;
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems, autoWidth: function() {
            // KB 3046662: override Ext.menu.Menu method that does not work well on IE
            var el = this.el;
            if (!el) {
                return;
            }
            var w = this.width;
            if (w) {
                el.setWidth(w);
            }
        }});
		menu.showAt(e.getXY());
    },
	
	onOptionsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'option1':
			this.projMngDashCps_cps_onShowMore();
			break;
		case 'option2':
			this.projMngDashCps_cps_onShowLess();
			break;	
		case 'option3':
			View.openDialog('ab-proj-mng-rpt-contracts.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option4':
			View.openDialog('ab-proj-mng-rpt-at-risk.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option5':
			View.openDialog('ab-proj-mng-rpt-pkg-status.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option6':
			View.openDialog('ab-proj-mng-rpt-costs-pkg.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option7':
			View.openDialog('ab-proj-mng-rpt-sched-var-pkg.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option8':
			View.openDialog('ab-proj-mng-rpt-sched-var-act.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option9':
			View.openDialog('ab-proj-mng-rpt-act-sum.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option10':
			View.openDialog('ab-proj-mng-rpt-act-status.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option11':
			View.openDialog('ab-proj-mng-rpt-cost-var.axvw', this.projMngDashCps_cps.restriction);
			break;
		case 'option12':
			View.openDialog('ab-proj-mng-rpt-est-act-cost.axvw', this.projMngDashCps_cps.restriction);
			break;
		}
	},
    
    projMngDashCps_cps_afterRefresh: function() {	
	    this.projMngDashCps_cps.gridRows.each(function (row) {
	       var record = row.getRecord();
	 		   
	       var statusTick = row.actions.get('status_tick');
		   var pct_claims = record.getValue('work_pkgs.pct_claims');
		   var status = record.getValue('work_pkgs.status');
		   if (pct_claims >= 100 || status == 'Completed-Pending' || status == 'Completed-Not Ver' || status == 'Completed-Verified' || status == 'Closed') {		  
			   statusTick.show(true);
		   }
		   else statusTick.show(false);
	 	});
	},
	
	projMngDashCps_cps_onShowMore: function() {
		this.projMngDashCps_cps.showColumn('work_pkgs.tot_est_costs', true);
	    this.projMngDashCps_cps.showColumn('work_pkgs.amount_approved', true);
	    this.projMngDashCps_cps.showColumn('work_pkgs.amount_issued', true);
	    this.projMngDashCps_cps.showColumn('work_pkgs.req_cost_change_orders', true);
	    this.projMngDashCps_cps.showColumn('work_pkgs.pct_complete_by_cost', true);
	    this.projMngDashCps_cps.update();
		this.moreShown = true;
    },
    
    projMngDashCps_cps_onShowLess: function() {
    	this.projMngDashCps_cps.showColumn('work_pkgs.tot_est_costs', false);
    	this.projMngDashCps_cps.showColumn('work_pkgs.amount_approved', false);
	    this.projMngDashCps_cps.showColumn('work_pkgs.amount_issued', false);
	    this.projMngDashCps_cps.showColumn('work_pkgs.req_cost_change_orders', false);
	    this.projMngDashCps_cps.showColumn('work_pkgs.pct_complete_by_cost', false);
	    this.projMngDashCps_cps.update();
		this.moreShown = false;
    },
    
    projMngDashCps_cps_onViewGantt: function() {
    	var openerController = View.getOpenerView().controllers.get('projMng');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', openerController.project_id);		
		openerController.projMngTabs.setTabRestriction('projMngGantt', restriction);
		openerController.projMngTabs.showTab('projMngGantt', true);
		openerController.projMngTabs.selectTab('projMngGantt', restriction);
	}
});

function showWorkpkg(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projMng');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);
	
	selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgProf', restriction);
	openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
}

function showChgOrds(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projMng');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgChg', restriction);
	openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
}

function showInvs(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projMng');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgInv', restriction);
	openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
}

function showActs(obj) {
	var restriction = new Ab.view.Restriction();
	var openerController = View.getOpenerView().controllers.get('projMng');
	var project_id = openerController.project_id;
	var work_pkg_id = obj.restriction['work_pkgs.work_pkg_id'];
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	restriction.addClause('work_pkgs.project_id', project_id);

	selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgAct', restriction);
	openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);	
}

function onAddInv() {
	var openerController = View.getOpenerView().controllers.get('projMng');
	var projectRestriction = new Ab.view.Restriction();
	projectRestriction.addClause('project.project_id', openerController.project_id);
	View.openDialog('ab-proj-mng-inv-edit.axvw', projectRestriction, true, {
		width : 1000,
		height : 800,
		closeButton : true,
		callback: function() {
			View.panels.get('projMngDashCps_cps').refresh();
			View.panels.get('projMngDashAlert_msgs').refresh();
	    }
	});
}
