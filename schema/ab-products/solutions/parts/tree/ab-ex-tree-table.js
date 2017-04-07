/**
 * By default, when the user clicks on any link or button in the tree, the tree highlights the corresponding node.
 * This example shows how to un-highlight the selected tree node from the application code.
 */
View.createController('exTreeTable', {

    // attaching onClickNode event listener
    bridgedTree_dv_tree_onClickNode: function (panel, node) {
        View.alert('onClickNode \n' + panel.panelId + '\n' + toJSON(node.data));
        node.highlightNode(false);
    },

    // attaching event listener to 'Edit' button
    bridgedTree_rm_tree_onEdit: function (button, panel, node) {
        View.alert('onEdit \n' + panel.panelId + '\n' + toJSON(node.data));
        node.highlightNode(false);
    },

    // attaching event listener to 'Edit' image
    bridgedTree_dv_tree_onImageEdit: function (button, panel, node) {
        View.alert('onImageEdit \n' + panel.panelId + '\n' + toJSON(node.data));
        node.highlightNode(false);
    }
});