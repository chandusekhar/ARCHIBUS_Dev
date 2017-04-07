 /******************************************************************************
	 ab-ex-cost-vs-budget-for-accounts-stacked-bar.js for
	 ab-ex-cost-vs-budget-for-accounts-stacked-bar.xsl
 ********************************************************************************/
//set up in ab-ex-property-budget-projections-bar.xsl
var arrValues = new Array();
var currencySymbol = "$";
var obj_svg = null;

var column1_cost = 0;
var column1_budget = 0;

var column2_cost = 0;
var column2_budget = 0;

var column3_cost = 0;
var column3_budget = 0;

///
function OnLoadEvent(event, strCurrencySymbol)
{
	currencySymbol = strCurrencySymbol;
	var totalBarHeight = 280;//300;
	var barHeight = 0;
	var offY = 300;
	
	var barHeight_cost = 0;
	var barHeight_budget = 0;
			
	var max_total = 1.0;
	
	var column1_total = 0.0;
	var column2_total = 0.0;
	var column3_total = 0.0;
	
	column1_cost = arrValues["1993-GENL-MAINT-cost"];
	column1_budget = arrValues["1993-GENL-MAINT-budget"];
	column2_cost = arrValues["1993-OVERHEAD-cost"];
	column2_budget = arrValues["1993-OVERHEAD-budget"];
	column3_cost = arrValues["1993-RESEARCH-cost"];
	column3_budget = arrValues["1993-RESEARCH-budget"];

	obj_svg = event.getTarget().getOwnerDocument();
	
	column1_cost = convert2Float(column1_cost);
	column1_budget = convert2Float(column1_budget);

	column2_cost = convert2Float(column2_cost);
	column2_budget = convert2Float(column2_budget);

	column3_cost = convert2Float(column3_cost);
	column3_budget = convert2Float(column3_budget);

	column1_total = column1_cost + column1_budget;
	column2_total = column2_cost + column2_budget;
	column3_total = column3_cost + column3_budget;

	
	max_total = returnMax(column1_total, column2_total, column3_total);

	//
	if(max_total > 1.0)
	{
		var obj_pMax = obj_svg.getElementById("pMax");
		obj_pMax = obj_pMax.getFirstChild();
		obj_pMax.setData(currencySymbol + max_total);
	}
	
	barHeight = totalBarHeight*(column1_total/max_total);
	//offY = totalBarHeight - barHeight;
	offY = totalBarHeight - barHeight + 20;
	barHeight_cost = barHeight*(column1_cost/column1_total);
	barHeight_budget = barHeight - barHeight_cost;
	createBar(obj_svg, "1993-GENL-MAINT-cost", barHeight_cost, offY);
	createBar(obj_svg, "1993-GENL-MAINT-budget", barHeight_budget, offY+barHeight_cost);

	barHeight = totalBarHeight*(column2_total/max_total);
	//offY = totalBarHeight - barHeight;
	offY = totalBarHeight - barHeight + 20;
	barHeight_cost = barHeight*(column2_cost/column2_total);
	barHeight_budget = barHeight - barHeight_cost;
	createBar(obj_svg, "1993-OVERHEAD-cost", barHeight_cost, offY);
	createBar(obj_svg, "1993-OVERHEAD-budget", barHeight_budget, offY+barHeight_cost);

	barHeight = totalBarHeight*(column3_total/max_total);
	//offY = totalBarHeight - barHeight;
	offY = totalBarHeight - barHeight + 20;
	barHeight_cost = barHeight*(column3_cost/column3_total);
	barHeight_budget = barHeight - barHeight_cost;
	createBar(obj_svg, "1993-RESEARCH-cost", barHeight_cost, offY);
	createBar(obj_svg, "1993-RESEARCH-budget", barHeight_budget, offY+barHeight_cost);
}

//
function createBar(obj_svg, elemColumnID, height, offY)
{
	var obj_column = obj_svg.getElementById(elemColumnID);
	obj_column.setAttribute("y", offY);
	obj_column.setAttribute("height", height);
}

function convert2Float(strInput)
{
	if(strInput=="")
		strInput = "0.0";
	return parseFloat(strInput);
}

function returnMax(num1, num2, num3)
{
	var max = 1.0;
	if(max < num1)
		max = num1;
	if(max < num2)
		max = num2;
	if(max < num3)
		max = num3;

	return max;
}

function hideDetail()
{
	var obj_Detail_title = obj_svg.getElementById("detail_title");
	obj_Detail_title.setAttribute("display","none");
	var obj_Detail_cost = obj_svg.getElementById("detail_cost");
	obj_Detail_cost.setAttribute("display","none");
	var obj_Detail_budget = obj_svg.getElementById("detail_budget");
	obj_Detail_budget.setAttribute("display","none");
}

function showDetail(ID, strAccount, strCost, strBudget)
{
	var strText_cost = "";
	var strText_budget = "";
	if(ID=="1993-GENL-MAINT")
	{
		strText_cost = column1_cost;
		strText_budget = column1_budget;
	}
	if(ID=="1993-OVERHEAD")
	{
		strText_cost = column2_cost;
		strText_budget = column2_budget;
	}
	if(ID=="1993-RESEARCH")
	{
		strText_cost = column3_cost;
		strText_budget = column3_budget;
	}
	
	var obj_Detail_title = obj_svg.getElementById("detail_title");
	obj_Detail_title.setAttribute("display","");
	obj_Detail_title = obj_Detail_title.getFirstChild();
	obj_Detail_title.setData(strAccount+": "+ID);
	
	var obj_Detail_cost = obj_svg.getElementById("detail_cost");
	obj_Detail_cost.setAttribute("display","");
	obj_Detail_cost = obj_Detail_cost.getFirstChild();
	obj_Detail_cost.setData(strCost+": "+currencySymbol+strText_cost);
	
	var obj_Detail_budget = obj_svg.getElementById("detail_budget");
	obj_Detail_budget.setAttribute("display","");
	obj_Detail_budget = obj_Detail_budget.getFirstChild();
	obj_Detail_budget.setData(strBudget+": "+currencySymbol+strText_budget);
}