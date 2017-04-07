/**
 * 
 * Example for building NB model to be used by space management case.
 */
var bimViewerController = View.createController('bim3dNavigator', {
	bim3d: null,
	images: [],
	selectedFloorRow: null,
	openedInfo:null,
	currentBuilding: null,
	currentHighlightDS: null,
	currentLabelDS: null,
	floorsSelectorPanel: null,
	openedLevelCodes: null,
	
	afterViewLoad: function() { 
		var scope = this;
		this.openedInfo = {};
		this.openedLevelCodes = {};
		
		//create 3d navigator object
		this.bim3d = new Ab.bim3d.Navigator('bim3d');
		
		//create isolate, highlight, label and  plan type selectors
		var titleDiv = document.getElementById('panelHtml_title');
		Ab.bim3d.Utility.appendSelector(titleDiv, 'isolate', "Isolates:", '', [new Option('Highlight', 'Highlight'), new Option('Rooms', 'Rooms'), new Option('Furniture', 'Furniture'), new Option('Selected', 'Selected')], this.isolate.bind(this));
		Ab.bim3d.Utility.appendSelector(titleDiv, 'hilite', "Highlights:", 'DrawingControlHighlight', null,  this.dataSourceUpadte.bind(this));
		Ab.bim3d.Utility.appendSelector(titleDiv, 'labels', "Labels:", 'DrawingControlLabels', null, this.dataSourceUpadte.bind(this));
		{
			//add plan type selector
			var planTypeOptions = [], planTypes=[];
			var dataSource = View.dataSources.get('planTypeGroupsDs');
			var records = dataSource.getRecords(), record;
			for(var i=0, ln=records.length; i<ln; i++){
				record = records[i];
				planTypeOptions.push(new Option(record.getValue('active_plantypes.title'), record.getValue('plantype_groups.plan_type')));
				planTypes.push({id: record.getValue('plantype_groups.plan_type'), view_file: record.getValue('active_plantypes.view_file'), hs_ds:  record.getValue('active_plantypes.hs_ds'), label_ds: record.getValue('active_plantypes.label_ds')});
			}
			Ab.bim3d.Utility.appendSelector(titleDiv, 'planTypes', "Plan Types:", '', planTypeOptions, this._doPlanType.bind(this, planTypes));

		}
	
		//categories panel
		this.bim3d.setSuperCategories([{title:'Exterior/Core', name:'Exterior', superCategories:[ {title:'Site', name: 'Site', codes:['Topography','Site','Roads','Parking', 'Property Lines','Pads'], json:'{building}-site'}, {title:'Shell',  name: 'Shell', codes:['Roofs','Walls','Curtain Panels', 'Doors'], functions:['Exterior', 'Foundation', 'Retaining', 'Coreshaft'], json:'null'}, {title:'Core',  name: 'Core',  codes:['Floors','Stairs','Railings','Ceilings'], json:'null'}]},  
		             {title:'Disciplines',  name: 'Disciplines', superCategories:[{title:'HVAC',  name: 'HVAC',   codes:['Ducts','Duct Fittings','Duct Systems','Flex Ducts','Air Terminals','Mechanical Equipment'], json:'{building}-hvac'},{title:'Piping', name: 'Piping',   codes:['Flex Pipes','Piping Systems','Plumbing','Plumbing Fixtures', 'Pipe Accessories', 'Pipe Fittings', 'Pipes'], json:'{building}-plumbing'}]},
	 	             {title:'Floor Elements', name: 'Floor',  superCategories:[{title:'Interior Walls',  name: 'Interior Walls',   codes:['Walls'], functions:['Interior'], dual:'true', json:''}, {title:'Floors',  name: 'Floors',  dual:'true',  codes:['Floors'], functions:['Interior'], json:''}, {title:'Ceilings', name: 'Ceilings', dual:'true',  codes:['Ceilings'], functions:['Interior'], json:''} , {title:'Curtain Panels',  name: 'Curtain Panels',  codes:['Curtain Panels'], functions:['Interior'], dual:'true', json:''} , {title:'Doors',  name: 'Doors',  codes:['Doors'], functions:['Interior'], dual:'true', json:''}, {title:'Lighting',  name: 'Lighting',  codes:['Lighting Devices', 'Lighting Fixtures', 'Electrical Fixtures'], dual:'false', functions:['Interior'],json:'{building}-lighting'}]},
	 	             {title:'Assets',  name:'Assets', superCategories:[{title:'Rooms',   name: 'Rooms', codes:['Rooms'], functions:['Interior'],json:''},{title:'Equipment',    name: 'Equipment', codes: ['Fire Alarm Devices','Security Devices', 'Specialty Equipment' ], functions:['Interior'], json:''},{title:'Furniture',  name: 'Furniture',  codes: ['Furniture'], functions:['Interior'], json:''}]}
	 	            ]);
	
		//register JS events: name and event call 
		this.on('app:bim:example:addFloorPlan', this.loadFloorPlan);
	    this.on('app:bim:example:selectRoom', this.selectRoom);
	    //bim space console 
	    this.on('app:space:express:console:bim:updateHighlight', this.updateHighlight);
	        
		var scope = this;
	
		//update json file name macros at runtime - important call!!!
		scope.bim3d.categoriesPanel.setClickListener(function(link, name, jsonObj, levelsObj, panel){
			if(typeof jsonObj !== 'undefined' && jsonObj !== null && jsonObj.json !== 'null' && jsonObj.json !== ''){
				jsonObj.json = jsonObj.json.replace('{building}', scope.currentBuilding);
			}
			
			//if synch Core and dual visibility Floors and Ceilings  
			if(name === 'Core'){
				scope.bim3d.categoriesPanel.changeLinkStatusById('Floors', link.className === 'active');
				scope.bim3d.categoriesPanel.changeLinkStatusById('Ceilings', link.className === 'active');
			}

			//get opened levels for the navigator if users click any items over Floor Elements and Assets
			if(link.name.indexOf('Floor') >=0  || link.name.indexOf('Assets') >=0 ){
				var row, rows = scope.floorsSelectorPanel.rows, levelCodes=[];
				for(var i=0, ln=rows.length; i<ln; i++){
					row = rows[i];
					if(row.row.isSelected()){
						levelCodes.push(scope.openedLevelCodes[row['rm.fl_id']]);
					}
				}
				levelsObj.levels = levelCodes;
			}
			
			if(link.id.indexOf('Lighting') >=0 && jsonObj !== null && jsonObj.json !== 'null' && jsonObj.json !== ''){
				panel.setJsonLoadListener(function(scenes, json, type, codes, functions, levels, show){
					scope.bim3d.showCategories(scope.bim3d.categoriesPanel.getAllCategoryCodes(true), levels, true, true, true, scenes);
				});
			}
		});
		
		
		//listener for context menu click event
		scope.bim3d.contextMenus.setClickListener(function(actionId){
			 if(actionId.indexOf('clearSelection') >= 0 ){
				 scope.closeRmDetailReportDialog();
			 }
		});
		
		//disable some context menu
		this.bim3d.contextMenus.setFilter(['hideSelected', 'hideSimilar', 'showAll']);
		
		//demo only, add custom context menus and make them show or hide depending on selected object's type
		this.bim3d.contextMenus.setShowListener(function(menus){
			//add custom menus based on object selection
			var asset = scope.bim3d.getSelectedObjectAssetType();
			var primaryKey = scope.bim3d.getSelectedObjectPrimaryKey();
			if(primaryKey){
				primaryKey = primaryKey.split(';');
				if(asset ==='rm'){
					menus.push(null);
					menus.push( {label:'Show Room Contents', id:'showroomcontents_rm', actions:[function() {
                		 var url = 'ab-revit-overlay-rm.axvw?fieldName=rm.bl_id&fieldValue='+primaryKey[0]+'&fieldName2=rm.fl_id&fieldValue2='+primaryKey[1]+'&fieldName3=rm.rm_id&fieldValue3='+primaryKey[2];
                		 View.openDialog(url, '', false, {width : 1200, height : 800});
                		 //window.open(url, '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=600,height=600');
	                 }]});
					menus.push(null);
					menus.push( {label:'Reserve Room', id:'reserveroom_rm', actions:[function() {
                		 var url = 'ab-rr-add-room-reservation.axvw?bl.bl_id='+primaryKey[0] + '&fl.fl_id='+primaryKey[1] + '&rm.rm_id='+primaryKey[2];
                		 View.openDialog(url, '', false, {width : 1200, height : 800});
                		 //window.open(url, '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=600,height=600');
	                 }]});
					menus.push(null);
					 menus.push( {label:'Show Realtime Utilization', id:'showrealtime_rm', actions:[function() {
	                        var url = 'ab-sp-rpt-util-by-loc.axvw?bl.bl_id='+primaryKey[0] + '&fl.fl_id='+primaryKey[1] + '&rm.rm_id='+primaryKey[2];
	                        View.openDialog(url, '', false, {width : 1200, height : 800});
	                 //window.open(url, '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=600,height=600');
	                  }]});

				}else if(asset ==='eq'){
					menus.push(null);
					menus.push( {label:'Show Equipment Information', id:'ShowEquipmentSystemInformation_eq', actions:[function() { 
                		 var url = 'ab-eq-system-console.axvw?eq.eq_id='+primaryKey[0];
                		 View.openDialog(url, '', false, {width : 1200, height : 800});
                		 //window.open(url, '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=600,height=600');
	                 }]} );
					menus.push(null);
					menus.push( {label:'Create Work Request', id:'CreateWorkRequest_eq', actions:[function() { 
                		 var url = 'ab-bldgops-console-wr-create.axvw?eq.eq_id='+primaryKey[0];
                		 View.openDialog(url, '', false, {width : 1200, height : 800});
                		 //window.open(url, '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=600,height=600');
	                 }]} );
			    }
			}
		});
		
		
		//disable viewer control's click or double click
		this.bim3d.setObjectDoubleClickable(false);
		//this.bim3d.setObjectClickable(false);
    		
		this.panelHtml.setContentPanel(Ext.get('bim3d'));
		
		//html panel resize
		this.panelHtml.syncHeight = function(){
			scope.bim3d.resize();
		}
    },
    
    closeRmDetailReportDialog: function(){
    	var reportView = View.panels.get("rm_detail_report");
    	if(reportView){
    		reportView.closeWindow();
    	}
    },
    
    selectRoom: function(row){
    	this.closePropertiesPanel();
    	var scope = this;
    	var pkValue = row['rm.bl_id'] + ';' + row['rm.fl_id'] + ';' + row['rm.rm_id'];
    	//set selected object
    	scope.bim3d.getObjectByPrimaryKey(pkValue, function(object){
    		//select
    		scope.bim3d.select(object.id);
    		scope.bim3d.render();
    		//zoom in
    		//scope.bim3d.home();
    		//scope.bim3d.zoomIn(object);
    	});
    	//open rm_detail_report
    	var reportView = View.panels.get("rm_detail_report");
     	
     	var restriction = new Ab.view.Restriction();
     	restriction.addClause('rm.bl_id', row['rm.bl_id'] );
        restriction.addClause('rm.fl_id', row['rm.fl_id']);
        restriction.addClause('rm.rm_id', row['rm.rm_id']);
     	
     	reportView.refresh(restriction);
     	reportView.showInWindow({title:'Selected Detail', modal: false,collapsible: false, maximizable: false, width: 300, height: 200, autoScroll:false});
    	
    },
    
 	/**
 	 * called by isolate selector
 	 */
 	isolate: function(e, combo){
 		var scope = this;
 		var value = combo.value;
 		switch(value) {
	 	    case 'None':
	 	    	scope.bim3d.clearIsolated();
	 	        break;
	 	    case 'Highlight':
	 	    	scope.bim3d.isolateByMaterial('ab-highlight');
	 	    	break;
	 	    case 'Furniture':
	 	    	scope.bim3d.isolate([value]);
	 	    	break;
	 	   case 'Rooms':
	 	    	scope.bim3d.isolate([value]);
	 	    	break;
	 	   case 'Selected':
	 		  scope.bim3d.isolateByMaterial('ab-selection');
	 	    	break;
	 	    default:
	 	       //do nothing
 		} 
 	},
 	
 	/**
 	 * called by highlight and label selectors
 	 */
 	dataSourceUpadte: function(e, combo){
 		var scope = this;
 		var tmp = combo.value;
 		if (combo.id.lastIndexOf('hilite') >= 0) {
			if (tmp === scope.currentHighlightDS){
				return;
			}
			scope.currentHighlightDS = tmp;
			if(scope.selectedFloorRow === null){
	 			return;
	 		}
			if(tmp === 'None'){
				scope.bim3d.clearHighlight(true);
				return;
			}
			if(scope.currentHighlightDS !== null){
				//clear before highlighting
				scope.bim3d.clearHighlight(true);
			}
			var restriction = new Ab.view.Restriction();
	     	restriction.addClause('rm.bl_id', scope.selectedFloorRow['rm.bl_id'] );
	     	//highlight objects
	     	scope.bim3d.thematicHighlight('rm', 'ab-ex-bim-3d-rm-example-navigator.axvw', scope.currentHighlightDS, toJSON(restriction), null);
			
 		}else if (combo.id.lastIndexOf('labels') >= 0) {
	    	if (tmp === this.currentLabelsDS){
	    		return;
	    	}
	    	scope.currentLabelDS = tmp;
	    	if(scope.selectedFloorRow === null){
	 			return;
	 		}
	    	
	    	if(tmp === 'None'){
				scope.bim3d.clearLabels();
				scope.bim3d.render();
				return;
			}
	    	
	    	if(scope.currentLabelDS !== null){
				//clear before labeling
				scope.bim3d.clearLabels();
			}
	    	//label objects
	    	scope._labeling();
 		}
 	},
 	
 	//called by plan type selector
 	_doPlanType: function(planTypes, e, combo){
 		var scope = this;
 		if(scope.selectedFloorRow === null){
			return;
		}
		if(combo.value === 'None'){
			scope.bim3d.clearLabels();
			scope.bim3d.clearHighlight(true);
			return;
		}
		for(var i=0, ln=planTypes.length; i<ln; i++){
			if(combo.value === planTypes[i].id){
				scope.bim3d.startSpinning();
				var restriction = new Ab.view.Restriction();
		     	restriction.addClause('rm.bl_id', scope.selectedFloorRow['rm.bl_id'] );
		     	//highlight objects
		     	scope.bim3d.thematicHighlight('rm', planTypes[i].view_file, planTypes[i].hs_ds, toJSON(restriction), null);
		     	//get label dataSource object
		     	var labelDS = Ab.data.loadDataSourceFromFile(planTypes[i].view_file, planTypes[i].label_ds);
		     	scope.bim3d.clearLabels();
		     	scope._doLabeling(labelDS);
				break;
			}
		}
 	},
 	
 	//label 3D objects
 	_labeling: function(){
 		this.bim3d.startSpinning();
 		var labelDSObj  = View.dataSources.get(this.currentLabelDS);
    	this._doLabeling(labelDSObj );
 	},
 	_doLabeling(labelDSObj){
 		var scope = this;
 		var fieldNames = labelDSObj.fieldDefs.keys;
    	for(var i=fieldNames.length - 1; i>=0; i--){
    		if(fieldNames[i].indexOf('.bl_id') > 0 || fieldNames[i].indexOf('.fl_id') > 0){
    			fieldNames.splice(i, 1);
    		}
    	}
 		var restriction = new Ab.view.Restriction();
    	restriction.addClause('rm.bl_id', scope.selectedFloorRow['rm.bl_id'], '=');
    	var records = labelDSObj.getRecords(restriction);
    	if(records.length === 0){
    		//clear labels
    		scope.bim3d.clearLabels();
    		return;
    	}
    	var record, labels={};
    	for(var i=0, ln=records.length; i<ln; i++){
    		record = records[i];
    		var value='';
    		for(var j=0, lj=fieldNames.length; j<lj; j++){
    			value += record.getValue(fieldNames[j]);
    			if(j !== lj - 1){
    				value += '\n';
    			}
    		}
    		
    		labels[record.getValue('rm.bl_id') +';'+ record.getValue('rm.fl_id') +';'+  record.getValue('rm.rm_id')] = value;
    	}
    	if(Object.keys(labels).length > 0){
    		//add labels to the navigator, the labels will be displayed
    		scope.bim3d.addLabels('Rooms', labels, function(){
    			scope.bim3d.stopSpinning();
    		});
    	}else{
    		scope.bim3d.stopSpinning();
    	}
    	labels = null;
 	},

 	
 	_getSelectedFloorSelectPanelRestriction: function(bl_id, rows, selectedRows){
 		var restriction = new Ab.view.Restriction();
 		restriction.addClause('rm.bl_id', bl_id, '=');
		
		for(var i=0, ln=rows.length; i<ln; i++){
			if(rows[i].row.isSelected()){
				selectedRows.push(rows[i]);
			}
		}
		for(var i=0, ln=selectedRows.length; i<ln; i++){
			if(i === 0){
				restriction.addClause('rm.fl_id', selectedRows[i]['rm.fl_id'], '=', ') AND (');
			}else{
				restriction.addClause('rm.fl_id', selectedRows[i]['rm.fl_id'], '=', 'OR');
			}
		}
		if(selectedRows.length === 0){
			restriction = new Ab.view.Restriction();
			restriction.addClause('rm.bl_id', '', 'IS NULL');
		}
		return restriction;
 	},
 	
 	updateHighlight: function(restriction){
 		var scope = this;
 		var selector = document.getElementById('selector_hilite');
 		if(this.currentBuilding !== null && !restriction.isEmpty()){
 			if(restriction.findClause('rm.dp_id') !== null){
 				//dp
 				selector.value = 'highlightDepartmentsDs';
    			this.currentHighlightDS = 'highlightDepartmentsDs';
 			}else{
 				//dv
 				selector.value = 'highlightDivisionsDs';
    			this.currentHighlightDS = 'highlightDivisionsDs';
 			}
 			scope.bim3d.thematicHighlight('rm', 'ab-ex-bim-3d-rm-example-navigator.axvw', scope.currentHighlightDS,  toJSON(restriction), null);
 		}
 	},
 	
 	/*
 	 * Loads specified floor plan.
 	 * 
 	 * most codes are to synchronize visibilities.
 	 *
 	 */
    loadFloorPlan: function(row, floorsSelectorPanel, dps){
    	var highlightRestriction = new Ab.view.Restriction();
    	highlightRestriction.addClause('rm.bl_id', row['rm.bl_id'], '=');
    	//highlightRestriction.addClause('rm.fl_id', row['rm.fl_id'], '=');
    	var selector = document.getElementById('selector_hilite');
    	if(selector!==null){
			this.currentHighlightDS = selector.value;
		}
    	if(typeof dps !== 'undefined' && dps[0] !== ''){
    		highlightRestriction.addClause('rm.dp_id', dps, 'IN');
    		if(selector!==null){
    			selector.value = 'highlightDepartmentsDs';
    			this.currentHighlightDS = 'highlightDepartmentsDs';
    		}
    	}
    	
    	var rows = floorsSelectorPanel.rows;
    	
    	//get floor drawing name from table afm_dwgs
    	var dwgDatasource  = View.dataSources.get('drawings_ds');
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('afm_dwgs.space_hier_field_values', row['rm.bl_id'] +';'+ row['rm.fl_id'], '=');
    	var record = dwgDatasource.getRecord(restriction);
    	var model_level = record.getValue('afm_dwgs.model_level');
    	if(model_level === null || model_level === ''){
    		row.row.unselect()
    		Ab.view.View.showMessage('error', View.getLocalizedString(this.bim3d.z_MESSAGE_NO_3D_MODEL));
    		return;
    	}
    	
    	if(this.floorsSelectorPanel === null){
    		this.floorsSelectorPanel = floorsSelectorPanel;
    	}
    	
    	this.closeRmDetailReportDialog();
    	this.selectedFloorRow = row;
		{
			//switch building case to un-select the rest
			var selectedBuilding = this.selectedFloorRow['rm.bl_id'];
			for(var i=0, ln=rows.length; i<ln; i++){
				if(rows[i]['rm.bl_id'] !== selectedBuilding){
					rows[i].row.unselect();
				}
			}
		}
		
		var selectedRows = [];
		var restriction =  this._getSelectedFloorSelectPanelRestriction(row['rm.bl_id'], rows, selectedRows);
    	this.trigger('app:bim:rooms:example:openSelectRoomPanel', restriction);
    	
    	var scope = this;
    	var bl_id = row['rm.bl_id'].toLowerCase();
    	var fl_id = row['rm.fl_id'].toLowerCase();
    	
    	 if(scope.currentBuilding !== bl_id){
  		   scope.openedInfo = {};
  		   scope.openedLevelCodes = {};
      	}
      	
      	var excludedCategories = [];
      	if(scope.bim3d.categoriesPanel.isReady()){
      		//all not active categories on categories panel
      		excludedCategories = scope.bim3d.categoriesPanel.getAllCategoryCodes(false);
      	}else{
      		//default
      		excludedCategories = ['Ceilings', 'Floors', 'Curtain Panels', 'Walls', 'Lighting Fixtures', 'Doors'];
      	}
    	
    	
    	//level code from afm_dwgs table
    	this.openedLevelCodes[row['rm.fl_id']] = model_level;
    	var levelCode = model_level.toUpperCase();
    	
		if(bl_id in scope.openedInfo && scope.openedInfo[bl_id].indexOf(fl_id) >=0){
			//floor panel is already loaded
			if(scope.currentHighlightDS !== null){
				if(scope.currentHighlightDS !== 'None'  && scope.currentHighlightDS !==''){
					//highlight based on if highlight selector
					scope.bim3d.thematicHighlight('rm', 'ab-ex-bim-3d-rm-example-navigator.axvw', scope.currentHighlightDS,  toJSON(highlightRestriction), null);
				}
			}

			//show or hide the level
			if( !row.row.isSelected()){
				excludedCategories = [];
			}
			
			scope.bim3d.showLevel(levelCode, excludedCategories, row.row.isSelected(), true);
			
			return;
		}
    	
    	var dwg_name = record.getValue('afm_dwgs.dwg_name').toLowerCase();
    	if(scope.currentBuilding !== bl_id){
    		//switch building case
    		scope.bim3d.categoriesPanel.clearOpenedJsons();
    		
    		//TODO: tabs bug????
        	this.bim3d.resize(false);
        	
    		//not opened or switched
    		scope.currentBuilding =  bl_id;
    		if(bl_id in scope.openedInfo){
    			//opened before
    			if(scope.currentHighlightDS !== null){
    				//clear before highlighting
    				scope.bim3d.clearHighlight(true);
    			}
    		}
    		
			scope.openedInfo[bl_id] = [fl_id];
			//load shell
			scope.bim3d.load(bl_id+'-shell', true, function(scenes){
				//turn off site from categories panel
				scope.bim3d.categoriesPanel.changeLinkStatusById('Site', false);
				//if shell is turn off from categories panel, hide shell
				if(!scope.bim3d.categoriesPanel.changeLinkStatusById('Shell')){
					scope.bim3d.showCategories(['Roofs','Walls','Curtain Panels', 'Doors'], null, false, false, false, scenes);
				}
				if(scope.bim3d.calls === 1){
					//first time load a building, turn off floor elements from categories panel
					scope.bim3d.categoriesPanel.loopTargetLinks('Floor', function(alink, id){
						alink.className = 'inactive';
				     });
				}
				//load core
				scope.bim3d.load(bl_id+'-core', false, function(scenes){
					//if core is not active, hide it.
					if(!scope.bim3d.categoriesPanel.changeLinkStatusById('Core')){
						scope.bim3d.showCategories(['Floors','Stairs','Railings','Ceilings'], null, false, false, false, scenes);
					}
					//turn off discipline from categories panel
					scope.bim3d.categoriesPanel.loopTargetLinks('Disciplines', function(alink, id){
						alink.className = 'inactive';
				     });
					
					//load the level
					scope.bim3d.load(dwg_name, false, function(scenes){
						if(scope.currentHighlightDS !==null && scope.currentHighlightDS !=='None' && scope.currentHighlightDS !==''){
							//highlight
							scope.bim3d.thematicHighlight('rm', 'ab-ex-bim-3d-rm-example-navigator.axvw', scope.currentHighlightDS,  toJSON(highlightRestriction), null);
						}
						if(scope.currentLabelDS !==null && scope.currentLabelDS !=='None'){
							//labeling: defer a little while so browser can breathe
							scope._labeling.defer(100, scope);
						}
						//show specified level without showing its interior walls, curtain panels and doors.
						scope.bim3d.showLevel(levelCode, excludedCategories, true, true);		
					});
				});
			});
    	}else{
    		//building is already  loaded and the floor plan is not loaded yet
    		var floors = scope.openedInfo[bl_id];
    		if(floors.indexOf(dwg_name) >= 0){
    			//opened
    			//scope.trigger('app:bim:rooms:example:openSelectRoomPanel', row);
    		}else{
    			//not opened
    			floors.push(dwg_name);
    			floors.push(fl_id);
    			//load the level
    			scope.bim3d.load(dwg_name, false, function(scenes){
    				if(scope.currentHighlightDS !==null && scope.currentHighlightDS !=='None'  && scope.currentHighlightDS !==''){
    					scope.bim3d.thematicHighlight('rm', 'ab-ex-bim-3d-rm-example-navigator.axvw', scope.currentHighlightDS,  toJSON(highlightRestriction), null);
					}
    				if(scope.currentLabelDS !==null && scope.currentLabelDS !=='None'){
    					//labeling: defer a little while so browser can breathe
        				scope._labeling.defer(100, scope);
        			}
    				scope.bim3d.showLevel(levelCode, excludedCategories, true, true);
				});
    		}
    	}
    
    },
   
	 closePropertiesPanel: function(object){
		 this.closeRmDetailReportDialog();
		 var legendPanel = View.panels.get("properiesPanel");
		 if(legendPanel.isShownInWindow()){
			 legendPanel.closeWindow();
		 }
	 }
});




