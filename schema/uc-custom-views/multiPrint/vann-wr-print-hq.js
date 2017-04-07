
var cntrl = View.createController('cntrl', {

    //----------------event handle--------------------
    afterViewLoad: function(){

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
  
		
		var sectionLabels = document.getElementsByName("sectionLabels");
		if(typeof(sectionLabels)!='undefined')
		{
			for(var i = 0, len = sectionLabels.length; i < len; i++){
				this.removeTextChildNodes(sectionLabels[i]);
				var td = sectionLabels[i].parentNode;
				this.removeTextChildNodes(td);
				var tr = td.parentNode;
				tr.deleteCell(0);
				td.colSpan=8;
				td.width='100%';
				td.style.padding="0px";
			}	
		
		}

   },
   
   removeTextChildNodes:function(element){
		var node =  undefined;
		var i = (element.childNodes.length)-1;
		for (;i>-1;i--){
			node = element.childNodes[i];
			if ((node!=undefined) && (node.nodeName=="#text")){
				element.removeChild(node);;
			}
		}
	},

 
	
    afterInitialDataFetch: function(){	
		titleObj = Ext.get('print');
		titleObj.on('click', this.showMenuDetailsPrint, this, null);
	},
	
	showMenuDetailsPrint: function(e, item){
		var menuItems = [];
		menuItems.push({
					text: 'Print',
					handler: this.onPrintButtonPush.createDelegate(this, ['Print'])
					});
		menuItems.push({
					text: 'Preview',
					handler: this.onPrintButtonPush.createDelegate(this, ['Preview'])
					});
		var menu = new Ext.menu.Menu({
			items: menuItems
			});
		menu.showAt(e.getXY());
	},
	
	onPrintButtonPush: function(menuItemId){
		switch (menuItemId) {
			case "Print":
				this.printRow(' ',' ',true)
				break;

			case "Preview":
				this.printRow('view',' ',true)
				document.getElementById('mainLayout_center_div').parentNode.style.height='auto'
				document.getElementById('mainLayout_center_div').parentNode.style.width='auto'
				document.getElementById('mainLayout_center_div').parentNode.style.overflow='hidden'
				document.getElementById('mainLayout_center_div').style.overflow='auto'
				break;
		}	
    },
	wrList_onPrintThisRow: function(row)
	{
		var rest = 'wr.wr_id = ' + row.record['wr.wr_id']
		this.printRow('view',rest,false)
		document.getElementById('mainLayout_center_div').parentNode.style.height='auto'
		document.getElementById('mainLayout_center_div').parentNode.style.width='auto'
		document.getElementById('mainLayout_center_div').parentNode.style.overflow='hidden'
		document.getElementById('mainLayout_center_div').style.overflow='auto'
	},
	
	
	printRow: function(para,rest,list) {
		var styles;
		var stylesheets = new Array('/archibus/schema/uc-custom-views/multiPrint/vann-printreport.css')
		var oIframe = "print_iframe"
		
		//If user role is customer hide the wrcf and intnotes
		if (View.user.role.substring(0,4) == 'CUST') {
			styles=new Array('#wrcf_div { display:none; }','#intNotes_tr { display:none; }')
		}
		else {
			styles=new Array()
		}
/*		}
		else if(para=="cost"){			
			styles=new Array('#hzTable0 { display:none; }','#hzTable1 { display:none; }','#hzTable2 { display:none; }'
							,'#hzTable3 { display:none; }','#hzTable4 { display:none; }','#hzSummary { display:none; }','#workTeam{ display:none; }')
		}
		else if(para=="cf"){
			styles=new Array('#wrpt_div { display:none; }','#wr_other_div { display:none; }','#printDate{ display:none; }','#wrCostContent { display:none; }'
							,'#wrResStats { display:none; }','#wrcf_row { display:none; }','#wrpt_row { display:none; }','#wr_other_row { display:none; }')
*/
		//}
		//else {
		//	 styles=[];
		//}
		ds1=this.view.dataSources.get(this.defaultHTML.dataSourceId);
		if(rest!=' '){
			buildPrint(rest,oIframe,para!='view',ds1,styles,stylesheets);
		}
		else{
			var restriction = '1=1';
			var selectedRows = this.wrList.getSelectedRecords();
			ds=View.dataSources.get(this.defaultHTML.dataSourceId);
			if((selectedRows.length>0)&&(list==true)){
				var wr_id = ' ( ';
				for(i=0;i<selectedRows.length;i++){
					currRec = selectedRows[i];
					if(i!=(selectedRows.length-1)){
						wr_id+= "'"+currRec.values['wr.wr_id']+"',";
					}
					else{
						wr_id+= "'"+currRec.values['wr.wr_id']+"' )";
					}
				}
				restriction = restriction +" and wr.wr_id in "+wr_id;
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
				}
			}
		}
	},
   

    wrConsole_onFilter: function() {

	   var restriction = '1=1';

	   var val = this.wrConsole.getFieldValue('wr.wr_id');
	   if (val != '') {restriction = restriction + ' and wr.wr_id like ' + makeLiteralOrNull('%' + val + '%')}   
		   
	   var val = this.wrConsole.getFieldValue('wr.bl_id');
	   if (val != '') {
	   	restriction = restriction + " and exists (select 1 from bl where bl.bl_id = wr.bl_id and (bl.bl_id like " + makeLiteralOrNull("%" + val + "%") 
	   	restriction = restriction + " OR bl.name like " + makeLiteralOrNull("%" + val + "%")  + "))"
	   } 

	   var val = this.wrConsole.getFieldValue('wr.eq_id');
	   if (val != '') {restriction = restriction + ' and wr.eq_id like ' + makeLiteralOrNull('%' + val + '%')}   
	   
   	  
	   var val = this.wrConsole.getFieldValue('wr.tr_id');
	   if (val != '') {restriction = restriction + ' and wr.tr_id like ' + makeLiteralOrNull('%' + val + '%')}  

 
	 
		   
	   var val = this.wrConsole.getFieldValue('wr.date_requested');
	   if (val != '') {restriction = restriction + ' and wr.date_requested = ' + makeLiteralOrNull(val)} 

	   var val = this.wrConsole.getFieldValue('wr.pmp_id');
	   if (val != '') {restriction = restriction + ' and wr.pmp_id like ' + makeLiteralOrNull('%' + val + '%')}   

	   var val = this.wrConsole.getFieldValue('wr.requestor');
	   if (val != '') {
	   	restriction = restriction + " and exists (select 1 from em where em.em_id = wr.requestor and (em.em_id like " + makeLiteralOrNull("%" + val + "%") 
	   	restriction = restriction + " OR em.name_first + ' ' + em.name_last like " + makeLiteralOrNull("%" + val + "%")  + "))"
	   } 

	   var val = this.wrConsole.getFieldValue('wr.status');
	   if (val != '') {restriction = restriction + ' and wr.status = ' + makeLiteralOrNull(val)}  

	   var val = this.wrConsole.getFieldValue('wr.prob_type');
	   if (val != '') {restriction = restriction + ' and wr.prob_type like ' + makeLiteralOrNull('%' + val + '%')}  

	   var val = this.wrConsole.getFieldValue('cf.cf_id');
	   if (val != '') {restriction = restriction + ' and exists (select 1 from wrcf where wrcf.wr_id = wr.wr_id and wrcf.cf_id like ' + makeLiteralOrNull('%' + val + '%') + ')' }  

	   var val = this.wrConsole.getFieldValue('wr.description');
	   if (val != '') {restriction = restriction + ' and wr.description like ' + makeLiteralOrNull('%' + val + '%')}   

	   var val = this.wrConsole.getFieldValue('wr.cf_notes');
	   if (val != '') {restriction = restriction + ' and wr.cf_notes like ' + makeLiteralOrNull('%' + val + '%')}   
//alert(restriction)

	   this.wrList.refresh(restriction);

	   // show the report
	   this.wrList.show(true);

    },      

      

    fillLoc: function(tbl, val) {
		rest = ""
		v = val
		if (fld == "eq") {
			if (!v) {v = this.wrDetails.getFieldValue('wr.eq_id')} 
			rest = "eq.eq_id =  " + makeLiteralOrNull(v)
		}
		var parameters = {
			tableName: tbl,
			fieldNames: toJSON([tbl +'.bl_id',tbl +'.fl_id',tbl +'.rm_id']),
			restriction: rest
		};
		
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    if (result.code == 'executed') {
            var record = result.data.records[0];
			this.wrDetails.setFieldValue('wr.bl_id',record[tbl +'.bl_id'])
			this.wrDetails.setFieldValue('wr.fl_id',record[tbl +'.fl_id'])
			this.wrDetails.setFieldValue('wr.rm_id',record[tbl +'.rm_id'])
		}
	},
	
    dmmy: function (){
	}
})

function selectActionListener(fieldName,selectedValue,previousValue){
	if (fieldName = 'wr.eq_id') {
		cntrl.fillLoc('eq', selectedValue);	
	}
}


function makeLiteralOrNull(val,dt){
	var rVal = "NULL"
	if (val != '') {
		if (dt != null) {dt = 12}
		if (dt == 9) { //date
			//have to figure this out based on database
		}
		else if (dt == 10) { //time
			//have to figure this out based on database
		}
		else {
			rVal = "'" + val.replace(/'/g, "''")  + "'"
		}
	}

	return rVal
}

function expandCollapsePrint(expand){
	reg = View.panels.get("print").layoutRegion
	LayoutRegion = getRegion(reg)
	reg = LayoutRegion.id
	regn = LayoutRegion.region
	LayoutRegion = LayoutRegion.ownerCt.layout[regn]
	var width=document.getElementById('centerDetails').style.width
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
	//shrinkExpandRegion1('wrList', false, 'wrList,sublistTabs')
	
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

