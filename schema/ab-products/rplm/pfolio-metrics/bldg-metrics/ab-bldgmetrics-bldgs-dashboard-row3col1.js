var abTableMetricsDashboardRow3Col1_ctrl =  View.createController('abTableMetricsDashboardRow3Col1_ctrl', {
	indexSelected : 0,
	gauge:null,
	items :null,
		
	afterViewLoad: function(){
		
		this.items = new Array();
		this.items.push({'panelTitle':getMessage("area_estimated"), 'dataSource':this.areaEstimated_ds, 'field':'bl.area_estimated'});
		this.items.push({'panelTitle':getMessage("int_gross_area"), 'dataSource':this.intGrossArea_ds, 'field':'bl.sum_area_gross_int'});
		this.items.push({'panelTitle':getMessage("rentable_area"), 'dataSource':this.rentableArea_ds, 'field':'bl.sum_area_rentable'});
		this.items.push({'panelTitle':getMessage("total_lease_neg_area"), 'dataSource':this.totalLsNegArea_ds, 'field':'bl.sum_area_ls_negotiated'});
		this.items.push({'panelTitle':getMessage("total_occup_area"), 'dataSource':this.totalOccupArea_ds, 'field':'bl.sum_area_ocup'});
		this.items.push({'panelTitle':getMessage("total_room_area"), 'dataSource':this.totalRoomArea_ds, 'field':'bl.sum_area_rm'});
		this.items.push({'panelTitle':getMessage("usable_area"), 'dataSource':this.usableArea_ds, 'field':'bl.sum_area_usable'});
		
		//Create Gauge
		this.gauge = new Gauge(abTableMetricsDashboardRow3Col1_ctrl, 'div_circular_gauge_row3col1', 'Circular', 10);
		
		//set a reference of the Gauge to the main container
		View.getOpenerView().getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').row3col1_gauge = this.gauge;
    },
    
	/**
     * Event handler for 'selectMetricField' action
     */
	circularGaugePanelHtml_row3col1_onSelectMetricField: function(){
		
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:250, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsRow3Col1;
					
					// Define which 'metrics' will be returned by DataSource 
					dataSource.addParameter("area_estimated", getMessage("area_estimated"));
        			dataSource.addParameter("int_gross_area", getMessage("int_gross_area"));
					dataSource.addParameter("rentable_area", getMessage("rentable_area"));
        			dataSource.addParameter("total_lease_neg_area", getMessage("total_lease_neg_area"));
        			dataSource.addParameter("total_occup_area", getMessage("total_occup_area"));
					dataSource.addParameter("total_room_area", getMessage("total_room_area"));
        			dataSource.addParameter("usable_area", getMessage("usable_area"));
					
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
						openerController.circularGaugePanelHtml_row3col1.setTitle(openerController.items[openerController.indexSelected]['panelTitle']);
						
					}
				}
		});
		
	 }
	 
 });



 
 