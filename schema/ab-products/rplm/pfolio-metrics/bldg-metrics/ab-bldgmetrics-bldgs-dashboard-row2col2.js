var abTableMetricsDashboardRow2Col2_ctrl = View.createController('abTableMetricsDashboardRow2Col2_ctrl',{
	
	indexSelected:0,
	items:null,
	
	
	afterViewLoad:function(){
		this.items = new Array();
		this.items.push({'panelTitle':getMessage('avg_area_em'), 'dataSourceId':'avg_area_em_chart_ds', 'dataAxisField':'area_avg_em'});
		this.items.push({'panelTitle':getMessage('cost_per_area'), 'dataSourceId':'cost_per_area_chart_ds', 'dataAxisField':'cost_sqft'});
		this.items.push({'panelTitle':getMessage('efficency_rate'), 'dataSourceId':'efficency_rate_chart_ds', 'dataAxisField':'ratio_ur'});
		this.items.push({'panelTitle':getMessage('fci'), 'dataSourceId':'fci_chart_ds', 'dataAxisField':'fci'});
		this.items.push({'panelTitle':getMessage('ru_ratio'), 'dataSourceId':'ru_ratio_chart_ds', 'dataAxisField':'ratio_ru'});
		
		//set a reference of the Chart to the main container
		View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').row2col2_chart = this.kpiMetrics_chart;
	},
	
		
	/**
     * Event handler for 'selectMetricField' action
     */
	kpiMetrics_chart_onSelectMetricField: function(){
		
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:250, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsRow2Col2;
					
					// Define which 'metrics' will be returned by DataSource 
					dataSource.addParameter("avg_area_em", getMessage("avg_area_em"));
        			dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
					dataSource.addParameter("efficency_rate", getMessage("efficency_rate"));
					dataSource.addParameter("fci", getMessage("fci"));
					dataSource.addParameter("ru_ratio", getMessage("ru_ratio"));
					
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
						openerController.kpiMetrics_chart.refresh();
						openerController.kpiMetrics_chart.loadChartSWFIntoFlash();
						openerController.kpiMetrics_chart.setTitle(openerController.items[openerController.indexSelected]['panelTitle']);
					}
				}
		});
		
	 }
	
});
