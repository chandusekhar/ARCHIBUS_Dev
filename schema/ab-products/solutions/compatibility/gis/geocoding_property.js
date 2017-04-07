var myExplorer;    //the ESRI map 
var mapPanel;      //the right side panel which holds the map
var controlPanel;  //the left side panel which displays the object list
  
var locationSeq = 0;
var latArray = new Array();
var lonArray = new Array();

//loads the ArcWeb Explorer SWF map
function user_form_onload()
{
	mapPanel = Ab.view.View.getControl('', 'object_map');
	
	if ( mapPanel != null ) { 
		var key_value = get_key();
		if (key_value !="") {
	 		AWUtils.insertMap("explorer", key_value);
		}
	}
}

function onCreationComplete()
{
	//creating an instance of AWMap
	myExplorer = new AWMap('explorer');

	//get map panel and save the map to the panel
	var mapPanel = Ab.view.View.getControl('', 'object_map');
	mapPanel.myMap = myExplorer;

	//setting the center and scale of the map
	var myLatLon = new AWLatLon(39.954014, -75.143037);
	myExplorer.centerAndScale(myLatLon, 20000);
	
	//navigator
	myExplorer.showWidget(AWMap.WIDGET_NAVIGATION, 0, 0);
}

function doGeoCoding() 
{
	//get the original map
	var mapPanel = Ab.view.View.getControl('', 'object_map');
	myExplorer = mapPanel.myMap;
	
	//get the table data from control panel
	controlPanel = Ab.view.View.getControl('', 'object_list');
	var rows = controlPanel.rows;
	
	var row;
	var pr_id;
	var street;
	var city_id;
	var state_id;
	var ctry_id;
	var finalAddress;
	
	for (var r = 0; r < rows.length; r++) 
	{
		row = rows[r];
		
		pr_id = row['property.pr_id'];
		street = row['property.street'];
		city_id = row['property.city_id'];
		state_id = row['property.state_id'];
		ctry_id = row['property.ctry_id'];
		finalAddress = street + ", " + city_id + ", " + state_id;
		
		var location = new AWLocation();
	 	location.location = finalAddress;
 		myExplorer.findLocation(location, "onFindLocation"); 
	}
}

// function to pan to location geocoded by the findLocation method
function onFindLocation( event)
{
	//get the table data from control panel
	controlPanel = Ab.view.View.getControl('', 'object_list');
	var rows = controlPanel.rows;

	var mapPanel =  Ab.view.View.getControl('', 'object_map');
	var lat = event.lat;
	var lon = event.lon;
	
	latArray[locationSeq] = lat;
	lonArray[locationSeq] = lon;
	locationSeq++;

	//get the map panel and save the array of lan/lon to the panel
	mapPanel.myLatArray = latArray;
	mapPanel.myLonArray = lonArray;
	
	myExplorer.recenterOrPanToLatLon(new AWLatLon(lat, lon));
	
	//if all geocodings are done, we save data to database
	if(rows.length == locationSeq)
	{
		// loop through all buildings shown in the report and save lat/lon to the database
	    for (var i = 0; i < rows.length; i++) 
	    {
	        // get current building data row
	        var dataRow = rows[i];
	        
	        // create record to be saved and copy PK value from the data row
	        var record = {};
	        record['property.pr_id'] = dataRow['property.pr_id'];
	        
	      	if (latArray[i] != null && lonArray[i] != null )
	        {
	        	record['property.lat'] = latArray[i];
	        	record['property.lon'] = lonArray[i];
	
	        	// call WFR to save updated building record
	       	 	var parameters = {
	            	tableName: 'property',
	            	fields: toJSON(record)
	        	};
	
	        	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
	        	if (result.code != 'executed') {
	            	Ab.workflow.Workflow.handleError(result);
	            	break;
	        	}
	        }
	    }
	
	}//end if 	
}	

