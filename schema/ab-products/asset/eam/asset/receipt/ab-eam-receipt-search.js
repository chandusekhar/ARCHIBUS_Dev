//Global variables
// filter config options
var registryFilterConfig = new Ext.util.MixedCollection();

registryFilterConfig.addAll(
		{id: 'alignment_field_1', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'deprec_method', fieldConfig: {type: 'enumList', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
		{id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
		{id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'system_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'assembly_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.stakeholder_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.criticality_function', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'eq_system.criticality_mission', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'activity_log.csi_id', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}}
	);

//visible field settings for asset registry panel
var assetRegistryVisibleFields = {
		'bl.asset_id': true,
		'bl.asset_type': true,
		'bl.asset_std': true,
		'bl.asset_status': true,
		'bl.pending_action': true,
		'bl.description': false,
		'bl.project_id': true,
		'bl.geo_region_id': false,
		'bl.ctry_id': false,
		'bl.state_id': false,
		'bl.city_id': false,
		'bl.site_id': true,
		'bl.bl_id': true,
		'bl.pr_id': false,
		'bl.fl_id': true,
		'bl.rm_id': true,
		'bl.bu_id': false,
		'bl.dv_id': false,
		'bl.dp_id': false
};
/**
 * Controller definition.
 */
var abEamReceiptRegistryCtrl = View.createController('abEamReceiptRegistryCtrl', {
    // filter console controller
    filterController: null,

    filterRestriction: null,

    assetRegistryController: null,
    
    assetRegistryRestriction: null,

    afterViewLoad: function () {
        this.initializeFilterConfig();
        this.filterController = View.controllers.get('abEamAssetFilterCtrl');
        this.filterController.initializeConfigObjects(registryFilterConfig);
        var controller = this;
        this.filterController.onFilterCallback = function (restriction) {
            controller.onFilter(restriction);
        };
    },

    afterInitialDataFetch: function () {
        var controller = this;
        var parameters = {
	        'onClickClearSelectionHandler': function(){
	        	controller.onClickClearSelectionHandler();
	        },
            'onClickNodeEventHandler': function (treeType, restriction) {
                controller.refreshFromTreeNode(treeType, restriction);
            }
        };

        this.abEamAssetTree.findTab('abEamAssetTreeGeo').parameters = parameters;
        this.abEamAssetTree.findTab('abEamAssetTreeLocation').parameters = parameters;
        this.abEamAssetTree.findTab('abEamAssetTreeOrg').parameters = parameters;
        _.extend(parameters, {
            'onClickPPTHandler_level': function (projectId) {
                controller.onClickPPTHandler(projectId);
            }
        });
        this.abEamAssetTree.findTab('abEamAssetTreeProj').parameters = parameters;

        var selectedTabName = this.abEamAssetTree.getSelectedTabName();
        this.abEamAssetTree.refreshTab(selectedTabName);

        // initialize filter
        this.filterController.initializeFilter();
        // configure asset registry panel
        this.assetRegistryController = this.getAssetRegistryController();

        var assetByTypeConfig = {
            'isMultipleSelectionEnabled': false,
            'visibleFields': assetRegistryVisibleFields,
            'onShowDetailsHandler': function (parentPanel, restriction) {
                onShowDetailsFromAssetRegistry(parentPanel, restriction);
            },

            'abEamAssetRegistryByType_row_icon_2': {
                'title': getMessage('labelEdit'),
                'onClickHandler': function (parentPanel, context) {
                    onShowDetailsFromAssetRegistry(parentPanel, context,null);
                }
            },            

			'abEamAssetRegistryByType_row_action_2': {
				'title': getMessage('labelProfile'),
				'onClickHandler': function(parentPanel, context){
					controller.onClickProfile(parentPanel, context);
				}
			}
        };

        if (valueExists(this.assetRegistryController)) {
            this.assetRegistryController.configureAssetByType(assetByTypeConfig);
        } else {
            // was not loaded yet
            this.abAssetRegistryByType.parameters = {'assetByTypeConfig': assetByTypeConfig};
        }
    },

    /**
     * On filter event handler
     * @param restriction restriction object
     */
    onFilter: function (restriction) {
        var controller = this;
        this.filterRestriction = restriction;
        var parameters = {
	        'onClickClearSelectionHandler': function(){
	        	controller.onClickClearSelectionHandler();
	        },
            'onClickNodeEventHandler': function (treeType, restriction) {
                controller.refreshFromTreeNode(treeType, restriction);
            }
        };
        var geoTreeParameters = getGeographicalTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetTree.findTab('abEamAssetTreeGeo').parameters = geoTreeParameters;

        
        var locationTreeParameters = getLocationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetTree.findTab('abEamAssetTreeLocation').parameters = locationTreeParameters;
        
        var orgTreeParameters = getOrganizationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetTree.findTab('abEamAssetTreeOrg').parameters = orgTreeParameters;

        _.extend(parameters, {
            'onClickPPTHandler_level': function (projectId) {
                controller.onClickPPTHandler(projectId);
            }
        });
        var projTreeParameters = getProjectTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetTree.findTab('abEamAssetTreeProj').parameters = projTreeParameters;

        var selectedTabName = this.abEamAssetTree.getSelectedTabName();
        this.abEamAssetTree.refreshTab(selectedTabName);
        
        this.assetRegistryRestriction = getRestrictionForAssetRegistryFromFilter(this.filterRestriction);
		this.assetRegistryController = this.getAssetRegistryController();
		if(valueExists(this.assetRegistryController)){
			this.assetRegistryController.refreshPanel(this.assetRegistryRestriction, null);
		}

    },
    
    onClickClearSelectionHandler: function(){
    	this.filterController.resetFilter();
    },

    // initialize filter config objects
    initializeFilterConfig: function () {

    },

    refreshFromTreeNode: function (treeType, restriction) {
        var registryRestr = getRestrictionForAssetRegistry(treeType, restriction, this.assetRegistryRestriction);
        this.assetRegistryController = this.getAssetRegistryController();
        this.assetRegistryController.refreshPanel(registryRestr);

    },

    getAssetRegistryController: function () {
        var result = null;
        if (valueExists(this.view.controllers.get('abEamAssetByTypeCtrl'))) {
            result = this.view.controllers.get('abEamAssetByTypeCtrl');
        } else if (valueExists(this.abAssetRegistryByType.contentView)
            && valueExists(this.abAssetRegistryByType.contentView.controllers)
            && valueExists(this.abAssetRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl'))) {
            result = this.abAssetRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl');
        }
        return result;
    },
    
	onClickProfile: function (parentPanel, context) {
        var assetType = context.findClause('bl.asset_type').value;
        var assetId = context.findClause('bl.asset_id').value;
        var viewName = null;
        var restriction = new Ab.view.Restriction();
        if (assetType == 'bl') {
            viewName = 'ab-profile-building.axvw';
            restriction.addClause('bl.bl_id', assetId, '=');
        } else if (assetType == 'property') {
            viewName = 'ab-profile-property.axvw';
            restriction.addClause('property.pr_id', assetId, '=');
        } else if (assetType == 'eq') {
            viewName = 'ab-profile-equipment.axvw';
            restriction.addClause('eq.eq_id', assetId, '=');
        } else if (assetType == 'ta') {
            viewName = 'ab-profile-ta.axvw';
            restriction.addClause('ta.ta_id', assetId, '=');
        }

        View.getOpenerView().openDialog(viewName, restriction, false, {
            width: 1024,
            height: 600,
            closeButton: true
        });
    },
    
    onClickPPTHandler: function (projectId) {
        var jobId = Workflow.startJob('AbCommonResources-ProjectRequirementsService-generatePPTPresentation', projectId);
        View.openJobProgressBar(getMessage("generatePPTMessage"), jobId, null, function (status) {
            var url = status.jobFile.url;
            window.location = url;
        });
    }
});
