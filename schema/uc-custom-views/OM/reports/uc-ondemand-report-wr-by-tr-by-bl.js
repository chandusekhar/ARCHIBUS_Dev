var brgOndRptWrbyWrByBlController = View.createController('brgOndRptWrbyWrByBlController', {
    zone_restriction : null,

	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

		this.reportPanel.getItemHtml = function(cellId, cellValue, clickable) {
			/*
			if (cellId.match(/_f4/) != null) {
				// blank line column
				cellValue = "";
			}

			var cellStyle = "";
			if (cellId.match(/_f3/) != null) {
				// check if greater than 3.5, if so, set background color
				var floatValue = parseFloat(cellValue);
				if (floatValue != "NaN" && floatValue < 3.5) {
					cellStyle= " style='font-weight: bold' "
				}
			}
			*/
			var cellStyle = "";
			if (cellValue == "*") {
				cellValue = "";
			}

			if (!valueExists(clickable)) {
				clickable = this.clickable;
			}

			if (clickable) {
				return ('<a id="' + cellId + '" '+cellStyle+' href="javascript: //">' + cellValue + '</a>');
			} else {
				return (cellValue);
				//return ('<span id="' + cellId + '"'+cellStyle+'>' + cellValue + '</span>');
			}
		}
    },

    afterInitialDataFetch : function() {
        this.setNATitle();
    },

    setNATitle: function() {
        //var firstColumn = Ext.get('reportPanel_column_c0');
        var firstColumn = document.getElementById('reportPanel_column_c0');
        if (firstColumn != null){
            if(firstColumn.innerText == undefined
                    || firstColumn.innerText == 'undefined'){
                firstColumn.innerHTML = "N/A";
            }
        }
    }
});

function onCrossTableClick(obj){
    var restrictionObj = obj.restriction;
	var restriction = View.panels.get("reportPanel").restriction;
    if (restriction == null) {
        restriction = "1=1";
    }

    var trClause = restrictionObj.findClause("wr.tr_id");
    if (trClause != null && trClause.value != '') {
        restriction += " AND tr_id = '"+trClause.value.replace(/'/g,"''")+"'";
    } else if (trClause.value == "") {
        restriction += " AND tr_id IS NULL";
    }

    var blClause = restrictionObj.findClause("wr.bl_id");
    if (blClause != null && blClause.value != '') {
        restriction += " AND bl_id = '"+blClause.value.replace(/'/g,"''")+"'";
    } else if (blClause.value == "") {
        restriction += " AND bl_id IS NULL";
    }

    var statusClause = restrictionObj.findClause("wr.status");
    if (statusClause != null) {
        restriction += " AND status = '"+statusClause.value.replace(/'/g,"''")+"'";
    }

	if (brgOndRptWrbyWrByBlController.zone_restriction != null) {
		restriction += abOndRptWrOver31Controller.zone_restriction;
	}

/*
	//find date 30 back
	var currentDate = new Date();
	var dateminus30 = new Date(currentDate-30);

	var day= dateminus30.getDate();
	var year=dateminus30.getFullYear();
	var month= dateminus30.getMonth();

	var datestring = year + "-" + month + "-" + day;

	//add restriction clause for > 30 days old
	restriction.addClause(
		'wr.date_requested',
		datestring,
		'&lt;=');
*/

    View.openDialog("uc-ondemand-report-requests-open.axvw", restriction);
}

function apply_console_restriction() {
	var console = View.panels.get("requestConsole");
	var restriction = " 1 = 1 ";

    var tr_id = console.getFieldValue('wr.tr_id');
    if (tr_id != '') {
        restriction += " AND tr_id = "+restLiteral(tr_id);
    }

    var bl_id = console.getFieldValue('wr.bl_id');
    if (bl_id != '') {
        restriction += " AND bl_id = "+restLiteral(bl_id);
    }

	var zone_id = console.getFieldValue('wr.zone_id');
	if (zone_id != '') {
		restriction += " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
		brgOndRptWrbyWrByBlController.zone_restriction = " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
	}
	else {
		brgOndRptWrbyWrByBlController.zone_restriction = null;
	}

    var date_from = console.getFieldValue('wr.date_requested.from');
    if (date_from != '') {
        restriction += " AND date_requested >= "+restLiteral(date_from);
    }

    var date_to = console.getFieldValue('wr.date_requested.to');
    if (date_to != '') {
        restriction += " AND date_requested <= "+restLiteral(date_to);
    }

	var reportView = View.panels.get("reportPanel");
	reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}