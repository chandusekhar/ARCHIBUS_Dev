var projMngPkgActController = View.createController('projMngPkgAct', {
	project_id: '',	
	work_pkg_id: '',
	menuOptions: new Array('option1','option2','option3','option5','option6'), /*'option4' = Copy Baseline Costs*/
	moreShown: false,
	showCopyBaseline: true,
	
	afterInitialDataFetch: function(){
        var titleObjOptions = Ext.get('projMngPkgActFilter_optionsMenu');
        titleObjOptions.on('click', this.showOptionsMenu, this, null);
    },
    
    showOptionsMenu: function(e, item){
    	var menuArr = this.menuOptions;
		var handler = this.onOptionsButtonPush;
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			if (this.moreShown && i==0) continue;
			else if (!this.moreShown && i==1) continue;
			if (!this.showCopyBaseline && i==3) continue;
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
    },
	
	onOptionsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'option1':
			this.projMngPkgActFilter_onShowMore();
			break;
		case 'option2':
			this.projMngPkgActFilter_onShowLess();
			break;
		case 'option3':
			this.projMngPkgActFilter_onAssignActions();
			break;	
		case 'option4':
			this.projMngPkgActFilter_onCopyBaseline();
			break;
		case 'option5':
			onExportMsProject();
			break;	
		case 'option6':
			View.openDialog('ab-proj-mng-pkg-act-msproj-imp.axvw');
			break;
		}
	},
	
	projMngPkgActFilter_afterRefresh : function() {
		if (this.projMngPkgActFilter.restriction) {
			this.project_id = this.projMngPkgActFilter.restriction.findClause('work_pkgs.project_id').value;
			this.work_pkg_id = this.projMngPkgActFilter.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projMngPkgActFilter.appendTitle(this.project_id + ' - ' + this.work_pkg_id);
			this.projMngPkgActFilter_onClear();
		}
	},
	
	projMngPkgActFilter_onClear: function() {
		$('hideRejectedCancelled').checked = true;
		this.projMngPkgActFilter_onFilter();
	},
	
	projMngPkgActFilter_onFilter: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		if ($('hideRejectedCancelled').checked) {
			restriction.addClause('activity_log.status', ['REJECTED','CANCELLED'], 'NOT IN');  
		}
    	this.projMngPkgActGrid.refresh(restriction);
	},
	
	projMngPkgActGrid_afterRefresh: function() {
		var existsZero = false;
    	this.projMngPkgActGrid.gridRows.each(function (row) {
    	   var record = row.getRecord();
    	   var statusTick = row.actions.get('status_tick');
		   var pct_complete = record.getValue('activity_log.pct_complete');
		   var status = record.getValue('activity_log.status');
		   if (pct_complete >= 100 || status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {		  
			   statusTick.show(true);
		   }
		   else statusTick.show(false);
		   
 		   var design_costs = record.getValue('activity_log.tot_costs_design');
 		   var base_costs = record.getValue('activity_log.tot_costs_base');
		   if (design_costs == 0 && base_costs > 0) {
 			   existsZero = true;
 		   }
 		});
    	if (!existsZero) this.showCopyBaseline = false;
    	else this.showCopyBaseline = true;
	},
	
	projMngPkgActFilter_onUpdateActions : function() {
		var records = this.projMngPkgActGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var updateParameters = {};
		updateParameters.records = records;
        
        View.openDialog('ab-proj-mng-acts-up.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            updateParameters: updateParameters,
            callback: function() {
            	View.controllers.get('projMngPkgAct').projMngPkgActGrid.refresh();
            }
        });
	},	
	
	projMngPkgActFilter_onCopyBaseline : function() {
		var records = this.projMngPkgActGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var controller = this;
		View.confirm(getMessage('copyCostsFromBaseline'), function(button){
            if (button == 'yes') {
            	controller.copyCostsFromBaseline(records);
            }
            else {
                
            }
        });
	},
	
	copyCostsFromBaseline: function(records) {
		for (var i = 0; i < records.length; i++) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_log_id', records[i].getValue('activity_log.activity_log_id'));
			var record = this.projMngPkgActDs1.getRecord(restriction);
			if (record.getValue('activity_log.cost_est_design_exp') == 0 && record.getValue('activity_log.cost_est_design_cap') == 0) {
				record.setValue('activity_log.cost_est_design_exp', record.getValue('activity_log.cost_estimated'));
				record.setValue('activity_log.cost_est_design_cap', record.getValue('activity_log.cost_est_cap'));
				this.projMngPkgActDs1.saveRecord(record);
			}
		}		
		this.projMngPkgActGrid.refresh();
	},
	
	projMngPkgActFilter_onShowMore: function() {	    
	    this.projMngPkgActGrid.showColumn('activity_log.date_planned_for', true);
		this.projMngPkgActGrid.showColumn('activity_log.duration_est_baseline', true);
		this.projMngPkgActGrid.showColumn('activity_log.duration_act', true);
		this.projMngPkgActGrid.showColumn('activity_log.tot_costs_base', true);
		this.projMngPkgActGrid.showColumn('activity_log.tot_costs_act', true);
		this.projMngPkgActGrid.showColumn('activity_log.date_started', true);
	    this.projMngPkgActGrid.showColumn('activity_log.site_id', true);
	    this.projMngPkgActGrid.showColumn('activity_log.bl_id', true);
	    this.projMngPkgActGrid.showColumn('activity_log.fl_id', true);
	    this.projMngPkgActGrid.showColumn('activity_log.rm_id', true);
	    this.projMngPkgActGrid.showColumn('activity_log.location', true);
	    this.projMngPkgActGrid.showColumn('activity_log.prob_type', true);
	    this.projMngPkgActGrid.showColumn('activity_log.description', true);
	    this.projMngPkgActGrid.update();
		this.moreShown = true;
    },
    
    projMngPkgActFilter_onShowLess: function() {
    	this.projMngPkgActGrid.showColumn('activity_log.date_planned_for', false);
		this.projMngPkgActGrid.showColumn('activity_log.duration_est_baseline', false);
		this.projMngPkgActGrid.showColumn('activity_log.duration_act', false);
		this.projMngPkgActGrid.showColumn('activity_log.tot_costs_base', false);
		this.projMngPkgActGrid.showColumn('activity_log.tot_costs_act', false);
    	this.projMngPkgActGrid.showColumn('activity_log.date_started', false);
    	this.projMngPkgActGrid.showColumn('activity_log.site_id', false);
	    this.projMngPkgActGrid.showColumn('activity_log.bl_id', false);
	    this.projMngPkgActGrid.showColumn('activity_log.fl_id', false);
	    this.projMngPkgActGrid.showColumn('activity_log.rm_id', false);
	    this.projMngPkgActGrid.showColumn('activity_log.location', false);
	    this.projMngPkgActGrid.showColumn('activity_log.prob_type', false);
	    this.projMngPkgActGrid.showColumn('activity_log.description', false);
	    this.projMngPkgActGrid.update();
		this.moreShown = false;
    },
	
	projMngPkgActFilter_onAssignActions : function() {
		var project_id = this.projMngPkgActGrid.restriction.findClause('work_pkgs.project_id').value;
		var restriction = new Ab.view.Restriction;
		restriction.addClause('activity_log.project_id', project_id);
		View.openDialog('ab-proj-mng-pkg-act-asgn.axvw', restriction, false, {
		    closeButton: true,
		    maximize: true
		});
	},
	
	projMngPkgActFilter_onAddNew: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		View.openDialog('ab-proj-mng-pkg-act-add.axvw', restriction, true, {
			closeButton : true,
			callback: function() {
				View.controllers.get('projMngPkgAct').projMngPkgActGrid.refresh();
		    }
		});
	}
});

