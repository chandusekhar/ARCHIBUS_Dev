/*
Copyright (c) 2007, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: Sept, 2007
*/

/**
 * The treecontrol is a select value tree control component.
 * @module tree
 * @title SelectValueTreeControl Component
 * @requires yahoo yui treeview and event, Ab.tree.TreeControl
 * @optional animation
 * @namespace Ab.tree
 */

Ab.tree.SelectValueTree = Ab.tree.TreeControl.extend({

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
        	var filterValue = this.filterValues[fieldName];
        	if(valueExists(filterValue)){
        		//XXX:get the first value from hierarchical value.
        		var hierarchy_delim = Ab.view.View.preferences.hierarchy_delim;
        		if(!valueExistsNotEmpty(hierarchy_delim)){
        			//default
        			hierarchy_delim = "|";
        		}
        		filterValue = filterValue.split(hierarchy_delim)[0];
        	}
        	
            filterFieldValues.push({"fieldName": fieldName, "filterValue": filterValue})
          }
          parameters.filterValues = toJSON(filterFieldValues);
        }

        var restriction = new Ab.view.Restriction();

        // add the tree restriction to parameter list if not null.
        if(this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
         if(this.type=='selectValueTree'){
            for(var index=0; index < this.visibleFieldNames.length; index++){
                var clause = this.restriction.findClause(this.visibleFieldNames[index]);
                if(clause){
                  restriction.clauses.push(clause);
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
        } else if(this.restriction && (this.restriction.clauses == undefined || this.restriction.clauses.length <= 0)) {
        	//could be SQL statement
        	// test if the restriction is an empty {}.
        	if(toJSON(this.restriction)!="{}"){
        		parameters.restriction = this.restriction;
        	}
        }
        
        //KB# 3035596 - Select Value dialogs of type=tree and type=hierTree ignore recordLimit attribute and ignore recordLimit option in View.selectValue. 
        if (this.recordLimit != -1){
        	parameters.recordLimit = this.recordLimit;
        }

        return parameters;
    },

    /**
     * initialize the tree by calling the WFR to get the data, compose the text node label, then add the node to the tree view.
     * @method initTree
     * @parameter {String} dataSourceId the id for the top level data source
     *            {Ab.treeControl.TreeNode} parent the parent node
     *            {JSON array} sqlRest the restriction or the parent primary key field<->data pair in JSON format
     *            {integer} the level index
     * @private
     */
     _initTree: function(panelData, parent, level) {

		// if panelData not define, return
		if(typeof(panelData) == 'undefined'){
			return;
		}

        // call WFR to get the data
        var result = null;

        try{
        	result = Workflow.call('AbCommonResources-getDataRecords', this._getParameters(panelData, parent, level), 120);
        } catch (e){
			this.handleError(e);
		}

        if (result.code == 'executed') {
			// call afterGetData for post-processing (e.g., localization of data from messages)
			var listener = this.getEventListener('afterGetData');
			if (listener) {
				listener(this, result.data, level);
			}

		    // set the max level only once for selectValueTree
            if(level == 0 && this.type=='selectValueTree'){
                this.maxLevel =   result.data.primaryKeyIds.length-1;
            }

			if(panelData!=null && panelData.panelId != null){
	        	var elem = document.getElementById(panelData.panelId + "_msg_no_record");
				if(elem != null){
					elem.parentNode.removeChild(elem); 
				}
			}

            if( result.data.records.length > 0 ) {
				// if the WFR succeeded, create a treeLevel object
	            var treeLevel = new Ab.tree.TreeLevel(level, result.data, panelData);
	            this._addTreeLevel(treeLevel);
	
	            // create a TreeNode for each record returned from server
	            this._addTreeNodes(result, parent, treeLevel);
	
	            // if the child nodes are added fine, then for hierarchy tree, set the maxLevel to the current deepest level.
	            if(this.type=='selectValueHierTree' && this.maxLevel < level){
	                this.maxLevel = level;
	            }
			} else {
				if(level == 0 && panelData!=null && panelData.panelId != null){
		        	var elem = document.getElementById(panelData.panelId);
					if(elem != null){
					 	divNode = document.createElement("div");
						divNode.id = panelData.panelId + "_msg_no_record";
						divNode.className = "instruction";
						divNode.innerHTML = "<br>" + this.getLocalizedString(this.z_EMPTY_TREE_MESSAGE);
						elem.parentNode.appendChild(divNode);
					}
				}
			}
        } else {
          // handle the exceptions
          this.handleError(result);
      }
    },

    /**
     * internal function to register the tree node events
     * This function loops through each node's event then register the corresponding function based on the event type
     * @method _registerEvent
     * @parameter {Ab.treeControl.TreeNode} node the tree node
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
     * @parameter {Ab.treeControl.TreeNode} node the current node that user clicked on
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
     * @param {String} id the id for the tree control, usually the tablegroup name (or 'AfmTreeView')
     *        (Ab.view.ConfigObject) configObject the parameters passed from xsl fopr the current tree view
     * @public
     */
    constructor: function(dialog) {
        var parameters = Ab.view.View.selectValueParameters;
    
        // set dialog title
        // TODO: localize
        var defaultTitle = this.getLocalizedString(Ab.tree.SelectValueTree.z_TITLE_SELECT_VALUE);
        dialog.setTitle(defaultTitle + ' - ' + parameters.title);

        var configObject = new Ab.view.ConfigObject();
    
        //set default paramters
        this.inherit(dialog.body.id, configObject);
    
        // overwrite default parameters with tree specific values.
        this.type = (parameters.selectValueType === 'tree') ? 'selectValueTree' : 'selectValueHierTree';
        this.visibleFieldNames = parameters.visibleFieldNames;
        this.selectTableName = parameters.selectTableName;
        this.selectValueListener = afterSelectValueTree;
        this.isDistinct = true;
        this.isCollapsed = false;

        if(parameters.restriction){
        	this.restriction = new Ab.view.Restriction();
        	try{
        		this.restriction.addClauses( eval('(' + parameters.restriction + ')'), true);
        	} catch (e){
        		this.restriction = parameters.restriction;
        	}
        }
        
        // convert filter values from target form field names to visible field names
        if (valueExists(parameters.applyFilter) && parameters.applyFilter==='true') {
        	var convertedFilterValues = {};
        	 
            for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.fieldNames.length; i++) {
                var fieldName = parameters.fieldNames[i];
                var selectedFieldName = parameters.selectFieldNames[i];
    
                var filterValue = parameters.filterValues[fieldName];
				if (valueExists(filterValue)) {
					convertedFilterValues[selectedFieldName] = filterValue;
				}
            }
            this.filterValues = convertedFilterValues;
        }
      
        // KB# 3035596 - Select Value dialogs of type=tree and type=hierTree ignore recordLimit attribute and ignore recordLimit option in View.selectValue. 
        if (valueExists(parameters.recordLimit) ) {
        	this.recordLimit = parameters.recordLimit;
        } 

		this.addEventListenerFromConfig('afterGetData', configObject);
		if (!this.getEventListener('afterGetData')) {
			this.addEventListener('afterGetData', this.afterGetData);
		}
        
		this.initialDataFetch();

        var tree = this;
        dialog.on('resize', function(window, width, height) {
            tree.updateHeight();
        });
    }
},
{
	// @begin_translatable
	z_TITLE_SELECT_VALUE: 'Select Value'
	// @end_translatable

});


