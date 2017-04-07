/*******************************************************
 afmViewDefinitionTree.js
 this is not used by any XSLT file
 (demo: using javascript classes to handle view's definition tree info
 instead of html form fields)
 *******************************************************/

var Debug = false;

function SetDebugVariable(strDebug)
{
	Debug = strDebug;
}
///////////////////Start of AbView Class////////////////////////////
/*******************************************************************
API:
 public interfaces:
 (1)constructior:
    new AbView(string:viewName)
 (2)properties:
	name(string)
	title(string)
	access(string)
	frameset(string)
	frame(string) 
	hotlist(string)
 (3)functions:
	setTitle(string:title)
	setAccess(string:access)
	setFrameset(string:frameset)
	setFrame(string:frame)
	setHotlist(string:hotlist)
	addView(string:viewName, object:viewObject)
		notes:If AbViewObject is null, AbView.AddView will create a new AbView object identified by strViewName and add it to current AbView object;
			  If AbViewObject is not null, add it to current AbView object. 
	addTgrp(string:tgrpName, object:tgrpObject)
		notes:If AbTgrpObject is null, AbView.AddTgrp will create a new AbTgrp object identified by strTgrpName and add it to current AbView object;
			  If AbTgrpObject is not null, add it to current AbView object.
	deleteView(string:viewName)
		notes:If the AbView object identified by strViewName is found,it will be deleted. 
	deleteTgrp(string:tgrpName)
		notes:If the AbTgrp object identified by strTgrpName is found,it will be deleted. 		  
	getView(string:viewName)
		notes:return a null object if required view object cannot be found, otherwise returned found view object
	getViews()
		notes:return an array object containing all sub view objects in current view object
	getTgrp(string:tgrpName)
		notes:return null if required tgrp object cannot be found,otherwise return found tgrp object
	getTgrps()
		notes:return an array object containing all tgrp objects in current view object
	searchViewByName(strViewName)  
	    notes:return null or found view object
	    notes:searchViewByName() will sreach thoroughly(including all
	    sub views); getView() or getViews() will only search direct sub
	    views
	getTgrpMarginLeft()
		notes: return an integer number
	setTgrpMarginLeft(iMarginLeft: integer)
 *******************************************************************/
/*******************************************************************
 example:
 var newViewObj = new AbView('roomStandard-room.axvw');
 alert(newViewObj.name);//showing "roomStandard-room.axvw"
 newViewObj.setTitle('Room Standard and Room');
 newViewObj.addTgrp('rm',null);
 var newTgrpObj = newViewObj.getTgrp('rm');
 newTgrpObj.setTitle('Rooms');
 newTgrpObj.addTable('rmstd');
 newTgrpObj.fldsOn('rm.bl_id;rm.fl_id;rm.rm_id;rm.name;rmstd.rm_std');
 var sencodViewObj = new AbView('XXXXXXXXXX.axvw');
 newViewObj.addView('XXXXXXXXXX.axvw',sencodViewObj);
 newViewObj.addView('YYYYYYYYYY.axvw',null);
 var thirdViewObj = newViewObj.getView('YYYYYYYYYY.axvw');
 ******************************************************************/
