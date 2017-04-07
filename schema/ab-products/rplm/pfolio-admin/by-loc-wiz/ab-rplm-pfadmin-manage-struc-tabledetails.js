/**
 * Controller definition.
 */
var structureManagementTableDetailsController = View.createController('structureManagementTableDetails', {
	//report button
	menuParent:null,
	// report menu
	menu: new Array('lease', 'structure', 'document', 'contact'),
	// report submenu
	subMenu: new Array(new Array(), 
						new Array(),
						new Array('structure', 'lease'),
						new Array('structure', 'lease')),
	// array with selected items					
	items:new Array(),
	
	// statistic data config
	statisticRowsConfig: {
		formulas: ["sum", "avg", "min", "max"],
		fields: ["property.area_estimated"]
	},

	afterViewLoad:function(){
		var gridPanel = View.panels.get("structureGrid");
		if (gridPanel) {
			gridPanel.setStatisticAttributes(this.statisticRowsConfig);
		}
		this.menuParent = Ext.get('details_reports');
		this.menuParent.on('click', this.showMenu, this, null);
		
	},
	
	//KB3036049 - Show selected items in the maximized view
	afterInitialDataFetch: function(){
		if(this.view.parameters){
			if(this.view.parameters.maximize){
				openerView = this.view.getOpenerView();
				if(openerView){
					this.items = openerView.controllers.get('structTree').selectedItems;
					if(valueExistsNotEmpty(this.items)){
						this.initializeView();
					}
				}
			}
		}
	},
	
	/**
	 * Show "Report" menu
	 */
	showMenu: function(e, item){
		var menuItems = [];
		var type = 0;
		for(var i=0;i<this.menu.length;i++){
			var subMenuItems = [];
			for(var j=0;j<this.subMenu[i].length;j++){
				var subMenuItem = new Ext.menu.Item({text: getMessage('submenu_'+this.subMenu[i][j]),
            		handler: reports.createDelegate(this, [type], this.items)});
				subMenuItems.push(subMenuItem);
				type = type + 1;
			}
			var menuItem = null;
			if(subMenuItems.length > 0){
				menuItem = new Ext.menu.Item({
					text: getMessage('menu_' + this.menu[i]),
					menu: {items: subMenuItems}
				});
			}else{
				menuItem = new Ext.menu.Item({
					text: getMessage('menu_' + this.menu[i]),
					handler: reports.createDelegate(this, [type], this.items)});
				type = type + 1;
			}
			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.show(this.menuParent, 'tl-bl?');
	},
	
	/**
	 * Refresh view
	 */
	initializeView: function(){
		var prIds = [];
		for ( var i = 0 ; i < this.items.length; i++) {
			prIds.push(this.items[i].substring(1, this.items[i].length -1));
		}
		var selectedItems = this.items.join() 
		var restriction = new Ab.view.Restriction();
		restriction.addClause("property.pr_id", prIds, "IN");
		this.structureGrid.refresh(restriction);
        
	},
	
	/**
	 * Click "Details" event handler
	 */
	structureGrid_detail_onClick:function(row){
		var row = row;
		View.openDialog('ab-rplm-pfadmin-leases-by-structure-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseByStructureBase');
					dialogController.pr_id = row.getFieldValue('property.pr_id');
					dialogController.initializeView();
				}
		});
	}
})
