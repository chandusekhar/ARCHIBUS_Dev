var abBldgMetricsOrgsSelectMetrics_ctrl = View.createController('abBldgMetricsOrgsSelectMetrics_ctrl', {
	
	
	selectedMetrics:null,
	dataSource:null,
	
	afterInitialDataFetch:function(){
		
		this.bldgMetricsOrgsSelectMetrics_grid.setRecords(this.dataSource.getRecords());
		this.bldgMetricsOrgsSelectMetrics_grid.show();
		this.selectRows();
		
	},
	selectRows:function(){
		var selectedMetrics = View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').selectedMetrics;
		 for (i = 0; i < selectedMetrics.length; i++) {
            this.bldgMetricsOrgsSelectMetrics_grid.rows[selectedMetrics[i]].row.select(true);
        }
	},
	
	bldgMetricsOrgsSelectMetrics_grid_multipleSelectionColumn_onClick:function(row){
			
			this.onClickEvent(row);					
	},
	
	onClickEvent:function(row){
		
	},
	
	bldgMetricsOrgsSelectMetrics_grid_onShowFields:function(){
		this.onShowFieldsEvent();
		View.closeThisDialog();
	},
	
	onShowFieldsEvent:function(){
		
		var selectedMetrics = new Array();
       
	    //update "Buildings" and 'Statistics' tabs
        var gridPanel = View.getOpenerView().controllers.get('abBldgMetricsOrgsBuildings').abBldgMetricsOrgsBuildings_grid;
        
        //Iterate trough "bldgMetricsOrgsSelectMetrics_grid" rows to show/hide the columns of the "abBldgMetricsOrgsBuildings_grid" panel , if the row checkbox is checked/unchecked
        for (i = 0; i < this.bldgMetricsOrgsSelectMetrics_grid.rows.length; i++) {
        
            var fieldsArray = View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').fieldsArray;
            if (this.bldgMetricsOrgsSelectMetrics_grid.rows[i].row.isSelected()) {
            
               	gridPanel.showColumn(fieldsArray[i], true);
               	View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').showFormFields(i, true);
				
                selectedMetrics.push(i);
            }
            else {
                gridPanel.showColumn(fieldsArray[i], false);
				View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').showFormFields(i, false);
            }
        }
        
        gridPanel.update();
		
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').selectedMetrics = selectedMetrics;
	}
	
	
});
