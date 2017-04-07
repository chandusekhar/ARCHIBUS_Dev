/**
 * This example shows how to refresh the selected node in the tree control.
 */

function refreshNode() {
    // get the tree control
    var treeControl = View.getControl('', 'exSimpleTreeWithRefreshNode_dvTree');

    // get the last node clicked
    var node = treeControl.lastNodeClicked;

    //refresh the node
    treeControl.refreshNode(node);

    //expand the node
    node.expand();
}
