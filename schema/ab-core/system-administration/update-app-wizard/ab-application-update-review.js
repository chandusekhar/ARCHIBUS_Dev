var appUpdReviewController = View.createController('appUpdReview',{
	openerPanel:null,
	openerController:null,
	afmBase: null,

	afterInitialDataFetch: function(){
		this.openerPanel = View.getOpenerView().panels.get('appUpdWizTabs');
		$('third_option_label').innerHTML = getMessage("third_option");
		
		AppUpdateWizardService.getArchibusPath({
	        callback: function(basePath) {
				setAfmBase(basePath);
	        },
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	appUpdReview_onBack: function(){
		View.getView("parent");
		this.openerPanel.showTab('wizardTabs_6', true);
		this.openerPanel.selectTab('wizardTabs_6');
		this.openerPanel.setTabEnabled('wizardTabs_7', false);
	},
	
	updateTab: function(deployType){
		switch(deployType){
			case "staging_server":
							$('message_label').innerHTML = getMessage("message_staging_server").replace('extentionFilePath', this.afmBase + '\\mysite-extensions.war');
							$('third_option_label').innerHTML = '';
							break;
			case "production_server":
							$('message_label').innerHTML = getMessage("message").replace('basePath', this.afmBase);
							$('next_label').innerHTML = getMessage("next");
							$('first_option_label').innerHTML = getMessage("first_option").replace('basePath', this.afmBase);
							$('second_option_label').innerHTML = getMessage("second_option_if_enterprise_prod_server");
							$('third_option_label').innerHTML = getMessage("third_option");
							break;
			case "workgroup":
							$('message_label').innerHTML = getMessage("message").replace('basePath', this.afmBase);
							$('next_label').innerHTML = getMessage("next");
							$('first_option_label').innerHTML = getMessage("first_option").replace('basePath', this.afmBase);
							$('second_option_label').innerHTML = getMessage("second_option");
							$('third_option_label').innerHTML = getMessage("third_option");
							break;
		}
	}
});
function setAfmBase(basePath){
	appUpdReviewController.afmBase = basePath;
	var deployType = View.getView("parent").controllers.items[0].deployType;
	appUpdReviewController.updateTab(deployType);
}

