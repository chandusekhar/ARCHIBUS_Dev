/**
 * Example for building NB model.
 */
var bimViewerController = View.createController('bim3dNavigator', {
	bim3d: null,
	images: [],
	bl_id: 'nb', //change value for different model
	
	afterViewLoad: function() { 
		var scope = this;
		this.bim3d = new Ab.bim3d.Navigator('bim3d');
		
		this.bim3d.setSuperCategories([{title:'Exterior/Core', name:'Exterior', superCategories:[ {title:'Site', name: 'Site', codes:['Topography','Site','Roads','Parking', 'Property Lines','Pads'], json:''}, {title:'Shell',  name: 'Shell', codes:['Roofs','Walls','Curtain Panels', 'Doors'], functions:['Exterior', 'Foundation', 'Retaining', 'Coreshaft'], json:''}, {title:'Core',  name: 'Core',  codes:['Floors','Stairs','Railings','Ceilings'], json:''}]},                  
		          	 	             {title:'Disciplines',  name: 'Disciplines', superCategories:[{title:'HVAC',  name: 'HVAC',   codes:['Ducts','Duct Fittings','Duct Systems','Flex Ducts','Air Terminals','Mechanical Equipment'], json: this.bl_id+'-hvac'},{title:'Piping', name: 'Piping',   codes:['Flex Pipes','Piping Systems','Plumbing','Plumbing Fixtures', 'Pipe Accessories', 'Pipe Fittings', 'Pipes'], json:this.bl_id+'-plumbing'}, {title:'Lighting',  name: 'Lighting',  codes:['Lighting Devices', 'Lighting Fixtures', 'Electrical Fixtures'], dual:'true', functions:['Interior'],json:this.bl_id+'-lighting'}]},
		          	 	             {title:'Floor Elements', name: 'Floor',  superCategories:[{title:'Interior Walls',  name: 'Interiorwalls',   codes:['Walls','Columns'], functions:['Interior'], json:''}, {title:'Floors',  name: 'Floors',  dual:'true',  codes:['Floors'], functions:['Interior'], json:''}, {title:'Ceilings', name: 'Ceilings', dual:'true',  codes:['Ceilings'], functions:['Interior'], json:''} , {title:'Curtain Panels',  name: 'Curtain Panels',  codes:['Curtain Panels'], functions:['Interior'], dual:'true', json:''} , {title:'Doors',  name: 'Doors',  codes:['Doors'], functions:['Interior'], dual:'true', json:''}]},
		          	 	             {title:'Assets',  name:'Assets', superCategories:[{title:'Rooms',   name: 'Rooms', codes:['Rooms'], functions:['Interior'],json:''},{title:'Equipment',    name: 'Equipment', codes: ['Fire Alarm Devices','Security Devices', 'Specialty Equipment'], functions:['Interior'], json:''},{title:'Furniture',  name: 'Furniture',  codes: ['Furniture'], functions:['Interior'], json:''}]}
		          	 	]);
		
		
		//get overlay panel levels from database result
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('afm_dwgs.model_name', this.bl_id.toUpperCase());      
	    var records = this.afm_dwgs_ds.getRecords(restriction);
	    var levels = [], record, levelCode;
	    for(var i=0, ln=records.length; i<ln; i++){
	    	record = records[i];
	    	levelCode = record.getValue('afm_dwgs.model_level');
	    	levels.push({title: levelCode, name: levelCode, codes:[levelCode], json: record.getValue('afm_dwgs.dwg_name').toLowerCase()});
	    }
	    levels = {title:'Levels',  name:'Levels', levels: levels};
	    
		//open or close detail report panel with clicking object
		this.bim3d.setObjectClickEventListener(this.showPropertiesPanel);
		this.bim3d.setObjectHideEventListener(this.closePropertiesPanel);
		
		var scope = this;
		
		//turn off dual visibility of categories like Floors and Ceilings
		this.bim3d.categoriesPanel.setClickListener(function(link, name, jsonObj){
			if(name === 'Core'){
				scope.bim3d.categoriesPanel.changeLinkStatusById('Floors', false);
				scope.bim3d.categoriesPanel.changeLinkStatusById('Ceilings', false);
			}
		});
		
	
		//load site, shell and core 
		this.bim3d.load(scope.bl_id+'-site', true, function(scenes1){
			scope.bim3d.load(scope.bl_id+'-shell', false, function(scenes){
				scope.bim3d.load(scope.bl_id+'-core', false, function(scenes){
					
					scope.bim3d.categoriesPanel.changeLinkStatus('Floor', false);
					scope.bim3d.categoriesPanel.changeLinkStatus('Assets', false);
					scope.bim3d.categoriesPanel.changeLinkStatusById('Floors', true);
					scope.bim3d.categoriesPanel.changeLinkStatusById('Ceilings', true);
					
					scope.bim3d.categoriesPanel.buildLevels(levels);
				});
			});
		});
		
		//html panel resize
		this.panelHtml.syncHeight = function(){
			scope.bim3d.resize();
		}
    },
   
	 closePropertiesPanel: function(object){
		 var legendPanel = View.panels.get("properiesPanel");
		 if(legendPanel.isShownInWindow()){
			 legendPanel.closeWindow();
		 }
	 },
	
    showPropertiesPanel: function(id, category, level, assetType, pk, userData){
		var legendPanel = View.panels.get("properiesPanel");
		if(!legendPanel.isShownInWindow()){
			 legendPanel.showInWindow({
    			 title: 'Published Data',
                 width: 300,
             });
		 }else{
			 legendPanel.window.show();
		 }
		
		 legendPanel.clear();
		 legendPanel.clearGridRows();
	
		 if(userData){
			 var rec;
			 for(var name in userData){
				 rec = new Ab.data.Record({
    					'properties.name': name,
    					'properties.value':  userData[name]
        			}); 
        			legendPanel.addGridRow(rec);	
			 }
			 //debug
			 rec = new Ab.data.Record({
					'properties.name': 'id',
					'properties.value':  id+''
 			 }); 
 			legendPanel.addGridRow(rec);	
 			
    		legendPanel.update();
		 }
	 },
    
	
	screenShot: function(){
		this.images.push(this.bim3d.getImageBytes());
	},
	
	clearScreenShots: function(){
		this.images = [];
	},
	
	getPPT: function(){
		var slides = [];
		var title = $('panelHtml_title').innerHTML;
		
		if(this.images.length === 0){
			//current image
			this.screenShot();
		}
	
		for(var i=0; i<this.images.length; i++){
			slides.push({'title': title,'images':[this.images[i]]});  
		}
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


