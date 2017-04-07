var searchBookingApproveController = View.createController('searchBookingApproveController', {
    //Initial load
    hotelingAdminGroup: 'HOTELING ADMINISTRATION',
    resFilterObj: '',
    pct_id: '',
	parentRes:'',
	dateStart:'1900-12-15',
	dateEnd:'2200-12-15',
    afterInitialDataFetch: function(){
    	this.setParameterValues();
        //judge if user belong to 'Hoteling Administration'group
        this.setControlValueByUser();
		this.setDefaultDate();
        
    },
    
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
        //need
        if (!isScheduleGroup) {
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
            this.selectBookingGrid.refresh(this.resFilterObj);
        }
        
    },
    getRestriction: function(){
        var restriction = new Ab.view.Restriction();
        var isScheduleGroup = View.isMemberOfGroup(View.user, this.hotelingAdminGroup);
 
            var em_id = this.searchBookingConsole.getFieldValue("rmpct.em_id");
            if (em_id != '') {
                restriction.addClause('rmpct.em_id', em_id, '=');
        }
        if (!isScheduleGroup) {
			var res = new Ab.view.Restriction();
            res.addClause("dp.dv_id", View.user.employee.organization.divisionId, "=");
			res.addClause("dp.dp_id", View.user.employee.organization.departmentId, "=");
			var dpDS=this.dpDS.getRecords(res);
			if (dpDS.length > 0) {
				var approvingMgr = dpDS[0].getValue("dp.approving_mgr");
			if(approvingMgr!=View.user.employee.id){
				 restriction.removeClause('rmpct.em_id');
				 restriction.addClause('rmpct.em_id', '-10000', '=');
			}	}
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
	 * @param {Object} row
	 */
    selectBookingGrid_locateImage_onClick: function(row){		
        View.locRecord = row.getRecord();
        View.openDialog("ab-ht-booking-hl-fl-plan.axvw");
    },
    /**
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
            restriction.addClause('rmpct.parent_pct_id', parentPctId, '=');
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
     * Clear console restriction 
     */
    searchBookingConsole_onClear: function(){
        this.searchBookingConsole.clear();
        this.setControlValueByUser();
        this.selectBookingGrid.show(false);
    },
	bookingDetailsGrid_onCloseDialog: function(){
		this.searchBookingConsole_onSearch();
	 },
    //Hoteling Space Bookings grid panel-Details in Each row

    selectBookingGrid_onApprove: function(){
        var pctParam = new Array();
		var emIdParam = new Array();
		var activityLogIds = new Array();
		var vistorIdParam = new Array();
		
        var rows = this.selectBookingGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordApprovedCheck'));
            return;
        }
        var parentPctId = rows[0].row.getFieldValue('rmpct.parent_pct_id');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            
            var pctId = row.row.getFieldValue('rmpct.pct_id');
            pctParam.push(pctId);
            
			var activityLogId = row.row.getFieldValue('rmpct.activity_log_id');
			activityLogIds.push(activityLogId);
			
            var emId = row.row.getFieldValue('rmpct.em_id');
			emIdParam.push(emId);
			
			var visitorId = row.row.getFieldValue('rmpct.visitor_id');
			vistorIdParam.push(visitorId);
        }
        
        try {
			var operationLevel = 0;
			//approve booking
			var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-approveBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, activityLogIds);
			if(result.message=='err1') {
				alert(getMessage("emailNotificationError"));
			}
        } catch (e) {
            Workflow.handleError(e);
        }
        var res = eval('(' + result.jsonExpression + ')');
        
     
        if (result.code == "executed") {
            if (res.length > 0) {
             var x="";
                for (var r = 0; r < res.length; r++) {
                   x=x+","+ res[r];
                }
				var message=getMessage('recordNot')+' '+x.substring(1)+' '+getMessage('recordNotApproved');
				alert(message);
            }else{
				alert(getMessage('recordApproved'));
			}
        }
        this.searchBookingConsole_onSearch();
    },
	/**
	 * Reject booking of level 1 that contain common parent_pct_id
	 */
    selectBookingGrid_onReject: function(){
        var pctParam = new Array();
		var emIdParam = new Array();
		var activityLogIds = new Array();
		
		var vistorIdParam = new Array();
        var rows = this.selectBookingGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordRjectedCheck'));
            return;
        }
        var parentPctId = rows[0].row.getFieldValue('rmpct.parent_pct_id');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pctId = row.row.getFieldValue('rmpct.pct_id');
            pctParam.push(pctId);
            
			var activityLogId = row.row.getFieldValue('rmpct.activity_log_id');
            activityLogIds.push(activityLogId);
            
            var emId = row.row.getFieldValue('rmpct.em_id');
			emIdParam.push(emId);
			
			var visitorId = row.row.getFieldValue('rmpct.visitor_id');
			vistorIdParam.push(visitorId);
        }
		 //kb#3025868,When rejecting parent booking, it would be good to inform the user that some detailed bookings of this parent booking are already approved.@lei
		 var restriction = new Ab.view.Restriction();
		 restriction.addClause("rmpct.status", '1', "=");
		 restriction.addClause('rmpct.parent_pct_id', pctParam, 'in');
		 
         var recs = this.rmpctDS.getRecords(restriction);
         if (recs != undefined) {
             if (recs.length > 0) {
                 var rejectYesOrNo = confirm(getMessage("rejectYesOrNo"));
                 if (!rejectYesOrNo) {
                     return;
                 }
             }
         }
        try {
			var operationLevel = 0;
			//reject booking
			var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-rejectBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, activityLogIds);
		  if(result.message=='err1'){
				alert(getMessage("emailNotificationError"));
			}
		} 
        catch (e) {
            Workflow.handleError(e);
        }
        var res = eval('(' + result.data.notCanceled + ')');
    
        if (result.code == "executed") {
            if (res.length > 0) {
             var x="";
                for (var r = 0; r < res.length; r++) {
                   x=x+","+ res[r];
                }
				var message=getMessage('recordNot')+' '+x.substring(1)+' '+getMessage('recordNotRejected');
				alert(message);
            }else{
				alert(getMessage('recordRejected'));
			}
        }
        this.searchBookingConsole_onSearch();
    },
    
	/**
	 * Approve booking of level 2 that table rmpct
	 */
    bookingDetailsGrid_onApprove: function(){
    	var pctParam = new Array();
		var emIdParam = new Array();
		var activityLogIds = new Array();
		
		var vistorIdParam = new Array();
        var rows = this.bookingDetailsGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordApprovedCheck'));
            return;
        }
		var parentPctId = rows[0].row.getFieldValue('rmpct.parent_pct_id');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pctId = row.row.getFieldValue('rmpct.pct_id');
            pctParam.push(pctId);
           
			activityLogId = row.row.getFieldValue('rmpct.activity_log_id');
			activityLogIds.push(activityLogId);
			
            var emId = row.row.getFieldValue('rmpct.em_id');
			emIdParam.push(emId);
			  
			var visitorId = row.row.getFieldValue('rmpct.visitor_id');
			vistorIdParam.push(visitorId);
        }
        try { 	  
			var operationLevel = 1;
			//approve booking
			var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-approveBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, activityLogIds);
			if(result.message=='err1'){
				alert(getMessage("emailNotificationError"));
			}
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        var res = eval('(' + result.jsonExpression + ')');
        
        var restriction = new Ab.view.Restriction();
		  if (this.parentRes != '' && restriction) {
			restriction = this.parentRes;
		}
           if (result.code == "executed") {
            if (res.length > 0) {
             var x="";
                for (var r = 0; r < res.length; r++) {
                   x=x+","+ res[r];
                }
				var message=getMessage('recordNot')+' '+x.substring(1)+' '+getMessage('recordNotApproved');
				alert(message);
            }else{
				alert(getMessage('recordApproved'));
			}
        }
        this.bookingDetailsGrid.refresh(restriction);
        this.searchBookingConsole_onSearch();
    },
	/**
	 * Reject booking of level 1 of grid
	 */
    bookingDetailsGrid_onReject: function(){
        var pctParam = new Array();
        var emIdParam = new Array();
        var activityLogIds = new Array();
		
		var vistorIdParam = new Array();
        var rows = this.bookingDetailsGrid.getSelectedRows();
        var rmpctParStr = '';
        if (rows.length == 0) {
			alert(getMessage('recordRjectedCheck'));
            return;
        }
        var parentPctId = rows[0].row.getFieldValue('rmpct.parent_pct_id');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pctId = row.row.getFieldValue('rmpct.pct_id');
            pctParam.push(pctId);
            
            var activityLogId = row.row.getFieldValue('rmpct.activity_log_id');
            activityLogIds.push(activityLogId);
            
            var emId = row.row.getFieldValue('rmpct.em_id');
            emIdParam.push(emId);
            
            var visitorId = row.row.getFieldValue('rmpct.visitor_id');
            vistorIdParam.push(visitorId);
        }
        try { 	  
			var operationLevel = 1;
			var result = Workflow.callMethod('AbSpaceHotelling-HotelingHandler-rejectBookings', 
																	operationLevel, pctParam, parentPctId, 
																	emIdParam,vistorIdParam, activityLogIds);
			if(result.message=='err1'){
					alert(getMessage("emailNotificationError"));
			}
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        var res = eval('(' + result.data.notCanceled + ')');
        
        var restriction = new Ab.view.Restriction();
		  if (this.parentRes != '' && restriction) {
			restriction = this.parentRes;
		}
       if (result.code == "executed") {
            if (res.length > 0) {
             var x="";
                for (var r = 0; r < res.length; r++) {
                   x=x+","+ res[r];
                }
				var message=getMessage('recordNot')+' '+x.substring(1)+' '+getMessage('recordNotRejected');
				alert(message);
            }else{
				alert(getMessage('recordRejected'));
			}
            if (restriction.findClauseIndex('rmpct.parent_pct_id') != -1) {
            	restriction.addClause('rmpct.parent_pct_id', result.data.parectPctId, '=',true);
            }
            this.bookingDetailsGrid.refresh(restriction);
            this.searchBookingConsole_onSearch();
        }
       
    } 
  
})
