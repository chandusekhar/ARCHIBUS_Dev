var buildingManagementTableDetailsController = View.createController('buildingManagementTableDetails', {
	menuParent:null,
	menu: new Array('lease', 'building', 'document', 'contact'),
	subMenu: new Array(new Array(), 
						new Array('country', 'region', 'state', 'city', 'site', 'property'),
						new Array('building', 'lease'),
						new Array('building', 'lease')),
	items:new Array(),
	afterViewLoad:function(){
		this.menuParent = Ext.get('details_reports');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	afterInitialDataFetch: function(){
		this.buildingsGrid.refresh('bl.bl_id is null');
	},
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
	initializeView: function(){
        var restriction = 'bl_id in ('+this.items+')';
        this.buildingsGrid.refresh(restriction);
		this.reportBuildings.addParameter('selectedBuildings', ' where '+restriction);
		this.reportBuildings.refresh();
	},
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

