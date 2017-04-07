var appUpdVerifyArchController = View.createController('appUpdVerifyArch',{
	openerPanel:null,
	openerController:null,

	afterInitialDataFetch: function(){
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

	appUpdVerifyArchive_onNext: function(){

		AppUpdateWizardService.isFileExists('archibus.war',{
	        callback: function(fileExists) {
	        	appUpdVerifyArchController.handleTabs(fileExists);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
		
	handleTabs:function(fileExists){
		if (!fileExists){
			View.showMessage(getMessage('check_archibuswar_file'));
			return;
		}
		var deployType = View.getView("parent").controllers.items[0].deployType;
		if (deployType == 'production_server') {
			this.openerPanel.showTab('wizardTabs_4', true);
			this.openerPanel.selectTab('wizardTabs_4');
			this.openerPanel.setTabEnabled('wizardTabs_2', false);
			return;
		}		
		this.openerPanel.showTab('wizardTabs_3', true);
		this.openerPanel.selectTab('wizardTabs_3');
		this.openerPanel.setTabEnabled('wizardTabs_2', false);
	},
	
	appUpdVerifyArchive_onBack: function(){
		this.openerPanel.showTab('wizardTabs_1', true);
		this.openerPanel.selectTab('wizardTabs_1');
		this.openerPanel.setTabEnabled('wizardTabs_2', false);
	}
	
});
function setAfmBase(basePath){
	$('afm_base').innerHTML = basePath+' ';
}