View.createController('eqSysDependencyController', {
    afterViewLoad: function () {
        this.eqSysDependencyTreePanel.updateRestrictionForLevel = function (parentNode, level, restriction) {
            if (level > 0) {
                restriction.removeClause('eq_system.auto_number');
                restriction.addClause('eq_system.eq_id_master', parentNode.data['eq_system.eq_id_depend'], '=');
            }
        }
    },
    afterInitialDataFetch: function () {
        var parameters = null;
        if (valueExists(this.view.parentViewPanel) && valueExists(this.view.parentViewPanel.assetParameters)) {
            parameters = this.view.parentViewPanel.assetParameters;
            var eqId = parameters.getConfigParameterIfExists('eqId');
            var restriction = parameters.getConfigParameterIfExists('restriction');
            this.eqSysDependencyTreePanel.addParameter("lvlDependRestriction", eqId);
            this.eqSysDependencyTreePanel.refresh();
            this.eqSysDependencyTreePanel.expandAll();
        }
    }
});
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