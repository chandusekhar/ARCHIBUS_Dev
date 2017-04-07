var printCtrl = View.createController('printCtrl', {
	selectedRecords: null,
	printOrPreview: null,
	//----------------event handle--------------------
	afterViewLoad: function(){
		this.selectedRecords = View.parameters.selectedRecords;
		this.printOrPreview = View.parameters.printOrPreview;

		if(this.printOrPreview=="Preview"){
			this.printRow('view',' ',true);
		}
		if(this.printOrPreview=="Print"){
			this.printRow(' ',' ',true)
		}
   },

   previewpanel_onClosePrint: function(){
   	var parentView = View.getOpenerView();
	parentView.closeDialog();
   },

   printRow: function(para,rest,list) {
		var styles;
		var stylesheets = new Array('/archibus/schema/uc-custom-views/multiPrint/uc-printreport.css')
		var oIframe = "print_iframe"

		//If user role is customer hide the wrcf and intnotes
		if (View.user.role.substring(0,4) == 'CUST') {
			styles=new Array('#wrcf_div { display:none; }','#intNotes_tr { display:none; }')
		}
		else {
			styles=new Array()
		}

		ds1=this.view.dataSources.get('wrhwrlist_ds');
		if(rest!=' '){
			buildPrint(rest,oIframe,para!='view',ds1,styles,stylesheets);
		}
		else{
			var restriction = '1=1';
			var selectedRows = this.selectedRecords;
			ds=View.dataSources.get('wrhwrlist_ds');

			if((selectedRows.length>0)&&(list==true)){
				var wr_id = ' ( ';
				for(i=0;i<selectedRows.length;i++){
					currRec = selectedRows[i];
					if(i!=(selectedRows.length-1)){
						wr_id+= "'"+currRec.values['wrhwr.wr_id']+"',";
					}
					else{
						wr_id+= "'"+currRec.values['wrhwr.wr_id']+"' )";
					}
				}
				restriction = restriction +" and wrhwr.wr_id in "+wr_id;
				buildPrint(restriction,oIframe,para!='view',ds1,styles,stylesheets);
			}
			else{
				if(list==false){
					var oIframe1 = frames["print_iframe"]
					var oContent1=oDoc.body.innerHTML;
					if (oIframe1.document) oDoc1 = oIframe1.document;
					oDoc1.write("<head><title style='font-size:18;'></title>");
					oDoc1.write("<STYLE TYPE='text/css'>");
					for(var y=0;y<styles.length;y++){
						oDoc1.write(styles[y]);
					}
					oDoc.write("</STYLE>");
					for(var s=0;s<stylesheets.length;s++){
						oDoc1.write("<LINK href='"+stylesheets[s]+"' type=text/css rel=stylesheet>");
					}
					oDoc1.write("</head><body onLoad='this.focus();'>");
					var browser1=navigator.appName;
					oDoc1.write(oContent1);
					if ((browser1=="Microsoft Internet Explorer")){
						oDoc1.write("</body>");
						oIframe1.document.execCommand('print', false, null);
					}
					else {
						oDoc1.write("</body>");
						oIframe1.print();
					}
					oIframe1.hidden="true";
					oDoc1.close()
				}
				else{
					if(para=="view")
					{
						View.showMessage('Select work request to preview');
					}
					else
					{
						View.showMessage('Select work request to print');
					}
					expandCollapsePrint(false,'centerRegion');
				}
			}
		}
	}

});
//set testing to true to test field definitions
var bolTesting = false;
function buildPrint(restrictionClause,oIframe1,print,ds1,styles,stylesheets){
	var a = 1
	document.getElementById('previewpanel_head').style.display='none';
	//View.panels.get("previewpanel").show(true, false)
	document.getElementById('loading').style.display='block';
	//document.getElementById('innerDIV').style.display='none';
	setTimeout(function(){buildPrint2(restrictionClause,oIframe1,print,ds1,styles,stylesheets);},5);
}
function buildPrint2(restrictionClause,oIframe1,print,ds1,styles,stylesheets){
	var oIframe = frames[oIframe1]
	var oElements = document.getElementById('innerDIV').getElementsByTagName('div')
	var id;
	var fldRest;
	var aLookupFields=new Array();
	var aValidFields=new Array();
	var aInvalidFields=new Array();
	var sValidFields="";
	var sInvalidFields="";
	var itemsOBJ = [];
	var dialog;

	for(var i = 0; i < oElements.length; i++){
		id=oElements[i].id;
		fldRest =oElements[i].attributes.printFld;
		if (typeof fldRest != 'undefined') {
			if (id !="") {
				if(fieldExists(id)){
					if (fldRest.value != '') {

						var al = 0;
						for(al = 0; al < aLookupFields.length; al++){
							if (aLookupFields[al][0]==id.split(".")[0] && aLookupFields[al][2] == fldRest.value) {
								aLookupFields[al][1] += ",'" + id + "'"
								al = 99999;
							}
						}
						if (al < 99999) {
							al= aLookupFields.length;
							aLookupFields[al]=[];
							aLookupFields[al][0]=id.split(".")[0]; //Table-name
							aLookupFields[al][1]= "'" + id + "'"; //flds
							aLookupFields[al][2]=fldRest.value; // where clause

						}

					}
					else {

						aValidFields[aValidFields.length]=id;
						if(sValidFields!="") {
							sValidFields=sValidFields + ",";
						}
						sValidFields= sValidFields + "'" + id + "'";
					}

				}
				else {
					aInvalidFields[i]=oElements[i].id;
					if(sInvalidFields!="") {
						sInvalidFields=sInvalidFields + ",";
					}
					sInvalidFields= sInvalidFields + "'" + id + "'";
				}
			}
		}
	}

	if(sInvalidFields!="") alert('The Following fields are not in afm Schema: ' + sInvalidFields);
	var jsonData =  "["+sValidFields+"]";
	//Note you may have to add more clauses
	if (restrictionClause != null) {
		//Use Restriction passed in
	}
	else if(View.parentTab != null){
		//Get Tab Restriction
	    restrictionClause= View.parentTab.restriction;
	}
	else if(opener != null){
		//Get Opener Restriction
		 restrictionClause = opener.View.parentTab.restriction;
	}
	else if(View.restriction != undefined ){
		//Get View Restriction
		restrictionClause= View.restriction;
	}
	else if(View.parentViewPanel != null ){
		//Get View Restriction
		restrictionClause= View.parentViewPanel.restriction;
	}
	else if(View.parentViewPanel != null){
		//Get View parentViewPanel
		restrictionClause=View.parentViewPanel.restriction
	}
	else{
		alert('ERROR Cannot get restriction using test Restriction!');
		restrictionClause= "1=2"
	}
	var tblName = "";
	var tableRest2 = aValidFields[0].split(".");
	tblName = tableRest2[0];


    var recordSort = "[{'fieldName':'wrhwr.ac_id', 'sortOrder':1}]";

	var params = {
	  tableName:tblName,
	  fieldNames: jsonData,
	  restriction: toJSON(restrictionClause),
      sortValues: recordSort
	}

	var result = Workflow.call('AbCommonResources-getDataRecords', params);
	var html=document.getElementById('innerDIV').innerHTML;
	var oContent="";
	if (oIframe.document) oDoc = oIframe.document;
	oDoc.write("<head><title style='font-size:18;'></title>");
	oDoc.write("<STYLE TYPE='text/css'>");
	for(var y=0;y<styles.length;y++){
		oDoc.write(styles[y]);
	}
	oDoc.write("</STYLE>");
	for(var s=0;s<stylesheets.length;s++){
		oDoc.write("<LINK href='"+stylesheets[s]+"' type=text/css rel=stylesheet>");
	}
	oDoc.write("</head><body onLoad='this.focus();'>");
	var browser=navigator.appName;
	if(result.code == 'executed'){
		var results = result.data.records;
		for(var j=0;j<results.length;j++){
			if(j>0){
				oContent ="<p style='page-break-before: always'></p>";
			}
			document.getElementById('date').innerHTML= todayFmtStr();
			var record=results[j];
			for(var i = 0, len = aValidFields.length; i < len; i++){

				if(aValidFields[i]=="wrhwr.date_requested"){
					//2012.02.29 - hard code to convert date_requested into date format MM/DD/YYYY
					document.getElementById(aValidFields[i]).innerHTML = convertDateToString(record[aValidFields[i]]);
				}
				else{
					document.getElementById(aValidFields[i]).innerHTML = record[aValidFields[i]];
				}
			}

			if(record['wrhwr.eq_id']=="") {//2012.02.29 hide the eqInfoRow if the wrhwr.eq_id not exists
				document.getElementById('eqInfoRow').style.display = "none";
                document.getElementById('eqQuestionRow').style.display = "none";
			}
            var prob_type = (record['wrhwr.prob_type'] == null) ? "" : record['wrhwr.prob_type'];
            //if (record['wrhwr.work_team_id'] != 'FLEET' && prob_type.substring(0,5) != 'FLEET') {
            if (record['wrhwr.work_team_id'] != 'FLEET' ) {
			
			
                var fleetelement = document.getElementById('fleet_info_tr');
				var fleetsection = document.getElementById('resources4');
                if (fleetelement != null) {
                    fleetelement.style.display = "none";
					fleetsection.style.display = "none";
                }
            }           
			arrDs = View.dataSources.items


			var wr_id=record['wrhwr.wr_id'];
			rest="wrhwr.wr_id='" +wr_id+"' "

			var d = 0;
			//get any fK data that is either in a table that is more than 1 ref table away or where the table has more than one field FKed to it
			//to do this add to the column a parameter of FKWhere i.e. <td><div id="em.email" FKWhere="em.em_id=wr.requestor"/></td>
			//simple referenced table
			//--em.em_id=wr.requesto
			//multiple referenced table joins i.e. getting site name based on the wr.bl_id
			//-- exists (select 1 from bl where wr.bl_id =bl.bl_id and site.site_id = bl.site_id)
			for(d = 0; d <  aLookupFields.length; d++){
				var fktbl = aLookupFields[d][0];
				var fkflds = aLookupFields[d][1];
				var fkwhere = "exists (select 1 from wr where " + rest + " and " + aLookupFields[d][2] + ")";
				var paramsfk = {
				  tableName:fktbl,
				  fieldNames: "["+fkflds+"]",
				  restriction:   fkwhere
				}

				var resultfk = Workflow.call('AbCommonResources-getDataRecords', paramsfk);
				if(resultfk.code == 'executed'){
					if (resultfk.data.records.length > 0) {
						var lkupRec = resultfk.data.records[0];
						var regEx = new RegExp("'","g")
						var aFlds = aLookupFields[d][1].replace(regEx,"").split(',')
						for(var i = 0, len =aFlds.length; i < len; i++){
							document.getElementById(aFlds[i]).innerHTML = lkupRec[aFlds[i]];
						}
					}
				}

			}


			for(d = 0; d < arrDs.length; d++){
				//alert(rest + "|" + arrDs[d]);
				buildChildTableFromDataSource(rest,arrDs[d])
			}
			recs=ds1.getRecord(rest);
			//var bc = new AtalasoftBarcode39(wr_id);
			//document.getElementById('bcArea').innerHTML = bc.getBarcode(40, 1, 4);

			var recordCountSection = document.getElementById('recCount');
			if (typeof(recordCountSection) != 'undefined') {
				recordCountSection.innerHTML = (j+1) + " of " + results.length;
			}

			oContent += document.getElementById('innerDIV').innerHTML;
			oDoc.write(oContent);
			document.getElementById('innerDIV').innerHTML=html;
		}
		oDoc.write("</body>");

		if ((browser=="Microsoft Internet Explorer")){

			if(print){
				oIframe.document.execCommand('print', false, null);
			}
		}
		else {
			if(print){
				oIframe.print();
			}

		}
		oIframe.hidden="true";
		oDoc.close()
	}
	document.getElementById('loading').style.display='none';
	//View.panels.get("previewpanel").show(true, true)
	document.getElementById('previewpanel_head').style.display='block';

}

