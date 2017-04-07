View.createController('eqSystemTreeHierarchy', {
    objTree: null,
    crtTreeNode: null,// selected tree node
    crtTreeNodes: [],// selected tree node
    afterViewLoad: function () {
        this.eq_system_tree1.updateRestrictionForLevel = function (parentNode, level, restriction) {
            if (level > 0) {
                restriction.removeClause('eq_system.auto_number');
                restriction.addClause('eq_system.eq_id_master', parentNode.data['eq_system.eq_id_depend'], '=');
            }
        };
        this.eq_system_treetable1.updateRestrictionForLevel = function (parentNode, level, restriction) {
            if (level > 0) {
                restriction.removeClause('eq_system.auto_number');
                restriction.addClause('eq_system.eq_id_master', parentNode.data['eq_system.eq_id_depend'], '=');
            }
        };
        // call method after the node expand is complete to enable drag drop actions
        this.eq_system_tree1.treeView.subscribe("expandComplete", this.enableDragTree);
        this.eq_system_treetable1.treeView.subscribe("expandComplete", refreshDragDrop);
    },
    afterInitialDataFetch: function () {
        this.objTree = View.panels.get('eq_system_tree1');
        this.enableDragTree();
        this.enableDragDropTree();
    },
    eq_system_tree1_onShow: function () {
        this.showNode('eq_system_tree1');
    },
    eq_system_treetable1_onShow: function () {
        this.showNode('eq_system_treetable1');
    },
    showNode: function (treePanel) {
        for (var i = 0; i < this.crtTreeNodes.length; i++) {
            var crtLevelIndex = this.crtTreeNodes[i].level.levelIndex;
            this.refreshTreePanelAfterUpdate(treePanel, crtLevelIndex, this.crtTreeNodes[i]);
        }
    },
    refreshTreePanelAfterUpdate: function (treePanel, index, crtTreeNode) {
        this.objTree = View.panels.get(treePanel);
        var parentNode = this.getParentNode(index, crtTreeNode);
        // new code, replaces the commented out code below
        // this.objTree.expandNode(parentNode);
        if (parentNode.isRoot()) {
            this.objTree.refresh();
            //this.crtTreeNode = null;
        } else {
            this.objTree.refreshNode(parentNode);
            var crtParent = parentNode;
            for (; !crtParent.parent.isRoot();) {
                crtParent.parent.expand();
                crtParent = crtParent.parent;
            }
            parentNode.expand();
        }
    },
    getParentNode: function (index, crtTreeNode) {
        var rootNode = this.objTree.treeView.getRoot();
        if (index == 0) {
            return rootNode;
        } else if (crtTreeNode == null) {
            return rootNode;
        } else {
            var crtNode = crtTreeNode;
            var crtLevelIndex = crtNode.level.levelIndex;
            for (; crtLevelIndex > index;) {
                crtNode = crtNode.parent;
                crtLevelIndex = crtNode.level.levelIndex;
            }
            return crtNode;
        }
    },
    getTreeNodeByCurEditData: function (curEditForm, pkFieldName, parentNode) {
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    },
    eq_system_treetable1_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSystemTreeHierarchy').formatLabelNode(node);
    },
    eq_system_treetable2_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSystemTreeHierarchy').formatLabelNode(node);
    },
    eq_system_treetable3_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSystemTreeHierarchy').formatLabelNode(node);
    },
    eq_system_treetable4_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSystemTreeHierarchy').formatLabelNode(node);
    },
    eq_system_treetable5_afterGeneratingTreeNode: function (node) {
        View.controllers.get('eqSystemTreeHierarchy').formatLabelNode(node);
    },
    formatLabelNode: function (node) {
        var depend = node.data['eq_system.eq_id_depend'];
        var systemLvl = node.data['eq_system.system_level'];
        var label = node.data['eq_system.system_name'] + ' (' + depend + ')' + ' ' + node.data['eq_system.sort_order'];
        var nodeLabel = '<div class="nodeLabel">';
        var labelId = 'label' + node.id + '_0';
        var separatorId = 'separator' + node.id + '_0';
        nodeLabel += '<div id="' + labelId + '" class="label color_' + systemLvl + '"><span class="ygtvlabel">' + label + '</span></div>';
        nodeLabel += '<div id="' + separatorId + '" class="separator"></div>';
        nodeLabel += '</div>';
        node.label = node.label.replace('{label_html}', nodeLabel);
    },
    enableDragTree: function () {
        var controller = View.controllers.get('eqSystemTreeHierarchy');
        var addDragControl = function (objTree, node, position) {
            new TreeControllerDragSource(objTree, node, position, 'copy', false, controller.afterDragCallback.createDelegate(this, ['eq_system_tree1'], true));
            if (node.hasChildren()) {
                for (var i = 0; i < node.children.length; i++) {
                    addDragControl(objTree, node.children[i], i);
                }
            }
        };
        for (var nodeCounter = 0; nodeCounter < controller.eq_system_tree1._nodes.length; nodeCounter++) {
            addDragControl(controller.eq_system_tree1, controller.eq_system_tree1._nodes[nodeCounter], nodeCounter);
        }
    },
    enableDragDropTree: function () {
        var controller = View.controllers.get('eqSystemTreeHierarchy');
        var addDragDropControl = function (objTree, node, position) {
            new TreeControllerDragSource(objTree, node, position, 'move', true, controller.afterDragCallback.createDelegate(this, ['eq_system_treetable1'], true));
            new TreeControllerLabelDropTarget(objTree, node, position);
            new TreeControllerSeparatorDropTarget(objTree, node, position);
            if (node.hasChildren()) {
                for (var i = 0; i < node.children.length; i++) {
                    addDragDropControl(objTree, node.children[i], i);
                }
            }
        };
        for (var nodeCounter = 0; nodeCounter < controller.eq_system_treetable1._nodes.length; nodeCounter++) {
            addDragDropControl(controller.eq_system_treetable1, controller.eq_system_treetable1._nodes[nodeCounter], nodeCounter);
        }
    },
    afterDragCallback: function (dropped, dragFromPanelId) {
        var panel = View.panels.get(dragFromPanelId);
        if (dropped) {
            //panel.refresh();
            //View.panels.get('eq_system_treetable1').refresh();
            refreshDragDrop();
        } else {
            var listener = panel.getEventListener('onClickNode');
            if (listener) {
            }
        }
    }
});
function onClickTreeNode(panelId) {
    var objTree = View.panels.get(panelId);
    var crtNode = objTree.lastNodeClicked;
    var controller = View.controllers.get('eqSystemTreeHierarchy');
    controller.crtTreeNode = crtNode;
    controller.crtTreeNodes.push(crtNode);
}
function refreshDragDrop() {
    Ext.dd.DDM.refreshCache(Ext.dd.DragDropMgr.ids);
    View.controllers.get('eqSystemTreeHierarchy').enableDragTree();
    View.controllers.get('eqSystemTreeHierarchy').enableDragDropTree();
}