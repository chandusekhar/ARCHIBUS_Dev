/*
Copyright (c) 2007, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: Sept, 2007
*/

/**
 * The treecontrol is a select value tree control component.
 * @module tree
 * @title SelectValueTreeControl Component
 * @requires yahoo yui treeview and event, AFM.tree.TreeControl
 * @optional animation
 * @namespace AFM.tree
 */

AFM.tree.SelectValueTreeControl = AFM.tree.TreeControl.extend({

    // custom event handler called when the user selects the row
    selectValueListener: null,

    // the main table name of the tree control
    selectTableName: null,

    // the visible fields of the tree control
    visibleFieldNames: null,

    filterValues: null,

    _getParameters: function(panelData, parent, level) {

        var  parameters = {
                          tableName:  this.selectTableName,
                          fieldNames: toJSON(this.visibleFieldNames),
                          treeType:  this.type,
                          treeLevel: level
                          };

        if(this.filterValues != null) {
          var filterFieldValues = new Array();
          for(var fieldName in this.filterValues){
            filterFieldValues.push({"fieldName": fieldName, "filterValue": this.filterValues[fieldName]})
          }
          parameters.filterValues = toJSON(filterFieldValues);
        }

        var restriction = new AFM.view.Restriction();

        // add the tree restriction to parameter list if not null.
        if(this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
         if(this.type=='selectValueTree'){
            for(var index=0; index < fieldNames.length; index++){
                var index = this.restriction.clauses.findClause(fieldNames[index]);
                if(index > -1){
                  parameters.restriction.clauses.push(this.restriction.clauses[index]);
                }
            }
         } else {
          restriction.addClauses(this.restriction, true);
         }
        }

        // add the tree level's restriction to parameter list if not null.
        if(this.type!='selectValueTree') {
          var levelRest = this.getRestrictionForLevel(level);
          if(levelRest && levelRest.clauses != undefined && levelRest.clauses.length>0){
            restriction.addClauses(levelRest, true);
          }
        }

        // add the parent node's restriction to parameter list. it should always contain something
        if(!parent.isRoot()) {
          restriction.addClauses(parent.restriction, true);
        }


        if(restriction.clauses != undefined && restriction.clauses.length > 0){
          parameters.restriction = toJSON(restriction);
        }

        return parameters;
    },

    /**
     * initialize the tree by calling the WFR to get the data, compose the text node label, then add the node to the tree view.
     * @method initTree
     * @parameter {String} dataSourceId the id for the top level data source
     *            {AFM.treeControl.TreeNode} parent the parent node
     *            {JSON array} sqlRest the restriction or the parent primary key field<->data pair in JSON format
     *            {integer} the level index
     * @private
     */
     _initTree: function(panelData, parent, level) {

        // call WFR to get the data
        var result = null;

        result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', this._getParameters(panelData, parent, level));

        if (result.code == 'executed') {

          // set the max level only once for selectValueTree
          if(level == 0 && this.type=='selectValueTree'){
            this.maxLevel =   result.data.primaryKeyIds.length-1;
          }

          // if the WFR succeeded, create a treeLevel object
          var treeLevel = new AFM.tree.TreeLevel(level, result.data, panelData);
          this._addTreeLevel(treeLevel);

          // create a TreeNode for each record returned from server
          this._addTreeNodes(result, parent, treeLevel);

          // if the child nodes are added fine, then for hierarchy tree, set the maxLevel to the current deepest level.
          if(this.type=='selectValueHierTree' && this.maxLevel < level){
              this.maxLevel = level;
          }
        } else {
          // handle the exceptions
          AFM.workflow.Workflow.handleError(result);
      }
    },

    /**
     * internal function to register the tree node events
     * This function loops through each node's event then register the corresponding function based on the event type
     * @method _registerEvent
     * @parameter {AFM.treeControl.TreeNode} node the tree node
     * @private
     */
    _registerEvents: function(node) {
        if(this.selectValueListener!=''
          && ((this.type=='selectValueTree' && node.isLeafNode) || this.type=='selectValueHierTree')) {
             YAHOO.util.Event.addListener(node.getLabelEl(), "click", this.selectValueListener, node);
        }
    },

    /**
     * callback function to load the children of the current node dynamically
     * This function loads the children of the node by calling the WFR to get the data,
     * compose the text node label, then add the node to the tree view.
     * @method loadNodeData
     * @parameter {AFM.treeControl.TreeNode} node the current node that user clicked on
     *            {String} onCompleteCallback the function to call after data is loaded
     * @private
     */
    _loadNodeData: function(node, onCompleteCallback) {

      // set the children's level index number
      var nextLevel = node.level.levelIndex + 1;

      // the level of tree nodes to be added can not exceed the maximum tree level number
      // otherwise, it is a leaf node.
      if(node.treeControl.type=='selectValueTree' && nextLevel > node.treeControl.maxLevel) {
        node.isLeafNode = true;
      }

      // for non-leaf nodes, call WFR to populate the data
      if(!node.isLeafNode) {
        // initialize the node's children
        node.treeControl._initTree(null, node, nextLevel );
      }

      // Be sure to notify the TreeView component when the data load is complete
      onCompleteCallback();

      // after all children are generated, register the events for each child node
      for(var nodeCounter = 0; nodeCounter < node.children.length; nodeCounter++) {
          node.treeControl._registerEvents(node.children[nodeCounter]);
      }
    },


    // ----------------------- public methods ----------------------------------

    /**
     * Constructor function creates the control instance and sets its initial state.
     * @method constructor
     * @param {String} controlId the id for the tree control, usually the tablegroup name (or 'AfmTreeView')
     *        (AFM.view.ConfigObject) configObject the parameters passed from xsl fopr the current tree view
     * @public
     */
    constructor: function(controlId, configObject) {

        var selectValueListener = configObject.getConfigParameterIfExists('selectValueListener');
        if (valueExists(selectValueListener) && selectValueListener != '') {
            this.selectValueListener = selectValueListener;
        }

        // set the hierarchy trace field
        var selectTableName = configObject.getConfigParameterIfExists('selectTableName');
        if (valueExists(selectTableName) && selectTableName != '') {
            this.selectTableName = selectTableName;
        }


        // set the hierarchy trace field
        var visibleFieldNames = configObject.getConfigParameterIfExists('visibleFieldNames');
        if (valueExists(visibleFieldNames) && visibleFieldNames != '') {
            this.visibleFieldNames = visibleFieldNames;
        }


        var filterValues = configObject.getConfigParameterIfExists('filterValues');
        if (filterValues != null) {
            this.filterValues = filterValues;
        }

        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        this.inherit(controlId, configObject);

    }
});



