/**
* @author Zhang Yi
*/
var abCompDocLibSelectController = View.createController('abCompDocLibSelectController',{

	//restriction from console
	consoleRes:"1=1",

	//restrcition from left document folder tree
	treeRes:"1=1",
	
	//restriction from list box on panel's title bar
	listOptionRes:" 1=1",

	//list box options 
	listOptions: new Array("all","reg","prog","req","event"),
	//array of restrictions for list box options
	listOptionRestrictions: new Array(),
	
	//top parent controller of current select view
	topCtrl: null,

	/**
	 * Set the grid cell content of doc field to be rewritten after being filled.
	 */
    afterViewLoad: function(){
	    this.abCompDocGrid.afterCreateCellContent = 
			abCompDocCommonController.customAfterCreateCellContentForDoc.createDelegate();

	},

	/**
	 * @inherit
	 */
	afterInitialDataFetch:function(){

		//current is a 'Manage' view
		this.mode = "manage";
		
		//initial list box on title bar of select panel
		this.initialListOptionRestrictions();
		this.initialListBoxOnPanelTitle();
		
		//initial top controller
		this.topCtrl=View.getOpenerView().controllers.get(0);

		//initial refresh the grid
		this.onRefresh(" 1=1 ");
	},

	/**
	* initial restrictions array according to list box options.
	*/
	initialListOptionRestrictions:function(){
		this.listOptionRestrictions[0] = " 1=1 ";
		this.listOptionRestrictions[1] = " docs_assigned.regulation IS NOT NULL and docs_assigned.reg_program IS NULL ";
		this.listOptionRestrictions[2] = " docs_assigned.reg_program IS NOT NULL and docs_assigned.reg_requirement IS NULL ";
		this.listOptionRestrictions[3] = " docs_assigned.reg_requirement IS NOT NULL ";
		this.listOptionRestrictions[4] = " docs_assigned.activity_log_id IS NOT NULL and activity_log.activity_type = 'COMPLIANCE - EVENT' ";
	},

	/**
	* Event Handler of action "Doc"
	*/
	abCompDocGrid_onDoc : function(){
		var	parameters = {};
		parameters.consoleRes = this.consoleRes + " and "+ this.treeRes +" and "+ this.listOptionRes;
		setLocationFieldTitle(parameters);
		View.openPaginatedReportDialog("ab-comp-document-paginate-rpt.axvw" ,null, parameters);
	},

	/**
	* Event Handler of action "Add New"
	*/
	abCompDocGrid_onAddNew : function(){

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//set proper signs of top controller
		this.topCtrl.isAddNew=true;
		this.topCtrl.initialTabRefreshed();

		//Call function of top controller to select and refresh second tab
		this.topCtrl.selectDefineTab();
	},
   
	/**
	 * Events Handler for row action "Edit" in grid 
	 */
	abCompDocGrid_edit_onClick: function(row){

		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}

		//set proper variables and signs of top controller
		var docId =  row.getFieldValue('docs_assigned.doc_id');
		this.topCtrl.doc=docId;
		this.topCtrl.isAddNew=false;
		this.topCtrl.needRefreshRestTab=true;
		this.topCtrl.initialTabRefreshed();

		//Call function of top controller to select and refresh second tab
		this.topCtrl.selectDefineTab(docId);
	},

	/**
	* refresh grid
	*/
	onRefresh:function(res){
		this.consoleRes = res;
		this.abCompDocTree.addParameter("consoleRes",this.consoleRes);
		this.abCompDocTree.refresh();
		this.abCompDocGrid.addParameter("consoleRes",this.consoleRes);
		this.abCompDocGrid.addParameter("treeRes", this.treeRes);
		this.abCompDocGrid.refresh();
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.abCompDocGrid, "compliance_locations.");
	},

	/**
	* refresh grid
	*/
	onClear:function(){
		//clear restriction from listbox on grid panel title
		this.optionRestriction = this.listOptionRestrictions[0];
		this.abCompDocGrid.addParameter("permanentRes",this.optionRestriction );
		setOptionValue("list_options",this.listOptions[0]);
		//also clear restriction from tree
		this.treeRes = " 1=1 ";
	},

	/**
	* refresh grid when tree node is clicked
	*/
	onTreeRefresh:function(res){
		this.treeRes = res;
		this.abCompDocGrid.addParameter("treeRes",res?res:" 1=1 ");
		this.abCompDocGrid.refresh();
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.abCompDocGrid, "compliance_locations.");
	},

	/**
	* initial list box on panel title
	*/
	initialListBoxOnPanelTitle: function(){
		var panelTitleNode = this.abCompDocGrid.getTitleEl().dom.parentNode.parentNode;
		var cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'listBox'
		});
		this.lableDom = cell;

		var tn = Ext.DomHelper.append(cell, '<p>' + View.getLocalizedString(getMessage("listTitle")) + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(panelTitleNode, {
			tag : 'td',
			id : 'list_options_td'
		});
		
		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'list_options'
		}, true);
		this.dropDownDom = options.dom;
		
		options.dom.options[0] = new Option("", "all");
		for(var i=1;i<this.listOptions.length;i++){
			options.dom.options[i] = new Option(getMessage(this.listOptions[i]), this.listOptions[i]);
		}
		options.dom.selectedIndex = 0;
		options.on('change', this.onChangeListBox, this, {
			delay : 100,
			single : false
		});
	},

	/**
	* Event handler when selection of list box is change
	*/
	onChangeListBox : function(e, selectEl) {
		//get proper permanent restriction and apply it to grid
		this.optionRestriction = this.listOptionRestrictions[selectEl.selectedIndex];
		this.abCompDocGrid.addParameter("permanentRes",this.optionRestriction );
		this.abCompDocGrid.refresh();
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.abCompDocGrid, "compliance_locations.");
	},

	/**
      * Public function: refresh the select document grid  when first tab is selected.
      */
	refreshGrid: function(){
		this.abCompDocGrid.refresh();
		// after grid is refreshed hide lacation columns if all are empty.
		hideEmptyColumnsByPrefix(this.abCompDocGrid, "compliance_locations.");
    },

	/**
      * EventHandler called after the grid is refreshed.
	  * Configure panel actions and row action.
      */
	abCompDocGrid_afterRefresh: function(){
		// get top controller
		if(!this.topCtrl){
			this.topCtrl = View.getOpenerView().controllers.get(0);
		}
		//if current view is loaded for Report view
		if("report" == this.topCtrl.mode){
			var grid = this.abCompDocGrid;

			//hide action "Add New"
			hideActionsOfPanel(grid, new Array("addNew") ,false);
			//change row action from "Edit" to "View"
			grid.gridRows.each(function(row) {
				row.actions.get("edit").setTitle(getMessage("view")); 
			}); 			
		}
    }

});
