
var mapConfigObject = {

	// map loaded callback function
	//"mapLoadedCallback" : mapLoadedCallback,
	//
	//"mapInitExtent" : [-7914007,5213162,-7907176,5216812],
	//"mapInitExtentWKID" : 102100	
	
	// basemap layers	
	//"basemapLayerList" : [
	//	{ 	
	//		name: '',
	//		url: '',
	//		opacity: 1.0
	//	}
	//],

	// reference layers
	"referenceLayerList" : [
		{
			name: 'None'
		},
		{
			name: 'USA 1990-2000 Population Change',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'USA 2000-2010 Population Change',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_2000-2010_Population_Change/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'USA Average Household Size',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Average_Household_Size/MapServer',
			opacity: 0.75,
			index: 90
		},
		/**{
			name: 'USA Diversity Index',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Diversity_Index/MapServer',
			opacity: 0.75,
			index: 90
		},*/
		/**{
			name: 'USA Labor Force Participation Rate',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer',
			opacity: 0.75,
			index: 90
		},*/
		{
			name: 'USA Median Age',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Median_Age/MapServer',
			opacity: 0.75,
			index: 90
		},		
		{
			name: 'USA Median Household Income',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Median_Household_Income/MapServer',
			opacity: 0.75,
			index: 90
		},		
		/**{
			name: 'USA Median Net Worth',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Median_Net_Worth/MapServer',
			opacity: 0.75,
			index: 90
		},*/
		{
			name: 'USA Owner Occupied Housing',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'USA Percent over 64',
			url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'USA Percent under 18',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Percent_Under_18/MapServer',
			opacity: 0.75,
			index: 90
		},
		/**{
			name: 'USA Population by Sex',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_by_Sex/MapServer',
			opacity: 0.75,
			index: 90
		},*/
		{
			name: 'USA Population Density',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer',
			opacity: 0.75,
			index: 90
		},
		/**{
			name: 'USA Projected Population Change',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Projected_Population_Change/MapServer',
			opacity: 0.75,
			index: 90
		},*/		
		{
			name: 'USA Recent Population Change',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Recent_Population_Change/MapServer',
			opacity: 0.75,
			index: 90
		},		
		/**{
			name: 'USA Retail Spending Potential',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer',
			opacity: 0.75,
			index: 90
		},*/		
		/**{
			name: 'USA Social Vulnerability Index',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer',
			opacity: 0.75,
			index: 90
		},*/		
		{
			name: 'USA Tapestry Segmentation',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Tapestry/MapServer',
			opacity: 0.75,
			index: 90
		},		
		/**{
			name: 'USA Unemployment Rate',
			url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Unemployment_Rate/MapServer',
			opacity: 0.75,
			index: 90
		},*/		
		{
			name: '----'
		},	
		{
			name: 'USDA NRCS Soil Survey',
			url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer',
			opacity: 0.75,
			index: 90
		},	
		{
			name: 'USDHS FEMA 100 Year Flood Zones',
			url: 'https://maps3.arcgisonline.com/ArcGIS/rest/services/A-16/FEMA_100-Year_Flood_Zones_in_the_USA/MapServer',
			opacity: 0.75,
			index: 90
		},
		{
			name: 'USGS Earthquake Feed (last 90 days)',
			url: 'https://tmservices1.esri.com/arcgis/rest/services/LiveFeeds/EarthquakesNT/MapServer',
			opacity: 0.75,
			index: 90
		}	
	]

};
