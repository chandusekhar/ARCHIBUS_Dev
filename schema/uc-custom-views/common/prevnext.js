
	
	var sortfld = new Array()
	var srtfld = new Array()
	var dfltsort = new Array()
	var minConsoleRest = new Array()
	var parentRest = new Array()


	function prevNextafterViewLoad(pnl,NumList, dfltNum) {

		frm = pnl.id
		minConsoleRest[frm] = pnl.getParameters().filterValues  //-- this gets the current values in the mini console but it may not be restricted by it
		parentRest[frm] = pnl.restriction

		dfltsort[frm] = ""
		srtfld[frm] = ""
		
		//get current Sort Order
		for (var i = 0; i < pnl.sortColumns.length; i++) {
			if (pnl.sortColumns[i].fieldName != "") {
				srtfld[frm] =  pnl.sortColumns[i].fieldName + " DESC"
				if (pnl.sortColumns[i].ascending == 1) {
					srtfld[frm] =  pnl.sortColumns[i].fieldName + " ASC"
				}
				if (dfltsort[frm] != "") {dfltsort[frm] = dfltsort[frm] + ", "}
				dfltsort[frm] = dfltsort[frm] + srtfld[frm]
			}
		}

		//Add PKs to it if they are not included in original sort order
		for (var i = 0; i < pnl.primaryKeyIds.length; i++) {

			if (dfltsort[frm] == "") {
				dfltsort[frm] =  pnl.primaryKeyIds[i] + " ASC"
			}
			//check to see if this is a PK if not add it (only check fieldname not tablename)
			else if (dfltsort[frm].replace(pnl.primaryKeyIds[i].split('.')[1] + ' ','') == dfltsort[frm]) { 
				dfltsort[frm] = dfltsort[frm] + ", " + pnl.primaryKeyIds[i] + " ASC"
			}
			//check to see if a PK is put against a standard table instead of the main table
			else if (dfltsort[frm].replace(pnl.primaryKeyIds[i],'') == dfltsort[frm]){
				for (var xx=0, sc; sc = pnl.sortColumns[xx]; xx++) {
					if (sc.fieldName.split('.')[0] != pnl.primaryKeyIds[i].split('.')[0]) {
						dfltsort[frm] = dfltsort[frm].replace(sc.fieldName,pnl.primaryKeyIds[i])
						sc.fieldName = pnl.primaryKeyIds[i]
						break
					}
				}
			}
		}
		

		srtfld[frm] = ""

		//Add prev/next buttons

		sb = ""
		sb1 = ""
		sb2 = ""

		btnWidth = "18px"
		btnheight = "18px"
		sb1 = sb1 + '		<span id=""' + frm + '_divheader" class="x-btn-wrap x-btn" style="cursor:default;">'
		sb1 = sb1 + '<select class="inputField_box" id="' + frm + '_PageNum" disabled="true" onchange="prevNext_OnPageNumClick(\'' + frm + '\',true)"'
		sb2 = sb2 + '		<span id="' + frm + '_divfooter" class="x-btn-wrap x-btn" style="cursor:default;">'		
		sb2 = sb2 + '<select class="inputField_box" id="' + frm + '_PageNumfooter" disabled="true"  onchange="prevNext_OnPageNumClick(\'' + frm + '\',false)"'
	
		nlist = NumList.split(",")
		if (nlist.length <=1) {
			sb1 = sb1 + 'style="visibility:hidden;width:0px"'
			sb2 = sb2 + 'style="visibility:hidden;width:0px"'		
		}
		sb1 = sb1 + '>'
		sb2 = sb2 + '>'

		for (i = 0; i < nlist.length ; i++) {
			sb  = sb  + ' <option '
			if  (nlist[i] == dfltNum) {sb  = sb  + ' Selected '}
			sb = sb + 'value="' + nlist[i] + '" >' + nlist[i] + '</option>'
		}
		sb  = sb  + ' </select>&nbsp;&nbsp;'

		sb1 = sb1 + sb

		sb1 = sb1 + '			<button id="' + frm + '_firstrecs" class="x-item-disabled x-tbar-page-first" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onFirstrecs(\'' + frm + '\')"></button>'
		sb1 = sb1 + '			<button id="' + frm + '_prev" class="x-item-disabled x-tbar-page-prev" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onPrev(\'' + frm + '\')"></button>'
		sb1 = sb1 + '			<button id="' + frm + '_next" class="x-tbar-page-next" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onNext(\'' + frm + '\')"></button>'
		sb1 = sb1 + '			<button id="' + frm + '_lastrecs" class="x-tbar-page-last" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onLastrecs(\'' + frm + '\')"></button>'
		sb1 = sb1 + '		</span>'


		sb2 = sb2 + sb
		sb2 = sb2 + '			<button id="' + frm + '_firstrecsfooter" class="x-item-disabled x-tbar-page-first" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onFirstrecs(\'' + frm + '\')"></button>'
		sb2 = sb2 + '			<button id="' + frm + '_prevfooter" class="x-item-disabled x-tbar-page-prev" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onPrev(\'' + frm + '\')"></button>'
		sb2 = sb2 + '			<button id="' + frm + '_nextfooter" class="x-tbar-page-next" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onNext(\'' + frm + '\')"></button>'
		sb2 = sb2 + '			<button id="' + frm + '_lastrecsfooter" class="x-tbar-page-last" style="cursor:default;width:' + btnWidth + ';height:' + btnheight + '" type="button" onclick="prevNext_onLastrecs(\'' + frm + '\')"></button>'
		sb2 = sb2 + '		</span>'



//		remove the more records message
		pnl.userDefinedFooterHtml =  "" 
		d = document.getElementById(frm + '_layoutWrapper') 
		var divTag = document.createElement("div");                
		divTag.id = frm +"_divPrevNextTop";
		divTag.setAttribute("align","right");                
		divTag.style.height = btnheight;   
		divTag.style.margin = "0px auto";   
		divTag.style.visibility = "hidden";                
		divTag.className ="x-toolbar x-small-editor panelToolbar";                
		divTag.innerHTML = sb1;                
		d.insertBefore(divTag,document.getElementById( frm )); //after grid title bar
	 
	 
		var divTagFooter = document.createElement("div");                
		divTagFooter.id = frm +"_divPrevNextPanelFooter";       
		divTagFooter.className ="panelToolbar";                
		divTagFooter.style.visibility = "hidden";  

		var divTag = document.createElement("div");                
		divTag.id = frm +"_divPrevNextFooter";                
		divTag.setAttribute("align","right");               
		divTag.style.height = btnheight;   
		divTag.style.margin = "0px auto";                 
		divTag.className ="x-toolbar x-small-editor panelToolbar";                
		divTag.innerHTML = sb2;         
//may want this one hidden - would need to pass a parameter to hide      
		divTagFooter.appendChild(divTag);  
		d.appendChild(divTagFooter);  
		
		pnl.recordLimit =  $(frm + '_PageNum').value
		setSortVar(pnl)		
		sortfld[frm] = srtfld[frm]
		pnl.addParameter("PageRest", "1=1")	

	}
	
	function btnEnable(btn,bol, frm){
		d = document.getElementById( frm + '_' + btn)
		if (d==null) {return}
		d2 = document.getElementById( frm + '_' + btn + 'footer')
		d.disabled=!bol
		d2.disabled=!bol
		if (!bol) {
			d.style.cursor='default'
			d.className = 'x-item-disabled ' + d.className.replace('x-item-disabled ', '')
			d2.style.cursor='default'
			d2.className = 'x-item-disabled ' + d.className.replace('x-item-disabled ', '')
		}
		else {
			d.style.cursor='hand'
			d.className = d.className.replace('x-item-disabled ', '')
			d2.style.cursor='hand'
			d2.className = d.className.replace('x-item-disabled ', '')
		}


	}
	 
	function prevNext_OnPageNumClick (frm,btn) {


		pnl = View.panels.get(frm)


		if (btn) {
			$(frm + '_PageNumfooter').value=$(frm + '_PageNum').value
		}
		else {
			$(frm + '_PageNum').value=$(frm + '_PageNumfooter').value
		}
		
		if (pnl.gridRows.getCount() > $(frm + '_PageNum').value) {
			btnEnable('next',true,frm)
			btnEnable('lastrecs',true,frm)
		}
		pnl.recordLimit =  $(frm + '_PageNum').value
		pnl.refresh(pnl.restriction);


	}

	function prevNext_afterRefresh (pnl) {
		//View.openProgressBar()
	

	  	frm = pnl.id


		pnl = View.panels.get(frm)
		setSortVar(pnl)

		if (sortfld[frm] != srtfld[frm]  || minConsoleRest[frm] != pnl.getParameters().filterValues ||  parentRest[frm] != pnl.restriction) {
			parentRest[frm] = pnl.restriction
			minConsoleRest[frm] = pnl.getParameters().filterValues //miniRest
			sortfld[frm] = srtfld[frm] 

			pnl.addParameter("PageRest", "1=1" );
			btnEnable('prev',false,frm)
			btnEnable('firstrecs',false,frm)
			//View.closeProgressBar()
			pnl.refresh(pnl.restriction)		
			

		}
		else {
			if (pnl.gridRows.length == -1) {
				btnEnable('prev',false,frm)
				btnEnable('firstrecs',false,frm)
			}
			else {
				btnEnable('next',pnl.hasMoreRecords,frm)
				btnEnable('lastrecs',pnl.hasMoreRecords,frm)
			}
		}
		

		$(frm + '_PageNumfooter').value=$(frm + '_PageNum').value
						

		//hide if the panel is hidden
		d3 = document.getElementById(frm +"_divPrevNextTop")
		d4 = document.getElementById(frm +"_divPrevNextPanelFooter")
		if (pnl.hidden) { //|| pnl.gridRows.length < $(frm + '_PageNum').value){
			d3.style.visibility = "hidden"
			d4.style.visibility = "hidden"
		}
		else {
			d3.style.visibility = "visible"
			d4.style.visibility = "visible"
		}
		
		d = document.getElementById( frm + '_PageNum')
		if (d==null) {
			//View.closeProgressBar(); 
			return;
		}
		d2 = document.getElementById(frm + '_PageNumfooter')
		d.disabled= pnl.gridRows.length < $(frm + '_PageNum').value && !document.getElementById( frm + '_firstrecs').disabled
		d2.disabled= pnl.gridRows.length < $(frm + '_PageNum').value && !document.getElementById( frm + '_firstrecs').disabled
		//View.closeProgressBar();
	}
	
 	function prevNext_onFirstrecs(frm) {
//		frm = pnl.id
		pnl = View.panels.get(frm)
		pnl.addParameter("PageRest", "1=1");
		btnEnable('prev',false,frm)
		btnEnable('firstrecs',false,frm)
		pnl.recordLimit =  $(frm + '_PageNum').value
		pnl.refresh(pnl.restriction);
	}
	
 	function prevNext_onLastrecs(frm) {
	//Need to reverse the sort order

//		frm = pnl.id
		pnl = View.panels.get(frm)
		pnl.recordLimit =  parseInt($(frm + '_PageNum').value, 10) + 1
		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			pnl.sortColumns[i].ascending = pnl.sortColumns[i].ascending * -1
		}
		pnl.addParameter("PageRest", "1=1");
		pnl.refresh(pnl.restriction);

		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			pnl.sortColumns[i].ascending = pnl.sortColumns[i].ascending * -1
		}
		
		if (pnl.gridRows.getCount() <= $(frm + '_PageNum').value) {
			//Reached the beginning
			pnl.addParameter("PageRest", "1=1");
			btnEnable('prev',false,frm)
			btnEnable('firstrecs',false,frm)
			pnl.recordLimit =  $(frm + '_PageNum').value
			pnl.refresh(pnl.restriction);
		}
		else {
			btnEnable('prev',true,frm)
			btnEnable('firstrecs',true,frm)

			var restriction = getNextrest(pnl)
//alert(restriction)
			pnl.addParameter("PageRest", restriction);
			pnl.recordLimit =  $(frm + '_PageNum').value
			pnl.refresh(pnl.restriction);
		}

	}
	
	function prevNext_onPrev(frm) {

//		frm = pnl.id
		pnl = View.panels.get(frm)

		var restriction = getPrevRest(pnl)
		if (restriction == "") {return}
		pnl.recordLimit =  parseInt($(frm + '_PageNum').value) + 1
//alert(restriction)
		pnl.addParameter("PageRest", restriction);
		//Need to reverse the sort order
		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			pnl.sortColumns[i].ascending = pnl.sortColumns[i].ascending * -1
		}

		pnl.refresh(pnl.restriction);
	
		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			pnl.sortColumns[i].ascending = pnl.sortColumns[i].ascending * -1
		}
		//Refresh the screen and then requery so the hasmorerecords works correctly
		if (pnl.gridRows.getCount() <= $(frm + '_PageNum').value) {
			//Reached the beginning
			pnl.addParameter("PageRest", "1=1");
			btnEnable('prev',false,frm)
			btnEnable('firstrecs',false,frm)
			pnl.recordLimit =  $(frm + '_PageNum').value

			pnl.refresh(pnl.restriction);
		}
		else {
			restriction = getNextrest(pnl)
//alert(restriction)	
			pnl.addParameter("PageRest", restriction);
			pnl.recordLimit =  $(frm + '_PageNum').value

			pnl.refresh(pnl.restriction);
		}
	}
	  

	function prevNext_onNext (frm) {
//		frm = pnl.id
		pnl = View.panels.get(frm)

		if (pnl.hasMoreRecords) {
			var restriction =  getNextrest(pnl)
//alert(restriction)
			pnl.addParameter("PageRest", restriction);
			btnEnable('prev',true,frm)
			btnEnable('firstrecs',true,frm)
			pnl.refresh(pnl.restriction);

			
		}
	}
  
	function setSortVar(pnl) {
		var frm = pnl.id
		if (pnl.sortEnabled) {

			var addDfltSort = -1
			if (valueExistsNotEmpty(pnl.sortColumnID)) {

				pnl.sortColumns[1] = null
				if (pnl.sortColumnOrder != 0 ) {
				//	if(pnl.sortColumns[0] === null){
				//		pnl.sortColumns[0] = {};
				//	}
					pnl.sortColumns[0].fieldName = pnl.sortColumnID
					pnl.sortColumns[0].ascending = -1
					srtfld[frm] = pnl.sortColumnID + " DESC"
					if (pnl.sortColumnOrder == 1) {
						pnl.sortColumns[0].ascending = 1
						srtfld[frm] = pnl.sortColumnID + " ASC"
					}

					if (pnl.primaryKeyIds.length > 1){
						addDfltSort = 1
					}
					else if (pnl.primaryKeyIds[0] != pnl.sortColumnID) {
						addDfltSort = 1
					}
				}
				else {
					srtfld[frm] = ""
					addDfltSort = 0
					
				}
			}
			else if (pnl.sortColumns.length == 0 || srtfld[frm] == "" ) {

				srtfld[frm] = ""
				addDfltSort = 0
				
			}
			if (addDfltSort != -1) {

				var dsort = ", " + dfltsort[frm]
				for (var i = 0; i < dfltsort[frm].split(', ').length ; i++) {
					fld = dfltsort[frm].split(', ')[i].split(' ')[0]
					ASC = -1
					if (dfltsort[frm].split(', ')[i].split(' ')[1] == "ASC") {ASC = 1}
					if (pnl.sortColumnID == fld ) {
						if (addDfltSort > 0) {
							dsort = dsort.replace(', ' + fld +  ' ASC','').replace(', ' + fld +  ' DESC','')
						}
						else {
							//if the default field to sort is defaulted to DESC and the user clicks it's sort to change it from Desc to no sort 
							//then we need to add the sort in twice for it to be different - otherwise it won't sort correctly
							srtfld[frm] = srtfld[frm]  + dsort
							addDfltSort = addDfltSort + 1
						}
					}
					else {
						pnl.sortColumns[addDfltSort] = {'fieldName':fld , 'ascending':ASC}
						addDfltSort = addDfltSort + 1
					}
				}
				for (i = addDfltSort; i < pnl.sortColumns.length ; i++) {
					pnl.sortColumns[i] = null
				}
			
				if (srtfld[frm] != "") {
					srtfld[frm] = srtfld[frm]  + dsort
				}
				else {
					srtfld[frm] = srtfld[frm]  + dfltsort[frm]
				}
				
			}
			pnl.sortColumnID = null
	
		}	

	}
  			


	function getPrevRest(pnl){
		if (pnl.gridRows.getCount() == 0 ) {return}
		row = pnl.gridRows.get(0); 
		rest = "("
		var arrRest=new Array(); 
		pcCnt =  pnl.primaryKeyIds.length

		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			srtval = makeLiteralOrNull(row.getRecord().getValue(sc.fieldName));
			arrRest[i] = ""

			gtlt = " < "
			restisnull = ""
			if (sc.ascending == -1) {
				restisnull = " is NOT NULL "
				gtlt = " > "
			}
		
			
			if (srtval == "" ) {
				if (restisnull != "") {arrRest[i] = rest  + sc.fieldName + restisnull + ")"}
				rest = rest + sc.fieldName + " is null AND "
			}
			else {
				arrRest[i] = rest  + sc.fieldName + gtlt + srtval + ")"
				rest = rest + sc.fieldName + " = " + srtval + " AND "
			}
			for (var xx = 0; xx < pnl.primaryKeyIds.length; xx++) {
				if (pnl.primaryKeyIds[xx] == sc.fieldName) {
					pcCnt = pcCnt - 1
					xx = pnl.primaryKeyIds.length
					if (pcCnt = 0) {i = pnl.sortColumns.length}
					//break out of xx and i loop if this is the last PK
				}
			}
			
		}
		restriction = "("
		for (var i = 0; i < arrRest.length; i++) {
			if (i !=0) {restriction = restriction + ' OR '}
			restriction = restriction + arrRest[i]
		}
		restriction = restriction + ")"
		return restriction
	}
  

	function getNextrest (pnl){
		if (pnl.gridRows.getCount() == 0 ) {return}
		row = pnl.gridRows.get(pnl.gridRows.getCount() - 1); 
		rest = "("
		var arrRest=new Array(); 
		pcCnt =  pnl.primaryKeyIds.length

		for (var i=0, sc; sc = pnl.sortColumns[i]; i++) {
			srtval = makeLiteralOrNull(row.getRecord().getValue(sc.fieldName));
			arrRest[i] = ""

			gtlt = " > "
			restisnull = " is NOT NULL "
			if (sc.ascending == -1) {
				restisnull = ""
				gtlt = " < "
			}
			
			if (srtval == "" ) {
				if (restisnull != "") {arrRest[i] = rest  + sc.fieldName + restisnull + ")"}
				rest = rest + sc.fieldName + " is null AND "
			}
			
			else {
				arrRest[i] = rest  + sc.fieldName + gtlt + srtval + ")"
				rest = rest + sc.fieldName + " = " + srtval + " AND "
			}
			
			for (var xx = 0; xx < pnl.primaryKeyIds.length; xx++) {
				if (pnl.primaryKeyIds[xx] == sc.fieldName) {	
					pcCnt = pcCnt - 1
					xx = pnl.primaryKeyIds.length
					if (pcCnt = 0) {i = pnl.sortColumns.length}
					//break out of xx and i loop if this is the last PK
				}
			}
		}
		restriction = "("
		for (var i = 0; i < arrRest.length; i++) {
			if (i !=0) {restriction = restriction + ' OR '}
			restriction = restriction + arrRest[i]
		}
		
		restriction = restriction + ")"
		return restriction
	}


	function makeLiteralOrNull(val){
		var rVal = "NULL"
		if (val != '') {
			val = "'" + val.replace(/'/g, "''")  + "'"
		}

		return val
	}
