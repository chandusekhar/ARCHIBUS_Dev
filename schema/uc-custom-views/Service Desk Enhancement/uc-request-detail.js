var ucRequestDetailController = View.createController('ucRequestDetailController', {
    selectedProbCat: null,
    selectedProbType: null,

	afterViewLoad: function() {
		//this.requestDetail_grid.show(false);
		this.modifyCellContent(this.requestDetail_grid);
		//var gridTable = document.getElementById("grid_requestDetail_grid");
		//gridTable.style.width="50%";
	},
	
	requestDetail_grid_afterRefresh: function() {
		var gridTable = document.getElementById("grid_requestDetail_grid");

/* 		gridTable.onclick = function(button){
			this.selectedProbCat = button.originalTarget.defaultValue;
			var btnTarget = document.getElementById(button.target.id);
			
			var probTypeArray = [];
			var obj = {};
			
			var parameters = {
				tableName: 'probtype',
				fieldNames: toJSON(['probtype.prob_type','probtype.description']),
				restriction: "probtype.prob_cat = '" + this.selectedProbCat  + "'"
			};
		
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
			
			if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
				for(i=0;i<result.data.records.length;i++){
					var curProbTypeId = result.data.records[i]['probtype.prob_type'];
					var curProbTypeDesc = result.data.records[i]['probtype.description'];

					obj['key_'+i] = curProbTypeId;
					obj['value_'+i] = curProbTypeDesc;
				}
			}
			
			if (obj['key_0']) {
				ucRequestDetailController.showMenuProbType(this, btnTarget, obj, this.selectedProbCat);
			}
		}; */
	},

	//Modify grid buttons
	modifyCellContent : function(panel){
		panel.afterCreateCellContent = function(row, col, cellElement) {
			//if (cellElement.textContent) {
			if (cellElement.innerText || cellElement.textContent) {
				var probCat='';
				if (cellElement.innerText) {
					probCat = cellElement.innerText;
				} else {
					probCat = cellElement.textContent;
				}
				
				var parameters = {
					tableName: 'probcat',
					fieldNames: toJSON(['probcat.image_file']),
					restriction: "probcat.prob_cat = '" + probCat + "'"
				};
			
				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
				
				var imageFile = '';
				var newImg;
				if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					imageFile = result.data.records[0]['probcat.image_file'];
				}
				
				if (imageFile != '') {
					newImg = document.createElement("img");
					newImg.src = "/archibus/schema/uc-custom-views/Service Desk Enhancement/"+imageFile;
					newImg.height="20";
					newImg.width="20";
				}
				
				//var btnEle = document.getElementById('requestDetail_grid_row0_probcat.col1ProbCat');
/* 				var newOH = '<TD ALIGN=CENTER><INPUT TYPE="submit" VALUE='+probCat+' STYLE="width:100%"></FORM></TD>';	
				cellElement.outerHTML = newOH;	
				cellElement.innerHTML = newOH; */	
				cellElement.outerHTML = '';	
				cellElement.innerHTML = '';	
				var btn = document.createElement("BUTTON");
				btn.appendChild(newImg);
				var btnText = document.createTextNode(probCat);
				btn.appendChild(btnText);
				//btn.onclick = btnOnClick;
				btn.onclick = (function() {
					return function() {
					btnOnClick(probCat, btn);
					}
				})();
				btn.style.height="50px";
				btn.style.width="100%";
					
				cellElement.appendChild(btn);
			}
		}
	},
	
	showMenuProbType: function(t, e, item, selectedProbCat){
		var itemCnt = 0;
		while (item['key_'+itemCnt]) {
			itemCnt++;
		}
		var menuItems = [];
		
		for(i=0;i<itemCnt;i++){
			var btnText = item['value_'+i];
			var keyText = item['key_'+i];
			
			menuItems.push({
				text: btnText,
				handler: ucRequestDetailController.selectProbType.createDelegate(this, [btnText,keyText,selectedProbCat])
			});
		}
		
		var menu = new Ext.menu.Menu({items: menuItems});
        menu.show(e, '');
	},
	
	//Action Listener - Selecting Problem Type
	selectProbType: function(probDesc, probType, probCat){
		var parameters = {
				tableName: 'probcat',
				fieldNames: toJSON(['probcat.task_file']),
				restriction: "probcat.prob_cat = '" + probCat + "'"
			};
		
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
			
			if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					var taskFile = result.data.records[0]['probcat.task_file'];
					View.brg_selProbCat = probCat;
					View.brg_selProbType = probType;
					this.reportDisplayPanel.loadView(taskFile);
			}
			
		//this.reportDisplayPanel.show(true);
		//this.reportDisplayPanel.refresh();
    }
});

function btnOnClick(probCat, bottonElement) {
	var probTypeArray = [];
	var obj = {};
	
	var parameters = {
		tableName: 'probtype',
		fieldNames: toJSON(['probtype.prob_type','probtype.description']),
		restriction: "probtype.prob_cat = '" + probCat  + "'"
	};

	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	
	if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
		for(i=0;i<result.data.records.length;i++){
			var curProbTypeId = result.data.records[i]['probtype.prob_type'];
			var curProbTypeDesc = result.data.records[i]['probtype.description'];

			obj['key_'+i] = curProbTypeId;
			obj['value_'+i] = curProbTypeDesc;
		}
	}
	
	if (obj['key_0']) {
		ucRequestDetailController.showMenuProbType(this, bottonElement, obj, probCat);
	}
}