/**
 * Called when the user selects a value.
 */
function afterSelectValueTree(e, node) {
    var parameters = Ab.view.View.selectValueParameters;

    var form = Ab.view.View.getControl('', parameters.formId); 
    var openerWindow = Ab.view.View.getOpenerWindow();
    
    // for all selected values
    for (var i = 0; i < parameters.selectFieldNames.length && i < parameters.fieldNames.length; i++) {
        var fieldName = parameters.fieldNames[i];
        var selectedFieldName = parameters.selectFieldNames[i];

        // get selected value
        var selectedValue = node.getPrimaryKeyValue(selectedFieldName);
        if (selectedValue === '') {
            selectedValue = node.data[selectedFieldName];
        }

        // look back the current node's parent to find the pk values
        var thisNode = node;
        while (selectedValue == undefined && thisNode.parent != null) {
            thisNode = thisNode.parent;
            if (!thisNode.isRoot()) {
                selectedValue = thisNode.getPrimaryKeyValue(selectedFieldName);
                if (selectedValue === '') {
                    selectedValue = thisNode.data[selectedFieldName];
                }
            }
        }

        // save selected value into opener form field (if it exists)
        var previousValue = null;
        if (form != null) {
            var input = form.getFieldElement(fieldName);
            if (input != null) {
            	previousValue = input.value;
            }
        }

        var canSave = true;
        // optionally call custom action listener
        var fn = parameters.actionListener;
        var win = window;
        if (fn != null && fn != '' && typeof(fn) != 'undefined') {  
            if (!fn.call) {
                fn = win[fn];
            }
            if (!valueExists(fn) || !fn.call) {
            	win = openerWindow;
                fn = win[fn];
            }
            if (fn.call) {   
                var result = fn.call(win, fieldName, selectedValue, previousValue);
                if (typeof(result) == 'boolean') {
                    canSave = result;
                }
            }
        }

        // save selected value into opener form field (if the custom action listener does not prevent it)
        if (canSave && input != null && valueExists(selectedValue)) {
            form.setFieldValue(fieldName, selectedValue, null, false);
            //input.value = selectedValue;
            openerWindow.afm_form_values_changed = true;
        }
    }

    Ab.view.View.closeDialog();
}