function openAction(commandContext) {
	var activity_log_id = commandContext.restriction['activity_log.activity_log_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', activity_log_id);
	var record = View.dataSources.get('projMngPkgActDs1').getRecord(restriction);
	if ((record.getValue('activity_log.status') == 'REQUESTED' || record.getValue('activity_log.status') == 'REJECTED') && record.getValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
		View.openDialog('ab-proj-mng-chg-edit.axvw', restriction, false, {
    		width : 1000,
			height : 800,
			closeButton : true,
			callback: function() {
				View.controllers.get('projMngPkgAct').projMngPkgActGrid.refresh();
		    }
		});
	}
	else {
		View.openDialog('ab-proj-mng-act-edit.axvw', restriction, false, {
		    closeButton: true,
		    callback: function() {
		    	View.controllers.get('projMngPkgAct').projMngPkgActGrid.refresh();
		    } 
		});
	}
}

function onExportMsProject() {
	var project_id = View.panels.get('projMngPkgActGrid').restriction.findClause('work_pkgs.project_id').value;
	var work_pkg_id = View.panels.get('projMngPkgActGrid').restriction.findClause('work_pkgs.work_pkg_id').value;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	View.openDialog('ab-proj-mng-pkg-act-msproj-exp.axvw', restriction, false, {
			closeButton: false,
			maximize: false,
			minimize: false,
			width : 500,
			height : 150});
}


function onChangeHideRejectedCancelled() {
	var controller = View.controllers.get('projMngPkgAct');
	controller.projMngPkgActFilter_onFilter();
}