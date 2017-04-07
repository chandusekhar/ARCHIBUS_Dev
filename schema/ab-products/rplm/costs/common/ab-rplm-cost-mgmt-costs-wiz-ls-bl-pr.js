/*
 * TO DO :
 *  check tree search
 *  change wizard type
 *  
 * COMMENTS
 * node type encode :
 * used in tree to identify selected node type
 * 		1 - building, 2 - structure, 3 - land, 4 - lease, 5 - sublease, 6 - parcel
 * 	
 */
var mngCostLsBlPrController = View.createController('mngCostLsBlPrCtrl',{
	viewMode:'properties',
	search:{
		ls_id:'',
		bl_id:'',
		pr_id:''
	},
	selection:{
		type:'',
		id:''
	},
	types:{
		'1':'building',
		'2':'structure',
		'3':'land',
		'4':'lease',
		'5':'sublease',
		'6':'parcel'
	},
	restriction:'',
	queryParameterNames: ['bl_id', 'pr_id'],
	queryParameters: null,
	isDemoMode: false,

	afterViewLoad: function(){
	    this.isDemoMode = isInDemoMode();
	    this.queryParameters =  readQueryParameters(this.queryParameterNames);
		
		this.setLabels();
		this.treeCtry.addParameter('param_parcel', getMessage('param_parcel'));
		this.treeCtry.addParameter('param_building', getMessage('param_building'));
		this.treeCtry.addParameter('param_structure', getMessage('param_structure'));
		this.treeCtry.addParameter('param_land', getMessage('param_land'));
		this.treeCtry.addParameter('param_landlord', getMessage('param_landlord'));
		this.treeCtry.addParameter('param_tenant', getMessage('param_tenant'));
		// don;t show nodes without children
        //this.treeCtry.showNodesWithoutChildren = false;

	},
	
	afterInitialDataFetch: function(){
		if (valueExistsNotEmpty(this.queryParameters['bl_id'])) {
			this.search.bl_id = this.queryParameters['bl_id'];
		}
		if (valueExistsNotEmpty(this.queryParameters['pr_id'])) {
			this.search.pr_id = this.queryParameters['pr_id'];
		}
		if (this.isDemoMode) {
			// when is demo mode set console values directly
			this.treeCtry_onSearch();
			this.consoleSearch_onSearch();
		}
	},
	
	treeCtry_onSearch: function(){
		this.consoleSearch.setFieldValue('ls.ls_id', this.search.ls_id);
		this.consoleSearch.setFieldValue('bl.bl_id', this.search.bl_id);
		this.consoleSearch.setFieldValue('property.pr_id', this.search.pr_id);
	},
	treeCtry_onShowAll: function(){
		this.search.ls_id = '';
		this.search.bl_id = '';
		this.search.pr_id = '';
		this.refreshTree();
		this.treeCtry.actions.get('showAll').enable(false);
		this.treeCtry.actions.get('showAll').config['enabled']= 'false';
	},
	setLabels:function(){
		$('labelSelectType').innerHTML = getMessage('label_select_type');
		$('selectTypeOptionOne').innerHTML = getMessage('option_select_type_one');
		$('selectTypeOptionTwo').innerHTML = getMessage('option_select_type_two');
		$('selectType').value = this.viewMode;
	},
	consoleSearch_onSearch: function(){
		this.search.ls_id = '';
		this.search.bl_id = '';
		this.search.pr_id = '';
		if(valueExistsNotEmpty(this.consoleSearch.getFieldValue('ls.ls_id'))){
			this.search.ls_id = this.consoleSearch.getFieldValue('ls.ls_id');
		}
		if(valueExistsNotEmpty(this.consoleSearch.getFieldValue('bl.bl_id'))){
			this.search.bl_id = this.consoleSearch.getFieldValue('bl.bl_id');
		}
		if(valueExistsNotEmpty(this.consoleSearch.getFieldValue('property.pr_id'))){
			this.search.pr_id = this.consoleSearch.getFieldValue('property.pr_id');
		}
		this.refreshTree();
		this.treeCtry.actions.get('showAll').enable(true);
		this.treeCtry.actions.get('showAll').config['enabled']= 'true';
		
	},
	
	refreshTree: function(){
		this.createRestriction();
		this.treeCtry.refresh();
		// expand tree based on selected filter
		var objSearch = this.search;
		if (valueExistsNotEmpty(objSearch.pr_id)) {
			this.treeCtry.expandAll(2);
		} else if (valueExistsNotEmpty(objSearch.bl_id)){
			//this.treeCtry.expandAll(2);
			this.treeCtry.expandAll(3);
		} else if (valueExistsNotEmpty(objSearch.ls_id)) {
			//this.treeCtry.expandAll(3);
			//this.treeCtry.expandAll(4);
			this.treeCtry.expandAll(5);
		} 
	},
	
	createRestriction: function(){
		var subquery_ctry_bl = '';
		var subquery_ctry_pr = '';
		var subquery_city_bl = '';
		var subquery_city_pr = '';
		var subquery_property_pr = '';
		var subquery_property_bl = '';
		var subquery_property_parcel = '';
		var subquery_bl_ls = '';
		var subquery_bl_bl = '';
		var subquery_ls_lease = '';
		var subquery_ls_sublease = '';
		var subquery_sublease_ls = '';
		var objSearch = this.search;
		
		/*
		 * 03/29/2010 IOAN kb 3023905
		 * if exist at least one search restriction
		 * add search parameters
		 * use convert2validXMLValue to convert user inputs
		 */
		if(valueExistsNotEmpty(objSearch.ls_id) 
			|| valueExistsNotEmpty(objSearch.bl_id) 
				|| valueExistsNotEmpty(objSearch.pr_id)){
					
			if(objSearch.pr_id){
				subquery_ctry_pr += (subquery_ctry_pr.length == 0?' AND (': '')+ ' property.pr_id LIKE \'%' + convert2validXMLValue(objSearch.pr_id) + '%\'';
				subquery_city_pr += (subquery_city_pr.length == 0?' AND (': '')+ ' property.pr_id LIKE \'%' + convert2validXMLValue(objSearch.pr_id) + '%\'';
				
				subquery_property_pr += (subquery_property_pr.length == 0?' AND ( ':'')+ ' property.pr_id LIKE \'%' + convert2validXMLValue(objSearch.pr_id) + '%\' '; 
				
				subquery_property_parcel += (subquery_property_parcel.length == 0?' AND ( ':'')+ ' EXISTS(SELECT 1 FROM property WHERE property.pr_id = parcel.pr_id AND parcel.pr_id LIKE \'%' + convert2validXMLValue(objSearch.pr_id) + '%\' ) '; 
			}
			if(objSearch.bl_id){
				subquery_ctry_bl += (subquery_ctry_bl.length == 0?' AND (':'')+ ' bl.bl_id LIKE \'%' + convert2validXMLValue(objSearch.bl_id) + '%\'';
				subquery_city_bl += (subquery_city_bl.length == 0?' AND (':'')+ ' bl.bl_id LIKE \'%' + convert2validXMLValue(objSearch.bl_id) + '%\'';
				
				subquery_property_bl += (subquery_property_bl.length == 0?' AND ( ':'')+' EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%' + convert2validXMLValue(objSearch.bl_id) + '%\' ) ';
				// special case here 
				subquery_property_pr += (subquery_property_pr.length == 0 ? ' AND (':' OR ')+' EXISTS(SELECT 1 FROM bl WHERE bl.pr_id = property.pr_id AND bl.bl_id LIKE \'%' + convert2validXMLValue(objSearch.bl_id) + '%\' ) ';
				
				subquery_bl_bl += (subquery_bl_bl.length == 0 ? ' AND ( ' : '') + ' bl.bl_id LIKE \'%' + convert2validXMLValue(objSearch.bl_id) + '%\' ';
				
			}
			if(objSearch.ls_id){
				subquery_ctry_bl += (subquery_ctry_bl.length == 0?' AND (':' OR ')+ 'EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ) ';
				subquery_ctry_pr += (subquery_ctry_pr.length == 0?' AND (':' OR ')+ 'EXISTS(SELECT 1 FROM ls WHERE ls.pr_id = property.pr_id AND ls.bl_id IS NULL AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' )';

				subquery_city_bl += (subquery_city_bl.length == 0?' AND (':' OR ')+ 'EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ) ';
				subquery_city_pr += (subquery_city_pr.length == 0?' AND (':' OR ')+ 'EXISTS(SELECT 1 FROM ls WHERE ls.pr_id = property.pr_id AND ls.bl_id IS NULL AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' )';
				
				subquery_property_bl += (subquery_property_bl.length == 0?' AND ( ':' OR ')+ ' EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ) ';

				subquery_property_pr += (subquery_property_pr.length == 0?' AND ( ':' OR ') + '( EXISTS(SELECT 1 FROM ls WHERE ls.pr_id = property.pr_id AND ls.bl_id IS NULL AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ) OR ';
				subquery_property_pr += 'EXISTS(SELECT 1 FROM bl WHERE bl.pr_id = property.pr_id AND EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' )) )';

				subquery_bl_bl += (subquery_bl_bl.length == 0?' AND ( ':' OR ')+' EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ) ';
				subquery_bl_ls += (subquery_bl_ls.length == 0?' AND ( ':'')+' ( ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' OR EXISTS(SELECT 1 FROM ls x WHERE x.ls_parent_id = ls.ls_id AND x.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' )) ';
				
				subquery_ls_lease += (subquery_ls_lease.length == 0?' AND ( ':'')+' ( ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' OR EXISTS(SELECT 1 FROM ls x WHERE x.ls_parent_id = ls.ls_id AND x.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' )) ';
				subquery_ls_sublease += (subquery_ls_sublease.length == 0?' AND ( ':'')+' ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' ';
	
				subquery_sublease_ls += (subquery_sublease_ls.length == 0?' AND ( ':'')+' ls.ls_id LIKE \'%'+ convert2validXMLValue(objSearch.ls_id) +'%\' '; 
			}
			
			// if one search criteria was not set coresponding part is eliminated
			subquery_ctry_pr += (subquery_ctry_pr.length == 0?' AND ( 1 = 2':'');
			subquery_ctry_bl += (subquery_ctry_bl.length == 0?' AND ( 1 = 2':'');
			
			subquery_city_pr += (subquery_city_pr.length == 0?' AND ( 1 = 2':'');
			subquery_city_bl += (subquery_city_bl.length == 0?' AND ( 1 = 2':'');
			
			subquery_property_bl += (subquery_property_bl.length == 0?' AND ( 1 = 2':'');
			
		}
	
		subquery_ctry_bl += (subquery_ctry_bl != ''? ' ) ': '');
		subquery_ctry_pr += (subquery_ctry_pr != ''? ' ) ': '');
		subquery_city_bl += (subquery_city_bl != ''? ' ) ': '');
		subquery_city_pr += (subquery_city_pr != ''? ' ) ': '');
		subquery_property_pr += (subquery_property_pr != ''? ' ) ': '');
		subquery_property_bl += (subquery_property_bl != ''? ' ) ': '');
		subquery_property_parcel += (subquery_property_parcel != ''? ' ) ': '');
		subquery_bl_ls += (subquery_bl_ls != ''? ' ) ': '');
		subquery_bl_bl += (subquery_bl_bl != ''? ' ) ': '');
		subquery_ls_lease += (subquery_ls_lease != ''? ' ) ': '');
		subquery_ls_sublease += (subquery_ls_sublease != ''? ' ) ': '');
		subquery_sublease_ls += (subquery_sublease_ls != ''? ' ) ': '');
		
		this.treeCtry.addParameter('subquery_ctry_bl', subquery_ctry_bl);
		this.treeCtry.addParameter('subquery_ctry_pr', subquery_ctry_pr);
		this.treeCtry.addParameter('subquery_city_bl', subquery_city_bl);
		this.treeCtry.addParameter('subquery_city_pr', subquery_city_pr);
		this.treeCtry.addParameter('subquery_property_pr', subquery_property_pr);
		this.treeCtry.addParameter('subquery_property_bl', subquery_property_bl);
		this.treeCtry.addParameter('subquery_property_parcel', subquery_property_parcel);
		this.treeCtry.addParameter('subquery_bl_ls', subquery_bl_ls);
		this.treeCtry.addParameter('subquery_bl_bl', subquery_bl_bl);
		this.treeCtry.addParameter('subquery_ls_lease', subquery_ls_lease);
		this.treeCtry.addParameter('subquery_ls_sublease', subquery_ls_sublease);
		this.treeCtry.addParameter('subquery_sublease_ls', subquery_sublease_ls);
	},
	
	loadDetails: function(type, nodeId, parentNodeId){
		this.selection.type = this.types[type];
		this.selection.id = nodeId;
		this.viewWizardDetails.contentView.controllers.get('wizardDetailsCtrl').initializeDetails(this.selection.type, this.selection.id, parentNodeId);
	}
});

