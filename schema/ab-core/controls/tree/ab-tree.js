/*
Copyright (c) 2007, ARCHIBUS Inc. All rights reserved.
Author: Ying Qin
Date: July 25, 2007
*/

/**
 * The treecontrol is a generic tree control component.
 * @module tree
 * @title TreeControl Component
 * @requires yahoo yui treeview and event
 * @optional animation
 * @namespace Ab.tree
 */

Ab.namespace('tree');

/**
 * The tree control is a visual component (like a Grid or a Form) that represents the complete tree user interface on the HTML page.
 * It is implemented by Ab.tree.TreeControl JavaScript class that extends Ab.view.Component class. This is required to make the tree control interoperable with other controls and commands on the page.
 * It aggregates the YAHOO.widget.TreeView class. It cannot extend the YUI class because it already extends the Ab.view.Component class.
 * It has N tree level objects. The XSL generates the JavaScript code that calls the control constructor and passes in the ConfigObject that contains control properties.
 */
Ab.tree.TreeControl = Ab.view.Component.extend({


    /**
     * Tree's top nodes for this tree control
     * @type an array of Ab.tree.TreeNode objects.
     * @private
     */
    _nodes: null,

    /**
     *  Tree Levels that contain the each tree level's attributes and field defs
     *  @type an internal array of Ab.tree.TreeLevel objects
     *  @priavte
     */
    _levels: null,

    /**
     * Array of boolean dragEnabled flags for all levels.
     */
    _dragEnabled: null,

    /**
     * define the view file name that load the tree (called by WFR)
     * @type String
     * @private
     */
    _viewFile: null,

    /**
     * define the panels data (panel ids, datasource ids, cssClassNames and cssPkClassNames etc) for the afm table group (called by WFR)
     * @type array
     * @private
     */
    _panelsData: null,


    /**
     * define the table group's index index for the tree control
     * This value is passed to WFR to obtain the data from the desired datasource
     * @type integer
     * @private
     */
    _groupIndex: 0,

	/**
	 * a map of the node's field name and its label text to replace null value.
	 * related kb# 3039091
	 */
	_nullValueTextMap: {},
	
	/**
	 * Handles hatch pattern images.
	 */
	_legendTables: [],
	
	/**
	 * Handles hatch pattern images.
	 */
	_legendFields: [],
	
    /**
    * Tree View object for the tree control (each tree node retains the reference to this object)
    * @type YAHOO.widget.TreeView
    * @public
    */
    treeView: null,

    /**
     * define the maximum level index for the tree control.
     * This value is used to identify the leaf node for regular tree.
     * For regular tree, this value equals the number of panels.
     * For hierarchy tree, this value is unknow until user click on the tree node.
     * @type integer
     * @public
     */
    maxLevel: 0,

    /**
     * If false, the tree hides parent nodes that do not have children at any level except the last.
     */
    showNodesWithoutChildren: true,

    /**
     * define the type for the tree control
     * @type String. the values are 'tree', 'hierTree', 'selectValueTree' or 'selectValueHierTree'
     * @public
     */
    type: 'tree',

    lastNodeClicked: null,

    /*
     * define the number of records allowes in the tree panel.
     */
    recordLimit: -1,
    
    
  /**
   * define the restriction for the whole tree
   * @type Ab.view.Restriction
   * @public
   */
    restriction: null,

 	/** 
 	* The opacity to apply to cell type of 'color'.  Default is null, meaning do not set.
 	*/
	colorOpacity: null,
	 

	// @begin_translatable
	z_EMPTY_TREE_MESSAGE: 'No records available.',
	// @end_translatable
	
	
	
    // --------------------- private methods -----------------------------------

    /**
     * add the TreeLevel object to the tree view.
     * @method addTreeLevel
     * @param {Ab.tree.TreeLevel} level the level to be added to tree view object
     * @private
     */
    _addTreeLevel: function(level) {
      this._levels.push(level);
    },


    /**
     * add the tree node object to the tree view.
     * @method addTreeNode
     * @param {Ab.tree.TreeNode} node the node to be added to tree view object
     * @private
     */
    _addTreeNode: function(node) {
      this._nodes.push(node);
    },

    _getParameters: function(panelData, parent, level) {

        // compose the parameter list to pass to WFR
        var  parameters = {
                          version: '2',
                          viewName: this._viewFile,
                          dataSourceId: panelData.dataSourceId,
                          controlId: panelData.panelId,
                          groupIndex: this._groupIndex,
                          treeType:  this.type,
                          treeLevel: level,
                          recordLimit: -1
                          };

        if (this.recordLimit != undefined && this.recordLimit != -1){
            parameters.recordLimit = this.recordLimit;
        }

        var restriction = this._createRestrictionForLevel(parent, level);

        if (restriction && restriction.clauses != undefined && restriction.clauses.length > 0){
            parameters.restriction = toJSON(restriction);
        }

        Ext.apply(parameters, this.parameters);

        return parameters;
    },

    /**
     * Creates restriction that will be applied to the data source to retrieve level data records.
     * @param {Object} parentNode
     */ 
    _createRestrictionForLevel: function(parentNode, level) {
        var restriction = this.createRestrictionForLevel(parentNode, level);
		
		if (!restriction) {
			restriction = new Ab.view.Restriction();
			
			// add the tree restriction to parameter list if not null.
			if (this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
				//kb# 3039091 - allow to add the restriction if the field value is null or empty
				restriction.addClauses(this.restriction, true, false, {
																		addForNullValue: true,
																		addForEmptyValue: true
																		});
			}
			
			// add the tree level's restriction to parameter list if not null.
			var levelRest = this.getRestrictionForLevel(level);
			if (levelRest && levelRest.clauses != undefined && levelRest.clauses.length > 0) {
				//kb# 3039091 - allow to add the restriction if the field value is null or empty
				restriction.addClauses(levelRest, true, false, {
					addForNullValue: true,
					addForEmptyValue: true
					});
			}
			
			// add the parent node's restriction to parameter list. it should always contain something
			if (!parentNode.isRoot()){
				if(this.type=='hierTree' || this.type=='selectValueHierTree'){
					//kb# 3039091 - allow to add the restriction if the field value is null or empty
					restriction.addClauses(parentNode.restriction, true, false, {
						addForNullValue: true,
						addForEmptyValue: true
						});
			    } else {
			    	if (this._panelsData[level].useParentRestriction==true) {
						//kb# 3039091 - allow to add the restriction if the field value is null or empty
						restriction.addClauses(parentNode.restriction, true, false,{
							addForNullValue: true,
							addForEmptyValue: true
							});
					}
				}
			}
		}

        this.updateRestrictionForLevel(parentNode, level, restriction);
		
		return restriction;
	}, 

    /**
     * Creates restriction that will be applied to the data source to retrieve level data records.
     * This method is intended to be overridden.
     * @param {Object} parentNode
     */ 
    createRestrictionForLevel: function(parentNode, level) {
		return null;
	},

    /**
     * Updates restriction that will be applied to the data source to retrieve level data records.
     * This method is intended to be overridden.
     * @param {Object} parentNode
     */
    updateRestrictionForLevel: function(parentNode, level, restriction) {
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
        try{
        	var result = Workflow.call('AbCommonResources-getDataRecords', this._getParameters(panelData, parent, level), 120);
        	
        	if (result.code == 'executed') {
    			// call afterGetData for post-processing (e.g., localization of data from messages)
    			var listener = this.getEventListener('afterGetData');
    			if (listener) {
    				listener(this, result.data, level);
    			}
    			
    			var elem = document.getElementById(panelData.panelId + "_msg_no_record");
    			if(elem != null){
    				elem.parentNode.removeChild(elem); 
    			}
    			
    			if( result.data.records.length > 0 ) {
    				// if the WFR succeeded, create a treeLevel object
    				var treeLevel = new Ab.tree.TreeLevel(level, result.data, panelData);
    				this.applySidecarToLevel(treeLevel);
    				this._addTreeLevel(treeLevel);
    				
    				// create a TreeNode for each record returned from server
    				this._addTreeNodes(result, parent, treeLevel);
    				
    				// if the child nodes are added fine, then for hierarchy tree, set the maxLevel to the current deepest level.
    				if (this.type=='hierTree' && this.maxLevel < level) {
    					this.maxLevel = level;
    				}
    			} 
    			else {
    				if(level > 0){
    					//kb# 3022422 
    					parent.isLeafNode = true;
    				} else {
    		        	var elem = document.getElementById(panelData.panelId);
    					if(elem != null){
    						var divNode = document.createElement("div");
    						divNode.id = panelData.panelId + "_msg_no_record";
    						divNode.className = "noRecords";
    						divNode.innerHTML = this.getLocalizedString(this.z_EMPTY_TREE_MESSAGE);
    						elem.parentNode.appendChild(divNode)
    					}
    				}
    			}
            } else {
                // handle the exceptions
                this.handleError(result);
            }
        } catch (e){
			this.handleError(e);
		}

        
    },

    applySidecarToLevel: function(treeLevel){
    	var sidecar = this.getSidecar();
    	var sidecarLevels = sidecar.get('levels');
    	if(sidecarLevels && sidecarLevels[treeLevel.levelIndex]){
    		treeLevel.visibleFields = sidecarLevels[treeLevel.levelIndex].visibleFields;
    	}
    	return treeLevel;
    },

    /**
     * Creates tree nodes for specified level from server-side data and adds them to the parent node.
     * @param result
     * @param parent
     * @param treeLevel
     * @private
     */
    _addTreeNodes: function(result, parent, treeLevel) {
        var numberOfNodes = result.data.records.length;
        for (var i = 0; i < numberOfNodes; i++) {
            // 3051658: if the server passed rm.bl_id.key, but not rm.bl_id, copy rm.bl_id.key into rm.bl_id
            var record = result.data.records[i];
            for (var fieldName in record) {
                var keyIndex = fieldName.indexOf('.key');
                if (keyIndex !== -1) {
                    var fieldNameWithoutKey = fieldName.substring(0, keyIndex);
                    if (!record[fieldNameWithoutKey]) {
                        record[fieldNameWithoutKey] = record[fieldName];
                    }
                }
            }

            // create the node instance
            var node = this._createTreeNode(treeLevel, record, parent, false);

            // query children of this node and if there are no children make it a leaf node
            this._updateTreeNodeChildren(node);

            // TODO: what if this node is not a leaf node - is it OK for the parent to be a leaf node?
            if (node.isLeafNode) {
				parent.isLeafNode = false;
			}

            // store level 0 nodes in a collection
            if (parent.isRoot()) {
                this._addTreeNode(node);
            }

            // optionally, hide nodes without children at all tree levels except last
            if (this.showNodesWithoutChildren == false && node.isLeafNode && treeLevel.levelIndex + 1 < this._panelsData.length) {
                this.treeView.removeNode(node);
            }
        }

        // if all  nodes are hidden, make the parent a leaf node
        if (!parent.hasChildren()) {
            parent.isLeafNode = true;
        }
    },

    /**
     * Creates a new tree node instance and returns it.
     * Override in classes that implement different tree node types, e.g. TreeTable.
     * @parameter {Ab.tree.TreeLevel} treeLevel a reference to the TreeLevel object of the node
     *            {JSON String} data  the JSON data retunred from WFR used to set this noe's content
     *            {Ab.tree.TreeNode} parent the parent of this node node
     *            {boolean} expaned  if the tree node is expanded. default to false
     * @private
     */
    _createTreeNode: function(treeLevel, data, parent, expanded) {
        // create a new TreeNode -  a YUI text node with AFM-specific info
        return new Ab.tree.TreeNode(this, treeLevel, data, parent, expanded);
    },

    /**
     * Fetches children of specified tree node. If children do not exist, makes the node non-expandable.
     * @param node
     * @private
     */
    _updateTreeNodeChildren: function(node) {
        var levelIndex = node.level.levelIndex;
        if (this._panelsData && this._panelsData.length > levelIndex) {
            var panelData = this._panelsData[levelIndex + 1];
            if (panelData) {
                var parameters = this._getParameters(panelData, node, levelIndex + 1);
                try {
                    var result = Workflow.call('AbCommonResources-getDataRecords', parameters, 120);
                    if (result.data.records.length == 0) {
                        node.isLeafNode = true;
                    }
                } catch (e) {
                    this.handleError(e);
                }
            }
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

        // index to the events array
        var eventIndex = 0;

        if (node.level.events.length == 0) {
        	// register the default click listener
        	this.addLink(node);
        }
        
        // does the level contains any events?
        while (node.level.events[eventIndex]) {
              // based on the event type, we call different component functions
              // currently we only support 'onClickNode' event
              switch (node.level.events[eventIndex]["type"]){
                 case 'onClickNode':
                      this.addLink(node, eventIndex);
                      break;
                 case 'onContextMenu':
                      break;
				 case 'onChangeMultipleSelection':
				 	  var delegate = this.onChangeMultipleSelection.createDelegate(node, [node]);
				 	  YAHOO.util.Event.addListener(YAHOO.util.Dom.get(node.checkElId), "click", delegate);
				 	  break;
                 default:
                      break;
              }
                              
              eventIndex++;
        }

        // create drag source object carrying node PK values
        if (this.isDragEnabledForLevel(node.level.levelIndex)) {
            new Ext.dd.DragSource(node.labelElId, {
                dragData: node
            });
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
      if(node.treeControl.type=='tree' && nextLevel > node.treeControl.maxLevel) {
        node.isLeafNode = true;
      } 

      // for non-leaf nodes, call WFR to populate the data
      if(!node.isLeafNode) {
          // get the next level tree node's panel data
          // initialize the node's children
          if(node.treeControl.type=='hierTree'){
            node.treeControl._initTree(node.treeControl._panelsData[0], node, nextLevel);
          } else {
          	if(node.isLeafNode){
	            node.treeControl._initTree(node.treeControl._panelsData[nextLevel], node, nextLevel);
    		} else {
	            node.treeControl._initTree(node.treeControl._panelsData[nextLevel], node, nextLevel);
    		}
          }
      }

      // Be sure to notify the TreeView component when the data load is complete
      onCompleteCallback();

      // after all children are generated, register the events for each child node
      node.treeControl._registerNodesEvents(node.children);
    },

    /**
        * Add the Event to the link object, register the event.
        * @param {node} Ab.tree.TreeNode instance.
        * @param {eventIndex} Index of the node event. 
        */
    addLink: function(node, eventIndex) {
        // !!!YUI bug - do not use TextNode's getLabelEl() or Node's getEl() which will return NULL.
        // get the Node's label id through the property directly -->
    	var linkId = node.labelElId;
        var link = $(linkId);
    	
    	var command = null;
    	if (valueExists(eventIndex)) {
	    	var commandsData = node.level.events[eventIndex]["commands"];
	    	var restriction = node.restriction;
	
	        // create command chain
	        command = new Ab.command.commandChain(this.id, restriction);
	        command.addCommands(commandsData);

	        // add command as a link property
	        link.command = command;
    	}

        // register the command as an event listener
        
        // KB 3028554: call the event handlers in the right order
        var listener = function() {
        	// call the default tree node event handler that sets the lastNodeClicked property
        	node.onLabelClick(node);
        	// call the view command
        	if (command) {
        	    command.handle();
        	}
        }

        YAHOO.util.Event.addListener(link, "click", listener);
    },

    // get the restriction for level.
    // @param level could be either Integer or String
    //        if user passed in an Integer value, it indicates the tree level's index
    //        if user passed in a String value, it indicates the tree level's panelId
    getRestrictionForLevel: function(level) {

         if(typeof size == 'number'){
            // the level index is passsed in
            var iLevel = parseInt(level);
            for(var treeLevel in this._levels){
              if(treeLevel.levelIndex == iLevel){
                return treeLevel.restriction;
              }
            }
         } else if (typeof size == 'string') {
            // the panel id is passed in
            for(var treeLevel in this._levels){
              if(treeLevel.panelId == level){
                return treeLevel.restriction;
              }
            }
         }

         return null;
    },


    /**
     * Add the restriction to the tree level's restriction clauses.
     * @param restriction Ab.view.Restriction the restriction to add.
     */
    addRestriction: function(restriction){
      if(this.restriction==null){
        this.restriction = new Ab.view.Restriction();
      }

	  //kb# 3039091 - allow to add the restriction if the field value is null or empty
	  this.restriction.addClauses(restriction, true, false, {
			addForNullValue: true,
			addForEmptyValue: true
			});
    },
    
    /**
     * Returns tree level by index.
     * @return Ab.tree.TreeLevel.
     */
    getLevel: function(index) {
      return this._levels[index];  
    },
    
    
    /**
     * Enables or disables drag for specified level.
     * @param {index} Level index.
     * @param {enabled} Optional, default to true.
     */
    enableDragForLevel: function(index, enabled) {
      if (!valueExists(enabled)) {
          enabled = true;
      }
      this._dragEnabled[index] = enabled;  
    },
    
    /**
     * Returns true if drag is enabled for level.
     */
    isDragEnabledForLevel: function(index) {
      return this._dragEnabled[index];  
    },

    // ----------------------- public methods ----------------------------------

    /**
     * Constructor function creates the control instance and sets its initial state.
     * @method constructor
     * @param {String} id the id for the tree control, usually the tablegroup name (or 'AfmTreeView')
     *        (Ab.view.ConfigObject) configObject the parameters passed from xsl fopr the current tree view
     * @public
     */
    constructor: function(id, configObject) {

        // set the view name that the tree is loaded.
        var viewFile = configObject.getConfigParameterIfExists('viewDef');
        if (valueExists(viewFile) && viewFile != '') {
            this._viewFile = viewFile;
        }

        // set the panel's data for all tree levels
        var panelsData = configObject.getConfigParameterIfExists('panelsData');
        if (valueExists(panelsData) && panelsData != '') {
          this._panelsData = panelsData;
        }

        // add the groupIndex for multiple table groups view
        var groupIndex = configObject.getConfigParameter('groupIndex');
        if (valueExists(groupIndex) && groupIndex != '') {
            this._groupIndex = groupIndex;
        }

        // set the view's restriction
        var restriction = configObject.getConfigParameterIfExists('restriction');
        if (valueExists(restriction) && restriction != '') {
            this.restriction = restriction;
        }

        // set the tree max level
        var maxLevel = configObject.getConfigParameterIfExists('maxLevel');
        if (valueExists(maxLevel) && maxLevel != '') {
            this.maxLevel = maxLevel;
        }

        // set the tree type - 'tree' or 'hierTree'
        var type = configObject.getConfigParameterIfExists('type');
        if (valueExists(type) && type != '') {
            this.type = type;
        }

		var showOnLoad = configObject.getConfigParameterIfExists('showOnLoad');
		if (valueExists(showOnLoad)) {
		    this.showOnLoad = showOnLoad;
		}
		
	    configObject.addParameterIfNotExists('useParentRestriction', false);

	    var recordLimit = configObject.getConfigParameterIfExists('recordLimit');
        if (valueExists(recordLimit) && recordLimit != '') {
            this.recordLimit = recordLimit;
        }

        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        this.inherit(id, this.type, configObject);

        // create the tree
        this.treeView = new YAHOO.widget.TreeView(this.id);

        //turn dynamic loading on for entire tree:
        this.treeView.setDynamicLoad(this._loadNodeData, 1);

        // initialize the top nodes array
        this._nodes = [];

        // initialize the levels array
        this._levels = [];
        this._dragEnabled = [];
        this._legendTables = [];
        this._legendFields = [];

        this.addEventListenerFromConfig('afterGetData', configObject);
		if (!this.getEventListener('afterGetData')) {
			this.addEventListener('afterGetData', this.afterGetData);
		}

        if (View.useScroller()) {
            this.treeView.subscribe("expand",  this.updateHeight.createDelegate(this));
            this.treeView.subscribe("collapse", this.updateHeight.createDelegate(this));
        }
    },

    /**
     * Override for controls that implement auto-scroll.
     */
    isAutoScroll: function() {
        // KB 3038581: if the tree auto-scrolls, the panel title and actions can be cut off
        // return false;
        // GM: KB 3039076: use isScrollable() from ab-component in order to enable the scroll.
        return this.isScrollable();
    },

    /**
     * Sets panel height to occupy the remaining space in the layout region.
     * Overrides Component.updateHeight().
     * TODO: merge with ab-component.js after V.21.1 is released.
     */
    updateHeight: function() {
        // determine the height available to show the scrollable element
        var availableHeight = this.determineAvailableHeight();

        // if the available height can be determined, set the element height and enable scrolling
        var scrollableEl = this.getScrollableEl();
        if (availableHeight > 0 && scrollableEl != null) {
            scrollableEl.setHeight(availableHeight);
        }

        // update component's scroller
        if (this.isAutoScroll() && !this.isScrollInLayout()) {
            this.updateScroller();
        } else {
            this.updateLayoutScroller();
        } 
        
        if (this.isShownInWindow()) {
        	this.updateWindowScroller();
        }

        // update the collapsed/expanded state of the panel
        this.updateCollapsed();
    },


    initialDataFetch: function() {
        // create the Tree Level and Tree Nodes for the top level
        var rootNode = this.treeView.getRoot();

		// display the first level node only if showOnLoad is set to true
		if(this.showOnLoad)
		{
			if(this.type=='selectValueTree' || this.type=='selectValueHierTree') {
	          this._initTree(null, rootNode, 0);
	        } else {
	          if(this.type=='tree'){
		          this._initTree(this._panelsData[0], rootNode, 0);
			  } else {
			      this._initTree(this._panelsData[0], rootNode, 0);
			  }
	        }
		}
			
        // display the tree
        this.treeView.draw();

        this._registerNodesEvents(this._nodes);

        this.updateHeight();
    },
    
    _registerNodesEvents: function(nodes){

      // register all top level nodes events
      for(var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
        this._registerEvents(nodes[nodeCounter]);
      }
    },

    /**
     * Retrieves the tree nodes for root node from the server.
     */
    doRefresh: function() {
        this.clear();

        var rootNode = this.treeView.getRoot();

		if (this.type=='selectValueTree' || this.type=='selectValueHierTree') {
	          this._initTree(null, rootNode, 0);
	    } else {
	          if (this.type=='tree') {
		          this._initTree(this._panelsData[0], rootNode, 0);
			  } else {
			      this._initTree(this._panelsData[0], rootNode, 0);
			  }
	    }
        
        rootNode.refresh();

        // display the tree
        this.treeView.draw();

        this._registerNodesEvents(this._nodes);

        this.clearScroller();
        this.updateHeight();
	},

    /**
     * Retrieves the tree nodes for the current node from the server.
     * @method refreshNode
     * @param {parentNode} Ab.tree.TreeNode the parent tree node to refresh
     * @public
     */
	refreshNode: function(parentNode){
	
		// remove all the parent node's children
		this.treeView.removeChildren(parentNode);

		// get the current node's level
		var levelIndex = parentNode.level.levelIndex;
		
		// propagate the parent node with its children from db
		this._initTree(this._panelsData[levelIndex+1], parentNode, levelIndex+1);
		
		// refresh the parent node
		parentNode.refresh();

		this._registerNodesEvents(parentNode.children);
	},

	// This function will expand the current node with all its ancestors
	// it will also refresh the current node with new data
	expandNode: function(parentNode){

		if(!parentNode.isRoot()){
			var tmpNodes = new Array();
			var tmpParent = parentNode;
			tmpNodes[0] = tmpParent;
			var index = 1;
			//looping through curretn node to compose all its ancestors Nodes into an array
			while(tmpParent.parent){
				tmpParent = tmpParent.parent;
				tmpNodes[index] = tmpParent;
				index++;
			}
			
			// from the oldest ancestor, expand the nodes
			for (index=tmpNodes.length-1;index>=0;index--)
			{
				if(tmpNodes[index].parent!=null){
					// for the current node, remoce all the children so we can refresh the data when calling expand()
					// we only refresh the current node instead of all its ancestors for performance reasons
					if(index==0){
						this.treeView.removeChildren(tmpNodes[index]);
						tmpNodes[index].collapse();
					} 
					tmpNodes[index].isLeafNode = false;
					tmpNodes[index].expand();
				} 
			}
		}
	},
	
	
	/**
	* KB 3019816
	* For Yalta6 we need to provide a translatable string for hard coded strings such as 'Trade' in the following datasource query:
	* <sql dialect="generic">
	* SELECT res_type, res_id FROM 
	* ( SELECT 'Trade' AS res_type, pmp_id, pmps_id, tr_id AS res_id, hours_req AS hours_or_qty_req FROM pmpstr ) 
	* UNION ALL  
	* ( SELECT 'Part' AS res_type, pmp_id, pmps_id, part_id AS res_id, qty_required AS hours_or_qty_req FROM pmpspt ) 
	* ...
	* </sql>
	*
	* Replace record values with message values if message name starts with column name & message ends with record val
	*
	* standard for message name is column name (without table name) + '_' + camelCased value (e.g., for pmps.res_type -> res_type_toolType when value is Tool Type)
	*/
    afterGetData: function(tree, data, level) {
		// for each record
		//	for each field 
		//		if field is not raw or key && typeof string && value != ''
		//		1) camelCase the value
		//		2) prepend val with column + '_'
		//		3) call getMessage() with column_value key
		//		4) if getMessage returns different value, replace
    	var fieldName, fieldNameParts, value, valParts, targetVal, ii, part, messageVal;
		for (var r = 0, record; record = data.records[r]; r++) {
			for (fieldName in record) {
				fieldNameParts = fieldName.split('.');
				if (fieldNameParts.length == 2) {
					value = record[fieldName];
					if (!value || typeof value != 'string' || value.length == 0) {
						continue;
					}
					valParts = value.split(' ');
					targetVal = valParts[0].toLowerCase();
					for (ii = 1, part; part = valParts[ii]; ii++) {
						part = part.toUpperCase().substr(0,1) + part.toLowerCase().substr(1);
						targetVal += part;
					}
					targetVal = fieldNameParts[0] + '_' + fieldNameParts[1] + '_' + targetVal;
					messageVal = getMessage(targetVal);
					
					//3031177 - compare with the parsed special characters [] as <>.
					if (messageVal != replaceHTMLPlaceholders(targetVal)) {
						record[fieldName] = messageVal;
					}
				}
			}
		}
	},

    /**
     * Clears tree content.
     * @method clear
     * @public
     */
    clear: function() {

        // remove all children from the tree control's rootNode
        var rootNode = this.treeView.getRoot();
        this.treeView.removeChildren(rootNode);
        
        // clear last node click
        this.lastNodeClicked = null;

        // clear restriction and refersh the tree control
        rootNode.refresh() ;

        // remove top nodes
        this._nodes = [];

        // remove all the levels
        this._levels = [];
    },

    /**
     * collapse all top level nodes.
     * @method collapse
     * @public
    */
    collapse: function(){
        for(var nodeCounter = 0; nodeCounter < this._nodes.length; nodeCounter++) {
            this._nodes[nodeCounter].collapse();
        }
    },

    /**
     * expand all top level nodes.
     * @method collapse
     * @public
    */
    expand: function(){
        for(var nodeCounter = 0; nodeCounter < this._nodes.length; nodeCounter++) {
            this._nodes[nodeCounter].expand();
        }
    },

    /**
     * Expands all tree nodes at specified levels.
     *
     * @param {maxLevel} 0-based index of the deepest level to expand. If not specified, expands all levels.
     */
    expandAll: function(maxLevel) {
        if (!valueExists(maxLevel)) {
            maxLevel = 1000;
        }

        var tree = this;
        var expandNode = function(node) {
            if (node.level.levelIndex < maxLevel) {
                if (!node.isRoot()) {
                    tree.refreshNode(node);
                }
                node.expand();

                if (node.hasChildren()) {
                    for (var i = 0; i < node.children.length; i++) {
                        expandNode(node.children[i]);
                    }
                }
            }
        };

        for(var nodeCounter = 0; nodeCounter < this._nodes.length; nodeCounter++) {
            expandNode(this._nodes[nodeCounter]);
        }
    },
	
	/**
	 * Enables or disables multiple selection for specified tree level
	 * 
	 * @param {levelIndex} 0-based level index.
	 * @param {enabled} whether to enable multiple selection (optional, defaults to true).
	 */
	setMultipleSelectionEnabled: function(levelIndex, enabled) {
    	if (!valueExists(enabled)) {
    		enabled = true;
    	}
		this._panelsData[levelIndex].multipleSelectionEnabled = true;
		var event = {
			type: 'onChangeMultipleSelection'
		};
		this._panelsData[levelIndex].events.push(event);
	},
	
	/**
	 * Returns an array of selected nodes for specified level.
	 * 
	 * @param {levelIndex} 0-based level index.
	 */
	getSelectedNodes: function(levelIndex){
		var nodes = [];
		for(var i=0; i< this.treeView._nodes.length; i++){
			var node = this.treeView._nodes[i];
			if(node && node.level.levelIndex == levelIndex && node.isSelected()){
				nodes.push(node);
			}
		}
		return nodes;
	},
	
	/**
	 *  get selected records (with pkValues) for specified values
	 * @param {Object} levelIndex
	 */
	getSelectedRecords: function(levelIndex){
		var records = [];
		for(var i=0; i< this.treeView._nodes.length; i++){
			var node = this.treeView._nodes[i];
			if(node && node.level.levelIndex == levelIndex && node.isSelected()){
				var pkValues = node.getPrimaryKeyValues();
				var record = new Ab.data.Record(pkValues, false);
				records.push(record);
			}
		}
		return records;
	},
	
    /**
     * This method is called when the user selects or unselects any checkbox.
     * @param {node} The row object.
     */
	onChangeMultipleSelection: function(node){
		var obkChk = YAHOO.util.Dom.get(node.checkElId);
		node.setSelected(obkChk.checked);
		
        var listener = node.treeControl.getEventListener('onChangeMultipleSelection');
        if (listener) {
            listener(node);
        }
	},
	
	/**
	 * Selects all top-level tree nodes.
	 */
	selectAll: function(selected) {
		if (!valueExists(selected)) {
			selected = true;
		}
		for(var i=0; i< this.treeView._nodes.length; i++){
			var node = this.treeView._nodes[i];
			if (node) {
			    node.setSelected(selected);
			}
		}		
	},
	
	/**
	 * Unselects all top-level tree nodes.
	 */
	unselectAll: function() {
		this.selectAll(false);
	},

	/**
	 * Set treeNodeConfig for specified level.
	 */
	setTreeNodeConfigForLevel: function(levelIndex, treeNodeConfig){
		this._panelsData[levelIndex].treeNodeConfig = treeNodeConfig;
	},
	
	/**
	 * Sets the opacity to be applied to cells of type 'color'.
	 */
	setColorOpacity: function(op) {
	    this.colorOpacity=op;
	},
	
	/**
	 * Sets the text to display for the null value field.
	 * For kb# 3039091.
	 * 
	 * @param fieldName the full field name to set the null value.
	 * @param title the title to set.
	 */
	setNullValueTitle: function(fieldName, title) {

		// field name and title can not be null or empty
		if(valueExists(fieldName) && valueExists(title))
			this._nullValueTextMap[fieldName] = title;

	},
	/**
	 * used to get hatch pattern image.
	 * levelIndexing: starting with 0;
	 * tableName like dv or dp.
	 */
	setLegendTable: function(levelIndexing, tableName){
		this._legendTables[levelIndexing] = tableName;
	},
	/**
	 * Used to get hatch pattern images.
	 * levelIndexing: starting with 0;
	 * fields (Array type) like ['dp.dv_id','dp.dp_id'].
	 */
	setLegendFields: function(levelIndexing, fields){
		this._legendFields[levelIndexing] = fields;
	},
	
	/**
	 * Resets the null value text map.
	 * For kb# 3039091.
	 */
	clearNullValueTextMap: function() {
		this._nullValueTextMap = {};
	}
});

/**
 * Tree node class contrains attributes and state of the tree node.
 * Ab.tree.TreeNode class � extends YAHOO.widget.TreeNode.
 * 1. The tree node is a visible element of the tree.
 * 2. The tree node is implemented by the Ab.tree.TreeNode class that extends the YAHOO.widget.TextNode class.
 * 3. Top level tree nodes are created by the TreeControl based on the data records returned from the WFR.
 * 4. For non-top level tree node, when user expands the non-leaf tree node by clicking �+� or its label,
 *    its child nodes are created based on data records returned from WFR.
 *    Tree node contains events handlers such as expand, collapse, etc.
 *
 */

 /**
 * The constructor will set the AFM-specific properties and call YUI textNode constructor then set the label
 * @method constructor
 * @parameter {Ab.tree.TreeControl} treeControl a reference to the TreeControl object that the node is part of
 *            {Ab.tree.TreeLevel} treeLevel a reference to the TreeLevel object of the node
 *            {JSON String} data  the JSON data retunred from WFR used to set this noe's content
 *            {Ab.tree.TreeNode} parent the parent of this node node
 *            {boolean} expaned  if the tree node is expanded. default to false
 * @public
 */
Ab.tree.TreeNode = function(treeControl, treeLevel, data, parent, expanded) {

        // set the node's attribute
        this.treeControl = treeControl;
        this.level = treeLevel;
        this.tree = treeControl.treeView;

        // default to no children
        this.children = [];

        this.parent = parent;

        this.restriction = new Ab.view.Restriction();

        // call YAHOO.widget.TextNode init() function
        this.init(data, parent, expanded);

        // decide if the node is a leaf node?
        if((this.treeControl.type=='tree' || this.treeControl.type=='selectValueTree' )
                && this.level.levelIndex == this.treeControl.maxLevel){
          this.isLeafNode = true;
        }
		
		// generate an id for select element
		this.checkElId = "ygtvcheck"+this.index;
		
        // does the level contains any events?
        if(this.treeControl.type=='tree' || this.treeControl.type=='hierTree') {
          var eventIndex = 0;
          while(treeLevel.events[eventIndex] && !this.hasLabelClickEvent) {
                //does the events contain a "onLabelClick" event?
                 if(treeLevel.events[eventIndex]["type"]=='onClickNode'){
                   this.hasLabelClickEvent = true;
                 }

                eventIndex++;
          }
        }

        // make sure this function stays in the last line within the function
        // create the label
        this._createLabel();
};


YAHOO.extend(Ab.tree.TreeNode, YAHOO.widget.TextNode, {

    // reference to the Ab.tree.TreeLevel instance
    level: null,

    // reference to the Ab.tree.TreeControl instance
    treeControl: null,

    // is the node a leaf node?
    isLeafNode: false,

    // does user defined the custom label click event?
    hasLabelClickEvent: false,

    // restriction for the current node, this restriction is composed of primary key/value and
    // used to restrict the children nodes
    // @type Ab.view.Restriction
    restriction: null,
	
	//if node is selected or node
	selected: false,
	
	checkElId: null,
	
    /**
     * internal function to create label and data for the node
     * @method _createLabel
     * @private
     */
    _createLabel: function(){

        // compose the label text field using the primary keys
        var labelText = "";
        
        if(this.level.treeNodeConfig){
        	labelText = this.getLabelForNodeConfig(this.level);
        }else{
        	// loop thought the visible fields and compose the label's text
            for (var j = 0; j < this.level.visibleFields.length; j++) {
            	var value = this.data[this.level.visibleFields[j].name];
            	var nullValue = this.treeControl._nullValueTextMap[this.level.visibleFields[j].name];
            	if((!valueExists(value) || value=='') && nullValue!=undefined){
                	value = "[" + nullValue + "]";
            	}
            	
            	if(value!=undefined){
            		if(j>0){
            			labelText = labelText + " ";
            		}
            		
            		// user can use custom style class for primary key and non-primary key part of labels
            		var isColorField = (this.level.visibleFields[j].controlType == 'color');
            		if(isColorField){
            			labelText = labelText + "<span class='" + this.level.cssClassName + " colorSpan' " + ">" + this.getColorContentHtml(value, this.level.visibleFields[j], this.data) + "</span>";
            		}else if(this.level.visibleFields[j].isPk){
            			labelText = labelText + "<span class='" + this.level.cssPkClassName + "'>" + value + "</span>";
            		} else {
            			labelText = labelText + "<span class='" + this.level.cssClassName + "'>" + value + "</span>";
            		} 
            	}
            }
       	}
        
        // set the label
        this.setUpLabel(labelText);
        
		//call custom handler
        if(typeof afterGeneratingTreeNode == "function"){
        	afterGeneratingTreeNode(this);
        }
        		
        // turn off the toggle if the label has custom defined event
        // use: this.href="javascript:void(0);" instead of "#" to avoid jumping to the top of the page
        if(this.hasLabelClickEvent) {
          this.href = "javascript:void(0);";
          // KB 3028554: the textNodeParentChange property is not supported in YUI 2.8
          // instead, the onLabelClick is called from the event listener defined in the addLink() method
          //this.textNodeParentChange = "onLabelClick";
        }
		
		// loop through the primary keys and compose the pkData list
        for (var j = 0; j < this.level.pkFields.length; j++) {
        	this.setNodeRestrictions(this.level.pkFields[j]);
        }
    },

    setNodeRestrictions: function(pkFieldName){
    	var pkFieldNameKey = pkFieldName + ".key";
        
        if(this.parent != null && !this.parent.isRoot()){
			var parentPkFieldValue = this.parent.getPrimaryKeyValue(pkFieldName);
			if( parentPkFieldValue!= null && parentPkFieldValue!= '' &&  this.treeControl.type!='hierTree' &&  this.treeControl.type!='selectValueHierTree'){
				// add the parent restriction if exists
				if(typeof(parentPkFieldValue) != 'undefined')
					this.restriction.addClause(pkFieldName, parentPkFieldValue, "=");
				//else 
					//this.restriction.addClause(pkFieldName, '', "IS NULL");
			} else {
				// add the primary keys data to restriction object
				if(typeof(this.data[pkFieldNameKey]) != 'undefined')
					this.restriction.addClause(pkFieldName, this.data[pkFieldNameKey], "=");
				//else 
					//this.restriction.addClause(pkFieldName, '', "IS NULL");
			}
		} else {
			// add the primary keys data to restriction object
			if(typeof(this.data[pkFieldNameKey]) != 'undefined')
				this.restriction.addClause(pkFieldName, this.data[pkFieldNameKey], "=");
			//else 
				//this.restriction.addClause(pkFieldName, '', "IS NULL");
		}
    },

    /**
     * Construct the label text according to treeNodeConfig.
     */
    getLabelForNodeConfig: function(){
    	var labelText = "";
    	for(var i = 0; i < this.level.treeNodeConfig.length; i++){
    		var element = this.level.treeNodeConfig[i];
    		var value = element.text;
    		var cssClass = this.level.cssPkClassName;
    		
    		if(!valueExistsNotEmpty(value) && valueExistsNotEmpty(element.fieldName)){
    			value = this.data[element.fieldName];
    			
    			if(valueExistsNotEmpty(element.length)){
    				if (value.length > element.length) {
    		        	value = value.substr(0, element.length) + " ...";
    				}
    			}
    			
    			if(valueExistsNotEmpty(element.pkCssClass)){
    				cssClass = (element.pkCssClass == 'true') ? this.level.cssPkClassName : level.cssClassName;
    			}else if(this.level.pkFields.indexOf(element.fieldName)<0){
    				cssClass = this.level.cssClassName;
    			}
    		}
    		
    		if(value!=undefined){
                if(i>0){
                  labelText = labelText + " ";
                }
                var isColorField = (this.level.treeNodeConfig[i].controlType == 'color');
            	if(isColorField){
            		labelText = labelText + "<span class='" + this.level.cssClassName + " colorSpan' " + ">" + this.getColorContentHtml(value, this.level.treeNodeConfig[i], this.data) + "</span>";
            	}else {
            		labelText = labelText + "<span class='" + cssClass + "'>" + value + "</span>";
            	}
            }
    	}
    	return labelText;
    },

    /**
     * Construct html for color swatch
     */
    getColorContentHtml: function(value, fieldDef, row, colorVal) {  
    	
			if (value == undefined)
				value = '';
			  //content = (valueExistsNotEmpty(column.width)) ? '' : Ext.util.Format.ellipsis('', 50);

			var hpattern = new Ab.data.HighlightPattern(value);
			if (hpattern.isHatched()) {
				// HATCHED pattern
				var legendTables = this.treeControl._legendTables;
				if(legendTables.length === 0){
					legendTables[this.level.levelIndex] = fieldDef.name.substring(0, fieldDef.name.indexOf('.'));
				}
				var bitmapName = hpattern.getLegendBitmapName(legendTables[this.level.levelIndex], this.getLegendKeyValues(row));
				if (bitmapName) {
	                content = "<img src='" + View.project.projectGraphicsFolder + '/' + bitmapName + ".png' hspace='0' border='0'/>";
				}
		    	
			} else {
				// handle possibility that the raw value passed in is a hex value already
				var color = '';
				if (value.substr(0,2) == '0x') {
					color = value.substr(2);
			    } else {
					color = gAcadColorMgr.getRGBFromPatternForGrid(value, true);
					if (color == "-1") {
						if (colorVal == undefined || !colorVal.length)
							color = gAcadColorMgr.getUnassignedColor(true);
						else
							color = gAcadColorMgr.getColorFromValue(colorVal, true);
					}
				}
				
				var legendKeyFieldDef = this.getLegendKeyFieldDef();
				
				if(valueExists(legendKeyFieldDef)){
					gAcadColorMgr.setColor(legendKeyFieldDef.name, this.data[legendKeyFieldDef.name], color);
				}

				// KB 3027141 content width should not be set or the color block does NOT fill the cell
				// var width = '200px';
				// if (column.width != null) { width = column.width; }
				//content = '<div style="width:' + width + ';height:16px;background-color:#' + color + ';"></div>';
				// border:1px solid #000000
				var opacity = this.treeControl.colorOpacity;
				var filter = "alpha(opacity='" + (opacity * 100).toFixed() + "')";	// IE
				var style = (opacity != null) ? 'opacity: ' + opacity + '; filter: ' + filter : '';
				content = '<div class="colorSwatch" style="background-color:#' + color + ';' + style + '"></div>';
		  }
			
			return content;
		},
	
		/**
		 * Gets legend key field def from visibleFields list.
		 */
		getLegendKeyFieldDef: function(){
			for(var i=0; i < this.level.visibleFields.length; i++){
				var fieldDef = this.level.visibleFields[i];
				if(valueExistsNotEmpty(fieldDef.legendKey) && fieldDef.legendKey === "true"){
					return fieldDef;
				}
			}
			return null;
		},
		
	   getLegendKeyValues: function(row){
		   var legendKeyValues = [];
		   var legendKeyValue = null;
		   var legendFields = this.treeControl._legendFields;
		   
		   if(legendFields.length > 0 && legendFields[this.level.levelIndex].length != 0){
			   //1: try app defined legend fields
			   for(var i=0; i<legendFields[this.level.levelIndex].length; i++){
				   var fieldName = legendFields[this.level.levelIndex][i];
				   legendKeyValue  = row[fieldName];
	    			if(legendKeyValue){
	    				legendKeyValues.push(legendKeyValue);
	    			}
			   }
		   }
		   if(legendKeyValues.length === 0){
			    //2: try field defs with dataSource for legend key fields (this covers the case when legend key field is hidden)
				for(var i=0; i < this.level.dataSourceFieldDefs.items.length; i++){
					var fieldDef = this.level.dataSourceFieldDefs.items[i];
					if(valueExistsNotEmpty(fieldDef.legendKey) && fieldDef.legendKey === "true"){
						legendKeyValue  = row[fieldDef.fullName];
		    			if(legendKeyValue){
		    				legendKeyValues.push(legendKeyValue);
		    			}
		    		}
		    	}
		   }
			if(legendKeyValues.length === 0){
				//3: try legend key fields in visible field defs
				for(var i=0; i < this.level.visibleFields.length; i++){
					var fieldDef = this.level.visibleFields[i];
					if(fieldDef.legendKey){
						legendKeyValue  = row[fieldDef.name];
		    			if(legendKeyValue){
		    				legendKeyValues.push(legendKeyValue);
		    			}
		    		}
		    	}
			}
			if(legendKeyValues.length === 0){
				//4: get primary key values???
				for(var i=0; i < this.level.pkFields.length; i++){
					legendKeyValue  = row[this.level.pkFields[i]];
					if(legendKeyValue){
	    				legendKeyValues.push(legendKeyValue);
	    			}
				}
			}
	    	
	    	return legendKeyValues;
	    },

     /**
     * This function overwrites the YUI default function getStyle to workaround a YUI bug for leaf node.
     * Returns the css style name for the toggle
     * @method getStyle
     * @return {string} the css class for this node's toggle
     */
    getStyle: function() {

        if (this.isLoading) {
            return "ygtvloading";
        } else {
            // location top or bottom, middle nodes also get the top style
            var loc = (this.nextSibling) ? "t" : "l";

            // type p=plus(expand), m=minus(collapase), n=none(no children)
            var type = "n";

            // only non-leaf node sets the expand/collapse style
            if (!this.isLeafNode && (this.hasChildren(true) || (this.isDynamic() && !this.getIconMode()))) {
                type = (this.expanded) ? "m" : "p";
            }

            return "ygtv" + loc + type;
        }
    },

   /**
     * This function overwrites the YUI default function getHoverStyle to workaround a YUI bug for leaf node.
     * Returns the hover style for the icon
     * @return {string} the css class hover state
     * @method getHoverStyle
     */
    getHoverStyle: function() {
        var s = this.getStyle();

        // only non-leaf node sets the expand/collapse hover style
        if (!this.isLeafNode && (this.hasChildren(true) && !this.isLoading)) {
            s += "h";
        }
        return s;
    },

    /**
     * Called when the user clicks on a tree node text.
     * @param me
     */
    onLabelClick: function(me) {
    
      // make the current selected node stand out a bit
      Ext.get(me.labelElId).parent().addClass('selectedTreeNode');
	  // YAHOO.util.Dom.setStyle(me.labelElId, 'opacity', 0.5);

	  if (this.treeControl.lastNodeClicked != null) {
          //set the last node clicked to its normal style
          var textNode = Ext.get(this.treeControl.lastNodeClicked.labelElId);
          if (textNode) {
              textNode.parent().removeClass('selectedTreeNode');
          }
	  	  // YAHOO.util.Dom.setStyle(this.treeControl.lastNodeClicked.labelElId, 'opacity', 1);
	  }
	  
      this.treeControl.lastNodeClicked = me;
    },


    getPrimaryKeyValues: function() {
      var pkArray = {};
      if(this.restriction.clauses) {
        for(var index = 0; index < this.restriction.clauses.length; index++) {
          pkArray[ this.restriction.clauses[index].name] = this.restriction.clauses[index].value;
        }
      }
      return pkArray;
    },

    getPrimaryKeyValue: function(name) {
      if(this.restriction.clauses) {
        for(var index = 0; index < this.restriction.clauses.length; index++) {
          if(this.restriction.clauses[index].name == name){
            return this.restriction.clauses[index].value;
          }
        }
      }
      return "";
    },
	
	/**
	 * Helper method: returns node text. 
	 */
	getText: function() {
		var result = '';
		for (var i = 0; i < this.level.pkFields.length; i++) {
			if (i > 0) {
				result += '|';
			}
			result += this.data[this.level.pkFields[i] + '.key'];
		}
		return result;	
	},
    
	isSelected: function(){
		return this.selected;
	},
	
	setCheckState: function(selected){
		this.selected = selected;
		if (YAHOO.util.Dom.get(this.checkElId)) {
			YAHOO.util.Dom.get(this.checkElId).checked = selected;
		}
	},
	
	setSelected: function(selected){
		if(this.level.multipleSelectionEnabled){
			this.setCheckState(selected);
			for( var i=0; i < this.children.length; i++){
				var child = this.children[i];
				if(child.setSelected){
					child.setSelected(selected);
				}
			}
			this.updateParent();
		}
	},
	
    /**
     * Refresh the state of this node's parent, and cascade up.
     */
    updateParent: function() { 
        var parent = this.parent;
		
		if(!parent || !parent.updateParent || !parent.level.multipleSelectionEnabled){
			return;
		}
		
        var somethingChecked = false;
        var somethingNotChecked = false;

        for (var i=0; i < parent.children.length; i++) {
            var n = parent.children[i];
            if ("selected" in n) {
                if (n.selected) {
                    somethingChecked = true;
                } else {
                    somethingNotChecked = true;
                }
            }
        }

        if (somethingChecked && !somethingNotChecked) {
            parent.setCheckState(true);
        } else if(somethingNotChecked) {
            parent.setCheckState(false);
        }
        parent.updateParent();
    },
		
	// overrides YAHOO.widget.Node
    getNodeHtml: function() { 
        var sb = [];

        sb[sb.length] = '<table id="ygtvtableel' + this.index + '" border="0" cellpadding="0" cellspacing="0" class="ygtvtable ygtvdepth' + this.depth;
        if (this.enableHighlight) {
            sb[sb.length] = ' ygtv-highlight' + this.highlightState;
        }
        if (this.className) {
            sb[sb.length] = ' ' + this.className;
        }           
        sb[sb.length] = '"><tr class="ygtvrow">';
        
        for (var i=0;i<this.depth;++i) {
            sb[sb.length] = '<td class="ygtvcell ' + this.getDepthStyle(i) + '"><div class="ygtvspacer"></div></td>';
        }

        if (this.hasIcon) {
            sb[sb.length] = '<td id="' + this.getToggleElId();
            sb[sb.length] = '" class="ygtvcell ';
            sb[sb.length] = this.getStyle() ;
            sb[sb.length] = '"><a href="#" class="ygtvspacer">&#160;</a></td>';
        }
		
		if(this.level.multipleSelectionEnabled){
			sb[sb.length] = '<td class="ygtvcell ';
			sb[sb.length] = this.contentStyle  + ' ygtvcontent" ';
			sb[sb.length] = '>';
			sb[sb.length] = '<input type="checkbox"';
			sb[sb.length] = ' id="'+ this.checkElId +'"';
			if(!this.parent.isRoot() && this.parent.isSelected()){
				this.setCheckState(this.parent.isSelected());
				sb[sb.length] = ' CHECKED ';
			}	
			sb[sb.length] = '/> ';
			sb[sb.length] = '</td>';
		}
		
        sb[sb.length] = '<td id="' + this.contentElId; 
        sb[sb.length] = '" class="ygtvcell ';
        sb[sb.length] = this.contentStyle  + ' ygtvcontent" ';
        sb[sb.length] = (this.nowrap) ? ' nowrap="nowrap" ' : '';
        sb[sb.length] = ' >';
        sb[sb.length] = this.getContentHtml();
        sb[sb.length] = '</td></tr></table>';

        return sb.join("");

    },
	
    // overrides YAHOO.widget.Node
    getContentHtml: function() { 
        var sb = [];
        //sb[sb.length] = this.href?'<a':'<span';
		sb[sb.length] = '<a';
        sb[sb.length] = ' id="' + this.labelElId + '"';
        sb[sb.length] = ' class="' + this.labelStyle  + '"';
        if (this.href) {
            sb[sb.length] = ' href="' + this.href + '"';
            sb[sb.length] = ' target="' + this.target + '"';
        } 
        if (this.title) {
            sb[sb.length] = ' title="' + this.title + '"';
        }
        sb[sb.length] = ' >';
        sb[sb.length] = this.label;
		sb[sb.length] = '</a>';
        //sb[sb.length] = this.href?'</a>':'</span>';
        return sb.join("");
    }
	
  });

/**
 * The TreeLevel class describes the presentation attributes of a tree level.
 * It is not a visual component but more like the schema of the tree level.
 * it contain the level number, the visible field names and primary key field names info.
 *
 */
 Ab.tree.TreeLevel = Base.extend({

    // tree level, 0 for top-level, 1, 2, etc.
    levelIndex: 0,

    // array of visible field names and isPk (if it is primary key field?)
    visibleFields: null,
    
    dataSourceFieldDefs: null,

    // array of primary key field names
    pkFields: null,

    // data source id
    dataSourceId: null,

    // panel id - used to set the restriction for the level
    panelId: null,

    // non-primary key visible field label format
    cssClassName: 'ygtvlabel',      // default to YUI label

    // primary key visible field label format
    cssPkClassName: 'ygtvlabel_pk',    // default to YUI label

    // panel events defined in the view, such as onClickNode, onContextMenu
    events: null,

    // restriction for the tree level. this attribute usually set from the application JS code
    restriction: null,
	
	// multiple selection enabled for level, default is false
	multipleSelectionEnabled: false,
	
	//object tree node configuration for level 
	//object format: [{text: 'customMessage'}, 
	//				 {fieldName: 'fieldId', length: numericValue, pkCssClass: 'true'|'false'}]
	//where length (optional) is set for fields to be trimmed, 
	//pkCssClass (optional) is true for custom display similar to primary key fields
	treeNodeConfig: null,
	
    /**
    * The constructor will Tree Level related attribute and schema info
    * Constructor.
    * @parameter {integer} levelIndex the level index starting from 0.
    *            {JSON String} data  the JSON data returned from WFR used to set this noe's content
    *            {Array} panelData the panel content.
    * @public
    */
    constructor: function(levelIndex, data, panelData) {

        // set the tree level index
        this.levelIndex = levelIndex;

        // add all the visible field names to create node label
        this.visibleFields = [];

        // field definitions can be specified in the panel (only for the top-level tree panel) 
        // or in the data source (for any tree level)
        var panel = null;
		var ds = null;
        if (valueExists(panelData)) {
       		var found = false;
       		//3032594 - loop through the panel's items instead of panels array. For tree control, only the first panel is stored in View.panels object 
       		//			while View.panels.items[rootTreePanel]._panelsData store all the tree panels information
       		for(var index=0; (index < View.panels.length && !found); index++){
       			var panelItem = View.panels.items[index];
       			if(panelItem.type == 'tree' && panelItem._panelsData!= null && panelItem._panelsData.length > 0){
               		for(var innerIndex=0; innerIndex < panelItem._panelsData.length; innerIndex++){
               			if(panelItem._panelsData[innerIndex].panelId == panelData.panelId){
               				found = true;
               				panel = panelItem._panelsData[innerIndex];
               				break;
               			}
               		}
               	}
        	}
			ds = View.dataSources.get(panelData.dataSourceId);
		}
        
        if (valueExists(ds) && valueExists(ds.fieldDefs)) {
        	this.dataSourceFieldDefs = ds.fieldDefs;
        }
	
        // determine visible fields for this level
        for (var i = 0; i < data.columns.length; i++) {
        	var fieldName = data.columns[i].id;

            var isVisibleField = true;
            var controlType = '';
            var legendKey = '';
            //3032594 - try to find the field in the panel's fieldDef object
            if (isVisibleField && valueExists(panel) && valueExists(panel.fieldDefs)) {
		        for (var j = 0; j < panel.fieldDefs.length; j++) {
		        	if (fieldName == panel.fieldDefs[j].id && panel.fieldDefs[j].hidden == "true") {
		        		// the field is found, and is hidden
		                isVisibleField = false;
		                break;
		            }
		        	if ((fieldName == panel.fieldDefs[j].id) && (panel.fieldDefs[j].controlType == "color")) {
		        		// the field is found, and is hidden
		        		controlType = 'color';
		        		break;
		        	}	
		        	
		        	if (fieldName == panel.fieldDefs[j].id){
		        		legendKey = panel.fieldDefs[j].legendKey; break;
		        	}
		        }
		    }

            // try to find the field in the data source
		    if (isVisibleField && valueExists(ds) && valueExists(ds.fieldDefs)) {
				if (ds.fieldDefs.get(fieldName) && ds.fieldDefs.get(fieldName).hidden == "true") {
					isVisibleField = false;
				}
		    }
		    
		    // not a visible field
	        if (!isVisibleField) {
	        	continue;
	        }
		  
            // check if the field is a primary key field
	    
            var isPk = false;
            for (var j = 0; j < data.primaryKeyIds.length; j++) {
                if (fieldName === data.primaryKeyIds[j]){
                    isPk = true;
                    break;
                }
            }

            // add visible fields with field name and isPk value.
            this.visibleFields.push({name: fieldName, isPk: isPk, controlType: controlType, legendKey: legendKey});
        }

        // add all primary key fields used to generate drill-down restrictions
        this.pkFields = [];
        for (var i = 0; i < data.primaryKeyIds.length; i++) {
            this.pkFields.push(data.primaryKeyIds[i]);
        }

        // set other properties
        if (valueExists(panelData)) {
            this.dataSourceId = panelData.dataSourceId;
            this.panelId = panelData.panelId;

            // set the non-primary key style - cssClassName
            if (valueExistsNotEmpty(panelData.cssClassName)) {
                this.cssClassName = panelData.cssClassName;
            }

            // set the primary key style - cssPkClassName
            if (valueExistsNotEmpty(panelData.cssPkClassName)) {
                this.cssPkClassName = panelData.cssPkClassName;
            }
		  
		    // set multipleSelectionEnabled
		    if (valueExists(panelData.multipleSelectionEnabled)) {
		  	    this.multipleSelectionEnabled = panelData.multipleSelectionEnabled;
		    }
		    		    
		    // set treeNodeConfig
		    if (valueExists(panelData.treeNodeConfig)) {
		  	    this.treeNodeConfig = panelData.treeNodeConfig;
		    }

            // add panel events to the tree level
            this.events = panelData.events;
        }
    },

    /**
     * Add the restriction to the tree level's restriction clauses.
     * @param restriction Ab.view.Restriction the restriction to add.
     */
    addRestriction: function(restriction) {
        if (this.restriction == null){
            this.restriction = new Ab.view.Restriction();
        }

        this.restriction.addClauses(restriction, true, false, {
			addForNullValue: true,
			addForEmptyValue: true
			});
    }
});
