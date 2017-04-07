var treeLeaseAdminController = View.createController('treeLeaseAdmin',{
	panelInfo:null,
	controllerInfo:null,
	restriction:'',
	searchPattern:'',
	crit1Selected:'all',
	crit2Selected:'both',
	notGeocodedBuildings:new Array(),
	notGeocodedProperties:new Array(),
	afterViewLoad: function(){
		this.treeCtry.addParameter('param_building', getMessage('param_building'));
		this.treeCtry.addParameter('param_structure', getMessage('param_structure'));
		this.treeCtry.addParameter('param_land', getMessage('param_land'));
		this.treeCtry.addParameter('param_landlord', getMessage('param_landlord'));
		this.treeCtry.addParameter('param_tenant', getMessage('param_tenant'));
		
	},
	afterInitialDataFetch:function(){
		this.panelInfo = this.view.getOpenerView().panels.get('reportLease');
		this.controllerInfo = this.view.getOpenerView().controllers.get('lsadminLeaseInfo');
		this.treeCtry.enableButton('show_all' ,false);
		if(this.treeCtry.actions.indexOfKey('treeCtry_showAsDialog') != -1){
			this.treeCtry.actions.items[this.treeCtry.actions.indexOfKey('treeCtry_showAsDialog')].show(false);
		}
	},
	treeCtry_onSearch: function(){
		this.treeCtry.enableButton('show_all', !(this.searchPattern == '' && this.crit1Selected == 'all' && this.crit2Selected == 'both'));
		this.formSearch.setFieldValue('ls.ls_id', this.searchPattern);
	},
	formSearch_onSearch:function(){
		if (this.formSearch.getFieldValue('ls.ls_id').length == 0) {
			return false;
		}
		else {
			this.searchPattern = this.formSearch.getFieldValue('ls.ls_id');
			var queryParameter = 'AND ls.ls_id like \'%' + this.searchPattern + '%\'';
			var queryParameterInt = 'AND x.ls_id like \'%' + this.searchPattern + '%\'';
			
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery_int', queryParameterInt);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.refresh();
			if (this.treeCtry._nodes.length == 0) {
				this.treeCtry_onShow_all();
				View.showMessage(getMessage('no_lease'));
			}
			else {
				this.treeCtry.enableButton('show_all', true);
			}
		}
	},
	treeCtry_onShow_all:function(){
		this.crit1Selected = 'all';
		this.crit2Selected = 'both';
		this.searchPattern = '';
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery_int', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.refresh();
		this.treeCtry.enableButton('show_all' ,false);
	},
	treeCtry_onFilter: function(){
		var radioCrit1Object = document.getElementsByName("radioCrit1");
		var radioCrit2Object = document.getElementsByName("radioCrit2");
		for(var i=0;i<radioCrit1Object.length;i++){
			if (this.crit1Selected == radioCrit1Object[i].value) {
				radioCrit1Object[i].checked = true;
				break;
			}
		}
		for(var j=0;j<radioCrit2Object.length;j++){
			if (this.crit2Selected == radioCrit2Object[j].value) {
				radioCrit2Object[j].checked = true;
				break;
			}
		}
	},
	formFilter_onApply: function(){
		var radioCrit1Object = document.getElementsByName("radioCrit1");
		var radioCrit2Object = document.getElementsByName("radioCrit2");
		for(var i=0;i<radioCrit1Object.length;i++){
			if (radioCrit1Object[i].checked) {
				this.crit1Selected = radioCrit1Object[i].value;
				break;
			}
		}
		for(var j=0;j<radioCrit2Object.length;j++){
			if (radioCrit2Object[j].checked) {
				this.crit2Selected = radioCrit2Object[j].value;
				break;
			}
		}
		var queryParameter = ''; //'AND ls.ls_id like \'%'+this.searchPattern+'%\'';
		var queryParameterInt = ''; //'AND x.ls_id like \'%'+this.searchPattern+'%\'';
		
		switch(this.crit1Selected){
			case 'all':{
				break;
			}
			case 'building':{
				queryParameter += 'AND ls.bl_id IS NOT NULL ';
				queryParameterInt += 'AND x.bl_id IS NOT NULL ';
				break;
			}
			case 'structure':{
				queryParameter += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = ls.pr_id AND property.property_type = \'Structure\') ';
				queryParameterInt += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = x.pr_id AND property.property_type = \'Structure\') ';
				break;
			}
			case 'land':{
				queryParameter += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = ls.pr_id AND property.property_type = \'Land\') ';
				queryParameterInt += 'AND EXISTS(SELECT 1 FROM property WHERE property.pr_id = x.pr_id AND property.property_type = \'Land\') ';
				break;
			}
		}
		switch(this.crit2Selected){
			case 'both':{
				break;
			}
			case 'active':{
				queryParameter += ' AND ls.signed = 1 AND (ls.date_end &gt; ${sql.currentDate} OR ls.date_end IS NULL) AND ls.date_start &lt; ${sql.currentDate} ';
				queryParameterInt += ' AND x.signed = 1 AND (x.date_end &gt; ${sql.currentDate} OR x.date_end IS NULL) AND x.date_start &lt; ${sql.currentDate} ';
				break;
			}
			case 'nonactive':{
				queryParameter += ' AND ( ls.signed = 0 OR ls.date_end &lt; ${sql.currentDate} OR ls.date_start &gt; ${sql.currentDate} )';
				queryParameterInt += ' AND ( x.signed = 0 OR x.date_end &lt; ${sql.currentDate} OR x.date_start &gt; ${sql.currentDate} ) ';
				break;
			}
		}
		
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery_int', queryParameterInt);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.refresh();
		this.treeCtry.enableButton('show_all' ,true);
	}
})