function AbView(strViewName)
{
	////private variables and functions: only accessible in object
	////var objView = new AbView('XXXX.axvw');
	////alert(objView.indexOfViews) ==> undefined error
	var indexOfViews  = 0;
	var indexOfTgrps  = 0;
	var iMarginLeft	  = 0;
	var arrObjViews	 = new Array();
	var arrObjTgrps  = new Array();
	////public property interfaces
	////var objView = new AbView('XXXX.axvw');
	////alert(objView.name) ==> "XXXX.axvw"
	this.name = strViewName ;
	this.title = "";
	this.access = "";
	this.frameset = "";
	this.frame    = "";
	this.hotlist  = "";
	////public function interfaces
	////var objView = new AbView('XXXX.axvw');
	////objView.setTitle('XXXXXXXX');
	//set title to current view:setTitle(strTitle)
	this.setTitle = function(strTitle)
	{
		this.title = strTitle;
	}
	//set access to current view:setAccess(strTitle)
	this.setAccess = function(strAccess)
	{
		this.access = strAccess;
	}
	//set frameset to current view:setFrameset(strFrameset)
	this.setFrameset = function(strFrameset)
	{
		this.frameset = strFrameset;
	}
	//set frame to current view:setFrame(strFrame)
	this.setFrame = function(strFrame)
	{
		this.frame = strFrame;
	}
	//set hotlist to current view:setHotlist(strHotlist)
	this.setHotlist = function(strHotlist)
	{
		this.hotlist = strHotlist;
	}
	//get required view object by its name(a shollow search): getView(strViewName)
	//return found one in its children views(a null or found view object)
	this.getView = function(strViewName)
	{
		var objReturnedView = null;
		for(var i= 0; i< arrObjViews.length; i++)
		{
			if(arrObjViews[i].name == strViewName )
			{
				objReturnedView = arrObjViews[i];
				break;
			}
		}
		return objReturnedView;
	}
	//get all view objects(only direct sub views): getViews()
	//(an array object)
	this.getViews = function()
	{
		return arrObjViews;
	}
	//get view's Table Group object by name: getTgrp(strTgrpName)
	//(a null or found Tgrp object)
	this.getTgrp = function(strTgrpName)
	{
		var objReturnedTgrp = null;
		for(var i= 0; i< arrObjTgrps.length; i++)
		{
			if(arrObjTgrps[i].name == strTgrpName )
			{
				objReturnedTgrp = arrObjTgrps[i];
				break;
			}
		}
		return objReturnedTgrp;
	}
	//get view's all Table Group objects: getTgrps()
	//(an array object)
	this.getTgrps = function()
	{
		return  arrObjTgrps;
	}
	//add new view object to current view:
	//addView(strViewName,addedViewObj)
	this.addView = function(strViewName, addedViewObj)
	{
		var objFoundView = this.getView(strViewName);
		if(objFoundView == null)
		{
			if(addedViewObj != null)
				arrObjViews[indexOfViews++] = addedViewObj;
			else
				arrObjViews[indexOfViews++] = new AbView(strViewName);

		}
	}
	//delete one specified view object from current view: deleteView(strViewName)
	this.deleteView = function(strViewName )
	{
		var objDeletedView = null;
		for(var i= 0; i< arrObjViews.length; i++)
		{
			if(arrObjViews[i].name == strViewName )
			{
 				objDeletedView = arrObjViews[i];
				break;
			}
		}
		if(objDeletedView != null)
		{
			if(i == arrObjViews.length - 1)
			{
				arrObjViews.length--;
			}
			else
			{
				for(var j = i+1; j < arrObjViews.length; j++)
				{
					arrObjViews[i] = arrObjViews[j]
					i++;
				}
				arrObjViews.length--;
			}

		}

	}
	//add new TableGroup obj into current view: addTgrp(strTgrpName,strTableName )
	this.addTgrp = function(strTgrpName, addedTgrpObj)
	{
		var objFoundTgrp = this.getTgrp(strTgrpName);
		if(objFoundTgrp == null)
		{
			if(addedTgrpObj != null)
				arrObjTgrps[indexOfTgrps++] = addedTgrpObj;
			else
				arrObjTgrps[indexOfTgrps++] = new AbTgrp(strTgrpName, "");
		}
	}
	//delete specified TableGroup obj from current view: deleteTgrp(strTgrpName)
	this.deleteTgrp = function(strTgrpName)
	{
		var objDeletedTgrp = null;
		for(var i = 0; i < arrObjTgrps.length; i++)
		{
			if(arrObjTgrps[i].name == strTgrpName)
			{
				objDeletedTgrp = arrObjTgrps[i];
				break;
			}
		}
		if(objDeletedTgrp != null)
		{
			if(i == arrObjTgrps.length - 1)
			{
				arrObjTgrps.length--;
			}
			else
			{
				for(var j = i+1; j < arrObjTgrps.length; j++)
				{
					arrObjTgrps[i] = arrObjTgrps[j]
					i++;
				}
				arrObjTgrps.length--;
			}
		}
	}
	//a deep search(including all sub views):searchViewByName(strViewName)  
	//return null or found view object
	this.searchViewByName = function(strViewName)
	{
		var objFoundView = null;
		if(this.name == strViewName)
		{
			objFoundView = this;
		}
		else
		{
			var objSubViews = this.getViews();
			if(objSubViews != null)
			{
				for(var i=0; i < objSubViews.length; i++)
				{
					objFoundView = objSubViews[i].searchViewByName(strViewName);
					if(objFoundView != null)
						break;
				}
			}
		}
		return objFoundView;
	}
	//getting view's margin-left for its tgrps
	this.getTgrpMarginLeft = function()
	{
		return iMarginLeft;

	}
	//setting view's margin-left for its tgrps
	this.setTgrpMarginLeft = function(iML)
	{
		iMarginLeft = iML;
	}
}

