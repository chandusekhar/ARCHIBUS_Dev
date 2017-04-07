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
		map.onMarkerClick = onMarkerClick;
	}	
}

function getMarkerLabel(pk)
{
	var parameters ={	tableName: 'project',
							fieldNames: toJSON(['project.project_id']),
							restriction: toJSON('1=2')
						};
	
   	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
	if (result.code == 'executed')
	{   	
	   	var label = result.data.columns[0].name + ": " + pk;
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
    var id = dataRow['project.project_id'];
	var label = getMarkerLabel(id);
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
            
            var id = dataRow['project.project_id'];
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


function showObjectsImagesOnMap(rows)
{	
	for (var i = 0; i < rows.length; i++) 
    {
		try
        {
  			var dataRow = rows[i];
            
            var id = dataRow['project.project_id'];
            var lat = dataRow['bl.lat'];
	        var lon = dataRow['bl.lon'];
		 	
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
		map.renderMarkers();
	}
	catch(ex){}			
}


//handling the click event on the marker
function onMarkerClick( event )
{
	var restriction = {
        'project.project_id': event.id
    };
    
    var allowCreateRecord = false;
    var defaultDialogX = 20;
    var defaultDialogY = 40;
    var defaultDialogWidth = 800;
    var defaultDialogHeight = 600;         
    AFM.view.View.openDialog('ab-ibt-gis-project-details.axvw', restriction, allowCreateRecord, defaultDialogX, defaultDialogY, defaultDialogWidth, defaultDialogHeight);   	
}

function setRestrictions(projectId)
{
	var frame = getFrameObject(parent, 'middleSelectionFrame');
	frame.controller.setRestrictions(projectId);
	frame.controller.getTabsFrame().setAllTabsEnabled(true);
}



