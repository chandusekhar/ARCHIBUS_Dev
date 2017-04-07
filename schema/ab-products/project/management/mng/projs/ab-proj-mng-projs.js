var projMngProjsController = View.createController('projMngProjs',{
	consoleRestriction: " project.is_template = 0 ",
	statusRestriction: " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') ",
	defaultRestriction: " project.is_template = 0 ",
	collapsed: true,
	moreFields: new Array('project.project_type','project.project_id','program.program_type','project.program_id','ctry.geo_region_id','bl.ctry_id','bl.state_id','bl.city_id','project.site_id', 'project.bl_id', 'project.dv_id', 'project.dp_id', 'project.proj_mgr', 'project.contact_id', 'project.dept_contact', 'project.requestor'),
	menuAlerts: new Array('assignedAct', 'workpkgsOutBid', 'contrPendSig', 'chgPendApprv', 'actsBehSched', 'actsOnHold', 'openInv', 'highLog', 'urgLog'),
	systemYear: 2025,
	accessLevel: 'executive',
	alertMenu: null,
	
	afterViewLoad: function() {
		var layout = View.getLayoutManager('main');
		layout.setRegionSize('north', 100);
		var grid = this.projMngProjs_projects;
		grid.afterCreateCellContent = function(row, column, cellElement) {
    	    var value = row[column.id + '.raw'];
    		if (column.id == 'project.pct_claims' && value != '' && value > 110)	{
    			cellElement.style.background = '#ff7733';//Orange
    			//cellElement.style.color = 'Red';
    		} else {
    			cellElement.style.background = 'transparent';
    			cellElement.style.color = 'Black';
    		}
    	}
	},
	
    afterInitialDataFetch: function(){
    	this.accessLevel = View.getOpenerView().controllers.get('projMng').accessLevel;
    	this.setAccessLevel(this.accessLevel);
    	
    	var titleObjAlerts = Ext.get('alerts');
        titleObjAlerts.on('click', this.showAlertsMenu, this, null);
        
        this.setConsoleTimeframe();
        this.projMngProjs_filter_onClear();
        this.projMngProjs_filter_showMoreFields(false);
        
        this.projMngProjs_projects.setCategoryColors({'Issued-On Hold': '#FF3300', 'Issued-Stopped': '#FF3300', 'Issued-In Process': '#33CC33', 'Approved': '#6600CC', 'Approved-In Design': '#6600CC', 'Completed-Pending': '#000000', 'Completed-Not Ver': '#000000', 'Completed-Verified': '#000000', 'Closed': '#000000', 'Approved-Cancelled': '#000000'});
		this.projMngProjs_projects.setCategoryConfiguration({
    		fieldName: 'project.status',
    		order: ['Approved','Approved-In Design', 'Issued-In Process','Issued-On Hold','Issued-Stopped','Completed-Pending', 'Completed-Not Ver', 'Completed-Verified', 'Closed','Approved-Cancelled'],
    		getStyleForCategory: this.getStyleForCategory
    	});
    	this.projMngProjs_projects.update();
    	
    	
    	var mainController = View.getOpenerView().controllers.get('projMng');
    	var showMoreFields = false;
    	if(valueExists(mainController.queryParameters['bl_id'])) {
    		this.projMngProjs_filter.setFieldValue('project.bl_id', mainController.queryParameters['bl_id']);
    		showMoreFields = true;
    	}
    	if(valueExists(mainController.queryParameters['project_id'])) {
    		this.projMngProjs_filter.setFieldValue('project.project_id', mainController.queryParameters['project_id']);
    		showMoreFields = true;
    	}
    	
    	if (showMoreFields) {
    		var action = null;
    		this.projMngProjs_filter.fieldsets.each(function(fieldset){
    			if(valueExists(fieldset.actions.get('toggleMoreFields'))) {
    				action = fieldset.actions.get('toggleMoreFields')
    			}
    		});
    		this.projMngProjs_filter_onToggleMoreFields(this.projMngProjs_filter, action);
    	}

    	if (mainController.isDemoMode) {
    		this.projMngProjs_filter_onFilter();
    	}
    	
    	
        var selectedProjectId = this.view.getOpenerView().controllers.get('projMng').project_id;
        if (valueExistsNotEmpty(selectedProjectId)) {
        	var ctx = {restriction: {'project.project_id': selectedProjectId}};
        	this.projMngProjs_projects_onOpenProjectDash(ctx);
        }
    	
    },
	
	getStyleForCategory: function(record) {
    	var style = {};
    	var status = record.getValue('project.status');
    	var targetPanel = View.panels.get('projMngProjs_projects');
    	style.color = targetPanel.getCategoryColors()[status]; 
    	return style;
    },
    
    projMngProjs_projects_afterRefresh: function() {
    	var controller = this;
    	this.projMngProjs_projects.gridRows.each(function (row) {
    		var record = row.getRecord(); 
    		var project_id = record.getValue('project.project_id');
    		var has_alerts = record.getValue('project.has_alerts');
	    	var alertIcon = row.actions.get('alertIcon');
	    	
			if (has_alerts > 0) {		  
				alertIcon.show(true);
				controller.showRowAlertsMenu(alertIcon, project_id);
			}
			else alertIcon.show(false);
    	});
    },
    
	setAccessLevel: function(level) {
		var em_id = View.user.employee.id;
		if (level == 'manager' || level == 'fcpm') {
			View.getOpenerView().setTitle(getMessage(level + 'Access'));
			this.projMngProjs_filter.actions.get('joinProjectTeam').show(false);
			this.projMngProjs_filter.showField('show', false);
			this.defaultRestriction = " project.is_template = 0 AND project.proj_mgr = '" + getValidRestVal(em_id) + "' ";
		}
		else {
			View.getOpenerView().setTitle(getMessage('executiveAccess'));
			this.projMngProjs_filter.actions.get('joinProjectTeam').show(true);
			this.projMngProjs_filter.showField('show', true);
		}
	},
    
    setConsoleTimeframe: function()
    {
    	var systemDate = new Date();
    	var x = systemDate.getYear();
    	systemYear = x % 100;
    	systemYear += (systemYear < 38) ? 2000 : 1900;
    	this.systemYear = systemYear;
    	var optionData;
    	
    	if ($('from_year')) 
    	{
    		for (var i = 0 ; i < 21; i++)
    		{
    			optionData = new Option(systemYear-10+i, systemYear-10+i);
    			$('from_year').options[i] = optionData;
    		}
    		$('from_year').value = systemYear;
    	}
    	if ($('to_year')) 
    	{
    		for (var i = 0 ; i < 21; i++)
    		{
    			optionData = new Option(systemYear-10+i, systemYear-10+i);
    			$('to_year').options[i] = optionData;
    		}
    		$('to_year').value = systemYear;
    	}
    },
    
    showRowAlertsMenu: function(action, project_id) {
    	var controller = this;
    	var e = Ext.get(action.id);				
		e.on('mouseover', function(evt){
			controller.showMenu(this, controller.menuAlerts, controller.onAlertsButtonPush, " project.project_id = '" + getValidRestVal(project_id) + "' ");
		});
    },
    
    showAlertsMenu: function(e, item){
    	this.showMenu(e, this.menuAlerts, this.onAlertsButtonPush, this.consoleRestriction + ' AND ' + this.statusRestriction);
    },

	showMenu: function(e, menuArr, handler, projRestriction){
		this.projMngAlert_ds.addParameter('projRestriction', projRestriction);
		var records = this.projMngAlert_ds.getRecords();
		var menuItems = [];
		if (!records || records.length == 0) {
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('noAlerts'),
				handler: null});

			menuItems.push(menuItem);
		}
		for(var i = 0; i < records.length; i++){
			var record = records[i];
			if (record.getValue('project.alert_count') < 1) continue;
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: record.getValue('project.alert_msg_count'),
				handler: handler.createDelegate(this, [record.getValue('project.alert_id'), projRestriction])});

			menuItems.push(menuItem);
		}
		this.alertMenu = new Ext.menu.Menu({items: menuItems, autoWidth: function() {
            // KB 3046658: override Ext.menu.Menu method that does not work well on IE
            var el = this.el;
            if (!el) {
                return;
            }
            var w = this.width;
            if (w) {
                el.setWidth(w);
            }
            
        }});
		this.alertMenu.showAt(e.getXY());
		var controller = this;
		jQuery('#' + this.alertMenu.el.id).on('mouseleave', function(evt){
        	controller.alertMenu.hide();
		});
	},
	
	onAlertsButtonPush: function(menuItemId, projRestriction){
		var parameters = {};
		parameters.projRestriction = projRestriction;
		var viewName = '';
		switch(menuItemId) {
		case '1':
			viewName = 'ab-proj-mng-projs-alert-assn-act.axvw';
			break;
		case '2':
			viewName = 'ab-proj-mng-projs-alert-pkg.axvw';
			break;
		case '3':
			viewName = 'ab-proj-mng-projs-alert-contr.axvw';
			break;
		case '4':
			viewName = 'ab-proj-mng-projs-alert-chg.axvw';
			break;
		case '5':
			viewName = 'ab-proj-mng-projs-alert-act-beh.axvw';
			break;
		case '6':
			viewName = 'ab-proj-mng-projs-alert-act-hold.axvw';
			break;
		case '7':
			viewName = 'ab-proj-mng-projs-alert-inv.axvw';
			break;
		case '8':
			viewName = 'ab-proj-mng-projs-alert-log-hi.axvw';
			break;
		case '9':
			viewName = 'ab-proj-mng-projs-alert-log-urg.axvw';
			break;
		}
		View.openDialog(viewName, null, false, {
	        width: 1200,
	        height: 800,
	        closeButton: true,
	        drilldownParameters: parameters
	    });
	},

    projMngProjs_filter_onClear: function() {
    	$('projMngProjs_filter_show').value = 'myProjects';
    	$('projMngProjs_filter_status').value = 'allOpen';
    	if ($('from_year')) $('from_year').value = this.systemYear;
    	if ($('to_year')) $('to_year').value = this.systemYear;
    	if ($('timeframe_type_fiscal_year')) $('timeframe_type_fiscal_year').checked = false;
    	this.projMngProjs_filter.clear();
    	this.projMngProjs_filter_onFilter();
    },
    
    projMngProjs_filter_onFilter: function() {
    	var show = $('projMngProjs_filter_show').value;
    	var status = $('projMngProjs_filter_status').value;
    	var em_id = View.user.employee.id;
    	if (this.accessLevel == 'executive') {
    		if (show == 'myProjects') this.projMngProjs_filter_onShowMyProjs();
    		else if (show == 'myLocation') this.projMngProjs_filter_onShowMyLoc();
        	else if (show == 'all') this.projMngProjs_filter_onShowAllProjs();
    	}
    	else this.consoleRestriction = this.defaultRestriction;
    	this.projMngProjs_setStatusRestriction(status);
    	if (!this.collapsed) {	
    		this.consoleRestriction = this.consoleRestriction + ' AND ' + getConsoleRestrictionForProjects();
    		if ($('timeframe_type_fiscal_year').checked) this.consoleRestriction += getTimeframeRestriction();
    	}
    	this.projMngProjs_projects.addParameter('projectsRestriction', this.consoleRestriction);
		this.projMngProjs_projects.restriction = this.statusRestriction;
		this.projMngProjs_projects.refresh();
    },
    
    projMngProjs_filter_onToggleMoreFields: function(panel, action) {
    	this.projMngProjs_filter_showMoreFields(this.collapsed);
    	this.collapsed = !this.collapsed;
    	action.setTitle(this.collapsed ?
                getMessage('filterMore') : getMessage('filterLess'));
    },
    
    projMngProjs_filter_showMoreFields: function(show) {
    	var layout = View.getLayoutManager('main');
    	for (var i=0; i < this.moreFields.length; i++) {
    		this.projMngProjs_filter.showField(this.moreFields[i], show);
    	}
    	if (show) {
    		layout.setRegionSize('north', 200);
    		Ext.get('timeframe_type_fiscal_year').dom.parentNode.parentNode.style.display = '';
    		Ext.get('from_year').dom.parentNode.parentNode.style.display = '';
    		Ext.get('to_year').dom.parentNode.parentNode.style.display = '';
    	}
    	else {
    		layout.setRegionSize('north', 100);
    		Ext.get('timeframe_type_fiscal_year').dom.parentNode.parentNode.style.display = 'none';
    		Ext.get('from_year').dom.parentNode.parentNode.style.display = 'none';
    		Ext.get('to_year').dom.parentNode.parentNode.style.display = 'none';
    	}   	
    },
    
    projMngProjs_filter_afterRefresh: function() {
    	this.projMngProjs_filter.clear();
    	this.projMngProjs_projects.refresh();
    },
    
    projMngProjs_filter_onShowMyProjs: function() {
    	var em_id = View.user.employee.id;
    	this.consoleRestriction = " project.is_template = 0 AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '" 
    		+ getValidRestVal(em_id) + "') OR project.requestor = '" + getValidRestVal(em_id) 
    		+ "' OR project.dept_contact = '" + getValidRestVal(em_id) 
    		+ "' OR project.apprv_mgr1 = '" + getValidRestVal(em_id)
    		+ "' OR project.proj_mgr = '" + getValidRestVal(em_id) + "') ";
    	this.statusRestriction = " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') "; 
    	this.projMngProjs_filter.appendTitle(getMessage('myProjects'));
    },
    
    projMngProjs_filter_onShowMyLoc: function() {
    	var site_id = View.user.employee.space.siteId;
    	var bl_id = View.user.employee.space.buildingId;
    	this.consoleRestriction = " project.is_template = 0 AND (project.site_id = '" + getValidRestVal(site_id) + "' OR project.bl_id = '" + getValidRestVal(bl_id) + "') ";
    	this.statusRestriction = " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') "; 
    	var title = site_id;
    	if (site_id != "" && bl_id != "") title += " - ";
    	title += bl_id;
    	this.projMngProjs_filter.appendTitle(title);
    },
    
    projMngProjs_filter_onShowAllProjs: function() {
    	this.consoleRestriction = " project.is_template = 0 ";
    	this.statusRestriction = " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') "; 
    	this.projMngProjs_filter.setTitle(getMessage('projects'));
    },
    
    projMngProjs_filter_onProjMngProjs_selValProjId: function() {
    	var em_id = View.user.employee.id;
    	var restriction = "project.is_template = 0 AND project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') ";
    	if (this.accessLevel == 'manager' || this.accessLevel == 'fcpm') {
    		restriction += " AND project.proj_mgr = '" + getValidRestVal(em_id) + "'";
    	}
    	View.selectValue('projMngProjs_filter', getMessage('selectProjectTitle'), ['project.project_id', 'project.project_type', 'project.program_id', 'project.proj_mgr', 'project.dept_contact', 'project.contact_id', 'project.requestor'], 'project', ['project.project_id', 'project.project_type', 'project.program_id', 'project.proj_mgr', 'project.dept_contact', 'project.contact_id', 'project.requestor'], 
    			['project.project_id','project.project_name', 'project.project_type', 'project.program_id', 'project.status', 'project.summary', 'project.proj_mgr', 'project.dept_contact', 'project.contact_id', 'project.requestor'], 
    			restriction); 
    },
    
    projMngProjs_filter_onProjMngProjs_selValProjMgr: function() {
    	var em_id = View.user.employee.id;
    	var restriction = '';
    	if (this.accessLevel == 'manager' || this.accessLevel == 'fcpm') {
    		restriction = new Ab.view.Restriction();
    		restriction.addClause('em.em_id', em_id);
    	}
    	View.selectValue('projMngProjs_filter', getMessage('selectProjectMgr'), ['project.proj_mgr'], 'em', ['em.em_id'], 
    			['em.em_id', 'em.em_std'], 
    			restriction); 
    },
    
    projMngProjs_setStatusRestriction: function(status) {
    	switch(status)
    	{
    	case 'approved':
    		this.statusRestriction = " project.status IN ('Approved','Approved-In Design') ";
    	  	break;
    	case 'issued':
    		this.statusRestriction = " project.status IN ('Issued-On Hold','Issued-In Process') ";
    	  	break;
    	case 'onHold':
    		this.statusRestriction = " project.status IN ('Issued-On Hold') ";
    	  	break;
    	case 'completed':
    		this.statusRestriction = " project.status LIKE 'Completed%' ";
    	  	break;
    	case 'closed':
    		this.statusRestriction = " project.status = 'Closed' ";
    	  	break;
    	case 'stopped':
    		this.statusRestriction = " project.status IN ('Approved-Cancelled','Issued-Stopped') ";
    		break;
    	case 'allOpen':
    		this.statusRestriction = " project.status NOT IN ('Created','Approved-Cancelled','Issued-Stopped','Closed') AND project.status NOT LIKE ('Requested%') ";
    		break;
    	case 'all':
    		break;
    	}
    },
	
	projMngProjs_projects_onOpenProjectDash: function(obj) {
		var project_id = obj.restriction['project.project_id'];
		this.openProjectDash(project_id, 'projMngDash', null, null);
    },
    
    openProjectDash: function(project_id, tabName, nestedTabName, pkgRestriction) {
    	var openerController = View.getOpenerView().controllers.get('projMng');
    	openerController.project_id = project_id;
    	openerController.setGanttRestrictions();
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', project_id);
    	
    	var record = this.projMngProjs_projDs.getRecord(restriction);
    	openerController.project_name = record.getValue('project.project_name');
    	
    	openerController.projMngTabs.showTab('projMngPkg', false);
    	openerController.projMngTabs.enableTab('projMngDash', true);
    	openerController.projMngTabs.enableTab('projMngInvs', true);
    	openerController.projMngTabs.enableTab('projMngActs', true);
    	openerController.projMngTabs.enableTab('projMngGantt', true);
    	openerController.projMngTabs.setTabRestriction('projMngDash', restriction);
    	openerController.projMngTabs.setTabRestriction('projMngInvs', restriction);
    	openerController.projMngTabs.setTabRestriction('projMngActs', restriction);
    	openerController.projMngTabs.setTabRestriction('projMngGantt', restriction);
    	if (tabName == 'projMngPkg') {
    		selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, nestedTabName, pkgRestriction);
    		var work_pkg_id = pkgRestriction.findClause('work_pkgs.work_pkg_id').value;
    		openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
    	} else openerController.projMngTabs.selectTab(tabName, restriction);
    },
    
    projMngProjs_filter_onJoinProjectTeam: function() {
    	View.openDialog('ab-proj-mng-projs-join.axvw');
    }
});

