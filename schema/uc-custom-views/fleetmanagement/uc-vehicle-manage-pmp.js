var bolPMDD  = false;
var ucManagePmp = View.createController('ucManagePmp', {
	dflt_eq_std:"",dflt_tr_id:"FLEET",
	afterViewLoad: function(){
	   //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
		
		var strHref = window.location.href;
  		
  		//find out if there are any 
  		if ( strHref.indexOf("?") > -1 ){
			var rest = "1=1"
    		var strQueryString = strHref.substr(strHref.indexOf("?")+1);
    		var aQueryString = strQueryString.split("&");
    		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
     			if (aQueryString[iParam].indexOf("=") > -1 ){
        			var aParam = aQueryString[iParam].split("=");
        			if(aParam[0].toLowerCase() == String('tr_id').toLowerCase()){
        				this.dflt_tr_id = unescape(aParam[1]);
						rest += " and pmp.tr_id=" + restLiteral(this.dflt_tr_id)
						this.pmp_details.fields.get('pmp.tr_id').config.value=this.dflt_tr_id
					}
					else if(aParam[0].toLowerCase() == String('eq_std').toLowerCase()){
        				this.dflt_eq_std = unescape(aParam[1]);
						rest += " and pmp.eq_std=" + restLiteral(this.dflt_eq_std)
						this.pmp_details.fields.get('pmp.eq_std').config.value=this.dflt_eq_std
					}
        		}
      		}
			this.pmp_drilldown.restriction = rest
    	}
    },
	
	
	

	pmp_details_beforeSave: function() {
		// check to ensure that step instructions have been entered.
		if (this.pmps_details.getFieldValue("pmps.instructions") == "") {
			this.pmps_details.addInvalidField("pmps.instructions", "Instructions cannot be blank.");
			this.pmps_details.validationResult.valid = true;
			this.pmps_details.displayValidationResult({message:''});
			return false;
		}
		bolPMDD = false;
		frm = this.pmp_details
		if (!frm.record.isNew) {
			if (!bolPMDD) {bolPMDD = frm.record.getValue('pmp.interval_type') != frm.getFieldValue('pmp.interval_type')}
			if (!bolPMDD) {bolPMDD = frm.record.getValue('pmp.interval_rec') != frm.getFieldValue('pmp.interval_rec')}
		}
	},



	pmps_details_beforeSave: function() {
		// copy down the pmp_id from the details panel and always set the
		// step id to 0
		if (this.pmps_details.record.isNew) {
			this.pmps_details.setFieldValue("pmps.pmps_id", 0);
			this.pmps_details.setFieldValue("pmps.pmp_id", this.pmp_details.getFieldValue("pmp.pmp_id"));
		}
		//If the interval_type or interval_rec changes then rerun the PMDD for this pmp
		if (bolPMDD) {
			PMSRest = "pms.pmp_id in (" + restLiteral(this.pmp_details.getFieldValue('pmp.pmp_id')) + ")"
		//	PMSRest = PMSRest + " and (exists (select 1 from pmp where pmp.pmp_id = pms.pmp_id and pmp.pmp_type <> 'EQ')"
		//	PMSRest = PMSRest + " or exists (select 1 from eq where eq.eq_id = pms.eq_id and eq.status = 'in'))"
			var parameters = {
				"pmsidRestriction": PMSRest
			}
			try {
				var result = Workflow.call('AbBldgOpsOnDemandWork-pmddScheduledDates-BRGPmScheduleGenerator', parameters);
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}
	},

	pmp_details_beforeDelete: function() {
		var deleteOk = false;

		var pmpToDelete = this.pmp_details.getFieldValue("pmp.pmp_id");
		var restriction = "pmp_id = "+restLiteral(pmpToDelete)+" AND (EXISTS (SELECT 1 FROM pms WHERE pms.pmp_id = pmp.pmp_id) OR EXISTS (SELECT 1 FROM wr WHERE wr.pmp_id = pmp.pmp_id))";
		var pmpId = UC.Data.getDataValue('pmp', 'pmp_id', restriction);

		if (pmpId != null && pmpId == pmpToDelete) {
			deleteOk = false;
			View.showMessage("There are active schedules and/or Work Requests associated with this procedure.  Please contact an Administrator to remove.");
		}
		else {
			deleteOk = true;
		}


		return deleteOk;
	}
});

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}