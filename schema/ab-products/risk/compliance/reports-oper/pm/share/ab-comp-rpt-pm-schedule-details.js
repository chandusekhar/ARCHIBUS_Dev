/**
 *	 Added for 22.1 Compliance_BldgOps_Integration - Work History Tab - tab3.
 * By Zhang Yi, 2015.04.30.
 */
var abCompRptPmsDetailsCtrl = View.createController('abCompRptPmsDetailsCtrl', {
    afterInitialDataFetch: function(){
		if ( this.pms_basic.getFieldValue("pms.pms_id") )	 {
			if ( this.pms_basic.getFieldValue("pms.eq_id") ) {
				this.pms_eq_basic.show(true);	
				this.pms_rm_basic.show(false);	
			}
			else {
				this.pms_eq_basic.show(false);	
				this.pms_rm_basic.show(true);	
			}
			this.pms_schedule.show(true);
			this.pms_other.show(true);
		}
    }
});
