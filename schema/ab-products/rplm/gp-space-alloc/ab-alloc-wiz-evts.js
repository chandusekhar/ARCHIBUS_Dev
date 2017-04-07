var allocWizEvtsController = View.createController('allocWizEvts',{
	filter: null,
	
	scn_id: null,

    afterInitialDataFetch: function(){
    	this.refreshSelectionTree();
    },
    
	refreshSelectionTree: function() {
		this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
		this.filter = View.getOpenerView().controllers.get('allocWiz').filter;
		this.allocWizEvtsTabs.selectTab('allocWizEvts_locTab');
	},

	/**
	 * Filter the portfolio scenario list.
	 */
	refreshTab: function(filterCopy) {
		this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
		this.filter = filterCopy;
		for (var i=0; i<this.allocWizEvtsTabs.tabs.length; i++) {
			var subTab = this.allocWizEvtsTabs.tabs[i];
			if(subTab.hasView() ) {
				if ( subTab.isContentLoaded && !subTab.isContentLoading ) {
					var iframe = subTab.getContentFrame();
					var childView = iframe.View;
					if (valueExists(childView)) {
						var controller = childView.controllers.get(0);
						if (controller && controller.refreshTreePanel){
							controller.filter = filterCopy;
							controller.refreshTreePanel(filterCopy);
						}
					} 
				}
			} else {
				// location tree tab doesn't use the frame, so need to process it differently
				var controller = View.controllers.get('allocWizLoc');
				controller.filter = filterCopy;
				controller.refreshTreePanel(filterCopy);
			}
		}
	},

    applyChangedScenario: function(filter) {
    	//this.filter = filter;
    	//this.refreshTab();
    }
});

