/**
 * An extension of {@link Ext.dataview.NestedList} that provides a way for a top level node to be selected.
 * Used in the {@link Common.control.prompt.ProblemType} class.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.control.list.ProblemTypeList', {
    extend: 'Ext.dataview.NestedList',

    xtype: 'problemtypelist',

    /**
     * Override to allow the parent node to be selected without transitioning to the child node.
     *
     * @override
     * Called when an list item has been tapped.
     * @param {Ext.List} list The subList the item is on.
     * @param {Number} index The id of the item tapped.
     * @param {Ext.Element} target The list item tapped.
     * @param {Ext.data.Record} record The record which as tapped.
     * @param {Ext.event.Event} e The event.
     */
    onItemTap: function (list, index, target, record, e) {
        var me = this,
            store = list.getStore(),
            node = store.getAt(index);

        if (!Ext.isEmpty(e.getTarget('div.ab-probtype-list-disclosure'))) {
            if (node.isLeaf()) {
                me.fireEvent('itemselected', this, list, index, target, record, e);
                me.goToLeaf(node);
            }
            else {
                me.goToNode(node);
            }
        } else {
            me.fireEvent('itemselected', this, list, index, target, record, e);
        }
    }
});
