/**
 * handles data sources and database related functions.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 */
var SvgData = Base.extend({
	
	datasources: [],
	
	//auto number that last created - used for uploading action	
	autoNumber: null,

	constructor: function(){
		this.createDatasources();
	},
	
	createDatasources: function(){
    	this.datasources['afm_redlines'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_afmRedlines',
	        tableNames: ['afm_redlines'],
	        fieldNames: ['afm_redlines.dwg_name','afm_redlines.activity_log_id', 'afm_redlines.origin','afm_redlines.highlight_defs',
	                     'afm_redlines.image_file','afm_redlines.html5_redlines','afm_redlines.extents_lux','afm_redlines.extents_luy',
	                     'afm_redlines.extents_rlx','afm_redlines.extents_rly','afm_redlines.redlines','afm_redlines.user_name',
	                     'afm_redlines.activity_log_id', 'afm_redlines.auto_number']
	    });


    	this.datasources['afm_dwgs'] = Ab.data.createDataSourceForFields({
    	        id: 'svgDrawingControl_afmDwgs_Ds',
    	        tableNames: ['afm_dwgs'],
    	        fieldNames: ['afm_dwgs.dwg_name','afm_dwgs.space_hier_field_values']
    	});
    	
    	this.datasources['activity_log'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_activityLog_Ds',
	        tableNames: ['activity_log'],
	        fieldNames: ['activity_log.activity_log_id','activity_log.doc4']
		});

    	this.datasources['afm_docvers'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_afmDocVers_Ds',
	        tableNames: ['afm_docvers'],
	        fieldNames: ['afm_docvers.table_name','afm_docvers.field_name','afm_docvers.pkey_value','afm_docvers.version','afm_docvers.version', 'afm_docvers.doc_file']
		});
    	
    	this.datasources['plantype_groups'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_planTypeGroups_Ds',
	        tableNames: ['plantype_groups'],
	        fieldNames: ['plantype_groups.active', 'plantype_groups.display_order',  'plantype_groups.plan_type', 'plantype_groups.plantype_group'] 
    	});

    	this.datasources['active_plantypes'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_activePlanTypes_Ds',
	        tableNames: ['active_plantypes'],
	        fieldNames: ['active_plantypes.plan_type', 'active_plantypes.title'] 
    	});
    	
    	// used in filter highlight to retrieve rm records 
    	this.datasources['rm'] = Ab.data.createDataSourceForFields({
	        id: 'svgDrawingControl_rm_Ds',
	        tableNames: ['rm'],
	        fieldNames: ['rm.bl_id','rm.fl_id', 'rm.rm_id', 'rm.dv_id', 'rm.dp_id', 'rm.rm_cat', 'rm.rm_type', 'rm.rm_std', 'rm.area', 'rm.cap_em']
    	});
	
    },
    
    /**
     * retrieve record from db for specified table, restriction and/or parameters
     */
    getRecords: function(tableName, restrictions, parameters){    	
    	if(parameters)
    		return this.datasources[tableName].getRecords(restrictions, parameters);
    	else
    		return this.datasources[tableName].getRecords(restrictions);
    },
    
    /**
     * retrieve redline records for specified activity log id. 
     * If activity log id is empty, retrieve all redline records, this case is used to clear unmatched afm_redlines/afm_dovcers records before uploading to avoid the warning message.
     */
    getRedlineRecords: function(activityLogId, containDoc){
    	var restriction = new Ab.view.Restriction();
    	if(activityLogId)
    		restriction.addClause("afm_redlines.activity_log_id", activityLogId);
		
    	if(containDoc){
    		restriction.addClause("afm_redlines.image_file", '', 'IS NOT NULL', 'AND');
    		restriction.addClause("afm_redlines.html5_redlines", '', 'IS NOT NULL', 'OR');
    	}
    	var parameters = {
				sortValues: "[{'fieldName':'afm_redlines.auto_number', 'sortOrder':-1}]"
		};
		
		var records = this.getRecords('afm_redlines', restriction, parameters);
		return records;
    },
    
    /**
     * retrieve the redline record with the max auto number for specified activity log.
     * usually should contain just one record.
     */
    getLastRedlineRecord: function(activityLogId){
		var record = null;
		var records = this.getRedlineRecords(activityLogId, false);
		if (records.length > 0){
			//retrieve the most recent record
			record = records[0];
		}
		
		return record;
    }, 
    
    /**
     * check if the redline record already exists.
     */
    redlineRecordExists: function(activityLogId){
    	var records = this.getRedlineRecords(activityLogId, false);
		if (records.length > 0){
			return true;
		}
		return false;
    },
    
    /**
     * retrieve the auto number id from afm_redlines table for the specified activity log.
     * @param activityLogId String the action item id.
     * @param addIfNotExists boolean. true to add a new record if it does not exist.
     * @param  isFloorPlan boolean true if it is floor-plan, false otherwise.
     * @param dwgName String. drawing name for the floor plan, empty otherwise.
     */
    getNextAutoNumber: function(activityLogId, addIfNotExists, isFloorPlan, dwgName){
		var record = this.getLastRedlineRecord(activityLogId);

		if(!record && addIfNotExists){
    		var record = new Ab.data.Record();
            record.isNew = true;
   	    	record.setValue('afm_redlines.activity_log_id', activityLogId);
        	record.setValue('afm_redlines.user_name', View.user.name);
        	record.setValue('afm_redlines.auto_number', '');
        	record.setValue('afm_redlines.image_file', '');
        	
        	if(isFloorPlan)
        		record.setValue('afm_redlines.origin', 'HTML5-based Floor Plan');
        	else
        		record.setValue('afm_redlines.origin', 'HTML5-based Map or Drawing Image');
        	
        	if(dwgName)
        		record.setValue('afm_redlines.dwg_name', dwgName);
        		
       		this.datasources['afm_redlines'].saveRecord(record);

       		record = this.getLastRedlineRecord(activityLogId);
       		
    	}
    	
    	if(record){
    		this.autoNumber = record.getValue("afm_redlines.auto_number");
    	} else {
    		this.autoNumber = "";
    	}
    },
    
    /**
     * update afm_redlines.image_file field name to the uploaded doc's auto name.
     */
    updateImageName: function(activityLogId, imageName){
    	var record = this.getLastRedlineRecord(activityLogId);
    	if(record){
    		record.setValue('afm_redlines.image_file', imageName);
    		record.isNew = false;
    		this.datasources['afm_redlines'].saveRecord(record);
    	}

    },
    
	 /**
	  * Saves redmarks to database afm_redlines.html5_redlines doc field.
	  */
	 saveRedmarksToDb: function(redmarks, autoNumber){

		  	var fileName = "afm_redlines-" + autoNumber + "-html5_redlines.txt";
		  	var keys = {'auto_number': autoNumber};
			
		  	var parameters = { "tableName": "afm_redlines",
		  					   "fieldName": "html5_redlines",
		  					   "documentName": fileName
		  					  };
		  	
		  	var datasource = this.datasources["afm_redlines"];
	    	DrawingSvgService.checkin(redmarks, keys, parameters, {
		   	   	callback: function() {
		   	   		var record = datasource.getRecord("auto_number =" + autoNumber);
		   	   		if(record){
		   	   			record.setValue('afm_redlines.html5_redlines', fileName);
		   	   			datasource.saveRecord(record);
		   	   		}
		   	   		return true;
		   	   	},
		   	    errorHandler: function(m, e){
		   	        Ab.view.View.showException(e);
		   	    }
		   	});
	  },
    /**
     * check for all existing afm_redlines records and remove unmatched afm_redlines/afm_dovcers records before uploading to avoid the warning message.
     */
    validateAfmRedlineRecords: function(){
    	var records = this.getRedlineRecords(null, true);
    	if(records && records.length > 0){
    		for(var i = 0; i < records.length; i++){
    			if(!records[i])
    				continue;
	    		
    			var restrictions = new Ab.view.Restriction();
	        	restrictions.addClause("afm_docvers.table_name", "afm_redlines");
	        	restrictions.addClause("afm_docvers.field_name", "image_file");
	        	restrictions.addClause("afm_docvers.pkey_value", records[i].getValue("afm_redlines.auto_number"));
	
	        	var docRecords = this.getRecords('afm_docvers', restrictions);
	        	if(!docRecords || docRecords.length < 1){
        			if(records[i].getValue("afm_redlines.extents_lux") == null || records[i].getValue("afm_redlines.extents_lux") == ''){
        				this.datasources['afm_redlines'].deleteRecord(records[i]);
	        		}
	        	}
    		}
    	} 
    },

    /**
     * retrieve drawing name from afm_dwgs table for specified pkValues (bl_id and fl_id)
     */
    retrieveDrawingName: function(pKeyValues){
        
    	var dwgName = '';
    	
        if(typeof(pKeyValues) != 'undefined' && pKeyValues){
	    	var bl_id = pKeyValues['bl_id'];
	    	var fl_id = pKeyValues['fl_id'];
	    	if(bl_id && fl_id){
	    		var restriction = new Ab.view.Restriction();
	    		restriction.addClause("afm_dwgs.space_hier_field_values", bl_id + ";" + fl_id);
	        	var records = this.getRecords('afm_dwgs', restriction);
	        	if(records!=null && records.length > 0 && records[0]!=null){
	        		dwgName = records[0].getValue("afm_dwgs.dwg_name");
	        	}
	    	}
        }
        
        return dwgName;
    },
    
    /**
     * add or retrieve the redline record, set the auto number id.
     */
    addOrRetrieveRedlineRecord: function(activityLogId, isFloorPlan){
    	// remove all unsaved afm_redlines record with image_file name or html5_redlines value but no doc records attached to it
    	this.validateAfmRedlineRecords();
		
    	var exists = this.redlineRecordExists(activityLogId);
    	
    	// retrieve or create a new afm_redlines record to get auto_number.
		this.getNextAutoNumber(activityLogId, !exists, isFloorPlan);
		
    },
    
    /**
     * save non-document field to afm_redlines table. 
     */
    saveRecordToRedlineTable: function(viewBox, activityLogId, dwgName, highlightJson){
    	
    	var record = new Ab.data.Record();
    	if(this.redlineRecordExists(activityLogId)){
    		record = this.getLastRedlineRecord(activityLogId);
   			record.isNew = false;
    	} else {
   			record.isNew = true;
    	}
        
        if(dwgName){
        	record.setValue('afm_redlines.dwg_name', dwgName);
        	record.setValue('afm_redlines.origin', 'HTML5-based Floor Plan');
        } else {
        	record.setValue('afm_redlines.origin', 'HTML5-based Map or Drawing Image');
        }

        record.setValue('afm_redlines.extents_lux', viewBox[0]);
    	record.setValue('afm_redlines.extents_luy', viewBox[1]);
    	record.setValue('afm_redlines.extents_rlx', viewBox[2]);
    	record.setValue('afm_redlines.extents_rly', viewBox[3]);

    	if(activityLogId)
	    	record.setValue('afm_redlines.activity_log_id', activityLogId);
    		
    	record.setValue('afm_redlines.user_name', View.user.name);
    	
    	var jsonString = JSON.stringify(highlightJson);
    	if(jsonString && jsonString != "{}")
    		record.setValue('afm_redlines.highlight_defs', jsonString);

   		this.datasources['afm_redlines'].saveRecord(record);
    }
});

