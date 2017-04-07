var abBldgMetricsSelectMetrics_ctrl = View.createController('abBldgMetricsSelectMetrics_ctrl', {
	
	
	selectedMetrics:null,
	dataSource:null,
	
	afterInitialDataFetch:function(){
		
		this.bldgMetricsSelectMetrics_grid.setRecords(this.dataSource.getRecords());
		this.bldgMetricsSelectMetrics_grid.show();
		this.selectRows();
		
	},
	selectRows:function(){
		var selectedMetrics = View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').selectedMetrics;
		 for (i = 0; i < selectedMetrics.length; i++) {
            this.bldgMetricsSelectMetrics_grid.rows[selectedMetrics[i]].row.select(true);
        }
	},
	
	bldgMetricsSelectMetrics_grid_multipleSelectionColumn_onClick:function(row){
			
			this.onClickEvent(row);					
	},
	
	onClickEvent:function(row){
		
	},
	
	bldgMetricsSelectMetrics_grid_onShowFields:function(){
		this.onShowFieldsEvent();
		View.closeThisDialog();
	},
	
	onShowFieldsEvent:function(){
		
		var selectedMetrics = new Array();
       
	    //update "Buildings" and 'Statistics' tabs
        var gridPanel = View.getOpenerView().controllers.get('bldgBuildingsController').bldgMetricsBldgsBuildings_grid;
        
        //Iterate trough "bldgMetricsSelectMetrics_grid" rows to show/hide the columns of the "tableMetricBuildingsGrid" panel , if the row checkbox is checked/unchecked
        for (i = 0; i < this.bldgMetricsSelectMetrics_grid.rows.length; i++) {
        
            var fieldsArray = View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').fieldsArray;
            if (this.bldgMetricsSelectMetrics_grid.rows[i].row.isSelected()) {
            
               	gridPanel.showColumn(fieldsArray[i], true);
               	View.getOpenerView().controllers.get('bldgStatisticsController').showFormFields(i, true);
				
                selectedMetrics.push(i);
            }
            else {
                gridPanel.showColumn(fieldsArray[i], false);
				View.getOpenerView().controllers.get('bldgStatisticsController').showFormFields(i, false);
            }
        }
        
        gridPanel.update();
		
		View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').selectedMetrics = selectedMetrics;
	}
	
	
});