function changeWizard(){
	var selected = $('selectType').value;
	var targetUrl = View.getBaseUrl()+ "/ab-rplm-cost-mgmt-costs-wiz-ac.axvw";
	this.location.href = targetUrl;
}

function showDetails(event){
	var node = mngCostLsBlPrController.treeCtry.lastNodeClicked;
	var level = node.depth;
	var type = '';
	var nodeId = '', parentNodeId = '';
	switch(parseInt(level)){
		case 2:
			{
				type = valueExists(node.data['property.field_type.raw'])?node.data['property.field_type.raw']: node.data['property.field_type'];
				nodeId = node.data['property.pr_id'];
				break;
			}
		case 3:
			{
				type = valueExists(node.data['bl.field_type.raw'])?node.data['bl.field_type.raw']: node.data['bl.field_type'];
				nodeId = node.data['bl.bl_id'];
				parentNodeId = node.parent.data['property.pr_id'];
				break;
			}
		case 4:
			{
				type = valueExists(node.data['ls.field_type.raw'])?node.data['ls.field_type.raw']: node.data['ls.field_type'];
				nodeId = node.data['ls.ls_id'];
				parentNodeId = node.parent.data['bl.bl_id'];
				break;
			}
		case 5:
			{
				type = valueExists(node.data['su.field_type.raw'])?node.data['su.field_type.raw']: node.data['su.field_type'];
				nodeId = node.data['su.su_id'];
				parentNodeId = node.parent.data['ls.ls_id'];
				break;
			}
	}
	mngCostLsBlPrController.loadDetails(type, nodeId, parentNodeId);
}

function focusLease(){
	var panel = mngCostLsBlPrController.consoleSearch;
	panel.setFieldValue('ls.ls_id', panel.getFieldValue('ls.ls_id').toUpperCase());
}

function focusBuilding(){
	var panel = mngCostLsBlPrController.consoleSearch;
	panel.setFieldValue('bl.bl_id', panel.getFieldValue('bl.bl_id').toUpperCase());
}

function focusProperty(){
	var panel = mngCostLsBlPrController.consoleSearch;
	panel.setFieldValue('property.pr_id', panel.getFieldValue('property.pr_id').toUpperCase());
}
