var projFcpmCpsPkgActController = View.createController('projFcpmCpsPkgAct', {
	project_id: '',	
	menuOptions: new Array('option1','option2','option3','option4'),
	moreShown: false,
	
	afterViewLoad: function() {
        var grid = this.projFcpmCpsPkgActPjnGrid;
        var j = grid.findColumnIndex('proj_forecast_item.date_forecast_mo');
        var controller = this;

        grid.afterCreateCellContent = function(row, column, cellElement) {
    	    var value = row[column.id];
    		if (column.id == 'proj_forecast_item.date_forecast_mo')	{
    			var mo = Number(value.substring(5));
    			var contentElement = cellElement.childNodes[0];
    			contentElement.innerHTML = getMessage('mo' + mo);
    		}
    	}       
	},
	
	afterInitialDataFetch: function(){
        var titleObjOptions = Ext.get('projFcpmCpsPkgActGrid_optionsMenu');
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
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
    },
	
	onOptionsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'option1':
			this.projFcpmCpsPkgActGrid_onShowMore();
			break;
		case 'option2':
			this.projFcpmCpsPkgActGrid_onShowLess();
			break;
		case 'option3':
			onExportMsProject();
			break;	
		case 'option4':
			View.openDialog('ab-proj-fcpm-cps-pkg-act-msproj-imp.axvw');
			break;
		}
	},
	
	projFcpmCpsPkgActGrid_afterRefresh : function() {
		if (this.projFcpmCpsPkgActGrid.restriction) {
			var project_id = this.projFcpmCpsPkgActGrid.restriction.findClause('work_pkgs.project_id').value;
			var work_pkg_id = this.projFcpmCpsPkgActGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projFcpmCpsPkgActGrid.appendTitle(project_id + ' - ' + work_pkg_id);	
			
			var proj_forecast_id = getProjForecastId(project_id, work_pkg_id);
			
			var item_restriction = new Ab.view.Restriction();
			item_restriction.addClause('proj_forecast_item.project_id', project_id);
			item_restriction.addClause('proj_forecast_item.work_pkg_id', work_pkg_id);
			item_restriction.addClause('proj_forecast_item.proj_forecast_id', proj_forecast_id);
			this.projFcpmCpsPkgActPjnGrid.refresh(item_restriction);
			
		
			var existsZero = false;
	    	this.projFcpmCpsPkgActGrid.gridRows.each(function (row) {
	    	   var record = row.getRecord();
	 		   
	    	   var statusTick = row.actions.get('status_tick');
			   var pct_complete = record.getValue('activity_log.pct_complete');
			   var status = record.getValue('activity_log.status');
			   if (pct_complete >= 100 || status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {		  
				   statusTick.show(true);
			   }
			   else statusTick.show(false);
	 		});
		}
	},
	
	projFcpmCpsPkgActGrid_onUpdateActions : function() {
		var records = this.projFcpmCpsPkgActGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var updateParameters = {};
		updateParameters.records = records;
        
        View.openDialog('ab-proj-fcpm-cps-pkg-act-up.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            updateParameters: updateParameters
        });
	},	
	
	projFcpmCpsPkgActGrid_onAddNew: function() {
		var record = this.projFcpmCpsPkgActDs0.getRecord(this.projFcpmCpsPkgActGrid.restriction);
		var wbs_id = record.getValue('work_pkgs.wbs_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id',this.projFcpmCpsPkgActGrid.restriction.findClause('work_pkgs.project_id').value);
		restriction.addClause('activity_log.work_pkg_id',this.projFcpmCpsPkgActGrid.restriction.findClause('work_pkgs.work_pkg_id').value);
		restriction.addClause('activity_log.wbs_id', wbs_id);
		View.openDialog('ab-proj-fcpm-cps-pkg-act-add.axvw', restriction, true);
	},
	
	projFcpmCpsPkgActGrid_onShowMore: function() {
		this.projFcpmCpsPkgActGrid.showColumn('activity_log.pct_complete', true);
		this.projFcpmCpsPkgActGrid.showColumn('activity_log.date_completed', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.site_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.bl_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.fl_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.rm_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.activity_type', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.activity_log_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.work_pkg_id', true);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.doc', true);
	    this.projFcpmCpsPkgActGrid.update();
		this.moreShown = true;
    },
    
    projFcpmCpsPkgActGrid_onShowLess: function() {
    	this.projFcpmCpsPkgActGrid.showColumn('activity_log.pct_complete', false);
    	this.projFcpmCpsPkgActGrid.showColumn('activity_log.date_completed', false);
    	this.projFcpmCpsPkgActGrid.showColumn('activity_log.site_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.bl_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.fl_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.rm_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.activity_type', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.activity_log_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.work_pkg_id', false);
	    this.projFcpmCpsPkgActGrid.showColumn('activity_log.doc', false);
	    this.projFcpmCpsPkgActGrid.update();
		this.moreShown = false;
    }
});

function openAction(commandContext) {
	var activity_log_id = commandContext.restriction['activity_log.activity_log_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', activity_log_id);
	var record = View.dataSources.get('projFcpmCpsPkgActDs1').getRecord(restriction);
	if ((record.getValue('activity_log.status') == 'REQUESTED' || record.getValue('activity_log.status') == 'REJECTED') && record.getValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
		View.openDialog('ab-proj-fcpm-cps-pkg-chg-edit.axvw', restriction, false, {
    		width : 1000,
			height : 800,
			closeButton : true,
			callback: function() {
				View.controllers.get('projFcpmCpsPkgAct').projFcpmCpsPkgActGrid.refresh();
		    }
		});
	}
	else View.openDialog('ab-proj-fcpm-cps-pkg-act-edit.axvw', restriction);
}

function onExportMsProject() {
	var project_id = View.panels.get('projFcpmCpsPkgActGrid').restriction.findClause('work_pkgs.project_id').value;
	var work_pkg_id = View.panels.get('projFcpmCpsPkgActGrid').restriction.findClause('work_pkgs.work_pkg_id').value;
	var parameters = {
			'project_id' : project_id,
			'work_pkg_id' : work_pkg_id};
	var result = Workflow.call('AbProjectManagement-MsProjectService-exportToMsProject', parameters);
	if (result.code == 'executed') {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', project_id);
		restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		View.openDialog('ab-proj-fcpm-cps-pkg-act-msproj-exp.axvw', restriction);
	} else {
		View.showMessage(result.message);
	}
}
