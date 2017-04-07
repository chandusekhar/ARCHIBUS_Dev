

var ucEsWasteCollReportController = View.createController('cbsEsWasteCollReportCntrl', {
	tp:"",
	lp:"",
	vnId:"",
	vnComp:"",
	afterViewLoad: function() {
		this.inherit();
		var lastMonth = new Date();
		var today = new Date();
		var mm = today.getMonth() +1;
		
		var yyyy = today.getFullYear();
		this.tp = yyyy + '-'
		if(mm<10){
			this.tp +='0'+mm
		} 
		else {
			this.tp +='0'+mm
		}
		
		
		
		if (mm==12) {
			this.lp = yyyy + '-' + "01"
		}
		else {
			yyyy--
			mm++
			this.lp = yyyy + '-' 
			if(mm<10){
				this.lp +='0'+mm
			} 
			else {
				this.lp +='0'+mm
			}
		}
		
		var parameters = {
			tableName: 'afm_users',
			fieldNames: toJSON(['afm_users.vn_id']),
			restriction: "afm_users.user_name = '" + View.user.name  + "' AND afm_users.email = '" + View.user.email + "'"
		};
		
		var vnResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		var rVnId = '';
		if (vnResult.code == 'executed' && vnResult.data != "undefined" && vnResult.data.records[0]){
			rVnId = vnResult.data.records[0]['afm_users.vn_id'];
		}
		
		//var email =View.user.email
		//email = "izzy@acousticsolutions.com"
		var parameters = {
			tableName: 'vn',
			fieldNames: toJSON(['vn.vn_id', 'vn.company']),
			restriction: "vn.vn_id = '" + rVnId + "'"
		};

	
		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
		
		if (result.code == 'executed' && result.data != "undefined" && result.data.records[0]){
			this.vnId = result.data.records[0]['vn.vn_id'];
			this.vnComp = result.data.records[0]['vn.company'];
			
		}
		
		this.crossTab.addParameter("rest", " and 1=2");
		this.crossTabxls.addParameter("rest", " and 1=2");
		this.crossTabxls.addParameter("divider", " - ");
		
		
	},
	
	
	afterInitialDataFetch: function() {
		
		
		this.wpConsole.setFieldValue("time_period.from", this.lp);
		this.wpConsole.setFieldValue("time_period.to", this.tp);
		this.wpConsole.setFieldValue("company", this.vnComp);
		this.wpConsole_onSearch()
		
	},
	
    
    wpConsole_onSearch: function() {
		if (this.wpConsole.getFieldValue('time_period.to') != '' && this.wpConsole.getFieldValue('time_period.to') == '') {
			View.showMessage("Date Issued From and Date Issued To are required.");
			return false;
		}
		
		var sparam = '';
		var dparam = '';
		var bparam = '';
		var lparam = '';
		var val = '';
		
		sparam += " and p.time_period between '" + this.wpConsole.getFieldValue('time_period.from') + "' and '" + this.wpConsole.getFieldValue('time_period.to') + "'"
		dparam += " and bill.time_period between '" + this.wpConsole.getFieldValue('time_period.from') + "' and '" + this.wpConsole.getFieldValue('time_period.to') + "'"

		val = this.wpConsole.getFieldValue('bill_type.parent');
		if (val != '') {
			sparam += " and isnull(t.parent,t.bill_type_id) = '"+ val.replace(/'/g,"''") +"'";
			dparam += " and isnull(bill_type.parent,bill.bill_type_id) = '"+ val.replace(/'/g,"''") +"'";
		}
		val = this.wpConsole.getFieldValue('bill_type.bill_type_id');
		if (val != '') {
			sparam += " and t.bill_type_id = '"+ val.replace(/'/g,"''") +"'";
			dparam += " and bill_type.bill_type_id = '"+ val.replace(/'/g,"''") +"'";
		}
		val = this.wpConsole.getFieldValue('company');
		if (this.vnId){
			bparam += " and vn_id = '"+this.vnId.replace(/'/g,"''")+"'";
			sparam += " and exists (select 1 from vn_ac v inner join bill_type bt on v.vn_ac_id=bt.bill_type_id where v.vn_id= '"+ this.vnId.replace(/'/g,"''") +"' and t.bill_type_id in (bt.bill_type_id,bt.parent) )"
		}
		else if (val != '') {
			bparam += " and company = '"+ val.replace(/'/g,"''") +"'";
			sparam += " and exists (select 1 from vn_ac v inner join vn on vn.vn_id=v.vn_id and vn.company='"+ val.replace(/'/g,"''") +"' inner join bill_type bt on v.vn_ac_id=bt.bill_type_id where t.bill_type_id in (bt.bill_type_id,bt.parent) )"
		}
		val = this.wpConsole.getFieldValue('loc_id');
		if (val != '') {
			lparam = lparam+ " and l.loc_id = '"+val.replace(/'/g,"''")+"'";
			bparam += " and exists (select 1 from bill_line l where l.bill_id=b.bill_id " + lparam + ")";
		}
		
		this.crossTab.addParameter("rest", sparam);
		this.crossTab.addParameter("loc_rest", lparam );
		this.crossTab.addParameter("bill_rest", bparam );
		
		
		this.crossTabxls.addParameter("rest", sparam);
		this.crossTabxls.addParameter("loc_rest", lparam );
		this.crossTabxls.addParameter("bill_rest", bparam );
		this.crossTabxls.refresh("bill_type_id not like '% SUBTOTAL%'")
		
		
		
		dparam += bparam

		this.crossTabData.addParameter("rest", dparam);
		this.crossTabData.addParameter("loc_rest", lparam );
		
		this.crossTab.refresh();
	},
	
	resetFilter: function() {
		this.wpConsole.setFieldValue("bill.parent", "");
		this.wpConsole.setFieldValue("bill.bill_type_id", "");
		this.wpConsole.setFieldValue("time_period.to", this.tp);
		this.wpConsole.setFieldValue("time_period.from", this.lp);
		this.wpConsole.setFieldValue("company",  this.vnComp);
		this.wpConsole.setFieldValue("loc_id", "");
		
		
		this.wpConsole.setFieldValue("date_issued.from", this.lp);
		this.wpConsole.setFieldValue("date_issued.to", this.tp);
	},
	crossTab_afterRefresh: function(){
		this.crossTabxls.show(false,true)
		
		var row = crossTab.firstChild.rows
		//Add cell to the beginning to align columns
		if (row[2].cells[0].innerHTML != '') {
			row[1].cells[0].innerHTML='Stream'
			row[1].cells[1].innerHTML='Sub Stream (unit)'
			row[2].insertCell(0)
			row[2].cells[0].rowSpan=2
			row[2].cells[0].className="AbMdx_TotalCellHeader first"
		}
		//if (row[3].cells[0].firstChild.innerHTML != '') {row[3].insertCell(0)}
		
		//var diverted = []
		//diverted.push("")
		//diverted.push("")
		//diverted.push("")
		for (var r=4; r<row.length; r=r+2) {
			var txt = row[r].cells[1].firstChild.innerHTML.replace(/^\s+/,"");
		
			if (txt.substr(0,8) == 'SUBTOTAL' || txt.substr(0,1) == '(') {
				//set the background color
				
				row[r].cells[0].style.backgroundColor="#CDD9D5"
				row[r].cells[1].style.backgroundColor="#CDD9D5"
				row[r].cells[2].style.backgroundColor="#CDD9D5"
				row[r+1].cells[0].style.backgroundColor="#CDD9D5"
				row[r].cells[3].style.backgroundColor="#CDD9D5"
				row[r+1].cells[1].style.backgroundColor="#CDD9D5"
				

				
				if (txt.substr(0,8) == 'SUBTOTAL' ){
					for (var c=3; c<row[2].cells.length; c++) {
						if (c>3) {
							row[r].cells[c].style.backgroundColor="#D6DEEB"
							row[r+1].cells[c-2].style.backgroundColor="#D6DEEB"
						}
						if (row[r].cells[c].firstChild.innerHTML !="" ){
							row[2].cells[c].firstChild.innerHTML = numberWithCommas((parseFloat(row[2].cells[c].firstChild.innerHTML.replace(/,/g,''),10) - parseFloat(row[r].cells[c].firstChild.innerHTML.replace(/,/g,''),10)).toFixed(2))
							row[3].cells[c-2].firstChild.innerHTML = numberWithCommas((parseFloat(row[3].cells[c-2].firstChild.innerHTML.replace(/,/g,''),10) - parseFloat(row[r+1].cells[c-2].firstChild.innerHTML.replace(/,/g,''),10)).toFixed(2))
						}
					}
				}
			}
		else {
				if (row[r].cells[1].firstChild.innerHTML != '') {
					row[r].cells[0].firstChild.innerHTML = ''
				}
			//	for (var c=3; c<row[2].cells.length; c++) {
			//		if (diverted.length-1<c) {diverted.push(0)}
			//		if (!(row[r].cells[c].firstChild.innerHTML =="" && row[r+1].cells[c-2].firstChild.innerHTML =="")){
			//			diverted[c] = diverted[c] + (row[r].cells[c].firstChild.innerHTML * (row[r+1].cells[c-2].firstChild.innerHTML/100))
			//		}
			//	}

			}
	
		}
	/*
		for (var c=3; c<diverted.length; c++) { 
			if (row[2].cells[c].firstChild.innerHTML !="") {
				if (diverted[c]==0) {
					row[3].cells[c-2].firstChild.innerHTML="0.00"
				}
				else {
					row[3].cells[c-2].firstChild.innerHTML=(Math.round(diverted[c]/row[2].cells[c].firstChild.innerHTML*10000)/100).toFixed(2)
					
					
				}
			}
		}
	*/	
		
		
	},
	selectStream: function(act,parent){
		var fld = 'bill_type.bill_type_id';
		var fldDisplay = [];
		var rest = "bill_type.activity_id = '" + act + "'"	
		if (parent == 'p'){
			fld = 'bill_type.parent';
			fldDisplay=['bill_type.bill_type_id',  'bill_type.description']
			rest+= " and bill_type.parent is null"
			if (this.vnId != "") {
				rest+= " and exists (Select 1 from vn_ac v where v.vn_id = '" + this.vnId.replace(/,/g,"''") + "' and v.vn_ac_id = isnull(bill_type.parent,bill_type.bill_type_id))"
			}
			
			 View.selectValue(
			'wpConsole',
			'Stream',
			[fld],
			'bill_type',
			['bill_type.bill_type_id'],
			fldDisplay,
			rest,
			'',
			true,
			true, 
			null, 
			null,
			null,'grid'); //tree does not restrict
			
		}
		else {
			fldDisplay=['bill_type.bill_type_id','bill_type.parent',  'bill_type.description']
			rest+= " and bill_type.parent is not null"
			if (this.vnId != "") {
				rest+= " and exists (Select 1 from vn_ac v where v.vn_id = '" + this.vnId.replace(/,/g,"''") + "' and v.vn_ac_id =bill_type.bill_type_id)"
			}
			
			if (this.wpConsole.getFieldValue("bill_type.parent") != null && this.wpConsole.getFieldValue("bill_type.parent") != '') {
				var parent = this.wpConsole.getFieldValue("bill_type.parent");
				rest+= " AND bill_type.parent = '"+parent+"'";
			}
			
			 View.selectValue(
			'wpConsole',
			'Stream',
			['bill_type.parent', 'bill_type.bill_type_id'],
			'bill_type',
			['bill_type.parent', 'bill_type.bill_type_id'],
			fldDisplay,
			rest,
			'',
			true,
			true, 
			null, 
			null,
			null,'grid'); //tree does not restrict

		}
	 
		/*
		View.selectValue(
		'wpConsole',
		'Stream',
		[fld],
		'bill_type',
		['bill_type.bill_type_id'],
		fldDisplay,
		rest,
		onChangepProbCat,
		true,
		true, 
		null, 
		null,
		null,'grid');*/ //tree does not restrict
	
	}
	
	/*
	updateStream: function(fieldName,selectedValue,previousValue){
		var test = selectedValue;
	}
	*/
	
	
});

function onChangepProbCat(fieldName,selectedValue,previousValue){
	var test = 1;
}

 ////	function projViewAnalysisGrid_onclick(obj) {
 //   if (obj.restriction.clauses.length == 0) return;
 //   var project_id = obj.restriction.clauses[0].value;

function openData(obj){
	for (var i=0; i<obj.restriction.clauses.length; i++) {
		switch (obj.restriction.clauses[i].name) {
			case "bill.bill_type_id":
				var bt = obj.restriction.clauses[i].value;
				var pt= bt.replace('|SUBTOTAL','');
				if (pt != bt){
					obj.restriction.clauses[i].name = 'bill_type.parent';
					
				}
				else {
					if (pt=bt.split('|')[1]=="") {
						pt=bt.split('|')[0]
					}
					else {
						pt=bt.split('|')[1]
					}
				}
				obj.restriction.clauses[i].value = pt;
				break;
		}
	}
	return obj;
}

function numberWithCommas(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}