/**
* @author Zhang Yi
*/
var abCompDocLibController = View.createController('abCompDocLibController',{

	//current selected document lib
	doc: "",

	//variables indicates current view is manage view or report view
	mode: "manage",
 
	//variables indicates whether need to refresh Select Grid in first tab
	needRefreshSelectList: false, 

	//variables indicates whether the sub tab is refreshed after select changed
	refreshedTab: {}, 

	//Map of controllers of sub tab by using tab name as key
	tabCtrl:{},

	// name of first select tab
	selectTabName: "selectDoc",

	// name of second define tab
	defineTabName: "defineDoc",

	// name of first select tab
	selectTabCtrlId: "abCompDocLibSelectController",

	// name of first select tab
	defineTabCtrlId: "abCompDocLibFormController",

	/**
	 * @inherit
	 */
	afterViewLoad: function(){
		//initially disable the second "Define Document" tab
		this.compDocTabs.enableTab(this.defineTabName,false);
		
		//initial variables
		this.initialTabCtrl();
		this.initialTabRefreshed();

		//bind  event listener "afterTabChange". 
		this.compDocTabs.addEventListener('afterTabChange', afterTabChange);
	},

   /**
 * Initial signs of refreshedTab
 */
   initialTabRefreshed: function(){
		this.refreshedTab[this.defineTabName] = false;
   },

   /**
 * Initial controllers Map of sub tabs
 */
   initialTabCtrl: function(){
		this.tabCtrl[this.selectTabName] = this.selectTabCtrlId;
		this.tabCtrl[this.defineTabName] = this.defineTabCtrlId;
   },

/**
 * Called from second tab when save any changes in "Define Document" form;
 * set refresh sign of first tab to be true. 
 */
   onSaveChange: function(){
		this.needRefreshSelectList = true;
   },

/**
 * Called from first tab when click "Add New" or "Select" button;
 * select second tab and refresh it.
 */
   selectDefineTab: function(pk){
		//if exists pk id
		if(pk){
			//refresh edit form in second tab with pk value
			this.compDocTabs.selectTab(this.defineTabName, "docs_assigned.doc_id="+pk ,false,true,null);
			this.compDocTabs.refreshTab(this.defineTabName);

		} else {
			//refresh edit form in second tab with new record
			this.compDocTabs.selectTab(this.defineTabName,null,true,true,null);
			this.compDocTabs.refreshTab(this.defineTabName);
		}
   },

/**
 * Called from second tab when click "Cancel" button;
 * select first tab and disable second tab.
 */
   selectFirstTab: function(pk){
		this.compDocTabs.selectTab(this.selectTabName);
		this.compDocTabs.enableTab(this.defineTabName,false);
   }

});

/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function afterTabChange(tabPanel, currentTabName){

	var currentTab = tabPanel.findTab(currentTabName);
	var controller = abCompDocLibController;

	//when content of tab is loaded
	if(currentTab.isContentLoaded){	

		//if currently select first tab
		if(currentTabName==controller.selectTabName){
			 //if sign needRefreshSelectList is true
			if(controller.needRefreshSelectList){
				 //refresh the select list in first tab
				var selectControl = currentTab.getContentFrame().View.controllers.get(controller.tabCtrl[currentTabName] );
				if(selectControl){
					selectControl.refreshGrid();
					controller.needRefreshSelectList = false;
				}
			}
		}
	}
}