/////////////////////////End of TbView Class////////////////////////

/////////////////////////Start of AbTgrp Class//////////////////////
/*******************************************************************
API:
 public interfaces:
 (1)constructior:
    new AbTgrp(string:tgrpName)
 (2)properties:
	name(string) 
	title(string)
	sort(string) 
	bUnique(boolean)
	SQLRest(string)
	frame(string)
 (3)functions:
	setTitle(string:title)
	setSQLRest(string:sqlExpression)
	setFrame(string:frameName)
	setSort(string:sortBy, boolean:bUniquq)
		notes:sortBy = "table.field ASC | DESC" [,"table.field ASC | DESC" , ...]";
	addRest(string:conjunction,string:table_field,string:relop,string:value)
	clearRest()
		notes:clear all restrictions in current tgrp object
	getRest()
		notes:return an array object containing all restrictions in current tgrp object
	addStat(string:table, string:field, string:operator,string:title)
	getStat(string:title)(return an array object or null)
	getStats()
		notes:return an associate array object indexed by stat's title
	deleteStat(string:title)
		notes:delete a statistic specified by its title
	deleteStats()
		notes:delete all statistics in current tgrp object
	fldsOn(string:strListofFields)
		notes:strListofFields = "table.field[;table.field …]"
	fldsOff(string:strListofFields)
		notes:strListofFields = "table.field[;table.field …]"
	fldsAllOff(string:strListofFields)
		notes:clear up the visible fields
	getVisibleFields()
		notes:return an array object containing all visible fields in current tgrp object
	getTgrp(string:tableName)
		notes: add a new tgrp object defined by tableName to current tgrp
	deleteTgrp(string:tableName)
		notes:search tgrp by tableName, if found, delete it from current tgrp 
	getTgrps()
		notes: return null or an array to contains all sub tgrps

*******************************************************************/
/*******************************************************************
 var newTgrpObj = new AbTgrp('rm', 'rm');
 newTgrpObj.setTitle('Rooms');
 newTgrpObj.addTable('rmstd');
 newTgrpObj.fldsOn('rm.bl_id;rm.rm_id;rm.name;rmstd.rm_std');
 var newViewObj = new AbView('roomStandard-room.axvw');
 newViewObj.addTgrp('rm',newTgrpObj);
 ******************************************************************/
