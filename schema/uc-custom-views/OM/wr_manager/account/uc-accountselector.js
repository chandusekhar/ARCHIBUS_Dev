
//CHANGE LOG:
//2010/04/06 - JJYCHAN - Issue:64 - Now blanks out fields when a new account is selected.
//2010/04/08 - JJYCHAN - Issue:72 - Removed all alert messages.

var coreAcctController = View.createController('coreAcctController', {

	afterViewLoad: function() {
		this.inherit();
		//create action listeners
		this.form_accountSelect.addActionListener('applyacc', this.form_accountSelect_applyacc_onApply, this);
	},

	//build the dropdowns
	form_accountSelect_afterRefresh: function() {
		//get dataSources
		var bl_dataSource = View.dataSources.get('bl_ds');
		var ac_dataSource = View.dataSources.get('acct_ds');
		var dp_dataSource = View.dataSources.get('dp_ds');

		//get controls

		var buildingSelector = document.getElementById("select_building");
		var dpSelector = document.getElementById("select_dp");
		var acSelector = document.getElementById("select_ac");
		//--------------- SET DEFAULT BUILDING -------------------------
		// get the opener panel and the wr building/zone
		var parentpanel = View.getOpenerView().panels.get('nav_details_info');
		if (parentpanel == null) {
			parentpanel = View.getOpenerView().panels.get('nav_details_info_vehicle');
		}

		var bl_id = parentpanel.getFieldValue("wr.bl_id");

		var restriction = new Ab.view.Restriction();
		if (bl_id != "") {
			restriction.addClause("bl.bl_id", bl_id, "=", true);
		}

		var records=bl_dataSource.getRecords(restriction);

		//autofill the building and zone ONLY if search results = 1
		if (records.length == 1 || bl_id == "") {
			var zone_id = records[0].getValue("bl.zone_id");
			var program = records[0].getValue("bl.program");

			if (bl_id == "") {
				zone_id = "1"
			}

			document.getElementById("select_zone").value = zone_id;


			//autofill the building dropdown
			//clear the restriction
			restriction = new Ab.view.Restriction();
			restriction.addClause("bl.zone_id", zone_id, "=", true);

			records = bl_dataSource.getRecords(restriction);

			//refresh the buidings
			for (var i = 0; i < records.length; i++) {
				buildingSelector.options[buildingSelector.options.length] = new Option(records[i].getValue("bl.program") + " - " + records[i].getValue("bl.name"), records[i].getValue("bl.program"));
			}

			document.getElementById("select_building").value = program;
			document.getElementById("ac_id_part5").value = program;
		}



		//--------------- CREATE DEPARTMENT OPTIONS --------------------
		var dprecords = dp_dataSource.getRecords();
		dpSelector.options[dpSelector.options.length] = new Option("", "");
		for (var i = 0; i < dprecords.length; i++) {
			dpSelector.options[dpSelector.options.length] = new Option(dprecords[i].getValue("dp.dp_id") + " - " + dprecords[i].getValue("dp.name"), dprecords[i].getValue("dp.dp_id"));
		}

		//--------------- CREATE ACCOUNT OPTIONS -----------------------
		var acrecords = ac_dataSource.getRecords();
		acSelector.options[acSelector.options.length] = new Option("", "");
		for (var i = 0; i < acrecords.length; i++) {
			acSelector.options[acSelector.options.length] = new Option(acrecords[i].getValue("uc_accore.accore_id") + " - " + acrecords[i].getValue("uc_accore.description"), acrecords[i].getValue("uc_accore.accore_id"));
		}
	},

	//-------------- Function: apply_account----------------
	//copy the account code to the parent form
	form_accountSelect_applyacc_onApply: function() {

		var parentDocument = View.getOpenerView().detailsDocument;

		parentDocument.getElementById("ac_id_part1").value = document.getElementById("ac_id_part1").value;
		parentDocument.getElementById("ac_id_part2").value = document.getElementById("ac_id_part2").value;
		parentDocument.getElementById("ac_id_part3").value = document.getElementById("ac_id_part3").value;
		parentDocument.getElementById("ac_id_part4").value = document.getElementById("ac_id_part4").value;
		parentDocument.getElementById("ac_id_part5").value = document.getElementById("ac_id_part5").value;

		//2010/04/06 - JJYCHAN/64
		parentDocument.getElementById("ac_id_part6").value = "";
		parentDocument.getElementById("ac_id_part7").value = "";
		parentDocument.getElementById("ac_id_part8").value = "";


		//close the dialog
		var openerView = View.getOpenerView();
		openerView.closeDialog();
	},


	//called when zone is changed
	//building list is refreshed, and the program field is blanked.
	change_zone: function() {


		var bl_dataSource = View.dataSources.get('bl_ds');
		var restriction = new Ab.view.Restriction();
		var buildingSelector = document.getElementById("select_building");



		//clear the current options in buildings
		buildingSelector.options.length = 0;

		var currentZone = document.getElementById("select_zone").value;



		restriction.addClause("bl.zone_id", currentZone, "=", true);

		var records = bl_dataSource.getRecords(restriction);

		buildingSelector.options[buildingSelector.options.length] = new Option("", "");

		//refresh the buidings
		for (var i = 0; i < records.length; i++) {
			buildingSelector.options[buildingSelector.options.length] = new Option(records[i].getValue("bl.program") + " - " + records[i].getValue("bl.name"), records[i].getValue("bl.program"));

		}

		//clear the program account field
		document.getElementById("ac_id_part5").value = "";

	},

	change_dp: function() {
		var acpart3 = document.getElementById("ac_id_part3");
		var selection = document.getElementById("select_dp").value;
		acpart3.value = selection;
	},

	change_ac: function() {
		var acpart4 = document.getElementById("ac_id_part4");
		var selection = document.getElementById("select_ac").value;
		acpart4.value = selection;

	},

	change_bl: function() {
		var acpart5 = document.getElementById("ac_id_part5");
		var selection = document.getElementById("select_building").value;
		acpart5.value = selection;
	}



});


function zone_change() {
		coreAcctController.change_zone();

}

function dp_change() {
		coreAcctController.change_dp();
}

function bl_change() {
		coreAcctController.change_bl();
}

function ac_change() {
		coreAcctController.change_ac();
}


