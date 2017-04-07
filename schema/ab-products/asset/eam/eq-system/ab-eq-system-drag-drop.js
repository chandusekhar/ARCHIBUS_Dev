/**
 * Custom DD source class that is used by tree nodes to handle drag events.
 */
var TreeControllerDragSource = function (objTree, node, position, dragState, isTreeTable, callbackFn) {
    this.objTree = objTree;
    this.node = node;
    _.extend(node.data, {
        position: position,
        dragState: dragState   // move, copy, new
    });
    this.dragData = node.data;
    this.callbackFn = callbackFn;
    var dragEl = isTreeTable ? node.labelElId + '_0' : node.labelElId;
    TreeControllerDragSource.superclass.constructor.call(this, dragEl);
};
Ext.extend(TreeControllerDragSource, Ext.dd.DragSource, {
    // set the drag element info
    onInitDrag: function (x, y) {
        var clone = this.el.dom.cloneNode(true);
        clone.id = Ext.id(); // prevent duplicate ids
        Ext.DomHelper.insertFirst(clone, '<b>' + getMessage(this.dragData['dragState']) + '</b>');
        this.proxy.update(clone);
        this.onStartDrag(x, y);
        return true;
    },
    onDragEnter: function () {
        this.el.addClass('esTree-dragging');
    },
    onEndDrag: function () {
        this.el.removeClass('esTree-dragging');
    }
});
/**
 * Custom DD drag class that is used by tree nodes to handle drag events.
 */
var GridControllerDragSource = function (row, callbackFn) {
    this.node = row;
    this.dragData = {
        'eq_system.eq_id_depend': row.getFieldValue('eq.eq_id'),
        'eq.eq_std': row.getFieldValue('eq.eq_std'),
        'eq_system.system_name': '',
        dragState: 'new',
        position: 0
    };
    this.callbackFn = callbackFn;
    GridControllerDragSource.superclass.constructor.call(this, row.dom.children[0]);
};
Ext.extend(GridControllerDragSource, Ext.dd.DragSource, {
    scroll: false,
    // set the drag element info
    onInitDrag: function (x, y) {
        var dragEl = '<div>' + this.dragData['eq_system.eq_id_depend'] + ' ' + this.dragData['eq.eq_std'] + '</div>';
        dragEl.id = Ext.id(); // prevent duplicate ids
        this.proxy.update(dragEl);
        this.onStartDrag(x, y);
        return true;
    },
    onDragEnter: function () {
        this.el.addClass('esTree-dragging');
    },
    onEndDrag: function () {
        this.el.removeClass('esTree-dragging');
    }
});
/**
 * Custom DD target class that is used by tree nodes to handle drop events.
 */
var TreeControllerLabelDropTarget = function (objTree, node, position) {
    this.objTree = objTree;
    this.node = node;
    this.dragData = node.data;
    this.position = position;
    TreeControllerLabelDropTarget.superclass.constructor.call(this, 'label' + node.id + '_0');
};
/**
 * Each drag node is saved inside the target node.
 */
