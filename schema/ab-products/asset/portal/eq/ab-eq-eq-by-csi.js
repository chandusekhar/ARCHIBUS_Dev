var abEqEqByCsiCtrl = View.createController('abEqEqByCsiCtrl', {
    
	//reference to 'abEqEqByCsiGeoCtrl' controller
	abEqEqByCsiGeoCtrl: null,
	
	//reference to 'abEqEqByCsiOrgCtrl' controller
	abEqEqByCsiOrgCtrl: null,
	
	//reference to 'abEqEqByCsiCsiCtrl' controller
	abEqEqByCsiCsiCtrl: null,
		
	consoleRestriction: " 1=1 ",

	printableConsoleRestriction: [],
    
	/**
	 * action event for 'Filter' button
	 */
	abEqEqByCsi_filterConsole_onFilter: function(){
    
        this.setConsoleRestriction();
		
		
		if (this.abEqEqByCsiGeoCtrl){
			
			//refresh  'world_tree'
			this.abEqEqByCsiGeoCtrl.world_tree.addParameter('filterConsole', this.consoleRestriction);
			this.abEqEqByCsiGeoCtrl.world_tree.refresh();
			
			//refresh selectedTab
			this.abEqEqByCsiGeoCtrl.refreshSelectedTab(false);
		}
		
		else if(this.abEqEqByCsiOrgCtrl){
			
			//refresh  'org_world_tree'
			this.abEqEqByCsiOrgCtrl.org_world_tree.addParameter('filterConsole', this.consoleRestriction);
			this.abEqEqByCsiOrgCtrl.org_world_tree.refresh();
			
			//refresh selectedTab
			this.abEqEqByCsiOrgCtrl.refreshSelectedTab(false);
			
		}
		
		else if(this.abEqEqByCsiCsiCtrl){
			
			//refresh  'classificationsTreePanel'
			this.abEqEqByCsiCsiCtrl.classificationsTreePanel.addParameter('filterConsole', this.consoleRestriction);
			this.abEqEqByCsiCsiCtrl.classificationsTreePanel.refresh();
			
			//refresh selectedTab
			this.abEqEqByCsiCsiCtrl.refreshSelectedTab(false);
			
		}
		
		
    },
	
	/**
	 * Create restriction objects (bldgsRestriction and orgRestriction) based on Console selection.
	 */
	setConsoleRestriction: function(){
		var console = this.abEqEqByCsi_filterConsole;
		var restriction = "";
		var printableRestriction = [];
		
		var eq_std = console.getFieldValue('eq.eq_std');
        if (valueExistsNotEmpty(eq_std)) {
            restriction = " eq.eq_std = '" + eq_std + "'";
            printableRestriction.push({'title': getMessage("fieldTitle_eqStd"), 'value': eq_std});
        }
		
        var use1 = console.getFieldValue('eq.use1');
        if (valueExistsNotEmpty(use1)) {
            restriction += (restriction == "" ? "" : " AND ") + " eq.use1 = '" + use1 + "'";
            printableRestriction.push({'title': getMessage("fieldTitle_eqUse"), 'value': use1});
        }

        if ($('leased').checked) {
        	restriction += (restriction == "" ? "" : " AND ") + "eq.ta_lease_id IS NOT NULL";
            printableRestriction.push({'title': getMessage("fieldTitle_LeasedOwned"), 'value': getMessage("leased")});
        } else if ($('owned').checked) {
        	restriction += (restriction == "" ? "" : " AND ") + "eq.ta_lease_id IS NULL";
        	printableRestriction.push({'title': getMessage("fieldTitle_LeasedOwned"), 'value': getMessage("owned")});
        }
		
		
		this.consoleRestriction = (restriction != "") ? restriction : " 1=1 ";
		this.printableConsoleRestriction = printableRestriction;
	},
	
	
	
	/**
	 * action event for 'Clear' button
	 */
	abEqEqByCsi_filterConsole_onClear: function(){
		this.abEqEqByCsi_filterConsole.clear();
		$('both').checked = true;
	},

	/**
	 * Listener for 'Switch' action
	 */
	switchTree: function(viewName){
		this.abEqEqByCsi_filterConsole_onClear();
		this.abEqEqByCsiGeoCtrl = null;
		this.abEqEqByCsiOrgCtrl = null;
		this.abEqEqByCsiCsiCtrl = null;
		View.panels.get('abEqEqByCsi').loadView(viewName);
	}	
});
