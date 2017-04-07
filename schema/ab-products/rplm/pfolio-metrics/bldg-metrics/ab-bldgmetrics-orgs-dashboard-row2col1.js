 var abBldgMetricsOrgsDashboardRow2Col1_ctrl =  View.createController('abBldgMetricsOrgsDashboardRow2Col1_ctrl', {
	indexSelected : 0,
	gauge:null,
	items :null,
		
	afterViewLoad: function(){
		
		this.items = new Array();
		this.items.push({'panelTitle':getMessage("area_alloc"), 'dataSource':this.area_alloc_ds, 'field':'rm.area_alloc'});
		this.items.push({'panelTitle':getMessage("area_chargable"), 'dataSource':this.area_chargable_ds, 'field':'rm.area_chargable'});
		this.items.push({'panelTitle':getMessage("area_comn_nocup"), 'dataSource':this.area_comn_nocup_ds, 'field':'rm.area_comn_nocup'});
		this.items.push({'panelTitle':getMessage("area_comn_ocup"), 'dataSource':this.area_comn_ocup_ds, 'field':'rm.area_comn_ocup'});
		this.items.push({'panelTitle':getMessage("area"), 'dataSource':this.area_ds, 'field':'rm.area'});
		this.items.push({'panelTitle':getMessage("area_comn_rm"), 'dataSource':this.area_comn_rm_ds, 'field':'rm.area_comn_rm'});
		this.items.push({'panelTitle':getMessage("area_manual"), 'dataSource':this.area_manual_ds, 'field':'rm.area_manual'});
		this.items.push({'panelTitle':getMessage("area_comn_serv"), 'dataSource':this.area_comn_serv_ds, 'field':'rm.area_comn_serv'});
		this.items.push({'panelTitle':getMessage("area_comn"), 'dataSource':this.area_comn_ds, 'field':'rm.area_comn'});
		this.items.push({'panelTitle':getMessage("area_unalloc"), 'dataSource':this.area_unalloc_ds, 'field':'rm.area_unalloc'});
		
		//Create Gauge
		this.gauge = new Gauge(abBldgMetricsOrgsDashboardRow2Col1_ctrl, 'div_linear_gauge_org_row2col1', 'Horizontal' , 4);
		
		//set a reference of the Gauge to the main container
		View.getOpenerView().getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').row2col1_gauge = this.gauge;
    },
    
    /**
     * Event handler for 'selectMetricField' action
     */
	linearGaugeOrgPanelHtml_row2col1_onSelectMetricField: function(){
		
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-orgs-select-metrics.axvw',null, true, {
			width:400,
			height:350, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsOrgsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsOrgsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsOrgsSelectMetrics_row2col1;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("area_alloc", getMessage("area_alloc"));
                    dataSource.addParameter("area_chargable", getMessage("area_chargable"));
                    dataSource.addParameter("area_comn_nocup", getMessage("area_comn_nocup"));
                    dataSource.addParameter("area_comn_ocup", getMessage("area_comn_ocup"));
                    dataSource.addParameter("area", getMessage("area"));
                    dataSource.addParameter("area_comn_rm", getMessage("area_comn_rm"));
                    dataSource.addParameter("area_manual", getMessage("area_manual"));
                    dataSource.addParameter("area_comn_serv", getMessage("area_comn_serv"));
                    dataSource.addParameter("area_comn", getMessage("area_comn"));
                    dataSource.addParameter("area_unalloc", getMessage("area_unalloc"));
					
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
						this.bldgMetricsOrgsSelectMetrics_grid.setAllRowsSelected(false);
						row.select(selected);
						openerController.indexSelected = row.getIndex();
						
					};
					
					//Override 'onShowFieldsEvent' function from dialogController. This function is the event handler for 'onShowFields' action.
					dialogController.onShowFieldsEvent = function(){
						openerController.gauge.drawGauge();
						openerController.gauge.refreshGauge();
						openerController.linearGaugeOrgPanelHtml_row2col1.setTitle(openerController.items[openerController.indexSelected]['panelTitle']);
					}
				}
		});
		
	 }
	 
 });

 
 