/**
 * Creates and loads the Select Value control.
 */
function user_form_onload() {
    if (opener == null) {
        return;
    }

    var parameters = opener.AFM.view.View.selectValueParameters;

    // set Select Value view title
    var panelTitle = getPanelTitle('select-value-tree-panel') + ' - ' + parameters.title;
    setPanelTitle('select-value-tree-panel', panelTitle);

    // convert filter values from target form field names to visible field names
    var convertedFilterValues = [];
    if (parameters.applyFilter) {
        for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.targetFieldNames.length; i++) {
            var targetFieldName = parameters.targetFieldNames[i];
            var selectedFieldName = parameters.selectFieldNames[i];

            var filterValue = parameters.filterValues[targetFieldName];
            convertedFilterValues[selectedFieldName] = filterValue;
        }
    }


    var configObject = new AFM.view.ConfigObject();
    configObject.setConfigParameter('selectTableName', parameters.selectTableName);
    configObject.setConfigParameter('visibleFieldNames', parameters.visibleFieldNames);
    configObject.setConfigParameter('type', parameters.type);
    configObject.setConfigParameter('applyFilter', parameters.applyFilter);
    configObject.setConfigParameter('filterValues', convertedFilterValues);
    configObject['selectValueListener'] = afterSelectValue;

    // construct the tree
    var tree = new AFM.tree.SelectValueTreeControl('select_value_tree', configObject);

    // refresh the tree with the opener's restriction
   // tree.refresh();

}

/**
 * Called when the user selects a value.
 */
function afterSelectValue(e, node) {
    var parameters = opener.AFM.view.View.selectValueParameters;

    // for all selected values
    for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.targetFieldNames.length; i++) {
        var targetFieldName = parameters.targetFieldNames[i];
        var selectedFieldName = parameters.selectFieldNames[i];

        // get selected value
        var selectedValue = node.getPrimaryKeyValue(selectedFieldName);

        // look back the current node's parent to find the pk values
        var thisNode = node;
        while(selectedValue==undefined && thisNode.parent!=null){
          thisNode = thisNode.parent;
          if(!thisNode.isRoot()){
            selectedValue = thisNode.getPrimaryKeyValue(selectedFieldName);
          }
        }

        // save selected value into opener form field (if it exists)
        var input = opener.$(targetFieldName, false);
        if (input != null) {
            var previousValue = input.value;
        }

        var canSave = true;
        // optionally call custom action listener
        var fn = parameters.actionListener;
        if (fn != null && fn != '' && typeof(fn) != 'undefined') {
            if (!fn.call) {
                fn = opener[fn];
            }
            if (fn.call) {
                var result = fn.call(opener, targetFieldName, selectedValue, previousValue);
                if (typeof(result) == 'boolean') {
                    canSave = result;
                }
            }
        }

        // save selected value into opener form field (if the custom action listener does not prevent it)
        if (canSave && input != null && selectedValue != null && typeof(selectedValue) != 'undefined') {
            if(input.value != selectedValue)
                opener.afm_form_values_changed = true;
            input.value = selectedValue;

        }
    }

    opener.AFM.view.View.closeDialog();
}
