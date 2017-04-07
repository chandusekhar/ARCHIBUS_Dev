 var abTableMetricsDashboardRow2Col1_ctrl =  View.createController('abTableMetricsDashboardRow2Col1_ctrl', {
	indexSelected : 0,
	gauge:null,
	items :null,
		
	afterViewLoad: function(){
		
		this.items = new Array();
		this.items.push({'panelTitle':getMessage("capital_project_cost"), 'dataSource':this.activeCapitalCost_ds, 'field':'bl.active_capital_cost'});
		this.items.push({'panelTitle':getMessage("chargeable_cost"), 'dataSource':this.chargeableCost_ds, 'field':'bl.sum_room_cost'});
		this.items.push({'panelTitle':getMessage("operating_costs"), 'dataSource':this.operatingCosts_ds, 'field':'bl.operating_costs'});
		this.items.push({'panelTitle':getMessage("value_book"), 'dataSource':this.valueBook_ds, 'field':'bl.sum_value_book'});
		this.items.push({'panelTitle':getMessage("value_market"), 'dataSource':this.valueMarket_ds, 'field':'bl.sum_value_market'});
		
		//Create Gauge
		this.gauge = new Gauge(abTableMetricsDashboardRow2Col1_ctrl, 'div_linear_gauge_row2col1', 'Horizontal' , 4);
		
		//set a reference of the Gauge to the main container
		View.getOpenerView().getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').row2col1_gauge = this.gauge;
    },
    
    /**
     * Event handler for 'selectMetricField' action
     */
	linearGaugePanelHtml_row2col1_onSelectMetricField: function(){
		
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:250, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsRow2Col1;
					
					// Define which 'metrics' will be returned by DataSource 
					dataSource.addParameter("capital_project_cost", getMessage("capital_project_cost"));
        			dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
        			dataSource.addParameter("operating_costs", getMessage("operating_costs"));
        			dataSource.addParameter("value_book", getMessage("value_book"));
        			dataSource.addParameter("value_market", getMessage("value_market"));
					
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
						openerController.gauge.drawGauge();
						openerController.gauge.refreshGauge();
						openerController.linearGaugePanelHtml_row2col1.setTitle(openerController.items[openerController.indexSelected]['panelTitle']);
					}
				}
		});
		
	 }
	 
 });

 
 