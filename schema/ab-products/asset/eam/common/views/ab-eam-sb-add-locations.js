var abEamSbAddLocController = View.createController('abEamSbAddLocController', {
	callback: null,
	
	sbName: null,
	
	separator: '- \u200C',
	
	multipleValueSeparator: Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
	
	// array with assigned building and floors
	selectedFloors: null,
	
	currentFloors: null,
	
	currentFloorsEq: null,
	
	currentFloorsFn: null,
	
	fieldDefs: {
		'sb_create_for': {
			visible: false,
			values: ['rm']
		}
	},

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click input[type=checkbox]': function(input) {
            if (input.currentTarget.name === 'abDefineSb_form_sb_create_for') {
                this.abEamAddLocationSb_form_sb_create_for_onClick(input);
            }
        }
    },

    // from where is called
	isFromSpace: false,
	
	isFromAsset: false,
	
	afterViewLoad: function(){
		if (valueExists(View.parameters)) {
			if (valueExists(View.parameters.callback)) {
				this.callback = View.parameters.callback;
			}
			if (valueExists(View.parameters.fieldDefs)) {
				this.fieldDefs = View.parameters.fieldDefs;
			}
			if (valueExists(View.parameters.isFromAsset)) {
				this.isFromAsset = View.parameters.isFromAsset;
			}
			if (valueExists(View.parameters.isFromSpace)) {
				this.isFromSpace = View.parameters.isFromSpace;
			}
		}
		
		this.abEamAddLocationBlTree.setMultipleSelectionEnabled(0);
		this.abEamAddLocationBlTree.setMultipleSelectionEnabled(1);
		this.abEamAddLocationBlTree.addEventListener('onChangeMultipleSelection', this.onChangeNodesSelection.createDelegate(this));
	},

	afterInitialDataFetch: function(){
		// show hide fields
		if (valueExists(this.fieldDefs['sb_create_for'])) {
			for (var i = 0; i < this.fieldDefs['sb_create_for'].values.length; i++ ) {
				this.abEamAddLocationSb_form.setCheckbox('sb_create_for', this.fieldDefs['sb_create_for'].values[i], true);			
			}
			// cannot hide checkbox using form.showField
			//this.abDefineSb_form.showField('sb_create_for', this.fieldDefs['sb_create_for'].visible);
			//this.abDefineSb_form.showField('vf_sb_create_for_desc', this.fieldDefs['sb_create_for'].visible);
			if (!this.fieldDefs['sb_create_for'].visible) {
				var objColl = document.getElementsByName('abEamAddLocationSb_form_sb_create_for');
				if (objColl && objColl.length > 0) {
					var obj = objColl[0];
					var objRow = obj;
					while (objRow.tagName.toUpperCase() != 'TR'){
						objRow = objRow.parentNode;
					}
					objRow.style.display = 'none';
				}
				var descriptionObject = document.getElementById('sb_create_for_desc');
				if (descriptionObject) {
					var objRow = descriptionObject;
					while (objRow.tagName.toUpperCase() != 'TR'){
						objRow = objRow.parentNode;
					}
					objRow.style.display = 'none';
				}
			}
		}
		
	},
	
	onChangeNodesSelection: function(node){
		if(node.level.levelIndex == 0 && !node.expanded){
			node.expand();
			this.updateSelectedFloors.defer(500, this, [node]);
		}else{
			this.updateSelectedFloors(node);
		}
	},
	
	updateSelectedFloors: function(node){
		var floors = [];
		var blFl = this.abEamAddLocationSb_form.getFieldValue('bl_fl');
		if(valueExistsNotEmpty(blFl)){
			floors = blFl.split(this.multipleValueSeparator);
		}
		var nodeData = '';
		if(node.level.levelIndex == 0){
			nodeData = node.data['bl.bl_id.key'] + this.separator;
		}else if (node.level.levelIndex == 1){
			nodeData = node.data['fl.bl_id.key'] + this.separator + node.data['fl.fl_id.key'];
		}
		if (node.isSelected()){
			if(node.level.levelIndex == 0){
				for(var index = 0; index < node.children.length; index++){
					var child = node.children[index];
					nodeData = child.data['fl.bl_id.key'] + this.separator + child.data['fl.fl_id.key'];
					floors.push(nodeData);
				}
			}else{
				floors.push(nodeData);
			}
			
		}else{
			for(var index = floors.length -1; index>= 0; index--){
				if(floors[index].toString().indexOf(nodeData) != -1){
					floors.splice(index, 1);
				}
			}
		}
		this.abEamAddLocationSb_form.setFieldValue('bl_fl', floors.join(this.multipleValueSeparator));
	},

	abEamAddLocationSb_form_afterRefresh: function(){
		//make bl_fl field noneditable
		var blFlField = this.abEamAddLocationSb_form.fields.get('bl_fl');
		if(blFlField){
			blFlField.dom.readOnly = true;
			blFlField.dom.className = 'inputField_cell';
		}
		
		if(valueExists(this.abEamAddLocationSb_form.restriction)){
			var clause = this.abEamAddLocationSb_form.restriction.findClause('sb.sb_name');
			if(clause) {
				this.sbName = clause.value;
			}
		}
		var sbLevel = this.abEamAddLocationSb_form.getFieldValue('sb.sb_level');
		if(sbLevel == 'fg'){
			this.abEamAddLocationSb_form.setFieldValue('sb_summarize', 'fl');
			this.enableField('abEamAddLocationSb_form_sb_summarize', false);
		}
		// check if we have sb_items records
		var recsSbItems =  this.getSbItemsRecords(this.sbName);
		if(recsSbItems.length == 0){
			this.abEamAddLocationSb_form.setFieldValue('update_requirements', 'yes');
			this.enableField('abEamAddLocationSb_form_update_requirements', false);
		}
		if(recsSbItems.length == 0 && sbLevel != 'fg'){
			//this.abEamAddLocationSb_form.showField('sb_summarize', true);
			//this.abEamAddLocationSb_form.showField('sb_summarize_desc', true);
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize').parentElement.style.display = '';
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_desc').parentElement.style.display = '';
		}else{
			//this.abEamAddLocationSb_form.showField('sb_summarize', false);
			//this.abEamAddLocationSb_form.showField('sb_summarize_desc', false);
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize').parentElement.style.display = 'none';
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_desc').parentElement.style.display = 'none';
		}
		
		//kb#3048434: if  sb.sb_as is NONE, then include the form option of "Summarize Space From?" because this value is required for WFR.
		var sbAs = this.abEamAddLocationSb_form.getFieldValue('sb.sb_as');
		if(sbAs == 0){
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_space').parentElement.style.display = '';
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_space_desc').parentElement.style.display = '';
		} else {
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_space').parentElement.style.display = 'none';
			this.abEamAddLocationSb_form.getFieldCell('sb_summarize_space_desc').parentElement.style.display = 'none';
		}

		// get current locations
		// for space 
		try{
			var restriction = "sb_items.rm_std IS NOT NULL";
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-getExistingLocationsForSpBudget', this.sbName, restriction, this.separator, this.multipleValueSeparator);
			this.currentFloors = result.message;
			this.abEamAddLocationSb_form.setFieldValue('current_locations_rm', this.currentFloors.split(this.multipleValueSeparator).join(', '));
			
			var restriction = "sb_items.eq_std IS NOT NULL";
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-getExistingLocationsForSpBudget', this.sbName, restriction, this.separator, this.multipleValueSeparator);
			this.currentFloorsEq = result.message;
			this.abEamAddLocationSb_form.setFieldValue('current_locations_eq', this.currentFloorsEq.split(this.multipleValueSeparator).join(', '));

			var restriction = "sb_items.fn_std IS NOT NULL";
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-getExistingLocationsForSpBudget', this.sbName, restriction, this.separator, this.multipleValueSeparator);
			this.currentFloorsFn = result.message;
			this.abEamAddLocationSb_form.setFieldValue('current_locations_fn', this.currentFloorsFn.split(this.multipleValueSeparator).join(', '));
			
		} catch(e) {
			Workflow.handleError(e);
			return false
		}
		
	},
	
	abEamAddLocationSb_form_onSave: function(){
		//kb#3048434: if sb.sb_as is NONE, user must choose one option of "Summarize Space From?" because this value is required for WFR.
		var sbAs = this.abEamAddLocationSb_form.getFieldValue('sb.sb_as');
		var sbSummarizeSpaceAs = this.abEamAddLocationSb_form.getFieldValue('sb_summarize_space');
		if ( sbAs==0 ) {
			// if "Summarize Space From?"  is empty then alert and return.
			if (!sbSummarizeSpaceAs)	{
				View.alert(getMessage("emptySbAs"));
				return false;
			} 
			// else save it to sb record
			else {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('sb.sb_name', this.sbName, '=');
				var record = this.abEamAddLocationSb_ds.getRecord(restriction);
				if (record){
					record.setValue("sb.sb_as", sbSummarizeSpaceAs);
					this.abEamAddLocationSb_ds.saveRecord(record);
				}
			}
		}

		try{
			var updateRequirements = this.abEamAddLocationSb_form.getFieldValue('update_requirements') == 'yes';
			var sbSummarize = this.abEamAddLocationSb_form.getFieldValue('sb_summarize');
			var selectedFloors = new Array();
			if(valueExistsNotEmpty(this.abEamAddLocationSb_form.getFieldValue('bl_fl'))){
				selectedFloors = this.abEamAddLocationSb_form.getFieldValue('bl_fl').split(this.multipleValueSeparator);
			}else{
				View.showMessage(getMessage('emptyLocation'));
				return false;
			}
			var createBaselineFor = [];
			var createBaselineForValues = this.abEamAddLocationSb_form.getCheckboxValues('sb_create_for');
			if(createBaselineForValues.join(this.separator).indexOf('all') != -1){
				createBaselineFor = ['eq', 'rm', 'fn'];
			}else {
				createBaselineFor = createBaselineForValues;
			}
			
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-addBaselineLocations', this.sbName, selectedFloors, this.separator, updateRequirements, createBaselineFor, sbSummarize);
			if(result.code == 'executed'){
				if(valueExists(this.callback)){
					this.callback();
				}
				View.closeThisDialog();
				return true;
			}
			
		}catch(e){
			Workflow.handleError(e);
			this.abDefineSb_ds.saveRecord(record);
			return false;
		}
	},
	
	getTreeRestrictionParameter: function(){
		var selectedFloors = "1=1";
		if(valueExistsNotEmpty(this.currentFloors)){
			selectedFloors = this.currentFloors.split(this.separator).join("'${sql.concat}'");
			selectedFloors = "fl.bl_id${sql.concat}fl.fl_id NOT IN ('" + selectedFloors.split(this.multipleValueSeparator).join("', '") + "')";
		}
		return selectedFloors;
	},
	
	getSbItemsRecords: function(sbName){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.sb_name', sbName, '=');
		
		var params = {
				tableName: 'sb_items',
				fieldNames: toJSON(['sb_items.sb_name', 'sb_items.auto_number', 'sb_items.bl_id', 'sb_items.fl_id']),
				restriction: toJSON(restriction)
		};
		try {
			var result = Workflow.call('AbCommonResources-getDataRecords', params);
			if (result.code == 'executed') {
				return result.dataSet.records;
			} 
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	abEamAddLocationSb_form_sb_create_for_onClick: function(input){
		if (input.target.value == 'all') {
			this.abDefineSb_form.setCheckbox('sb_create_for', 'rm', input.target.checked);
			this.abDefineSb_form.setCheckbox('sb_create_for', 'eq', input.target.checked);
			this.abDefineSb_form.setCheckbox('sb_create_for', 'fn', input.target.checked);
		}
	},
	
	enableField: function(fieldName, enabled){
		var inputEl = document.getElementsByName(fieldName);
		for(var i = 0; i < inputEl.length; i++){
			inputEl[i].disabled = !enabled;
		}
	},
	
	showSelected: function () {
		var selectedBlFl = this.abEamAddLocationSb_form.getFieldValue('bl_fl');
		if (valueExistsNotEmpty(selectedBlFl)) {
			var selectedFloors = selectedBlFl.split(this.multipleValueSeparator);
			for (var i = 0; i < selectedFloors.length; i++) {
				var selectedNode = selectedFloors[i].split(this.separator);
	            this.expandNodes(this.abEamAddLocationBlTree, selectedNode[0], selectedNode[1]);
	        }
		}
	},
	
	expandNodes: function (treePanel, blId, flId) {
		var rootNode = treePanel.treeView.getRoot();
        for (var i = 0; i < rootNode.children.length; i++) {
        	var blNode = rootNode.children[i];
        	if (blNode.data["bl.bl_id"] == blId) {
        		if (valueExistsNotEmpty(flId)) {
        			if (!blNode.expanded) {
        				blNode.expand();
        				this.checkSelectedFloor.defer(500, this, [blNode, flId]);
        			}
        		}
        	}
        }
	},
	
	checkSelectedFloor: function (blNode, flId) {
		for (var j = 0; j < blNode.children.length; j++) {
			var flNode = blNode.children[j];
			if (flNode.data["fl.fl_id"] == flId) {
				flNode.setSelected(true);
				break;
			}
		}
	},
	
	setTreeRestriction: function(){
		// get selected asset types
		var createBaselineForValues = this.abEamAddLocationSb_form.getCheckboxValues('sb_create_for');
		var selectedFloors = "";
		for (var i = 0; i < createBaselineForValues.length; i++ ) {
			if (createBaselineForValues[i] == 'rm') {
				selectedFloors  += (valueExistsNotEmpty(selectedFloors)?"'${sql.concat}'": "") + this.currentFloors.split(this.separator).join("'${sql.concat}'");
			} else if (createBaselineForValues[i] == 'eq') {
				selectedFloors  += (valueExistsNotEmpty(selectedFloors)?"'${sql.concat}'": "") + this.currentFloorsEq.split(this.separator).join("'${sql.concat}'");
			} else if (createBaselineForValues[i] == 'fn') {
				selectedFloors  += (valueExistsNotEmpty(selectedFloors)?"'${sql.concat}'": "") + this.currentFloorsFn.split(this.separator).join("'${sql.concat}'");
			}
		}
		if (valueExistsNotEmpty(selectedFloors)) {
			selectedFloors = "fl.bl_id${sql.concat}fl.fl_id NOT IN ('" + selectedFloors.split(this.multipleValueSeparator).join("', '") + "')";
		}else{
			selectedFloors = "1=1"
		}
		this.abEamAddLocationBlTree.addParameter('filter', selectedFloors);
	}
});
