/*********************************************************************
 JavaScript File: ab-rm-reserve-detail.js

 Yong Shao
 12/11/2003

 *********************************************************************/
//overwritten by ab-rm-reserve-detail.xsl
var rm_reserve_bl_id = "";
var rm_reserve_fl_id = "";
var rm_reserve_rm_id = "";

var rm_reserve_contact = "";

var rm_reserve_date_start = "";
var rm_reserve_date_end = "";
var rm_reserve_time_start = "";
var rm_reserve_time_end = "";

function makingRoomReservation(em_em_id)
{
	rm_reserve_contact = em_em_id;

        rm_reserve_date_start = getCookie("ab_rm_reserve_date_start_cookies");
        rm_reserve_date_end = getCookie("ab_rm_reserve_date_end_cookies");
	rm_reserve_time_start = getCookie("ab_rm_reserve_time_start_cookies");
	rm_reserve_time_end = getCookie("ab_rm_reserve_time_end_cookies");

	var strURLLink = "ab-rm-reserve-detail-ok-cancel.axvw";
	var newWindow = openNewContent(strURLLink, "");
	if (newWindow) newWindow.focus();
}

