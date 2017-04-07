// Filter config options
var eqSysAssignmentFilterConfig = new Ext.util.MixedCollection();
eqSysAssignmentFilterConfig.addAll(
    {id: 'bl.asset_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: true, values: null, dfltValue: 'eq', hasEmptyOption: false}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false, values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: true, readOnly: true, values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'deprec_method', fieldConfig: {type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false, values: null, dfltValue: null, hasEmptyOption: false}}
);
/**
 * System assignment controller.
 */
View.createController('eqSysAssignmentController', {
    // on tree selected equipment
    selectedEquipmentId: null,
    // parameter passed to reports
    selectedSystemName: null,
    // selected tree node
    crtTreeNode: null,
    // filter console controller
    filterController: null,
    // drag state
    dragState: 'move',
    assignmentsPanelColor: '#D4F09E',//'green',
    unAssignmentsPanelColor: '#FFA8A8',//red,
    inventoryTreePanelColor: '#93C0C0',//'blue',
    // panel on which the filter is applied
    selectedFilterPanel: 'eqAssignmentTreePanel',
    afterViewLoad: function () {
        // initialize filter config
        this.initializeFilterConfig();
        // set tree level node restriction
        this.updateRestrictionLevel();
        // config display panels
        this.configDisplayPanels();
        // set panels filter colors
        this.setPanelsFilterColors();
        // call method after the node expand is complete to enable drag drop actions
        this.eqSysInventoryTreePanel.treeView.subscribe("expandComplete", this.refreshDragDrop.createDelegate(this));
        this.eqAssignmentTreePanel.treeView.subscribe("expandComplete", this.refreshDragDrop.createDelegate(this));
        // override the tree panel style to make tree icons always visible
        Ab.tree.TreeTableNode.prototype.getFirstCellStyle = function (index) {
            return '';
        };
    },
    afterInitialDataFetch: function () {
        // initialize filter
        this.initializeFilter();
        // call this to update the scroll tab panel
        this.eqSysInventoryTreePanel.show();
        //enable drag drop panels
        this.enableDragInventoryTree();
        this.enableDragDropAssignmentsTree();
    },
    initializeFilterConfig: function () {
        this.filterController = View.controllers.get('abEamAssetFilterCtrl');
        this.filterController.initializeConfigObjects(eqSysAssignmentFilterConfig);
        this.filterController.onFilterCallback = function (restriction) {
            View.controllers.get('eqSysAssignmentController').onFilter(restriction);
        };
        this.filterController.onClickActionButton1Handler = function (buttonElem) {
            View.controllers.get('eqSysAssignmentController').onClickReportMenu(buttonElem);
        };
        this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
    },
    setPanelsFilterColors: function () {
        Ext.get(this.eqAssignmentTreePanel.parentElement.parentElement).on('click', this.initFilterPanelRestriction.createDelegate(this, ['eqAssignmentTreePanel', this.assignmentsPanelColor]));
        Ext.get(this.eqInventoryUnassignedPanel.parentElement.parentElement).on('click', this.initFilterPanelRestriction.createDelegate(this, ['eqInventoryUnassignedPanel', this.unAssignmentsPanelColor]));
        Ext.get(this.eqSysInventoryTreePanel.parentElement.parentElement).on('click', this.initFilterPanelRestriction.createDelegate(this, ['eqSysInventoryTreePanel', this.inventoryTreePanelColor]));
        Ext.get(this.abEamAssetFilter.toolbar.container.dom).setStyle('background-color', this.assignmentsPanelColor);
        Ext.get(this.eqAssignmentTreePanel.toolbar.container.dom).setStyle('background-color', this.assignmentsPanelColor);
        Ext.get(this.eqInventoryUnassignedPanel.toolbar.container.dom).setStyle('background-color', this.unAssignmentsPanelColor);
        Ext.get(this.eqSysInventoryTreePanel.toolbar.container.dom).setStyle('background-color', this.inventoryTreePanelColor);
    },
    initializeFilter: function () {
        this.filterController.initializeFilter();
        // initialize asset status
        this.filterController.onChangeAssetType();
        // initialize filter restriction for each panel
        FilterPanelRestriction.addFilterConfig('eqAssignmentTreePanel', this.filterController.getFilterRestriction());
        FilterPanelRestriction.addFilterConfig('eqInventoryUnassignedPanel', this.filterController.getFilterRestriction());
        FilterPanelRestriction.addFilterConfig('eqSysInventoryTreePanel', this.filterController.getFilterRestriction());
    },
    initFilterPanelRestriction: function (panelId, color) {
        FilterPanelRestriction.updateRestriction(this.selectedFilterPanel, this.filterController.getFilterRestriction());
        this.selectedFilterPanel = panelId;
        Ext.get(this.abEamAssetFilter.toolbar.container.dom).setStyle('background-color', color);
        FilterPanelRestriction.initFilter(panelId);
    },
    updateRestrictionLevel: function () {
        this.eqSysInventoryTreePanel.updateRestrictionForLevel = updateTreeRestrictionForLevel;
        this.eqAssignmentTreePanel.updateRestrictionForLevel = updateTreeRestrictionForLevel;
    },
    configDisplayPanels: function () {
        DisplayPanelConfiguration.addPanelDisplayConfig('eqInventoryUnassignedPanel', {
            panelA: {visible: true, panelType: 'profile'},
            panelB: {visible: true, panelType: 'drawing'},
            panelC: {visible: false, panelType: 'dependency'}
        });
        DisplayPanelConfiguration.addPanelDisplayConfig('eqAssignmentTreePanel', {
            panelA: {visible: true, panelType: 'profile'},
            panelB: {visible: true, panelType: 'drawing'},
            panelC: {visible: false, panelType: 'dependency'}
        });
        DisplayPanelConfiguration.addPanelDisplayConfig('eqSysInventoryTreePanel', {
            panelA: {visible: true, panelType: 'profile'},
            panelB: {visible: true, panelType: 'drawing'},
            panelC: {visible: false, panelType: 'dependency'}
        });
    },
    enableDragInventoryTree: function () {
        var controller = View.controllers.get('eqSysAssignmentController');
        var addDragControl = function (objTree, node, position) {
            new TreeControllerDragSource(objTree, node, position, controller.dragState, false, controller.afterDragCallback.createDelegate(this, ['eqSysInventoryTreePanel'], true));
            if (node.hasChildren()) {
                for (var i = 0; i < node.children.length; i++) {
                    addDragControl(objTree, node.children[i], i);
                }
            }
        };
        var objTree = controller.eqSysInventoryTreePanel;
        for (var nodeCounter = 0; nodeCounter < objTree._nodes.length; nodeCounter++) {
            addDragControl(objTree, objTree._nodes[nodeCounter], nodeCounter);
        }
    },
    enableDragDropAssignmentsTree: function () {
        var controller = View.controllers.get('eqSysAssignmentController');
        var addDragDropControl = function (objTree, node, position) {
            new TreeControllerDragSource(objTree, node, position, 'move', true, controller.afterDragCallback.createDelegate(this, ['eqAssignmentTreePanel'], true));
            new TreeControllerLabelDropTarget(objTree, node, position);
            new TreeControllerSeparatorDropTarget(objTree, node, position);
            if (node.hasChildren()) {
                for (var i = 0; i < node.children.length; i++) {
                    addDragDropControl(objTree, node.children[i], i);
                }
            }
        };
        var objTree = controller.eqAssignmentTreePanel;
        for (var nodeCounter = 0; nodeCounter < objTree._nodes.length; nodeCounter++) {
            addDragDropControl(objTree, objTree._nodes[nodeCounter], nodeCounter);
        }
    },
    /**
     * Called after drag and drop is done.
     * @param dropped - if element is dropped successfully or not
     * @param dragFromPanelId - from where the drag was initiated
     */
    afterDragCallback: function (dropped, dragFromPanelId) {
        var panel = View.panels.get(dragFromPanelId);
        if (dropped) {
            if ('eqSysInventoryTreePanel' === dragFromPanelId) {
                panel.actions.get('toolsMenu').menu.items.get('copy').setChecked(false);
                panel.refresh();
            }
            if ('eqInventoryUnassignedPanel' === dragFromPanelId) {
                panel.refresh();
            }
            View.controllers.get('eqSysAssignmentController').refreshDragDrop();
        } else {
            // when dropped on same node prevent onclick
            var listener = panel.getEventListener('onClickNode');
            if (listener) {
            }
        }
    },
    /**
     * Initiate drag source for grid panel rows.
     */
    eqInventoryUnassignedPanel_afterRefresh: function (panel) {
        var controller = this;
        panel.gridRows.each(function (row) {
            new GridControllerDragSource(row, controller.afterDragCallback.createDelegate(this, ['eqInventoryUnassignedPanel'], true));
        });
    },
    eqAssignmentTreePanel_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_2_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_3_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_4_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_5_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_6_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_7_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_8_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    eqAssignmentTreeLvl_9_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSysAssignmentController').formatLabelNode(node);
    },
    /**
     * Set tree node label and also a node separator.
     * The separator is displayed to drop an element on the same node level.
     */
    formatLabelNode: function (node) {
        var depend = node.data['eq_system.eq_id_depend'];
        var systemLvl = node.data['eq_system.system_level'];
        var label = node.data['eq_system.system_name'] + ' (' + depend + ')';
        //label += ' ' + node.data['eq_system.sort_order'];
        var nodeLabel = '<div class="nodeLabel">';
        var labelId = 'label' + node.id + '_0';
        var separatorId = 'separator' + node.id + '_0';
        nodeLabel += '<div id="' + labelId + '" class="label color_' + systemLvl + '"><span class="ygtvlabel">' + label + '</span></div>';
        nodeLabel += '<div id="' + separatorId + '" class="separator"></div>';
        nodeLabel += '</div>';
        node.label = node.label.replace('{label_html}', nodeLabel);
    },
    /**
     * On filter event handler
     * @param restriction restriction object
     */
    onFilter: function (restriction) {
        filter(this.selectedFilterPanel, restriction);
    },
    eqAssignmentTreePanel_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreePanel_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_2_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_2_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_3_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_3_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_4_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_4_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_5_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_5_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_6_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_6_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_7_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_7_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_8_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_8_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    eqAssignmentTreeLvl_9_onEdit: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, false);
    },
    eqAssignmentTreeLvl_9_onAdd: function (button, panel, node) {
        this.onAddEditCommon(button, panel, node, true);
    },
    /**
     * Edit system equipment.
     */
    onAddEditCommon: function (button, panel, node, newRecord) {
        this.crtTreeNode = node;
        var selectedNodeRestriction = new Ab.view.Restriction({'eq_system.auto_number': node.data['eq_system.auto_number.raw']});
        this.eqSystemForm.clear();
        this.eqSystemForm.refresh(selectedNodeRestriction, newRecord);
        this.eqSystemForm.showInWindow({
            x: 400,
            y: 300,
            width: 800,
            height: 250,
            closeButton: false
        });
        this.eqSystemForm.enableField('eq_system.eq_id_depend', newRecord);
        this.eqSystemForm.setFieldValue('tree_label', node.data['eq_system.system_name']);
        if (newRecord) {
            this.eqSystemForm.setFieldValue('eq_system.eq_id_master', node.data['eq_system.eq_id_depend']);
        }
    },
    eqSystemForm_onSave: function () {
    	var newRecord = this.eqSystemForm.newRecord;
        if (this.eqSystemForm.save()) {
            //if new record, expand selected nod to see the new created equipment system
            this.refreshTreeView(newRecord);
            this.eqSystemForm.closeWindow();
        }
    },
    onShowDetailsHandler: function (panelId, eqId) {
    	this.selectedEquipmentId = eqId;
        this.selectedSystemName = null; // reset system name
        DisplayPanelConfiguration.displayPanels(panelId, eqId);
    },
    onClickNode: function (panelId, eqId, systemName) {
        this.selectedEquipmentId = eqId;
        this.selectedSystemName = systemName;
        DisplayPanelConfiguration.displayPanels(panelId, eqId);
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
    eqAssignmentTreePanel_onRefresh: function () {
        this.refreshSelectedNode();
    },
    /**
     * Refresh selected node.
     * @param expandSelected expand selected node.
     */
    refreshSelectedNode: function (expandSelected) {
        var parentNode = this.crtTreeNode;
        if (!expandSelected) {
            parentNode = this.getParentNode(this.crtTreeNode);
        }
        if (parentNode.isRoot()) {
            this.eqAssignmentTreePanel.refresh();
            this.crtTreeNode = null;
        } else {
            this.eqAssignmentTreePanel.refreshNode(parentNode);
            var crtParent = parentNode;
            for (; !crtParent.parent.isRoot();) {
                crtParent.parent.expand();
                crtParent = crtParent.parent;
            }
            parentNode.expand();
        }
    },
    getParentNode: function (node) {
        var rootNode = this.eqAssignmentTreePanel.treeView.getRoot();
        if (node == null) {
            return rootNode;
        }
        var index = node.level.levelIndex;
        if (index == 0) {
            return rootNode;
        } else {
            return node.parent;
        }
    },
    /**
     * Refresh tree view and drag drop.
     * @param expandSelected expand selected node.
     */
    refreshTreeView: function (expandSelected) {
        this.refreshSelectedNode(expandSelected);
        this.refreshDragDrop();
    },
    /**
     * Called after each drag drop action and panel refresh to enable drag drop functionality.
     */
    refreshDragDrop: function () {
        Ext.dd.DDM.refreshCache(Ext.dd.DragDropMgr.ids);
        this.enableDragDropAssignmentsTree();
        this.enableDragInventoryTree();
    }
});
/**
 * Set node label for panel type tree.
 */
