var myMarkerStyle;
var mapFrameName = "detailsFrame";

var isMapLoaded = false;
var explorer_Map;

//function dummy(){}

//function mapLoaded()
//{
//	getFrameObject(parent, mapFrameName).myMap.getScale();
//}
//function waitToLoadMap()
//{
//	while(isMapLoaded == false)
//		var i = 1 + 1; //dummy code
//}

//loads the ArcWeb Explorer SWF map
function user_form_onload()
{
	// MG Modified 12-5-7
	var mapPanel = AFM.view.View.getControl('', 'object_map');	
	
	createHeader(mapPanel);
	
	if( mapPanel != null )
	{ 
		var key_value = get_key();
		if(key_value !="")
		{
	 		AWUtils.insertMap("explorer", key_value);
	 		explorer_Map = document.getElementById('explorer_Map');
		}
	}
	//createMenu();
}


function onCreationComplete()
{
	//creating an instance of AWMap
	myExplorer = new AWMap('explorer');

	myMarkerStyle = new AWImgMarkerStyle();
	myMarkerStyle.id = "myMarkerStyleId";
	myMarkerStyle.source = "http://www.arcwebservices.com/awx/images/id-g.png";
	myMarkerStyle.mouseOverSource = "http://www.arcwebservices.com/awx/images/id-r.png";
		  	
	myMarkerStyle.mouseClick = "onMarkerClick";
		    
	// Register the style with the map.
	myExplorer.addMarkerStyle(myMarkerStyle);

	//get map frame and save the map to the frame
	var mapFrame = getFrameObject(parent, mapFrameName);
	mapFrame.myMap = myExplorer;

	//setting the center and scale of the map
	var myLatLon = new AWLatLon(39.954014, -75.143037);
	myExplorer.centerAndScale(myLatLon, 200000);
	
	//navigator
	//myExplorer.showWidget(AWMap.WIDGET_NAVIGATION, 0, 0);
	
	//var map = document.getElementById("explorer_Map");	
	//map.wmode="opaque";
	
	var tabsFrame = getFrameObject(parent, 'tabsFrame');
	if(tabsFrame.restriction != '' && tabsFrame.restriction != null)
	{
		//alert(tabsFrame.restriction.clauses[tabsFrame.restriction.findClause('property.pr_id')].value);
		var pr_id = tabsFrame.restriction.clauses[tabsFrame.restriction.findClause('property.pr_id')].value;
		var parameters ={	tableName: 'property',
							fieldNames: toJSON(['property.pr_id', 'property.lat', 'property.lon', 'property.value_market','property.income_total','property.area_bl_est_rentable',
									'property.cost_operating_total']),
							restriction: toJSON({'property.pr_id':pr_id})
						};     
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
		if (result.code == 'executed') 
		{
	    	var record = result.data.records[0];
	      	var lat = record['property.lat'];
	      	var lon = record['property.lon'];
	      	
	      	try
		  	{
				myExplorer.centerAndScale(new AWLatLon(lat, lon), 200000);		
				myExplorer.addMarker(create_marker(record)); 				
			}
		  	catch ( ex )
		  	{
				alert(ex.message);
			}
	   	}
		else 
		{
	  		AFM.workflow.Workflow.handleError(result);
	   	}
	}
	
	isMapLoaded = true;
	
}

//
// handle selected objects 
// 
function showSelectedObjectsOnMap(rows,selectedRowIndex)
{
	var mapFrame = getFrameObject(parent, mapFrameName);
	myExplorer = mapFrame.myMap;
	
	myExplorer.removeAllMarkers();
	
	// get current data row
	var dataRow = rows[selectedRowIndex];
	var lat = dataRow['property.lat'];
	var lon = dataRow['property.lon'];
	
	//
	//map and marker
	//
	try
  	{
		myExplorer.centerAndScale(new AWLatLon(lat, lon), 200000);

		myExplorer.addMarker(create_marker(dataRow)); 
		
		//navigator
		//myExplorer.showWidget(AWMap.WIDGET_NAVIGATION, 0, 0);
		
	}
  	catch ( ex )
  	{
		alert(ex.message);
	}
}


