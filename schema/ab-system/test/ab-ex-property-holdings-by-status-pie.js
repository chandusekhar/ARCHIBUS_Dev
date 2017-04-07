 /******************************************************************************
	 ab-ex-property-holdings-by-status-pie.js for
	 ab-ex-property-holdings-by-status-pie-top.xsl
 ********************************************************************************/
var obj_svg = null;
var owned_value=0;
var leased_value=0;
var subleased_value=0;
function OnLoadEvent(event, PieChartSize, Size1, Size2, Size3)
{
	obj_svg = event.getTarget().getOwnerDocument();
	if(obj_svg!=null)
	{
		var PieStart = 0;
		var obj_owned_path = obj_svg.getElementById("owned_path");
		if(obj_owned_path!=null && Size1!="0")
		{
			PieStart = DrawPieSegment(PieStart, Size1, 100, obj_owned_path, 1);
		}
		var obj_leased_path = obj_svg.getElementById("leased_path");
		if(obj_leased_path!=null  && Size2!="0")
		{
			PieStart = DrawPieSegment(PieStart, Size2, 100, obj_leased_path, 2);
		}
		var obj_subleased_path = obj_svg.getElementById("subleased_path");
		if(obj_subleased_path!=null  && Size3!="0")
		{
			PieStart = DrawPieSegment(PieStart, Size3, 100, obj_subleased_path, 3);
		}
	}
	else
	{
		return;
	}
}

function DrawPieSegment(Start, Size, PieChartSize, Element, ID)
{
	var PathData = "M0,0L" ;
	PathData = PathData + PieChartSize * Math.sin(Start * Math.PI * 2) + "," + (PieChartSize * Math.cos(Start * Math.PI * 2));
	if (Size >= 0.5)
		PathData = PathData + "A" + PieChartSize + " " + PieChartSize + " 1 1 0 " + PieChartSize * Math.sin((Start + Size) * Math.PI * 2) + "," + (PieChartSize * Math.cos((Start + Size) * Math.PI * 2));
	else
		PathData = PathData + "A" + PieChartSize + " " + PieChartSize + " 0 0 0 " + PieChartSize * Math.sin((Start + Size) * Math.PI * 2) + "," + (PieChartSize * Math.cos((Start + Size) * Math.PI * 2));
	PathData = PathData + "z";

	Element.setAttribute("d", PathData);

	return (Start + Size);

}

function showDetail(ID, strStatus, strArea)
{
	var strText_area   = "";
	if(ID=="Owned")
	{
		strText_area=owned_value;
		if(strText_area=="")
			strText_area="0.0";
	}
	if(ID=="Leased")
	{
		strText_area=leased_value;
		if(strText_area=="")
			strText_area="0.0";
	}
	if(ID=="Owned and Subleased")
	{
		strText_area=subleased_value;
		if(strText_area=="")
			strText_area="0.0";
	}
	
	var obj_Detail_status = obj_svg.getElementById("detail_status");
	obj_Detail_status.setAttribute("display","");
	obj_Detail_status = obj_Detail_status.getFirstChild();
	obj_Detail_status.setData(strStatus+" "+ID);
	
	var obj_Detail_area = obj_svg.getElementById("detail_area");
	obj_Detail_area.setAttribute("display","");
	obj_Detail_area = obj_Detail_area.getFirstChild();
	obj_Detail_area.setData(strArea+" "+strText_area);

}

function hideDetail()
{
	var obj_Detail_status = obj_svg.getElementById("detail_status");
	obj_Detail_status.setAttribute("display","none");
	var obj_Detail_area = obj_svg.getElementById("detail_area");
	obj_Detail_area.setAttribute("display","none");
}

function showDetailAxvw(strStatus)
{
	var strURLLink = "";
	if (strStatus === "leased") {
		strURLLink = "ab-ex-property-holdings-by-status-pie-report-leased.axvw";
	} else if (strStatus === "owned") {
		strURLLink = "ab-ex-property-holdings-by-status-pie-report-owned.axvw";
	} else if (strStatus === "owned-subleased") {
		strURLLink = "ab-ex-property-holdings-by-status-pie-report-owned-subleased.axvw";
	}
	
	//var strURLLink = viewFileName;
	var newWindow = openNewContent(strURLLink, "");
	if (newWindow) newWindow.focus();
}
