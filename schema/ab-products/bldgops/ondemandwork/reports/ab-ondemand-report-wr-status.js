var abOndRptWrStatusController = View.createController('abOndRptWrStatusController', {

	afterInitialDataFetch : function() {			
		this.setNATitle();
	},
    
    setNATitle: function() {
    	//var firstColumn = Ext.get('reportPanel_column_c0');
    	var firstColumn = document.getElementById('reportPanel_column_c0');
    	if (firstColumn != null){
	    	if(firstColumn.innerText == undefined
	    			|| firstColumn.innerText == 'undefined'){
	    		firstColumn.innerHTML = "N/A";
	    	}
    	}
    }
});
