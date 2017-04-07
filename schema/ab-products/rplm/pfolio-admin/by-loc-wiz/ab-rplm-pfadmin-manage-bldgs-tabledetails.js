/**
 * Controller definition.
 */
var buildingManagementTableDetailsController = View.createController('buildingManagementTableDetails', {
	//report button
	menuParent:null,
	// report menu
	menu: new Array('lease', 'building', 'document', 'contact'),
	// report submenu
	subMenu: new Array(new Array(), 
						new Array(),
						new Array('building', 'lease'),
						new Array('building', 'lease')),
	// array with selected items					
	items:new Array(),
	
	// statistic data config
	statisticRowsConfig: {
		formulas: ["sum", "avg", "min", "max"],
		fields: ["bl.area_estimated"]
	},
	
	afterViewLoad:function(){
		var gridPanel = View.panels.get("buildingsGrid");
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
					this.items = openerView.controllers.get('bldgTree').selectedItems;
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
		var blIds = [];
		for ( var i = 0 ; i < this.items.length; i++) {
			blIds.push(this.items[i].substring(1, this.items[i].length -1));
		}
		var selectedItems = this.items.join() 
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id", blIds, "IN");
		this.buildingsGrid.refresh(restriction);
        
	},
	/**
	 * Click "Details" event handler
	 */
	buildingsGrid_detail_onClick:function(row){
		var row = row;
		View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
					dialogController.bl_id = row.getFieldValue('bl.bl_id');
					dialogController.initializeView();
				}
		});
	}
})