function showAllObjectsOnMap(rows)
{	
	//waitToLoadMap();
	
	var minLat;
	var maxLat;
	var minLon;
	var maxLon;
	
	var mapFrame = getFrameObject(parent, mapFrameName);
	myExplorer = mapFrame.myMap;
	
	myExplorer.removeAllMarkers();
	
	var markerArray = new Array();
	for (var i = 0; i < rows.length; i++) 	
	{
		// get current building data row
		var dataRow = rows[i];
	 	var lat = dataRow['property.lat'];
	 	var lon = dataRow['property.lon'];
	 	
	 	if(lat != "" && lon != "")
	 	{
	 		nothingToShow = false;
	 			
	 		markerArray.push(create_marker(dataRow));		
				
			if( i == 0 )
			{
				minLat = lat;
				maxLat = lat;
				minLon = lon;
				maxLon = lon;
			}
			else
			{
				if( lat > maxLat ) 
				{
					maxLat = lat;
				} 
				if( lat < minLat )
				{
					minLat = lat;
				}
							
				if( lon > maxLon ) 
				{
					maxLon = lon;
				} 
				if( lon < minLon )
				{
					minLon = lon;
				}
			}
		}//end if(lat != null && lon != null)
	}//end for (var i = 0; i < rows.length; i++) 	
	
	myExplorer.addMarker(markerArray);
		
	var centerLat = parseFloat(minLat) + parseFloat(maxLat);
	var centerLon = parseFloat(minLon) + parseFloat(maxLon);
	var myLatLon = new AWLatLon( centerLat/2, centerLon/2);
	myExplorer.recenterOrPanToLatLon( myLatLon ) 
}

//handling the click event on the marker
function onMarkerClick( event )
{
	var allowCreateRecord = false;
    var defaultDialogX = 20;
    var defaultDialogY = 40;
    var defaultDialogWidth = 800;
    var defaultDialogHeight = 600;
   	var restriction = {
        'property.pr_id':event.id
    };
    
    setRestrictions(restriction);
        
    AFM.view.View.openDialog('ab-ex-gis-gis_properties_detail_dialog.axvw', restriction, allowCreateRecord, defaultDialogX, defaultDialogY, defaultDialogWidth, defaultDialogHeight);   	
}

function setRestrictions(restriction)
{
	var tabsFrame = getFrameObject(parent, 'tabsFrame');
    tabsFrame.setAllTabsEnabled(true);
    var tabsRestriction = new AFM.view.Restriction();
	tabsRestriction.addClause('property.pr_id', restriction['property.pr_id']);	
    tabsFrame.restriction = tabsRestriction;
    
    var restLeases = "<restrictions><restriction type=\"sql\" sql=\"ls.bl_id IN (select bl_id From bl Where bl.pr_id = '" + restriction['property.pr_id'] + "')\"/></restrictions>";
    var restBuildings = "<restrictions><restriction type=\"sql\" sql=\"bl.pr_id = '" + restriction['property.pr_id'] + "'\"/></restrictions>";
    var restParcels = "<restrictions><restriction type=\"sql\" sql=\"parcel.pr_id = '" + restriction['property.pr_id'] + "'\"/></restrictions>";
    
    tabsFrame.setTabsRestriction(restLeases, "leases_tab");
    tabsFrame.setTabsRestriction(restBuildings, "buildings_tab");
    tabsFrame.setTabsRestriction(restParcels, "parcels_tab");
}


//create marker according to the datarow
function create_marker(dataRow)
{
	var pk = dataRow['property.pr_id'];
	var lat = dataRow['property.lat'];
	var lon = dataRow['property.lon'];
	var value_market = dataRow['property.value_market'];
	var income_total = dataRow['property.income_total'];
	var area_bl_est_rentable = dataRow['property.area_bl_est_rentable'];
	var cost_operating_total = dataRow['property.cost_operating_total'];

	var myMarker = new AWMarker();
	myMarker.markerStyleId = "myMarkerStyleId";
	myMarker.id = pk;
	myMarker.latlon = new AWLatLon(lat, lon);
	
	var parameters ={	tableName: 'property',
							fieldNames: toJSON(['property.pr_id',  'property.value_market','property.income_total','property.area_bl_est_rentable',	'property.cost_operating_total']),
							restriction: toJSON('1=2')
						};
	
   	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
	if (result.code == 'executed')
	{   	
	   	var label = result.data.columns[0].name + ": " + pk + "\n" +
	   		result.data.columns[1].name + ": " + value_market +  "\n" +
	   		result.data.columns[2].name+ ": " + income_total +  "\n" +
	   		result.data.columns[3].name + ": " + area_bl_est_rentable +  "\n" +
	   		result.data.columns[4].name + ": " + cost_operating_total;
		
	    myMarker.data = {label : label};    
    }
	else
	{
		AFM.workflow.Workflow.handleError(result);
	} 
    
    return myMarker;
}
