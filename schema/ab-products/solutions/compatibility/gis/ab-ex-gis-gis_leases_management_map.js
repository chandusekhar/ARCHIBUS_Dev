//enable_default_form_onload = false;
var isMapLoaded = false;
var explorer_Map;

//loads the ArcWeb Explorer SWF map
function user_form_onload()
{
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
	var mapFrame = getFrameObject(parent, "detailsFrame");
	mapFrame.myMap = myExplorer;

	//setting the center and scale of the map
	var myLatLon = new AWLatLon(39.954014, -75.143037);
	myExplorer.centerAndScale(myLatLon, 200000);
	
	//navigator
	//myExplorer.showWidget(AWMap.WIDGET_NAVIGATION, 0, 0);
	
	var tabsFrame = getFrameObject(parent, 'tabsFrame');
	if(tabsFrame.restriction != '' && tabsFrame.restriction != null)
	{
		var ls_id = tabsFrame.restriction['ls_id'];
		var parameters ={	tableName:  'ls',
							fieldNames: toJSON(['ls.area_rentable',	'ls.area_usable', 'ls.amount_base_rent', 'ls.bl_id']),
							restriction: toJSON({'ls.ls_id':ls_id})
						};     
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
		if (result.code == 'executed') 
		{
			var record = result.data.records[0];
			var bl_id = record['ls.bl_id'];
            if(bl_id != null && bl_id != "")
            {
			
                var parameters ={tableName: 'bl',
                                fieldNames: toJSON(['bl.lat', 'bl.lon', 'bl.bl_id', 'bl.name', 'bl.address1', 'bl.address2']),
                                restriction: toJSON({'bl.bl_id': bl_id})
                            };     
        
                var result1 = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
                
                if (result1.code == 'executed') 
                {
                    var record1 = result1.data.records[0];
                    var lat = record1['bl.lat'];
                    var lon = record1['bl.lon'];
                    
                    var data = new Object();
                    data['bl.lat'] = lat;
                    data['bl.lon'] = lon;
                    data['ls.ls_id'] = ls_id;
                    data['bl.bl_id'] = bl_id;
                    data['bl.name'] = record1['bl.name'];
                    data['bl.address1'] = record1['bl.address1'];
                    data['bl.address2'] = record1['bl.address2'];
                    data['ls.area_rentable'] = record['ls.area_rentable'];
                    data['ls.area_usable'] = record['ls.area_usable'];
                    data['ls.amount_base_rent'] = record['ls.amount_base_rent'];
                    
                    
                    try
                    {
                        myExplorer.centerAndScale(new AWLatLon(lat, lon), 200000);		
                        myExplorer.addMarker(create_marker(data)); 				
                    }
                    catch ( ex )
                    {
                        alert(ex.message);
                    }
                }
                else 
                {
                    AFM.workflow.Workflow.handleError(result1);
                }
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
// handle selected records 
// 
function showSelectedObjectsOnMap(rows, selectedRowIndex) 
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	
	myExplorer.removeAllMarkers();
	
	// get current data row
	var dataRow = rows[selectedRowIndex];
	var lat = dataRow['bl.lat'];
	var lon = dataRow['bl.lon'];
	
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

//
// handle all records
// 
function showAllObjectsOnMap(rows)
{
	var minLat;
	var maxLat;
	var minLon;
	var maxLon;
	
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	
	myExplorer.removeAllMarkers();	
	var markerArray = new Array();
	
	for (var i = 0; i < rows.length; i++) 	
	{
		// get current building data row
		var dataRow = rows[i];
	 	var lat = dataRow['bl.lat'];
	 	var lon = dataRow['bl.lon'];
	 		
	 	if(lat != "" && lon != "")
	 	{	
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

function onMarkerClick( event )
{
	var tabsFrame = getFrameObject(parent, 'tabsFrame');
	tabsFrame.restriction = {'ls_id': event.id};
	tabsFrame.setTabVisible("identity", true);
	tabsFrame.setTabVisible("documents", true);
	tabsFrame.setTabVisible("addresses", true);
	tabsFrame.setTabVisible("clauses", true);
	tabsFrame.setTabVisible("options", true);
	tabsFrame.setTabVisible("acct", true);
}

//create marker according to the datarow
function create_marker(dataRow)
{
	var lat = dataRow['bl.lat'];
	var lon = dataRow['bl.lon'];
	var pk = dataRow['ls.ls_id'];
	//var tn_name = dataRow['ls.tn_name'];
	//var amount_base_rent = dataRow['ls.amount_base_rent'];
	//var area_negotiated = dataRow['ls.area_negotiated'];
	//var date_end = dataRow['ls.date_end'];

	//creating an instance of AWMarker and adding it to the map
	var myMarker = new AWMarker();
	myMarker.markerStyleId = "myMarkerStyleId";
	myMarker.id = pk;
	myMarker.latlon = new AWLatLon(lat, lon);
	
    //var labelText = "tn_name: " + tn_name + "\namount_base_rent: " + amount_base_rent; 
   	//var label = {             
    //               text : labelText,
    //               icon : "http://www.arcwebservices.com/awx/images/id-g.png"
    //            };
   	//var elements = new Array(1);          
  	//var element = {      
    //        			type: "text", 
    //                  	text: "area_negotiated:" + area_negotiated + "\ndate_end:" + date_end
    //            	};
  	//elements[0] = element;
  	
  		var parameters ={	tableName:  'ls',
							fieldNames: toJSON(['ls.area_rentable',	'ls.area_usable', 'ls.amount_base_rent']),
							restriction: toJSON('1=2')
						};     
	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
		if (result.code == 'executed') 
		{			
			var parameters ={tableName: 'bl',
							fieldNames: toJSON(['bl.bl_id', 'bl.name', 'bl.address1', 'bl.address2']),
							restriction: toJSON('1=2')
						};     
	
			var result1 = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
			
	    	if (result1.code == 'executed') 
			{
      	
			  	var text = result1.data.columns[0].name + ": " + getValueIfExists(dataRow['bl.bl_id'], '') + "\n" + 
			  		result1.data.columns[1].name + ": " + getValueIfExists(dataRow['bl.name'], '') + "\n" + 
			  		result1.data.columns[2].name + ": " + getValueIfExists(dataRow['bl.address1'], '') + "\n" +
			  		result1.data.columns[3].name + ": " + getValueIfExists(dataRow['bl.address2'], '') + "\n" +
			  		result.data.columns[0].name + ": " + getValueIfExists(dataRow['ls.area_rentable'], '') + "\n" +
			  		result.data.columns[1].name + ": " + getValueIfExists(dataRow['ls.area_usable'], '') + "\n" +
			  		result.data.columns[2].name + "/" + result.data.columns[1].name + ": " + getValueIfExists(divide(dataRow['ls.amount_base_rent'], dataRow['ls.area_usable']), '');
			  	
			  	myMarker.data = {label: text};
		  	}
			else 
			{
		  		AFM.workflow.Workflow.handleError(result);
		   	}
	   	}
		else 
		{
	  		AFM.workflow.Workflow.handleError(result);
	   	}
  	//myMarker.data = { title : {text: "aaa\nbbb"}};
  	//myMarker.data = {elements: [{type:"icon", src:"http://www.arcwebservices.com/awx/images/id-g.png"},{type:"text", text: "aaa"}]};
  	
  	return myMarker;

}

function divide(str1, str2)
{
	if(valueExists(str1) && valueExists(str2))
	{
		if(parseFloat(str2) != 0)
			return parseFloat(str1)/parseFloat(str2);			
	}
	return '';
}