Ext.extend(TreeControllerLabelDropTarget, Ext.dd.DropTarget, {
    pKeyValue: null,
    expandNodeDelay: 1000,
    // expand node if it has children
    notifyOver: function (dd, e, data) {
        var targetEl = jQuery(this.el.dom);
        if (!this.node.isLeafNode && this.node.hasChildren(this, true)) {
            this.expandOverNode(this.node);
        }
        targetEl.addClass('esTree-onNode');
        console.log(this.node.data['eq_system.eq_id_depend']);
        return this.dropAllowed;
    },
    notifyOut: function (dd, e, data) {
        var targetEl = jQuery(this.el.dom);
        targetEl.removeClass('esTree-onNode');
        this.stopOpenFolderTimer();
    },
    notifyDrop: function (dd, e, dragData) {
        if (dd.node == this.node) {
            Ext.lib.Event.stopEvent(e); //TODO stop onClickNode same node
            if (dd.callbackFn) {
                dd.callbackFn.call(false);
            }
            return false;
        }
        var targetEl = jQuery(this.el.dom);
        targetEl.removeClass('esTree-onNode');
        var record = this.prepareRecord(dragData);
        var savedRecord = this.saveRecord(record);
        if (savedRecord) {
            this.pKeyValue = savedRecord.getValue('eq_system.auto_number');
            _.extend(dragData, {'eq_system.auto_number': this.pKeyValue});
        }
        this.sortNaturalOrder(dragData);
        var refreshTargetNode = true;
        if ('move' === dragData.dragState) {
            this.refreshTreePanelAfterUpdate(dd.node, false);
            var node = this.node;
            if (!this.node.parent) {
                node = this.objTree.treeView.getNodeByProperty('eq_system.auto_number', this.node.data['eq_system.auto_number']);
            }
            var isLeafNode = node.isLeafNode;
            if (isLeafNode) {
                node = node.parent;
                if (node.isRoot()) {
                    this.objTree.refresh();
                } else {
                    this.objTree.refreshNode(node);
                }
            } else {
                this.objTree.refreshNode(node);
            }
            refreshTargetNode = false;
        }
        if (refreshTargetNode) {
            this.refreshTreePanelAfterUpdate(this.node, true);
        }
        if (dd.callbackFn) {
            dd.callbackFn.call(this, true);
        }
        return true;
    },
    refreshParentDragNode: function (node) {
        var dragLevelIndex = node.level.levelIndex;
        if (dragLevelIndex == 0) {
        } else {
            var index = node.level.levelIndex;
            var parentNode = this.getParentNode(index, node);
            setTimeout(this.refreshTreePanelAfterUpdate(parentNode, true), 1000);
        }
    },
    prepareRecord: function (dragData) {
        var record = null;
        if ('new' === dragData.dragState || 'copy' === dragData.dragState) {
            record = this.createNodeRecord(dragData);
        } else if ('move' === dragData.dragState) {
            record = this.getExistingNodeRecord(dragData);
            var masterId = this.node.data['eq_system.eq_id_depend'];
            if (this.node.parent.isRoot()) {
                masterId = this.node.data['eq_system.eq_id_master'];
            }
            record.setValue('eq_system.eq_id_master', masterId);
            record.setValue('eq_system.sort_order', 0);
        }
        return record;
    },
    createNodeRecord: function (dragData) {
        var masterId = this.node.data['eq_system.eq_id_depend'];
        var dependId = dragData['eq_system.eq_id_depend'],
            sysName = dragData['eq_system.system_name'];
        if ('new' === dragData.dragState) {
            var eqRecord = getEquipmentRecord(dependId);
            sysName = eqRecord.getValue('eq.use1');
            if (!valueExistsNotEmpty(sysName)) {
                sysName = eqRecord.getValue('eq.eq_std');
            }
        }
        if (this.node.parent.isRoot()) {
            masterId = this.node.data['eq_system.eq_id_master'];
        }
        return new Ab.data.Record({
            'eq_system.eq_id_master': masterId, // always master is the drop node
            'eq_system.eq_id_depend': dependId,
            'eq_system.system_name': sysName
        }, true);
    },
    getExistingNodeRecord: function (dragData) {
        return View.dataSources.get('eqSystemDs').getRecord(new Ab.view.Restriction({'eq_system.auto_number': dragData['eq_system.auto_number']}));
    },
    saveRecord: function (record) {
        return View.dataSources.get('eqSystemDs').saveRecord(record);
    },
    sortNaturalOrder: function (dragData) {
        var levelNodes = [];
        levelNodes.push(dragData);
        for (var index = 0; index < this.node.children.length; index++) {
            var data = this.node.children[index].data;
            levelNodes.push(data);
        }
        for (var index = 0; index < levelNodes.length; index++) {
            this.saveSortOrder(levelNodes[index], index + 1);
        }
    },
    saveSortOrder: function (data, index) {
        var autoNumber = Number(data['eq_system.auto_number']);
        var eqSystemDs = View.dataSources.get('eqSystemDs');
        var record = eqSystemDs.getRecord(new Ab.view.Restriction({'eq_system.auto_number': autoNumber}));
        record.setValue('eq_system.sort_order', index);
        eqSystemDs.saveRecord(record);
    },
    refreshTreePanelAfterUpdate: function (node, expand, callback) {
        var parentNode = this.getParentNode(node);
        if (node.level.levelIndex == 0) {
            //this.objTree.refresh();
            this.objTree.refreshNode(node);
        } else {
            this.objTree.refreshNode(parentNode);
            if (expand) {
                this.expandParentNode(parentNode);
            }
        }
        if (callback) {
            callback.call();
        }
    },
    expandParentNode: function (parentNode) {
        var crtParent = parentNode;
        for (; !crtParent.parent.isRoot();) {
            crtParent.parent.expand();
            crtParent = crtParent.parent;
        }
        parentNode.expand();
    },
    getParentNode: function (node) {
        var rootNode = this.objTree.treeView.getRoot();
        var index = node.level.levelIndex;
        if (index == 0) {
            return rootNode;
        } else {
            return node.parent;
        }
    },
    getRootNode: function (node) {
        var index = node.level.levelIndex;
        if (index == 0) {
            return node;
        } else {
            var crtNode = node;
            for (; crtNode.level.levelIndex > 0;) {
                crtNode = crtNode.parent;
            }
            return crtNode;
        }
    },
    expandOverNode: function (node) {
        var openFolder;
        openFolder = (function (_this) {
            return function () {
                return _this.openNode(node);
            };
        })(this);
        this.stopOpenFolderTimer();
        return this.open_node_timer = setTimeout(openFolder, this.expandNodeDelay);
    }
    ,
    openNode: function (node) {
        node.expand();
    }
    ,
    stopOpenFolderTimer: function () {
        if (this.open_node_timer) {
            clearTimeout(this.open_node_timer);
            return this.open_node_timer = null;
        }
    }
});
/**
 * Custom DD target class that is used by tree nodes to handle drop events.
 */
