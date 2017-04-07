// global variables
var abAllocDefSpReqSelItemGridColumnsVisibilityDef =  new Ext.util.MixedCollection();
abAllocDefSpReqSelItemGridColumnsVisibilityDef.addAll(
	{id: 'sb_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
	{id: 'sb_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
	{id: 'sb_items.fg_title', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
	{id: 'sb_items.rm_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p00_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.area_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.p01_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p02_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p03_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p04_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p05_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p06_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p07_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p08_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p09_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p10_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p11_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
	{id: 'sb_items.p12_value', visible: true, dfltVisible: false, hidden: true, sbLevels: null},
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
var abAllocDefSpReqEditCtrl = View.createController('abAllocDefSpReqEditCtrl', {
	// sb_name is project id
	sbName: null,
	
	sbLevel: null,
	
	sbType: null,
	
	gpId: null,

	afterInitialDataFetch: function(){
		this.refreshAndShow();
	},
		
	refreshAndShow: function(){
		this.initialLocalVariables();

		this.initialGridColumns();

		this.evaluateColumnsVisibility( this.abAllocDefSpReqSelItemGrid, this.sbLevel);

		this.refreshGrid();
	},
		
	initialLocalVariables: function(){
		var scnName = View.parentTab.parentPanel.scnName;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', scnName, '=');
		var sbRecord = this.abAllocDefSpReqSbDS.getRecord(restriction);
		this.sbName = scnName;
		this.sbType = sbRecord.getValue("sb.sb_type");
		this.sbLevel = sbRecord.getValue("sb.sb_level");
		if (View.parentTab.parentPanel.associatedGpId)	 {
			this.gpId = View.parentTab.parentPanel.associatedGpId;
		} else {
			this.gpId = null;	
		}
	},

	abAllocDefSpReqSelItemGrid_afterRefresh: function(){
		this.abAllocDefSpReqSelItemGrid.setTitle( getMessage('title')+" " + this.sbName);
	},

	initialGridColumns: function(){
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
		
	refreshGrid: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sb_items.sb_name", this.sbName);
		if (this.gpId)	 {
			restriction.addClause("sb_items.gp_id", this.gpId);
		}
		this.abAllocDefSpReqSelItemGrid.refresh(restriction);
	},

	abAllocDefSpReqSelItemGrid_onAddLocations: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', this.sbName, '=');

		var controller = this;
		View.openDialog('ab-eam-sb-add-locations.axvw', restriction, false, {
			width: 900,
			height:800,
			closeButton:true,
			isFromSpace: true,
			isFromAsset: false,
			callback: function(){
				controller.abAllocDefSpReqSelItemGrid.refresh(restriction);
				View.closeDialog();
			}
		});
	},
	
	onClickItem: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.auto_number', row.row.getRecord().getValue('sb_items.auto_number'));
		restriction.addClause('sb_items.sb_name', abAllocDefSpReqEditCtrl.sbName);
		abAllocDefSpReqEditCtrl.onEditSbItems(restriction, false);
	},
	
	abAllocDefSpReqSelItemGrid_onAdd: function(){
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
				controller.abAllocDefSpReqSelItemGrid.refresh();
				controller.resetRefreshStatusOfChartTab();
				View.closeDialog();
			}
		});
	},

	abAllocDefSpReqSelItemGrid_onEdit: function(){
		var controller = this;
		View.openDialog('ab-sp-def-sp-req-item-multi-edit.axvw', null, true, {
			width: 800,
			height:200,
			sbItemRecords: controller.abAllocDefSpReqSelItemGrid.getSelectedRecords(),
			callback: function(){
				controller.abAllocDefSpReqSelItemGrid.refresh();
				controller.resetRefreshStatusOfChartTab();
				View.closeDialog();
			}
		});
	},
	
	resetRefreshStatusOfChartTab: function(){
		View.parentTab.parentPanel.sbItemsChanged = true;
	},

	refreshTab: function(filter){
	},

	applyChangedScenario: function(filterCopy){
		 this.refreshAndShow();
	}
});

function confirmDelete(ctx){
	var ctrl = abAllocDefSpReqEditCtrl;
	var grid = ctrl.abAllocDefSpReqSelItemGrid;
	View.confirm(getMessage('confirmDelete'), function(button){
		if(button == 'yes') {
			var records = grid.getPrimaryKeysForSelectedRows()
			var parameters = {
				'records': toJSON(records),
				'tableName': 'sb_items',
				'fieldNames': toJSON(['sb_items.auto_number'])
			};
			var result = null;
			try {
				result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters); 
				grid.refresh();
				return true;
			}
			catch (e) {
				Workflow.handleError(result);
				return false;
			}
		}
		else {
			return false;
		}
	});
}