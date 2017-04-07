var abTableMetricsDashboardRow1Col2_ctrl = View.createController('abTableMetricsDashboardRow1Col2_ctrl',{
	
	indexSelected:0,
	items:null,
	
	afterViewLoad:function(){
					
		this.items = new Array();
		this.items.push({'panelTitle':getMessage('building_occupancy'), 'dataSourceId':'buildingOccupancy_chart_ds', 'dataAxisField':'count_occup'});
		this.items.push({'panelTitle':getMessage('employee_headcount'), 'dataSourceId':'employee_headcount_chart_ds', 'dataAxisField':'count_em'});
		this.items.push({'panelTitle':getMessage('max_bldg_occup'), 'dataSourceId':'max_bldg_occup_chart_ds', 'dataAxisField':'count_max_occup'});
		this.items.push({'panelTitle':getMessage('vacancy_percent'), 'dataSourceId':'vacancy_percent_chart_ds', 'dataAxisField':'vacancy_percent'});
		
		//set a reference of the Chart to the main container
		View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').row1col2_chart = this.occupancyMetrics_chart;	
	},
	
	
		
	/**
     * Event handler for 'selectMetricField' action
     */
	occupancyMetrics_chart_onSelectMetricField: function(){
		
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:250, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsRow1Col2;
					
					// Define which 'metrics' will be returned by DataSource 
					dataSource.addParameter("building_occupancy", getMessage("building_occupancy"));
        			dataSource.addParameter("employee_headcount", getMessage("employee_headcount"));
					dataSource.addParameter("max_bldg_occup", getMessage("max_bldg_occup"));
        			dataSource.addParameter("vacancy_percent", getMessage("vacancy_percent"));
					
					dialogController.dataSource = dataSource;
					
					//Override 'selectRows' function from dialogController.
					dialogController.selectRows = function(){
						gridPanel.enableSelectAll(false);
						gridPanel.rows[openerController.indexSelected].row.select(true);
						gridPanel.updateHeight();
					}
					
					//Add 'onClickEvent' function to dialogController. This function act like grid_multipleSelectionColumn_onClick event handler. 
					dialogController.onClickEvent = function(row){
						var selected = row.isSelected();
						this.bldgMetricsSelectMetrics_grid.setAllRowsSelected(false);
						row.select(selected);
						openerController.indexSelected = row.getIndex();
					};
					
					//Override 'onShowFieldsEvent' function from dialogController. This function is the event handler for 'onShowFields' action.
					dialogController.onShowFieldsEvent = function(){
						openerController.occupancyMetrics_chart.refresh();
						openerController.occupancyMetrics_chart.loadChartSWFIntoFlash();
						openerController.occupancyMetrics_chart.setTitle(openerController.items[openerController.indexSelected]['panelTitle']);
					}
				}
		});
		
	 }
	
});
