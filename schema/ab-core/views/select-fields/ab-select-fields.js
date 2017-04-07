View.createController('exSelectFields', {

    /**
     * 'Level' field
     */
	levelField: null,

    /**
     * 'Visible' field
     */	
	shownField: null,

    /**
     * 'Available' field
     */	
	hiddenField: null,

    /**
     * Dom element for 'Visible' field
     */		
	shownEl: null,

    /**
     * Dom element for 'Available' field
     */	
	levelEl: null,

    /**
     * Dom element for 'Level' field
     */	
	hiddenEl: null,

    /**
     * Panel  (if tree, this is the top panel)
     */			
	panel: null,

    /**
     * Temporary array of all tree panels
     */	
	treePanels: [],

    /**
     * Previous level selected.  Stores when level is clicked.  Applied when level is changed.
     */		
	previousLevel: 0,

    /**
     * Ids of visible fields for previously selected level. Stores when level is clicked.  Applied when level is changed.
     */		
	previousIds: [],

    /**
     * After 'Select Fields' dialog loads
     */	 
	afterViewLoad: function(){
        View.getParentDialog().setTitle(getMessage('dialogTitle'));

		// setup 'Available Fields' combo box
		this.hiddenField = this.columnsPanel.fields.get('hiddenList');
		this.hiddenEl = this.hiddenField.dom;
		this.hiddenEl.multiple = "multiple";
		this.hiddenEl.style.height = '250px';
		this.hiddenEl.size = 25;

		// setup 'Visible Fields' combo box		
		this.shownField = this.columnsPanel.fields.get('shownList');
		this.shownEl = this.shownField.dom;
		this.shownEl.multiple = "multiple";
		this.shownEl.size = 25;
		this.shownEl.style.height = '250px';
		
		// store panel	
		this.panel = View.parameters.panel;

		// setup 'Levels' combo box as applicable
		if(this.panel){
			Ext.get('columnsPanel_hiddenList').on('dblclick', this.columnsPanel_onShow.createDelegate(this));
			Ext.get('columnsPanel_shownList').on('dblclick', this.columnsPanel_onHide.createDelegate(this));
			if(this.panel.type == 'tree'){
				Ext.get('columnsPanel_levelList').on('click', this.onClickLevel.createDelegate(this));
				Ext.get('columnsPanel_levelList').on('change', this.onChangeLevel.createDelegate(this));
				this.levelField = this.columnsPanel.fields.get('levelList');
				this.levelEl = this.levelField.dom;	
			}else{
				this.columnsPanel.showField('levelList', false);
				this.columnsPanel.getFieldLabelElement('levelList').style.display = 'none';
			}

			View.controllers.get('exSelectFields').populateComboBoxes(this.panel);
		}
	},

    /**
     * When user clicks the 'Level' combo box.
     */
	onClickLevel: function(){
		this.previousLevel = this.levelEl.value;
		this.previousIds = [];
		var options = this.shownEl.options;	
		for(var i=0; i<options.length; i++){
			var id = options[i].value;
			this.previousIds.push(id);				
		}
	},
	
    /**
     * When user changes the level using the 'Level' combo box.
     */				
	onChangeLevel: function(){
		// for trees, if there are no visible fields in a level, they could be mistaken for leaf nodes.  
		// Require at least one visible field has been selected before moving on
		if(this.shownEl.options.length == 0){
			this.levelEl.value = this.previousLevel;
			alert(getMessage('msgVisibleFieldRequired'));
			return;
		}
		
		// update the temporary list of fields
		this.updateTempTreeFields(this.previousIds, this.previousLevel);
		
		// find field columns for selected level
		var columns = this.treePanels[this.levelEl.value].columns;
		
		// populate available and visible fields dialog, using only fields from selected level
		this.populateShowHideComboBoxes(columns);	
	},

    /**
     * Update temporary list of tree fields
     */			
	updateTempTreeFields: function(ids, level){
		var treePanel = this.treePanels[level];
		var columns = treePanel.columns;
		var newColumns = [];
		for(var i=0; i<ids.length; i++){
			for(var j=0; j<columns.length; j++){
				if(ids[i] == columns[j].id){
					var removedColumn = columns[j];
					//var removedColumn = columns.splice(j, 1)[0];
					//columns.unshift(removedColumn[0]); 
					removedColumn.hidden = "false";
					newColumns.push(removedColumn);				
				}
			}		
		}

		for(var k=0; k<columns.length; k++){
			var bFound = false;
			for(var i=0; i<ids.length; i++){
				if (ids[i] == columns[k].id) {					
					bFound = true;					
				}					
			}
			if (bFound == false) {
				var column = columns[k];
				column.hidden = "true";
				newColumns.push(column);
			}			
		}
		this.treePanels[level].columns = newColumns;
	},

    /**
     * When user click on the 'Hide' button
     */			
	columnsPanel_onHide: function(action){
		// get selected options to hide
		var values = this.getValuesForNonAction(this.shownEl);
								
		for(var i in values){
			if (this.shownEl.length > 1) {
				
				// add those to hidden list
				this.hiddenField.addOption(i, values[i]);
				
				// remove those from shown list
				var option = {};
				option[i] = values[i];
				this.shownField.removeOptions(option);
			} else if(this.shownEl.length == 1){
				alert(getMessage('msgVisibleFieldRequired'));
			}
		}
	},

    /**
     * When user click on the 'Up' button
     */
	columnsPanel_onUp: function(action){

		var dropDown = this.shownEl;		
		for (var i=0; i<dropDown.options.length; i++) {
			var option = dropDown.options[i];
			if(option.selected && option.index == 0){
				return;
			}
	
			if(option.selected == true && option.index > 0){
				dropDown.insertBefore(option, option.previousSibling);		
			}
		}
	},

    /**
     * When user click on the 'Down' button
     */	
	columnsPanel_onDown: function(action){
		var dropDown = this.shownEl;		
		for (var i=dropDown.options.length-1; i>=0; i--) {
			var option = dropDown.options[i];

			if(option.selected && option.index == dropDown.options.length-1){
				return;
			}
				
			if(option.selected == true && option.index < dropDown.options.length-1){
				dropDown.insertBefore(option.nextSibling, option);	
			}
		}		
	},	

    /**
     * When user click on the 'Show' button
     */		
	columnsPanel_onShow: function(action){
		// get selected options to hide
		var values = this.getValuesForNonAction(this.hiddenEl);
		
		// add those to shown list
		for(var i in values){
			this.shownField.addOption(i, values[i]);
		}		
		
		// remove those from hidden list
		this.hiddenField.removeOptions(values);
	},

    /**
     * Get values from drop down
     */	
	getValues: function(dropDown) {
        
		var results = {};
		for (var i=0; i<dropDown.options.length; i++) {
			var option = dropDown.options[i];
			if(option.selected == true){
				var value = option.value;         
				results[value] = option.text;
			}
		}
		return results;	
	},

    /**
     * Get values from drop down
     */	
	getValuesForNonAction: function(dropDown) {        
		var results = {};
		var hasAction = false;
		for (var i=0; i<dropDown.options.length; i++) {
			var option = dropDown.options[i];
			if(option.selected == true){
				if (option.isAction == true) {
					hasAction = true;					
				} else {
					var value = option.value;         
					results[value] = option.text;					
				}
			}
		}

		if (hasAction == true) {
			alert(getMessage('msgFieldsCannotBeHidden'));			
		}
		
		return results;	
	},
	
    /**
     * Populate combo boxes
     */	
	populateComboBoxes: function(panel){
		var columns = [];
				
		if(panel.type == 'tree'){
			var treePanels = panel._panelsData;
			this.treePanels = treePanels;
			for(var i=0; i<treePanels.length; i++){
				
				// populate levels list
				this.levelField.addOption(i, getMessage('msgLevel') + ' ' + i);
				var sidecar = panel.getSidecar();

				if(sidecar.get('levels').length > 0){
					var sidecarLevels = sidecar.get('levels');
                    if (sidecarLevels && sidecarLevels[i]) {
					    this.treePanels[i].columns = sidecarLevels[i].columns;
                    }
				} else {
				
					// find columns and store in tree panels
					this.treePanels[i].columns = this.getColumnsFromTreePanel(treePanels[i]);
				}
			}		

            // TODO: if the user never customized the list of visible fields, there are no columns
			columns = this.treePanels[0].columns;		
		}else{
			columns = panel.columns;
		}
		
		// populate 'Available Fields' and 'Visible Fields'
		this.populateShowHideComboBoxes(columns);
	},

    /**
     * Get columns from tree panels
     */	
	getColumnsFromTreePanel: function(treePanel){
		var columns = [];
		var dsFieldDefs = View.getOpenerView().dataSources.get(treePanel.dataSourceId).fieldDefs;
		var fieldDefs = (treePanel.fieldDefs.length > 0) ? treePanel.fieldDefs : dsFieldDefs.items;
		for(var j=0; j<fieldDefs.length; j++){
			columns.push(fieldDefs[j]);
			if(fieldDefs[j].title == '' && dsFieldDefs.get(columns[j].id)){
				columns[j].title = dsFieldDefs.get(columns[j].id).title;
			}
		}
		return columns;
	},

    /**
     * Populate the 'Available Fields' and 'Visible Fields' combo boxes
     */		
	populateShowHideComboBoxes: function(columns){
		this.hiddenField.clearOptions();
		this.shownField.clearOptions();
		var ctx = this.panel.createEvaluationContext();
		
		for (var x=0, column; column = columns[x]; x++) {
			if(column.id != 'multipleSelectionColumn' ){
				var columnName = (column.name == '') ? '(' + column.id + ')' : column.name;
				if(this.panel.type == 'tree'){
					columnName = (column.title == '') ? '(' + column.id + ')' : column.title;
				}
				
				if (this.panel.type == 'grid' && column.name == '' && column.text) {
					columnName = column.text;
				}
				
				columnName = Ab.view.View.evaluateString(columnName, ctx);

				var hidden = (this.panel.type == 'tree') ? Ab.view.View.evaluateBoolean(column.hidden, this.panel.createEvaluationContext(), false) : column.hidden;
				if (hidden == false) {	
					this.shownField.addOption(column.id, columnName);
					var opt = this.shownField.dom.options[this.shownField.dom.options.length-1];
					opt.isAction = (column.type == 'button' || column.type == 'image' || column.controlType == 'button' || column.controlType == 'image');
				} else if(hidden == true) {
					this.hiddenField.addOption(column.id, columnName);
					var opt = this.hiddenField.dom.options[this.hiddenField.dom.options.length-1];
					opt.isAction = (column.type == 'button' || column.type == 'image' || column.controlType == 'button' || column.controlType == 'image');
				}
			}
		}
	},

    /**
     * When user click update
     */	
	columnsPanel_onUpdate: function(){
		if(this.panel.type == 'tree'){
			this.updateTree();
		}else{
			this.updateGrid();
		}
	},


    /**
     * Update tree panel.
     */	
	updateTree: function(){
		
		// ensure that at least one visible field was selected
		if(this.shownEl.options.length == 0){
			alert(getMessage('msgVisibleFieldRequired'));
			return;
		}
		
		this.onClickLevel();
		this.updateTempTreeFields(this.previousIds, this.previousLevel);
		
		var sidecarLevels = [];
		for(var i=0; i<this.treePanels.length; i++){
			var treePanel = this.treePanels[i];
			var columns = treePanel.columns;
			var visibleFields = [];
			
			for(var j=0; j<columns.length; j++){
				var column = columns[j];				
				if(column.hidden == 'false'){
					var fieldDef = this.getFieldDef(treePanel, column.id);
					var enabled = (fieldDef) ? fieldDef.enabled : true;
					var visibleField = {name: column.id, isPk: column.primaryKey, controlType: column.controlType, type: column.type, value: column.value, title: column.title, enabled: enabled};
					if(column.controlType == 'image'){
						visibleField.imageName = column.imageName;
					}
					visibleFields.push(visibleField);
				}
			}
			
			sidecarLevels.push({visibleFields: visibleFields, columns: columns});
		}
		
		var sidecar = this.panel.getSidecar();
		sidecar.set('levels', sidecarLevels);
		sidecar.save();		

		this.panel.refresh();
		View.getOpenerView().closeDialog();
	},
	
	/**
	 * Gets field def object from specified tree panel object and field full name.
	 */
	getFieldDef: function(treePanel, fieldName){
		var dsFieldDefs = View.getOpenerView().dataSources.get(treePanel.dataSourceId).fieldDefs;
		var fieldDefs = (treePanel.fieldDefs.length > 0) ? treePanel.fieldDefs : dsFieldDefs.items;
		for(var j=0; j<fieldDefs.length; j++){
			if(fieldDefs[j].fullName === fieldName){
				return fieldDefs[j];
			}
		}
		return null;
	},

    /**
     * Get grid panel
     */	
	updateGrid: function(){	
		// show fields from 'Fields to Show' list
		var options = this.shownEl.options;	
		var startIndex = (this.panel.multipleSelectionEnabled) ? 1: 0; 
		for(var i=0; i<options.length; i++){
			var id = options[i].value;
			this.panel.setColumnDisplayOrder(id, i + startIndex);
			this.panel.showColumn(id , true);
			
			if( i == options.length-1 ) {
				this.panel.lastVisibleColumnIndex = i + startIndex;
			}
		}

		// hide fields from 'Fields to Hide' list
		var options = this.hiddenEl.options;
		for(var i=0; i<options.length; i++){
			var id = options[i].value;
			this.panel.showColumn(options[i].value , false);
		}

		// set side car fields
		var sidecar = this.panel.getSidecar();
		sidecar.set('columns', this.panel.columns); 
		sidecar.save();
						
		// update grid
		this.panel.update();
				
		// close dialog		
		View.getOpenerView().closeDialog();	
	}  	
});