function afterGeneratingTreeNode(node) {
    if (valueExists(node.data['eq_system.eq_id_depend'])
        && valueExists(node.data['eq_system.system_level'])) {
        var depend = node.data['eq_system.eq_id_depend'];
        var systemLvl = node.data['eq_system.system_level'];
        var label = node.data['eq_system.system_name'] + ' (' + depend + ')';
        //label += ' ' + node.data['eq_system.sort_order'];
        var nodeLabel = '<div class="nodeLabel">';
        var labelId = 'label' + node.id + '_0';
        nodeLabel += '<div id="' + labelId + '" class="label color_' + systemLvl + '"><span class="ygtvlabel">' + label + '</span></div>';
        nodeLabel += '</div>';
        node.label = nodeLabel;
    }
}
/**
 * Common on row select action for grid panel.
 * @param ctx
 */
function onShowDetails(ctx) {
    var eqId = ctx.row.getRecord().getValue('eq.eq_id');
    View.controllers.get('eqSysAssignmentController').onShowDetailsHandler('eqInventoryUnassignedPanel', eqId);
}
/**
 * Common on node select action for tree panel.
 */
function onClickNodeHandler(context) {
    var controller = View.controllers.get('eqSysAssignmentController');
    var crtTreeNode = View.panels.get(context.command.parentPanelId).lastNodeClicked;
    var eqId = crtTreeNode.data['eq_system.eq_id_depend'],
    	systemName = crtTreeNode.data['eq_system.system_name'];
    controller.onClickNode(context.command.parentPanelId, eqId, systemName);
    controller.crtTreeNode = View.panels.get(context.command.parentPanelId).lastNodeClicked;
}
/**
 * Set drag state (move, copy, new)
 */
