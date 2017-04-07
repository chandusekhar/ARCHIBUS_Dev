<?php
/*

Corey Kaye
2009-05-05

Using the Google API for Google Maps: 
http://code.google.com/apis/maps/documentation/reference.html

The lat/long found using:
http://www.gorissen.info/Pierre/maps/googleMapLocation.php

To add a building (and it would be really good if the lat/long could be stored in Archibus and this 
	whole thing be generated dynamically from the SQL tables....), however.   
To add a building, enter the info in the TWO arrays below, that's it.  The point will be auto-added.


*/

function array_qsort (&$array, $column=0, $order=SORT_ASC, $first=0, $last= -2)
{
  // $array  - the array to be sorted
  // $column - index (column) on which to sort
  //          can be a string if using an associative array
  // $order  - SORT_ASC (default) for ascending or SORT_DESC for descending
  // $first  - start index (row) for partial array sort
  // $last  - stop  index (row) for partial array sort
  // $keys  - array of key values for hash array sort
 
  $keys = array_keys($array);
  if($last == -2) $last = count($array) - 1;
  if($last > $first) {
   $alpha = $first;
   $omega = $last;
   $key_alpha = $keys[$alpha];
   $key_omega = $keys[$omega];
   $guess = $array[$key_alpha][$column];
   while($omega >= $alpha) {
     if($order == SORT_ASC) {
       while($array[$key_alpha][$column] < $guess) {$alpha++; $key_alpha = $keys[$alpha]; }
       while($array[$key_omega][$column] > $guess) {$omega--; $key_omega = $keys[$omega]; }
     } else {
       while($array[$key_alpha][$column] > $guess) {$alpha++; $key_alpha = $keys[$alpha]; }
       while($array[$key_omega][$column] < $guess) {$omega--; $key_omega = $keys[$omega]; }
     }
     if($alpha > $omega) break;
     $temporary = $array[$key_alpha];
     $array[$key_alpha] = $array[$key_omega]; $alpha++;
     $key_alpha = $keys[$alpha];
     $array[$key_omega] = $temporary; $omega--;
     $key_omega = $keys[$omega];
   }
   array_qsort ($array, $column, $order, $first, $omega);
   array_qsort ($array, $column, $order, $alpha, $last);
  }
} 


?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Google maps for WorkSpace</title>



<!-- GOOGLE -->

<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAARmhPegpzDZNz2_VTcJNvyxSVp79E6uC7QJajXiRXIJFH-vHqRRRdTKq5d78t9F6wBDyBVMeTehG4Gg" type="text/javascript"></script>

<script type="text/javascript">
	var map;
	var lastInfoWindow;
	
    function initialize() {
      if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(51.076566,-114.131453), 16);
		map.setMapType(G_SATELLITE_MAP);
		var mapControl = new GMapTypeControl();
		map.addControl(mapControl);
		map.addControl(new GLargeMapControl3D());

// info about icons used on map
		var tinyIcon = new GIcon();
		tinyIcon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
		tinyIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
		tinyIcon.iconSize = new GSize(12, 20);
		tinyIcon.shadowSize = new GSize(22, 20);
		tinyIcon.iconAnchor = new GPoint(6, 20);
		tinyIcon.infoWindowAnchor = new GPoint(5, 1);

		
<?php


