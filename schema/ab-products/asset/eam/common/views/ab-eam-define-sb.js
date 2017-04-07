var abEamDefSbController = View.createController('abEamDefSbController', {
	
	callback: null,
	
	sbName: null,
	sbType: null,
	
	separator: '- \u200C',
	
	multipleValueSeparator: Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
	
	// array with assigned building and floors
	selectedFloors: null,
	
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
        'click input[type=radio]': function(input) {
            if (input.currentTarget.name === 'abDefineSb_form_sb_summarize_level') {
                this.abDefineSb_form_sb_summarize_level_onClick(input);
            }
        },
        'click input[type=checkbox]': function(input) {
            if (input.currentTarget.name === 'abDefineSb_form_sb_create_for') {
                this.abDefineSb_form_sb_create_for_onClick(input);
            }
        }
    },
	
	afterViewLoad: function(){
		if (valueExists(View.parameters)) {
			if (valueExists(View.parameters.callback)) {
				this.callback = View.parameters.callback;
			}
			if (valueExists(View.parameters.fieldDefs)) {
				this.fieldDefs = View.parameters.fieldDefs;
			}
		}
		
		this.abDefineSbBlTree.setMultipleSelectionEnabled(0);
		this.abDefineSbBlTree.setMultipleSelectionEnabled(1);
		this.abDefineSbBlTree.addEventListener('onChangeMultipleSelection', this.onChangeNodesSelection.createDelegate(this));
	},
	
	afterInitialDataFetch: function(){
		if(valueExistsNotEmpty(this.sbName)){
			this.abDefineSb_form.refresh(new Ab.view.Restriction({'sb.sb_name': this.sbName}));
		}
		//kb#3049178: user can only select but not input value
		this.abDefineSb_form.enableField("bl_fl", false);
		this.abDefineSb_form.enableFieldActions('bl_fl', true);
		
		// show hide fields
		if (valueExists(this.fieldDefs['sb_create_for'])) {
			for (var i = 0; i < this.fieldDefs['sb_create_for'].values.length; i++ ) {
				this.abDefineSb_form.setCheckbox('sb_create_for', this.fieldDefs['sb_create_for'].values[i], true);			
			}
			// cannot hide checkbox using form.showField
			//this.abDefineSb_form.showField('sb_create_for', this.fieldDefs['sb_create_for'].visible);
			//this.abDefineSb_form.showField('vf_sb_create_for_desc', this.fieldDefs['sb_create_for'].visible);
			if (!this.fieldDefs['sb_create_for'].visible) {
				var objColl = document.getElementsByName('abDefineSb_form_sb_create_for');
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
	
	abDefineSb_form_afterRefresh: function(){
		//make bl_fl field noneditable
		var blFlField = this.abDefineSb_form.fields.get('bl_fl');
		if(blFlField){
			blFlField.dom.readOnly = true;
			blFlField.dom.className = 'inputField_cell';
		}
		if(this.abDefineSb_form.newRecord){
			this.abDefineSb_form.setTitle(getMessage('titleAddSb'));
		}else{
			this.abDefineSb_form.setTitle(getMessage('titleAddSb'));
			//this.abDefineSb_form.setTitle(getMessage('titleEditSb'));
		}
		if(valueExists(this.abDefineSb_form.restriction)){
			var clause = this.abDefineSb_form.restriction.findClause('sb.sb_name');
			if(clause) {
				this.sbName = clause.value;
				this.abDefineSb_form.setFieldValue('sb.sb_name', this.sbName);
			}
		}

		var recPortfolioScenario = getPortfolioScenario(this.sbName);
		var pfScnLevel = recPortfolioScenario.getValue('portfolio_scenario.scn_level');
		if(valueExistsNotEmpty(pfScnLevel)){
			this.abDefineSb_form.setFieldValue('sb_summarize_level', pfScnLevel);
			this.abDefineSb_form_sb_summarize_level_onClick();
			this.enableField('abDefineSb_form_sb_sb_summarize_level', false);
		} else if (valueExists(this.abDefineSb_form.getFieldValue('sb.sb_level'))){
			this.abDefineSb_form.setFieldValue('sb_summarize_level', this.abDefineSb_form.getFieldValue('sb.sb_level'));
		}
		if(valueExists(this.abDefineSb_form.getFieldValue('sb.sb_as'))){
			this.abDefineSb_form.setFieldValue('sb_summarize_space', this.abDefineSb_form.getFieldValue('sb.sb_as'));
		}

		if(valueExists(this.abDefineSb_form.getFieldValue('sb.sb_from'))){
			if(this.abDefineSb_form.getFieldValue('sb.sb_from') == 'em'){
				this.abDefineSb_form.setFieldValue('sb_summarize_space', 'hc');
			} else{
				this.abDefineSb_form.setFieldValue('sb_summarize_space', 'ar');
			}
		}

		var records = this.abDefineSbActivityLog_ds.getRecords(new Ab.view.Restriction({'activity_log.project_id': this.sbName}));
		this.selectedFloors = [];
		for( var i = 0; i< records.length; i++){
			var record = records[i];
			var blId = record.getValue('activity_log.bl_id');
			var flId = record.getValue('activity_log.fl_id');
			if(valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)){
				this.selectedFloors.push(blId + this.separator + flId);
			}
		}
		this.abDefineSb_form.setFieldValue('bl_fl', this.selectedFloors.join(this.multipleValueSeparator));

		// Added for 22.1 Space Requirements, By ZY 
		if ( View.getOpenerView() && View.getOpenerView().controllers.get('abAllocDefSpReqSelCtrl') ) {
			this.initialFormForDefineSpaceRequirement();	
		} 
	},
	
	initialFormForDefineSpaceRequirement: function(){
		// set proper title and help texts 
		var parentCtrl = View.getOpenerView().controllers.get('abAllocDefSpReqSelCtrl'); 
		var texts = parentCtrl.texts; 
		this.sbType = parentCtrl.sbType; 
		this.abDefineSb_form.setTitle(texts.newTitle);
		$('sb_name_desc').innerHTML = "";
		$('sb_summarize_level_desc').innerHTML = texts.helpTextForLevel;
		$('sb_summarize_desc').innerHTML = texts.helpTextForAlloc;
		$('bl_fl_desc').innerHTML = texts.helpTextForLoc;

		//clear pre-set field values
		this.selectedFloors = [];
		this.abDefineSb_form.setFieldValue('bl_fl', '');
		
		//show and enable field "sb_name"
		$('abDefineSb_form_sb.sb_name').type='text';
		$('abDefineSb_form_sb.sb_name_labelCell').innerHTML=($('abDefineSb_form_sb.sb_name_labelCell').innerHTML + "<span  id='sb.sb_name.required_star' name='sb.sb_name.required_star' class='required'>*</span>"); 
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
		var blFl = this.abDefineSb_form.getFieldValue('bl_fl');
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
		this.abDefineSb_form.setFieldValue('bl_fl', floors.join(this.multipleValueSeparator));
	},
	
	abDefineSb_form_onSave: function(){
		var controller = this;
		if (this.canSave()) {
			try{
				var sbSummarizeAllocation = controller.abDefineSb_form.getFieldValue('sb_summarize');
				var selectedFloors = new Array();
				if(valueExistsNotEmpty(controller.abDefineSb_form.getFieldValue('bl_fl'))){
					selectedFloors = controller.abDefineSb_form.getFieldValue('bl_fl').split(controller.multipleValueSeparator);
				}
				var sbName = ( controller.sbName==null ? controller.abDefineSb_form.getFieldValue('sb.sb_name') : controller.sbName );
				var separator = controller.separator;

				var createBaselineFor = [];
				var createBaselineForValues = controller.abDefineSb_form.getCheckboxValues('sb_create_for');
				if(createBaselineForValues.join(separator).indexOf('all') != -1){
					createBaselineFor = ['eq', 'rm', 'fn'];
				}else {
					createBaselineFor = createBaselineForValues;
				}
				
				
				var record = new Ab.data.Record({
					'sb.sb_name': sbName,
					'sb.sb_desc': controller.abDefineSb_form.getFieldValue('sb.sb_desc'), 
					'sb.sb_level': controller.abDefineSb_form.getFieldValue('sb_summarize_level'),
					'sb.sb_type': (this.sbType ? this.sbType : 'Space Requirements'),
					'sb.sb_as': controller.abDefineSb_form.getFieldValue('sb_summarize_space'),
					'sb.sb_from': controller.abDefineSb_form.getFieldValue('sb_summarize_space') == 'hc'?'em':'rm',
				}, controller.abDefineSb_form.newRecord);
				
				var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-createBaseline', record,createBaselineFor, sbSummarizeAllocation, selectedFloors, separator);
				if(result.code == 'executed'){
					if (valueExists(this.callback)) {
						this.callback(sbName);
					} else {
						View.closeThisDialog();
						return true;
					}
				}
				
			}catch(e){
				Workflow.handleError(e);
				this.abDefineSb_ds.saveRecord(record);
				return false;
			}
			
		}
	},
	// validate form settings
	canSave: function(){
		var canSave = true;
		this.abDefineSb_form.clearValidationResult();
		var fields = ['sb_summarize_level', 'sb_summarize', 'sb_summarize_space'];
		for(var i=0; i < fields.length; i++){
			var value = this.abDefineSb_form.getFieldValue(fields[i]);
			if(!valueExistsNotEmpty(value)){
				canSave = false;
				this.abDefineSb_form.addInvalidField(fields[i], '');
				this.abDefineSb_form.validationResult.valid = false;
				this.abDefineSb_form.validationResult.message = Ab.form.Form.z_MESSAGE_INVALID_FIELD;
			}
		}
		if(!canSave){
			this.abDefineSb_form.displayValidationResult();
		}
		return canSave;
	},
	
	abDefineSb_form_sb_summarize_level_onClick: function(input){
		var enabled = true;
		if(this.abDefineSb_form.getFieldValue('sb_summarize_level') == 'fg'){
			this.abDefineSb_form.setFieldValue('sb_summarize', 'fl');
			enabled = false;
		}
		this.enableField('abDefineSb_form_sb_summarize', enabled);
	},
	
	abDefineSb_form_sb_create_for_onClick: function(input){
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
	
	selectTreeNodes: function(){
		var selectedNodes = this.abDefineSb_form.getFieldValue('bl_fl').split(this.multipleValueSeparator);
		for(var i=0; i < this.abDefineSbBlTree.treeView._nodes.length; i++){
			var node = this.abDefineSbBlTree.treeView._nodes[i];
			if(node.level.levelIndex == 1){
				var nodeData = node.data['fl.bl_id.key'] + this.separator + node.data['fl.fl_id.key'];
				if(selectedNodes.indexOf(nodeData) != -1){
					node.setSelected(true);
				}
			}
		}
	},
	
	showSelected: function () {
		var selectedBlFl = this.abDefineSb_form.getFieldValue('bl_fl');
		if (valueExistsNotEmpty(selectedBlFl)) {
			var selectedFloors = selectedBlFl.split(this.multipleValueSeparator);
			for (var i = 0; i < selectedFloors.length; i++) {
				var selectedNode = selectedFloors[i].split(this.separator);
	            this.expandNodes(this.abDefineSbBlTree, selectedNode[0], selectedNode[1]);
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
	}
});

function afterGeneratingTreeNode(node){
	var selectedFloors = View.controllers.get('abEamDefSbController').selectedFloors;
	var separator = View.controllers.get('abEamDefSbController').separator;
	if (node.level.levelIndex == 1) {
		var currentNode = node.data['fl.bl_id.key'] + separator + node.data['fl.fl_id.key'];
		if (selectedFloors.length > 0 
				&& selectedFloors.indexOf(currentNode) != -1) {
			node.setSelected(true);
		}
	}
}

// expand entire tree
function expandTree(){
	View.panels.get('abDefineSbBlTree').expand();
}

function selectNodes(){
	var controller = View.controllers.get('abEamDefSbController');
	controller.selectTreeNodes();
}

/**
 * Get portfolio scenario record
 * @param sbName project name
 * @returns record object
 */
function getPortfolioScenario(sbName){
	var params = {
			tableName: 'portfolio_scenario',
			fieldNames: toJSON(['portfolio_scenario.description', 'portfolio_scenario.portfolio_scenario_id', 'portfolio_scenario.scn_name',  'portfolio_scenario.scn_level']),
			restriction: toJSON({
				'portfolio_scenario.scn_name': sbName
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}


function onSelectCheckbox(context){
	alert(context);
}