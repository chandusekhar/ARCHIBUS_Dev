var projLegacyImportController = View.createController('projLegacyImport', {
	project_id : '',
	
	connectorExecuteJob: 'AbSystemAdministration-ConnectorJob-executeConnector',
	job_id: 0,
	
	// pull-down menu entries
	menuFiles: new Array('file1','file2'),
	
	afterViewLoad: function() {
    	var currentYear = new Date().getFullYear();
		var year = currentYear - 10;
		if($('year')){
			for (var i = 0; i < 20 ;i++) {
				var option = new Option(year, year);
				$('year').options.add(option);
				year++;
			}
		}
	},
	
    afterInitialDataFetch: function(){	
    	var titleObjImportFile = Ext.get('importFile');
        titleObjImportFile.on('click', this.showImportFileMenu, this, null);
        var titleObjExportFile = Ext.get('exportFile');
        titleObjExportFile.on('click', this.showExportFileMenu, this, null);
    },
    
    showImportFileMenu: function(e, item){
    	this.showMenu(e, this.menuFiles, this.onImportFileButtonPush);
    },
    
    showExportFileMenu: function(e, item){
    	this.showMenu(e, this.menuFiles, this.onExportFileButtonPush);
    },
    
	/*
	 * show pull-down menu.
	 */
	showMenu: function(e, menuArr, handler){
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
	},
	
	onImportFileButtonPush: function(menuItemId){
		if (!connectorsInstalled()) return false;
		
		this.projLegacyImportProj.show(false);
		this.projLegacyImportPkg.show(false);
		this.projLegacyImportInvoice.show(false);

		var controller = this;
		var connector_id = 'PROJMGMT - Import Projects';
		if (menuItemId == 'file2') connector_id = 'PROJMGMT - Import Invoices';	
		
		var progressReportParameters = {};
		progressReportParameters.panelRestriction = null;
	    progressReportParameters.transferAction = "IN";
	    progressReportParameters.viewName = "ab-proj-legacy-import-conn.axvw";
        progressReportParameters.connectorId = connector_id;
        
        View.openDialog('ab-proj-legacy-import-conn-transfer.axvw', null, false, {
            width: 1200,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
	},
	
	onExportFileButtonPush: function(menuItemId){
		if (!connectorsInstalled()) return false;
		
		var controller = this;
		var connector_id = 'PROJMGMT - Export Proj Template';
		if (menuItemId == 'file2') connector_id = 'PROJMGMT - Export Inv Template';
			
		var progressReportParameters = {};
		progressReportParameters.panelRestriction = null;
	    progressReportParameters.transferAction = "OUT";
	    progressReportParameters.viewName = "ab-proj-legacy-import-conn.axvw";
        progressReportParameters.connectorId = connector_id;
        
        View.openDialog('ab-proj-legacy-import-conn-transfer.axvw', null, false, {
            width: 1200,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
	},
	
	projLegacyImportFilter_onShow: function() {
		var consoleRestriction = getConsoleRestrictionForProjects();
		this.projLegacyImportPanel.addParameter('consoleRestriction', consoleRestriction);
		this.projLegacyImportPanel.refresh();
	},
	
	projLegacyImportFilter_onClear: function() {
		this.projLegacyImportFilter.clear();
		$('year').value = 'All';
	}
});

function getConsoleRestrictionForProjects() {
	var restriction = " 1=1 ";
	var console = View.panels.get('projLegacyImportFilter');
	var projectId = console.getFieldValue('project.project_id').trim();
	if (projectId != '') restriction += " AND project.project_id LIKE '" + projectId + "'";
	var projectType = console.getFieldValue('project.project_type').trim();
	if (projectType != '') restriction += " AND project.project_type LIKE '" + projectType + "'";
	var programId = console.getFieldValue('project.program_id').trim();
	if (programId != '') restriction += " AND project.program_id LIKE '" + programId + "'";
	var programType = console.getFieldValue('program.program_type').trim();
	if (programType != '') restriction += " AND program.program_type LIKE '" + programType + "'";
	var siteId = console.getFieldValue('project.site_id').trim();
	if (siteId != '') restriction += " AND (project.site_id LIKE '" + siteId + "' OR bl.site_id LIKE '" + siteId + "')";
	var blId = console.getFieldValue('project.bl_id').trim();
	if (blId != '') restriction += " AND project.bl_id LIKE '" + blId + "'";
	var ctryId = console.getFieldValue('bl.ctry_id').trim();
	if (ctryId != '') restriction += " AND (bl.ctry_id LIKE '" + ctryId + "' OR site.ctry_id LIKE '" + ctryId + "')";
	var geoRegionId = console.getFieldValue('ctry.geo_region_id').trim();
	if (geoRegionId != '') restriction += " AND ctry.geo_region_id LIKE '" + geoRegionId + "'";
	var dateStart = console.getFieldValue('project.date_start').trim();
	if (dateStart != '') restriction += " AND project.date_start >= ${sql.date('"+dateStart+"')}";
	var dateEnd = console.getFieldValue('project.date_end').trim();
	if (dateEnd != '') restriction += " AND project.date_end <= ${sql.date('"+dateEnd+"')}";
	return restriction;
}

function getValidValue(panel, inputFieldName)
{
	var fieldValue = panel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function yearListener() {
	var controller = View.controllers.get('projLegacyImport');
	var year = $('year').value;
	if (year == 'All') {
		controller.projLegacyImportFilter.setFieldValue('project.date_start', '');
		controller.projLegacyImportFilter.setFieldValue('project.date_end', '');
	}
	else {
		controller.projLegacyImportFilter.setFieldValue('project.date_start', year + '-01-01');
		controller.projLegacyImportFilter.setFieldValue('project.date_end', year + '-12-31');
	}
	
}

function dateListener() {
	$('year').value = 'All';
}

function connectorsInstalled() {
	var installed = false;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_tbls.table_name', 'afm_connector');
	var records = View.dataSources.get('projLegacyImportDsTbls').getRecords(restriction);
	if (records.length > 0) installed = true;
	if (!installed) View.showMessage(getMessage('connNotInstalled'));
	return installed;
}

