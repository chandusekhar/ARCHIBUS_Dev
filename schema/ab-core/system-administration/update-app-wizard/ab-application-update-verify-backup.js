var appUpdVerifyBackupController = View.createController('appUpdVerifyBackup',{
	openerPanel:null,
	openerController:null,
	ctrlTabs: null,
	
	afterInitialDataFetch: function(){
		this.openerController = View.getOpenerView().controllers.get('updAppWizard');
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
		
		AppUpdateWizardService.getArchibusPath({
	        callback: function(basePath) {
				setAfmBase(basePath);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	
	appUpdVerifyBackup_onNext: function(){
		this.openerPanel.setTabEnabled('wizardTabs_0', false);
		this.openerPanel.showTab('wizardTabs_1', true);
		this.openerPanel.selectTab('wizardTabs_1');
	}
});

function setAfmBase(basePath){
	$('schema_path').innerHTML = basePath +'\\schema ';
	$('projects_path').innerHTML = basePath +'\\projects ';
}


