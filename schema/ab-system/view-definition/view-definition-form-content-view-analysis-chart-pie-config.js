/******************************************************************
	Yong Shao
	3-03-2005
 ******************************************************************/
var chart_type  = "";
//var chart_title = "";
var chart_cat_label="";
var chart_val_label="";
var chart_width = "";
var chart_height = "";
var chart_orientation = "";
var chart_show_cat_gridline="";
var chart_show_val_gridline="";
var chart_show_item_tooltip="";
var chart_show_item_label="";
var chart_show_cat_label_by_way="";
var chart_show_legend="";
var chart_show_Title="";

function setChartProperties()
{
	if(opener!=null)
	{
		chart_type  = opener.chart_type;
		chart_width = opener.chart_width;
		chart_width = trim(chart_width);
		chart_height = opener.chart_height;
		chart_height = trim(chart_height);
		
		chart_show_item_tooltip=opener.chart_show_item_tooltip;
		chart_show_item_tooltip = trim(chart_show_item_tooltip);
		chart_show_item_label=opener.chart_show_item_label;
		chart_show_item_label = trim(chart_show_item_label);

		chart_show_legend=opener.chart_show_legend;
		chart_show_legend = trim(chart_show_legend);
		
		chart_show_Title=opener.chart_show_Title;
		chart_show_Title = trim(chart_show_Title);
		
		var objChartW = document.getElementById("Width");
		if(chart_width!="")
		{
			
			for(var i=0; i<objChartW.length; i++){
				if(objChartW[i].value==chart_width)
				{
					objChartW[i].selected=1;
					break;
				}
			}
		}else{
			
			for(var i=0; i<objChartW.length; i++){
				if(objChartW[i].value=="600")
				{
					objChartW[i].selected=1;
					break;
				}
			}
		}
		var objChartH = document.getElementById("Height");
		if(chart_height!="")
		{
			
			for(var i=0; i<objChartH.length; i++){
				if(objChartH[i].value==chart_height)
				{
					objChartH[i].selected=1;
					break;
				}
			}
		}else{
			for(var i=0; i<objChartH.length; i++){
				if(objChartH[i].value=="500")
				{
					objChartH[i].selected=1;
					break;
				}
			}
		}
		
		if(chart_show_Title!="" && chart_show_Title=="true")
		{
			document.getElementById("YES_Title").checked=1;
			document.getElementById("NO_Title").checked=0;
		}else{
			document.getElementById("YES_Title").checked=0;
			document.getElementById("NO_Title").checked=1;
		}
		
		if(chart_show_legend!="" && chart_show_legend=="true")
		{
			document.getElementById("YES_Legend").checked=1;
			document.getElementById("NO_Legend").checked=0;
		}else{
			document.getElementById("YES_Legend").checked=0;
			document.getElementById("NO_Legend").checked=1;
		}
		
		if(chart_show_item_tooltip!="" && chart_show_item_tooltip=="true")
		{
			document.getElementById("YES_Tooltip").checked=1;
			document.getElementById("NO_Tooltip").checked=0;
		}else{
			document.getElementById("YES_Tooltip").checked=0;
			document.getElementById("NO_Tooltip").checked=1;
		}
		
		if(chart_show_item_label!="" && chart_show_item_label=="true")
		{
			document.getElementById("YES_ItemLabel").checked=1;
			document.getElementById("NO_ItemLabel").checked=0;
		}else{
			document.getElementById("YES_ItemLabel").checked=0;
			document.getElementById("NO_ItemLabel").checked=1;
		}
	}

}

function onOK()
{
	//opener.chart_cat_label = document.getElementById("Cat_label").value;
	//opener.chart_val_label =
	//document.getElementById("Val_label").value;
	var objChartW = document.getElementById("Width");
	for(var i=0; i<objChartW.length; i++){
		if(objChartW[i].selected)
		{
			opener.chart_width = objChartW[i].value;
			break;
		}
	}
	var objChartH = document.getElementById("Height");
	for(var i=0; i<objChartH.length; i++){
		if(objChartH[i].selected)
		{
			opener.chart_height = objChartH[i].value;
			break;
		}
	}

	if(document.getElementById("YES_Title").checked)
		opener.chart_show_Title="true";
	else
		opener.chart_show_Title="false";
	
	if(document.getElementById("YES_Legend").checked)
		opener.chart_show_legend="true";
	else
		opener.chart_show_legend="false";
	
	if(document.getElementById("YES_Tooltip").checked)
		opener.chart_show_item_tooltip="true";
	else
		opener.chart_show_item_tooltip="false";
	
	if(document.getElementById("YES_ItemLabel").checked)
		opener.chart_show_item_label="true";
	else
		opener.chart_show_item_label="false";
	


}