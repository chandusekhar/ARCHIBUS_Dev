 /******************************************************************************
	 ab-ex-property-budget-projections-bar.js for
	 ab-ex-property-budget-projections-bar.xsl
 ********************************************************************************/
//set up in ab-ex-property-budget-projections-bar.xsl
var arrValues = new Array();

///
function OnLoadEvent(event, currencySymbol)
{
	var maxValue   = 1.0;
	var totalBarHeight = 180;//200;
	var curDate = new Date();
	var year  = curDate.getFullYear();
	var startPoint = 40;
	var barHeight = 0;
	

	var currentValue = 0.0;
	var absCurrentValue = 0.0;
	
	var obj_svg = event.getTarget().getOwnerDocument();
	if(obj_svg!=null)
	{
		//max one from arrValues
		for(var name in arrValues)
		{
			currentValue = arrValues[name];
			if(currentValue=="")
				currentValue = "0.0";
			currentValue = parseFloat(currentValue);
			
			absCurrentValue = Math.abs(currentValue);
			if((maxValue - absCurrentValue) < 0.0)
			   maxValue = absCurrentValue;
		}
		///
		if(maxValue > 0.0)
		{
			var obj_pMax = obj_svg.getElementById("pMax");
			obj_pMax = obj_pMax.getFirstChild();
			obj_pMax.setData(maxValue+"("+currencySymbol+")");
			var obj_nMax = obj_svg.getElementById("nMax");
			obj_nMax = obj_nMax.getFirstChild();
			obj_nMax.setData(-maxValue+"("+currencySymbol+")");
		}
		///
		for(var name in arrValues)
		{
			var offY = 200;
			currentValue = arrValues[name];
			if(currentValue=="")
				currentValue = "0.0";
			currentValue = parseFloat(currentValue);
			absCurrentValue = Math.abs(currentValue);
			
			barHeight = totalBarHeight*(absCurrentValue/maxValue);
			//alert("name: "+name + "||||" + barHeight);
			
			var obj_column = obj_svg.getElementById(name+"_column");
			var obj_text = obj_svg.getElementById(name+"_text");
			obj_text = obj_text.getFirstChild();
			//var strText = "($)" + obj_text.getData() + " ";
			var strText = year + "("+currencySymbol+"): " + currentValue;
			if(currentValue > 0.0)
			{
				offY = totalBarHeight - barHeight;
				offY = offY + 20;
				
			}
			
			//if(barHeight > 20)
				//barHeight = barHeight -20;
			//else
			//	barHeight = 2;
			//creating bar and changing text legend
			{
				createBar(obj_column, obj_text, barHeight, offY, strText);
			}
			
			year = year + 1;
		}
	}
	else
	{
		return;
	}
}

//
function createBar(elemColumn, elemText, height, offY, strText)
{
	elemText.setData(strText);
	elemColumn.setAttribute("y", offY);
	elemColumn.setAttribute("height", height);
}


