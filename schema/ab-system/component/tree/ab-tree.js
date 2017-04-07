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
 * @namespace AFM.tree
 */


AFM.namespace('tree');

/**
 * The tree control is a visual component (like a Grid or a Form) that represents the complete tree user interface on the HTML page.
 * It is implemented by AFM.tree.TreeControl JavaScript class that extends AFM.view.Component class. This is required to make the tree control interoperable with other controls and commands on the page.
 * It aggregates the YAHOO.widget.TreeView class. It cannot extend the YUI class because it already extends the AFM.view.Component class.
 * It has N tree level objects. The XSL generates the JavaScript code that calls the control constructor and passes in the ConfigObject that contains control properties.
 */
AFM.tree.TreeControl = AFM.view.Component.extend({


    /**
     * Tree's top nodes for this tree control
     * @type an array of AFM.tree.TreeNode objects.
     * @private
     */
    _nodes: null,

    /**
     *  Tree Levels that contain the each tree level's attributes and field defs
     *  @type an internal array of AFM.tree.TreeLevel objects
     *  @priavte
     */
    _levels: null,


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
     * define the type for the tree control
     * @type String. the values are 'tree', 'hierTree', 'selectValueTree' or 'selectValueHierTree'
     * @public
     */
    type: 'tree',

    lastNodeClicked: null,

  /**
   * define the restriction for the whole tree
   * @type AFM.view.Restriction
   * @public
   */
    restriction: null,

    // --------------------- private methods -----------------------------------

    /**
     * add the TreeLevel object to the tree view.
     * @method addTreeLevel
     * @param {AFM.tree.TreeLevel} level the level to be added to tree view object
     * @private
     */
    _addTreeLevel: function(level) {
      this._levels.push(level);
    },


    /**
     * add the tree node object to the tree view.
     * @method addTreeNode
     * @param {AFM.tree.TreeNode} node the node to be added to tree view object
     * @private
     */
    _addTreeNode: function(node) {
      this._nodes.push(node);
    },

    _getParameters: function(panelData, parent, level) {

        // compose the parameter list to pass to WFR
        var  parameters = {
                          viewName: this._viewFile,
                          dataSourceId: panelData.dataSourceId,
                          controlId: panelData.panelId,
                          groupIndex: this._groupIndex,
                          treeType:  this.type,
                          treeLevel: level
                          };


        var restriction = new AFM.view.Restriction();
        // add the tree restriction to parameter list if not null.
        if(this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
          restriction.addClauses(this.restriction, true);
        }

        // add the tree level's restriction to parameter list if not null.
        var levelRest = this.getRestrictionForLevel(level);
        if(levelRest && levelRest.clauses != undefined && levelRest.clauses.length>0){
            restriction.addClauses(levelRest, true);
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

          // if the WFR succeeded, create a treeLevel object
          var treeLevel = new AFM.tree.TreeLevel(level, result.data, panelData);
          this._addTreeLevel(treeLevel);

          // create a TreeNode for each record returned from server
          this._addTreeNodes(result, parent, treeLevel);

          // if the child nodes are added fine, then for hierarchy tree, set the maxLevel to the current deepest level.
          if(this.type=='hierTree' && this.maxLevel < level){
              this.maxLevel = level;
          }
        } else {
          // handle the exceptions
          AFM.workflow.Workflow.handleError(result);
      }
    },


    _addTreeNodes: function(result, parent, treeLevel){

        // create a TreeNode for each record returned from server
        for (var i = 0; i < result.data.records.length; i++) {
            //get the record data in JSON format from server
            var record = result.data.records[i];

            //create a new TreeNode -  a YUI text node with AFM-specific info
            var treeNode = new AFM.tree.TreeNode(this, treeLevel, record, parent, false);

            // add the tree node to the tree control's top node collection
            if(parent.isRoot()) {
              this._addTreeNode(treeNode);
            }
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

        // index to the events array
        var eventIndex = 0;

        // does the level contains any events?
        while(node.level.events[eventIndex]) {
              // based on the event type, we call diffrent component functions
              // currently we only support 'onClickNode' event
              switch (node.level.events[eventIndex]["type"]){
                 case 'onClickNode':
                      // !!!YUI bug - do not use TextNode's getLabelEl() or Node's getEl() which will return NULL.
                      // get the Node's label id through the property directly -->
                      this.addLink(node.labelElId, node.level.events[eventIndex]["commands"], node.restriction);
                      break;
                 case 'onContextMenu':
                      break;

                 default:
                      break;
              }

              eventIndex++;
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
      if(node.treeControl.type=='tree' && nextLevel > node.treeControl.maxLevel) {
        node.isLeafNode = true;
      }

      // for non-leaf nodes, call WFR to populate the data
      if(!node.isLeafNode) {
          // get the next level tree node's panel data
          // initialize the node's children
          if(node.treeControl.type=='hierTree'){
            node.treeControl._initTree(node.treeControl._panelsData[0], node, nextLevel );
          } else {
            node.treeControl._initTree(node.treeControl._panelsData[nextLevel], node, nextLevel );
          }
      }

      // Be sure to notify the TreeView component when the data load is complete
      onCompleteCallback();

      // after all children are generated, register the events for each child node
      node.treeControl._registerNodesEvents(node.children);
    },

    /**
        * Add the Event to the link object, register the event.
        * @param {linkId}  DOM reference|string
        * @param {commandData} a list of commands in JSON String format
        * @param {restriction} an array of restrictions
        */
    addLink: function(linkId, commandsData, restriction) {

        // create command chain
        var command = new AFM.command.commandChain(this.controlId, restriction);
        command.addCommands(commandsData);

        // add command as a link property
        var link = $(linkId);
        link.command = command;

        // register command as event handler
        var fn = command['handle'];

        YAHOO.util.Event.addListener(link, "click", fn, command, true);
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
     * @param restriction AFM.view.Restriction the restriction to add.
     */
    addRestriction: function(restriction){
      if(this.restriction==null){
        this.restriction = new AFM.view.Restriction();
      }

      this.restriction.addClauses(restriction, true);
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

        // set the view name that the tree is loaded.
        var viewFile = configObject.getConfigParameterIfExists('viewFile');
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

        // add default config parameters if they are not defined in AXVW
        configObject.addParameterIfNotExists('showOnLoad', true);
        configObject.addParameterIfNotExists('useParentRestriction', false);


        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
        this.inherit(controlId, this.type, configObject);

        // create the tree
        this.treeView = new YAHOO.widget.TreeView(this.controlId);

        //turn dynamic loading on for entire tree:
        this.treeView.setDynamicLoad(this._loadNodeData, 1);

        // initialize the top nodes array
        this._nodes = [];

        // initialize the levels array
        this._levels = [];

        // create the Tree Level and Tree Nodes for the top level
        var rootNode = this.treeView.getRoot();

        if(this.type=='selectValueTree' || this.type=='selectValueHierTree') {
          this._initTree(null, rootNode, 0);
        } else {
          this._initTree(this._panelsData[0], rootNode, 0);
        }

        // display the tree
        this.treeView.draw();

        this._registerNodesEvents(this._nodes);


    },

    _registerNodesEvents: function(nodes){

      // register all top level nodes events
      for(var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
        this._registerEvents(nodes[nodeCounter]);
      }
    },

    /**
     * Retrieves the tree nodes for the current level from the server.
     * @method refresh
     * @param {JSON String} restriction the tree node is restricted on
     * @public
     */
    refresh: function() {

        this.clear();

        var rootNode = this.treeView.getRoot();

        if(this._panelsData == undefined) {
          this._initTree(null, rootNode, 0);
        } else {
          this._initTree(this._panelsData[0], rootNode, 0);
        }

        rootNode.refresh();

        this._registerNodesEvents(this._nodes);

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
    }
});

/**
 * Tree node class contrains attributes and state of the tree node.
 * AFM.tree.TreeNode class – extends YAHOO.widget.TreeNode.
 * 1. The tree node is a visible element of the tree.
 * 2. The tree node is implemented by the AFM.tree.TreeNode class that extends the YAHOO.widget.TextNode class.
 * 3. Top level tree nodes are created by the TreeControl based on the data records returned from the WFR.
 * 4. For non-top level tree node, when user expands the non-leaf tree node by clicking “+” or its label,
 *    its child nodes are created based on data records returned from WFR.
 *    Tree node contains events handlers such as expand, collapse, etc.
 *
 */

 /**
 * The constructor will set the AFM-specific properties and call YUI textNode constructor then set the label
 * @method constructor
 * @parameter {AFM.tree.TreeControl} treeControl a reference to the TreeControl object that the node is part of
 *            {AFM.tree.TreeLevel} treeLevel a reference to the TreeLevel object of the node
 *            {JSON String} data  the JSON data retunred from WFR used to set this noe's content
 *            {AFM.tree.TreeNode} parent the parent of this node node
 *            {boolean} expaned  if the tree node is expanded. default to false
 * @public
 */
AFM.tree.TreeNode = function(treeControl, treeLevel, data, parent, expanded) {

        // set the node's attribute
        this.treeControl = treeControl;
        this.level = treeLevel;
        this.tree = treeControl.treeView;

        // default to no children
        this.children = [];

        this.parent = parent;

        this.restriction = new AFM.view.Restriction();

        // call YAHOO.widget.TextNode init() function
        this.init(data, parent, expanded);

        // decide if the node is a leaf node?
       if((this.treeControl.type=='tree' || this.treeControl.type=='selectValueTree' )
                && this.level.levelIndex == this.treeControl.maxLevel){
          this.isLeafNode = true;
        }

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


YAHOO.extend(AFM.tree.TreeNode, YAHOO.widget.TextNode, {

    // reference to the AFM.tree.TreeLevel instance
    level: null,

    // reference to the AFM.tree.TreeControl instance
    treeControl: null,

    // is the node aleaf node?
    isLeafNode: false,

    // does user defined the custom label click event?
    hasLabelClickEvent: false,

    // restriction for the current node, this restriction is composed of primary key/value and
    // used to restrict the children nodes
    // @type AFM.view.Restriction
    restriction: null,

    /**
     * internal function to create label and data for the node
     * @method _createLabel
     * @private
     */
    _createLabel: function(){

        // compose the label text field using the primary keys
        var labelText = "";

        // loop thought the visible fields and compose the label's text
        for (var j = 0; j < this.level.visibleFields.length; j++) {
          var value = this.data[this.level.visibleFields[j].name];
          if(value!=undefined){
            if(j>0){
              labelText = labelText + " ";
            }

            // user can use custom style class for primary key and non-primary key part of labels
            if(this.level.visibleFields[j].isPk){
              labelText = labelText + "<span class='" + this.level.cssPkClassName + "'>" + value + "</span>";
            } else {
              labelText = labelText + "<span class='" + this.level.cssClassName + "'>" + value + "</span>";
            }
           }
          }

        // set the label
        this.setUpLabel(labelText);

        // turn off the toggle if the label has custom defined event
        // use: this.href="javascript:void(0);" instead of "#" to avoid jumping to the top of the page
        if(this.hasLabelClickEvent) {
          this.href = "javascript:void(0);";
          this.textNodeParentChange = "onLabelClick";
        }

        // loop through the primary keys and compose the pkData list
        var pkFieldName = "";
        for (var j = 0; j < this.level.pkFields.length; j++) {
            pkFieldName = this.level.pkFields[j] + ".key";
            // add the primary keys data to restriction object
            this.restriction.addClause(this.level.pkFields[j], this.data[pkFieldName], "=");
        }

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


    onLabelClick: function(me) {
    
      // make the current selected node stand out a bit
	  YAHOO.util.Dom.setStyle(me.labelElId, 'opacity', 0.5); 

	  if(this.treeControl.lastNodeClicked != null){
	      //set the last node clicked to its normal style
	  	  YAHOO.util.Dom.setStyle(this.treeControl.lastNodeClicked.labelElId, 'opacity', 1); 
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
    }
  });

/**
 * The TreeLevel class describes the presentation attributes of a tree level.
 * It is not a visual component but more like the schema of the tree level.
 * it contain the level number, the visible field names and primary key field names info.
 *
 */
 AFM.tree.TreeLevel = Base.extend({

    // tree level, 0 for top-level, 1, 2, etc.
    levelIndex: 0,

    // array of visible field names and isPk (if it is primary key field?)
    visibleFields: null,

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

    // restriction for the tree level. this attibute usually set through the javascript
    restriction: null,

    /**
    * The constructor will Tree Level related attribute and schema info
    * Constructor.
    * @parameter {integer} levelIndex the level index starting from 0.
    *            {JSON String} data  the JSON data retunred from WFR used to set this noe's content
    *            {Array} panelData the panel content.
    * @public
    */
    constructor: function(levelIndex, data, panelData) {

        // set the tree level index
        this.levelIndex = levelIndex;

        // add all the visible field names to create node label
        this.visibleFields = [];

        for (var i = 0; i < data.columns.length; i++) {

          var isPk = false;

          // check if the field is a primary key field
          for (var j = 0; j < data.primaryKeyIds.length; j++) {
            if(data.columns[i].id === data.primaryKeyIds[j]){
              isPk = true;
            }
          }

          // add visible fields with field name and isPk value.
          if(isPk) {
            this.visibleFields.push({name:data.columns[i].id,isPk:true});
          } else {
            this.visibleFields.push({name:data.columns[i].id,isPk:false});
          }
        }

        // add all the primary key fields to generate href link
        this.pkFields = [];
        for (var i = 0; i < data.primaryKeyIds.length; i++) {
          this.pkFields.push(data.primaryKeyIds[i]);
        }

        //set the datasource id
        if(panelData) {
          this.dataSourceId = panelData.dataSourceId;
          this.panelId = panelData.panelId;

          // set the non-primary key style - cssClassName
          if (valueExists(panelData.cssClassName) && panelData.cssClassName != '') {
            this.cssClassName = panelData.cssClassName;
          }

         // set the parimary key style - cssPkClassName
           if (valueExists(panelData.cssPkClassName) && panelData.cssPkClassName != '') {
            this.cssPkClassName = panelData.cssPkClassName;
          }

          // add panel events to the tree level
          this.events = panelData.events;
        }
    },

    /**
     * Add the restriction to the tree level's restriction clauses.
     * @param restriction AFM.view.Restriction the restriction to add.
     */
    addRestriction: function(restriction){
      if(this.restriction==null){
        this.restriction = new AFM.view.Restriction();
      }

      this.restriction.addClauses(restriction, true);
    }
});


