
var wrManagerNavController = View.createController('wrManagerNavController', {
	afterViewLoad: function() {
		this.inherit();
	},
	
	afterInitialDataFetch: function() {
		this.nav_tabs.addEventListener('afterTabChange', this.nav_tabs_afterTabChange.createDelegate(this));
		this.nav_tabs.setTabRestriction('page2', "status NOT IN ('Clo', 'Can', 'Rej')");
	},
	
	nav_tabs_afterTabChange: function(tabPanel, currentTabName, previousTabName)
	{

	}
});