function buildChildTableFromDataSource(rest,dsItem){
	var PKs = dsItem.primaryKeyFields
	var dataSource = dsItem.id
	if (dataSource.split("_")[0] != "print") {return}
	var tblTitle = dsItem.title
	tablName = PKs[0].split(".")[0]
	var theTableDiv = document.getElementById(tablName + '_div');
	if (!theTableDiv) {return}


	if (typeof(rest) == "string") {
		restriction = rest
	}
	else {
		restriction = "wrhwr.wr_id =" + rest['wrhwr.wr_id']
	}
	var divrest
	if(typeof(theTableDiv.name)=='undefined'){
		divrest=theTableDiv.attributes.getNamedItem("name").value;
	}
	else{
		divrest=theTableDiv.name;
	}
	var restriction = "exists (Select 1 from wrhwr where " + divrest + " AND  " + restriction + ")"



	var afieldNamesComment = [] //need to pull this from the ds or just add to the div??
	var recordDS = View.dataSources.get(dataSource);
	//recordDS.restriction = restriction;
	//call getRecords ensure recordLimit is set to 0 to bring back all records
	var records = recordDS.getRecords(restriction.toString(),{recordLimit: 0});
	var fieldNames="";

	theTableDiv.innerHTML="";
	var table = document.createElement("table");
	//2012.02.29 - should we set id for table here?
	table.setAttribute('class', 'tableFullContent'); //non-ie
	table.setAttribute('className', 'tableFullContent');  //ie
	theTableDiv.appendChild(table);

	var cf = records;
	var td;
	var tr;

	var cntStats = {}
	var sumStats = {}
	var avgStats = {}

	var bolCnt = false
	var bolSum = false
	var bolAvg = false

	var divHeader = ""
	var divFooter = ""
	afieldNamesGrid = dsItem.fieldDefs.items
	var cSpan = afieldNamesGrid.length

	// Create table data rows
	for(var j = 0; j < records.length; j++){
		var sfield;
		if (j == 0) {
			sfield = tablName + ".divheader"
			if (typeof(cf[j].values[sfield]) != "undefined") {
				divHeader = cf[j].values[sfield]
				cSpan--
			}
			sfield = tablName + ".divfooter"
			if (typeof(cf[j].values[sfield]) != "undefined") {
				divFooter = cf[j].values[sfield]
				cSpan--
			}
		}
		tr = table.insertRow(0);
		if (j != 0) {tr.id = tablName + '_row'}
		var sfield;

		for(var x = 0; x < afieldNamesGrid.length; x++){
			sfield=afieldNamesGrid[x].id;

			if (sfield == tablName + ".divheader" || sfield == tablName + ".divfooter") {
				//skip the header and footer
			}
			else {
				attrib = 'resourcesData'
				if (tr.cells.length == 0 ) {attrib = attrib + ' resourceDataLeft'}
				if (tr.cells.length == cSpan - 1 ) {attrib = attrib + ' resourceDataRight'}
				td = tr.insertCell(tr.cells.length);

				td.setAttribute('class',attrib)
				td.setAttribute('className',attrib)

				if(sfield.match('date')){ //add Date Formatting
					if(cf[j].values[sfield])
						td.innerHTML =  cf[j].values[sfield].format0();
					/*}else if(sfield.match('time')){ //add Time Formatting
						if(cf[j].values[sfield]){
							var globalDate = new Date(cf[j].values[sfield]);
							td.innerHTML = globalDate.format1();
						}*/
				}
				else{
					//if the cf.position = "" then hardcode it to "-"
					if(sfield=="cf.position" && cf[j].values[sfield]==""){
						td.innerHTML="-";
					}
					else{
						td.innerHTML=cf[j].values[sfield];
					}
				}
				fType = afieldNamesGrid[x].type.replace("java.lang.","")
				if ((fType == "Double" || fType == "Float" || fType == "Integer")){
					td.style.textAlign='right'
				}
				if ((fType == "Double" || fType == "Float" || fType == "Integer")  && cf[j].values[sfield]) {
					if (afieldNamesGrid[x].controlType != afieldNamesGrid[x].controlType.replace('sum','') ) {
						if (typeof(sumStats[afieldNamesGrid[x].id]) =='undefined') {
							sumStats[afieldNamesGrid[x].id] = 0
						}
						sumStats[afieldNamesGrid[x].id] = parseFloat(cf[j].values[sfield]) + parseFloat(sumStats[afieldNamesGrid[x].id])
						bolSum = true
					}
					if (afieldNamesGrid[x].controlType != afieldNamesGrid[x].controlType.replace('avg','')) {
						if (typeof(avgStats[afieldNamesGrid[x].id]) =='undefined') {
							avgStats[afieldNamesGrid[x].id] = 0
							avgStats[afieldNamesGrid[x].id + "_cnt"] = 0
						}
						avgStats[afieldNamesGrid[x].id] = parseFloat(cf[j].values[sfield]) + parseFloat(avgStats[afieldNamesGrid[x].id])
						avgStats[afieldNamesGrid[x].id + "_cnt"]++
						bolAvg = true
					}
				}
				if (afieldNamesGrid[x].controlType != afieldNamesGrid[x].controlType.replace('count','')){
					if (typeof(cntStats[afieldNamesGrid[x].id]) =='undefined') {
						cntStats[afieldNamesGrid[x].id] = 0
					}
					cntStats[afieldNamesGrid[x].id]++
					bolCnt = true
				}
			}
		}

/*
		// Add comment (if any) to bottom of table
		for(var x = afieldNamesComment.length-1; x > -1; x--){
			sfield=afieldNamesComment[x];
			tr = table.insertRow(1);
			td = tr.insertCell(0);
			td.colSpan=afieldNamesComment.length;
			td.innerHTML = cf[j].values[sfield];
		}
*/
	}

	if(tablName == 'wrcfhwrcf' && records.length < 4){
		createChildTableBlankRows(table, 1 - records.length, cSpan);
	}
	if(tablName == 'wrotherhwrother' && records.length < 4){
		createChildTableBlankRows(table, 1 - records.length, cSpan);
	}
	if(tablName == 'wrtlhwrtl' && records.length < 4){
		createChildTableBlankRows(table, 1 - records.length, cSpan);
	}
	if(tablName == 'wrpthwrpt' && records.length < 4){
		createChildTableBlankRows(table, 1 - records.length, cSpan);
	}
	// Add ML Headings to table
	//if (j+1==records.length){
	if (table.rows.length > 0) {
		var tr = table.insertRow(0);

		var td = tr.insertCell(0);
		td.colSpan=cSpan;
		var tr = table.insertRow(0);

		for(var x = 0; x < afieldNamesGrid.length; x++){
			sfield=afieldNamesGrid[x].id;
			if (sfield == tablName + ".divheader" || sfield == tablName + ".divfooter") {
			//skip the header and footer
			}
			else {
				attrib = 'resourcesHeader'
				if (tr.cells.length == 0 ) {attrib = attrib + ' resourceDataLeft'}
				if (tr.cells.length == cSpan - 1 ) {attrib = attrib + ' resourceDataRight'}
				td = tr.insertCell(tr.cells.length);

				td.setAttribute('class',attrib)
				td.setAttribute('className',attrib)
				fType = afieldNamesGrid[x].type.replace("java.lang.","")
				if ((fType == "Double" || fType == "Float" || fType == "Integer"))
				{
					td.style.textAlign='right'
				}
				td.innerHTML = "<B>" + afieldNamesGrid[x].title + "</B>";
			}
		}

	}

//add stats
	if (bolAvg || bolSum || bolCnt) {
		var sfield;
		tr = table.insertRow(table.rows.length);
		tr.id = "wrResStats";

		for(var x = 0; x < afieldNamesGrid.length; x++){
			sfield=afieldNamesGrid[x].id;
			if (sfield == tablName + ".divheader" || sfield == tablName + ".divfooter") {
			//skip the header and footer
			}
			else {
				td = tr.insertCell(tr.cells.length);
				td.innerHTML = ""
				if (bolCnt){
					if (typeof(cntStats[afieldNamesGrid[x].id]) !='undefined') {td.innerHTML = td.innerHTML +  "<i>" + cntStats[afieldNamesGrid[x].id] + "</i>"}
				}
				if (bolSum){
					if (bolCnt){td.innerHTML = td.innerHTML + '<br>'}
					if (typeof(sumStats[afieldNamesGrid[x].id]) !='undefined') {td.innerHTML = td.innerHTML  + sumStats[afieldNamesGrid[x].id].toFixed(afieldNamesGrid[x].decimals) }
				}
				if (bolAvg){
					if (bolCnt || bolSum){td.innerHTML = td.innerHTML + '<br>'}
					if (typeof(avgStats[afieldNamesGrid[x].id]) !='undefined') {
						avg = (avgStats[afieldNamesGrid[x].id] / avgStats[afieldNamesGrid[x].id + "_cnt"]).toFixed(afieldNamesGrid[x].decimals)
						td.innerHTML = td.innerHTML + "<i>" + avg + "</i>"
					}
				}
				attrib = 'resourcesStatData'
				if (td.innerHTML == "" || td.innerHTML == "<BR>" || td.innerHTML == "<BR><BR>") {attrib = 'resourcesData'}
				if (tr.cells.length == 1 ) {attrib = attrib + ' resourceDataLeft'}
				if (tr.cells.length == cSpan ) {attrib = attrib + ' resourceDataRight'}
				td.setAttribute('class', attrib); //non-ie
				td.setAttribute('className', attrib);  //ie
				td.style.textAlign='right'
			}
		}
	}
	// Add header to the table with formatting
	//if (records.length > 0) {
	if(table.rows.length > 0) {
		if (typeof(tblTitle) == "undefined") {
			tblTitle = fnGetTableName(tablName)
		}
		if (divHeader != "") {
			tr = table.insertRow(0);
			td = tr.insertCell(0);
			td.innerHTML = divHeader;
			td.setAttribute('class', 'tdHzMessage'); //non-ie
			td.setAttribute('className', 'tdHzMessage');  //ie
			td.setAttribute("colSpan", cSpan);
		}
		if (divFooter != "") {
			tr = table.insertRow(table.rows.length);
			td = tr.insertCell(0);
			td.innerHTML = divFooter;
			td.setAttribute('class', 'tdHzMessage'); //non-ie
			td.setAttribute('className', 'tdHzMessage');  //ie
			td.setAttribute("colSpan", cSpan);
		}
		tr = table.insertRow(0);
		td = tr.insertCell(0);
		td.innerHTML = tblTitle;
		td.setAttribute('class', 'tdHeader'); //non-ie
		td.setAttribute('className', 'tdHeader');  //ie
		td.setAttribute("colSpan", cSpan);
		tr = table.insertRow(0);
		td = tr.insertCell(0);
		td.innerHTML = "&nbsp;";

	}
}

