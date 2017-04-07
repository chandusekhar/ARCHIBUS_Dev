/**
 * Declare the namespace for the bim JS class.
 */
Ab.namespace('bim');
/**
 * JS class to work with Autodesk 360 BIM Client-side Viewer.
 * Notice: all interacts with models will be based on valid Revit Guid in database,
 * its corresponding field name is ehandle for rm and eq tables.
 * A valid Guid is like B22D5285-8AA3-423C-B58A-2F123A2EC2CC-0005CC24.
 */
Ab.bim.Autodesk = Base.extend({
	viewer: null,
	bimHtmlContainerId: 'viewer3d',
	guid2NodeIdMapping: {},
	guidPKValueMapping: {},
	guidRGBColorMapping: {},
	
	/**
	 * TODO: move those confidential info into server-side!!!
	 * clientId and clientSecretKey should be obtained by https://developer.autodesk.com/
	 */
	clientId: '56vRODyX63SwkFRCbuQWfIi5QULGlVg5',
	clientSecretKey: '9HUtjlMAyL7IeqR4',
	clickAction: null,
	clickEvents: [],
	highlightedNodeIds:[],
	highlightings: [],
	customMeshProxyMapping: {},
	afterLoadedListener: null,
	isRevit: false,
	
	
	////////////////////////////////PUBLIC API//////////////////////////////////////////////
	/**
	 * @param divId the id of div element to hold BIM 3D - required.
	 * @param client_id get from https://developer.autodesk.com/ - required.
	 * @param client_secret get from https://developer.autodesk.com/ - required.
	 */
    constructor: function(divId, client_id, client_secret){
        this.bimHtmlContainerId = divId;
        if(valueExistsNotEmpty(client_id)){
        	this.clientId = client_id;
        }
        if(valueExistsNotEmpty(client_secret)){
        	this.clientSecretKey = client_secret;
        }
    },
    /**
     * initializes variables.
     */
    init: function(){
     	this.guid2NodeIdMapping = {};
    	this.highlightedNodeIds = [];
    	this.guidPKValueMapping = {};
    	this.guidRGBColorMapping = {};
    	this.customMeshProxyMapping = {};
    	this.afterLoadedListener = null;
    },
    /**
     * Loads model and displays it.
	 * @param urn Autodesk uploaded model URN - required.
	 * @param loadedListener call back function after model is loaded - optional.
	 * @param isReload boolean - optional (called when loading fails!)
	 */
    load: function(urn, loadedListener, isReload){
    	if(!valueExists(loadedListener)){
    		loadedListener = null;
    	}
    	if(!valueExists(isReload)){
    		isReload = false;
    	}
    	
    	if(!isReload){
    		this.isRevit = (this.getExtension(urn) === 'rvt');
        	this.init();
        	{
        		if(this.clickEvents.length > 0){
        			//TODO: multiple asset click events
        			var lastClickEvent = this.clickEvents.pop();
        			this.clickAction = lastClickEvent.callBack;
        	      	this.retrieveGuidPKValueMapping(lastClickEvent.asset, lastClickEvent.restriction, this.isRevit, this.guidPKValueMapping);
        		}
    			for(var i=0; i<this.highlightings.length; i++){
    				this.retrieveGuidRGBColorMapping(this.highlightings[i].asset, this.highlightings[i].viewName, this.highlightings[i].dataSourceId, this.highlightings[i].restriction, this);
    			}
        	}
        	
        	if(valueExists(loadedListener)){
        		this.afterLoadedListener = loadedListener;
        	}
        	if(this.viewer){
        		this.viewer.uninitialize();
        	}
        	
        	var options = {};
            options.env = "AutodeskProduction";
            
            //XXX: retreat from time to time.
            options.accessToken = this.getAccessToken();
            Autodesk.Viewing.Private.initializeEnvironmentVariable(options);
            Autodesk.Viewing.Private.initializeServiceEndPoints();
            Autodesk.Viewing.Private.initializeAuth(null,options);
       
            this.viewer = this.createViewer();
    	}
    	

        this.loadDocument(urn);
    },
    
    /**
     * Unloads to clear 3D viewer object.
     */
    unload: function(){
    	if(this.viewer){
    		this.viewer.uninitialize();
    		this.init();
    		this.viewer = null;
    	}
    },
   
  	 /**
  	  * Selects the item of the mdoel.
 	 * @param revitGuid revit guid - required.
 	 * @param selectedColor color code like 0xFFFFFF or new THREE.Color("rgb(138,43,226)").
 	 * @param callBack call back function with item's Guid as parameter.
 	 */
    select: function(revitGuid, selectedColor, callBack){
  		var guid = this.convertRvitGuid(revitGuid);
  		var selectedNodeId = this.getNodeIdFromGuid(guid, this);
  		if(selectedNodeId){
  			 this.viewer.clearSelection(); 
  			 this.viewer.select(selectedNodeId); 
  			 var selected = this.viewer.getSelection();
  			 if(!valueExistsNotEmpty(selectedColor)){
  				selectedColor = 0x0000FF;
  			 }
  			 this.changeColor(selected[0].fragIds, selectedColor);
  		}
  		if(callBack){
  			callBack(guid);
  		}
  		return selectedNodeId;
  	},
  	/**
  	 * Selects and Zooms into the item of the model.
 	 * @param revitGuid revit guid.
 	 * @param selectedColor color code.
 	 * @param callBack call back function.
 	 */
  	selectZoomIn: function(revitGuid, selectedColor, callBack){
  		var selectedNodeId = this.select(revitGuid, selectedColor, callBack);
  		if(selectedNodeId){
  			 this.viewer.fitToView(selectedNodeId); 
  		}
  	 },
  	/**
  	 * Sets model item's click event.
  	 * call it before calling API load(urn)!
  	 * @param asset such as rm or eq - required.
  	 * @param callBack call back function with primary keys as parameter like 'BOSOFF;01;105' for rm asset - required.
  	 * @param restriction like "rm.bl_id='BOSOFF'" - optional.
  	 */
  	onClick: function(asset, callBack, restriction){
  		var clickEvent = {'asset':asset, 'callBack':callBack, 'restriction':restriction};
  		this.clickEvents.push(clickEvent);
     },
 	/**
 	 * Sets the thematically highlighting of the model items like rooms. 
 	 * call it before calling API load(urn)!
   	 * @param asset such as rm or eq - required.
   	 * @param viewName view name - required.
   	 * @param dataSourceId datasource id - required.
   	 * @param restriction like "rm.bl_id='BOSOFF'" - optional
   	 * @param isolation: boolean. if isolating the highlighted items.
   	 */
  	setHighlighting: function(asset, viewName, dataSourceId, restriction, isolation){
  		if(!valueExists(restriction)){
  			restriction = '';
    	}
  		if(!valueExists(isolation)){
  			isolation = false;
    	}
  		var highlighting = {};
  		highlighting.asset = asset;
  		highlighting.viewName = viewName;
  		highlighting.dataSourceId = dataSourceId;
  		highlighting.restriction = restriction;
  		highlighting.isolation = isolation;
  		
  		this.highlightings.push(highlighting);
	 },
  	 
	 /**
	  * Clears highlighting.
	  */
  	 clearHighlighting: function(){
  		 if(this.viewer && this.viewer.impl){
  			 for(var overlayName in this.customMeshProxyMapping){
  				this.viewer.impl.removeOverlay(overlayName, this.customMeshProxyMapping[overlayName]);
  			 }
  			this.viewer.clearSelection();
  		 }
  	 },
  	 /**
	  * Re-does highlighting.
	  */
  	 redoHighlighting: function(){
  		 for(var overlayName in this.customMeshProxyMapping){
  			 if(overlayName !== 'abCustomOverlay'){
  				this.viewer.impl.addOverlay(overlayName, this.customMeshProxyMapping[overlayName]); 
  			 }
  		 }
  	 },
  	 
  	 /**
  	  * Isolates assets so that all of them could be clicked.
  	  * @param guidMapping: {}. 
  	  */
  	 isolateAssets: function(guidMapping){
  		if(!valueExists(guidMapping)){
  			guidMapping = this.guidPKValueMapping;
    	}
  		 var isolatedIds= [];
  		 var selectedNodeId = null;
  		 for(var guid in guidMapping){
  			selectedNodeId = this.getNodeIdFromGuid(guid, this);
  			if(selectedNodeId){
  				isolatedIds.push(selectedNodeId);
  			}
  		 }
  		 this.viewer.isolateById(isolatedIds);
  	 },
  	 
  	 /**
  	  * Gets Autodesk cloud server access key.
  	  */
  	 getAccessToken: function(){
        	var accessTokey = '';
        	DrawingBimService.getAccessToken(this.clientId, this.clientSecretKey, {
                async: false,
                callback: function(token) {
                	accessTokey= token;
                },
                errorHandler: function(m, e) {
                	 Ab.view.View.showException(e);
                }
            });
        	return accessTokey;
      },
      
      /**
       * Gets the file extension of the Urn (in lower case).
       */
     getExtension: function(urn){
    	  var decodedUrn = Base64.decode(urn.substring(4)).toLowerCase();
    	  return decodedUrn.split('.').pop();
     },
   
  	////////////////////////////////PRIVATE//////////////////////////////////////////////
     createViewer: function(){
    	 var viewerElement = document.getElementById(this.bimHtmlContainerId);
         var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
         viewer.start();
         //improve loading performance
         //viewer.setQualityLevel(false, false);
         viewer.setProgressiveRendering(false);
         //viewer.setGhosting(false);
         viewer.setLightPreset(9);
         viewer.prefs['openPropertiesOnSelect'] = false;
         var _this = this;
         if(valueExistsNotEmpty(this.clickAction)){
        	 viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(evt) {_this.onClickHandler(evt, _this)});
         }
         
         if(!this.isRevit || Object.getOwnPropertyNames(this.guidRGBColorMapping).length !== 0){
        	  viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(evt) {
  		 	    if (viewer.model) {
  		 	        viewer.model.getObjectTree(function (root) {
  		 	        	_this.loopNodes(root, viewer, _this);
  		 	        });
  		 	    }
           });
         }
        	
          return viewer;
     },  
     loadDocument: function(urn){
		var _this = this;
		Autodesk.Viewing.Document.load(urn, function(document) {
			 var geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), {
		        'type' : 'geometry',
		        'role' : '3d'
		    }, true);
			 
			 if(_this.isRevit){
				 _this.retrieveRevitGuid2NodeMapping(document.getPropertyDbPath(), _this);
			 }
			 	
			 _this.viewer.load(document.getViewablePath(geometryItems[0]));
				 
			}, function(errorMsg, httpErrorCode){
				//try again
				_this.load(urn, _this.afterLoadedListener, true);
		});
     },
     loopNodes: function(modelRoot, _viewer, _this){
     	 var nodesToProcess = [];
         var currentMapping = {};

         // Get all the nodes rooted at this model root.
         function getAllNodes(root) {
             if (root.children) {
                 for (var k = 0; k < root.children.length; k++) {
                     var child = root.children[k];
                     nodesToProcess.push(child);
                     getAllNodes(child);
                 }
             }
         }
         
         getAllNodes(modelRoot);
         //process each node
         function processNode(node, onNodeProcessed) {
         	// Gets the property value for the given property name, if it exists.
             function getPropertyValue(properties, propertyName) {
                 for (var i = 0; i < properties.length; ++i) {
                     var property = properties[i];
                     if (property.displayName.toUpperCase() === propertyName) {
                         return (property.displayValue + '').toUpperCase();
                     }
                 }
                 return null;
             }
             // When the properties are retrieved, map the node's guid to its id,
             // if the guid exists.
             function onPropertiesRetrieved(result) {
                 var guid = getPropertyValue(result.properties, 'GUID');
                 if (guid) {
                     currentMapping[guid] = node.dbId;
                     //Asset Highlighting
                     if(_this.highlightings.length > 0 && _this.guidRGBColorMapping[guid]){
                    	 _this.changeColor(node.fragIds, _this.guidRGBColorMapping[guid], node.dbId);
                    	 _this.highlightedNodeIds.push(node.dbId);
                     }
                     /*var label = getPropertyValue(result.properties, 'LABEL');
                     if(label && (label.indexOf("ROOM") >=0 )){
                    	 _this.roomNodeIds.push(node.dbId);
                     }*/
                    
                 }
                 onNodeProcessed();
             }
             // On error, move on to the next node.
             function onError(status, message, data) {
                 onNodeProcessed();
             }
             //BIM 3D API getProperties() asynchronous Ajax call
             _viewer.getProperties(node.dbId, onPropertiesRetrieved, onError);
         }
         // Process the nodes one by one.
         function processNext() {
             if (nodesToProcess.length > 0) {
                 processNode(nodesToProcess.shift(), processNext);
             } else {
                 // No more nodes to process - the mappings are complete.
            	 if(!_this.isRevit){
            		 _this.guid2NodeIdMapping = currentMapping;
            	 }
            	 if(_this.highlightings.length > 0 && _this.highlightings[0].isolation){
            		 _this.viewer.isolateById( _this.highlightedNodeIds); 
            	 }
            	 _this.highlightings = [];
   
            	 if(_this.afterLoadedListener){
            		 _this.afterLoadedListener(_this);
            	 }
             }
         }
         processNext();
     }, 
     convertRvitGuid: function(revitGuid){
		var result = '';
		DrawingBimService.convertRvitGuid(revitGuid, {
			   async: false,
		       callback: function(guid) {
		    	   result= guid;
		       },
		       errorHandler: function(m, e) {
		    	   Ab.view.View.showException(e);
		       }
		});
		return result;
  	  },
  	  getNodeIdFromGuid: function(guid, _me){
     	if(_me.guid2NodeIdMapping && guid in _me.guid2NodeIdMapping) {
             return _me.guid2NodeIdMapping[guid];
         }
         return null;
      },
      getGuidFromNodeId: function(dbid){
		for(var guid in this.guid2NodeIdMapping){
			if(this.guid2NodeIdMapping[guid] === dbid){
				return guid;
			}
		}
        return null;
      },
      changeColor: function(fragIds, colorCode, dbId){
      	var mesh = this.viewer.impl.getRenderProxy(this.viewer.model, fragIds);
      	if (mesh) {
      		var newMaterial = new THREE.MeshBasicMaterial({ color: colorCode }); 
      		var overlayName = "abCustomOverlay";
      		if(valueExistsNotEmpty(dbId)){
      			overlayName = overlayName.concat(dbId+'');
      		}
      		this.viewer.impl.createOverlayScene(overlayName, newMaterial, newMaterial);
      		mesh.myProxy = new THREE.Mesh(mesh.geometry, mesh.material, true);
      		mesh.myProxy.matrixWorld = mesh.matrixWorld;
      		this.customMeshProxyMapping[overlayName] = mesh.myProxy;
      		this.viewer.impl.addOverlay(overlayName, mesh.myProxy);
      	}
      },
      retrieveGuidRGBColorMapping: function(asset, viewName, dataSourceId, restriction, _this){
    	  DrawingBimService.getGuidRGBColorMap(asset, viewName, dataSourceId, restriction, _this.isRevit, {
	            async: false,
	            callback: function(map) {
	            	Ext.apply(_this.guidRGBColorMapping, map);
	            },
	            errorHandler: function(m, e) {
	            	 Ab.view.View.showException(e);
	            }
	        });
      },
      retrieveGuidPKValueMapping: function(asset, restriction, isRevit, guidMapping){
   	  	  DrawingBimService.getGuidPKValueMap(asset, restriction, isRevit, {
   	           async: false,
   	           callback: function(map) {
   	        	   Ext.apply(guidMapping, map);
   	           },
   	           errorHandler: function(m, e) {
   	        	 Ab.view.View.showException(e);
   	           }
   	       });
      },
      onClickHandler: function(evt){
	    	if(evt.nodeArray.length === 0){
	       		return;
	       	}
	    	var found = false;
	    	var guid = this.getGuidFromNodeId(evt.dbIdArray[0]);
	    	
	    	if (guid) {
	    		for(var key in this.guidPKValueMapping){
	    			if(key === guid.toUpperCase()){
	    				this.clickAction(this.guidPKValueMapping[key]);
	    				found = true;
	    				break;
	    			}
	    		}
	    	}

	    	if(!found){
	    		this.clickAction(null);
	    	}
      },
      retrieveRevitGuid2NodeMapping: function(propertyDbPath, _me){
    	    var result = {};
			var objectIdDbFullPath = 'https://developer.api.autodesk.com/viewingservice/v1/items/' + propertyDbPath + 'objects_ids.json.gz?domain=' + window.location.hostname;
			DrawingBimService.getRevitGuid2NodeMap(objectIdDbFullPath, _me.getAccessToken(), {
				   async: false,
			       callback: function(map) {
			    	   _me.guid2NodeIdMapping = map;
			       },
			       errorHandler: function(e) {
			    	   _me.retrieveRevitGuid2NodeMapping(propertyDbPath, _me);
			       }
			});
      }
      
});






