// Filter config options
var eqSysAnalysisFilterConfig = new Ext.util.MixedCollection();
eqSysAnalysisFilterConfig.addAll(
    {id: 'bl.asset_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: true, values: null, dfltValue: 'eq', hasEmptyOption: false}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false, values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: true, readOnly: true, values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'deprec_method', fieldConfig: {type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false, values: null, dfltValue: null, hasEmptyOption: false}}
);
/**
 * System analysis controller.
 */
View.createController('eqSysAnalysisController', {
    // on tree selected equipment
    selectedEquipmentId: null,
    // parameter passed to reports
    selectedSystemName: null,
    // filter console controller
    filterController: null,
    afterViewLoad: function () {
        // initialize filter config
        this.initializeFilterConfig();
        // set tree level node restriction
        this.updateRestrictionLevel();
        // config display panels
        this.configDisplayPanels();
    },
    afterInitialDataFetch: function () {
        // initialize filter
        this.filterController.initializeFilter();
        // initialize asset status
        this.filterController.onChangeAssetType();
    },
    initializeFilterConfig: function () {
        // place holder for custom actions
        if (!valueExists(this.filterController)) {
            this.filterController = this.getFilterController();
        }
        this.filterController.initializeConfigObjects(eqSysAnalysisFilterConfig);
        this.filterController.onFilterCallback = function (restriction) {
            View.controllers.get('eqSysAnalysisController').onFilter(restriction);
        };
        this.filterController.onClickActionButton1Handler = function (buttonElem) {
            View.controllers.get('eqSysAnalysisController').onClickReportMenu(buttonElem);
        };
        this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
    },
    updateRestrictionLevel: function () {
        this.eqSysInventoryTreePanel.updateRestrictionForLevel = updateTreeRestrictionForLevel;
    },
    configDisplayPanels: function () {
        DisplayPanelConfiguration.addPanelDisplayConfig('eqSysInventoryTreePanel', {
            panelA: {visible: true, panelType: 'dependent'},
            panelB: {visible: true, panelType: 'dependency'},
            panelC: {visible: true, panelType: 'profile'}
        });
    },
    onClickNode: function (panelId, eqId, systemName, crtTreeNode) {
    	this.selectedEquipmentId = eqId;
        this.selectedSystemName = systemName;
        DisplayPanelConfiguration.displayPanels(panelId, eqId, crtTreeNode);
    },
    onClickReportMenu: function (buttonElem) {
        var reportMenuItem = new MenuItem({
            menuDef: {
                id: 'reportsMenu',
                type: 'menu',
                viewName: null,
                isRestricted: false,
                parameters: null
            },
            onClickMenuHandler: onClickMenu,
            onClickMenuHandlerRestricted: onClickMenuWithRestriction,
            submenu: abEqSystemsReportsMenu
        });
        reportMenuItem.build();
        var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
        menu.show(buttonElem, 'tl-bl?');
    },
    /**
     * On filter event handler
     * @param restriction restriction object
     */
    onFilter: function (restriction) {
        var filterMasterRestrictionSql = '1=1';
        var filterParameters = getFilterLevelRestriction(restriction, true);
        if (valueExistsNotEmpty(filterParameters)) {
            var filterRestrictionSql = getMessage('filterRestrictionSql');
            filterMasterRestrictionSql = filterRestrictionSql.replace(/%{filterParameters}/g, filterParameters);
        }
        this.eqSysInventoryTreePanel.addParameter('filterRestriction', filterMasterRestrictionSql);
        this.eqSysInventoryTreePanel.refresh();
    },
    getFilterController: function () {
        return View.controllers.get('abEamAssetFilterCtrl');
    }
});
function onClickNodeHandler(context) {
    var controller = View.controllers.get('eqSysAnalysisController');
    var crtTreeNode = View.panels.get(context.command.parentPanelId).lastNodeClicked;
    var eqId = crtTreeNode.data['eq_system.eq_id_depend'],
    	systemName = crtTreeNode.data['eq_system.system_name'];
    controller.onClickNode(context.command.parentPanelId, eqId, systemName, crtTreeNode);
}
/**
 * Set tree node label.
 * @param node
 */
function afterGeneratingTreeNode(node) {
    if (valueExists(node.data['eq_system.eq_id_depend'])
        && valueExists(node.data['eq_system.system_level'])) {
        var depend = node.data['eq_system.eq_id_depend'],
            systemLvl = node.data['eq_system.system_level'];
        var label = node.data['eq_system.system_name'] + ' (' + depend + ')';
        //label += ' ' + node.data['eq_system.sort_order'];
        var nodeLabel = '<div class="nodeLabel">',
            labelId = 'label' + node.id + '_0';
        nodeLabel += '<div id="' + labelId + '" class="label color_' + systemLvl + '"><span class="ygtvlabel">' + label + '</span></div>';
        nodeLabel += '</div>';
        node.label = nodeLabel;
    }
}
/**
 * Update tree restriction for level and set filter restriction.
 */
function updateTreeRestrictionForLevel(parentNode, level, restriction) {
    if (level > 0) {
        restriction.removeClause('eq_system.auto_number');
        restriction.addClause('eq_system.eq_id_master', parentNode.data['eq_system.eq_id_depend'], '=');
    }
    if (this.parameters.filterRestriction) {
        var filterRestriction = this.parameters.filterRestriction;
        var levelRestriction = '';
        for (var i = (level + 1), length = 10; i < length; i++) {
            levelRestriction += 'eq.level' + i + '=eq_system.eq_id_depend ';
            if (i < (length - 1)) {
                levelRestriction += ' OR ';
            }
        }
        this.parameters.filterRestriction = filterRestriction.replace(/%{levelRestriction}/g, levelRestriction);
    }
}
/**
 * On reports action.
 */
function onClickMenu(menu) {
    if (valueExists(menu.viewName)) {
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true
        };
        if (valueExists(menu.parameters)) {
            for (var param in menu.parameters) {
                if (param == 'title') {
                    dialogConfig[param] = getMessage(menu.parameters[param]);
                } else {
                    dialogConfig[param] = menu.parameters[param];
                }
            }
        }
        View.openDialog(menu.viewName, null, false, dialogConfig);
    }
}
/**
 * On reports action with restriction.
 */
function onClickMenuWithRestriction(menu) {
    if (valueExists(menu.viewName)) {
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true
        };
        if (valueExists(menu.parameters)) {
            var controller = View.controllers.get('eqSysAnalysisController')
            var selectedEquipmentId = controller.selectedEquipmentId,
            	selectedSystemName = controller.selectedSystemName;
            var filterRestriction = getFilterLevelRestriction(controller.filterController.getFilterRestriction(), false);
            for (var param in menu.parameters) {
                if (param == 'selectedEquipmentId') {
                    dialogConfig[param] = selectedEquipmentId;
                } else if (param == 'selectedSystemName') {
                    dialogConfig[param] = selectedSystemName;
                } else if (param == 'filterRestriction') {
                    dialogConfig[param] = filterRestriction;
                } else if ('title') {
                    dialogConfig[param] = getMessage(menu.parameters[param]);
                } else {
                    dialogConfig[param] = menu.parameters[param];
                }
            }
        }
        View.openDialog(menu.viewName, null, false, dialogConfig);
    }
}