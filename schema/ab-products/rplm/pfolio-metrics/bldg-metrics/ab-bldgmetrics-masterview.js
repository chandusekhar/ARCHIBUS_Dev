

var masterViewTableMetricController = View.createController('masterViewTableMetricController', {
    
	//reference to 'abBldgMetricsBldgs_ctrl' controller
	abBldgMetricsBldgs_ctrl:null,
	
	//reference to 'abBldgMetricsOrgs_ctrl' controller
	abBldgMetricsOrgs_ctrl:null,
	
	
	bldgsConsoleRestriction: " 1=1 ",
	orgConsoleRestriction:" 1=1 ",
	
    afterViewLoad: function(){
               
        $('both').checked = true;
        
        //set radio buttons labels
        $('leased_label').innerHTML = '<font size="2" face="Verdana"> ' + getMessage('leased') + '</font>';
        $('owned_label').innerHTML = '<font size="2" face="Verdana"> ' + getMessage('owned') + '</font>';
        $('both_label').innerHTML = '<font size="2" face="Verdana"> ' + getMessage('both') + '</font>';
       
    },
    
	/**
	 * action event for 'Filter' button
	 */
    abBdgMetricsMasterView_filterConsole_onFilter: function(){
    
        this.setConsoleRestriction();
		
		
		if (this.abBldgMetricsBldgs_ctrl){
			
			//refresh  'world_tree'
			this.abBldgMetricsBldgs_ctrl.world_tree.addParameter('filterConsole', this.bldgsConsoleRestriction);
			this.abBldgMetricsBldgs_ctrl.world_tree.refresh();
			
			//refresh selectedTab
			this.abBldgMetricsBldgs_ctrl.refreshSelectedTab(false);
		}
		
		else if(this.abBldgMetricsOrgs_ctrl){
			
			//refresh  'org_world_tree'
			this.abBldgMetricsOrgs_ctrl.org_world_tree.addParameter('filterConsole', this.orgConsoleRestriction);
			this.abBldgMetricsOrgs_ctrl.org_world_tree.refresh();
			
			//refresh selectedTab
			this.abBldgMetricsOrgs_ctrl.refreshSelectedTab(false);
			
		}
		
		
		
    },
	
	/**
	 * Create restriction objects (bldgsRestriction and orgRestriction) based on Console selection.
	 */
	setConsoleRestriction: function(){
		
		var bldgsRestriction = "";
        var orgRestriction = "";
		
		var bl_use = this.abBdgMetricsMasterView_filterConsole.getFieldValue('bl.use1');
        if (bl_use) {
            bldgsRestriction = " bl.use1 = '" + bl_use + "'";
            orgRestriction = " rm.bl_id in (select bl_id from bl where bl.use1 = '" + bl_use + "')";
        }
        if ($('leased').checked) {
            bldgsRestriction += (bldgsRestriction == '') ? '' : ' and ';
            bldgsRestriction += "bl_id in (select bl_id from bl where bl.area_ls_negotiated > 0)";
            orgRestriction += (orgRestriction == '') ? '' : ' and ';
            orgRestriction += "rm.bl_id in (select bl_id from bl where bl.area_ls_negotiated > 0)";
        }
        if ($('owned').checked) {
            bldgsRestriction += (bldgsRestriction == '') ? '' : ' and ';
            bldgsRestriction += "bl_id in (select bl_id from  bl where bl.area_ls_negotiated = 0)";
            orgRestriction += (orgRestriction == '') ? '' : ' and ';
            orgRestriction += "rm.bl_id in (select bl_id from  bl where bl.area_ls_negotiated = 0)";
        }
		
		
		
		this.bldgsConsoleRestriction = (bldgsRestriction) ? bldgsRestriction : " 1=1 ";
		this.orgConsoleRestriction = (orgRestriction) ? orgRestriction : " 1=1 ";
	},
	
	
	
	/**
	 * action event for 'Clear' button
	 */
	abBdgMetricsMasterView_filterConsole_onClear: function(){
		
		this.abBdgMetricsMasterView_filterConsole.setFieldValue("bl.use1", "");
		$('both').checked = true;
	}
    
    
});






