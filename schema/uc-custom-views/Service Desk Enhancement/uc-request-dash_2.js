
var ucRequestDashCntr = View.createController('ucRequestDashController', {
	openedMenu: null,
	
	

	afterViewLoad: function() {

		if (View.user.role == 'UC-GUEST') {
			var toolbar = parent.View.controllers.get("navigator")
			if (!toolbar) {toolbar = parent.View.controllers.get("dashboard")}
			toolbar = toolbar.mainToolbar
			if (!parent.document.getElementById("navigatorRegion-xcollapsed")) {
				parent.Ext.ComponentMgr.get("navigatorRegion").collapse(false)
				//toolbar.navigatorToolbar.navigatorType = "dashboard"
				//toolbar.buttons[0].setText(Ab.view.Action.CHEVRON + 'Show Navigator');
				//toolbar.buttons[0].el.dom.parentElement.className=""
			}
			if (!parent.document.getElementById("dashboardTabsRegion-xcollapsed")) {
				parent.Ext.ComponentMgr.get("dashboardTabsRegion").collapse(false)
				//toolbar.navigatorToolbar.navigatorType = "navigator"
				//toolbar.buttons[0].setText(Ab.view.Action.CHEVRON + 'Show Dashboard');
				//toolbar.buttons[0].el.dom.parentElement.className=""
			}
		}

		this.hideprobtypeBtn();
	
		this.modifyCellContent(this.requestDetail_grid);

		var parameters = {
			tableName: 'messages',
			fieldNames: toJSON(['messages.message_id','messages.message_text']),
			restriction: "messages.message_id in ('WORK_REQ_TEXT','EMERGENCY_REQ_TEXT')"
		};
			
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		var workReqText = '';
		var resReqText = '';
		var emergReqText = '';
		var itReqText = '';
		var missionStatementText = '';
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			for(i=0;i<result.data.records.length;i++){
				if (result.data.records[i]['messages.message_id'] == 'WORK_REQ_TEXT') {
					workReqText = result.data.records[i]['messages.message_text'];
				}
				
				if (result.data.records[i]['messages.message_id'] == 'EMERGENCY_REQ_TEXT') {
					emergReqText = result.data.records[i]['messages.message_text'];
				}
				if (result.data.records[i]['messages.message_id'] == 'IT_REQ_TEXT') {
					itReqText = result.data.records[i]['messages.message_text'];
				}
				if (result.data.records[i]['messages.message_id'] == 'RES_REQ_TEXT') {
					resReqText = result.data.records[i]['messages.message_text'];
				}

				if (result.data.records[i]['messages.message_id'] == 'MISSION_STATEMENT_TEXT') {
					missionStatementText = result.data.records[i]['messages.message_text'];
				}
			}
		}

		//document.getElementById("main_msgWhat").innerHTML = workReqText;
		//document.getElementById("main_msgEmer").innerHTML = emergReqText;
		//document.getElementById("main_msgStudent").innerHTML = resReqText;
		//document.getElementById("main_msgIT").innerHTML = itReqText;
		//document.getElementById("mstatement").innerHTML = missionStatementText;

		ucRequestDashCntr.showHideRegion("details", false)

		document.getElementById("instructions").onresize =correctIEButtons
	},
	
	//Modify grid buttons
	modifyCellContent : function(panel){
		panel.afterCreateCellContent = function(row, col, cellElement) {
			if (cellElement.innerText || cellElement.textContent) {
				var probCat='';
				if (cellElement.innerText) {
					probCat = cellElement.innerText;
				} else {
					probCat = cellElement.textContent;
				}
				var parameters = {
					tableName: 'uc_probcat',
					fieldNames: toJSON(['uc_probcat.image_file','uc_probcat.description','uc_probcat.prob_cat']),
					restriction: "uc_probcat.prob_cat = '" + probCat.replace(/'/g, "''") + "'"
				};
			
				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
				if (result.code =="sessionTimeout") {
					handleSessionTimeout();
					return;
				}
				var imageFile = '';
				var probCatDesc = '';
				var probCat = '';
				var newImg;
				if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					imageFile = result.data.records[0]['uc_probcat.image_file'];
					probCatDesc = result.data.records[0]['uc_probcat.description'];
					probCat = result.data.records[0]['uc_probcat.prob_cat'];
				}
				
				if (imageFile != '') {
					newImg = document.createElement("img");
					newImg.src = "/archibus/schema/ab-system/graphics/"+imageFile;
					newImg.height="20";
					newImg.width="20";
				}
					
				cellElement.innerHTML = '';	
				var btn = document.createElement("BUTTON");
				btn.appendChild(newImg);
				var btnText = document.createTextNode("  " + probCatDesc);
				btn.appendChild(btnText);
				btn.className = 'probCatBtn'
				btn.onclick = (function() {
					return function() {
						this.openedMenu = btnOnClick(probCat, btn);
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
				handler: ucRequestDashCntr.selectProbType.createDelegate(this, [btnText,keyText,selectedProbCat])
			});
		}
		
        var assertMenuHeight = function(m) { 
            var maxHeight = Ext.getBody().getHeight() - 145; 
            if (m.el.getHeight() > maxHeight) { 
                m.el.setHeight(maxHeight); 
                m.el.applyStyles('overflow:auto;'); 
            } 
        }; 
		var menu = new Ext.menu.Menu({items: menuItems, listeners : { beforeshow : assertMenuHeight }});
        menu.show(e, '');
		return menu;
	},
	
	//Action Listener - Selecting Problem Type
	selectProbType: function(probDesc, probType, probCat){
		
			var parameters = '';
			var selTaskFile = '';
			
			parameters = {
				tableName: 'uc_probcat',
				fieldNames: toJSON(['uc_probcat.task_file']),
				restriction: "uc_probcat.prob_cat = '" + probCat.replace(/'/g, "''") + "'"
			};
			selTaskFile = 'uc_probcat.task_file';
		
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
			if (result.code =="sessionTimeout") {
				handleSessionTimeout();
				return;
			}
			if (result.code == 'executed' && result.data != "undefined" && result.data.records[0] && result.data.records[0][selTaskFile] != ''){
				var taskFile = result.data.records[0][selTaskFile];
				View.brg_selProbCat = probCat;
				View.brg_selProbType = probType;
				if (taskFile.indexOf(".axvw") ==-1){
					openOtherSite( taskFile);
				}
				else {
					this.reportDisplayPanel.loadView(taskFile);
					
					this.showprobtypeBtn();
					this.reportDisplayPanel.show(true)
					ucRequestDashCntr.showHideRegion("probtype", false)
					ucRequestDashCntr.showHideRegion("details", true)
				}
				
			} else {
				parameters = {
					tableName: 'probtype',
					fieldNames: toJSON(['probtype.task_file']),
					restriction: "probtype.prob_cat = '" + probCat.replace(/'/g, "''") + "' AND probtype.prob_type = '" + probType.replace(/'/g, "''") + "'"
				};
				selTaskFile = 'probtype.task_file';
			
				var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
				
				if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
					var taskFile = result.data.records[0][selTaskFile];
					View.brg_selProbCat = probCat;
					View.brg_selProbType = probType;
					if (taskFile.indexOf(".axvw") ==-1){
						openOtherSite( taskFile);
					}
					else {
						this.reportDisplayPanel.loadView(taskFile);
						this.showprobtypeBtn();
						this.reportDisplayPanel.show(true)
						ucRequestDashCntr.showHideRegion("probtype", false)
						ucRequestDashCntr.showHideRegion("details", true)
					}
				}
			}
    },
	
	hideprobtypeBtn: function() {
		this.requestDetail_btns.actions.get('showProbtype').button.hide();
	},
	showprobtypeBtn: function() {
		this.requestDetail_btns.actions.get('showProbtype').button.show();
	},
	
	showHideRegion: function(region, show){
		var LayoutRegion = Ext.ComponentMgr.get(region);
		if (show) {
			LayoutRegion.expand(false);
		}else {
			LayoutRegion.collapse(false);
		}
	}
	
	
	
	
	

});

function handleSessionTimeout () {
       
  // set View flag to prohibit all message dialogs
	View.sessionTimeoutDetected = true;
	top.View.sessionTimeoutDetected = true;
	// display the timeout message
	var title = View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_SESSION_TIMEOUT_TITLE);
	var message = View.getLocalizedString(Ab.workflow.Workflow.z_MESSAGE_SESSION_TIMEOUT);
	Ext.MessageBox.alert(title, message, function() {
		// when the user clicks OK, redirect to the logout page
		
		//top.location = View.logoutView; //this changes the path 
		//top.location.reload()  //use this if you want to redirect the full url to the login page
		this.location.reload() //use this if you want to show the log in page inside the Main view area
	});
}


