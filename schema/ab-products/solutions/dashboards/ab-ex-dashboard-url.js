
View.createController('dashboardUrlExample', {
	
	afterInitialDataFetch: function() {
		this.panel2.loadView('http://www.archibus.com');
	}
});
