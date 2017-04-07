Ab.namespace('tree');

/**
* The treeTable control extends from the Ab.tree.TreeControl class, presenting tree data (all levels) 
* as rows and columns within a single html table.  
*/
Ab.tree.TreeTable = Ab.tree.TreeControl.extend({
	
	maxVisibleFields: -1,
	
    /**
     * Constructor
     * @method constructor
     * @param {String} id the id for the tree control, usually the tablegroup name (or 'AfmTreeView')
     *        (Ab.view.ConfigObject) configObject the parameters passed from xsl fopr the current tree view
     * @public
     */
	constructor: function(id, configObject) {
		this.inherit(id, configObject);
		this.maxVisibleFields = this._findMaxVisibleFields();
	},

    /**
     * Find maximum number of visible fields for all levels.  Used to determine number of columns in tree table.
     * @return {string} maxVisibleFields maximum number of visible fields
     * @private
     */
	_findMaxVisibleFields: function(i) {
		var maxVisibleFields = -1;
		for(var i=0; i<this._panelsData.length; i++){
			var fieldDefs = this._panelsData[i].fieldDefs;
			var numberOfVisibleFields = 0;
			for(var j=0; j<fieldDefs.length; j++){
				if(fieldDefs[j].hidden != 'true'){
					numberOfVisibleFields += 1;
				}
			}
			
			if(numberOfVisibleFields > maxVisibleFields){
				maxVisibleFields = numberOfVisibleFields;
			}
		}
		return maxVisibleFields;
	},	

	/**
	 * Creates a new tree node instance and returns it.
	 * Override ab-tree.js implementation.
	 * @parameter {Ab.tree.TreeLevel} treeLevel a reference to the TreeLevel object of the node
	 *            {JSON String} data  the JSON data retunred from WFR used to set this noe's content
	 *            {Ab.tree.TreeNode} parent the parent of this node node
	 *            {boolean} expaned  if the tree node is expanded. default to false
	 * @private
	 */
	_createTreeNode: function(treeLevel, data, parent, expanded) {
		// create a new TreeNode -  a YUI text node with AFM-specific info
		return new Ab.tree.TreeTableNode(this, treeLevel, data, parent, expanded);
	},

	/**
     * @override Ab.tree.TreeControl
     * initialize the tree by calling the WFR to get the data, compose the text node label, then add the node to the tree view.
     * @method initTree
     * @parameter {String} dataSourceId the id for the top level data source
     *            {Ab.treeControl.TreeNode} parent the parent node
     *            {JSON array} sqlRest the restriction or the parent primary key field<->data pair in JSON format
     *            {integer} the level index
     * @private
     */
    _initTree: function(panelData, parent, level, panelDataNextLevel) {

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
    				var treeLevel = new Ab.tree.TreeTableLevel(level, result.data, panelData);
    				treeLevel = this.applySidecarToLevel(treeLevel);

    				this._addTreeLevel(treeLevel);
    				
    				// create a TreeNode for each record returned from server
    				this._addTreeNodes(result, parent, treeLevel, panelDataNextLevel);
    				
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
    						divNode.className = "instruction";
    						divNode.innerHTML = "<br>" + this.getLocalizedString(this.z_EMPTY_TREE_MESSAGE);
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
    /**
     * @override
     * Call addTooltip(node) to register Ext.QuickTips 
     */
    _registerNodesEvents: function(nodes){

        // register all top level nodes events
        for(var nodeCounter = 0; nodeCounter < nodes.length; nodeCounter++) {
          this._registerEvents(nodes[nodeCounter]);
          this.addTooltip(nodes[nodeCounter]);
        }
    },
    
    /**
    * @override
    * Add the Event to the link object, register the event.  Each node may occupy more than one <td>.  Each <td> contains
    * its own <a>, which should have its own listener.
    * @param {node} Ab.tree.TreeNode instance.
    * @param {eventIndex} Index of the node event. 
    */
    addLink: function(node, eventIndex) {
        // !!!YUI bug - do not use TextNode's getLabelEl() or Node's getEl() which will return NULL.
        // get the Node's label id through the property directly -->
    	
        for(var i=0; i<=node.position; i++){
        	var linkId = node.labelElId + '_' + i;
        	var link = $(linkId);      	
        	
        	// skip cell if contains button
        	if(!link || link.className.match(/buttonContainer/)){
        		continue;		
        	}
    	       	       	
        	var command = null;
        	if (valueExists(eventIndex)) {
        		var commandsData = node.level.events[eventIndex]["commands"];
        		var restriction = node.restriction;
        		
        		// create command chain
        		command = new Ab.command.commandChain(this.id, restriction);        		
        		if(commandsData[0].type == 'onClickNode'){
        			command.handle= commandsData[0].handle;
        		}        
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
        			if(valueExists(commandsData) && commandsData[0].type == 'onClickNode'){
        				command.handle(commandsData[0].panel, node);
        			}else{
        				command.handle();
        			}
        		}
        	}
        	
        	YAHOO.util.Event.addListener(link, "click", listener);
    	}
    },
    
    /**
     * Register Ext.QuickTips for visible actions defined as button or icons.
     * Field controlType is button or image. 
     * @param {node} Ab.tree.TreeNode instance.
     */
    addTooltip: function(node){
    	for (var i = 0; i < node.level.visibleFields.length; i++ ){
    		var field = node.level.visibleFields[i];
    		if(field.controlType == "image" || field.controlType == "button"){
    			var target = Ext.get(field.controlType + i);
    			
    			if(target && valueExistsNotEmpty(field.tooltip)){
    				
    				Ext.QuickTips.register({
                        target: target,
                        text: field.tooltip
                    });
    				
    			}
    		}
    	}
    }
});

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
Ab.tree.TreeTableNode = function(treeControl, treeLevel, data, parent, expanded) {
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
	//this._createLabel();
};	



