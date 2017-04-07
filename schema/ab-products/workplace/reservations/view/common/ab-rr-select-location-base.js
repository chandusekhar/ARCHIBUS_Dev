var selectLocationBaseController = Ab.view.Controller.extend({
	
	afterViewLoad: function() {
		// check whether the opener view specified some parameters to apply
		var dialogConfig = View.getOpenerView().dialogConfig;
		if (valueExists(dialogConfig)) {
			if (valueExists(dialogConfig['buildingId'])) {
				this.selectPanel.addParameter("buildingId", dialogConfig.buildingId);
			}
			if (valueExists(dialogConfig['onlyReservable'])) {
				this.selectPanel.addParameter("onlyReservable", dialogConfig.onlyReservable);
			}
			if (valueExists(dialogConfig['floorId'])) {
				this.selectPanel.addParameter("floorId", dialogConfig.floorId);
			}
		}
	},
    
	getParentPanel: function() {
    	// Usually the parent panel is called consolePanel.
        var parentPanel = View.getOpenerView().panels.get("consolePanel");
        if (parentPanel == null) {
        	// If there's no consolePanel then try finding a roomPanel.
        	parentPanel = View.getOpenerView().panels.get("roomPanel");
        }
        return parentPanel;
	},
	
	getParentTable: function(parentPanel) {
        // Usually the parent fields are in the reserve_rm table.
        var parentTable = "reserve_rm";
        if (parentPanel.containsField("reserve_rs.fl_id")) {
        	// Use the reserve_rs table if the parent panel contains reserve_rs fields.
        	parentTable = "reserve_rs";
        } else if (parentPanel.containsField("rm_arrange.fl_id")) {
        	// Use the rm_arrange table for the Create Room Reservation console.
        	parentTable = "rm_arrange";
        }
        
        return parentTable;
	}

});
