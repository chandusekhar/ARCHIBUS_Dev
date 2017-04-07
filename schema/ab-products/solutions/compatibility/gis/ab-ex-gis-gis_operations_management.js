function applyRestriction() {

    var top_console = View.getControl('', 'abExGisGisOperationsManagementConsole');
    
    var ctry_id = top_console.getFieldValue('bl.ctry_id');
    var state_id = top_console.getFieldValue('bl.state_id');
    var city_id = top_console.getFieldValue('bl.city_id');
    var site_id = top_console.getFieldValue('bl.site_id');
    var campus = top_console.getFieldValue('bl.campus');
    var bl_id = top_console.getFieldValue('bl.bl_id');
    var trade = top_console.getFieldValue('trade');
    var craftperson = top_console.getFieldValue('craftperson');

    var restriction = ''; //= new AFM.view.Restriction();
    
    if (ctry_id != '') {
    	if(restriction != '') restriction += ' and ';
    	restriction += "bl.ctry_id = '" + ctry_id + "'";
   	}
   	
   	if (state_id != '') {
   		if(restriction != '') restriction += ' and ';
   		restriction += "bl.state_id = '" + state_id + "'";
	}
	
	if(city_id != ''){
		if(restriction != '') restriction += ' and ';
		restriction += "bl.city_id = '" + city_id + "'";
	}
	
	if (site_id != '') {
		if(restriction != '') restriction += ' and ';
		restriction += "bl.site_id = '" + site_id + "'";
	}
	
	if (campus != '') {
		if(restriction != '') restriction += ' and ';
		restriction += "bl.campus = '" + campus + "'";
	}
   	
   	if (bl_id != '') {
    	if(restriction != '') restriction += ' and ';
    	restriction += "bl.bl_id = '" + bl_id + "'";
   	}
   	
   	if (trade != '') {
   		if(restriction != '') restriction += ' and ';
   		restriction += "tr.tr_id = '" + trade + "'";
   	}
   	
   	if (craftperson != '') {
   		if(restriction != '') restriction += ' and ';
   		restriction += "EXISTS (SELECT 1 FROM wrcf WHERE wrcf.cf_id = '" + craftperson + "' and wrcf.wr_id = wr.wr_id)";
  	}

    var object_list = View.getControl('', 'abExGisGisOperationsManagementList');
    object_list.refresh(restriction);
    
}

function clearTradeAndCraftPerson() {
	var top_console = View.getControl('', 'abExGisGisOperationsManagementConsole');
	top_console.setFieldValue('trade', '');
	top_console.setFieldValue('craftperson', '');
}



var controlPanel;
var controlFrame;
var mapFrame;

function user_form_onload() {

	var tabs = View.panels.get('abExGisGisOperationsManagementTabs');
	
	setOnlyMapTabVisible();
}

function getControlPanel() {
	try {		
		var controlPanel = View.getControl('' , 'abExGisGisOperationsManagementList');
		return controlPanel;
	}
	catch(ex) {
		return null;
	}
}

function setTabsVisible() {
	var tabs = View.panels.get('abExGisGisOperationsManagementTabs');
	tabs.showTab("building_tab", true);
	tabs.showTab("room_tab", true);
	tabs.showTab("request_tab", true);
}

function setOnlyMapTabVisible() {
	var tabs = View.panels.get('abExGisGisOperationsManagementTabs');
	try{
		if(tabs.getSelectedTabName() != 'map_tab')
			tabs.showTab('map_tab');
			tabs.showTab("building_tab", false);
			tabs.showTab("room_tab", false);
			tabs.showTab("request_tab", false);
	}catch(ex){}
}

function showAllObjects() {
	var controlPanel = getControlPanel();
	var rows = controlPanel.rows;
	
	setOnlyMapTabVisible();
	var tabs = View.panels.get('abExGisGisOperationsManagementTabs');
    tabs.restriction = '';

    var mapController = View.controllers.get('showMap');
	mapController.showBuildingsOnMap(rows);
}

function showSelectedObjects() {	
	var controlPanel = getControlPanel();
	var rows = controlPanel.rows;
	var selectedRowIndex = controlPanel.selectedRowIndex;
	var tabs = View.panels.get('abExGisGisOperationsManagementTabs');
	if(tabs.getSelectedTabName() == 'map_tab') {
		var mapController = View.controllers.get('showMap');
		mapController.showObjectsOnMap([rows[selectedRowIndex]]);
		setTabsVisible();
	}
	tabs.restriction = {"wr.wr_id" : rows[selectedRowIndex]['wr.wr_id']};
	if(tabs.getSelectedTabName() != 'map_tab')
		tabs.getSelectedTabName();
}

