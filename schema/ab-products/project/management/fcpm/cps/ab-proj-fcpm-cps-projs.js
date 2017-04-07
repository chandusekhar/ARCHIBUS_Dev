var projFcpmCpsProjsController = View.createController('projFcpmCpsProjs',{
	consoleRestriction: " project.is_template = 0 ",
	statusRestriction: " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') ",
	collapsed: true,
	moreFields: new Array('project.project_type','project.project_id','program.program_type','project.program_id','ctry.geo_region_id','bl.ctry_id','bl.state_id','bl.city_id','project.site_id', 'project.bl_id', 'project.dv_id', 'project.dp_id', 'project.contact_id', 'project.dept_contact', 'project.requestor'),
	menuAlerts: new Array('chgPendApprv', 'invPendApprv'),
	
    afterViewLoad: function() {
    	var layout = View.getLayoutManager('main');
		layout.setRegionSize('north', 100);
		
    	var grid = this.projFcpmCpsProjs_projects;
    	
    	grid.afterCreateCellContent = function(row, column, cellElement) {
    	    var value = row[column.id + '.raw'];
    		if (column.id == 'project.pct_claims' && value != '' && value > 110)	{
    			cellElement.style.background = '#ff7733';//Orange
    			//cellElement.style.color = 'Red';
    		} else {
    			cellElement.style.background = 'transparent';
    			//cellElement.style.color = 'Black';
    		}
    	}
    },
	
	afterInitialDataFetch: function(){   	
    	var titleObjAlerts = Ext.get('alerts');
        titleObjAlerts.on('click', this.showAlertsMenu, this, null);
        
        this.projFcpmCpsProjs_filter_onClear();
        this.projFcpmCpsProjs_filter_showMoreFields(false);
        var selectedProjectId = this.view.getOpenerView().controllers.get('projFcpmCps').project_id;
        if (valueExistsNotEmpty(selectedProjectId)) {
        	var ctx = {restriction: {'project.project_id': selectedProjectId}};
        	this.projFcpmCpsProjs_projects_onOpenProjectDash(ctx);
        }
        
    },
    
    showAlertsMenu: function(e, item){
    	this.showMenu(e, this.menuAlerts, this.onAlertsButtonPush);
    },

	showMenu: function(e, menuArr, handler){
		this.projFcpmCpsProjsAlert_ds.addParameter('projRestriction', this.consoleRestriction + ' AND ' + this.statusRestriction);
		var records = this.projFcpmCpsProjsAlert_ds.getRecords();
		var menuItems = [];
		if (!records || records.length == 0) {
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('noAlerts'),
				handler: null});

			menuItems.push(menuItem);
		}
		else {
			for(var i = 0; i < records.length; i++){
				var record = records[i];
				if (record.getValue('project.alert_count') < 1) continue;
				var menuItem = null;
				menuItem = new Ext.menu.Item({
					text: record.getValue('project.alert_msg'),
					handler: handler.createDelegate(this, [record.getValue('project.alert_id')])});
	
				menuItems.push(menuItem);
			}
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
	},
	
	onAlertsButtonPush: function(menuItemId){
		var parameters = {};
		parameters.projRestriction = this.consoleRestriction + ' AND ' + this.statusRestriction;
		var viewName = '';
		switch(menuItemId) {
		case '1':
			viewName = 'ab-proj-fcpm-cps-projs-alert-chg.axvw';
			break;
		case '2':
			viewName = 'ab-proj-fcpm-cps-projs-alert-inv.axvw';
			break;
		}
		View.openDialog(viewName, null, false, {
	        width: 1200,
	        height: 800,
	        closeButton: true,
	        drilldownParameters: parameters
	    });
	},

    projFcpmCpsProjs_filter_onClear: function() {
    	$('projFcpmCpsProjs_filter_status').value = 'all';
    	this.projFcpmCpsProjs_filter.clear();
    	this.projFcpmCpsProjs_filter_onFilter();
    },
    
    projFcpmCpsProjs_filter_onFilter: function() {
    	var status = $('projFcpmCpsProjs_filter_status').value;
    	this.projFcpmCpsProjs_filter_onShowMyProjs();
    	this.projFcpmCpsProjs_setStatusRestriction(status);
    	if (!this.collapsed) {	
    		this.consoleRestriction = this.consoleRestriction + ' AND ' + getConsoleRestrictionForProjects();
    	}
    	this.projFcpmCpsProjs_projects.addParameter('projectsRestriction', this.consoleRestriction);
		this.projFcpmCpsProjs_projects.restriction = this.statusRestriction;
		this.projFcpmCpsProjs_projects.refresh();
    },
    
    projFcpmCpsProjs_filter_onToggleMoreFields: function(panel, action) {
    	this.projFcpmCpsProjs_filter_showMoreFields(this.collapsed);
    	this.collapsed = !this.collapsed;
    	action.setTitle(this.collapsed ?
                getMessage('filterMore') : getMessage('filterLess'));
    },
    
    projFcpmCpsProjs_filter_showMoreFields: function(show) {
    	var layout = View.getLayoutManager('main');
    	if (show) layout.setRegionSize('north', 175);
    	else layout.setRegionSize('north', 100);
    	for (var i=0; i < this.moreFields.length; i++) {
    		this.projFcpmCpsProjs_filter.showField(this.moreFields[i], show);
    	}
    },
    
    projFcpmCpsProjs_filter_afterRefresh: function() {
    	this.projFcpmCpsProjs_filter.clear();
    	this.projFcpmCpsProjs_projects.refresh();
    },
    
    projFcpmCpsProjs_filter_onShowMyProjs: function() {
    	var em_id = View.user.employee.id;
    	this.consoleRestriction = " project.is_template = 0 AND (project.proj_mgr = '" + getValidRestVal(em_id) + "' OR project.apprv_mgr1 = '" + getValidRestVal(em_id) + "') ";
    	this.statusRestriction = " project.status NOT IN ('Created') AND project.status NOT LIKE ('Requested%') "; 
    	this.projFcpmCpsProjs_filter.setTitle(getMessage('myProjects'));
    },
    
    projFcpmCpsProjs_setStatusRestriction: function(status) {
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
    	case 'all':
    		break;
    	}
    },
	
	projFcpmCpsProjs_projects_onOpenProjectDash: function(obj) {
		var project_id = obj.restriction['project.project_id'];
		this.openProjectDash(project_id, 'projFcpmCpsDash', null, null);
    },
    
    openProjectDash: function(project_id, tabName, nestedTabName, pkgRestriction) {
    	var openerController = View.getOpenerView().controllers.get('projFcpmCps');
    	openerController.project_id = project_id;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', openerController.project_id);
    	var record = this.projFcpmCpsProjsDs.getRecord(restriction);
    	var project_name = record.getValue('project.project_name');
    	openerController.project_name = project_name;
    	var title = "[" + project_id + "] ";
		if (project_name != '') title += project_name;
    	openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsDash', project_id);
    	openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', getMessage('defaultPkgTabTitle'));
    	
    	openerController.projFcpmCpsTabs.enableTab('projFcpmCpsDash', true);
    	openerController.projFcpmCpsTabs.enableTab('projFcpmCpsPkg', false);
    	openerController.projFcpmCpsTabs.setTabRestriction('projFcpmCpsDash', restriction);

    	if (tabName == 'projFcpmCpsPkg') {
    		selectNestedTab(openerController.projFcpmCpsTabs, 'projFcpmCpsPkg', openerController.projFcpmCpsPkgTabs, nestedTabName, pkgRestriction);
    		var work_pkg_id = pkgRestriction.findClause('work_pkgs.work_pkg_id').value;
    		openerController.projFcpmCpsTabs.setTabTitle('projFcpmCpsPkg', work_pkg_id);
    	} else openerController.projFcpmCpsTabs.selectTab(tabName, restriction);
    }
});

function getConsoleRestrictionForProjects() {
	var restriction = " project.is_template = 0 ";
	var console = View.panels.get('projFcpmCpsProjs_filter');
	var projectId = console.getFieldValue('project.project_id').trim();
	if (projectId != '') restriction += " AND project.project_id LIKE '" + getValidRestVal(projectId) + "'";
	var contactId = console.getFieldValue('project.contact_id').trim();
	if (contactId != '') restriction += " AND project.contact_id LIKE '" + getValidRestVal(contactId) + "'";
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


