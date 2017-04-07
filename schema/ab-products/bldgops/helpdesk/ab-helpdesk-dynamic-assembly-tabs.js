View.createController("dynamicAssemblyTabsController", {
	// Ab.tabs.Tabs
	tabs : null,

	// default tab structure
	defaultTabs : null,

	// Array which store the specified tabs for specified request type
	specifiedTabsByRequestType : [],

	afterInitialDataFetch : function() {

		this.tabs = View.getControlsByType(self, 'tabs')[0];

	},

	/**
	 * show specified tabs by request type
	 * 
	 * @param {requestType}
	 *            given request type.
	 */
	showSpecifiedTabsByRequestType : function(requestType) {

		var specifiedTabs = null;

		// get specified tabs by request type
		for ( var i = 0; i < this.specifiedTabsByRequestType.length; i++) {
			if (this.specifiedTabsByRequestType[i].requestType == requestType) {
				specifiedTabs = this.specifiedTabsByRequestType[i];
				break;
			}
		}

		if (specifiedTabs != null) {
			// first hide all tabs
			for ( var i = 0; i < this.tabs.tabs.length; i++) {
				this.tabs.tabs[i].show(false);
			}

			// only show specified tabs
			for ( var i = 0; i < specifiedTabs.tabs.length; i++) {
				this.tabs.findTab(specifiedTabs.tabs[i]).show(true);
			}
		} else if (this.defaultTabs != null) {
			// first hide all tabs
			for ( var i = 0; i < this.tabs.tabs.length; i++) {
				this.tabs.tabs[i].show(false);
			}

			// show default tabs
			for ( var i = 0; i < this.defaultTabs.length; i++) {
				this.tabs.findTab(this.defaultTabs[i]).show(true);
			}
		}
	},

	/**
	 * select next visible tab from current select tab
	 * 
	 * @param {restriction}
	 *            restriciton for next tab
	 */
	selectNextTab : function(restriction) {

		var currentTab = this.tabs.findTab(this.tabs.selectedTabName)
		for ( var i = currentTab.index + 1; i < this.tabs.tabs.length; i++) {
			var nextTab = this.tabs.tabs[i];
			if (!nextTab.forcedHidden) {
				this.tabs.selectTab(nextTab.name, restriction, false, false, false);
				break;
			}
		}

	},

	/**
	 * select previous visible tab from current select tab
	 * 
	 * @param {restriction}
	 *            restriciton for previous tab
	 */
	selectPreviousTab : function(restriction) {

		var currentTab = this.tabs.findTab(this.tabs.selectedTabName)
		for ( var i = currentTab.index - 1; i > -1; i--) {
			var nextTab = this.tabs.tabs[i];
			if (!nextTab.forcedHidden) {
				this.tabs.selectTab(nextTab.name, restriction, false, false, false);
				break;
			}
		}
	},
	
	/**
	 * select last visible tab
	 * 
	 * @param {restriction}
	 *            restriciton for previous tab
	 */
	selectLastTab : function(restriction) {
		for ( var i = this.tabs.tabs.length-1; i > -1; i--) {
			var lastTab = this.tabs.tabs[i];
			if (!lastTab.forcedHidden) {
				this.tabs.selectTab(lastTab.name, restriction, false, false, false);
				break;
			}
		}
	}

});