var visitorController = View.createController('visitorController', {
    abHtBookingCreateSearchController: '',
    res: '',
	//when view called from create booking ,tag=true,else=false
	tag:false,
	dateStart:'1900-12-15',
	dateEnd:'2200-12-15',
	editTag:false,
    afterInitialDataFetch: function(){
	if(!View.getOpenerView().controllers.get('abHtBookingCreateSelectController')){
		this.tag = false;
	}
	else{
		this.tag= true;
	}
        var currdateO = new Date();
        var currentDate = getIsoFormatDate(currdateO);
	
        var restriction = new Ab.view.Restriction();
		//Call from parent view
        if (this.tag) {
            this.abHtBookingCreateSearchController = View.getOpenerView().controllers.get('abHtBookingCreateSelectController')['abHtBookingCreateSearchController'];
            this.dateStart = this.abHtBookingCreateSearchController.basicSearchOption.getFieldValue('rmpct.date_start');
            this.dateEnd = this.abHtBookingCreateSearchController['dateEnd']; 
      }else{
	  	 this.dateStart = currentDate;
         this.dateEnd = currentDate;
	  }
        //if user is not belong to  'HOTEL BOOKINGS ALL DEPARTMENTS' and 'HOTELING ADMINISTRATION'group
        if (!((View.isMemberOfGroup(View.user, 'HOTEL BOOKINGS ALL DEPARTMENTS')) || (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')))) {
		if(this.tag){
		    restriction.addClause("visitors.date_start", this.dateStart, "&lt;=");
			restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			restriction.addClause("visitors.is_authorized", 1, "=");
		    }else{
		    restriction.addClause("visitors.date_start", this.dateStart, "&lt;=","((");
			restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			restriction.addClause("visitors.date_start", this.dateStart, "&lt;=",")OR(");
			restriction.addClause("visitors.date_end", '', "=");
			restriction.addClause("visitors.date_start", '', "=",")OR(");
			restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			restriction.addClause("visitors.date_start", '', "=",")OR(");
			restriction.addClause("visitors.date_end", '', "=");
			}

         
            restriction.addClause("visitors.em_id", View.user.employee.id, "=","))AND((");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", View.user.employee.organization.departmentId, "=");
		    restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", View.user.employee.organization.departmentId, "=");
			restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", '', "=",")OR(");
            restriction.addClause("visitors.dv_id", '', "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", View.user.employee.id, "=",")OR(");
            restriction.addClause("visitors.dv_id", '', "=");
            restriction.addClause("visitors.dp_id", '', "=");
			restriction.addClause("visitors.em_id", View.user.employee.id, "=",")OR(");
            restriction.addClause("visitors.dv_id", View.user.employee.organization.divisionId, "=");
            restriction.addClause("visitors.dp_id", '', "=");
            this.visitorsGrid.refresh(restriction);
        }
        else 
            if (View.isMemberOfGroup(View.user, 'HOTELING ADMINISTRATION')) {
                this.visitorsGrid.refresh();
            }
            else {
				if(this.tag){
		         restriction.addClause("visitors.date_start", this.dateStart, "&lt;=");
			     restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			     restriction.addClause("visitors.is_authorized", 1, "=");
		       }else{
		         restriction.addClause("visitors.date_start", this.dateStart, "&lt;=","((");
			     restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			     restriction.addClause("visitors.date_start", this.dateStart, "&lt;=",")OR(");
			     restriction.addClause("visitors.date_end", '', "=");
			     restriction.addClause("visitors.date_start", '', "=",")OR(");
			     restriction.addClause("visitors.date_end", this.dateEnd, "&gt;=");
			     restriction.addClause("visitors.date_start", '', "=",")OR(");
			     restriction.addClause("visitors.date_end", '', "=");
			}
                 restriction.addClause("visitors.em_id", View.user.employee.id, "=","))AND ((");
				 restriction.addClause("visitors.em_id", '', "=",")OR(");
                 this.visitorsGrid.refresh(restriction);
            }
        this.res = restriction;
    },
	/**
	 * Save visitor  and refresh parent grid of left
	 */
    visitorsForm_onSave: function(){
        this.visitorsForm.save();
        this.visitorsGrid.refresh(this.res);
		if (this.tag) {
			View.getOpenerView().controllers.get('abHtBookingCreateSelectController').refreshSelectVisitorsGrid();
		}
    },
	/**
	 * Delete visitor and refresh parent grid of left
	 */
	visitorsForm_onDelete:function(){
	 this.visitorsGrid.refresh(this.res);
	 this.visitorsForm.show(false);
	 if (this.tag) {
	 	View.getOpenerView().controllers.get('abHtBookingCreateSelectController').refreshSelectVisitorsGrid();
	 }
	},
	/**
	 * Refresh grid of visitor
	 */
    visitorsGrid_onRefresh: function(){
		this.visitorsGrid.refresh(this.res);
    },
	/**
	 * Set default value of visitor form after form refresh
	 */
	visitorsForm_afterRefresh: function(){
		if (!this.editTag) {
			if (this.tag) {
				this.visitorsForm.setFieldValue("visitors.em_id", View.user.employee.id);
				this.visitorsForm.setFieldValue("visitors.dv_id", View.user.employee.organization.divisionId);
				this.visitorsForm.setFieldValue("visitors.dp_id", View.user.employee.organization.departmentId);
				var restriction = new Ab.view.Restriction();
				restriction.addClause("em.em_id", View.user.employee.id, "=");
				var emDsRecords = this.emDS.getRecords(restriction);
				if (emDsRecords.length > 0) {
					var blId = emDsRecords[0].getValue("em.bl_id");
					var flId = emDsRecords[0].getValue("em.fl_id");
					var rmId = emDsRecords[0].getValue("em.rm_id");
					this.visitorsForm.setFieldValue("visitors.bl_id", blId);
					this.visitorsForm.setFieldValue("visitors.fl_id", flId);
					this.visitorsForm.setFieldValue("visitors.rm_id", rmId);
				}
				this.visitorsForm.setFieldValue("visitors.date_start", this.dateStart);
				this.visitorsForm.setFieldValue("visitors.date_end", this.dateEnd);
			}
			this.visitorsForm.setFieldValue("visitors.entered_by", View.user.name);
			this.visitorsForm.setFieldValue("visitors.authorized_by", View.user.name);
		}this.editTag=false;
	}
})
/**
 * Refresh form by left visitor value
 */
function showDetails(){
	View.controllers.get('visitorController')['editTag']=true;
    var grid = View.panels.get('visitorsGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var visitorId = selectedRow["visitors.visitor_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("visitors.visitor_id", visitorId, "=");
    View.panels.get('visitorsForm').refresh(restriction,false);
}


