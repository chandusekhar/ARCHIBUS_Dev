/**
 * Controller for Import Room Capcities and Room Types from selected standard spreadsheet file.
 *
 *@author Zhang Yi for 21.2
 */
var spaceExpressImportCategoryType = View.createController('spaceExpressImportCategoryType', {
	
	//current selected standard, 'gsa'/'ipd'/'oscre'/'ficm'
   selectedStandard:null,

	//array of standard button ids
   standardsButtonIds: new Array ('gsa', 'ipd', 'oscre', 'ficm'),

	//used for restrict the second level type nodes of tree
   currentExpandedCategory: null,

	//cache of standard categories record list and types record list read from xlsx files
   cachedStandards: {},

   /**
     * Bind event handlers.
     */
    afterViewLoad: function() {
		//attach the customized afterGetData for manually set data from custom wfr to tree
		this.categoriesTree.addEventListener('afterGetData', this.afterGetData, this);

		//overide the  createRestrictionForLevel function to store the currently expanded category 
		this.categoriesTree.createRestrictionForLevel = function(parentNode, level) {
 			var restriction = null; 			
 			if (level == 1)
				spaceExpressImportCategoryType.currentExpandedCategory = parentNode.data['rmcat.rm_cat'];
 			else 
				spaceExpressImportCategoryType.currentExpandedCategory = null;

 			return restriction;
 		}

	},

    /**
     * Call Workflow rules to import Room Categories and Types.
     */
    categoriesTree_onImport: function() {
		if ( this.selectedStandard ) {
			try {					 
				var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-importRoomCategoryAndType", this.selectedStandard );

	 			if(result.jsonExpression != ""){
	 				var res = eval('('+result.jsonExpression+')');
	 				if(res.isEmpty&&res.isEmpty=="false"){
	 					View.showMessage(getMessage("deleteRmcatAndRmtypeManualLy"));
	 				}else{
	 					this.categoriesTree.refresh();
	 					View.showMessage( getMessage("imported") );
	 				}
	 			}
	 			
			 } catch (e) {
				 Workflow.handleError(e); 
			 }
		} else {
			View.showMessage( getMessage('noneSelect') );
		}
    },

    /**
     * Store current selected standard, 
	 *  preview the data of standard, set button to selected style and show proper instruction text.
     */
    selectStandard: function(standard) {
		this.selectedStandard = standard;
		this.previewStandard();
		this.setSelectedButtonStyle();
		this.setInstructions();
	}, 

    /**
     * Refresh the tree so to load customized data in tree for previewing.
     */
    previewStandard: function() {
		this.categoriesTree.refresh(" 1=0 ");
	},

	/**
	 * Set selected button style when user click one of four standard buttons.
	 */
	setSelectedButtonStyle:function() {
		var defaultColor;
		//firstly get the default color that is for un-selected button
		for (var i=0; i<this.standardsButtonIds.length; i++ ) {
			if ($(this.standardsButtonIds[i]) .style.backgroundColor != "rgb(255, 0, 0)" ){
				   defaultColor = 	 $(this.standardsButtonIds[i]).style.backgroundColor; 
				   break;
			}
		}

		//then go through all buttons to set selected button with red; others with default color.
 		for (var i=0; i<this.standardsButtonIds.length; i++ ) {
			if (this.selectedStandard == this.standardsButtonIds[i]){
				$(this.standardsButtonIds[i]).style.backgroundColor = '#FF0000'	;
			} else{
				$(this.standardsButtonIds[i]).style.backgroundColor =defaultColor ;
			}
		}
	},

	/**
	 * Set instructions according to user's selected standard
	 */
	setInstructions:function() {
		var instructions = '<br/>';
		instructions += getMessage(this.selectedStandard+'1') +  '<br/>';
		instructions += getMessage(this.selectedStandard+'2') +  '<br/>';
		instructions +=  '<br/>';
		instructions += getMessage(this.selectedStandard+'3') +  '<br/>';
		this.standardInfo.setInstructions(instructions);
		//kb 3040012 set the div height larger for the text.
		jQuery("#standardInfo_instructionsText").css("height: 173px")
	},

    /**
     * Custom afterGetData listener, called by the tree after it gets the data from the server. 
	 * Replace Data from Database with Data of selected standard xls file.
	*
     * @param {Object} panel   The tree panel.
     * @param {Object} dataSet The data set recieved from the server.
     */
    afterGetData: function(panel, dataSet) {
		//load categories and types from xlsx file by calling wfr
		this.loadCategoriesAndTypes();
		
		//	get the actual data for showing in tree
		dataSet.records = this.getRecordsForTree(dataSet); 
	},

    /**
     * If the standard is not cached then call WFR 'loadCategoriesAndTypes' to get  categories and types from xlsx file and then store them to cache. 
	*
     * @param {Object} panel   The tree panel.
     * @param {Object} dataSet The data set recieved from the server.
     */
    loadCategoriesAndTypes: function(panel, dataSet) {
		// if find in cache then return it
		if ( this.cachedStandards[this.selectedStandard] )	
			return this.cachedStandards[this.selectedStandard];
		else {
			try {
				var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-loadRoomCategoriesAndTypes", this.selectedStandard );
				if (result && result.dataSet)
					this.cacheResult( result.dataSet );
			 } catch (e) {
				 Workflow.handleError(e); 
			 }
		}
	},

	/**
     * Parse the result and store to cache.
	*
     * @param {Object} dataSet The data set recieved from the server by custom WFR. 
     */
    cacheResult: function(dataSet) {
		//split records to category list and type list
		var catList = [];
		var typeList=[];
		for ( var i=0; i<dataSet.records.length ; i++ ) {
			var fieldValues = dataSet.records[i].localizedValues;
			 //if exists rmtype.rm_type value then must be type record	else be category record
			 if ( !fieldValues['rmtype.rm_type'] ){
				 catList.push(fieldValues);
			 } else {
				typeList.	push(fieldValues); 
			 }
		}
		//store result to cache
		var stdValue = 	 {};
		stdValue['catList'] =  catList;
 		stdValue['typeList'] =  typeList;
		this.cachedStandards[this.selectedStandard] = stdValue;
	},

	/**
     * Return records used in tree.
	*
     * @param {Object} dataSet The data set recieved from the server by custom WFR. 
     */
    getRecordsForTree: function(dataSet) {
		//determine if currently get data for category level or type level by identifying the pks
		var isCategoryLevel;
		var pks =  dataSet.primaryKeyIds;
		if (pks && pks.length==1)
			isCategoryLevel = true;
		else
			isCategoryLevel = false;
		
		if (isCategoryLevel)	{
			return this.getCategories(); 
		} else {
			return this.getTypes(); 
		}
	},

	/**
     * Return category records.
     */
    getCategories: function() {
		var records = [];
		//loop through the returned records and manually construct for tree
		var catList = this.cachedStandards[this.selectedStandard]['catList'];
		for ( var i=0; i<catList.length ; i++ ) {
			var fieldValues = catList[i];
			var newRecord = {};
			newRecord['rmcat.rm_cat.key'] = fieldValues['rmcat.rm_cat']; 
			newRecord['rmcat.rm_cat'] = fieldValues['rmcat.rm_cat']; 
			newRecord['rmcat.description'] = fieldValues['rmcat.description']; 
			records.push(newRecord);
		}
		return records;
	}, 

	/**
     * Return type records filtered by category  that just expanded.
     */
    getTypes: function() {
		var records = [];
		var typeList = this.cachedStandards[this.selectedStandard]['typeList']; 
		//loop through the returned records and manually construct for tree
		for ( var i=0; i<typeList.length ; i++ ) {
			var fieldValues = typeList[i];
			//for type level of tree, also restricted to parent expanded category
			if( this.currentExpandedCategory && this.currentExpandedCategory==fieldValues['rmtype.rm_cat']  ){
				var newRecord = {};
				newRecord['rmtype.rm_cat.key'] = fieldValues['rmtype.rm_cat']; 
				newRecord['rmtype.rm_cat'] = fieldValues['rmtype.rm_cat']; 
				newRecord['rmtype.rm_type.key'] = fieldValues['rmtype.rm_type']; 
				newRecord['rmtype.rm_type'] = fieldValues['rmtype.rm_type']; 
				newRecord['rmtype.description'] = fieldValues['rmtype.description'];
				records.push(newRecord);
			} 
		}
		return records;
	}
});