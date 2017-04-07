var abEqEqByCsiSelectMetricsCtrl = View.createController('abEqEqByCsiSelectMetricsCtrl', {
	
	dataSource: null,
	
	afterInitialDataFetch:function(){
		
		this.abEqEqByCsiSelectMetrics_grid.setRecords(this.dataSource.getRecords());
		this.abEqEqByCsiSelectMetrics_grid.show();
		this.selectRows();
		
	},
	
	selectRows:function(){
		var selectedMetrics = View.getOpenerView().controllers.get('abEqEqByCsiStatTabCtrl').selectedMetrics;
		 for (i = 0; i < selectedMetrics.length; i++) {
            this.abEqEqByCsiSelectMetrics_grid.rows[selectedMetrics[i]].row.select(true);
        }
	},
	
	abEqEqByCsiSelectMetrics_grid_multipleSelectionColumn_onClick:function(row){
			
			this.onClickEvent(row);					
	},
	
	onClickEvent:function(row){
		
	},
	
	abEqEqByCsiSelectMetrics_grid_onShowFields:function(){
		this.onShowFieldsEvent();
		View.closeThisDialog();
	},
	
	onShowFieldsEvent:function(){
		
		var selectedMetrics = new Array();
       
	    //update 'Statistics' and "Equipment" tabs
        //var gridPanel = View.getOpenerView().controllers.get('abEqEqByCsiEqTabCtrl').abEqEqByCsiEqTab_grid;
        
        //Iterate trough "abEqEqByCsiSelectMetrics_grid" rows to show/hide the fields of the "abEqEqByCsiStatTab_form" panel , if the row checkbox is checked/unchecked
        for (i = 0; i < this.abEqEqByCsiSelectMetrics_grid.rows.length; i++) {
        
        	var statTabController = View.getOpenerView().controllers.get('abEqEqByCsiStatTabCtrl');
            var fieldsArray = statTabController.fieldsArray;
            if (this.abEqEqByCsiSelectMetrics_grid.rows[i].row.isSelected()) {
            
               	//gridPanel.showColumn(fieldsArray[i], true);
            	statTabController.showFormFields(i, true);
				
                selectedMetrics.push(i);
            }
            else {
                //gridPanel.showColumn(fieldsArray[i], false);
            	statTabController.showFormFields(i, false);
            }
        }
        
        //gridPanel.update();
		
        statTabController.selectedMetrics = selectedMetrics;
	}
	
});
