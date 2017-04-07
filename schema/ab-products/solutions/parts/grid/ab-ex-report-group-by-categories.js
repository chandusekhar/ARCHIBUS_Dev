var groupByCategoriesController = View.createController('buildingsGrid', {
       
    afterInitialDataFetch : function() {
    	this.workRequestsByBuildingGrid.setCategoryColors({'Com': '#33CC33', 'HA': '#FF3300', 'I': '#336633', 'R': '#003399', 'AA': '#CC66FF', 'A': '#6600CC', 'HL': '#FF3300'});
    	// set properties
    	this.workRequestsByBuildingGrid.setCategoryConfiguration({
    		fieldName: 'wr.status',
    		order: ['R', 'A', 'AA', 'HA', 'HL', 'I', 'Com'],
    		getStyleForCategory: this.getStyleForCategory  	
    	});
    	      
    	// update
    	this.workRequestsByBuildingGrid.update();
    },
    
    // (optional)  specify styling properties for category         
    getStyleForCategory: function(record) {
    	var style = {};
    	var status = record.getValue('wr.status');
    	var targetPanel = View.panels.get("workRequestsByBuildingGrid");
    	style.color = targetPanel.getCategoryColors()[status]; 
    	return style;
   }   
});
