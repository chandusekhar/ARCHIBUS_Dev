Ab.namespace('allocCost');

Ab.allocCost.Wizard = Base.extend({

	blId:"",
	dateReport:"",

	constructor: function() {
	    this.blId = "";
	},

	reset: function(){
	    this.blId = "";
	},

	setBl: function(blId){
		this.blId = blId;
	},

	getBl: function(){
		return this.blId;
	},

	setDateReport: function(dateVal){
		this.dateReport = dateVal;
	},

	getDateReport: function(){
		return this.dateReport;
	}

});

var allocWizardController = View.createController('allocWizard',{
	afterViewLoad: function() {
		this.tabs.wizard = new Ab.allocCost.Wizard();
		this.tabs.addEventListener('afterTabChange', afterTabChange);
		this.tabs.addEventListener('beforeTabChange', beforeTabChange);
		
		//this.tabs.setTabRestriction('page1','cost_tran_recur_id = null');
		//this.tabs.setTabRestriction('page2','gp_id = null');
		//this.tabs.setTabRestriction('page3','gp_id = null');
		//this.tabs.setTabRestriction('page4','gp_id = null');
    },

	navigateToTab: function(selectedTab){
		this.tabs.selectTab(selectedTab);
	}
});

function beforeTabChange(tabPanel, currentTabName, newTabName){
	var wizard = tabPanel.wizard;

	if(currentTabName == 'page0'){
		View.controllers.get('allocSelectBl').saveData();
		if (!valueExistsNotEmpty(wizard.getBl())) {
			View.showMessage(getMessage('error_bl_id'));		
			return false;
		}
	}
	if (((currentTabName == 'page0') || (currentTabName == 'page1') || (currentTabName == 'page2')) && ((newTabName == 'page3') || (newTabName == 'page4'))) {
		if (!checkConsoleFields()) {
			return false;
		}
	}
}

function afterTabChange(tabPanel, selectedTabName){

	if(selectedTabName == 'page0'){
		View.controllers.get('allocSelectBl').restoreSelection();
	}else if(selectedTabName == 'page1'){
		View.controllers.get('allocListCost').restoreSelection();
	}else if(selectedTabName == 'page2'){
		matchReviewDate();
		View.controllers.get('allocListGroupCost').restoreSelection();
	}else if(selectedTabName == 'page3'){
		View.controllers.get('allocCostPie').restoreSelection();
	}else if(selectedTabName == 'page4'){
		View.controllers.get('allocDpDv').restoreSelection();
	}
}
