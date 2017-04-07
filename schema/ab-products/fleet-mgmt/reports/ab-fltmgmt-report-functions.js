
function ISODate(date) {
	if(date.split("/").length == 3) {
		return date.split("/")[2]+"-"+date.split("/")[0]+"-"+date.split("/")[1];
	}
	if(date.split("-").length == 3) {
		return date;
	}
	return "1899-12-30";
}

function showDOxDatePerform(row) {
	//alert("Date is: "+ISODate(row["flt_order_type_by_date_perf.date_perform"]));
	var do_panel=View.panels.get("panel_do");
	if(do_panel != null) {
		do_panel.show(true);
		do_panel.refresh("flt_order.date_perform='"+ISODate(row["flt_order_type_by_date_perf.date_perform"])+"'");
	}
}

function showROxDatePerform(row) {
	var ro_panel=View.panels.get("panel_ro");
	if(ro_panel != null) {
		ro_panel.show(true);
		ro_panel.refresh("flt_order.date_perform='"+ISODate(row["flt_order_type_by_date_perf.date_perform"])+"'");
	}
}

function showHistDOxDatePerform(row) {
	var do_panel=View.panels.get("panel_do");
	if(do_panel != null) {
		do_panel.show(true);
		do_panel.refresh("flt_horder.date_perform='"+ISODate(row["flt_horder_type_by_date_perf.date_perform"])+"'");
	}
}

function showHistROxDatePerform(row) {
	var ro_panel=View.panels.get("panel_ro");
	if(ro_panel != null) {
		ro_panel.show(true);
		ro_panel.refresh("flt_horder.date_perform='"+ISODate(row["flt_horder_type_by_date_perf.date_perform"])+"'");
	}
}

function showPartUsageHistory(row) {
	var it_panel=View.panels.get("panel_it");
	if(it_panel != null) {
		it_panel.show(true);
		it_panel.refresh("it.part_id='"+row["it.part_id"]+"'");
	}
}

function showPartDetails(row) {
	View.openDialog("ab-fltmgmt-report-parts-inventory-details.axvw", "part_id='"+row["it.part_id"]+"'", false);
}