function setDragState(action) {
    var controller = View.controllers.get('eqSysAssignmentController');
    controller.dragState = action.checked ? 'copy' : 'move';
    controller.enableDragInventoryTree();
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
 * Filter panel with console restrictions.
 * @param panelId
 * @param restriction
 */
function filter(panelId, restriction) {
    var filterMasterRestrictionSql = '1=1';
    var applyLevelRestriction = ('eqInventoryUnassignedPanel' != panelId);
    var filterParameters = getFilterLevelRestriction(restriction, applyLevelRestriction);
    if (valueExistsNotEmpty(filterParameters) && applyLevelRestriction) {
        var filterRestrictionSql = getMessage('filterRestrictionSql');
        filterMasterRestrictionSql = filterRestrictionSql.replace(/%{filterParameters}/g, filterParameters);
    } else {
        filterMasterRestrictionSql = filterParameters;
    }
    var panel = View.panels.get(panelId);
    panel.addParameter('filterRestriction', filterMasterRestrictionSql);
    panel.refresh();
}
/**
 * Reports menu actions.
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
 * Reports menu actions with restriction.
 */
function onClickMenuWithRestriction(menu) {
    if (valueExists(menu.viewName)) {
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true
        };
        if (valueExists(menu.parameters)) {
            var controller = View.controllers.get('eqSysAssignmentController');
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
/**
 * Filter panel restriction.
 * Each panel can have a separate console restriction.
 */
FilterPanelRestriction = new (Base.extend({
    panels: new Ext.util.MixedCollection(),
    addFilterConfig: function (panelId, restriction) {
        this.panels.add(panelId, restriction);
    },
    updateRestriction: function (panelId, restriction) {
        this.panels.replace(panelId, restriction);
    },
    initFilter: function (panelId) {
        var filterPanel = View.panels.get('abEamAssetFilter');
        var restriction = this.panels.get(panelId);
        filterPanel.fields.each(function (field) {
            var clause = restriction.findClause(field.fieldDef.id);
            var value = '';
            if (clause) {
                value = clause.value;
                if (value instanceof Array) {
                    value = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
                }
            }
            filterPanel.setFieldValue(field.fieldDef.id, value, null, false);
        });
    }
}));