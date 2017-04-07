//var controlPanel;
//var controlFrame;
var mapFrame;
var tabsFrame;
//var mapFrameName = "viewFrame";

function user_form_onload()
{
	// added getFrameObject for resolving occasional error in getControl() MG 12-5-7
	
	//getControlFrame();
	setOnlyMapTabEnabled();	
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

function showAllObjects()
{
	var controlPanel = getControlPanel();
	var rows = controlPanel.rows;	
	setOnlyMapTabEnabled();
	getTabsFrame().restriction = '';
	var mapFrame = getMapFrame()
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
	if(getTabsFrame().getSelectedTabName() == 'map_tab')
	{
		if(getMapFrame() != null)
			getMapFrame().showSelectedObjectsOnMap(rows, selectedRowIndex);	
		getTabsFrame().setAllTabsEnabled(true);	
	}
	var restriction = new AFM.view.Restriction();
	restriction.addClause('property.pr_id', rows[selectedRowIndex]['property.pr_id']);
	getTabsFrame().restriction = restriction;
	setLeasesRestriction(rows[selectedRowIndex]['property.pr_id']);
	setBuildingsRestriction(rows[selectedRowIndex]['property.pr_id']);
	setParcelsRestriction(rows[selectedRowIndex]['property.pr_id']);
	if(getTabsFrame().getSelectedTabName() != 'map_tab')
		AFM.view.View.selectTabPage(getTabsFrame().getSelectedTabName());
}

function setLeasesRestriction(pr_id)
{	
	var str = "<restrictions><restriction type=\"sql\" sql=\"ls.bl_id IN (select bl_id From bl Where bl.pr_id = '" + pr_id + "')\"/></restrictions>";	
	getTabsFrame().setTabsRestriction(str, "leases_tab");	
}

function setBuildingsRestriction(pr_id)
{
	var str = "<restrictions><restriction type=\"sql\" sql=\"bl.pr_id = '" + pr_id + "'\"/></restrictions>";
	getTabsFrame().setTabsRestriction(str, "buildings_tab");
}

function setParcelsRestriction(pr_id)
{
	var str = "<restrictions><restriction type=\"sql\" sql=\"parcel.pr_id = '" + pr_id + "'\"/></restrictions>";
	getTabsFrame().setTabsRestriction(str, "parcels_tab");
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

function getTabsFrame()
{
	if(tabsFrame == null)
		tabsFrame = getFrameObject(parent, 'tabsFrame');
	return tabsFrame;
}

function setOnlyMapTabEnabled()
{
	try{
		if(getTabsFrame().getSelectedTabName() != 'map_tab')
			getTabsFrame().selectTab('map_tab');
		//getTabsFrame().setTabEnabled('map_tab', true);
		getTabsFrame().setTabEnabled('details_tab', false);
		getTabsFrame().setTabEnabled('values_tab', false);
		getTabsFrame().setTabEnabled('areas_tab', false);
		getTabsFrame().setTabEnabled('leases_tab', false);
		getTabsFrame().setTabEnabled('buildings_tab', false);	
		getTabsFrame().setTabEnabled('parcels_tab', false);
	}catch(ex){}
}
