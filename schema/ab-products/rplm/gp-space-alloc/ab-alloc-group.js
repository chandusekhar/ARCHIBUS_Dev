Ab.namespace('allocGroup');

Ab.allocGroup.Wizard = Base.extend({

	blId:"",
	flId:"",
	dateReport:"",
	portfolio_scenario_id:"",

	constructor: function() {
	    this.blId = "";
		this.flId = "";
	},

	reset: function(){
	    this.blId = "";
		this.flId = "";
	},

	setBl: function(blId){
		this.blId = blId;
	},

	getBl: function(){
		return this.blId;
	},

	setFl: function(flId){
		this.flId = flId;
	},

	getFl: function(){
		return this.flId;
	},

	setDateReport: function(dateVal){
		this.dateReport = dateVal;
	},

	getDateReport: function(){
		return this.dateReport;
	},

	setPortfolioScenario: function(scenarioVal){
		this.portfolio_scenario_id = scenarioVal;
	}

});

var allocWizardController = View.createController('allocWizard',{
	afterViewLoad: function() {
		this.tabs.wizard = new Ab.allocGroup.Wizard();
		this.tabs.addEventListener('afterTabChange', afterTabChange);
		this.tabs.addEventListener('beforeTabChange', beforeTabChange);
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
	if(currentTabName == 'page1'){
		View.controllers.get('allocSelectFl').saveData();
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
		View.controllers.get('allocSelectFl').restoreSelection();
	}else if(selectedTabName == 'page2'){
		View.controllers.get('allocListGroup').restoreSelection();
	}else if(selectedTabName == 'page3'){
		View.controllers.get('allocStack').restoreSelection();
	}else if(selectedTabName == 'page4'){
		View.controllers.get('allocDpDv').restoreSelection();
	}
}
