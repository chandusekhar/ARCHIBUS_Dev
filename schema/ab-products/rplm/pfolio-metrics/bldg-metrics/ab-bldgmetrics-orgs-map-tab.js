var mapConfigObject = {
	"mapLoadedCallback" : mapLoadedCallback
};

var abBldgMetricsOrgsMap_ctrl = View.createController('abBldgMetricsOrgsMap_ctrl', {
	// Ab.flash.Map control instance
	map: null,
	
	indexSelected:null,
	
	afterViewLoad: function(){
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('htmlOrgsMap', 'objOrgsMap', configObject);	
		
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').mapControl = this.map;
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').map_ctrl = abBldgMetricsOrgsMap_ctrl;

		// basemap layer menu
		var basemapLayerMenu = abBldgMetricsOrgsMap_ctrl.htmlOrgsMap.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = abBldgMetricsOrgsMap_ctrl.map.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	abBldgMetricsOrgsMap_ctrl.map.switchBasemapLayer(item.text);
    },
	
	htmlOrgsMap_onHighlightByMetric: function(){
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-orgs-select-metrics.axvw',null, true, {
			width:400,
			height:500, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsOrgsSelectMetrics_ctrl');
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_orgsAllMetrics;
					var gridPanel = dialogController.bldgMetricsOrgsSelectMetrics_grid;
					
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
                    dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
                    dataSource.addParameter("em_headcount", getMessage("employee_headcount"));
                    dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
                    dataSource.addParameter("area_per_em", getMessage("area_per_em"));
                    dataSource.addParameter("fci", getMessage("fci"));
					
					dialogController.dataSource = dataSource;
					
					
					//Override 'selectRows' function from dialogController.
					dialogController.selectRows = function(){
					
						if (openerController.indexSelected) {
							gridPanel.enableSelectAll(false);
							gridPanel.rows[openerController.indexSelected].row.select(true);
							gridPanel.updateHeight();
						}
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
						
						if(openerController.indexSelected){
							
							// remove thematic legend
							openerController.map.removeThematicLegend();

							var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('abBldgMetricsOrgsMap_ds', ['rm.lat', 'rm.lon'], ['rm.bl_id'], ['rm.bl_id', 'rm.area', 'rm.chargeable_cost', 'rm.em_headcount', 'rm.fci']);				
							//markerProperty.setSymbolType('diamond');
							markerProperty.showLabels = false;
							
							openerController.map.updateDataSourceMarkerPropertyPair('abBldgMetricsOrgsMap_ds', markerProperty);
							
							//set thematic colors
							var hexColors = colorbrewer.YlOrRd[3];
							var rgbColors = abBldgMetricsOrgsMap_ctrl.map.colorbrewer2rgb(hexColors);
							markerProperty.symbolColors = rgbColors;

							var fieldSelected = View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').fieldsArray[openerController.indexSelected];
							var avgFieldValue = View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').bldgMetricsOrgsStatistics_form.getFieldValue(fieldSelected+"_avg");
							var maxFieldValue = View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').bldgMetricsOrgsStatistics_form.getFieldValue(fieldSelected+"_max");
							
							//set thematic buckets interval
							var thematicBuckets = [avgFieldValue, maxFieldValue];	 
							markerProperty.setThematic(fieldSelected, thematicBuckets); 
		
							//build thematic legend
							openerController.map.buildThematicLegend(markerProperty);
	
							openerController.abBldgMetricsOrgsMap_ds.addParameter('treeSelection', View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').restriction);
							openerController.map.refresh("1=1");
						}
						
					}
				}
		});
	} 
})



/**
 * This function is called from the JS map control after it is loaded. 
 * 
 */
function mapLoadedCallback(){
	
	abBldgMetricsOrgsMap_ctrl.map.map.infoWindow.resize(350,250);

	var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('abBldgMetricsOrgsMap_ds', ['rm.lat', 'rm.lon'], ['rm.bl_id'], ['rm.site_id', 'rm.pr_id','rm.bl_id','rm.bl_name','rm.address', 'rm.area', 'rm.chargeable_cost', 'rm.em_headcount', 'rm.fci']);
	markerProperty.showLabels = false;

	abBldgMetricsOrgsMap_ctrl.map.updateDataSourceMarkerPropertyPair('abBldgMetricsOrgsMap_ds', markerProperty);	
	abBldgMetricsOrgsMap_ctrl.abBldgMetricsOrgsMap_ds.addParameter('treeSelection', View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').restriction);
	
	abBldgMetricsOrgsMap_ctrl.map.refresh("1=1");
		
}