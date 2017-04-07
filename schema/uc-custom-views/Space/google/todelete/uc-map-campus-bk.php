<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Google maps for WorkSpace</title>



<!-- GOOGLE -->

<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAARmhPegpzDZNz2_VTcJNvyxSVp79E6uC7QJajXiRXIJFH-vHqRRRdTKq5d78t9F6wBDyBVMeTehG4Gg" type="text/javascript"></script>

<script type="text/javascript">
    function initialize() {
      if (GBrowserIsCompatible()) {
        var map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(51.078066,-114.131453), 16);
		map.addControl(new GLargeMapControl3D());
		map.setMapType(G_SATELLITE_MAP);

// info about icons used on map
		var tinyIcon = new GIcon();
		tinyIcon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
		tinyIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
		tinyIcon.iconSize = new GSize(12, 20);
		tinyIcon.shadowSize = new GSize(22, 20);
		tinyIcon.iconAnchor = new GPoint(6, 20);
		tinyIcon.infoWindowAnchor = new GPoint(5, 1);

// array of buildings and floors ("Drawing ID", "Building Display Name", "Lat", "Long")
		allBuildings = new Array();
		allBuildings.push("A","Administration","51.078097","-114.127028");
		allBuildings.push("AB","Art Building","51.075354","-114.130011");
		allBuildings.push("BI","Biological Sciences","51.079924","-114.125451");
		allBuildings.push("BR","Brewster Hall","51.074747","-114.133519");
		allBuildings.push("CA","Castle Hall","51.074679","-114.132038");
		allBuildings.push("CC","Child Care Centre","51.078319","-114.124657");
		allBuildings.push("CCIT","Calg Ctr Innovative Tech","51.080402","-114.133412");
		allBuildings.push("CD","Cascade Hall","51.07596","-114.137521");
		allBuildings.push("CDC","Child Development Centre","51.07476","-114.143915");
		allBuildings.push("CHC","Craigie Hall Block C","51.076621","-114.128916");
		allBuildings.push("CHD","Craigie Hall Block D","51.076371","-114.129528");
		allBuildings.push("CHE","Craigie Hall Block E","51.076419","-114.130139");
		allBuildings.push("CHF","Craigie Hall Block F","51.076837","-114.130644");
		allBuildings.push("CHG","Craigie Hall Block G","51.077019","-114.130086");
		allBuildings.push("DC","Dining Centre","51.075825","-114.133465");
		allBuildings.push("EDC","Education Classrooms","51.076742","-114.126492");
		allBuildings.push("EDT","Education Tower","51.077012","-114.125719");
		allBuildings.push("ENA","Engineering Block A","51.080146","-114.131341");
		allBuildings.push("ENB","Engineering Block B","51.080679","-114.131502");
		allBuildings.push("ENC","Engineering Block C","51.080631","-114.132006");
		allBuildings.push("END","Engineering Block D","51.080503","-114.132468");
		allBuildings.push("ENE","Engineering Block E","51.079971","-114.132478");
		allBuildings.push("ENF","Engineering Block F","51.079539","-114.132414");
		allBuildings.push("ES","Earth Sciences","51.080362","-114.128884");
		allBuildings.push("GG","Greenhouse","51.07865","-114.140278");
		allBuildings.push("GL","Glacier Hall","51.075643","-114.135965");
		allBuildings.push("GR","Grounds","51.079425","-114.140943");
		allBuildings.push("GS","General Services Building","51.076203","-114.144098");
		allBuildings.push("HM","Heritage Medical","51.066347","-114.133261");
		allBuildings.push("HP","Heating Plant","51.074895","-114.138755");
		allBuildings.push("HRIC","Health Research Innovatio","51.066333","-114.135332");
		allBuildings.push("HS","Health Science","51.066057","-114.134581");
		allBuildings.push("ICT","Information Comm. Tech.","51.08016","-114.13015");
		allBuildings.push("KA","Kananaskis Hall","51.07536","-114.134699");
		allBuildings.push("KN","Kinesiology Block A","51.076965","-114.133036");
		allBuildings.push("KNB","Kinesiology Block B","51.077767","-114.134002");
		allBuildings.push("MC","MacEwan Student Centre","51.078212","-114.131641");
		allBuildings.push("ME","Petro Canada (Mech. Eng.)","51.082235","-114.129903");
		allBuildings.push("MF","Materials Handling","51.076371","-114.143271");
		allBuildings.push("MFH","Murray Fraser Hall","51.076971","-114.128294");
		allBuildings.push("MH","MacEwan Hall","51.078656","-114.130365");
		allBuildings.push("MLB","MacKimmie Library Block","51.078036","-114.129303");
		allBuildings.push("MLT","MacKimmie Library Tower","51.07747","-114.128551");
		allBuildings.push("MS","Mathematical Sciences","51.079903","-114.127779");
		allBuildings.push("NM","Nickle Arts Museum","51.079081","-114.131212");
		allBuildings.push("NO","Norquay Hall","51.074706","-114.134967");
		allBuildings.push("OC","Olympic Volunteer Centre","51.071369","-114.122286");
		allBuildings.push("OL","Olympus Hall","51.074922","-114.135622");
		allBuildings.push("OO","Olympic Oval","51.076998","-114.135718");
		allBuildings.push("PF","Professional Faculties","51.077376","-114.12674");
		allBuildings.push("PP","Physical Plant","51.07505","-114.143229");
		allBuildings.push("RC","Rozsa Centre","51.076398","-114.131513");
		allBuildings.push("RT","Reeve Theatre","51.07625","-114.130719");
		allBuildings.push("RU","Rundle Hall","51.07499","-114.132671");
		allBuildings.push("SA","Science A","51.079101","-114.128133");
		allBuildings.push("SB","Science B","51.079405","-114.129496");
		allBuildings.push("SH","Scurfield Hall","51.077376","-114.124625");
		allBuildings.push("SS","Social Sciences","51.079101","-114.126459");
		allBuildings.push("ST","Sciences Theatres","51.079607","-114.127157");
		allBuildings.push("TRW","Teaching Research & Welln","51.066401","-114.135997");
		allBuildings.push("VCA","Family Housing Block A","51.079951","-114.140493");
		allBuildings.push("VCB","Family Housing Block B","51.079873","-114.141104");
		allBuildings.push("VCC","Family Housing Block C","51.080237","-114.14111");
		allBuildings.push("VCD","Family Housing Block D","51.080264","-114.140675");
		allBuildings.push("VCE","Family Housing Block E","51.080662","-114.140697");
		allBuildings.push("VCF","Family Housing Block F","51.080648","-114.141158");
		allBuildings.push("VCG","Family Housing Block G","51.08108","-114.140761");
		allBuildings.push("VCH","Family Housing Block H","51.081096","-114.141764");
		allBuildings.push("VCI","Family Housing Block I","51.080877","-114.142188");
		allBuildings.push("VCJ","Family Housing Block J","51.080497","-114.142542");
		allBuildings.push("VCK","Family Housing Block K","51.08055","-114.141759");
		allBuildings.push("VCL","Family Housing Block L","51.080031","-114.141689");
		allBuildings.push("VCM","Family Housing Block M","51.08017","-114.142247");
		allBuildings.push("VCN","Family Housing Block N","51.079941","-114.142874");
		allBuildings.push("VCO","Family Housing Block O","51.081076","-114.143465");
		allBuildings.push("VCP","Family Housing Block P","51.080894","-114.143727");
		allBuildings.push("VCQ","Family Housing Block Q","51.080925","-114.14421");
		allBuildings.push("VCR","Family Housing Block R","51.080493","-114.143894");
		allBuildings.push("VCS","Family Housing Block S","51.080641","-114.143245");
		allBuildings.push("VCT","Family Housing Block T","51.080338","-114.143497");
		allBuildings.push("VCU","Family Housing Block U","51.079988","-114.14354");
		allBuildings.push("VCV","Family Housing Block V","51.079846","-114.14421");
		allBuildings.push("VCW","Family Housing Block W","51.07961","-114.143615");
		allBuildings.push("VCX","Family Housing Block X","51.079668","-114.143202");
		allBuildings.push("VCY","Family Housing Block Y","51.079206","-114.143572");

// array of buildings and floors ("Drawing ID", "Floor ID", [floor id...])
		allFloors = new Array();
		allFloors.push("A","B1","01","02");
		allFloors.push("AB","01","02","03","04","05","06","07");
		allFloors.push("BI","B1","B2","01","02","03","04","05","P1");
		allFloors.push("BR","B1","01","02","03");
		allFloors.push("CA","B1","01","02","03");
		allFloors.push("CC","B1","01");
		allFloors.push("CCIT","B1","B2","01","02","03","04","05","P1");
		allFloors.push("CD","B1","01","02","03","04","05");
		allFloors.push("CDC","B1","01","02","03","04","P1");
		allFloors.push("CHC","B1","01","02","03");
		allFloors.push("CHD","B1","01","02","03","04","05","06","P1");
		allFloors.push("CHE","B1","01","02","P1");
		allFloors.push("CHF","B1","01","02");
		allFloors.push("CHG","B1","01","02");
		allFloors.push("DC","B1","01","02");
		allFloors.push("EDC","B1","01","02","03");
		allFloors.push("EDT","B1","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15");
		allFloors.push("ENA","B1","B2","01","02","03","04");
		allFloors.push("ENB","B1","B2","01","02","03");
		allFloors.push("ENC","B1","B2","01","02","03");
		allFloors.push("END","B1","B2","01","02","03");
		allFloors.push("ENE","B1","B2","01","02","03","P1");
		allFloors.push("ENF","B1","B2","01","02","03","P1");
		allFloors.push("ES","B1","01","02","03","04","05","06","07","08","09","10","P1","P2");
		allFloors.push("GG","B1","01");
		allFloors.push("GL","B1","01","02","03");
		allFloors.push("GR","01");
		allFloors.push("GS","01");
		allFloors.push("HM","G1","B1","01","02","03","04","P1");
		allFloors.push("HP","B1","01","02");
		allFloors.push("HRIC","B1I","B1","G1","G1I","01","01I","02","02I","03","03I","04","04I");
		allFloors.push("HS","B1","G1","01","02","P1");
		allFloors.push("ICT","B1","01","02","03","04","05","06","07","P1");
		allFloors.push("KA","B1","01","02","03","04","05","06","07","P1","P2");
		allFloors.push("KN","B1-B","B1-A","B1","01","02");
		allFloors.push("KNB","B1","01","02","03","04","P1");
		allFloors.push("MC","B1","01","02","03","04");
		allFloors.push("ME","01","02","03","04","05","06","07","M1");
		allFloors.push("MF","01");
		allFloors.push("MFH","B1","01","02","03","04","M1");
		allFloors.push("MH","B1","01","02","03","04");
		allFloors.push("MLB","B1","B2","01","02","03","04","P1");
		allFloors.push("MLT","B1","01","02","03","04","05","06","06A","07","08","09","10","11","12","P1","P2");
		allFloors.push("MS","B1","B2","01","02","03","04","05","06","07","P1","P2");
		allFloors.push("NM","B1","01","02","M1");
		allFloors.push("NO","B1","01","02","03");
		allFloors.push("OC","01","02");
		allFloors.push("OL","B1","01","02","03","04");
		allFloors.push("OO","B1","01","02");
		allFloors.push("PF","B1","01","02","03","04");
		allFloors.push("PP","B1","01","M1");
		allFloors.push("RC","B1","01","02");
		allFloors.push("RT","01","02","03");
		allFloors.push("RU","B1","01","02","03","04","05","06","07","P1","P2");
		allFloors.push("SA","B1","01","02","03");
		allFloors.push("SB","B1","B2","01","02","03","04","05","06","M1","P1");
		allFloors.push("SH","01","02","03","04");
		allFloors.push("SS","B1","B2","01","02","03","04","05","06","07","08","09","10","11","12","13","14");
		allFloors.push("ST","B1 01");
		allFloors.push("TRW","B1","B2","B3","01","02","03","04","05","06","07");
		allFloors.push("VCA","B1","01","02");
		allFloors.push("VCB","B1","01","02");
		allFloors.push("VCC","B1","01","02");
		allFloors.push("VCD","B1","01","02");
		allFloors.push("VCE","B1","01","02");
		allFloors.push("VCF","B1","01","02");
		allFloors.push("VCG","B1","01","02");
		allFloors.push("VCH","B1","01","02");
		allFloors.push("VCI","B1","01","02");
		allFloors.push("VCJ","B1","01","02");
		allFloors.push("VCK","B1","01","02");
		allFloors.push("VCL","B1","01","02");
		allFloors.push("VCM","B1","01","02");
		allFloors.push("VCN","B1","01","02");
		allFloors.push("VCO","B1","01","02");
		allFloors.push("VCP","B1","01","02");
		allFloors.push("VCQ","B1","01","02");
		allFloors.push("VCR","B1","01","02");
		allFloors.push("VCS","B1","01","02");
		allFloors.push("VCT","B1","01","02");
		allFloors.push("VCU","B1","01","02");
		allFloors.push("VCV","B1","01","02");
		allFloors.push("VCW","B1","01","02");
		allFloors.push("VCX","B1","01","02");
		allFloors.push("VCY","B1","01","02");


		
		
// Set up all buildings points based on array
		markerOptions = { icon:tinyIcon };
		var macHallPoint = new GLatLng(51.078466,-114.131053);
		var macHall = new GMarker(macHallPoint, markerOptions);
		map.addOverlay(macHall);
		GEvent.addListener(macHall, "click", function() {
			this.openInfoWindowHtml("<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>MacEwan Hall</td></tr><tr valign='top'><td><img src='http://test.workspace.ucalgary.ca/google/macewan-hall.png'></td><td><font face='Arial'>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=01'>First floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Second floor</a></td></tr></table>");
		});

      }
    }


</script>
<!-- GOOGLE -->


</head>
<body onload="initialize()" onunload="GUnload()" bgcolor="#999999">
<center>
<br>
<div id="map_canvas" style="width: 1000px; height: 700px"></div>
</center>
</body>
</html>
