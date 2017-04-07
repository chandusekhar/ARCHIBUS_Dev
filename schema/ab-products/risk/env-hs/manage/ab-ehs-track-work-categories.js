/**
 * Controller for the entire [Track Work Categories] view
 */
var abEhsTrackWorkCategoriesCtrl = View.createController('abEhsTrackWorkCategoriesCtrl', {
	afterViewLoad: function(){
		this.abEhsTrackWorkCategories_panelTree.setTreeNodeConfigForLevel(0,           		
				[{fieldName: 'work_categories.work_category_id'},   						
	             {fieldName: 'work_categories.description', length: 50}]);
	},
	
	afterInitialDataFetch: function(){
		this.hideTabs();
	},
	
	hideTabs: function(){
		this.abEhsTrackWorkCategories_tabs.hideTab("abEhsTrackWorkCategories_tab0");
		this.abEhsTrackWorkCategories_tabs.hideTab("abEhsTrackWorkCategories_tab1");
		this.abEhsTrackWorkCategories_tabs.hideTab("abEhsTrackWorkCategories_tab2");
	},
	
	showTabsForSelectedWorkCategory: function(commandObj){
		// get the selected work category id
		var work_categ = commandObj.restriction.clauses[0].value;
		
		// show the tabs
		this.abEhsTrackWorkCategories_tabs.showTab("abEhsTrackWorkCategories_tab0", true);
		this.abEhsTrackWorkCategories_tabs.showTab("abEhsTrackWorkCategories_tab1", true);
		this.abEhsTrackWorkCategories_tabs.showTab("abEhsTrackWorkCategories_tab2", true);
		
		// set restriction to tabs
		this.abEhsTrackWorkCategories_tabs.setTabRestriction("abEhsTrackWorkCategories_tab0", new Ab.view.Restriction({"ehs_work_cat_training.work_category_id": work_categ}));
		this.abEhsTrackWorkCategories_tabs.setTabRestriction("abEhsTrackWorkCategories_tab1", new Ab.view.Restriction({"ehs_work_cat_ppe_types.work_category_id": work_categ}));
		this.abEhsTrackWorkCategories_tabs.setTabRestriction("abEhsTrackWorkCategories_tab2", new Ab.view.Restriction({"ehs_work_cat_med_mon.work_category_id": work_categ}));
		
		// select first tab: Training
		var trainingTab = this.abEhsTrackWorkCategories_tabs.selectTab("abEhsTrackWorkCategories_tab0");

		// find the other 2 tabs: PPE and Medical Monitoring
		var ppeTab = this.abEhsTrackWorkCategories_tabs.findTab("abEhsTrackWorkCategories_tab1");
		var medTab = this.abEhsTrackWorkCategories_tabs.findTab("abEhsTrackWorkCategories_tab2");
		
		// hide the form panels of the 3 tabs
		if(trainingTab.isContentLoaded){
			trainingTab.getContentFrame().View.panels.get("abEhsTrackWorkCategoriesTraining_form").show(false);
		}
		if(ppeTab.isContentLoaded){
			ppeTab.getContentFrame().View.panels.get("abEhsTrackWorkCategoriesPpe_form").show(false);
		}
		if(medTab.isContentLoaded){
			medTab.getContentFrame().View.panels.get("abEhsTrackWorkCategoriesMedical_form").show(false);
		}
	}
});