function btnOnClick(probCat, bottonElement) {
	
	var probTypeArray = [];
	var obj = {};
	var parameters = {
		tableName: 'probtype',
		fieldNames: toJSON(['probtype.prob_type','probtype.description']),
		restriction: "probtype.prob_cat = '" + probCat.replace(/'/g, "''")  + "' and status = 'A'",
		sortValues: toJSON([
			{
				fieldName: "probtype.display_order",
				sortOrder: 1
			},
			{
				fieldName: "probtype.description",
				sortOrder: 1
			}
		])
		
	};

	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
	if (result.code =="sessionTimeout") {
		handleSessionTimeout();
		return;
	}
	
	var curProbTypeId = '';
	var curProbTypeDesc = '';
	if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
		for(i=0;i<result.data.records.length;i++){
			curProbTypeId = result.data.records[i]['probtype.prob_type'];
			curProbTypeDesc = result.data.records[i]['probtype.description'];

			obj['key_'+i] = curProbTypeId;
			obj['value_'+i] = curProbTypeDesc;
		}
	}
	else {
	
		//Check to see if uc_probcat.activity = 'Other'
		var parameters = {
			tableName: 'uc_probcat',
			fieldNames: toJSON(['task_file']),
			restriction: "uc_probcat.prob_cat = '" + probCat.replace(/'/g, "''")  + "' and task_file is not null"
		};

		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			var taskFile =result.data.records[0]['uc_probcat.task_file'];
			if (taskFile.indexOf(".axvw") ==-1){
				openOtherSite( taskFile);
			}
			else {
				View.brg_selProbCat = probCat;
				View.brg_selProbType = "";
				ucRequestDashCntr.reportDisplayPanel.loadView(taskFile);
				ucRequestDashCntr.showHideRegion("probtype", false)
				ucRequestDashCntr.showHideRegion("details", true)
				ucRequestDashCntr.showprobtypeBtn();
			}
			
		}
		else {
			alert("No screen associated with this Problem.  Contact Administrator")
		}
		return
	}
	
	if (obj['key_0'] ) {
		var menu = ucRequestDashCntr.showMenuProbType(this, bottonElement, obj, probCat);
		return menu;
	}
}



