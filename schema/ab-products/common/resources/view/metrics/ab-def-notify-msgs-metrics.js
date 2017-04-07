/**

* @author Zhang Yi

*/
var defNotificationMessageController = View.createController('defNotificationMessageController',
{
	afterInitialDataFetch: function(){
		//initial array of values and texts show in drop-down list "Message Purpose"
		var valueArray = new Array( "NOTIFY_TEMPLATE_SUBJECT_METRICS", "NOTIFY_TEMPLATE_BODY_METRICS");
		var textArray = new Array( getMessage("subject"), getMessage("body"));
		initialDropdownList("referenced", valueArray, textArray);
		//set translated values to custom field "Message Purpose" in grid by set SQL parameters
		this.abMessages_bottomPanel.addParameter('subject',getMessage("subject"));
 		this.abMessages_bottomPanel.addParameter('body',getMessage("body"));
		//show and refresh grid after translatable configuration
		this.abMessages_bottomPanel.show(true);
		this.abMessages_bottomPanel.refresh();
   },

	abMessages_detailsPanel_afterRefresh: function(){
		//set default values to new record
		if(this.abMessages_detailsPanel.newRecord){
			this.abMessages_detailsPanel.setFieldValue("messages.activity_id", "AbSystemAdministration");
			setOptionValue('referenced', "NOTIFY_TEMPLATE_SUBJECT_METRICS");
			this.abMessages_detailsPanel.setFieldValue("messages.referenced_by", "NOTIFY_TEMPLATE_SUBJECT_METRICS");
		} 
		else {
			setOptionValue('referenced', this.abMessages_detailsPanel.getFieldValue('messages.referenced_by'));
		}

		this.abMessages_detailsPanel.enableField("messages.activity_id" ,false);
    },

	onReferenceByChange:function(){
		this.abMessages_detailsPanel.setFieldValue("messages.referenced_by",$('referenced').value);
	}
});

//initial custom dropdown list
function initialDropdownList(selectId, valueArray, textArray){
	// get dropdown list by itemSelectId
	var itemSelect = $(selectId);
	//populate select items to dropdown list and set default value
	itemSelect.innerHTML = '';
    for (var i = 0; i < valueArray.length; i++) {
        var item = valueArray[i];
        var option = document.createElement('option');
        option.value = item;
        option.appendChild(document.createTextNode(textArray[i]));
        itemSelect.appendChild(option);
    }
    //set default value to dropdown list
	itemSelect.options[0].setAttribute('selected', true);
}

//set value selected in a drop down list
function setOptionValue(selectId, value){
		// get dropdown list by itemSelectId
		var itemSelect = $(selectId);
		// select given value as selected in dropdown list 
		var index = 0;
		for (var i = 0; i < itemSelect.options.length; i++) {
			var option = itemSelect.options[i];
			if(option.value==value){
				index = i;
				break;
			}
		}
		//set  value to dropdown list
		itemSelect.options[index].selected = true;
	}