var TreeControllerSeparatorDropTarget = function (objTree, node, position) {
    this.objTree = objTree;
    this.node = node;
    this.dragData = node.data;
    this.position = position;
    TreeControllerSeparatorDropTarget.superclass.constructor.call(this, 'separator' + node.id + '_0');
};
/**
 * Each node is placed on the same lavel as the target node.
 */
Ext.extend(TreeControllerSeparatorDropTarget, Ext.dd.DropTarget, {
    pKeyValue: null,
    notifyDrop: function (dd, e, dragData) {
        if (dd.node == this.node) {
            Ext.lib.Event.stopEvent(e);
            if (dd.callbackFn) {
                dd.callbackFn.call(this, false);
            }
            return false;
        }
        var targetEl = jQuery(this.el.dom);
        if (targetEl.hasClass('separator')) {
            targetEl.removeClass('esTree-line');
        }
        var record = this.prepareRecord(dragData);
        var savedRecord = this.saveRecord(record);
        if (savedRecord) {
            this.pKeyValue = savedRecord.getValue('eq_system.auto_number');
            _.extend(dragData, {'eq_system.auto_number': this.pKeyValue});
        }
        var index = record.getValue('eq_system.sort_order');
        _.extend(dragData, {'eq_system.sort_order': index});
        var parentNode = this.getParentNode(this.node);
        var addToSort = dd.node.parent != this.node.parent;
        this.sortNaturalOrder(dragData, parentNode, addToSort);
        if ('move' === dragData.dragState && addToSort) {
            this.refreshTreePanelAfterUpdate(dd.node, false);
        }
        this.refreshTreePanelAfterUpdate(this.node, true);
        if (dd.callbackFn) {
            dd.callbackFn.call(this, true);
        }
        return true;
    },
    notifyOver: function (dd, e, data) {
        var targetEl = jQuery(this.el.dom);
        var node = this.node;
        targetEl.addClass('esTree-line');
        console.log(node.data['eq_system.eq_id_depend']);
        return this.dropAllowed;
    },
    notifyOut: function (dd, e, data) {
        var targetEl = jQuery(this.el.dom);
        targetEl.removeClass('esTree-line');
    },
    refreshTreePanelAfterUpdate: function (node, expand, callback) {
        var parentNode = this.getParentNode(node);
        if (parentNode.isRoot()) {
            this.objTree.refresh();
            //this.objTree.refreshNode(node);
        } else {
            this.objTree.refreshNode(parentNode);
            if (expand) {
                this.expandParentNode(parentNode);
            }
        }
        if (callback) {
            callback.call();
        }
    },
    expandParentNode: function (parentNode) {
        var crtParent = parentNode;
        for (; !crtParent.parent.isRoot();) {
            crtParent.parent.expand();
            crtParent = crtParent.parent;
        }
        parentNode.expand();
    },
    getParentNode: function (node) {
        var rootNode = this.objTree.treeView.getRoot();
        var index = node.level.levelIndex;
        if (index == 0) {
            return rootNode;
        } else {
            return node.parent;
        }
    },
    prepareRecord: function (dragData) {
        var record = null;
        if ('new' === dragData.dragState || 'copy' === dragData.dragState) {
            record = this.createNodeRecord(dragData);
        } else if ('move' === dragData.dragState) {
            record = this.getExistingNodeRecord(dragData);
            var masterId = this.node.data['eq_system.eq_id_master'];
            if (this.node.parent.isRoot()) {
                masterId = dragData['eq_system.eq_id_depend'];
            }
            record.setValue('eq_system.eq_id_master', masterId);
        }
        return record;
    },
    createNodeRecord: function (dragData) {
        var masterId = this.node.data['eq_system.eq_id_master'];
        var dependId = dragData['eq_system.eq_id_depend'],
            sysName = dragData['eq_system.system_name'];
        if ('new' === dragData.dragState) {
            var eqRecord = getEquipmentRecord(dependId);
            sysName = eqRecord.getValue('eq.use1');
            if (!valueExistsNotEmpty(sysName)) {
                sysName = eqRecord.getValue('eq.eq_std');
            }
        }
        if (this.node.parent.isRoot()) {
            masterId = dependId;
        }
        return new Ab.data.Record({
            'eq_system.eq_id_master': masterId,
            'eq_system.eq_id_depend': dependId,
            'eq_system.system_name': sysName,
            'eq_system.sort_order': 0
        }, true);
    },
    getExistingNodeRecord: function (dragData) {
        return View.dataSources.get('eqSystemDs').getRecord(new Ab.view.Restriction({'eq_system.auto_number': dragData['eq_system.auto_number']}));
    },
    saveRecord: function (record) {
        return View.dataSources.get('eqSystemDs').saveRecord(record);
    },
    sortNaturalOrder: function (dragData, parentNode, addToSort) {
        var levelNodes = [];
        for (var index = 0; index < parentNode.children.length; index++) {
            var data = parentNode.children[index].data;
            levelNodes.push(data);
        }
        var newIndex = this.position;
        var oldIndex = dragData.position;
        if (addToSort) {
            //start position is zero
            levelNodes.splice(newIndex, 0, dragData);
            oldIndex = newIndex;
            newIndex++;
        }
        if (newIndex < oldIndex) {
            newIndex++;
        }
        var sortNodes = this.move(levelNodes, oldIndex, newIndex);
        for (var index = 0; index < sortNodes.length; index++) {
            this.saveSortOrder(sortNodes[index], index + 1);
        }
    },
    saveSortOrder: function (data, index) {
        var autoNumber = Number(data['eq_system.auto_number']);
        var eqSystemDs = View.dataSources.get('eqSystemDs');
        var record = eqSystemDs.getRecord(new Ab.view.Restriction({'eq_system.auto_number': autoNumber}));
        record.setValue('eq_system.sort_order', index);
        eqSystemDs.saveRecord(record);
    },
    move: function (list, oldIndex, newIndex) {
        while (oldIndex < 0) {
            oldIndex += list.length;
        }
        while (newIndex < 0) {
            newIndex += list.length;
        }
        if (newIndex >= list.length) {
            var k = newIndex - list.length;
            while ((k--) + 1) {
                list.push(undefined);
            }
        }
        list.splice(newIndex, 0, list.splice(oldIndex, 1)[0]);
        return list;
    }
});
/**
 * Returns equipment record.
 */
function getEquipmentRecord(eqId) {
    return View.dataSources.get('equipmentDs').getRecord(new Ab.view.Restriction({'eq.eq_id': eqId}));
}