YAHOO.extend(Ab.tree.TreeTableNode, Ab.tree.TreeNode, {

    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns the id for this node's container div
     * @method getElId
     * @return {string} the element id
     */
    getElId: function() {
        return this.id;
    },
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     */
    refresh: function() {
    	//rebuild children content
    	this.loadComplete(true);
    	
        if (this.hasIcon) {
            var el = this.getToggleEl();
            if (el) {
                el.className = el.className.replace(/\bygtv[lt][nmp]h*\b/gi,this.getStyle());
            }
        }
    },

    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns this node's container html element
     * @method getEl
     * @return {HTMLElement} the container html element
     */
    getEl: function() {
        return document.getElementById(this.getElId());
    },

    /**
     * Returns the HTML table element id that holds all tree table rows
     * @method getTableElId
     * @return {string} the HTML table element id
     */    
    getTableElId: function() {
    	return  this.treeControl.id + '_' + 'ygtvtableel' + '0';
    }, 

    /**
     * Returns the HTML table element that holds all tree table rows
     * @method getTableEl
     * @return {HTMLElement} the HTML table element that holds all tree table rows
     */      
    getTableEl: function(){
    	return document.getElementById(this.getTableElId()).tBodies[0];
    },   

    /**
     * Returns the HTML div element id that holds all tree table rows
     * @method getTableElId
     * @return {string} the HTML div element id
     */    
    getDivElId: function() {
    	return  this.treeControl.id;
    },

    /**
     * Returns the HTML div element that holds all tree table rows
     * @method getTableEl
     * @return {HTMLElement} the HTML table element that holds all tree table rows
     */      
    getDivEl: function(){
    	return document.getElementById(this.getDivElId());
    },  
        
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns the id for this node's toggle element
     * @method getToggleElId
     * @return {string} the toggel element id
     */
    getToggleElId: function() {
        return "ygtvt" + this.index;
        //return "ygtvt" + (this.id + 1);
    },

    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns the id for this node's toggle element
     * @method getToggleElId
     * @return {string} the toggel element id
     */
    getToggleEl: function() {
        return document.getElementById(this.getToggleElId());
        //return "ygtvt" + (this.id + 1);
    },
                    
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns the markup for this node and its children.
     * @method getHtml
     * @return {string} the markup for this node and its expanded children.
     */
    getHtml: function() {
        this.childrenRendered = false;

        var sb = [];

        if(this.parent.isRoot() && !this.previousSibling){

        	if(!this.isLeafNode || (this.isLeafNode && !this.previousSibling)){
        		sb[sb.length] = '<table id="' + this.getTableElId() + '" border="0" cellpadding="0" cellspacing="0" class="ygtvtable ygtvdepth' + this.depth;
        		if (this.enableHighlight) {
        			sb[sb.length] = ' ygtv-highlight' + this.highlightState;
        		}
        		if (this.className) {
        			sb[sb.length] = ' ' + this.className;
        		}           
        		
        		sb[sb.length] = ' treeTable';
        		sb[sb.length] = '">';
        	}
        	
        	sb[sb.length] = this.generateFieldTitles(this.parent);
    	}
  	
        if(this.isLeafNode){
        	sb[sb.length] = this.getNodeHtml();
        }else{
        	sb[sb.length] = this.getNodeHtml();        	
        	//sb[sb.length] = this.getChildrenHtml();
        }
     
        if(!this.nextSibling && !this.isLeafNode){
        	sb[sb.length] = '</table>';
        }

        return sb.join("");
    },
    
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Called when first rendering the tree.  We always build the div that will
     * contain this nodes children, but we don't render the children themselves
     * unless this node is expanded.
     * @method getChildrenHtml
     * @return {string} the children container div html and any expanded children
     * @private
     */
    getChildrenHtml: function() {
        var sb = [];     
        // Don't render the actual child node HTML unless this node is expanded.
        if ( (this.hasChildren(true) && this.expanded) ||
                (this.renderHidden && !this.isDynamic()) ) {               
            sb[sb.length] = this.renderChildren();
        }
        return sb.join("");
    },
        
     /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Called when we know we have all the child data.
     * @method completeRender
     * @return {string} children html
     */
    completeRender: function() {
        var sb = [];        
        sb[sb.length] = this.generateFieldTitles(this);    
        for (var i=0; i < this.children.length; ++i) {
            // this.children[i].childrenRendered = false;
            this.children[i].id = (this.id != undefined) ? this.id + '_' + i : '_' + i;
            sb[sb.length] = this.children[i].getHtml();
        }
                
        this.childrenRendered = true;

        return sb.join("");
    },
    
   	generateFieldTitles: function(node) {
   		var str = '';
   		var ctx = this.treeControl.createEvaluationContext();
   		if(node.children.length > 0){        
        	var childrenLevel = node.children[0].level;
        	if(childrenLevel.showLabels){
        		str += '<tr class="headerRow">';
        		
        		if(childrenLevel){
        			for (var x=0; x < childrenLevel.visibleFields.length; x++) {
        				str += '<td class="headerCell"';       			
        				str += (x== childrenLevel.visibleFields.length-1) ? ' colspan="' + (this.treeControl.maxVisibleFields-childrenLevel.visibleFields.length+1) : '';
        				str +=  '" >';
        				if(x == 0 ){
        					str += this.createDepthIconsForTitle(node, node.depth+1);        			
        				}
        				if( childrenLevel.visibleFields[x].controlType != 'button' 
        					&& childrenLevel.visibleFields[x].controlType != 'image'){
        			        var evaluatedTitle = Ab.view.View.evaluateString(childrenLevel.visibleFields[x].title, ctx, false);
        					//str += '<div class="headerTitleText">' + childrenLevel.visibleFields[x].title + '</div>' + '</td>';         				   				
        					str += '<div class="headerTitleText';
        					str += (x==0) ? ' firstTitle' : '';
        					str += (childrenLevel.visibleFields[x].type == 'java.lang.Double' || childrenLevel.visibleFields[x].type == 'java.lang.Integer') ? 'number' : '';
        					str += '">' + evaluatedTitle + '</div>';
        				}
        				str += '</td>';
        			}
        			str += '</tr>';
        		}
        	}
        }
        return str;       
   	},
  
    createDepthIconsForTitle: function(node, depth, space){
    	var str = '';
    	var depthDiv = '<div class="ygtvdepthcell headerDepth floatLeft"></div>';
    	var blankDiv = '<div class="ygtvblankdepthcell headerBlank floatLeft"></div>';


        for (var i=0;i<depth-1;i++) {
        	if(node.children.length > 1 || i<this.depth){       		
        		if(node.parent.nextSibling || (i==0 )){
        			str += depthDiv;
        		}else{
        			str += blankDiv;
        		}
        	}
        } 
        
        if(!node.isRoot()){
        	if((this.nextSibling)){
        		str += depthDiv;
        	}else{
        		str += blankDiv;
        	} 
        }
        str +=  '<div class="ygtvblankdepthcell headerLastBlank floatLeft"></div>';     
        return str;
    },
    /**
     * Removes displayed children content if existing.
     * @param {table} dom table object.
     * 
     */
    _removeChildren: function(table){
    	var row;
		for(var i = table.rows.length - 1; i > 0; i--){
			row = table.rows[i];
			if( this.id+'' ===  row.getAttribute( "parent_id") + ''){
				table.deleteRow(row.rowIndex);
			}
		}
    },
       	
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Load complete is the callback function we pass to the data provider
     * in dynamic load situations.
     * @method loadComplete
     * @param {forceRebuild} force to rebuild the displayed content.
     */
    loadComplete: function(forceRebuild) {
		var table = YAHOO.util.Dom.get(this.getTableElId());
		var rowsHTML = this.completeRender();
		rowsHTML = rowsHTML.replace('<\table>', '');
		rowsHTML = rowsHTML.split('</tr>');
		
		if(!this.isLeafNode && (typeof(forceRebuild) !== 'undefined' && forceRebuild)){
			//remove displayed children content to regenerate from server-side data.
			this._removeChildren(table);
		}
		
		for(var i=rowsHTML.length-2; i>=0; i--){
			var rowIndex = table.rows.namedItem(this.id).rowIndex+1;
			var newRow = table.insertRow(rowIndex);	
			this.setPropertiesForTag(newRow, rowsHTML[i], 'tr');
			
			var tdRegExp = new RegExp('<td.*?>(.*?[\\S\\s]*?)<\/td>', 'gi');
			var cellsHTML = rowsHTML[i].match(tdRegExp);
			if(cellsHTML){

				for(var k=0; k<cellsHTML.length; k++){
					var newCell = newRow.insertCell(k);
					newCell.innerHTML = cellsHTML[k].replace(tdRegExp, "$1");
					this.setPropertiesForTag(newCell, cellsHTML[k], 'td');	
					
		        	this.attachListenerToElementByType(newCell, newRow, 'button');
		        	this.attachListenerToElementByType(newCell, newRow, 'image'); 							
				}
			}
			
			newRow.setAttribute('parent_id', this.id);
		}	
				
		if (this.propagateHighlightDown) {
			if (this.highlightState === 1 && !this.tree.singleNodeHighlight) {
				for (var i = 0; i < this.children.length; i++) {
				this.children[i].highlight(true);
			}
			} else if (this.highlightState === 0 || this.tree.singleNodeHighlight) {
				for (i = 0; i < this.children.length; i++) {
					this.children[i].unhighlight(true);
				}
			} // if (highlighState == 2) leave child nodes with whichever highlight state they are set
		}
				
        this.dynamicLoadComplete = true;
        this.isLoading = false;
        this.expand(true);
        this.tree.locked = false;
    },   

    attachListenerToElementByType: function(cell, row, type) { 
		var elements = Ext.query('.' + type, cell);
		for(var m=0; m<elements.length; m++){
			var element = elements[m];
			if (valueExists(element) && element.nodeType != 3 && this.children) {
				var levelIndex = this.level.levelIndex + 1;
				var panel = this.treeControl._panelsData[levelIndex];						
				var fieldIndex =  element.id.replace(type, '');
				var levels = row.id.split('_');
				var index = levels[levels.length-1];							
				var node = this.tree._nodes[index];	
				var listenerName = panel.panelId + '_on' + capitalizeFirst(this.children[0].level.visibleFields[fieldIndex].name);	
				this.tree.attachListenerToElement(listenerName, element, row, panel, node);				
			}
		}	    	
    },
    
    /**
     * Given a corresponding html string, sets properties to element.
     * @parameter el	Element (Either td or tr)
     * @parameter html  String Corresponding html string
     * @parameter tagName String Name of tag. (Either td or tr.  tr must have id.)
     */
    setPropertiesForTag: function(el, html, tagName) { 
    	//var tagRegExp = (tagName == 'tr') ? new RegExp('(<tr id=["]?' + this.id + '["]?.*?[^>]*>)', 'gmi') :
    	var tagRegExp = (tagName == 'tr') ? new RegExp('(<tr id=["]?' + '.*?' + '["]?.*?[^>]*>)', 'gmi') :
    		new RegExp('(<td.*?>)', 'gmi');
    	var tag = html.match(tagRegExp);
    	var propertyRegExp = / (.*?)\=\"(.*?)\"/gi;	
    	var properties = (tag) ? tag[0].match(propertyRegExp): [];
    	for(var j=0; j<properties.length; j++){
    		var pair = properties[j].split("=");
    		el.setAttribute(trim(pair[0].replace(/"/g, "")), pair[1].replace(/"/g, ""));
    	}
    },
       			           
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns node html  (ie. row/<tr>)
     * @return str  
     */
    getNodeHtml: function() { 
        var sb = [];
        //if(this.id == undefined){
        	this.id = this.index;
        //}
         
        sb[sb.length] = '<tr id="' + this.id + '" ' + 'class="ygtvrow">';              
        this._createLabel();
        sb[sb.length] = this.getContentHtml();
        sb[sb.length] = '</tr>';                
        var str = sb.join("");

        return str;
    },   
        
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Returns label content for row.
     * @return sb  
     */
    getContentHtml: function() { 
        var sb = [];
        sb[sb.length] = this.label;
        return sb.join("");
    },  
    
     /**
     * Wrap value with wth <a> tag
     * @parameter value String
     * @return str HTML string
     */    
    wrapWithAnchorTag: function(value){
		var str = '<a';
		this.labelElId = "ygtvlabelel" + this.index + '_' + this.position ;
        str += ' id="' + this.labelElId + '"';
        str += ' class="' + this.labelStyle  + ' ' + '"';
        if (this.href) {
            str += ' href="' + this.href + '"';
            str += ' target="' + this.target + '"';
        } 
        if (this.title) {
            str += ' title="' + this.title + '"';
        }
        str += ' >';
        str += value;
		str += '</a>';
		return str;
    },

     /**
     * Wrap value with wth <div> tag
     * @paramter value String
     * @return str HTML string
     */    
    wrapWithAnchorTagForButton: function(value){
		var str = '<div';
		this.labelElId = "ygtvlabelel" + this.index + '_' + this.position ;
        str += ' id="' + this.labelElId + '"';
        str += ' class="' + this.labelStyle  + ' buttonContainer"';
        if (this.href) {
            str += ' href="' + this.href + '"';
            str += ' target="' + this.target + '"';
        } 
        if (this.title) {
            str += ' title="' + this.title + '"';
        }
        str += ' >';
        str += value;
		str += '</div>';
		return str;
    },
           
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * internal function to create label and data for the node
     * @method _createLabel
     * @private
     */
    _createLabel: function(){

        // turn off the toggle if the label has custom defined event
        // use: this.href="javascript:void(0);" instead of "#" to avoid jumping to the top of the page
        if(this.hasLabelClickEvent) {
          this.href = "javascript:void(0);";
          // KB 3028554: the textNodeParentChange property is not supported in YUI 2.8
          // instead, the onLabelClick is called from the event listener defined in the addLink() method
          //this.textNodeParentChange = "onLabelClick";
        }
        
        // compose the label text field using the primary keys
        var labelText = "";

        if(this.level.treeNodeConfig){
        	labelText = this.getLabelForNodeConfig(this.level);
        }else{
        	// loop thought the visible fields and compose the label's text
        	var isEmptyRecord = false;
        	for (var j = 0; j < this.level.visibleFields.length; j++) {
        		var value = (this.level.visibleFields[j].value) ? this.level.visibleFields[j].value : this.data[this.level.visibleFields[j].name];
        		var nullValue = this.treeControl._nullValueTextMap[this.level.visibleFields[j].name];
            	if((!valueExists(value) || value=='') && nullValue!=undefined){
            		value = "[" + nullValue + "]";
            		isEmptyRecord = true;
            	}
        		labelText = this.buildLabelText(labelText, this.level.visibleFields, j, value, isEmptyRecord);        
        	}
    	}
	        
        // set the label
        this.setUpLabel(labelText);
        
		//call custom handler
		var afterGeneratingTreeNode = this.level.afterGeneratingTreeNode;
		var node = this;
        if(typeof afterGeneratingTreeNode == "function"){
        	afterGeneratingTreeNode(this);
        }        		
				
        // loop through the primary keys and compose the pkData list
        for (var j = 0; j < this.level.pkFields.length; j++) {
        	this.setNodeRestrictions(this.level.pkFields[j]);
        }
    },

	/**
     * Construct the label text according to treeNodeConfig.
     */
    getLabelForNodeConfig: function(){
    	var labelText = "";
    	for(var j = 0; j < this.level.treeNodeConfig.length; j++){
    		var element = this.level.treeNodeConfig[j];
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
    		
    		labelText = this.buildLabelText(labelText, this.level.treeNodeConfig, j, value, false);       		
    	}
    	return labelText;
    },

    /**
     * Build label text.
     */    
    buildLabelText: function(labelTxt, fields, index, value, isEmptyRecord){
    	var idText = ' id="' + this.contentElId + '_' + index + '" ';        		
    	this.position = index;
    	//var tagName = (index == 0) ? '<td style="white-space:nowrap" ' : '<td';
    	var tagName = '<td';
    	var tagEnd = (index == 0) ? '</td>' : '</td>';
    	var depthIcons = (index==0) ? this.createDepthIcons('', this.depth) : '';
    	var toggleIcon = (index==0 && this.hasIcon) ? this.createToggleIcon('') : '';
    	var multiSelectIcon = (index==0 && this.level.multipleSelectionEnabled) ? this.createMultipleSelectionEnabled('') : '';
    	var firstCell = (index==0) ? ' firstContent' : '';
    	var firstCellMargin = this.getFirstCellStyle(index);
    	var align = (fields[index].type == 'java.lang.Double' || fields[index].type == 'java.lang.Integer') ? ' number' : '';
    	
    	if(value!=undefined){
    		if(index>0){
    			labelTxt = labelTxt + " ";
    		}
    		
    		// user can use custom style class for primary key and non-primary key part of labels
    		var isColorField = (fields[index].controlType == 'color');
    		var colSpan = (!this.nextSibling  && index== fields.length-1)? this._calculateColSpan() : 0; 
    		var colSpanText = (colSpan == 0 || colSpan == 1) ? '' :  ' colSpan="' + colSpan + '"';            	
    		
    		if(isColorField){
    			labelTxt = labelTxt + tagName + idText + 'class="' + this.level.cssClassName + ' contentCell colorContent"' + colSpanText + '>' + depthIcons + toggleIcon + multiSelectIcon + this.wrapWithAnchorTag(this.getColorContentHtml(value, fields[index], this.data)) + tagEnd;
    		}else if(fields[index].isPk){
    			labelTxt = labelTxt + tagName + idText + 'class="' + this.level.cssPkClassName + firstCell + align + ' contentCell"' + colSpanText + firstCellMargin + '>' + depthIcons + toggleIcon + multiSelectIcon +  this.wrapWithAnchorTag(value) + tagEnd;
    		} else {
    			labelTxt = labelTxt + tagName + idText + 'class="' + this.level.cssClassName + firstCell + align + ' contentCell"' + colSpanText + firstCellMargin +'>' + depthIcons + toggleIcon + multiSelectIcon + this.wrapWithAnchorTag(value) + tagEnd;
    		} 
    	}else if(fields[index].controlType === 'button'){
    		labelTxt += tagName + idText + 'class="' + this.level.cssClassName + ' contentCell "' + colSpanText + '>';
    		if( fields[index].enabled && !isEmptyRecord){
        		labelTxt += depthIcons + toggleIcon + multiSelectIcon;
        		labelTxt += this.wrapWithAnchorTagForButton('<input id="button' + index + '" type="button" class="button mediumAction" value="' + fields[index].title + '" name="' + this.level.panelId + '_' + fields[index].name + '"/>');
    		}
    		labelTxt += tagEnd;
		}else if(fields[index].controlType === 'image' ){
			labelTxt += tagName + idText + 'class="' + this.level.cssClassName + ' contentCell "' + colSpanText + '>';
			if( fields[index].enabled && !isEmptyRecord){
				labelTxt += depthIcons + toggleIcon + multiSelectIcon;
				labelTxt += this.wrapWithAnchorTagForButton('<img id="image' + index + '" type="image" class="image" value="' + fields[index].title + '" name="' + this.level.panelId + '_' + fields[index].name + '" src="' + fields[index].imageName + '"/>');
			}
			labelTxt += tagEnd;
		} 
    	return labelTxt;
    },

	getFirstCellStyle: function(index) {
		return (index==0) ? ' style="padding-right: ' + 16*(this.treeControl.maxLevel+1) + 'px"' : ''
	},
    
    /**
     * Creates the collapse/expand toggle icon. In traditional tree, this was done in getNodeHtml(),
     * as a separate <td>.  In treeTable, this is part of the first <td>.
     @ paramter innerHTML String
     @return str String
     */
    createToggleIcon: function(innerHTML){
    	var str = '';
    	str += '<div id="' + this.getToggleElId();
    	str += '" class="';
    	str += this.getStyle() ;
    	str += ' toggleIcon ';
    	str += ' floatLeft">';
    	str += innerHTML;
    	str += '</div>';
    	return str;
    },

    /**
     * Creates the depth icons. In traditional tree, this was done in getNodeHtml(), 
     * as a separate <td>.  In treeTable, this is part of the first <td>.
     * @paramter innerHTML String
     * @return str String
     */
    createDepthIcons: function(innerHTML, depth){
    	var str = '';
        for (var i=0;i<depth;i++) {
        	str += '<div class="' + this.getDepthStyle(i) + ' ' + ' floatLeft">';
            str += innerHTML;
            str += '</div>';
        }
        return str;
    },

    /**
     * Creates the multiple select check-box. In traditional tree, this was done in getNodeHtml().
     * as a separate <td>.  In treeTable, this is part of the first <td>.
     * @parameter innerHTML String
     * @return str 
     */            
    createMultipleSelectionEnabled: function(innerHTML){
    	var str = '';
    	str += '<div class="';
    	str += this.contentStyle  + ' ygtvcontent floatLeft" ';
    	str += '>';
    	str += '<input type="checkbox"';
    	str += ' id="'+ this.checkElId +'"';
    	if(!this.parent.isRoot() && this.parent.isSelected()){
    		this.setCheckState(this.parent.isSelected());
    		str += ' CHECKED ';
    	}	
    	str += '/>';
    	str += innerHTML;			
    	str += '</div>';
    	return str;
    },
    
     /**
     * Calculates column span
     * @return colSpan Number colspan
     */
    _calculateColSpan: function(){
    	var maxNumberOfColumns = this.treeControl.maxVisibleFields;
    	var numberOfColumnsOnThisLevel = this.level.visibleFields.length - 1;			
        var colSpan = 0;
        if(maxNumberOfColumns  > numberOfColumnsOnThisLevel){
        	 colSpan = maxNumberOfColumns - numberOfColumnsOnThisLevel;
        }
        
        return colSpan;
    }, 
    
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Shows this nodes children (creating them if necessary), changes the
     * toggle style, and collapses its siblings if multiExpand is not set.
     * @method expand
     */
    expand: function(lazySource) {
        // Only expand if currently collapsed.
        if (this.isLoading || (this.expanded && !lazySource)) { 
            return; 
        }

        var ret = true;

        // When returning from the lazy load handler, expand is called again
        // in order to render the new children.  The "expand" event already
        // fired before fething the new data, so we need to skip it now.
        if (!lazySource) {
            // fire the expand event handler
            ret = this.tree.onExpand(this);

            if (false === ret) {
                return;
            }
            
            ret = this.tree.fireEvent("expand", this);
        }

        if (false === ret) {
            return;
        }

        if (!this.getEl()) {
            this.expanded = true;
            return;
        }

        if (!this.childrenRendered) {
            this.renderChildren();
        } else {
        }

        this.expanded = true;

        this.updateIcon();

        // this.getSpacer().title = this.getStateText();

        // We do an extra check for children here because the lazy
        // load feature can expose nodes that have no children.

        // if (!this.hasChildren()) {
        if (this.isLoading) {
            this.expanded = false;
            return;
        }

        if (! this.multiExpand) {
            var sibs = this.getSiblings();
            for (var i=0; sibs && i<sibs.length; ++i) {
                if (sibs[i] != this && sibs[i].expanded) { 
                    sibs[i].collapse(); 
                }
            }
        }

        this.showChildren();

        ret = this.tree.fireEvent("expandComplete", this);
    },
            
     /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Shows this node's children
     * @method showChildren
     */
    showChildren: function() {  	
        if (!this.tree.animateExpand(this.getChildrenEl(), this)) {
            if (this.hasChildren()) {
            	var startIndex = this.getEl().rowIndex+1;
            	var stopIndex = this._findStopIndex();
            	var hideIndex = stopIndex;
            	
            	var footprint = new Array(this.treeControl.maxLevel+1);
            	var curDepth = this.depth;
            	var prevDepth = curDepth;
            	var parentExpanded = new RegExp(/ygtvtm|ygtvlm/).test(this.getEl().innerHTML);
            	footprint[curDepth] = parentExpanded;

            	for(var i=startIndex; i< stopIndex; i++){

            		curDepth = this.depth;
            		var curHTML = this.getTableEl().rows[i].innerHTML;
            		if(curHTML.match(/ygtvdepthcell/g)){
            			curDepth = curHTML.match(/ygtvdepthcell/g).length;
            		}
        		
            		if(curHTML.match(/ygtvblankdepthcell/g)){
            			curDepth += curHTML.match(/ygtvblankdepthcell/g).length;
            		}
            		if(curHTML.match(/headerCell/g)){
            			curDepth -= 1;
            		}

            		if(curDepth == prevDepth){
            			
            			// is sibling, show if parentExpanded == true           			          			
            			parentExpanded = footprint[curDepth-1]; 
            			this.getTableEl().rows[i].style.display = (parentExpanded == false) ? "none" : "";
           		         			
            		}else if(curDepth > prevDepth){          		
            			
            			// is child, show if parentExpanded == true 
            			var html = this.getTableEl().rows[i].innerHTML;
            			
            			// add to footprint
            			if(footprint[curDepth-1] == false){
            				footprint[curDepth]= false;
            			}else{
            				footprint[curDepth] = new RegExp(/ygtvtm|ygtvlm|ygtvtn|headerCell/).test(html); 
            			}           			 
            			parentExpanded = footprint[curDepth-1];             			         			
            			this.getTableEl().rows[i].style.display = (parentExpanded == false) ? "none" : "";
            			//prevDepth = curDepth;
            			           		   			          		          			
            		}else if(curDepth < prevDepth){
            			
            			// is on a different branch, use footprint[curDepth - 1]
            			prevDepth = curDepth;            			
            			parentExpanded = footprint[curDepth - 1];
            			this.getTableEl().rows[i].style.display = (parentExpanded == false) ? "none" : "";
            			
            			// clear footprint
            			/*
            			for(var j=curDepth+1; j<this.treeControl.maxLevel; j++){
            				footprint[j] = '';            				
            			}
            			*/
            			
            		}
               	}
               	
            }
        }
    },
    
    
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * Hides this node's children
     * @method hideChildren
     */
    hideChildren: function() {
        if (!this.tree.animateCollapse(this.getChildrenEl(), this)) {    	
            var startIndex = this.getEl().rowIndex+1;
            var stopIndex = this._findStopIndex();
            for(var i=startIndex; i< stopIndex; i++){
            	 this.getTableEl().rows[i].style.display = "none";
            }
        }
    },
    
    /**
     * Find stop index of html table (collapsing and expanding)
     * @return stopIndex Number
     * @private
     */
    _findStopIndex: function() {
    	var stopIndex = this.getTableEl().rows.length;
   	
    	if(this.nextSibling){
    		stopIndex = this.getTableEl().rows.namedItem(this.nextSibling.id).rowIndex;
    	} else if(this.parent && this.parent.nextSibling){
    		stopIndex = this.getTableEl().rows.namedItem(this.parent.nextSibling.id).rowIndex;
    	} else if(this.parent && this.parent.parent && this.parent.parent.nextSibling){
    		stopIndex = this._findParentSibling(this.parent);
    	}
    	
    	return stopIndex;
    },             

    /**
     * Recursively find parent sibling
     * @return stopIndex Number
     * @parent
     */
    _findParentSibling: function(parent) {
    	if(parent.parent && parent.parent.nextSibling){ 
    		return this.getTableEl().rows.namedItem(parent.parent.nextSibling.id).rowIndex;
    	} else {
    		this._findParentSibling(parent.parent);
    	}  	
    },
 
    /**
     * @override Ab.tree.TreeNode, which overrides YAHOO.widget.Node
     * When a label is clicked
     * @method onLabelClick
     */
    onLabelClick: function(me) {
    	// make the current selected node stand out a bit
    	var currentEl = Ext.get(me.labelElId + '_' + me.position);
    	if (currentEl) {
        	currentEl.parent().parent().addClass('selectedTreeNode');	
    	}
    	
    	// YAHOO.util.Dom.setStyle(me.labelElId, 'opacity', 0.5);
    	if(this.treeControl.lastNodeClicked != null && this.treeControl.lastNodeClicked != me){
    		//set the last node clicked to its normal style
    		var lastEl = Ext.get(this.treeControl.lastNodeClicked.labelElId + '_' + this.treeControl.lastNodeClicked.position);
    		if (lastEl) {
    			lastEl.parent().parent().removeClass('selectedTreeNode');    			
    		}
    		// YAHOO.util.Dom.setStyle(this.treeControl.lastNodeClicked.labelElId, 'opacity', 1);
        }
    	
		this.treeControl.lastNodeClicked = me; 
    },
    
    highlightNode: function(highlight) {
    	var el = Ext.get(this.treeControl.lastNodeClicked.labelElId + '_' + this.treeControl.lastNodeClicked.position);
    	if (el) {
        	var node = el.parent().parent();
        	if (highlight == false) {
        		node.removeClass('selectedTreeNode');  		
        	} else {
        		node.addClass('selectedTreeNode'); 
        	} 	
    	}  	
    }
});


/**
 * The TreeLevel class describes the presentation attributes of a tree level.
 * It is not a visual component but more like the schema of the tree level.
 * it contain the level number, the visible field names and primary key field names info.
 *
 */    
Ab.tree.TreeTableLevel = Ab.tree.TreeLevel.extend({
	
	showLabels: true,
		
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
        					this.showLabels = panel.showLabels;
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
        if(panelData.fieldDefs.length > 0){	
        	this._findVisibleFieldsFromPanel(panel, ds, data);
        }else{
        	this._findVisibleFieldsFromDs(ds, panel, data);
        }
        
        // add all primary key fields used to generate drill-down restrictions
        this.pkFields = [];
        for (var m = 0; m < data.primaryKeyIds.length; m++) {
        	this.pkFields.push(data.primaryKeyIds[m]);
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
        	
        	// add onClickNode listener
        	var onClickNodeFunction = this._getControllerFunction(panel.panelId + '_onClickNode');
        	if(onClickNodeFunction){
        		this.events.push({type: 'onClickNode', commands: [{type: 'onClickNode', handle: onClickNodeFunction, panel: panelData}]});
        	}
        	
        	this.afterGeneratingTreeNode = this._getControllerFunction(panel.panelId + '_afterGeneratingTreeNode');       		      		
        }
    },
    
    createEvaluationContext: function() {
		var ctx = {
            view: Ab.view.View,
            panel: this
        };
		
		for (name in Ab.view.View.evaluationContext) {
			ctx[name] = Ab.view.View.evaluationContext[name];
		}

        return ctx;
    },
    
    /**
     * Search for a function in View controller(s).
     * @return function
     * @method getControllerFunction
     * @private
     */
    _getControllerFunction: function(listenerName){
    	var fn = null
    	View.controllers.each(function (controller) {
    		fn = controller[listenerName];
    		if(fn){
    			if (!fn.call) {
    				fn = window[fn];
    			}						
    		}							
    	});
    	return fn;
    },    

    // custom handler
    afterGeneratingTreeNode: function(node){
    },
        
    /**
    * Find visible fields based on datasource
    * @parameter ds Datasource
    *            panel  
    *            data 
    * @private
    */    
    _findVisibleFieldsFromPanel: function(panel, ds, data) {
    	var ctx = this.createEvaluationContext();          
    	for (var j = 0; j < panel.fieldDefs.length; j++) {
    		var isVisibleField = true;
    		var controlType = '';
    		var fieldName = panel.fieldDefs[j].id;
    		var legendKey = panel.fieldDefs[j].legendKey; 
    		 var hidden = Ab.view.View.evaluateBoolean(panel.fieldDefs[j].hidden,ctx, false);
    		 if(hidden){
    			 continue;
    		 }
    		//3032594 - try to find the field in the panel's fieldDef object
    		if (isVisibleField) {		            
    			if (panel.fieldDefs[j].controlType == "button" || panel.fieldDefs[j].controlType == "image") {
    				// buttons fields won't have ds definition
    				controlType = panel.fieldDefs[j].controlType;
    				//fieldName = panel.fieldDefs[j].id;
    			} else {       				
    				for (var i = 0; i < data.columns.length; i++) {    					
    					if (fieldName == data.columns[i].id && panel.fieldDefs[j].hidden == "true") {
    						// the field is found, and is hidden
    						isVisibleField = false;
    						break;
    					}
    				} 
    				if (panel.fieldDefs[j].controlType == "color") {
    					// color fields may or may not have a ds a definition
    					controlType = panel.fieldDefs[j].controlType;
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
    		for (var k = 0; k < data.primaryKeyIds.length; k++) {
    			if (fieldName === data.primaryKeyIds[k]){
    				isPk = true;
    				break;
    			}
    		}
    		// add visible fields with field name and isPk value.
    		var visibleField = {name: fieldName, isPk: isPk, controlType: controlType, legendKey:legendKey};

    		if (controlType == "image") {
    			visibleField.tooltip = panel.fieldDefs[j].tooltip ? panel.fieldDefs[j].tooltip: panel.fieldDefs[j].title;  
    		}
    		if (controlType == "button" && panel.fieldDefs[j].tooltip) {
    			visibleField.tooltip = panel.fieldDefs[j].tooltip;
    		}
    		if(controlType == "image" && !(panel.fieldDefs[j].title)){
    			visibleField.title = '';
    		} else {
        		visibleField.title =  (panel.fieldDefs[j].title) ? panel.fieldDefs[j].title : ds.fieldDefs.get(fieldName).title;    			
    		}
    		if(panel.fieldDefs[j].imageName != ''){
    			visibleField.imageName =  panel.fieldDefs[j].imageName;
    		}
    		if(panel.fieldDefs[j].type != ''){
    			visibleField.type =  panel.fieldDefs[j].type;
    		}
    		if(panel.fieldDefs[j].value != ''){
    			visibleField.value =  panel.fieldDefs[j].value;
    		}
    		visibleField.enabled = Ab.view.View.evaluateBoolean(panel.fieldDefs[j].enabled,ctx, true); 		
    		this.visibleFields.push(visibleField);
    	}
    },

    /**
    * Find visible fields based on datasource
    * @parameter ds Datasource
    *            panel  
    *            data 
    * @private
    */    
    _findVisibleFieldsFromDs: function(ds, panel, data) {
    	for (var i = 0; i < data.columns.length; i++) {
    		var fieldName = data.columns[i].id;
    		var isVisibleField = true;
    		var controlType = '';
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
    					controlType = panel.fieldDefs[j].controlType;
    					break;
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
    		title = ds.fieldDefs.get(fieldName).title;
    		// add visible fields with field name and isPk value.
    		this.visibleFields.push({name: fieldName, isPk: isPk, controlType: controlType, title: title});
        }
    }
});  


/**
* @override YAHOO.widget.TreeView
* Get event target element. (For collapsing and expanding)
*/
YAHOO.widget.TreeView.prototype._getEventTargetTdEl = function (ev) {
	var target = YAHOO.util.Event.getTarget(ev); 
	if (target && (target.tagName.toUpperCase() == 'DIV' && YAHOO.util.Dom.hasClass(target,'floatLeft'))) { 
	} else {
		// go up looking for a TD with a className with a ygtv prefix
		while (target && !(target.tagName.toUpperCase() == 'TD' && YAHOO.util.Dom.hasClass(target.parentNode,'ygtvrow'))) { 
			target = YAHOO.util.Dom.getAncestorByTagName(target,'td'); 
		}
	}
	if (YAHOO.lang.isNull(target)) { return null; }
	// If it is a spacer cell, do nothing
	if (/\bygtv(blank)?depthcell/.test(target.className)) { return null;}
	// If it has an id, search for the node number and see if it belongs to a node in this tree.
	if (target.id) {
		var m = target.id.match(/\bygtv([^\d]*)(.*)/);
		if (m && m[2] && this._nodes[m[2]]) {
			return target;
		}
	}
	return null;
};

/**
* Attached click listener to element
* @parameter listenerName  String Name of the listener.
* @parameter contentElement Element for which the listener will be attached to.
* @parameter row Element The <tr> row.
* @parameter panel Object  View panel
* @paramter node TreeTableNode  Node corresponding to the row.
*/  
YAHOO.widget.TreeView.prototype.attachListenerToElement = function(listenerName, contentElement, row, panel, node){
	View.controllers.each(function (controller) {
        var scope = controller;
		var fn = controller[listenerName];
		if (fn) {
			if (!fn.call) {
				fn = window[fn];
                scope = window;
			}
			var listener = function() {
				// call the default tree node event handler that sets the lastNodeClicked property
				node.onLabelClick(node);
				fn.call(scope, contentElement, panel, node);
			}
			Ext.get(contentElement).addListener("click", listener);	
		}							
	});
};


/**
* @override YAHOO.widget.TreeView
* For collapsing and expanding
*/  
YAHOO.widget.TreeView.prototype.focus = function () {
	var focused = false, self = this;
	if (this.tree.currentFocus) {
		this.tree.currentFocus._removeFocus();
	}
	var  expandParent = function (node) {
		if (node.parent) {
			expandParent(node.parent);
			node.parent.expand();
		} 
	};
	expandParent(this);
	//YS: check if self.getEl() is null to avoid JS error
	var firstChild = null;
	if(self.getEl()!=null){
		firstChild = self.getEl().firstChild;
	}
	YAHOO.util.Dom.getElementsBy  ( 
		function (el) {
			return (/ygtv(([tl][pmn]h?)|(content))/).test(el.className);
		} ,
		'td' , 
		firstChild, 
		function (el) {
			YAHOO.util.Dom.addClass(el, YAHOO.widget.TreeView.FOCUS_CLASS_NAME );
			if (!focused) { 
				var aEl = el.getElementsByTagName('a');
				if (aEl.length) {
					aEl = aEl[0];
					aEl.focus();
					self._focusedItem = aEl;
					Event.on(aEl,'blur',function () {
						//console.log('f1');
						self.tree.fireEvent('focusChanged',{oldNode:self.tree.currentFocus,newNode:null});
						self.tree.currentFocus = null;
						self._removeFocus();
					});
					focused = true;
				}
			}
			self._focusHighlightedItems.push(el);
		}
	);
	if (focused) { 
		//console.log('f2');
		this.tree.fireEvent('focusChanged',{oldNode:this.tree.currentFocus,newNode:this});
		this.tree.currentFocus = this;
	} else {
		//console.log('f3');
		this.tree.fireEvent('focusChanged',{oldNode:self.tree.currentFocus,newNode:null});
		this.tree.currentFocus = null;
		this._removeFocus(); 
	}
	return focused;
};   


/**
* @override YAHOO.widget.RootNode  
* Refresh of rootnode.
*/ 
YAHOO.widget.RootNode.prototype.refresh = function(){
	//this.loadComplete();
	if (this.hasIcon) {
		var el = this.getToggleEl();
		if (el) {
			el.className = el.className.replace(/\bygtv[lt][nmp]h*\b/gi,this.getStyle());
		}
	}
};



