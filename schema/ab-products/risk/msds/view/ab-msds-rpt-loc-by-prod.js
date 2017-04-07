/**
* @author eric_maxfield@archibus.com
* Added this controller for v22.1 to enable data-driven conditional display of columns
*/
var hideEmptyColumnsToggle = false;

var abRiskMsdsRptByProdController = View.createController('abRiskMsdsRptByProdController',
{	
	/**
	 * After initial data fetch, populate the initial message parameter value
	 */
	abRiskMsdsRptByProdGridLoc_afterInitialDataFetch: function(){
		this.abRiskMsdsRptByProdGridLoc.addParameter('showHide', getMessage('msgHideEmptyColumns'));
	},
	
	/**
	 *  Listener on the action button to hide or show grid columns
	 */
	abRiskMsdsRptByProdGridLoc_onShowHide: function(){
		if(hideEmptyColumnsToggle==false){			
			hideEmptyColumnsToggle=true;			
			var button=this.abRiskMsdsRptByProdGridLoc.actions.get('showHide');
			button.setTitle(getMessage('msgShowAllColumns'));
			this.abRiskMsdsRptByProdGridLoc.refresh();
		}
		else{			
			hideEmptyColumnsToggle=false;
			var button=this.abRiskMsdsRptByProdGridLoc.actions.get('showHide');
			button.setTitle(getMessage('msgHideEmptyColumns'));
			this.abRiskMsdsRptByProdGridLoc.refresh();
		}
	},
	/**
	 * Show the progress bar during potentially long grid refreshes
	 */	
	abRiskMsdsRptByProdGridLoc_beforeRefresh: function(){
		this.view.openProgressBar(getMessage('msgLoadingProgress'));
	},
	/**
	 * Close the progress bar here so it closes even when there are no records to display
	 */
	abRiskMsdsRptByProdGridLoc_afterGetData: function(){
		this.view.closeProgressBar();
	},
	
	/**
	 * Do this after refresh in order to update the report grid column display
	 */
	abRiskMsdsRptByProdGridLoc_afterRefresh: function(){
		this.hideEmptyColumns();
	},
	
	/* 
	 * Only show columns if they contain content for any cell in the column.
	 */
	hideEmptyColumns: function(){
		var originalAfterRefresh = this.abRiskMsdsRptByProdGridLoc.afterRefresh;
		
		this.abRiskMsdsRptByProdGridLoc.afterRefresh = function(){
			var gridPanel=this;
			var rows = gridPanel.rows;	

			var columns = gridPanel.getColumns();
			var consoleFilterValues = JSON.parse(gridPanel.getFilterValues());
							
				if(!hideEmptyColumnsToggle){
					//show all columns initially
					for(var i=0; i<columns.length; i++){
						var columnId = columns[i].id;
						gridPanel.showColumn(columnId);
					}
				} else if(rows.length > 0){ 				
					//hide all columns initially
					for(var i=0; i<columns.length; i++){
						var columnId = columns[i].id;
						gridPanel.hideColumn(columnId);
					}
					for(var i=0; i<columns.length; i++){
						var columnId = columns[i].id;
						gridPanel.gridRows.each(function(row) {
							var rowRecord = row.getRecord();	
							// Show columns if they have useful content to display.  Only show units columns if their companion quantity field shows.
							if(valueExistsNotEmpty(rowRecord.values[columnId]) && columnId != 'msds_location.temperature_units'
									&& columnId != 'msds_location.quantity_units'){						
								if(columnId=='msds_location.temperature'){
									gridPanel.showColumn('msds_location.temperature_units');
								}
								else if(columnId=='msds_location.quantity'){
										if(rowRecord.values[columnId] > 0){
											gridPanel.showColumn('msds_location.quantity_units');
											gridPanel.showColumn(columnId);
										}
								}
								else if(columnId=='msds_location.num_containers'){
										if(rowRecord.values[columnId] > 1){
											gridPanel.showColumn(columnId);
										}
								}
								else{
									gridPanel.showColumn(columnId);
								}
							}
						});
					}	
				}
				//always hide the autonumber id and units type columns because they do not provide much value to the user
				gridPanel.hideColumn('msds_location.auto_number');
				gridPanel.hideColumn('msds_location.quantity_units_type');
				
				gridPanel.afterRefresh=originalAfterRefresh;
				if(rows.length > 0){
					gridPanel.update();
					//restore original mini-console filter values
					for(var i=0; i<consoleFilterValues.length; i++){
						gridPanel.setFilterValue(consoleFilterValues[i].fieldName,consoleFilterValues[i].filterValue);
					}
				}

		}
		this.view.closeProgressBar();

	}
});
