View.createController('mapController', {
	
	mapControl: null,
	
	afterViewLoad: function(){
			var configObject = new Ab.view.ConfigObject();
			this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
		},
	
		afterInitialDataFetch: function() {

				var reportTargetPanel = document.getElementById("mapPanel");            
				reportTargetPanel.className = 'claro';
		},

		pr_list_onShowProperties: function(rows) {   
		
			var selectedRows = this.pr_list.getSelectedRows(rows);  
			
			var prMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('pr_ds');
			
			if( prMarkerProperty == null ){
				var infoWindowFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
				prMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('pr_ds', ['property.lat', 'property.lon'],'property.pr_id',infoWindowFields);

				// set marker options
				prMarkerProperty.showLabels = false;
				prMarkerProperty.symbolSize = 15;
				//var hexColors = colorbrewer.Reds[5];
				//var rgbColors = this.mapControl.colorbrewer2rgb(colorbrewer.Reds[5]);
				prMarkerProperty.symbolColors = this.mapControl.colorbrewer2rgb(colorbrewer.Reds[6]);

				//set thematic properties for prMarkerProperty
				//
				//parameters: 
				//thematicField. The value in whiche decides which thematic bucket the marker belongs to.  
				//thematicBuckets.  The arrary which holds the thematic buckets values.  
				//e.g. 	if thematicBuckets has 3 values: 10, 20, 30
						//		then there are 4 actual buckets
						//		0:  value < 10
						//		1:  10 <= value < 20
						//		2:  20 <= value < 30
						//		3:  30 <= value 
						//
						//the colors for symbols in different buckets are predefined
				var thematicBuckets = [200000, 7000000, 10000000, 22000000, 50000000];	 
				prMarkerProperty.setThematic('property.value_market', thematicBuckets); 
				
				//build the thematic legend which is an ext.window 
				this.mapControl.buildThematicLegend(prMarkerProperty);
			}
			
			var restriction = new Ab.view.Restriction();
			if(selectedRows.length !== 0 ) {
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
			}
			}
			else{
				restriction.addClause('property.pr_id', 'null', "=", "OR");
			}
			
			prMarkerProperty.setRestriction(restriction);
			this.mapControl.updateDataSourceMarkerPropertyPair('pr_ds', prMarkerProperty);
			this.mapControl.refresh();
		} 
})

