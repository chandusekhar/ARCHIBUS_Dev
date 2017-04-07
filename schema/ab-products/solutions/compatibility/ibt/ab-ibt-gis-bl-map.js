var map = null;
var menu;

//loads the ArcWeb Explorer SWF map
function user_form_onload()
{	
	var mapPanel = AFM.view.View.getControl('', 'object_map');	
	
	//createHeader(mapPanel);	
	
	if( mapPanel != null )
	{ 
		map = new Map("explorer");
	}	
}

function getMarkerLabel(pk, address1, city, state, country)
{
	var parameters ={	tableName: 'bl',
							fieldNames: toJSON(['bl.bl_id',  'bl.address1','bl.city_id','bl.state_id',	'bl.ctry_id']),
							restriction: toJSON('1=2')
						};
	
   	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
	if (result.code == 'executed')
	{   	
	   	var label = result.data.columns[0].name + ": " + pk + "\n" +
	   		result.data.columns[1].name + ": " + address1 +  "\n" +
	   		result.data.columns[2].name+ ": " + city +  "\n" +
	   		result.data.columns[3].name + ": " + state +  "\n" +
	   		result.data.columns[4].name + ": " + country;
		
	    //myMarker.data = {label : label}; 
	    return label;   
    }
	else
	{
		AFM.workflow.Workflow.handleError(result);
		return "";
	} 
}

function getMarkerLabelFromRow(dataRow)
{
    var id = dataRow['bl.bl_id'];
	var address = dataRow['bl.address1'];
	var city = dataRow['bl.city_id'];
	var state = dataRow['bl.state_id'];
	var country = dataRow['bl.ctry_id'];
	var label = getMarkerLabel(id, address, city, state, country);
    return label;
}

function showObjectsOnMap(rows)
{	
	for (var i = 0; i < rows.length; i++) 
    {
		try
        {
  			var dataRow = rows[i];
            var label = getMarkerLabelFromRow(dataRow);
            
            var id = dataRow['bl.bl_id'];
            var lat = dataRow['bl.lat'];
	        var lon = dataRow['bl.lon'];
		 	
		 	if(lat != "" && lon != "")	{
		 		if(map != null){
					map.createNewMarker(id, lat, lon, label);
				}
		 	}
  		}
  		catch ( ex ){}
	}
    
	try
	{
		map.renderMarkers();
	}
	catch(ex){}			
}


function showObjectsForBothPanelOnMap(rows, bottomRows)
{	
	//middle panel -- label marker
	for (var i = 0; i < rows.length; i++) 
    {
		try
        {
  			var dataRow = rows[i];
            var label = getMarkerLabelFromRow(dataRow);
            
            var id = dataRow['bl.bl_id'];
            var lat = dataRow['bl.lat'];
	        var lon = dataRow['bl.lon'];
		 	
		 	if(lat != "" && lon != "")	{
		 		if(map != null){
					map.createNewMarker(id, lat, lon, label);
				}
		 	}
  		}
  		catch ( ex ){}
	}
    
    //bottom panel -- image marker
	for (var i = 0; i < bottomRows.length; i++) 
    {
		try
        {
  			var dataBottomRows = bottomRows[i];
            
            var id = dataBottomRows['em.em_id'];
            var lat = dataBottomRows['em.lat'];
	        var lon = dataBottomRows['em.lon'];
		 	
		 	if(lat != "" && lon != "")	{
		 		if(map != null){
					map.createNewImageMarker(id, lat, lon);
				}
		 	}
  		}
  		catch ( ex ){}
	}
    
	try
	{
		if(rows.length == 0){
			map.renderMarkers();
		}
		else{
			var dataRow = rows[0];
            var lat = dataRow['bl.lat'];
	        var lon = dataRow['bl.lon'];
		
			map.renderMarkers(lat, lon);
		}
	}
	catch(ex){}		
}

function setRestrictions(blId)
{
	var frame = getFrameObject(parent, 'middleSelectionFrame');
	frame.controller.setRestrictions(blId);
	frame.controller.getTabsFrame().setAllTabsEnabled(true);
}



