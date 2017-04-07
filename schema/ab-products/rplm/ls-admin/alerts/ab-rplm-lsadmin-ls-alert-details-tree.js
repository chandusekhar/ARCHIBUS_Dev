var treeLeaseAdminController = View.createController('treeLeaseAdmin',{
	panelInfo:null,
	controllerInfo:null,
	restriction:'',
	searchPattern:'',
	crit1Selected:'all',
	crit2Selected:'both',
	notGeocodedItems:new Array(),
	afterInitialDataFetch:function(){
		this.panelInfo = this.view.getOpenerView().panels.get('reportLease');
		this.controllerInfo = this.view.getOpenerView().controllers.get('lsadminLeaseInfo');
		this.panelController = this.view.getOpenerView().controllers.get('portfolioAdministrationAlerts');
		//this.panelAlerts = this.view.getOpenerView().panels.get('lsAlertsGrid');
		this.panelInfo.refresh({'ls.ls_id':this.panelController.lsId});
		//this.panelAlerts.refresh({'ls.ls_id':''});
		if (this.panelController.lsId != null) {
			this.searchPattern = this.panelController.lsId;
			var queryParameter = 'AND ls.ls_id = \''+this.searchPattern+'\'';
			var queryParameterInt = 'AND x.ls_id = \''+this.searchPattern+'\'';

			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.addParameter('subquery_int', queryParameterInt);
			this.treeCtry.addParameter('subquery', queryParameter);
			this.treeCtry.refresh();
		}
	},
	treeCtry_onSearch: function(){
		this.formSearch.setFieldValue('ls.ls_id', this.searchPattern);
	},
	formSearch_onSave:function(){
		this.searchPattern = this.formSearch.getFieldValue('ls.ls_id');
		var queryParameter = 'AND ls.ls_id like \'%'+this.searchPattern+'%\'';
		var queryParameterInt = 'AND x.ls_id like \'%'+this.searchPattern+'%\'';

		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.addParameter('subquery_int', queryParameterInt);
		this.treeCtry.addParameter('subquery', queryParameter);
		this.treeCtry.refresh();
	},
	treeCtry_onShow_all:function(){
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.addParameter('subquery_int', '');
		this.treeCtry.addParameter('subquery', '');
		this.treeCtry.refresh();
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
			case 'property':{
				queryParameter += 'AND ls.pr_id IS NOT NULL ';
				queryParameterInt += 'AND x.pr_id IS NOT NULL ';
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
	}
})


function afterGeneratingTreeNode(treeNode){
	var geocoded = true;
	var labelText = treeNode.label;
	var crtArray = new Array();
	if(treeNode.level.levelIndex == 2){
		var itemType = (treeNode.data['property.name']=='BUILDING'?'BUILDING':'PROPERTY');
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
					crtArray['item'] = result.data.records[0]['bl.bl_id'];
					crtArray['type'] = 'BUILDING';
					crtArray['address'] = (result.data.records[0]['bl.address1']!=''?result.data.records[0]['bl.address1']:result.data.records[0]['bl.address2']);
					crtArray['city'] = result.data.records[0]['bl.city_id'];
					crtArray['state'] = result.data.records[0]['bl.state_id'];
					treeLeaseAdminController.notGeocodedItems.push(crtArray);
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
					crtArray['item'] = result.data.records[0]['property.pr_id'];
					crtArray['type'] = 'PROPERTY';
					crtArray['address'] = (result.data.records[0]['property.address1']!=''?result.data.records[0]['property.address1']:result.data.records[0]['property.address2']);
					crtArray['city'] = result.data.records[0]['property.city_id'];
					crtArray['state'] = result.data.records[0]['property.state_id'];
					treeLeaseAdminController.notGeocodedItems.push(crtArray);
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
	var nodeId = null;
	if(event.restriction.findClause('ls.ls_id')!= null){
		nodeId = event.restriction.findClause('ls.ls_id').value;
	}else if(event.restriction.findClause('su.su_id')!= null){
		nodeId = event.restriction.findClause('su.su_id').value;
	}
	treeLeaseAdminController.panelInfo.refresh({'ls.ls_id':nodeId});
	//treeLeaseAdminController.panelAlerts.refresh({'ls.ls_id':''});
	treeLeaseAdminController.panelInfo.actions.items[treeLeaseAdminController.panelInfo.actions.indexOfKey('edit')].show(true);
	if(treeLeaseAdminController.panelInfo.getFieldValue('ls.bl_id') != ''){
		var value = '<a href="javascript:void(0)" onClick="openReport(\'BUILDING\', \''+treeLeaseAdminController.panelInfo.getFieldValue('ls.bl_id')+'\');">'+treeLeaseAdminController.panelInfo.getFieldValue('ls.bl_id')+'</a>';
		treeLeaseAdminController.controllerInfo.bl_id = treeLeaseAdminController.panelInfo.getFieldValue('ls.bl_id');
		treeLeaseAdminController.controllerInfo.ls_id = nodeId;
		treeLeaseAdminController.controllerInfo.pr_id = '';
		treeLeaseAdminController.panelInfo.setFieldValue('ls.bl_id', value);
	}
	if(treeLeaseAdminController.panelInfo.getFieldValue('ls.pr_id') != ''){
		var value = '<a href="javascript:void(0)" onClick="openReport(\'PROPERTY\', \''+treeLeaseAdminController.panelInfo.getFieldValue('ls.pr_id')+'\');">'+treeLeaseAdminController.panelInfo.getFieldValue('ls.pr_id')+'</a>';
		treeLeaseAdminController.controllerInfo.pr_id = treeLeaseAdminController.panelInfo.getFieldValue('ls.pr_id');
		treeLeaseAdminController.controllerInfo.ls_id = nodeId;
		treeLeaseAdminController.controllerInfo.bl_id = '';
		treeLeaseAdminController.panelInfo.setFieldValue('ls.pr_id', value);
	}
	treeLeaseAdminController.view.getOpenerView().panels.get('panel_row2col2').getContentFrame().tabsLeaseAdminMngByLocationController.initTabs(nodeId);
}
