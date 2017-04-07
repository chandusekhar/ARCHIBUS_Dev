var abCompRptLocCheckController = View.createController('abCompRptLocCheckController', {

	assetTypeArr:[],
		
	/**
	 * Show button for filter console
	 */
	abCompDrilldownConsole_onShow:function(){
        var restriction = this.abCompDrilldownConsole.getFieldRestriction();
        for (var i=0;i<restriction.clauses.length;i++) {
          var name = restriction.clauses[i].name;
          name = name.replace(/compliance_locations\.|regulation\.|regprogram\.|em\./, "regloc.");
          restriction.clauses[i].name = name.replace(/\.em_std|\.eq_std/, ".asset_standard");
        }
        
        var assetTypesMenu = this.abCompDrilldownConsole.actions.get('toolsMenu').menu.items;
        var consoleRestriction = " asset_type IN (";
        for (var i=0; i<assetTypesMenu.items.length; i++) {
		  if (assetTypesMenu.items[i].checked) {
             consoleRestriction += "'"+assetTypesMenu.items[i].id+"',";
          }
        }
        consoleRestriction += ")"
        consoleRestriction = consoleRestriction.replace(",)", ")");
        if (consoleRestriction.indexOf("()") != -1)
            consoleRestriction = "1=0";
        this.abCompRptLocCheckGrid.addParameter("consoleRestriction", consoleRestriction);
        this.abCompRptLocCheckGrid.refresh(restriction);
	}

})

/**
 * Asset Types menu selection in filter console
 */
function assetTypesMenuSel(action) {
}
