// global variables
var abEamSpaceItemsColumnsVisibilityDef =  new Ext.util.MixedCollection();
abEamSpaceItemsColumnsVisibilityDef.addAll(
	{id: 'sb_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
	{id: 'sb_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
	{id: 'sb_items.fg_title', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
	{id: 'sb_items.rm_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p00_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.area_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.p01_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_requirement', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.area_of_requirement', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_count', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_cost', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_area', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
	{id: 'sb_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
	{id: 'sb_items.cost_of_space', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_furn', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_move', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.rm_std_area', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.unit_headcount', visible: false, dfltVisible: false, hidden: false, sbLevels: null}
);

/**
 * Controller definition.
 */
var abEamCptProjSpaceController = View.createController('abEamCptProjSpaceController', {
	// selected project id
	projectId: null,
	
	// sb_name is project_name
	sbName: null,
	
	sbLevel: null,
	
	sbType:'Space Requirements',
	
	sbRecord: null,
	
	afterInitialDataFetch: function(){
		this.abEamSpaceSummary.refresh(this.view.restriction);
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
	
	abEamSpaceSummary_afterRefresh:function(){
		var clause = this.abEamSpaceSummary.restriction.findClause('sb_items.sb_name');
		this.sbName = clause.value;
		this.projectId = this.getSelectedProjectId(); 
		this.initializeGlobals();

		// display info text
		var infoTd = document.getElementById('abEamSpaceSummary_informationCell');
		if(!valueExists(infoTd)) {
			var infoSummaryText = null;
			if (this.sbType == 'Space Requirements') {
				infoSummaryText = getMessage('infoSummaryText_requirements');
			} else if (this.sbType == 'Space Forecast') {
				infoSummaryText = getMessage('infoSummaryText_forecast');
			}
			
			infoTd = document.createElement('td');
			infoTd.id = 'abEamSpaceSummary_informationCell';
			infoTd.className = 'label';
			infoTd.style.textAlign = 'left';
			infoTd.style.fontWeight = 'bold';
			infoTd.style.whiteSpace = 'nowrap';
			infoTd.innerHTML = infoSummaryText;
			
			var trElement = this.abEamSpaceSummary.fields.get('sb_items.num_of_spaces').dom.parentNode.parentNode;
			trElement.insertBefore(infoTd, trElement.children[0]);
		}
		
		var isSbDefined = valueExists(this.sbRecord);
		this.abEamSpaceItems.enableAction('add', isSbDefined);
		this.abEamSpaceItems.refresh(this.abEamSpaceSummary.restriction);
		// set panel title
		var title = getMessage('titleSpaceSummaryPanel').replace('{0}', this.projectId);
		this.abEamSpaceSummary.setTitle(title);
		formatCurrency(this.abEamSpaceSummary);
		
		var noOfSbItems = (valueExists(this.abEamSpaceItems.gridRows) && valueExists(this.abEamSpaceItems.gridRows.length))?this.abEamSpaceItems.gridRows.length:0;
		// enable action 
		this.abEamSpaceSummary.enableAction('createSpaceBudget', !isSbDefined);
		this.abEamSpaceSummary.enableAction('addLocations', isSbDefined);
	},
	
	
	abEamSpaceSummary_onCreateSpaceBudget: function(){
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
					values: ['rm']
				}
			},
			callback: function(){
				controller.abEamSpaceSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
	},
	
	abEamSpaceSummary_onAddLocations: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', this.sbName, '=');

		var controller = this;
		View.openDialog('ab-eam-sb-add-locations.axvw', restriction, false, {
			width: 800,
			height:800,
			closeButton:false,
			isFromSpace: true,
			isFromAsset: false,
			fieldDefs:{
				'sb_create_for': {
					visible: true,
					values: ['rm']
				}
			},
			callback: function(){
				controller.abEamSpaceSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
	},
	
	abEamSpaceItems_onClickItem: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.auto_number', row.getFieldValue('sb_items.auto_number'));
		restriction.addClause('sb_items.sb_name', this.sbName);
		this.onEditSbItems(restriction, false);
	},
	
	abEamSpaceItems_onAdd: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.sb_name', this.sbName);
		this.onEditSbItems(restriction, true);
	},
	
	onEditSbItems: function(restriction, newRecord){
		var controller = this;
		
		View.openDialog('ab-eam-define-sb-item.axvw', restriction, newRecord, {
			width: 800,
			height:600,
			closeButton:true,
			callback: function(){
				controller.abEamSpaceSummary.refresh(controller.view.restriction);
				View.closeDialog();
			}
		});
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
	}
});


