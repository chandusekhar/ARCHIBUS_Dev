
var printCtrl = View.createController('printCtrl', {
	formNameToGetWrId: "formNameToGetWrId",
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
				var rest = this.getWrRestrictionFromPanel();
				if(rest != ' '){
					this.printRow(' ',rest,false)
				}
				break;

			case "Preview":
				var rest = this.getWrRestrictionFromPanel();
				if(rest != ' '){
					expandCollapsePrint(true,'centerRegion');
					this.printRow('view',rest,false);
				}
				break;
		}
	},

	printRow: function(para,rest,list) {
		var styles;
		var stylesheets = new Array('/archibus/schema/uc-custom-views/multiPrint/uc-printreport.css');
		var oIframe = "print_iframe"

		//If user role is customer hide the wrcf and intnotes
		if (View.user.role.substring(0,4) == 'CUST') {
			styles=new Array('#wrcf_div { display:none; }','#intNotes_tr { display:none; }')
		}
		else {
			styles=new Array()
		}

		ds1=this.view.dataSources.get(this.defaultHTML.dataSourceId);
		if(rest==' '){
			rest = this.getWrRestrictionFromPanel();
		}
		if(rest!=' '){
			buildPrint(rest,oIframe,para!='view',ds1,styles,stylesheets);
		}
	},
	
	//grab the form name from the main view and return the restriction
	getWrRestrictionFromPanel:function(){
		var rest = ' ';
		var panelName = getMessage(this.formNameToGetWrId);
		var panel = View.panels.get(panelName);
		if(panel){ //make sure the panel is defined
			var wr_id = panel.getFieldValue('wr.wr_id');
			rest = "wr.wr_id="+wr_id;
		}
		return rest;
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

