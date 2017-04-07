//enable_default_form_onload = false;

function applyRestriction() {

    var top_console = AFM.view.View.getControl('', 'top_console');
    
    var lease_type = top_console.getFieldValue('ls.lease_type');
    var city_id = top_console.getFieldValue('bl.city_id');
    var state_id = top_console.getFieldValue('bl.state_id');
    var ctry_id = top_console.getFieldValue('bl.ctry_id');

    var restriction = new AFM.view.Restriction();
    
    if (lease_type != '' && lease_type != null && lease_type != "--NULL--" && lease_type != "N/A") {
        restriction.addClause('ls.lease_type', lease_type + '%', 'LIKE');
    }
    if (city_id != '') {
        restriction.addClause('bl.city_id', city_id + '%', 'LIKE');
    }
    if (state_id != '') {
        restriction.addClause('bl.state_id', state_id + '%', 'LIKE');
    }
    if (ctry_id != '') {
        restriction.addClause('bl.ctry_id', ctry_id + '%', 'LIKE');
    }

    var object_list = AFM.view.View.getControl('bottomSelectionFrame', 'object_list');
    object_list.refresh(restriction);
}


//var controlPanel;
//var controlFrame;
var mapFrame;

function user_form_onload()
{
	//controlPanel = AFM.view.View.getControl('bottomSelectionFrame', 'object_list');
	//controlFrame = getFrameObject(parent, "bottomSelectionFrame");
	//mapFrame = getFrameObject(parent, "detailsFrame");
	
	onloadHelper();
	
	setOnlyMapTabVisible();
}

function getControlPanel()
{
	try
	{
		var controlFrame = getFrameObject(parent, 'bottomSelectionFrame');	
		var controlPanel = AFM.view.View.getControl(controlFrame , 'object_list');
		return controlPanel;
	}
	catch(ex)
	{
		return null;
	}
}

function onloadHelper() {
    window.tabs = getFrameObject(parent, 'tabsFrame');               

  	/*window.tabs.restriction = ""; 
	window.tabs.setTabsRestriction(null, "myleases");       
    */
    
    if (window.tabs == null) {
        alert("This view can only be used as a part of the Abstract Builder wizard");
    }
}

function setTabsVisible() {
		window.tabs.setTabVisible("identity", true);
		window.tabs.setTabVisible("documents", true);
		window.tabs.setTabVisible("addresses", true);
		window.tabs.setTabVisible("clauses", true);
		window.tabs.setTabVisible("options", true);
		window.tabs.setTabVisible("acct", true);
}

function setOnlyMapTabVisible()
{
	try{
		if(window.tabs.getSelectedTabName() != 'map_tab')
		{			 
			window.tabs.selectTab('map_tab');			
		}
		window.tabs.setTabVisible("identity", false);
		window.tabs.setTabVisible("documents", false);
		window.tabs.setTabVisible("addresses", false);
		window.tabs.setTabVisible("clauses", false);
		window.tabs.setTabVisible("easements", false);
		window.tabs.setTabVisible("options", false);
		window.tabs.setTabVisible("acct", false);
	}catch(ex){}
}

function showAllObjects()
{
	var controlPanel = getControlPanel();
	var rows = controlPanel.rows;
	
	setOnlyMapTabVisible();
    window.tabs.restriction = '';
	
	var mapFrame = getMapFrame();
	if(mapFrame == null)
	{
		setTimeout('showAllObjects()', 1000);
		return;
	}
	mapFrame.showAllObjectsOnMap(rows);	
}

function showSelectedObjects()
{	
	var controlPanel = getControlPanel();
	var rows = controlPanel.rows;
	var selectedRowIndex = controlPanel.selectedRowIndex;
	if(window.tabs.getSelectedTabName() == 'map_tab')
	{
		if(getMapFrame() != null)
			getMapFrame().showSelectedObjectsOnMap(rows, selectedRowIndex);
		setTabsVisible();
	}
	window.tabs.restriction = {"ls_id": rows[selectedRowIndex]['ls.ls_id']};
	if(window.tabs.getSelectedTabName() != 'map_tab')
		AFM.view.View.selectTabPage(window.tabs.getSelectedTabName());
}

function getMapFrame()
{	
	var frame = getFrameObject(parent, "viewFrame");
	mapFrame = getFrameObject(frame, "detailsFrame");
		
	try
	{
		if(!mapFrame.isMapLoaded)
			return null;
		//mapFrame.dummy();
		//mapFrame.mapLoaded();			
	}
	catch(ex)
	{
		return null;
	}
	return mapFrame;
}