// array of buildings and floors ("Drawing ID", "Building Display Name", "Lat", "Long", "Building Icon")
		$allBuildings = array();
		
		$allBuildings["A"] = array("Administration","51.078097","-114.127028","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["AB"] = array("Art Building","51.075354","-114.130011","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["BI"] = array("Biological Sciences","51.079924","-114.125451","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["BR"] = array("Brewster Hall","51.074747","-114.133519","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CA"] = array("Castle Hall","51.074679","-114.132038","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CC"] = array("Child Care Centre","51.078319","-114.124657","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CCIT"] = array("Calg Ctr Innovative Tech","51.080402","-114.133412","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CD"] = array("Cascade Hall","51.07596","-114.137521","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CDC"] = array("Child Development Centre","51.07476","-114.143915","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CHC"] = array("Craigie Hall Block C","51.076621","-114.128916","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CHD"] = array("Craigie Hall Block D","51.076371","-114.129528","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CHE"] = array("Craigie Hall Block E","51.076419","-114.130139","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CHF"] = array("Craigie Hall Block F","51.076837","-114.130644","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["CHG"] = array("Craigie Hall Block G","51.077019","-114.130086","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["DC"] = array("Dining Centre","51.075825","-114.133465","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["EDC"] = array("Education Classrooms","51.076742","-114.126492","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["EDT"] = array("Education Tower","51.077012","-114.125719","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ENA"] = array("Engineering Block A","51.080146","-114.131341","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ENB"] = array("Engineering Block B","51.080679","-114.131502","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ENC"] = array("Engineering Block C","51.080631","-114.132006","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["END"] = array("Engineering Block D","51.080503","-114.132468","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ENE"] = array("Engineering Block E","51.079971","-114.132478","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ENF"] = array("Engineering Block F","51.079539","-114.132414","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ES"] = array("Earth Sciences","51.080362","-114.128884","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ESO"] = array("University Research Center","51.085059","-114.135987","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ERR"] = array("Energy Resources Research","51.083775","-114.13353","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["GG"] = array("Greenhouse","51.07865","-114.140278","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["GL"] = array("Glacier Hall","51.075643","-114.135965","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["GR"] = array("Grounds","51.079425","-114.140943","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["GS"] = array("General Services Building","51.076203","-114.144098","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["HM"] = array("Heritage Medical","51.066347","-114.133261","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["HP"] = array("Heating Plant","51.074895","-114.138755","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["HRIC"] = array("Health Research Innovatio","51.066333","-114.135332","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["HS"] = array("Health Science","51.066057","-114.134581","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ICT"] = array("Information Comm. Tech.","51.08016","-114.13015","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["KA"] = array("Kananaskis Hall","51.07536","-114.134699","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["KN"] = array("Kinesiology Block A","51.076965","-114.133036","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["KNB"] = array("Kinesiology Block B","51.077767","-114.134002","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MC"] = array("MacEwan Student Centre","51.078212","-114.131641","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ME"] = array("Petro Canada (Mech. Eng.)","51.082235","-114.129903","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MF"] = array("Materials Handling","51.076371","-114.143271","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MFH"] = array("Murray Fraser Hall","51.076971","-114.128294","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MH"] = array("MacEwan Hall","51.078656","-114.130365","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MLB"] = array("MacKimmie Library Block","51.078036","-114.129303","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MLT"] = array("MacKimmie Library Tower","51.07747","-114.128551","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["MS"] = array("Mathematical Sciences","51.079903","-114.127779","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["NM"] = array("Nickle Arts Museum","51.079081","-114.131212","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["NO"] = array("Norquay Hall","51.074706","-114.134967","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["OC"] = array("Olympic Volunteer Centre","51.071369","-114.122286","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["OL"] = array("Olympus Hall","51.074922","-114.135622","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["OO"] = array("Olympic Oval","51.076998","-114.135718","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["PF"] = array("Professional Faculties","51.077376","-114.12674","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["PP"] = array("Physical Plant","51.07505","-114.143229","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["RC"] = array("Rozsa Centre","51.076398","-114.131513","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["RT"] = array("Reeve Theatre","51.07625","-114.130719","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["RU"] = array("Rundle Hall","51.07499","-114.132671","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["SA"] = array("Science A","51.079101","-114.128133","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["SB"] = array("Science B","51.079405","-114.129496","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["SH"] = array("Scurfield Hall","51.077376","-114.124625","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["SS"] = array("Social Sciences","51.079101","-114.126459","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["ST"] = array("Sciences Theatres","51.079607","-114.127157","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["TRW"] = array("Teaching Research & Welln","51.066401","-114.135997","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCA"] = array("Family Housing Block A","51.079951","-114.140493","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCB"] = array("Family Housing Block B","51.079873","-114.141104","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCC"] = array("Family Housing Block C","51.080237","-114.14111","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCD"] = array("Family Housing Block D","51.080264","-114.140675","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCE"] = array("Family Housing Block E","51.080662","-114.140697","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCF"] = array("Family Housing Block F","51.080648","-114.141158","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCG"] = array("Family Housing Block G","51.08108","-114.140761","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCH"] = array("Family Housing Block H","51.081096","-114.141764","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCI"] = array("Family Housing Block I","51.080877","-114.142188","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCJ"] = array("Family Housing Block J","51.080497","-114.142542","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCK"] = array("Family Housing Block K","51.08055","-114.141759","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCL"] = array("Family Housing Block L","51.080031","-114.141689","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCM"] = array("Family Housing Block M","51.08017","-114.142247","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCN"] = array("Family Housing Block N","51.079941","-114.142874","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCO"] = array("Family Housing Block O","51.081076","-114.143465","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCP"] = array("Family Housing Block P","51.080894","-114.143727","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCQ"] = array("Family Housing Block Q","51.080925","-114.14421","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCR"] = array("Family Housing Block R","51.080493","-114.143894","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCS"] = array("Family Housing Block S","51.080641","-114.143245","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCT"] = array("Family Housing Block T","51.080338","-114.143497","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCU"] = array("Family Housing Block U","51.079988","-114.14354","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCV"] = array("Family Housing Block V","51.079846","-114.14421","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCW"] = array("Family Housing Block W","51.07961","-114.143615","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCX"] = array("Family Housing Block X","51.079668","-114.143202","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");
		$allBuildings["VCY"] = array("Family Housing Block Y","51.079206","-114.143572","/archibus/schema/ab-products/uc-custom-views/google/macewan-hall.png");


// array of buildings and floors ("Drawing ID", "Floor ID", [floor id...])
		
		$allFloors["A"] = array("B1","01","02");
		$allFloors["AB"] = array("01","02","03","04","05","06","07");
		$allFloors["BI"] = array("B1","B2","01","02","03","04","05","P1");
		$allFloors["BR"] = array("B1","01","02","03");
		$allFloors["CA"] = array("B1","01","02","03");
		$allFloors["CC"] = array("B1","01");
		$allFloors["CCIT"] = array("B1","B2","01","02","03","04","05","P1");
		$allFloors["CD"] = array("B1","01","02","03","04","05");
		$allFloors["CDC"] = array("B1","01","02","03","04","P1");
		$allFloors["CHC"] = array("B1","01","02","03");
		$allFloors["CHD"] = array("B1","01","02","03","04","05","06","P1");
		$allFloors["CHE"] = array("B1","01","02","P1");
		$allFloors["CHF"] = array("B1","01","02");
		$allFloors["CHG"] = array("B1","01","02");
		$allFloors["DC"] = array("B1","01","02");
		$allFloors["EDC"] = array("B1","01","02","03");
		$allFloors["EDT"] = array("B1","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15");
		$allFloors["ENA"] = array("B1","B2","01","02","03","04");
		$allFloors["ENB"] = array("B1","B2","01","02","03");
		$allFloors["ENC"] = array("B1","B2","01","02","03");
		$allFloors["END"] = array("B1","B2","01","02","03");
		$allFloors["ENE"] = array("B1","B2","01","02","03","P1");
		$allFloors["ENF"] = array("B1","B2","01","02","03","P1");
		$allFloors["ES"] = array("B1","01","02","03","04","05","06","07","08","09","10","P1","P2");
		$allFloors["ESO"] = array("B1","01","02","03","04","P1","R1");
		$allFloors["ERR"] = array("01","R1");
		$allFloors["GG"] = array("B1","01");
		$allFloors["GL"] = array("B1","01","02","03");
		$allFloors["GR"] = array("01");
		$allFloors["GS"] = array("01");
		$allFloors["HM"] = array("G1","B1","01","02","03","04","P1");
		$allFloors["HP"] = array("B1","01","02");
		$allFloors["HRIC"] = array("B1I","B1","G1","G1I","01","01I","02","02I","03","03I","04","04I");
		$allFloors["HS"] = array("B1","G1","01","02","P1");
		$allFloors["ICT"] = array("B1","01","02","03","04","05","06","07","P1");
		$allFloors["KA"] = array("B1","01","02","03","04","05","06","07","P1","P2");
		$allFloors["KN"] = array("B1-B","B1-A","B1","01","02");
		$allFloors["KNB"] = array("B1","01","02","03","04","P1");
		$allFloors["MC"] = array("B1","01","02","03","04");
		$allFloors["ME"] = array("01","02","03","04","05","06","07","M1");
		$allFloors["MF"] = array("01");
		$allFloors["MFH"] = array("B1","01","02","03","04","M1");
		$allFloors["MH"] = array("B1","01","02","03","04");
		$allFloors["MLB"] = array("B1","B2","01","02","03","04","P1");
		$allFloors["MLT"] = array("B1","01","02","03","04","05","06","06A","07","08","09","10","11","12","P1","P2");
		$allFloors["MS"] = array("B1","B2","01","02","03","04","05","06","07","P1","P2");
		$allFloors["NM"] = array("B1","01","02","M1");
		$allFloors["NO"] = array("B1","01","02","03");
		$allFloors["OC"] = array("01","02");
		$allFloors["OL"] = array("B1","01","02","03","04");
		$allFloors["OO"] = array("B1","01","02");
		$allFloors["PF"] = array("B1","01","02","03","04");
		$allFloors["PP"] = array("B1","01","M1");
		$allFloors["RC"] = array("B1","01","02");
		$allFloors["RT"] = array("01","02","03");
		$allFloors["RU"] = array("B1","01","02","03","04","05","06","07","P1","P2");
		$allFloors["SA"] = array("B1","01","02","03");
		$allFloors["SB"] = array("B1","B2","01","02","03","04","05","06","M1","P1");
		$allFloors["SH"] = array("01","02","03","04");
		$allFloors["SS"] = array("B1","B2","01","02","03","04","05","06","07","08","09","10","11","12","13","14");
		$allFloors["ST"] = array("B1 01");
		$allFloors["TRW"] = array("B1","B2","B3","01","02","03","04","05","06","07");
		$allFloors["VCA"] = array("B1","01","02");
		$allFloors["VCB"] = array("B1","01","02");
		$allFloors["VCC"] = array("B1","01","02");
		$allFloors["VCD"] = array("B1","01","02");
		$allFloors["VCE"] = array("B1","01","02");
		$allFloors["VCF"] = array("B1","01","02");
		$allFloors["VCG"] = array("B1","01","02");
		$allFloors["VCH"] = array("B1","01","02");
		$allFloors["VCI"] = array("B1","01","02");
		$allFloors["VCJ"] = array("B1","01","02");
		$allFloors["VCK"] = array("B1","01","02");
		$allFloors["VCL"] = array("B1","01","02");
		$allFloors["VCM"] = array("B1","01","02");
		$allFloors["VCN"] = array("B1","01","02");
		$allFloors["VCO"] = array("B1","01","02");
		$allFloors["VCP"] = array("B1","01","02");
		$allFloors["VCQ"] = array("B1","01","02");
		$allFloors["VCR"] = array("B1","01","02");
		$allFloors["VCS"] = array("B1","01","02");
		$allFloors["VCT"] = array("B1","01","02");
		$allFloors["VCU"] = array("B1","01","02");
		$allFloors["VCV"] = array("B1","01","02");
		$allFloors["VCW"] = array("B1","01","02");
		$allFloors["VCX"] = array("B1","01","02");
		$allFloors["VCY"] = array("B1","01","02");


		
// Set up all buildings points based on array

		foreach ($allBuildings as $bID=>$values) {
			list($bName, $bLAT, $bLONG, $bIcon) = $values;
			print("\n\n\t\tmarkerOptions = { icon:tinyIcon };\n");
			print("\t\tvar ".$bID."point = new GLatLng($bLAT,$bLONG);\n");
			print("\t\tvar $bID = new GMarker(".$bID."point, markerOptions);\n");
			print("\t\tmap.addOverlay($bID);\n");
			print("\t\tGEvent.addListener($bID, \"click\", function() {\n");
			print("\t\tlastInfoWindow = $bID;\n");
			print("\t\t\tthis.openInfoWindowHtml(\"<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>$bName</td></tr>");
			print("<tr valign='top'><td><img src='$bIcon'></td><td>");
			$floorDataArray = $allFloors[$bID];
			foreach ($floorDataArray as $fKey=>$fValue) {
				print("<font face='Arial'>&middot; <a onmouseover=\\\"this.style.background='#e6e8fa'\\\" onmouseout=\\\"this.style.background='white'\\\" href='/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=$bID&fl_id=$fValue'>Floor $fValue</a></font><br>");
			}
			print("\t\t\t</td></tr></table>\");\n");
			print("\t\t});\n");
		}
?>
		
      }
    }
	function centerZoom (coords) {
		tempArray = coords.split(",");
		lat = tempArray[0];
		lng = tempArray[1];
		if (lastInfoWindow) {
			lastInfoWindow.closeInfoWindow();
		}
		map.setZoom(16);
		map.panTo(new GLatLng(lat,lng));
		setTimeout('map.setZoom(17)',1500);
		setTimeout('map.setZoom(18)',2000);
	}


</script>
<!-- GOOGLE -->

</head>
<body onload="initialize()" onunload="GUnload()" bgcolor="#999999">
<table border="0">
<tr><td>

<?php
		array_qsort (&$allBuildings, $column=0, $order=SORT_ASC, $first=0, $last= -2);
		print("<select onChange=\"centerZoom(this.value);\" size=40 style=\"width:200px;background-color:#999999;\">");
		foreach ($allBuildings as $bID=>$values) {
			list($bName, $bLAT, $bLONG, $bIcon) = $values;
			print("<option value=\"$bLAT,$bLONG\">$bName</option>\n");
		}
		print("</select>");
		
?>


</td><td>
<center><div id="map_canvas" style="width: 1000px; height: 700px"></div></center>
</td></tr>
</table>

</body>
</html>
