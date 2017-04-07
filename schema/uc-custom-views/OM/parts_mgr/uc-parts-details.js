
var ucPartsDetail = View.createController('ucPartsDetail', {
	afterViewLoad: function(){

    },

	ucManageParts_partDetailsPanel_beforeSave: function() {
        var newNotes = this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.description.new');
        if (newNotes != "") {
            var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
            var currentDate = new Date();
            var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
                + "/" + currentDate.getDate();


            //Parse the hours to get the correct time.
            var curr_hour = currentDate.getHours();
            var am_pm = "";
            if (curr_hour < 12) {
                am_pm = "AM";
            }
            else {
                am_pm = "PM";
            }
            if (curr_hour == 0) {
                curr_hour = 12;
            }
            if (curr_hour > 12) {
                curr_hour = curr_hour - 12;
            }

            // add leading 0 to minutes if needed.
            var curr_min = currentDate.getMinutes();
            curr_min = curr_min + "";
            if (curr_min.length == 1) {
                curr_min = "0" + curr_min;
            }



            var timeString = curr_hour + ":" + curr_min + " " + am_pm;

            var cfNotes = this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.description');

            // For Firefox: (replace lone \n chars with \r\n)
            newNotes = replaceLF(newNotes);

            //cfNotes = currentUser + " - " + dateString + " : " + newNotes + "\n\n" + cfNotes;
            cfNotes = cfNotes.replace(/\n\n/g, "\r\n") + "\r\n\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

            this.ucManageParts_partDetailsPanel.setFieldValue('wr_other.description', cfNotes);
            this.ucManageParts_partDetailsPanel.setFieldValue('wr_other.description.new', "");
        }

        // If status changed update date_status_changed
        if (this.ucManageParts_partDetailsPanel.getFieldValue('wr_other.fulfilled')
            != this.ucManageParts_partDetailsPanel.getOldFieldValues()['wr_other.fulfilled']) {
            var today = new Date();
            this.ucManageParts_partDetailsPanel.setFieldValue("wr_other.date_status_changed",
				this.wrdetails_ds.formatValue("wr_other.date_status_changed", today, true));
        }
	}
});

function partsDetailsAfterSave() {
    var panel = View.panels.get("ucManageParts_bottomPanel");
    if (panel) {
        panel.refresh();
    }


    panel = View.panels.get("ucManageParts_topPanel");
    if (panel) {
        panel.refresh();
    }
}


//*****************************************************************************
//Replaces lone LF (\n) with CR+LF (\r\n)
//*****************************************************************************
function replaceLF(value)
{
 String.prototype.reverse = function () {
     return this.split('').reverse().join('');
 };

 return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
}