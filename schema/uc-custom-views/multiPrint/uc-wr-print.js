
var printCtrl = View.createController('printCtrl', {
	//----------------event handle--------------------
	afterViewLoad: function(){
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
				expandCollapsePrint(true,'centerRegion');
				this.printRow('view',' ',true);
				//document.getElementById('mainLayout_center_div').parentNode.style.height='auto'
				//document.getElementById('mainLayout_center_div').parentNode.style.width='auto'
				//document.getElementById('mainLayout_center_div').parentNode.style.overflow='hidden'
				//document.getElementById('mainLayout_center_div').style.overflow='auto'
				break;
		}
	},

	wrList_onPrintThisRow: function(row)
	{
		var rest = 'wr.wr_id = ' + row.record['wr.wr_id']
		this.printRow('view',rest,false)
		//document.getElementById('mainLayout_center_div').parentNode.style.height='auto'
		//document.getElementById('mainLayout_center_div').parentNode.style.width='auto'
		//document.getElementById('mainLayout_center_div').parentNode.style.overflow='hidden'
		//document.getElementById('mainLayout_center_div').style.overflow='auto'
	},


	printRow: function(para,rest,list) {
		var styles;
		//var stylesheets = new Array('/archibus/schema/uc-custom-views/multiPrint/vann-printreport.css')
		var stylesheets = new Array('/archibus/schema/uc-custom-views/multiPrint/uc-printreport.css')
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
			var selectedRows = this.wrListPanel.getSelectedRecords();
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
					expandCollapsePrint(false,'centerRegion');
				}
			}
		}
	},

	dmmy: function (){
	}
});


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

function expandCollapsePrint(expand) {
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
    alert(1);
	//shrinkExpandRegion1('wrList', false, 'wrList,sublistTabs')
}

function getRegion(reg){
	LayoutRegion = Ext.ComponentMgr.get(window.document.getElementById(reg).id)
	//If it's the Center region go and get the parent region.  If no parent then return null
	while (LayoutRegion.region == 'center') {
		if (!LayoutRegion.ownerCt) {return null}
		LayoutRegion = LayoutRegion.ownerCt;
	}

	return LayoutRegion
}