function getConsoleRestrictionForProjects() {
	var restriction = " project.is_template = 0 ";
	var console = View.panels.get('projMngProjs_filter');
	var projectId = console.getFieldValue('project.project_id').trim();
	if (projectId != '') restriction += " AND project.project_id LIKE '" + getValidRestVal(projectId) + "'";
	var contactId = console.getFieldValue('project.contact_id').trim();
	if (contactId != '') restriction += " AND project.contact_id LIKE '" + getValidRestVal(contactId) + "'";
	var projMgr = console.getFieldValue('project.proj_mgr').trim();
	if (projMgr != '') restriction += " AND project.proj_mgr LIKE '" + getValidRestVal(projMgr) + "'";
	var deptContact = console.getFieldValue('project.dept_contact').trim();
	if (deptContact != '') restriction += " AND project.dept_contact LIKE '" + getValidRestVal(deptContact) + "'";
	var requestor = console.getFieldValue('project.requestor').trim();
	if (requestor != '') restriction += " AND project.requestor LIKE '" + getValidRestVal(requestor) + "'";
	var projectType = console.getFieldValue('project.project_type').trim();
	if (projectType != '') restriction += " AND project.project_type LIKE '" + getValidRestVal(projectType) + "'";
	var programId = console.getFieldValue('project.program_id').trim();
	if (programId != '') restriction += " AND project.program_id LIKE '" + getValidRestVal(programId) + "'";
	var programType = console.getFieldValue('program.program_type').trim();
	if (programType != '') restriction += " AND program.program_type LIKE '" + getValidRestVal(programType) + "'";
	var siteId = console.getFieldValue('project.site_id').trim();
	if (siteId != '') restriction += " AND (project.site_id LIKE '" + getValidRestVal(siteId) + "' OR bl.site_id LIKE '" + getValidRestVal(siteId) + "')";
	var blId = console.getFieldValue('project.bl_id').trim();
	if (blId != '') restriction += " AND project.bl_id LIKE '" + getValidRestVal(blId) + "'";
	var ctryId = console.getFieldValue('bl.ctry_id').trim();
	if (ctryId != '') restriction += " AND (bl.ctry_id LIKE '" + getValidRestVal(ctryId) + "' OR site.ctry_id LIKE '" + getValidRestVal(ctryId) + "')";
	var geoRegionId = console.getFieldValue('ctry.geo_region_id').trim();
	if (geoRegionId != '') restriction += " AND ctry.geo_region_id LIKE '" + getValidRestVal(geoRegionId) + "'";
	var dvId = console.getFieldValue('project.dv_id').trim();
	if (dvId != '') restriction += " AND project.dv_id LIKE '" + getValidRestVal(dvId) + "'";
	var dpId = console.getFieldValue('project.dp_id').trim();
	if (dpId != '') restriction += " AND project.dp_id LIKE '" + getValidRestVal(dpId) + "'";
	var stateId = console.getFieldValue('bl.state_id').trim();
	if (stateId != '') restriction += " AND (bl.state_id LIKE '" + getValidRestVal(stateId) + "' OR site.state_id LIKE '" + getValidRestVal(stateId) + "')";
	var cityId = console.getFieldValue('bl.city_id').trim();
	if (cityId != '') restriction += " AND (bl.city_id LIKE '" + getValidRestVal(cityId) + "' OR site.city_id LIKE '" + getValidRestVal(cityId) + "')";
	return restriction;
}

