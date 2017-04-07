var fundingSourcesEditController = View.createController('fundingSourcesEdit', {
	
	fundingSourcesEdit_detailsPanel_beforeSave : function() {
    	var date_start = getDateObject(this.fundingSourcesEdit_detailsPanel.getFieldValue('funding.date_avail'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.fundingSourcesEdit_detailsPanel.getFieldValue('funding.date_avail_end'));
    	if (date_end && date_start && (date_end < date_start)) {
    		this.fundingSourcesEdit_detailsPanel.addInvalidField('funding.date_avail_end', getMessage('endBeforeStart'));
    		return false;
    	}
    	return true;
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}