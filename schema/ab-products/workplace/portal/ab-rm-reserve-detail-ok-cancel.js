/**
 * @author keven.xi
 */
var rmreserveDialog = View.createController('dialog', {

    roomReserve_onSave: function(){
        var openerController = View.getOpenerView().controllers.get('rmreserveController');
        
        this.roomReserve.setFieldValue("rm_reserve.bl_id", openerController.blId);
        this.roomReserve.setFieldValue("rm_reserve.fl_id", openerController.flId);
        this.roomReserve.setFieldValue("rm_reserve.rm_id", openerController.rmId);
        this.roomReserve.setFieldValue("rm_reserve.date_start", openerController.dateStart);
        this.roomReserve.setFieldValue("rm_reserve.date_end", openerController.dateEnd);
        this.roomReserve.setFieldValue("rm_reserve.time_start", openerController.timeStart);
        this.roomReserve.setFieldValue("rm_reserve.time_end", openerController.timeEnd);
        this.roomReserve.setFieldValue("rm_reserve.status", 'Req');
        this.roomReserve.setFieldValue("rm_reserve.area_desired", 0);
        this.roomReserve.setFieldValue("rm_reserve.ac_id", '');
        this.roomReserve.setFieldValue("rm_reserve.option1", '');
        
        if (this.roomReserve.save()) {
            var rmReserveId = this.roomReserve.restriction.clauses[0].value;
            // call the callback if it is set
            openerController.afterRoomReserved(rmReserveId);
            View.closeThisDialog();
        }
    }
});

function closeDialog(){
    View.closeThisDialog();
}