function getTimeframeRestriction() {
	var startDateSql = '(CASE WHEN (project.date_commence_work IS NULL OR project.date_target_end IS NULL) THEN project.date_start ELSE project.date_commence_work END)';
	var endDateSql = '(CASE WHEN (project.date_commence_work IS NULL OR project.date_target_end IS NULL) THEN project.date_end ELSE project.date_target_end END)';
	var from_year = $('from_year').value;
	var to_year = $('to_year').value;
	timeframeRestriction = " AND (";
	timeframeRestriction += "(${sql.yearOf('" + startDateSql + "')} <= "+from_year+" AND ${sql.yearOf('" + endDateSql + "')} >= "+to_year + ")";
	timeframeRestriction += " OR ";
	timeframeRestriction += "(${sql.yearOf('" + startDateSql + "')} <= "+from_year+" AND ${sql.yearOf('" + endDateSql + "')} >= "+from_year + ")";
	timeframeRestriction += " OR ";
	timeframeRestriction += "(${sql.yearOf('" + startDateSql + "')} <= "+to_year+" AND ${sql.yearOf('" + endDateSql + "')} >= "+to_year + ")";
	timeframeRestriction += " OR ";
	timeframeRestriction += "(${sql.yearOf('" + startDateSql + "')} >= "+from_year+" AND ${sql.yearOf('" + endDateSql + "')} <= "+to_year + ")";
	timeframeRestriction += ") ";
	return timeframeRestriction;
}

function validateYear(iFromTo)
{
  var dToday = new Date();

  if ($('from_year')) {
    var iFromYear = parseInt($('from_year').value);
    var iToYear = parseInt($('to_year').value);
    if(iFromTo == 1) // From
    {
      if(!iFromYear)
      {
        iFromYear = dToday.getFullYear();
        $('from_year').value = iFromYear;
      }
      else if(iFromYear > iToYear)
      {
        $('from_year').value = iToYear;
      }
    }
    else // To
    {
      if(!iToYear)
      {
        iToYear = iFromYear+10;
        $('to_year').value = iToYear;
      }
      else if(iToYear < iFromYear)
      {
        $('to_year').value = iFromYear;
      }
    }
  }
}

function openInfoDialog() {
	var controller = View.controllers.get('projMngProjs');
	var accessLevel = controller.accessLevel;
	if (accessLevel == 'executive') View.openDialog('ab-proj-mng-projs-info.axvw');
	else View.openDialog('ab-proj-mng-projs-info-mgr.axvw');
}