//returns full table name
function fnGetTableName(tablName) {
	var sTitle =""
	var rest =  "afm_tbls.table_name='" + tablName + "'";
	var sParameters = {
		tableName: 'afm_tbls',
		fieldNames: toJSON(['afm_tbls.title']),
		restriction: rest
	};

	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', sParameters);

	if (result.code == 'executed') {
		var rec= result.data.records;
		var sTitle= rec[0]['afm_tbls.title'];
	}
	return sTitle;


}

function fieldExists(fieldName){
	//skip if not testing to save time
	if (!bolTesting) {return true;}
	var aField=fieldName.split('.');
	var sTable=aField[0];
	var sField=aField[1];
	var sBoolean=true;
	var rest =  "afm_flds.table_name='" + sTable + "' and afm_flds.field_name='" + sField + "'";
	var sParameters = {
		tableName: 'afm_flds',
		fieldNames: toJSON(['afm_flds.table_name']),
		restriction: rest
	};
	var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', sParameters);
	if (result.code == 'executed') {
		if(result.data.records.length < 1){
			sBoolean= false;
		}
	}
	return sBoolean;
}

//--Returns the current date in January dd, YYYY as a string.
function todayFmtStr() {
    var Today = new Date();
    var TodayDay = Today.getDate();
    var TodayMon = Today.getMonth();
    var TodayYear = Today.getYear();
    var TodayDayName = Today.getDay();

    if (TodayYear < 2000) TodayYear += 1900;

    if (TodayMon == 0) { TodayMonth = "January"; }
    else if (TodayMon == 1) { TodayMonth = "February"; }
    else if (TodayMon == 2) { TodayMonth = "March"; }
    else if (TodayMon == 3) { TodayMonth = "April"; }
    else if (TodayMon == 4) { TodayMonth = "May"; }
    else if (TodayMon == 5) { TodayMonth = "June"; }
    else if (TodayMon == 6) { TodayMonth = "July"; }
    else if (TodayMon == 7) { TodayMonth = "August"; }
    else if (TodayMon == 8) { TodayMonth = "September"; }
    else if (TodayMon == 9) { TodayMonth = "October"; }
    else if (TodayMon == 10) { TodayMonth = "November"; }
    else if (TodayMon == 11) { TodayMonth = "December"; }
    else { TodayMonth = TodayMon; }

    if (TodayDayName == 0) { TodayDayName = "Sunday"; }
    else if (TodayDayName == 1) { TodayDayName = "Monday"; }
    else if (TodayDayName == 2) { TodayDayName = "Tuesday"; }
    else if (TodayDayName == 3) { TodayDayName = "Wednesday"; }
    else if (TodayDayName == 4) { TodayDayName = "Thursday"; }
    else if (TodayDayName == 5) { TodayDayName = "Friday"; }
    else if (TodayDayName == 6) { TodayDayName = "Saturday"; }
    else { TodayDayName = TodayDayName; }

    return (TodayDayName + ", " +TodayMonth + " " + TodayDay + ", " + TodayYear);
}