function openOtherSite(taskFile,hideProbtype) {
	
	var reportDisplayPanel = View.panels.get("reportDisplayPanel");
	reportDisplayPanel.show(true);

	reportDisplayPanel.loadView('uc-wr-other-website.axvw?taskFile='+taskFile);
	if (!hideProbtype){
		ucRequestDashCntr.showprobtypeBtn();
	}
	else {
		ucRequestDashCntr.hideprobtypeBtn();
	}
	
	ucRequestDashCntr.showHideRegion("probtype", false)
	ucRequestDashCntr.showHideRegion("details", true)
	ucRequestDashCntr.showHideRegion("instructions", false)
}

function checkSecurityGroup(securityGrp, role){
	//check to ensure the user has role or a security group set up to use this btn
	var sg = "," + View.user.role.toLowerCase() + ","
	if (role.match(sg)!=null) {return true}	
	if (!securityGrp) {return false;}
	for (var i = 0; i < View.user.groups.length; i++) {
		//if (View.user.groups[i].toLowerCase()==securityGrp.toLowerCase()) {return true}
		sg = "," + View.user.groups[i].toLowerCase() + ","
		if (securityGrp.match(sg)!=null) {return true}	
	}
	return false
}

function selectBtn(btn,securityGrp){
	
	//check to ensure the user has security group or role set up to use this btn - bypass if user's role = 'UC-SYSDEV' or 'UC-SYSADMIN'
	//securityGrp = list of roles and security groups separated by a comma i.e. "fleet,UC-FLEET,fleetmgr"
	if (securityGrp!=null && !(View.user.role=='UC-SYSDEV' || View.user.role=='UC-SYSADMIN')){
		if (!checkSecurityGroup("," + securityGrp.replace(/ /g,'').toLowerCase()+ ",","," + securityGrp.replace(/ /g,'').toLowerCase()+ ",")){
			View.showMessage('You are not set up to access the "' + btn.innerHTML+ '" page.  Please contact your Administrator if you require access')
			return;
		}
	}
	var requestDetailGrid = View.panels.get("requestDetail_grid");
	var instructionsPanel = View.panels.get("instructionsPanel");
	ucRequestDashCntr.showHideRegion("instructions", false)
	var aparam = " WHERE b.activity='"+ btn.id + "' ";
	requestDetailGrid.addParameter("activity_param", aparam);
	
	aparam="";
	//remove maintenance preventive maint category if the user isn't CCC or UC-SYS
	if (!(checkSecurityGroup(null, 'UC-CSC') ||  (View.user.role=='UC-CSC' || View.user.role=='UC-SYSDEV' || View.user.role=='UC-SYSADMIN')) && btn.id =='Maintenance'  ){
		aparam += " and prob_cat <> 'PREVENTIVE MAINT'"
	}
	requestDetailGrid.addParameter("security", aparam);
	
	requestDetailGrid.refresh();
	View.panels.get("requestDetail_btns").setTitle(btn.innerHTML);

}

