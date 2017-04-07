
View.createController('dashboardExecNewsController', {
	
	afterInitialDataFetch: function() {
   		this.panel1.loadView('http://www.google.com/search?q=csco');
		this.panel2.loadView('http://www.archibus.com');
        this.panel3.loadView('http://finance.yahoo.com/');

        
	}
});
