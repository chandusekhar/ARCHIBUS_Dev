// CHANGE LOG
// 2016/03/29 - MSHUSSAI - Added code to Print Work Request with Technician Comments

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
		titleObj = Ext.get('printWo');
		titleObj.on('click', this.showMenuDetailsPrintWo, this, null);
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
		menuItems.push({
					text: 'Print with Technician Comments',
					handler: this.onPrintButtonPush.createDelegate(this, ['PrintTech'])
					});
		var menu = new Ext.menu.Menu({
			items: menuItems
			});
		menu.showAt(e.getXY());
	},

	showMenuDetailsPrintWo: function(e, item){
		var menuItems = [];
		menuItems.push({
					text: 'Print',
					handler: this.onPrintButtonPush.createDelegate(this, ['PrintWo'])
					});
		menuItems.push({
					text: 'Preview',
					handler: this.onPrintButtonPush.createDelegate(this, ['PreviewWo'])
					});
		var menu = new Ext.menu.Menu({
			items: menuItems
			});
		menu.showAt(e.getXY());
	},

	verifySelectedRecord:function(option){
		var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
		if(option == "Print" || option == "Preview" || option == "PrintTech"){
			if (selectedRecords.length <1){
				View.showMessage('Select work request to '+option.toLowerCase());
				return false;
			}
		}
		if(option == "PrintWo" || option == "PreviewWo"){
			if (selectedRecords.length <1){
				View.showMessage('Select work order to '+option.slice(0,option.length-2).toLowerCase());
				return false;
			}
			for(var i = 0; i < selectedRecords.length; i++){
				var currRec = selectedRecords[i];
				if(currRec.values['wrhwr.wo_id'] == ""){
					View.showMessage('One of the selected record(s) do not have work order(s)');
					return false;
				}
			}
		}
		return true;
		
	},
	
	onPrintButtonPush: function(menuItemId){
		if(!this.verifySelectedRecord(menuItemId)){
			return false;
		}
		//alert("MSHUSSAI");
		switch (menuItemId) {
			case "Print":
				var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
				View.openDialog('uc-wrhwr-multi-print-invoice-report.axvw',null,null,
					{
						printOrPreview:"Print",
						selectedRecords: selectedRecords,
						//printCFNotes: false
					}
				);
				break;
			case "PrintWo":
				var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
				if(selectedRecords.length < 0){
					View.showMessage('Select work request to print');
					return false;
				}
				View.openDialog('uc-wrhwr-multi-print-workpkg-report.axvw',null,null,
					{
						printOrPreview:"Print",
						selectedRecords: selectedRecords
					}
				);
				break;
			case "Preview":
				var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
				if(selectedRecords.length < 0){
					View.showMessage('Select work request to print');
					return false;
				}
				View.openDialog('uc-wrhwr-multi-print-invoice-report.axvw',null,null,
					{
						printOrPreview:"Preview",
						selectedRecords: selectedRecords
					}
				);
				break;
			case "PrintTech":
				var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
				if(selectedRecords.length < 0){
					View.showMessage('Select work request to print');
					return false;
				}
				View.openDialog('uc-wrhwr-multi-print-invoice-report-tech.axvw',null,null,
					{
						printOrPreview:"Preview",
						selectedRecords: selectedRecords
					}
				);
				break;
			case "PreviewWo":
				var selectedRecords = this.wrhwrListPanel.getSelectedRecords();
				if(selectedRecords.length < 0){
					View.showMessage('Select work request to print');
					return false;
				}
				View.openDialog('uc-wrhwr-multi-print-workpkg-report.axvw',null,null,
					{
						printOrPreview:"Preview",
						selectedRecords: selectedRecords
					}
				);
				break;
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
