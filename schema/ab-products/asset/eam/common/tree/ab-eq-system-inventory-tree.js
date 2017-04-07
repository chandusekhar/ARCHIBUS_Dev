/**
 * System inventory tree controller.
 */
View.createController('eqSysInvTreeController', {
    //on click node handler
    onClickNodeEventHandler: null,
    onClickClearSelectionHandler: null,
    parameters: null,
    restriction: null,
    afterViewLoad: function () {
        this.eqSysInventoryTreePanel.updateRestrictionForLevel = updateTreeRestrictionForLevel;
    },
    afterInitialDataFetch: function () {
        // refresh helper panel to trigger afterRefresh event
        this.abEqSysCommonDataSourceView.refresh();
    },
    abEqSysCommonDataSourceView_afterRefresh: function () {
        if (valueExists(this.view.getParentTab())) {
            var parentTab = this.view.getParentTab();
            if (valueExists(parentTab.parameters)) {
                this.parameters = parentTab.parameters;
            }
            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickNodeEventHandler)) {
                this.onClickNodeEventHandler = parentTab.parameters.onClickNodeEventHandler;
            }
            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.onClickClearSelectionHandler)) {
                this.onClickClearSelectionHandler = parentTab.parameters.onClickClearSelectionHandler;
            }
            if (valueExists(parentTab.parameters) && valueExists(parentTab.parameters.filterRestriction)) {
                this.restriction = parentTab.parameters.filterRestriction;
            }
        }
        this.refreshTree(this.parameters);
    },
    refreshTree: function (parameters) {
        var filterRestriction = parameters.filterRestriction;
        var filterMasterRestrictionSql = '1=1';
        var filterParameters = getFilterLevelRestriction(filterRestriction, true);
        if (valueExistsNotEmpty(filterParameters)) {
            var filterRestrictionSql = getMessage('filterRestrictionSql');
            filterMasterRestrictionSql = filterRestrictionSql.replace(/%{filterParameters}/g, filterParameters);
        }
        this.eqSysInventoryTreePanel.addParameter('filterRestriction', filterMasterRestrictionSql);
        this.eqSysInventoryTreePanel.refresh();
    },
    onClickNode: function () {
        var lastNodeClicked = this.eqSysInventoryTreePanel.lastNodeClicked;
        if (valueExists(this.onClickNodeEventHandler)) {
            var restriction = this.getSelectedNodeRestriction(lastNodeClicked);
            this.onClickNodeEventHandler('systems', restriction);
            //this.onClickNodeEventHandler(lastNodeClicked.data['eq_system.eq_id_depend']);
        }
    },
    getSelectedNodeRestriction: function (node) {
        var eqIds = [];
        var getNodeIds = function (node, ids) {
            for (var i = 0; i < node.children.length; i++) {
                ids.push(node.children[i].data['eq_system.eq_id_depend']);
                getNodeIds(node.children[i], ids);
            }
            return ids;
        }
        if (valueExists(node)) {
            eqIds.push(node.data['eq_system.eq_id_depend']);
            getNodeIds(node, eqIds);
        }
        var restriction = new Ab.view.Restriction();
        restriction.addClause('eq.eq_id', eqIds, 'IN');
        return restriction;
    },
    eqSysInventoryTreePanel_onClearSelection: function () {
        if (valueExists(this.onClickClearSelectionHandler)) {
            this.onClickClearSelectionHandler();
        }
    }
});
function onClickNodeHandler() {
    View.controllers.get('eqSysInvTreeController').onClickNode();
}
/**
 * Set node label.
 */
function afterGeneratingTreeNode(node) {
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
