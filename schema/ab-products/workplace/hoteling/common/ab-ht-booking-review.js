var searchBookingController = View.createController('searchBookingController', {
    //Initial load
    hotelingAdminGroup: 'HOTELING ADMINISTRATION',
    hotelingAlldepartGroup: 'HOTEL BOOKINGS ALL DEPARTMENTS',
    resFilterObj: '',
    pct_id: '',
	parentRes: '',
	dateStart: '1900-12-15',
	dateEnd: '2200-12-15',
	hasConfirmedField: true,
	
	afterViewLoad: function() {
		//backward compatibility with 21.2 database as for rmpct.confirmed table
		this.detectAndSetHasConfirmedField();
	},
		
    afterInitialDataFetch: function() {
    	this.setParameterValues();
        //judge if user belong to 'Hoteling Administration'group
        this.setControlValueByUser();
		this.setDefaultDate();
    },
    
    detectAndSetHasConfirmedField: function() {
    	var checkingFieldDs = View.dataSources.get("afmFieldsCheckingDs");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('afm_flds.table_name', 'rmpct', '=');
    	restriction.addClause('afm_flds.field_name', 'confirmed', '=');
    	var record = checkingFieldDs.getRecords(restriction);
    	if (record == null || record.length == 0) {
    		this.hasConfirmedField = false;
    	}
    	if(this.hasConfirmedField) {
    		this.selectBookingGrid.showColumn("rmpct.confirmed", true);
    	} else {
    		this.selectBookingGrid.showColumn("rmpct.confirmed", false);
    	}
    },
    
    /**
     * 
     */
    setParameterValues: function(){
     	this.selectBookingGrid.addParameter("single", getMessage("single"));
    	this.selectBookingGrid.addParameter("recurring", getMessage("recurring"));   	
     	this.selectBookingGrid.addParameter("requested", getMessage("requested"));
    	this.selectBookingGrid.addParameter("approved", getMessage("approved"));   
    },
    
	/**
	 * setDefaultDate()
	 */
	setDefaultDate:function(){
		this.searchBookingConsole.setFieldValue("rmpct.date_start",getCurrentDateInISOFormat());
	},
    /**this method is used for set the fielddef'attribute ,when user.isMemberOfGroup('Hoteling Administration') 
     * ,rmpct.dv_id and rmpct.dp_id readOnly,and the value is taked from em table
     */
    setControlValueByUser: function(){
        var isScheduleGroup = View.isMemberOfGroup(View.user, this.hotelingAdminGroup);
        var hotelingAlldepartGroupvar = View.isMemberOfGroup(View.user, this.hotelingAlldepartGroup);
        //need 
        if (!isScheduleGroup) {
            this.searchBookingConsole.fields.get("rmpct.em_id").actions.get(0).command.commands[0].enabled = false;
            //set the default value 
            this.searchBookingConsole.setFieldValue("rmpct.em_id", View.user.employee.id);
        }//kb:3025163
        if (!hotelingAlldepartGroupvar&&!isScheduleGroup) {
            this.searchBookingConsole.fields.get("rmpct.dv_id").actions.get(0).command.commands[0].enabled = false;
            this.searchBookingConsole.fields.get("rmpct.dp_id").actions.get(0).command.commands[0].enabled = false;
            //set the default value
            this.searchBookingConsole.setFieldValue("rmpct.dv_id", View.user.employee.organization.divisionId);
            this.searchBookingConsole.setFieldValue("rmpct.dp_id", View.user.employee.organization.departmentId);
        }
        
    },
    //Hoteling Space Bookings grid panel- Cancel
    searchBookingConsole_onSearch: function(){
        this.resFilterObj = this.getRestriction();
        this.pct_id = this.searchBookingConsole.getFieldValue("rmpct.pct_id");
        if (this.pct_id != '') {
            this.selectBookingGrid.addParameter('pctIdRes', '=' + this.pct_id);
        }
        else {
            this.selectBookingGrid.addParameter('pctIdRes', 'is not null');
        }
		this.dateStart = this.searchBookingConsole.getFieldValue("rmpct.date_start");
        if (this.dateStart != '') {
			this.selectBookingGrid.addParameter('dateStart', this.dateStart);
        }else{
			this.selectBookingGrid.addParameter('dateStart', '1900-12-15');
		}
        this.dateEnd = this.searchBookingConsole.getFieldValue("rmpct.date_end");
        if (this.dateEnd != '') {
			this.selectBookingGrid.addParameter('dateEnd', this.dateEnd);
        }else{
		    this.selectBookingGrid.addParameter('dateEnd', '2200-12-15');
		}
        if (this.resFilterObj != '' || this.resFilterObj != undefined) {
        	if (this.hasConfirmedField) {
        		this.selectBookingGrid.addParameter('confirmedField', 'rmpct.confirmed');
        	}
            this.selectBookingGrid.refresh(this.resFilterObj);
        }
    },
    
    getRestriction: function(){
        var restriction = new Ab.view.Restriction();
        var isScheduleGroup = View.isMemberOfGroup(View.user, this.hotelingAdminGroup);
        var hotelingAlldepartGroupvar = View.isMemberOfGroup(View.user, this.hotelingAlldepartGroup);
        
        if (!isScheduleGroup) {
            restriction.addClause('rmpct.em_id', View.user.employee.id, '=');
        }
        else {
            var em_id = this.searchBookingConsole.getFieldValue("rmpct.em_id");
            if (em_id != '') {
                restriction.addClause('rmpct.em_id', em_id, '=');
            }
        }
        if (!hotelingAlldepartGroupvar&&!isScheduleGroup) {
        
            restriction.addClause('rmpct.dv_id', View.user.employee.organization.divisionId, '=');
            restriction.addClause('rmpct.dp_id', View.user.employee.organization.departmentId, '=');
        }
        else {
            var dv_id = this.searchBookingConsole.getFieldValue("rmpct.dv_id");
            if (dv_id != '') {
            
                restriction.addClause('rmpct.dv_id', dv_id, '=');
            }
            var dp_id = this.searchBookingConsole.getFieldValue("rmpct.dp_id");
            if (dp_id != '') {
                restriction.addClause('rmpct.dp_id', dp_id, '=');
            }
        }
        
        var bl_id = this.searchBookingConsole.getFieldValue("rmpct.bl_id");
        if (bl_id != '') {
            restriction.addClause('rmpct.bl_id', bl_id, '=');
        }
        var fl_id = this.searchBookingConsole.getFieldValue("rmpct.fl_id");
        
        if (fl_id != '') {
            restriction.addClause('rmpct.fl_id', fl_id, '=');
        }
        var rm_id = this.searchBookingConsole.getFieldValue("rmpct.rm_id");
        if (rm_id != '') {
            restriction.addClause('rmpct.rm_id', rm_id, '=');
        }
        var rm_cat = this.searchBookingConsole.getFieldValue("rm.rm_cat");
        if (rm_cat != '') {
            restriction.addClause('rmpct.rm_cat', rm_cat, '=');
        }
        var rm_type = this.searchBookingConsole.getFieldValue("rm.rm_type");
        if (rm_type != '') {
            restriction.addClause('rmpct.rm_type', rm_type, '=');
        }
        var rm_std = this.searchBookingConsole.getFieldValue("rm.rm_std");
        if (rm_std != '') {
            restriction.addClause('rmpct.rm_std', rm_std, '=');
        }
        return restriction;
    },
	/**
	 * Open dialog when you click details button of grid'row
	 * @param {Object} row
	 */
    selectBookingGrid_details_onClick: function(row){
		 
        if (this.dateStart != '') {
			this.bookingDetailsGrid.addParameter('dateStart', this.dateStart);
        }else{
			this.bookingDetailsGrid.addParameter('dateStart', '1900-12-15');
		}
        if (this.dateEnd != '') {
			this.bookingDetailsGrid.addParameter('dateEnd', this.dateEnd);
        }else{
		    this.bookingDetailsGrid.addParameter('dateEnd', '2200-12-15');
		}
		
        var record = row.getRecord();
        var restriction = this.getRestriction();
		
        var parentPctId = record.getValue("rmpct.parent_pct_id");
		restriction.removeClause('rmpct.activity_log_id');
        restriction.removeClause('rmpct.pct_id');
        if (this.pct_id != '') {
            restriction.addClause('rmpct.pct_id', this.pct_id, '=');
        }
        if (parentPctId != '') {
            restriction.addClause('rmpct.parent_pct_id', parentPctId, '=',true);
        }
		this.parentRes=restriction;
        this.bookingDetailsGrid.refresh(restriction);
        this.bookingDetailsGrid.show(true);
        this.bookingDetailsGrid.showInWindow({
            width: 1300,
            height: 500,
			closeButton: false
        });
    },
    
    /**
     * Open view 'ab-ht-booking-hl-fl-plan.axvw' when you click locateImage button
     * @param {Object} row
     */
    selectBookingGrid_locateImage_onClick: function(row){		
        View.locRecord = row.getRecord();
        View.openDialog("ab-ht-booking-hl-fl-plan.axvw");
    },
	/**
	 * Clear console restriction 
	 */
	searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.setControlValueByUser();
        this.selectBookingGrid.show(false);
    },
    
    /**
     * Hoteling Space Bookings grid panel-Details in Each row
     */
    selectBookingGrid_onCancel: function(){
       var pctParam = new Array();
		var emIdParam = new Array();
		var blIdParam = new Array();				
		var vistorIdParam = new Array();
        var rows = this.selectBookingGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordcancelledCheck'));
            return;
        }
		var activityLogIds=new Array();
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pctId = row['rmpct.pct_id'];
            var parentPctId = row['rmpct.parent_pct_id'];
			var activityLogId = row['rmpct.activity_log_id'];
			activityLogIds.push(activityLogId);
            pctParam.push(pctId);
            var emId = row['rmpct.em_id'];
			emIdParam.push(emId);
			var visitorId = row['rmpct.visitor_id'];
			vistorIdParam.push(visitorId);
            var blId = row['rmpct.bl_id'];
			blIdParam.push(blId);
        }
        try {
			var operationLevel = 0;
        	var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-cancelBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, blIdParam, activityLogIds);
			  if(result.message=='err1'){
					alert(getMessage("emailNotificationError"));
			  }
			  
			  var res = eval('(' + result.data.notCanceled + ')');
			   
	            if (res.length > 0) {
	             var x="";
	                for (var r = 0; r < res.length; r++) {
	                   x=x+","+ res[r];
	                }
					var message=getMessage('recordNotCancelled1')+' '+x.substring(1)+' '+getMessage('recordNotCancelled');
					alert(message);
	            }else{
					alert(getMessage('recordCancelled'));
				}
	            
		        this.searchBookingConsole_onSearch();
     } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    },

    bookingDetailsGrid_onCloseDialog: function(){
		this.searchBookingConsole_onSearch();
	 },
    //Bookings Details grid panel-Cancel
    bookingDetailsGrid_onCancel: function(){
        var pctParam = new Array();
		var emIdParam = new Array();
		var blIdParam = new Array();		
		var vistorIdParam = new Array();
        var rows = this.bookingDetailsGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordcancelledCheck'));
            return;
        }
		var activityLogIds= new Array();
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pctId = row['rmpct.pct_id'];
            var parentPctId = row['rmpct.parent_pct_id'];
			var activityLogId = row['rmpct.activity_log_id'];
			activityLogIds.push(activityLogId);
            pctParam.push(pctId);
            var emId = row['rmpct.em_id'];
			emIdParam.push(emId);
			var visitorId = row['rmpct.visitor_id'];
			vistorIdParam.push(visitorId);
            var blId = row['rmpct.bl_id'];
			blIdParam.push(blId);

        }
        try {
			var operationLevel = 1;
        	var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-cancelBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, blIdParam, activityLogIds);
				if(result.message=='err1'){
					alert(getMessage("emailNotificationError"));
				}
				
				var res = eval('(' + result.data.notCanceled + ')');
	            if (res.length > 0) {
	             var x="";
	                for (var r = 0; r < res.length; r++) {
	                   x=x+","+ res[r];
	                }
					var message=getMessage('recordNotCancelled1')+' '+x.substring(1)+' '+getMessage('recordNotCancelled');
					alert(message);
	            }else{
					alert(getMessage('recordCancelled'));
				}
	            
	            if (this.parentRes.findClauseIndex('rmpct.parent_pct_id') != -1) {
	                this.parentRes.addClause('rmpct.parent_pct_id', result.data.parectPctId, '=',true);
	            }
		        this.bookingDetailsGrid.refresh(this.parentRes);
		        this.searchBookingConsole_onSearch();
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
})

