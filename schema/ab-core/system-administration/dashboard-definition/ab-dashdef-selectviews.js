var dashDefSelectViewsController = View.createController('dashDefSelectViews',{
	activityId:null,
	processId:null,
	dashboardLayout:null,
	dashboardImage:null,
	dashboardFile:null,
	displayOrders:new Array('A','B','C','D','E','F','G','H','I','J','K','L'),
	licenseMenu:null,
	processLicenseLevel:null,
	afterInitialDataFetch: function(){
		this.availableViewsGrid.isCollapsed = false;
		this.availableViewsGrid.showIndexAndFilter();
	},
	/*
	availableViewsGrid_onShowAllLicenseTypes: function(){
		var restriction = "afm_ptasks.process_id IN (SELECT afm_processes.process_id FROM afm_processes WHERE afm_processes.process_type IN ('WEB','WEB-DASH')) AND afm_ptasks.task_type != 'LABEL' AND afm_ptasks.task_file like '%.axvw' AND afm_ptasks.task_file NOT like 'pagereports%.axvw' AND afm_ptasks.is_hotlist = 0";
		this.availableViewsGrid.refresh(restriction);
	},
	availableViewsGrid_onShowRestrictedLicenseTypes: function(){				
		this.applyLicenseRestriction();
	},
	*/
	applyLicenseRestriction: function(){
		var op = '<=';
		var value = this.processLicenseLevel;

		if(this.processLicenseLevel.match(/AbCoreLevel4Activity/gi)){
			value = 'N/A';
		}		
				
		var restriction = "afm_ptasks.process_id IN (SELECT afm_processes.process_id FROM afm_processes WHERE afm_processes.process_type IN ('WEB','WEB-DASH')) AND afm_ptasks.task_type != 'LABEL' AND afm_ptasks.task_file like '%.axvw' AND afm_ptasks.task_file NOT like 'pagereports%.axvw' AND afm_ptasks.is_hotlist = 0 AND afm_processes.license_level " + op + " '" + value + "'";

		var controller = this;
		AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				var licenseRestriction = (licenses.length == 0) ? '' : ' AND afm_ptasks.activity_id IN ( ';
				for(i in licenses){
					licenseIds.push(licenses[i].id);
					licenseRestriction += "'" + licenses[i].id + "', ";
				}
				if(licenseRestriction.length > 0){
					licenseRestriction  = licenseRestriction.slice(0, licenseRestriction.length-2) + ')';
				}
				restriction += licenseRestriction;
				controller.availableViewsGrid.refresh(restriction);
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});
		
		//this.availableViewsGrid.refresh(restriction);
	},			
	viewsGrid_up_onClick: function(row){
		var currentIndex = row.getIndex();
		if(currentIndex == 0){
			View.showMessage(getMessage('error_up_first'));
			return;
		}
		this.viewsGrid.moveGridRow(currentIndex, currentIndex-1);
		this.viewsGrid.update();
		this.updateOrder();
	},
	viewsGrid_down_onClick: function(row){
		var currentIndex = row.getIndex();
		if(currentIndex == this.viewsGrid.rows.length-1){
			View.showMessage(getMessage('error_down_last'));
			return;
		}
		this.viewsGrid.moveGridRow(currentIndex, currentIndex+1);
		this.viewsGrid.update();
		this.updateOrder();
	},
	viewsGrid_delete_onClick: function(row){
		var gridPanel = this.viewsGrid;
		var currentIndex = row.getIndex();
		var displayOrders = this.displayOrders;
		View.confirm(getMessage('confirm_delete'), function(button){
			if(button == 'yes'){
				gridPanel.removeGridRow(currentIndex);
				gridPanel.update();
				for(var i=0;i<gridPanel.rows.length;i++){
					if(i<displayOrders.length){
						gridPanel.gridRows.get(i).setFieldValue('afm_ptasks.display_order', displayOrders[i], false);
					}else{
						break;
					}
				}
			}
		})
		this.updateOrder();
	},
	availableViewsGrid_add_onClick: function(row){
		var viewsRows = this.viewsGrid.gridRows;
		var record = new Ab.data.Record({
			'afm_ptasks.display_order':'',
			'afm_ptasks.task_id': row.getRecord().getValue('afm_ptasks.task_id'),
			'afm_ptasks.task_file': row.getRecord().getValue('afm_ptasks.task_file'),
			'afm_ptasks.activity_id':this.activityId,
			'afm_ptasks.process_id':this.processId,
			'afm_ptasks.task_type':row.getRecord().getValue('afm_ptasks.task_type')
		},true);
		this.viewsGrid.addGridRow(record);
		this.viewsGrid.update()
		this.updateOrder();
	},
	viewPanel_onSave: function(){
		var rowsId = '';
		var rowsFile = '';
		var rowsOrder = '';
		for(var i=0;i<this.viewsGrid.rows.length;i++){
			rowsOrder += i + '~';
			rowsId += this.viewsGrid.rows[i].row.getFieldValue('afm_ptasks.task_id') + '~';
			rowsFile += this.viewsGrid.rows[i].row.getFieldValue('afm_ptasks.task_file') + '~';
		}
		var parameters = {'rowsOrder':rowsOrder.substr(0, rowsOrder.length -1),
							'rowsId':rowsId.substr(0, rowsId.length -1),
							'rowsFile':rowsFile.substr(0, rowsFile.length -1),
							'activityId':this.activityId,
							'processId':this.processId,
							'dashboardLayout':this.dashboardLayout,
							'callerPlace': '',
							'rowsPanel': ''};
		var result = Workflow.call('AbSystemAdministration-saveDashboard', parameters);
		if(result.data.message == 'message_saved'){
			this.dashboardFile = result.data.viewFileName;
			var fullFileName = result.data.viewFullFileName;
			View.getOpenerView().panels.get('tabs').wizard.setDashboardFile(this.dashboardFile);
			
			enableSavePreview(false);
			this.availableViewsGrid.show(false);
		 			
			var messageElement = Ext.DomHelper.append(this.viewPanel.getMessageCell(), '<p>' + getMessage(result.data.message)+' \n('+ fullFileName+')' + '</p>', true);
			// messageElement.addClass('formMessage');
			messageElement.addClass('text');
			messageElement.setVisible(true, {duration: 1});
			messageElement.setHeight(20, {duration: 1});		
			this.viewsGrid.hideColumn('up');				
			this.viewsGrid.hideColumn('down');	
			this.viewsGrid.hideColumn('delete');	
			this.viewsGrid.update();			
		}else{
			this.dashboardFile = null;
			View.getOpenerView().panels.get('tabs').wizard.setDashboardFile(this.dashboardFile);
			if(result.data.message == "error_file_not_found"){
				var arrIndex = result.data.missing_index.split("~");
				var strFiles = "";
				for(var i=0;i<arrIndex.length-1;i++){
					strFiles += '<br>&#160;&#160;'+this.viewsGrid.rows[arrIndex[i]].row.getFieldValue('afm_ptasks.task_id')+'&#160;&#160;&#160;&#160;';
					strFiles += this.viewsGrid.rows[arrIndex[i]].row.getFieldValue('afm_ptasks.task_file');
				}
				strFiles += "<br>";
				View.showMessage(getMessage(result.data.message).replace('{0}', strFiles));
			}else{
				View.showMessage(getMessage(result.data.message));
			}
		}
	},
	viewPanel_onPreview: function(){
		var rowsId = '';
		var rowsFile = '';
		var rowsOrder = '';
		for(var i=0;i<this.viewsGrid.rows.length;i++){
			rowsOrder += i + '~';
			rowsId += this.viewsGrid.rows[i].row.getFieldValue('afm_ptasks.task_id') + '~';
			rowsFile += this.viewsGrid.rows[i].row.getFieldValue('afm_ptasks.task_file') + '~';
		}
		var parameters = {'rowsOrder':rowsOrder.substr(0, rowsOrder.length -1),
							'rowsId':rowsId.substr(0, rowsId.length -1),
							'rowsFile':rowsFile.substr(0, rowsFile.length -1),
							'activityId':this.activityId,
							'processId':this.processId,
							'dashboardLayout':this.dashboardLayout};
		var result = Workflow.call('AbSystemAdministration-previewDashboard', parameters);
		if (result.data.message == 'message_saved') {
			this.dashboardFile = result.data.viewFileName;
			View.getOpenerView().panels.get('tabs').wizard.setDashboardFile(this.dashboardFile);
		    View.openDialog(this.dashboardFile, '', false, {
		        width: 1024,
		        height: 768
		    });	
		}else{
			this.dashboardFile = null;
			View.getOpenerView().panels.get('tabs').wizard.setDashboardFile(this.dashboardFile);
			if(result.data.message == "error_file_not_found"){
				var arrIndex = result.data.missing_index.split("~");
				var strFiles = "";
				for(var i=0;i<arrIndex.length-1;i++){
					strFiles += '<br>&#160;&#160;'+this.viewsGrid.rows[arrIndex[i]].row.getFieldValue('afm_ptasks.task_id')+'&#160;&#160;&#160;&#160;';
					strFiles += this.viewsGrid.rows[arrIndex[i]].row.getFieldValue('afm_ptasks.task_file');
				}
				strFiles += "<br>";
				View.showMessage(getMessage(result.data.message).replace('{0}', strFiles));
			}else{
				View.showMessage(getMessage(result.data.message));
			}
		}
	},
	viewPanel_onComplete: function(){
		
		// enable buttons
		enableSavePreview(true);
		
		// show the panel
		this.availableViewsGrid.show(true);
		this.viewsGrid.showColumn('up', true);				
		this.viewsGrid.showColumn('down', true);	
		this.viewsGrid.showColumn('delete', true);	
		this.viewsGrid.update();	
				
		// clear save message
		var messageCell = this.viewPanel.getMessageCell();
		messageCell.dom.innerHTML = '';
		View.controllers.get('dashDefSelectViews').activityId = null;
		View.controllers.get('dashDefSelectViews').processId = null;
		View.controllers.get('dashDefSelectViews').dashboardLayout = null;
		View.controllers.get('dashDefSelectViews').dashboardImage = null;
		View.controllers.get('dashDefSelectViews').dashboardFile = null;
		View.controllers.get('dashDefSelectViews').processLicenseLevel = null;
				
		// reset parameters
		View.getOpenerView().panels.get('tabs').wizard.reset();
		View.getOpenerView().controllers.get('dashDefSelectActivity').activityId = null;
		View.getOpenerView().controllers.get('dashDefSelectActivity').activityRow.select(false);
		View.getOpenerView().controllers.get('dashDefSelectActivity').activityRow = null;
		View.getOpenerView().controllers.get('dashDefOrderProcesses').processRow = null;
		View.getOpenerView().controllers.get('dashDefOrderProcesses').processId = null;
		View.getOpenerView().controllers.get('dashDefSelectActivity').restoreSelection();
		View.getOpenerView().controllers.get('dashDefOrderProcesses').restoreSelection();
		View.getOpenerView().controllers.get('dashDefLayout').restoreSelection();
		View.getOpenerView().controllers.get('dashDefWizard').navigateToTab('page0');
	},	
	restoreSelection: function(){
		var wizard = View.getOpenerView().panels.get('tabs').wizard;
		this.activityId = wizard.getActivity();
		this.processId = wizard.getProcess();
		this.dashboardLayout = wizard.getDashboardLayout();
		this.dashboardImage = wizard.getDashboardImage();
		this.dashboardFile = wizard.getDashboardFile();
		this.processLicenseLevel = wizard.getProcessLicenseLevel();

		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_ptasks.activity_id', this.activityId, '=');
		restriction.addClause('afm_ptasks.process_id', this.processId, '=');
		restriction.addClause('afm_ptasks.task_type', 'LABEL', '!=');
		restriction.addClause('afm_ptasks.task_file', '%.axvw', 'LIKE');
		restriction.addClause('afm_processes.license_level', this.processLicenseLevel, '=');
		this.viewsGrid.refresh(restriction);
		document.getElementById('dashboard_image').innerHTML = '<img src="'+this.dashboardImage+'"/>';
		this.updateOrder();
		this.applyLicenseRestriction();
	},
	updateOrder: function(){
		for(var i=0;i<this.viewsGrid.rows.length;i++){
			if(i<this.displayOrders.length){
				this.viewsGrid.gridRows.get(i).setFieldValue('afm_ptasks.display_order', this.displayOrders[i], false);
			}else{
				break;
			}
		}
	}
});

function getIndexOf(collection, object){
	var result = -1;
	try{
		for(var i=0;i<collection.getCount();i++)
			if(collection.get(i) == object)
				result = i;
	}catch(e){
		for(var i=0;i<collection.length;i++)
			if(collection[i] == object)
				result = i;
	}
	return (result);
}

function enableSavePreview(status) {
    var grid = View.panels.get('viewPanel');
    
    var saveAction = grid.actions.get('save');
    saveAction.enable(status);   
    
    var previewAction = grid.actions.get('preview');
    previewAction.enable(status);  
}
