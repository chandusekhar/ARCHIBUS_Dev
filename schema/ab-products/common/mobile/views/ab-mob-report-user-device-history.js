var abMobReportUserDeviceHistoryController = View.createController('abMobReportUserDeviceHistoryController', {
	afterInitialDataFetch: function(){
        this.ab_afm_mob_dev_reg_log_console.setFieldValue("date_registered.from", dateAddDays(new Date(), -1));
    },
    
    ab_afm_mob_dev_reg_log_console_onClear: function(){
    	this.ab_afm_mob_dev_reg_log_console.setFieldValue("date_registered.from", dateAddDays(new Date(), -1));
    },
    
    ab_afm_mob_dev_reg_log_console_onSearch: function(){
    	var restriction = this.getFilterRestriction();
    	this.ab_afm_mob_dev_reg_log_list.refresh(restriction);
    },
    
    /**
     * Read filter values and return restriction object.
     * @returns {*} sql restriction
     */
    getFilterRestriction: function () {
        var restriction = "1=1 ";
        var filterPanel = this.ab_afm_mob_dev_reg_log_console;
        filterPanel.fields.each(function (field) {
            var id = field.getId();
            if (valueExists(field.fieldDef)
                && valueExistsNotEmpty(filterPanel.getFieldValue(id))) {
	                var value = filterPanel.getFieldValue(id);
	                if (field.fieldDef.isDate) {
	                    if ('date_registered.from' === id) {
	                        restriction += " AND afm_mob_dev_reg_log.date_registered >= ${sql.date('" + value + "')}";
	                    } else if ('date_registered.to' === id) {
	                        restriction += " AND afm_mob_dev_reg_log.date_registered <= ${sql.date('" + value + "')}";
	                    }
	                } else {
	                    restriction += " AND " + id + " = '" + value + "'";
	                }
            }
        });
        return restriction;
    }
});

/**
 * Calculate and return the date with nxtdays number of days after date_start.
 * @param date_start
 * @param nxtdays
 * @returns {String}
 */
function dateAddDays(date_start, nxtdays){
    var date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}