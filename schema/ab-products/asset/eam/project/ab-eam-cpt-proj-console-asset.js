// global variables

var assetByStandardColumnsVisibilityDef = new Ext.util.MixedCollection();
assetByStandardColumnsVisibilityDef.addAll(
		{id: 'sb_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
		{id: 'sb_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
		{id: 'sb_items.fg_title', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'sb_items.eq_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.p00_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.cost_of_assets', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'sb_items.area_of_assets', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'sb_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'sb_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'sb_items.eq_cost', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.cost_of_move', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.unit_area', visible: true, dfltVisible: true, hidden: false, sbLevels: null}
);

var assetIndividualColumnsVisibilityDef = new Ext.util.MixedCollection();
assetIndividualColumnsVisibilityDef.addAll(
		{id: 'eq_req_items.auto_number', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.planning_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.sb_name', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
		{id: 'eq_req_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
		{id: 'eq_req_items.description', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.eq_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.cost_est_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.unit_area', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'eq_req_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'eq_req_items.rm_id', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.mfr', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
		{id: 'eq_req_items.modelno', visible: false, dfltVisible: false, hidden: false, sbLevels: null}
);

/**
 * Controller defintion
 */
var abEamCptProjAssetController = View.createController('abEamCptProjAssetController', {
	// selected project id
	projectId: null,
	
	// sb_name is project name
	sbName: null,
	
	sbLevel: null,
	
	sbType: null,
	
	sbRecord: null,
	
	tmpRecord: null,
	
	tmpProjectId: null,
	
	tmpWorkPkgId: null,
	
	afterViewLoad: function () {
		var menuParent = Ext.get('abEamProj_list_reports');
		menuParent.on('click', this.onClickReportMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		this.abEamAssetSummary.refresh(this.view.restriction);
	},
	
	/**
	 * Setter.
	 */
	setSbName: function(sbName){
		this.sbName = sbName;
	},
	
	initializeGlobals: function(){
		if(valueExistsNotEmpty(this.sbName)){
			this.sbRecord = null;
			this.sbLevel = null;
			// get sb record for current sb_name
			var record = getSpaceBudgetRecord(this.sbName);
			if (!record.isNew) {
				this.sbRecord = record;
				this.sbLevel = record.getValue('sb.sb_level');
				this.sbType = record.getValue('sb.sb_type');
			}
		}
	},
	
	alignSummaryFields: function(){
		var field = document.getElementById('abEamAssetSummary_sb.count_of_assets_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_assets_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_assets_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_by_eq_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_by_fn_labelCell');
		field.style.textAlign='left';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_labelCell');
		field.style.textAlign='left';
		
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_assets_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_individual_fieldCell');
		field.style.textAlign='right';		
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_assets_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_grouped_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.count_of_grouped_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.cost_of_individual_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_assets_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_grouped_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_by_eq_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_by_fn_fieldCell');
		field.style.textAlign='right';
		
		field = document.getElementById('abEamAssetSummary_sb.area_of_individual_fieldCell');
		field.style.textAlign='right';
	},
	
	/**
	 * Evaluate hidden attribute in columns visibility
	 */
	evaluateColumnsVisibility: function(reportGrid, sbLevel){
		if(valueExists(reportGrid.columnsVisibilityDef)){
			reportGrid.columnsVisibilityDef.each(function (column){
				if(valueExistsNotEmpty(column.sbLevels) && valueExistsNotEmpty(sbLevel)){
					column.hidden = column.sbLevels.indexOf(sbLevel) == -1;
				}
			});
		}
	},
	
	abEamAssetSummary_afterRefresh:function(){
		var clause = this.abEamAssetSummary.restriction.findClause('sb.sb_name');
		this.sbName = clause.value;
		this.projectId = this.getSelectedProjectId(); 
		this.initializeGlobals();

		//create tr element
		var infoTr = document.createElement('tr');
		infoTr.className = 'fieldRow';
		
		var infoBlank = document.getElementById('abEamAssetSummary_blank');
		if(!valueExists(infoBlank)) {
			infoBlank = document.createElement('td');
			infoBlank.id = 'abEamAssetSummary_blank';
			infoBlank.className = 'label';
			infoBlank.colSpan = "3";
			infoBlank.innerHTML = '';
			
			infoTr.appendChild(infoBlank);
			
                }
		
		// Customize summary panel
		var infoTd = document.getElementById('abEamAssetSummary_informationCell');
		if(!valueExists(infoTd)) {
			infoTd = document.createElement('td');
			infoTd.id = 'abEamAssetSummary_informationCell';
			infoTd.colSpan = "2";
			infoTd.className = 'label';
			infoTd.align='center';
			
			infoTd.style.textAlign = 'left';
			infoTd.style.fontWeight = 'bold';
			infoTd.style.fontStyle = 'italic';
			infoTd.style.whiteSpace = 'nowrap';
			infoTd.style.textDecoration = 'underline';
			infoTd.innerHTML = getMessage('infoSummaryText_assetCount');
			
			infoTr.appendChild(infoTd);
			
			var trElement = this.abEamAssetSummary.fields.get('sb.count_of_assets').dom.parentNode.parentNode;
			var tbodyElement = trElement.parentNode;
			
			tbodyElement.insertBefore(infoTr, trElement);
		}
		
		
		var infoBlank2 = document.getElementById('abEamAssetSummary_blank2');
		if(!valueExists(infoBlank2)) {
			infoBlank2 = document.createElement('td');
			infoBlank2.id = 'abEamAssetSummary_blank2';
			infoBlank2.className = 'label';
			infoBlank2.colSpan = "3";
			infoBlank2.innerHTML = '';
			
			infoTr.appendChild(infoBlank2);
			
			var trElement = this.abEamAssetSummary.fields.get('sb.cost_of_assets').dom.parentNode.parentNode;
			var tbodyElement = trElement.parentNode;
			
			tbodyElement.insertBefore(infoTr, trElement);
		}
		
		
		var infoForecastCost = document.getElementById('abEamAssetSummary_informationForecastCost');
		if(!valueExists(infoForecastCost)) {
			infoForecastCost = document.createElement('td');
			infoForecastCost.id = 'abEamAssetSummary_informationForecastCost';
		    infoTd.colSpan = "1";
			infoForecastCost.className = 'label';
			infoForecastCost.align='center';
			
			infoForecastCost.style.textAlign = 'left';
			infoForecastCost.style.fontWeight = 'bold';
			infoForecastCost.style.fontStyle = 'italic';
			infoForecastCost.style.textDecoration = 'underline';
			infoForecastCost.style.whiteSpace = 'nowrap';
			infoForecastCost.innerHTML = getMessage('infoSummaryText_forecastedCost');
			
			infoTr.appendChild(infoForecastCost);
			
			
			var trElement = this.abEamAssetSummary.fields.get('sb.cost_of_assets').dom.parentNode.parentNode;
			var tbodyElement = trElement.parentNode;
			
			tbodyElement.insertBefore(infoTr, trElement);
		}
		
		
		var infoBlank3 = document.getElementById('abEamAssetSummary_blank3');
		if(!valueExists(infoBlank3)) {
			infoBlank3 = document.createElement('td');
			infoBlank3.id = 'abEamAssetSummary_blank3';
			infoBlank3.className = 'label';
                        infoBlank3.colSpan = "3";
			infoBlank3.align='center';
			
			infoBlank3.innerHTML = '';
			
			infoTr.appendChild(infoBlank3);
			
			var trElement = this.abEamAssetSummary.fields.get('sb.area_of_assets').dom.parentNode.parentNode;
			var tbodyElement = trElement.parentNode;
			
			tbodyElement.insertBefore(infoTr, trElement);
		}
		
		var infoForecastArea = document.getElementById('abEamAssetSummary_informationForecastArea');
		if(!valueExists(infoForecastArea)) {
			infoForecastArea = document.createElement('td');
			infoForecastArea.id = 'abEamAssetSummary_informationForecastArea';
			infoForecastArea.className = 'label';
			infoForecastArea.align='center';
			
			infoForecastArea.style.textAlign = 'left';
			infoForecastArea.style.fontWeight = 'bold';
			infoForecastArea.style.fontStyle = 'italic';
			infoForecastArea.style.textDecoration = 'underline';
			infoForecastArea.style.whiteSpace = 'nowrap';
			infoForecastArea.innerHTML = getMessage('infoSummaryText_forecastedArea');

			infoTr.appendChild(infoForecastArea);
			
			var trElement = this.abEamAssetSummary.fields.get('sb.area_of_assets').dom.parentNode.parentNode;
			var tbodyElement = trElement.parentNode;
			
			tbodyElement.insertBefore(infoTr, trElement);
		}
		
		var infoTotalTd = document.getElementById('abEamAssetSummary_informationTotalCell');
		if (!valueExists(infoTotalTd)) {
			infoTotalTd = document.createElement('td');
			infoTotalTd.id = 'abEamAssetSummary_informationTotalCell';
			infoTotalTd.rowSpan = "1";
			infoTotalTd.className = 'label';
			infoTotalTd.style.fontWeight = 'bold';
			infoTotalTd.style.textAlign = 'left';
			infoTotalTd.style.whiteSpace = 'nowrap';
			infoTotalTd.innerHTML = getMessage('infoSummaryText_total');
			
			var trElement = this.abEamAssetSummary.fields.get('sb.count_of_assets').dom.parentNode.parentNode;
			trElement.insertBefore(infoTotalTd, trElement.children[0]);
		}
		
		var infoGroupedTd = document.getElementById('abEamAssetSummary_informationGroupedCell');
		if (!valueExists(infoGroupedTd)) {
			infoGroupedTd = document.createElement('td');
			infoGroupedTd.id = 'abEamAssetSummary_informationGroupedCell';
			infoGroupedTd.rowSpan = "3";
			infoGroupedTd.className = 'label';
			infoGroupedTd.style.fontWeight = 'bold';
			infoGroupedTd.style.textAlign = 'left';
			infoGroupedTd.style.whiteSpace = 'nowrap';
			infoGroupedTd.innerHTML = getMessage('infoSummaryText_standard');
			
			var trElement = this.abEamAssetSummary.fields.get('sb.count_of_grouped_by_eq').dom.parentNode.parentNode;
			trElement.insertBefore(infoGroupedTd, trElement.children[0]);
		}

		var infoIndividualTd = document.getElementById('abEamAssetSummary_informationIndividualCell');
		if (!valueExists(infoIndividualTd)) {
			infoIndividualTd = document.createElement('td');
			infoIndividualTd.id = 'abEamAssetSummary_informationIndividualCell';
			infoIndividualTd.rowSpan = "3";
			infoIndividualTd.className = 'label';
			infoIndividualTd.style.fontWeight = 'bold';
			infoIndividualTd.style.textAlign = 'left';
			infoIndividualTd.style.whiteSpace = 'nowrap';
			infoIndividualTd.innerHTML = getMessage('infoSummaryText_individual');
			
			var trElement = this.abEamAssetSummary.fields.get('sb.count_of_individual_by_eq').dom.parentNode.parentNode;
			trElement.insertBefore(infoIndividualTd, trElement.children[0]);
		}
		
		this.alignSummaryFields();
				
		var isSbDefined = valueExists(this.sbRecord);
		this.abEamAssetSbItems.enableAction('add', isSbDefined);
		this.abEamAssetEqItems.enableAction('add', isSbDefined);
		this.abEamAssetSbItems.refresh(new Ab.view.Restriction({'sb_items.sb_name': this.sbName}));

		// set panel title
		var title = getMessage('titleAssetSummaryPanel').replace('{0}', this.projectId);
		this.abEamAssetSummary.setTitle(title);

		formatCurrency(this.abEamAssetSummary);

		// enable action 
		var noOfSbItems = (valueExists(this.abEamAssetSbItems.gridRows) && valueExists(this.abEamAssetSbItems.gridRows.length))?this.abEamAssetSbItems.gridRows.length:0;
		if(noOfSbItems == 0){
			noOfSbItems = (valueExists(this.abEamAssetEqItems.gridRows) && valueExists(this.abEamAssetEqItems.gridRows.length))?this.abEamAssetEqItems.gridRows.length:0;
		}
		
		this.abEamAssetSummary.enableAction('createSpaceBudget', !isSbDefined);
		this.abEamAssetSummary.enableAction('addLocations', isSbDefined);
	},
	
	abEamAssetSbItems_afterRefresh: function(){
		//this.evaluateColumnsVisibility(this.abEamAssetEqItems, this.sbLevel);
		this.abEamAssetEqItems.refresh(new Ab.view.Restriction({'eq_req_items.sb_name': this.sbName}));
	},
	
	abEamAssetSummary_onCreateSpaceBudget: function(){
		var projectRecord = getProjectRecord(this.sbName);
		//KB3049945 - set project name to project code when project name not exists
		saveProjectNameAsCode(projectRecord);
		var summary = (!projectRecord.isNew)?projectRecord.getValue('project.summary'):null;
		var restriction = new Ab.view.Restriction();
		var isNewSbRecord = false;
		if(valueExists(this.sbRecord)){
			restriction.addClause('sb.sb_name', this.sbName, '=');
			isNewSbRecord = false;
		}else{
			restriction.addClause('sb.sb_name', this.sbName, '=');
			restriction.addClause('sb.sb_desc', summary, '=');
			restriction.addClause('sb.sb_type', 'Space Requirements', '=');
			restriction.addClause('sb.sb_as', 'st', '=');
			restriction.addClause('sb.sb_from', 'rm', '=');
			restriction.addClause('sb.level', '0', '=');
			isNewSbRecord = true;
		}
		
		var controller = this;
		View.openDialog('ab-eam-define-sb.axvw', restriction, isNewSbRecord, {
			width: 800,
			height:800,
			closeButton:false,
			fieldDefs:{
				'sb_create_for': {
					visible: true,
					values: ['eq', 'fn']
				}
			},
			callback: function(){
				controller.abEamAssetSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}		});
	},
	
	abEamAssetSummary_onAddLocations: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', this.sbName, '=');

		var controller = this;
		View.openDialog('ab-eam-sb-add-locations.axvw', restriction, false, {
			width: 800,
			height:800,
			closeButton:false,
			isFromSpace: false,
			isFromAsset: true,
			fieldDefs:{
				'sb_create_for': {
					visible: true,
					values: ['eq', 'fn']
				}
			},
			callback: function(){
				controller.abEamAssetSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
	},
	
	abEamAssetSbItems_onClickItem: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.auto_number', row.getFieldValue('sb_items.auto_number'));
		restriction.addClause('sb_items.sb_name', this.sbName);
		this.onEditSbItems(restriction, false);
	},
	
	abEamAssetSbItems_onAdd: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.sb_name', this.sbName);
		this.onEditSbItems(restriction, true);
	},
	
	onEditSbItems: function(restriction, newRecord){
		var controller = this;
		View.openDialog('ab-eam-define-sb-item-by-count.axvw', restriction, newRecord, {
			width: 800,
			height:600,
			closeButton:true,
			callback: function(){
				controller.abEamAssetSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
	},
	
	abEamAssetEqItems_onClickItem: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq_req_items.auto_number', row.getFieldValue('eq_req_items.auto_number'));
		restriction.addClause('eq_req_items.sb_name', this.sbName);
		var assetType = row.getFieldValue('eq_req_items.asset_type');
		var isNewAsset = true;
		if (assetType == 'eq' && valueExistsNotEmpty(row.getFieldValue('eq_req_items.eq_id'))) {
			isNewAsset = false
		}else if (assetType == 'ta' && valueExistsNotEmpty(row.getFieldValue('eq_req_items.ta_id'))) {
			isNewAsset = false;
		}
		this.onEditEqReqItems(restriction, false, assetType, isNewAsset);
	},
	
	abEamAssetEqItems_onAdd: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('eq_req_items.sb_name', this.sbName);
		
		this.onEditEqReqItems(restriction, true, 'eq', true);
	},
	
	onEditEqReqItems: function(restriction, newRecord, assetType, isNewAsset){
		var controller = this;
		View.openDialog('ab-eam-define-eq-req-item.axvw', restriction, newRecord, {
			width: 800,
			height:600,
			closeButton:true,
			assetType: assetType, 
			isNewAsset: isNewAsset,
			callback: function(){
				controller.abEamAssetSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
	},
	
	onClickReportMenu: function (buttonElem) {
    	var buttonElem = Ext.get(buttonElem.target);
		var reportMenuItem = new MenuItem({
    		menuDef: {
    			id: 'reportsMenu',
    			type: 'menu',
    			viewName: null, 
    			isRestricted: false, 
    			parameters: null},
    		onClickMenuHandler: onClickMenu,
    		onClickMenuHandlerRestricted: onClickMenuWithRestriction,
    		submenu: abEamReportsCommonMenu
    	});
    	reportMenuItem.build();
    	
		var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
		menu.show(buttonElem, 'tl-bl?');
	},

	getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl'))) {
			controller = this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl');
		}
		return controller;
	},
	
	getSelectedProjectId: function(){
		var mainController = this.getMainController();
		if(mainController){
			return mainController.projectId;
		}else{
			return null;
		}
	},

	onAssignRow: function (row) {
		var controller = View.controllers.get('abEamCptProjAssetController');
        var record = row.row.getRecord();
        var gridPanel = row.grid;
        var rowIndex = row.row.getIndex();
        var buttonId = gridPanel.id + '_row' + rowIndex + '_assignRow';
        var button = document.getElementById(buttonId);
        var assetType = record.getValue('bl.asset_type');
        controller.tmpRecord = record;

        var dialogConfig = {
                anchor: button,
                width: 600,
                height: 300,
                closeButton: false,
                callback: function () {
                    //gridPanel.refresh(gridPanel.restriction);
                }
            };
        
        
        controller.abEamAssetAddAction_form.setFieldValue('activity_log.project_id', controller.projectId);
        controller.abEamAssetAddAction_form.showInWindow(dialogConfig);
        
        
        //View.controllers.get('abEamAssetManagementController').onAssignAsset(assetType, gridPanel, record, button);
    }, 
    
    abEamAssetAddAction_form_onSave: function(){
        if (this.abEamAssetAddAction_form.canSave()) {
            var projectId = this.abEamAssetAddAction_form.getFieldValue('activity_log.project_id');
            var workPkgId = this.abEamAssetAddAction_form.getFieldValue('activity_log.work_pkg_id');
            var activityType = this.abEamAssetAddAction_form.getFieldValue('activity_log.activity_type');
            
            var restriction = new Ab.view.Restriction();
            restriction.addClause('activity_log.project_id', projectId, '=');
            restriction.addClause('activity_log.work_pkg_id', workPkgId, '=');
            restriction.addClause('activity_log.activity_type', activityType, '=');
            var assetType = this.tmpRecord.getValue('eq_req_items.asset_type');
            if(assetType == 'eq'){
            	var eqId = this.tmpRecord.getValue('eq_req_items.eq_id');
            	if(valueExistsNotEmpty(eqId)){
            		restriction.addClause('activity_log.eq_id', eqId, '=');
            	}
            }else{
            	var taId = this.tmpRecord.getValue('eq_req_items.ta_id');
            	if(valueExistsNotEmpty(taId)){
            		restriction.addClause('activity_log.ta_id', taId, '=');
            	}
            }
            
            var reqDescription = '';
            var planningId = this.tmpRecord.getValue('eq_req_items.planning_id');
            if(valueExistsNotEmpty(planningId)){
            	reqDescription += '\n'+ getMessage('labelAssetPlanId') + ': ' + planningId;
            }
            var description = this.tmpRecord.getValue('eq_req_items.description');
            if(valueExistsNotEmpty(description)){
            	reqDescription += '\n'+ getMessage('labelAssetStandard') + ': ' + description;
            }
            if (valueExistsNotEmpty(reqDescription)) {
            	restriction.addClause('activity_log.description', reqDescription, '=');
            }
            

            this.abEamAssetAddAction_form.closeWindow();
			this.addProjectAction(restriction, true);
        }
    },

	addProjectAction: function (restriction, newRecord) {
		View.openDialog('ab-proj-mng-act-edit.axvw', restriction, newRecord, {
			width: 1024,
			height: 600,
			createWorkRequest:false,
			isCopyAsNew: false,
			showDocumentsPanel: true,
			panelsConfiguration: {
				'projMngActEdit_Progress': {
					actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
					fields: [
                         			{name: 'activity_log.status'},
                         			{name: 'activity_log.hours_est_baseline', required: true},
                         			{name: 'activity_log.date_planned_for', required: true},
                         			{name: 'activity_log.duration_est_baseline', required: true},
                         			{name: 'activity_log.date_required'},
                         			{name: 'activity_log.date_scheduled_end'}
					]
				},
				'projMngActEdit_Costs': {
					actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
					fields: [
						{name: 'activity_log.cost_est_cap', required: true},
						{name: 'activity_log.cost_estimated', required: true}
					]
				},
				'projMngActEdit_Details': {
					fields: [
			                         {name: 'activity_log.doc'},
			                         {name: 'activity_log.description'},
			                         {name: 'activity_log.created_by'},
			                         {name: 'activity_log.date_requested'},
			                         {name: 'activity_log.approved_by'},
			                         {name: 'activity_log.date_approved'}
					]
				}
			}
		});
	}
}); 

function onClickMenu(menu){
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

function onClickMenuWithRestriction(menu){
	// TODO : pass restriction to view name
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

/**
*  On Select value  with Add new button
* @param context command context  
*/
function onSelectWorkPkgWithAddNew(context){
    var panelId = context.command.parentPanelId;
    var parentPanel = View.panels.get(panelId);
    var projectId = parentPanel.getFieldValue('activity_log.project_id');
    var workPkgId = parentPanel.getFieldValue('activity_log.work_pkg_id');
    var controller = View.controllers.get('abEamCptProjAssetController');

    View.openDialog('ab-work-pkg-select-value-with-add-new.axvw', null, false, {
        width: 800,
        height: 800,
        selectValueType: 'grid',
        projectId: projectId,
        workPkgId: workPkgId,
        callback: function (rows) {
        	var selectedProjectId = '';
        	var selectedWorkpkgId = '';
        	controller.tmpProjectId = new Array();
        	controller.tmpWorkPkgId = new Array();
        	for (var i = 0; i< rows.length; i++) {
        		var row = rows[i];
        		var tmpProjectId = row.getFieldValue('work_pkgs.project_id');
        		var tmpWorkPkgId = row.getFieldValue('work_pkgs.work_pkg_id');
        		
        		if(controller.tmpProjectId.indexOf(tmpProjectId) == -1) {
        			selectedProjectId += (selectedProjectId.length > 0? Ab.form.Form.MULTIPLE_VALUES_SEPARATOR:'') + tmpProjectId;
        		}
        		selectedWorkpkgId += (selectedWorkpkgId.length > 0? Ab.form.Form.MULTIPLE_VALUES_SEPARATOR:'') + tmpWorkPkgId;
        		
        		controller.tmpProjectId.push(tmpProjectId);
        		controller.tmpWorkPkgId.push(tmpWorkPkgId);
        	}
        	parentPanel.setFieldValue('activity_log.project_id', selectedProjectId);
            parentPanel.setFieldValue('activity_log.work_pkg_id', selectedWorkpkgId);
        }
    });

}