function getPath(){
	winFile = ""
	path = "/archibus/schema/uc-custom-views/multiPrint/"
	wnPath = window.location.pathname.replace("vann-wr-report-hq.axvw","")
	winPath_num = wnPath.split("/")
	for(var i = wnPath.split("/").length - 1; i < path.split("/").length - 1; i++){
		winFile = winFile + path.split("/")[i] + "/"
	}

	return winFile
}


function expandCollapsePrint(expand,overRegion){
	if(!View.panels.get("print"))
		reg = View.getOpenerView().panels.get('defaultHTML').layoutRegion
	else
		reg = View.panels.get("print").layoutRegion

	LayoutRegion = getRegion(reg)
	reg = LayoutRegion.id
	regn = LayoutRegion.region
	LayoutRegion = LayoutRegion.ownerCt.layout[regn]
	var width=parseInt(document.getElementById(overRegion).style.width,10);
	if (expand) {
		LayoutRegion.panel.setSize(width, undefined);
		LayoutRegion.state.width = width;
	}
	else{
		LayoutRegion.panel.setSize(0, undefined);
		LayoutRegion.state.width = 0;
	}
	LayoutRegion.layout.layout();
	LayoutRegion.panel.saveState();

}

function getRegion(reg){
	LayoutRegion = Ext.ComponentMgr.get(window.document.getElementById(reg).id)
	//If it's the Center region go and get the parent region.  If no parent then return null
	while (LayoutRegion.region == 'center') {
		if (!LayoutRegion.ownerCt) {return null}
		LayoutRegion = LayoutRegion.ownerCt
	}

	return LayoutRegion
}

//2012.02.29 - new function to convert date into string (Format: MM/DD/YYYY)
function convertDateToString(value,delimter){
	var result = "";
	if(value!=""){
			if(delimter == undefined){
				delimter = "/";
			}
			var dateValue = value.split(delimter);
			var month = dateValue[0] - 1;
			var day = dateValue[1];
			var year = dateValue[2];
			var d = new Date(year, month, day);
			var result = d.toLocaleDateString();
	}
	return result;
}

//2012.02.29 - new function to add in blank rows
function createChildTableBlankRows(table,rows,columns){

	for(var x = 0; x < rows; x++){

        tr = table.insertRow(table.rows.length);
        td = tr.insertCell(0);
        td.setAttribute('class','resourcesData resourceDataLeft resourceDataRight');
        td.setAttribute('className','resourcesData resourceDataLeft resourceDataRight');
        td.setAttribute("colSpan", columns);
        td.innerHTML = '&nbsp';
	}

/*
	var x=document.getElementById('table').insertRow(0);
	var y=x.insertCell(0);
	var z=x.insertCell(1);
	y.innerHTML="NEW CELL1";
	z.innerHTML="NEW CELL2";
	*/
}