function AbTgrp(strTgrpName, strTableName)
{
	////private variables and functions: only accessible in this object
	////var objTgrp = new AbTgrp('rm','rm');
	////alert(objTgrp.indexOfTables) ==> undefined error
	var indexOfTables = 0;
	var indexOfVisibleFields = 0;
	var indexOfRestrictions  = 0;
	var indexOfStatistics    = 0;
	var arrTables  = new Array();
	var arrVisibleFields = new Array();
	var arrRestrictions  = new Array();
	var arrStatistics    = new Array();
	////public property interfaces 
	////var objTgrp = new AbTgrp('rm','rm');
	////alert(objTgrp.name) ==> "rm"
	this.name = strTgrpName;
	this.sort = "";
	this.bUnique = false;
	this.SQLRest = "";
	this.title = "";
	this.frame    = "";
	////public function interfaces
	////var objTgrp = new AbTgrp('rm','rm');
	////objTgrp.setTitle('Rooms');
	//set title to current Tgrp:setTitle(strTitle)
	this.setTitle = function(strTitle)
	{
		this.title = strTitle;
	}
	//set frame to current Tgrp:setFrame(strFrame)
	this.setFrame = function(strFrame)
	{
		this.frame = strFrame;
	}
	//set an SQL-style restriction on current Tgrp object
	this.setSQLRest = function(sqlExpression)
	{
		this.SQLRest = sqlExpression;
	}
	//set sort orders for current Tgrp object
	this.setSort = function(strSortOrders, bUnique)
	{
		this.bUnique = bUnique;
		this.sort = strSortOrders;
	}
	//add a restriction clause to current Tgrp:
	//addRest("conjunction", "table.field","relop", "value") 
	this.addRest  = function(strConjunction, strField, strRelop, strValue)
	{
		arrRestrictions[indexOfRestrictions++] = new Array(strConjunction, strField, strRelop, strValue);
	}
	//clear restrictions from current Tgrp:clearRest() 
	this.clearRest  = function()
	{
		arrRestrictions.length=0;
	}
	//get restriction clauses to current Tgrp:
	//getRest() (return an array object)
	this.getRest = function()
	{
		return arrRestrictions;
	}
	//get statistics from current Tgrp object:
	//getStat(strTitle)(return an array object or null)
	this.getStat = function(strTitle)
	{
		var objReturned = null;
		for(var stat in arrStatistics)
		{
			if(stat==strTitle)
			{
				objReturned = arrStatistics[stat];
				break;
			}
		}
		return objReturned;
	}
	//get all of statistics from current Tgrp object:
	//getStats()(return an associate array object)
	this.getStats = function()
	{
		return arrStatistics;
	}
	//add a statistic to current Tgrp object:
	//addStat(strTableName, strFieldName, strOperator, strTitle)
	this.addStat = function(strTableName, strFieldName, strOperator, strTitle)
	{
		if(this.getStat(strTitle)==null)
			arrStatistics[strTitle] = new Array(strTableName, strFieldName, strOperator);
	}
	//delete a statistic from current Tgrp object:
	//deleteStat(strTitle)
	this.deleteStat = function(strTitle)
	{
		var arrTemp = new Array();
		for(var stat in arrStatistics)
		{
			if(stat != strTitle)
				arrTemp[stat] = arrStatistics[stat];
		}
		arrStatistics = arrTemp;
	}
	//delete all statistics from current Tgrp object:
	//deleteStats()
	this.deleteStats = function()
	{
		arrStatistics = null;
	}
	//add a statistic to current Tgrp object:
	//addStat()
	this.addStat = function(strTableName, strFieldName, strOperator, strTitle)
	{
		if(this.getStat(strTitle)==null)
			arrStatistics[strTitle] = new Array(strTableName, strFieldName, strOperator);
	}

	//get all sub table objects from current Tgrp
	//object:getTables() (return an array containing all sub tgrp
	//objects)
	this.getTables = function()
	{
		return arrTables;
	}
	//get a sub tgrp object by name from current Tgrp
	//object:getTgrp(strTableName) (return a sub tgrp object)
	this.getTgrp  = function(strTableName)
	{
		var objReturnedTable = null;
		for(var i= 0; i< arrTables.length; i++)
		{
			if(arrTables[i].name == strTableName )
			{
				objReturnedTable = arrTables[i];
				break;
			}
		}
		return objReturnedTable;
	}
	//add a new tgrp object to current Tgrp: addTable(strTableName)
	this.addTgrp = function(strTableName, objTable)
	{
		var objFoundTable = this.getTgrp(strTableName);
		if(objFoundTable == null)
		{
			if(objTable ==  null)
				arrTables[indexOfTables++] = new AbTgrp(strTableName,strTableName);
			else
				arrTables[indexOfTables++] = objTable;
		}
	}
	//delete specified Table from current Tgrp object: deleteTable(strTableName)
	this.deleteTgrp = function(strTableName)
	{
		var objDeletedTable = null;
		for(var i = 0; i < arrTables.length; i++)
		{
			if(arrTables[i].name  == strTableName)
			{
				objDeletedTable = arrTables[i];
				break;
			}

		}
		if(objDeletedTable != null)
		{
			if(i == arrTables.length - 1)
			{
				arrTables.length--;
			}
			else
			{
				for(var j = i+1; j < arrTables.length; j++)
				{
					arrTables[i] = arrTables[j];
					i++;
				}
				arrTables.length--;
			}

		}

	}
	//clear up the visible fields
	this.fldsAllOff = function()
	{
		arrVisibleFields.length = 0;
	}
	//turn specified fields to be visible: fldsOn(strFieldNames)
	this.fldsOn = function(strFieldNames)
	{
		var arrTemp = new Array();
		arrTemp = strFieldNames.split(";")
		for(var i = 0; i < arrTemp.length; i++)
		{
			if(arrTemp[i] != "")
			{
				arrVisibleFields[indexOfVisibleFields++] = arrTemp[i];
			}
		}
		
		
	}
	//turn specified field to be invisible: fldsOff(strFieldName)
	this.fldsOff = function(strFieldNames)
	{
		var arrTemp = new Array();
		var bFound = false;
		arrTemp = strFieldNames.split(";")
	    for(var i = 0; i < arrTemp.length; i++)
		{
			if(arrTemp[i] != "")
			{
				for(var j = 0; j < arrVisibleFields.length; j++)
				{
					if(arrVisibleFields[j]  == arrTemp[i])
					{
						bFound = true;
						break;
					}

				}
				if(bFound)
				{
					if(j == arrVisibleFields.length - 1)
					{
						arrVisibleFields.length--;
					}
					else
					{
						for(var k = j+1; k < arrVisibleFields.length; k++)
						{
							arrVisibleFields[j] = arrVisibleFields[k];
							j++;
						}
						arrVisibleFields.length--;
					}

				}
			}
		}
	}
	
	//getVisibleFields()(return an array object)
	this.getVisibleFields = function()
	{
		return arrVisibleFields;
	}
	
}
/////////////////////////////End of TbTgrp Class////////////////////////////


