var groupByCategoriesController = View.createController('buildingsGrid', {
	afterViewLoad: function() {
	    var consolePrefix = 'consolePanel_';                       
	    setup_enum_field(consolePrefix, 'wr', 'status');     
	},
       
    afterInitialDataFetch : function() {
    	
    	this.workRequestsByBuildingGrid.setCategoryColors({'Com': '#33CC33', 'HA': '#FF3300', 'I': '#336633', 'R': '#003399', 'AA': '#CC66FF', 'A': '#6600CC', 'HL': '#FF3300'});
    	
    	this.categoryDS = 'statusDS';
    	
    	// set properties
    	this.workRequestsByBuildingGrid.setCategoryConfiguration({
    		fieldName: 'wr.status',
    		countField: 'wr.ct_status',
    		order: ['R', 'A',  'HA', 'HL', 'I', 'Com'],
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
   },
   
   // if a row is checked, change the wr_id font color to red; if unselected, change back 
   workRequestsByBuildingGrid_onMultipleSelectionChange: function(record) {
	   var row = record.row;
	   if(record.row.isSelected()){
		   row.cells.get(1).dom.style.color = '#FF0000';
	   } else {
		   row.cells.get(1).dom.style.color = '';
	   }
   },
   
   workRequestsByBuildingGrid_onChangeGroupBy: function() {
	   
	   var groupByDS = this.categoryDS;
	   var showWithoutGroupings = (groupByDS == 'none') ? true : false;
	   
       this.groupBy = {
               showWithoutGroupings : true
       };
       
	   if (this.categoryDS == 'statusDS') {
	    	this.categoryDS = 'probTypeDS';
	 	    this.workRequestsByBuildingGrid.setCategoryDataSourceId('probTypeDS');
	    	this.workRequestsByBuildingGrid.setCategoryConfiguration({
	    		fieldName: 'wr.prob_type',
	    		countField: 'wr.ct_prob_type',
	    		order: [],
				getStyleForCategory: this.getStyleForCategory,
				showWithoutGroupings: false
	    	});	    	
	    	this.workRequestsByBuildingGrid.update();		    
	   } else if (this.categoryDS == 'probTypeDS') {
		    this.categoryDS = 'none';
		   	this.workRequestsByBuildingGrid.setCategoryConfiguration({
				showWithoutGroupings: true
			});
	    	this.workRequestsByBuildingGrid.update();
	   } else if (this.categoryDS == 'none') {
		    this.categoryDS = 'statusDS';
			this.workRequestsByBuildingGrid.setCategoryDataSourceId('statusDS');
			this.workRequestsByBuildingGrid.setCategoryRecords
		   	this.workRequestsByBuildingGrid.setCategoryConfiguration({
				fieldName: 'wr.status',
				countField: 'wr.ct_status',
				order: ['R', 'A',  'HA', 'HL', 'I', 'Com'],
				getStyleForCategory: this.getStyleForCategory,
				showWithoutGroupings: false
			});
	   	this.workRequestsByBuildingGrid.update();
	  }
   },
   
   onFilter: function(){
		var restriction = new Ab.view.Restriction();
		var console = View.panels.get('consolePanel');
		
		var requestor = console.getFieldValue('wr.requestor');
		if (requestor != '') {
			restriction.addClause('wr.requestor', requestor + '%', 'LIKE');
		}                           
		
		var prob_type = console.getFieldValue('wr.prob_type');
		if (prob_type != '') {
			restriction.addClause('wr.prob_type', prob_type + '%', 'LIKE');
		}
		
		var status = console.getFieldValue('wr.status');
		if (status != '') {
			restriction.addClause('wr.status', status, '=');
		}
	 
		var statusDS = View.dataSources.get('statusDS');
		statusDS.setRestriction(restriction);

		var probTypeDS = View.dataSources.get('probTypeDS');
		probTypeDS.setRestriction(restriction);
		
		var report = View.panels.get('workRequestsByBuildingGrid');                    
		report.refresh(restriction);   	   
   }
});
