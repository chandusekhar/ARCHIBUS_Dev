/**
 * 
 * Example for building NB model to be used by Equipment management case.
 */
var bimViewerController = View.createController('bim3dNavigator', {
	bim3d: null,
	selectedFloorRow: null,

	currentBuilding: null,

	afterViewLoad: function() {
		//create 3d navigator object
		this.bim3d = new Ab.bim3d.Navigator('bim3d', null);
		
        this.on('app:bim:eq:example:loadModel', this.loadModel);
        
        /*
        //selectors on panel title bar
    	var titleDiv = document.getElementById('prgForm_instructionsPanel_title');
    	Ab.bim3d.Utility.appendSelector(titleDiv, 'isolate', "Isolates:", '', [new Option('Equipment', 'Equipment')], this.isolate.bind(this));
    	Ab.bim3d.Utility.appendSelector(titleDiv, 'hilite', "Highlights:", 'DrawingControlHighlight', null,  this.dataSourceUpadte.bind(this));
    	Ab.bim3d.Utility.appendSelector(titleDiv, 'labels', "Labels:", 'DrawingControlLabels', null, this.dataSourceUpadte.bind(this));
		*/
      
        //object click event listener to drill down detail report
        this.bim3d.setObjectClickEventListener(this.openEqReport.bind(this));
        
        //disable object double-click event
        this.bim3d.setObjectDoubleClickable(false);
        
        //category panel
        this.bim3d.setSuperCategories([
                                       {title:'Exterior/Core', name:'Exterior', superCategories:[ {title:'Site', name: 'Site', codes:['Topography','Site','Roads','Parking', 'Property Lines','Pads'], json:'{building}-site'}, {title:'Shell',  name: 'Shell', codes:['Roofs','Walls','Curtain Panels', 'Doors'], functions:['Exterior', 'Foundation', 'Retaining', 'Coreshaft'], json:'{building}-shell'}, {title:'Core',  name: 'Core',  codes:['Floors','Stairs','Railings','Ceilings'], json:'{building}-core'}]},
                                       {title:'Disciplines',  name: 'Disciplines', superCategories:[{title:'HVAC',  name: 'HVAC',   codes:['Mechanical Equipment', 'Ducts','Duct Fittings', 'Air Terminals'], json:''}, {title:'Pipes',  name: 'Pipes',   codes:['Flex Pipes','Piping Systems','Plumbing','Plumbing Fixtures', 'Pipe Accessories', 'Pipe Fittings', 'Pipes'], json:'{building}-plumbing'}]}
                                       //,{title:'Assets',  name:'Assets', superCategories:[{title:'Mechanical Equipment',   name: 'MechanicalEquipment', codes:['Mechanical Equipment'], json:''},{title:'Ducts', name: 'Ducts', codes: ['Ducts'],  json:''},{title:'Duct Fittings',  name: 'DuctFittings',  codes: ['Duct Fittings'],  json:''},{title:'Air Terminals',  name: 'AirTerminals',  codes: ['Air Terminals'],  json:''}]}
                  	 	            ]);
        var scope = this;
       //update json file names
        this.bim3d.categoriesPanel.setClickListener(function(link, name, jsonObj){
			if(typeof jsonObj !== 'undefined' && jsonObj !== null && jsonObj.json !== 'null' && jsonObj.json !== ''){
				jsonObj.json = jsonObj.json.replace('{building}', scope.currentBuilding);
			}
		});
        
        //filter out some built-in context menus
        this.bim3d.contextMenus.setFilter(['hideSelected', 'hideSimilar', 'showAll']);
        
    	//html panel resize
		this.prgForm_instructionsPanel.syncHeight = function(){
			scope.bim3d.resize();
		}
    },
    
 	/*dataSourceUpadte: function(e, combo){
 		var scope = this;
 		var tmp = combo.value;
 		if (combo.id.lastIndexOf('hilite') >= 0) {
			if(tmp === 'None'){
				scope.bim3d.clearHighlight(true);
			}else{
				var restriction = new Ab.view.Restriction();
		     	restriction.addClause('eq.bl_id', this.currentBuilding.toUpperCase() );
		     	//highlight
		     	scope.bim3d.thematicHighlight('eq', 'ab-ex-bim-3d-eq-example-navigator.axvw', tmp,  toJSON(restriction), null);
		     
			}
 		}else if (combo.id.lastIndexOf('labels') >= 0) {
 			if(tmp === 'None'){
 				scope.bim3d.clearLabels();
				scope.bim3d.render();
				return;
			}else{
				var labelDSObj  = View.dataSources.get(tmp);
				var fieldNames = [];
		    	var fieldDefs = labelDSObj.fieldDefs;
		    	fieldDefs.each(function(fieldDef) {
		               if(fieldDef.hidden === 'false'){
		            	   fieldNames.push(fieldDef.fullName); 
		               }
		         });
		    	
				var restriction = new Ab.view.Restriction();
		    	restriction.addClause('eq.bl_id', this.currentBuilding.toUpperCase());
		    	var records = labelDSObj.getRecords(restriction);
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
		    		
		    		labels[record.getValue('eq.eq_id') ] = value;
		    	}
		    	if(Object.keys(labels).length > 0){
		    		//label
		    		scope.bim3d.addLabels('Mechanical Equipment', labels);
		    	}
		    	labels = null;
			}
 		}
 	},*/
 	/**
 	 * Isolates equipment in 3d or not.
 	 */
 	/*isolate: function(e, combo){
 		var scope = this;
 		var value = combo.value;
 		switch(value) {
	 	    case 'None':
	 	    	scope.bim3d.clearIsolated();
	 	        break;
	 	  
	 	    case 'Equipment':
	 	    	scope.bim3d.isolate(['Mechanical Equipment']);
	 	    	break;
	 	  
	 	    default:
	 	       //do nothing
 		} 
 	},*/
 	
   /**
    * clicking on a row of model selection panel to load and open its published 3D HVAC. 
    */
    loadModel: function(row){
    	var reportView = View.panels.get("eq_detail_report");
    	if(reportView){
    		reportView.show(false);
    	}
    	
    	var scope = this;
    	var bl_id = row['rm.bl_id'].toLowerCase();
    	
    	if(this.currentBuilding === bl_id){
    		return;
    	}
    	
    	if(this.currentBuilding !== bl_id){
    		scope.bim3d.categoriesPanel.clearOpenedJsons();
    	}
    	
    	this.currentBuilding = bl_id;
    	/*
    	var restriction = new Ab.view.Restriction();
     	restriction.addClause('eq.bl_id', row['rm.bl_id'] );
    	var selector = document.getElementById('selector_hilite');
    	*/
     	//load model's hvac 
		scope.bim3d.load(bl_id+'-hvac', true, function(scenes){
			//if highlight selector is selected, do highlighting
			/*if(selector.value !== 'None' && selector.value !== ''){
				scope.bim3d.thematicHighlight('eq', 'ab-ex-bim-3d-eq-example-navigator.axvw', selector.value,  toJSON(restriction), null);
			}*/
		});
    },
    
	/**
	 * clicking on equipment object in 3d to open its detail report panel
	 */
    openEqReport:  function(id, category, level, assetType, pk, userData){
    	var scope = this;
    	//users click on equipment object to drill down a detail report
    	if(category === 'Mechanical Equipment'){
    		var reportView = View.panels.get("eq_detail_report");
    	    var restriction = new Ab.view.Restriction();
    	    restriction.addClause('eq.eq_id', pk);        	
    	    reportView.refresh(restriction);
    	}else{
    		scope.bim3d.clearSelection();
    	}
    },
    
    /**
     * Prints 3D image in PPT.
     */
    prgForm_instructionsPanel_onPpt: function(){
    	var slides = [];
	    var image = this.bim3d.getImageBytes();
	    
		slides.push({'title': 'Equipment 3D','images':[image]});  
		
		var me = this;
		var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
   	 	View.openJobProgressBar("Please wait...", jobId, null, function(status) {
	   		var url  = status.jobFile.url;
   			//window.location = url;
	   		window.open(url);
   			//me.bim3d.isClearAll=true;
	   	}); 
    }
});
