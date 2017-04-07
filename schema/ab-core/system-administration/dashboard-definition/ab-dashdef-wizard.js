/**
 * declare namespace for Dashboard Definition Wizard
 */
Ab.namespace('dashDefinition');

/**
 * implement js class for wizard
 */

Ab.dashDefinition.Wizard = Base.extend({
	/**
	 * Variable: selected activity Id
	 */
	activityId:null,
	/**
	 * Variable: selected process id
	 */
	processId:null,
	/**
	 * Variable: selected dashboard layout
	 */
	dashboardLayout:null,
	/**
	 * Variable: selected dashboard image
	 */
	dashboardImage:null,
	/**
	 * save the dashboard created file
	 */
	dashboardFile:null,
	/**
	 * save the dashboard created file
	 */	
	processLicenseLevel:null,
	/**
	 * Constructor: creates new wizard object.
	 */
	constructor: function() {
	    this.activityId = null;
	    this.processId = null;
		this.dashboardLayout = null;
		this.dashboardImage = null;
		this.dashboardFile = null;
		this.processLicenseLevel = null;
	},
	reset: function(){
	    this.activityId = null;
	    this.processId = null;
		this.dashboardLayout = null;
		this.dashboardImage = null;
		this.dashboardFile = null;
		this.processLicenseLevel = null;
	},
	/**
	 * Methods: activityId
	 */
	setActivity: function(activityId){
		this.activityId = activityId;
	},
	getActivity: function(){
		return this.activityId;
	},
	/**
	 * Methods: activityId
	 */
	setProcess: function(processId){
		this.processId = processId;
	},
	getProcess: function(){
		return this.processId;
	},
	/**
	 * Methods: dashboardLayout
	 */
	setDashboardLayout: function(dashboardLayout){
		this.dashboardLayout = dashboardLayout;
		if(this.dashboardLayout != null && this.dashboardLayout != ""){
			var image = this.dashboardLayout.substr(0, this.dashboardLayout.length-4);
			image = 'thumbnails/ab-'+image +'gif';
			this.dashboardImage = image;
		}else{
			this.dashboardLayout = null;
			this.dashboardImage = null;
			this.dashboardFile = null;
		}
	},
	getDashboardLayout: function(){
		return this.dashboardLayout;
	},
	/**
	 * Methods: dashboardLayout
	 */
	setDashboardImage: function(dashboardImage){
		this.dashboardImage = dashboardImage;
	},
	getDashboardImage: function(){
		return this.dashboardImage;
	},
	/**
	 * Methods: dashboardFile
	 */
	setDashboardFile: function(dashboardFile){
		this.dashboardFile = dashboardFile;
	},
	getDashboardFile: function(){
		return this.dashboardFile;
	},
	/**
	 * Methods: processLicenseLevel
	 */
	setProcessLicenseLevel: function(processLicenseLevel){
		this.processLicenseLevel = processLicenseLevel;
	},
	getProcessLicenseLevel: function(){
		return this.processLicenseLevel;
	}
});

var dashDefWizardController = View.createController('dashDefWizard',{
	afterViewLoad: function() {
		/**
		 * initialize wizard object
		 */
		this.tabs.wizard = new Ab.dashDefinition.Wizard();
		/**
		 * add event listener
		 */
		this.tabs.addEventListener('afterTabChange', afterTabChange);
		this.tabs.addEventListener('beforeTabChange', beforeTabChange);
		/**
		 * initialize second tab (to empty)
		 */
		this.tabs.setTabRestriction('page1','activity_id = null');
		this.tabs.findTab('page3').loadView();
		
    },
	navigateToTab: function(selectedTab){
		this.tabs.selectTab(selectedTab);
	}
});

function beforeTabChange(tabPanel, currentTabName, newTabName){
	if(currentTabName == 'page0'){
		View.controllers.get('dashDefSelectActivity').saveData();
	}else if(currentTabName == 'page1'){
		View.controllers.get('dashDefOrderProcesses').saveData();
	}else if(currentTabName == 'page2'){
		View.controllers.get('dashDefLayout').saveData();
	}
}

function afterTabChange(tabPanel, selectedTabName){
	var wizard = tabPanel.wizard;
	/**
	 * user must select an activity first
	 */
	if(selectedTabName != 'page0' && !valueExistsNotEmpty(wizard.getActivity())){
		View.showMessage(getMessage('error_activity_id'));
		tabPanel.selectTab('page0');
		return;
	}
	/**
	 * user must select a process name before layout
	 * we check this here 
	 */
	if(selectedTabName == 'page2' && !valueExistsNotEmpty(wizard.getProcess())){
		View.showMessage(getMessage('error_process_id'));
		tabPanel.selectTab('page1');
		return;
	}
	/**
	 * user must select layout before views
	 * we check this here
	 */
	if((selectedTabName == 'page3')&& !valueExistsNotEmpty(wizard.getProcess())){
		View.showMessage(getMessage('error_process_id'));
		tabPanel.selectTab('page1');
		return;
	}
	if((selectedTabName == 'page3')&& !valueExistsNotEmpty(wizard.getDashboardLayout())){
		View.showMessage(getMessage('error_dash_layout'));
		tabPanel.selectTab('page2');
		return;
	}
	var restriction = '';
	if(selectedTabName == 'page0'){
		View.controllers.get('dashDefSelectActivity').restoreSelection();
	}else if(selectedTabName == 'page1'){
		View.controllers.get('dashDefOrderProcesses').restoreSelection();
	}else if(selectedTabName == 'page2'){
		View.controllers.get('dashDefLayout').restoreSelection();
		View.controllers.get('dashDefLayout').loadImages();
	}else if(selectedTabName == 'page3'){
		tabPanel.findTab(selectedTabName).getContentFrame().View.controllers.get('dashDefSelectViews').restoreSelection();
	}
}