function getViewAllInformation(strViewID)
{
	var tempString = "";
	tempString = tempString  + getInfoFromView(strViewID);
	
	var subViews = strViewID.getViews();
	if(subViews!=null)
	{
		for(var i = 0; i < subViews.length; i++)
		{
			tempString = tempString  + getViewAllInformation(subViews[i]);
		}
	}
	tempString = tempString + '</afmXmlView>';
	
	return tempString;
}

function getInfoFromView(strViewID)
{
	var tempString = "";
	tempString = tempString + '<afmXmlView';
	tempString = tempString  + ' name="' + strViewID.name + '"/>';
	tempString = tempString  + "<title>" + strViewID.title + "</title>";
	tempString = tempString  + "<access>" + strViewID.access + "</access>";
	tempString = tempString  + "<frameset>" + strViewID.frameset + "<frameset>";
	tempString = tempString  + "<hotlist>" + strViewID.hotlist + "</hotlist>";

	var tgrps = strViewID.getTgrps();
	for(var i = 0; i < tgrps.length; i++)
	{
		var tgrpObj = tgrps[i];
		var tempS = getInfoFromTgrp(tgrpObj);
		tempString = tempString  + tempS;	
	}
	return tempString;	
}
function getInfoFromTgrp(tgrpObj)
{
	var strTemp = "";
	var strVisible = "";
	strTemp = strTemp + "<afmTableGroup";
	strTemp = strTemp + ' name="' + tgrpObj.name  + '"/>';
	strTemp = strTemp + "<title>" + tgrpObj.title  + "</title>";
	//visible fields
	var arrVisibleFlds = tgrpObj.getVisibleFields();
	for(var i=0; i< arrVisibleFlds.length; i++)
	{
		strVisible = strVisible + arrVisibleFlds[i] + ";";
	}
	strTemp = strTemp +"<visibleFields>"+strVisible +"</visibleFields>";
	//restrictions
	var arrRest = tgrpObj.getRest();
	var strRest = "";
	for(var i=0; i < arrRest.length; i++)
	{
		strRest = strRest + '<restriction conjunction="' + arrRest[i][0] + '" field="' + arrRest[i][1] + '" relop="' + arrRest[i][2]+ '" values="' + arrRest[i][3]+'"/>';
	}
	strTemp = strTemp +strRest;
	//statistics
	var arrStats = tgrpObj.getStats();
	var strStats = "";
	for(var s in arrStats)
	{
		strStats = strStats + '<statistics title="' + s + '" table="' + arrStats[s][0] + '" field="' + arrStats[s][1]+ '" operator="' + arrStats[s][2]+'"/>';
	}
	strTemp = strTemp +strStats;
	//sort by
	var strSort = tgrpObj.sort;
	if(strSort != "")
		strTemp = strTemp +'<sort>' + strSort  +'</sort>';
	//SQL statement restrictions
	var strSQLRest = tgrpObj.SQLRest;
	if(strSQLRest != "")
		strTemp = strTemp +'<sqlRestriction value="' + strSQLRest  +'"/>';

	var subTgrpObjs = tgrpObj.getTgrps();
	if(subTgrpObjs != null)
	{
		for(var i = 0; i < subTgrpObjs.length; i++)
		{
			strTemp = strTemp + getInfoFromTgrp(subTgrpObjs[i]);
		}
	}
	strTemp = strTemp + "</afmTableGroup>";
	return strTemp;
}