function loadAxvw(btn,axvw,hideProbtype) {
	
	var instructionsPanel = View.panels.get("instructionsPanel");
	var reportDisplayPanel = View.panels.get("reportDisplayPanel");
	reportDisplayPanel.show(true);
	reportDisplayPanel.loadView(axvw)

	if (!hideProbtype){
		ucRequestDashCntr.showprobtypeBtn();
	}
	else {
		ucRequestDashCntr.hideprobtypeBtn();
	} 
	
	ucRequestDashCntr.showHideRegion("instructions", false)
	ucRequestDashCntr.showHideRegion("probtype", false)
	ucRequestDashCntr.showHideRegion("details", true)
	View.panels.get("requestDetail_btns").setTitle(btn.innerHTML);
}


function backHome() {
	var instructionsPanel = View.panels.get("instructionsPanel");
	var requestDetailGrid = View.panels.get("requestDetail_grid");
	var reportDisplayPanel = View.panels.get("reportDisplayPanel");
	reportDisplayPanel.loadView('uc-wr-my-requests.axvw');
	reportDisplayPanel.show(false);
	reportDisplayPanel.loadView('blank.axvw');
	ucRequestDashCntr.showHideRegion("instructions", true)
	ucRequestDashCntr.showHideRegion("probtype", true)
	ucRequestDashCntr.showHideRegion("btns", true)
	ucRequestDashCntr.showHideRegion("details", false)
	ucRequestDashCntr.hideprobtypeBtn();
}

function showProbtype() {
	
	var reportDisplayPanel = View.panels.get("reportDisplayPanel");
	reportDisplayPanel.show(false)
	ucRequestDashCntr.showHideRegion("probtype", true)
	ucRequestDashCntr.showHideRegion("details", false)
	ucRequestDashCntr.hideprobtypeBtn();
	reportDisplayPanel.loadView('blank.axvw');
}

function openMyInfo() {
	
	var vw = "uc-my-info.axvw";
	View.openDialog(vw, '', false, {
		width: 550,
		height: 500,
		closeButton: true
	});
}

function correctIEButtons(){
	if (navigator.appName=="Microsoft Internet Explorer") {
		 if (parseInt(navigator.appVersion.split(';')[1].replace(" MSIE ","")) > 7) {return}
		var wdth = Math.round((parseInt(document.getElementById('instructions').style.width)/6)-12);
		if (wdth < 150) {wdth=150;}
		var buttons = document.getElementsByTagName('button');
		if (buttons[0].style.width==wdth){return;;}
		for(var j=0; j < buttons.length; j++) {
			var button = buttons[j];
			if (button.className =='topBtns' || button.className =='botBtns') {
				var text, words;
				//remove the break points so we can put them back in
				button.innerHTML=button.innerHTML.replace(/\<BR>/g,' ')
				button.style.width=wdth;
				if (button.scrollWidth !== 0 && button.scrollWidth  > (wdth-18)) {
					words = button.innerHTML.split(' ');
					button.innerHTML=""
					text="";
					for(var i = 0; i < words.length; i++) {
						//add the words (divided by spaces)
						if (text == "") {
							button.innerHTML =  words[i];
						} else {
							button.innerHTML = text  +  " " + words[i];;
						}
						//if the new title scroll width exceeds the button width then add a BR
						if (button.scrollWidth !== 0 && button.scrollWidth  > (wdth-18)) {
							if (text != "") {text = text + "<BR>";}
							button.innerHTML = text  + words[i];
							//if it's still to large then break the word until it fits
							if (button.scrollWidth !== 0 && button.scrollWidth  > (wdth-18)) {
								for(var x = 0; x < words[i].length; x++) {
									button.innerHTML = text  + words[i].substr(x,1);
									if (button.scrollWidth !== 0 && button.scrollWidth  > (wdth-18)) {
										button.innerHTML = text + "<BR>"  + words[i].substr(x,1); 
									}
									text = button.innerHTML;
								}
							}
						}
						text = button.innerHTML;	
					} 
				}
			}
		}    
	}
}