/*
Copyright (c) 2007, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: August 25, 2007
*/

/**
 * The file defines a list of common functions used by tree.
 * User can customize these functions to suit their needs
 */


/* This function refresh the top level tree and removes all its children nodes
 * For other tree levels, user can expand the top nodes to refresh the data
 */
function refreshTree() {

        var tree = AFM.view.View.getTreeControl('');

        tree.refresh();

}

/* This function collapse the top level tree node. */
function collapseTree() {

        var tree = AFM.view.View.getTreeControl('');

        tree.collapse();

}

/* This function expand the tree node to the next level. */
function expandTree() {

        var tree = AFM.view.View.getTreeControl('');

        tree.expand();

}