function afterGeneratingTreeNode(treeNode){
	var geocoded = true;
	var labelText = treeNode.label;
	var crtArray = new Array();
	if(treeNode.level.levelIndex == 2){
		var itemType = treeNode.data['property.type'];
		var itemId = treeNode.data['property.pr_id'];
		var parameters = null;
		if(itemType == 'BUILDING'){
			parameters = {
				tableName:'bl',
				fieldNames: toJSON(['bl.bl_id', 'bl.lat', 'bl.lon', 'bl.address1', 'bl.address2', 'bl.city_id', 'bl.state_id']),
				restriction: toJSON({'bl.bl_id':itemId})
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == 'executed'){
				geocoded = ( result.data.records[0]['bl.lat']!='' && result.data.records[0]['bl.lon']!='' );
				if(!geocoded){
					treeLeaseAdminController.notGeocodedBuildings.push("'"+result.data.records[0]['bl.bl_id']+"'");
				}
			}else{
				Workflow.handleError(result);
			}
		}else{
			parameters = {
				tableName:'property',
				fieldNames: toJSON(['property.pr_id', 'property.lat', 'property.lon', 'property.address1', 'property.address2', 'property.city_id', 'property.state_id']),
				restriction: toJSON({'property.pr_id':itemId})
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == 'executed'){
				geocoded = ( result.data.records[0]['property.lat']!='' && result.data.records[0]['property.lon']!='' );
				if(!geocoded){
					treeLeaseAdminController.notGeocodedProperties.push("'"+result.data.records[0]['property.pr_id']+"'");
				}
			}else{
				Workflow.handleError(result);
			}
		}
		if(!geocoded){
			labelText = labelText + "<img alt='"+getMessage('not_geocoded')+"' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>";
		}
	}
	treeNode.setUpLabel(labelText);
//	return labelText;
}


function showDetails(event){
	var mngByLocCtrl = null;
	try{
		mngByLocCtrl = View.getOpenerView().panels.get('panel_row2col2').getContentFrame().View.controllers.get('tabsLeaseAdminMngByLocation');
	}catch (e){
		View.getOpenerView().panels.get('panel_row2col2').loadView();
		showDetails.defer(500, event);
		return;
	}
	var controller = View.controllers.get("treeLeaseAdmin");
	if(event.restriction.findClause('ls.ls_id')!= null){
		nodeId = event.restriction.findClause('ls.ls_id').value;
	}else if(event.restriction.findClause('su.su_id')!= null){
		nodeId = event.restriction.findClause('su.su_id').value;
	}
	controller.panelInfo.refresh({'ls.ls_id':nodeId});
	mngByLocCtrl.initTabs(nodeId);
}
