var dashDefSelectActivityController = View.createController('dashDefSelectActivity', {
	activityRow:null,
	activityId:null,
	afterInitialDataFetch: function(){
		//sql restriction
		var restriction = 'EXISTS(SELECT * FROM afm_processes WHERE afm_activities.activity_id = afm_processes.activity_id AND afm_processes.process_type IN (\'WEB-DASH\'))';
		this.applyLicenseRestriction(restriction);	
		//apply restriction and refresh grid
		//this.activityGrid.refresh(restriction);
		
		this.activityGrid.isCollapsed = false;
		this.activityGrid.showIndexAndFilter();
		this.activityGrid.enableSelectAll(false);	
	},
	
	applyLicenseRestriction: function(restriction){
		var controller = this;
  	AdminService.getProgramLicense({
			callback: function(license) {
				var licenseIds = [];
				var licenses = license.licenses;
				var licenseRestriction = (licenses.length == 0) ? '' : ' AND afm_activities.activity_id IN ( ';
				for(i in licenses){
					licenseIds.push(licenses[i].id);//
					licenseRestriction += "'" + licenses[i].id + "', ";
				}
				if(licenseRestriction.length > 0){
					licenseRestriction  = licenseRestriction.slice(0, licenseRestriction.length-2) + ')';
				}

				restriction = restriction.slice(0, restriction.length-1) + licenseRestriction + ')';
				controller.activityGrid.refresh(restriction);
			},				
			errorHandler: function(m, e) {
				View.showException(e);
			}
		});	
	}, 
	
	activityGrid_onReloadAll: function(){
		if(this.activityRow != null){
			this.activityRow.select(false);
			this.activityRow = null;
			this.activityId = null;
		}
		//sql restriction
		var restriction = 'EXISTS(SELECT * FROM afm_processes WHERE afm_activities.activity_id = afm_processes.activity_id AND afm_processes.process_type IN (\'WEB\', \'WEB-DASH\'))';
		//apply restriction and refresh grid
		this.activityGrid.refresh(restriction);
	},
	activityGrid_onReload: function(){
		if(this.activityRow != null){
			this.activityRow.select(false);
			this.activityRow = null;
			this.activityId = null;
		}
		//sql restriction
		var restriction = 'EXISTS(SELECT * FROM afm_processes WHERE afm_activities.activity_id = afm_processes.activity_id AND afm_processes.process_type IN (\'WEB-DASH\'))';
		//apply restriction and refresh grid
		this.activityGrid.refresh(restriction);
	},
	activityGrid_onNext: function(){
		if(this.activityRow == null){
			View.showMessage(getMessage('error_no_activity_id'));
			return;
		}
		this.saveData();
		View.controllers.get('dashDefWizard').navigateToTab('page1');
	},	
	activityGrid_multipleSelectionColumn_onClick: function(row){
		var isSelected = row.isSelected();
		this.activityRow = null;
		this.activityGrid.selectAll(false);
		if (isSelected) {
			row.select(isSelected);
			this.activityRow = row;
		}
	},
	restoreSelection:function(){
		this.activityId = this.tabs.wizard.getActivity();
		for(var i=0;i<this.activityGrid.gridRows.getCount();i++){
			this.activityGrid.gridRows.get(i).select(false);
			if(this.activityId == this.activityGrid.gridRows.get(i).getFieldValue('afm_activities.activity_id')){
				this.activityRow = this.activityGrid.gridRows.get(i);
				this.activityRow.select(true);
				break;
			}
		}
	},
	saveData: function(){
		if(this.activityRow != null && this.tabs.wizard.getActivity() != this.activityRow.getFieldValue('afm_activities.activity_id')){
			this.tabs.wizard.setActivity(this.activityRow.getFieldValue('afm_activities.activity_id'));
			this.tabs.wizard.setProcess(null);
			this.tabs.wizard.setDashboardLayout(null);
			this.tabs.wizard.setDashboardImage(null);
			this.tabs.wizard.setDashboardFile(null);
		}else if(this.activityRow == null){
			this.tabs.wizard.setActivity(null);
			this.tabs.wizard.setProcess(null);
			this.tabs.wizard.setDashboardLayout(null);
			this.tabs.wizard.setDashboardImage(null);
			this.tabs.wizard.setDashboardFile(null);
		}
	}
});
