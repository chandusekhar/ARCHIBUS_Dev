<?php
/*
/////////////////////////////////////////////////////////////////////////////////////////////////////////

Corey Kaye
2009-05-05

Using the Google API for Google Maps: 
http://code.google.com/apis/maps/documentation/reference.html

The lat/long found using:
http://www.gorissen.info/Pierre/maps/googleMapLocation.php

To add a building (and it would be really good if the lat/long could be stored in Archibus and this 
	whole thing be generated dynamically from the SQL tables....), however.   
To add a building, enter the info in the TWO arrays below, that's it.  The point will be auto-added.


2009-07-17 CK
Starting on correcting this mistake.  The buildings lat/long and image will be pulled from the Archibus 
tables, not hard coded in here.  Also, Sustainability wants to add points such as "bike racks" and 
things.  A new table will be added specifically to add "layers" that can be turned on/off
for this google map.

Building info comes from the table BL and the floors comes from FL.  We'll build a javascript array of
buildings and floors.  The array should look like this:
	$allBuildings["[bl_id]"] = array(Building Name, LAT, LON, Building Image);
	$allFloors["[bl_id]"] = array(fl_id1, fl_id2, fl_id...);



Here's the SQL  (sorry, don't have real images yet, my guess is if i don't, no one will.  Have fun looking at macHall FOREVER! Muhahahahaaaaa)

update [afm].[bl] set lat = '51.078097', lon = '-114.127028', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'A';
update [afm].[bl] set lat = '51.075354', lon = '-114.130011', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'AB';
update [afm].[bl] set lat = '51.079924', lon = '-114.125451', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'BI';
update [afm].[bl] set lat = '51.074747', lon = '-114.133519', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'BR';
update [afm].[bl] set lat = '51.074679', lon = '-114.132038', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CA';
update [afm].[bl] set lat = '51.078319', lon = '-114.124657', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CC';
update [afm].[bl] set lat = '51.080402', lon = '-114.133412', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CCIT';
update [afm].[bl] set lat = '51.07596', lon = '-114.137521', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CD';
update [afm].[bl] set lat = '51.07476', lon = '-114.143915', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CDC';
update [afm].[bl] set lat = '51.076621', lon = '-114.128916', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CHC';
update [afm].[bl] set lat = '51.076371', lon = '-114.129528', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CHD';
update [afm].[bl] set lat = '51.076419', lon = '-114.130139', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CHE';
update [afm].[bl] set lat = '51.076837', lon = '-114.130644', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CHF';
update [afm].[bl] set lat = '51.077019', lon = '-114.130086', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'CHG';
update [afm].[bl] set lat = '51.075825', lon = '-114.133465', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'DC';
update [afm].[bl] set lat = '51.076742', lon = '-114.126492', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'EDC';
update [afm].[bl] set lat = '51.077012', lon = '-114.125719', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'EDT';
update [afm].[bl] set lat = '51.080146', lon = '-114.131341', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ENA';
update [afm].[bl] set lat = '51.080679', lon = '-114.131502', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ENB';
update [afm].[bl] set lat = '51.080631', lon = '-114.132006', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ENC';
update [afm].[bl] set lat = '51.080503', lon = '-114.132468', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'END';
update [afm].[bl] set lat = '51.079971', lon = '-114.132478', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ENE';
update [afm].[bl] set lat = '51.079539', lon = '-114.132414', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ENF';
update [afm].[bl] set lat = '51.080362', lon = '-114.128884', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ES';
update [afm].[bl] set lat = '51.085059', lon = '-114.135987', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ESO';
update [afm].[bl] set lat = '51.083775', lon = '-114.13353', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ERR';
update [afm].[bl] set lat = '51.07865', lon = '-114.140278', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'GG';
update [afm].[bl] set lat = '51.075643', lon = '-114.135965', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'GL';
update [afm].[bl] set lat = '51.079425', lon = '-114.140943', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'GR';
update [afm].[bl] set lat = '51.076203', lon = '-114.144098', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'GS';
update [afm].[bl] set lat = '51.066347', lon = '-114.133261', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'HM';
update [afm].[bl] set lat = '51.074895', lon = '-114.138755', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'HP';
update [afm].[bl] set lat = '51.066333', lon = '-114.135332', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'HRIC';
update [afm].[bl] set lat = '51.066057', lon = '-114.134581', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'HS';
update [afm].[bl] set lat = '51.08016', lon = '-114.13015', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ICT';
update [afm].[bl] set lat = '51.07536', lon = '-114.134699', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'KA';
update [afm].[bl] set lat = '51.076965', lon = '-114.133036', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'KN';
update [afm].[bl] set lat = '51.077767', lon = '-114.134002', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'KNB';
update [afm].[bl] set lat = '51.078212', lon = '-114.131641', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'MC';
update [afm].[bl] set lat = '51.082235', lon = '-114.129903', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ME';
update [afm].[bl] set lat = '51.076371', lon = '-114.143271', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'MF';
update [afm].[bl] set lat = '51.076971', lon = '-114.128294', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'MFH';
update [afm].[bl] set lat = '51.078656', lon = '-114.130365', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'MH';
update [afm].[bl] set lat = '51.078036', lon = '-114.129303', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mlb.png' where bl_id = 'MLB';
update [afm].[bl] set lat = '51.07747', lon = '-114.128551', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mlt.png' where bl_id = 'MLT';
update [afm].[bl] set lat = '51.079903', lon = '-114.127779', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'MS';
update [afm].[bl] set lat = '51.079081', lon = '-114.131212', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'NM';
update [afm].[bl] set lat = '51.074706', lon = '-114.134967', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'NO';
update [afm].[bl] set lat = '51.071369', lon = '-114.122286', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'OC';
update [afm].[bl] set lat = '51.074922', lon = '-114.135622', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'OL';
update [afm].[bl] set lat = '51.076998', lon = '-114.135718', image_file = '/archibus/schema/ab-products/uc-custom-views/google/oo.png' where bl_id = 'OO';
update [afm].[bl] set lat = '51.077376', lon = '-114.12674', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'PF';
update [afm].[bl] set lat = '51.07505', lon = '-114.143229', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'PP';
update [afm].[bl] set lat = '51.076398', lon = '-114.131513', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'RC';
update [afm].[bl] set lat = '51.07625', lon = '-114.130719', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'RT';
update [afm].[bl] set lat = '51.07499', lon = '-114.132671', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'RU';
update [afm].[bl] set lat = '51.079101', lon = '-114.128133', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'SA';
update [afm].[bl] set lat = '51.079405', lon = '-114.129496', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'SB';
update [afm].[bl] set lat = '51.077376', lon = '-114.124625', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'SH';
update [afm].[bl] set lat = '51.079101', lon = '-114.126459', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'SS';
update [afm].[bl] set lat = '51.079607', lon = '-114.127157', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'ST';
update [afm].[bl] set lat = '51.066401', lon = '-114.135997', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'TRW';
update [afm].[bl] set lat = '51.079951', lon = '-114.140493', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCA';
update [afm].[bl] set lat = '51.079873', lon = '-114.141104', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCB';
update [afm].[bl] set lat = '51.080237', lon = '-114.14111', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCC';
update [afm].[bl] set lat = '51.080264', lon = '-114.140675', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCD';
update [afm].[bl] set lat = '51.080662', lon = '-114.140697', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCE';
update [afm].[bl] set lat = '51.080648', lon = '-114.141158', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCF';
update [afm].[bl] set lat = '51.08108', lon = '-114.140761', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCG';
update [afm].[bl] set lat = '51.081096', lon = '-114.141764', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCH';
update [afm].[bl] set lat = '51.080877', lon = '-114.142188', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCI';
update [afm].[bl] set lat = '51.080497', lon = '-114.142542', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCJ';
update [afm].[bl] set lat = '51.08055', lon = '-114.141759', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCK';
update [afm].[bl] set lat = '51.080031', lon = '-114.141689', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCL';
update [afm].[bl] set lat = '51.08017', lon = '-114.142247', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCM';
update [afm].[bl] set lat = '51.079941', lon = '-114.142874', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCN';
update [afm].[bl] set lat = '51.081076', lon = '-114.143465', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCO';
update [afm].[bl] set lat = '51.080894', lon = '-114.143727', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCP';
update [afm].[bl] set lat = '51.080925', lon = '-114.14421', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCQ';
update [afm].[bl] set lat = '51.080493', lon = '-114.143894', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCR';
update [afm].[bl] set lat = '51.080641', lon = '-114.143245', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCS';
update [afm].[bl] set lat = '51.080338', lon = '-114.143497', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCT';
update [afm].[bl] set lat = '51.079988', lon = '-114.14354', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCU';
update [afm].[bl] set lat = '51.079846', lon = '-114.14421', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCV';
update [afm].[bl] set lat = '51.07961', lon = '-114.143615', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCW';
update [afm].[bl] set lat = '51.079668', lon = '-114.143202', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCX';
update [afm].[bl] set lat = '51.079206', lon = '-114.143572', image_file = '/archibus/schema/ab-products/uc-custom-views/google/mh.png' where bl_id = 'VCY';




2009-07-21 CK
Added second select box.  First select box now lets you choose the set of markers you want to see.  Based on the
first drop box the second drop box populates with items.  

2009-07-22 CK
This turned out to be kind of a mess.  Not knowing the number of categories that maybe used in the future i had to use
some varable-varables in php... double dollar signs.  It works but it's hard to read because you don't know what varable
is actually being used.  This same logic was used in the JavaScript using the EVAL() function.  Same kind of deal.

Table structure used for google overlays
Table: uc_googleLayerCategories
	catid int
	catname text

Table: uc_googleLayers
	glid int
	catid int
	name text (50char)   // Main Campus Bike Rack
	lat int    // -114.130011
	long int  // -114.130011
	image text (100char)  // archibus/images/bikeRack.jpg
	description text (1000 char)  // A great bike rack that holds 10 bikes with locks....etc.

20091104-CK
Updated this file to now use the db-config.php file where all the config's are stored.  The Google Map key
is now in this file.
*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////



// Show Output
$debug = 0;
$axvwURL = "uc-floor-selector-goog.axvw";


// End config

require "../../../../../ROOT/resource/db-config.php"; 

$connWS = new COM ("ADODB.Connection") or die("Cannot start ADO");
$connStr = "PROVIDER=SQLOLEDB;SERVER=".$wsDB["server"].";UID=".$wsDB["user"].";PWD=".$wsDB["pass"].";DATABASE=".$wsDB["db"];
$connWS->open($connStr); //Open the connection to the WorkSpace database
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ALL BUILDINGS FROM ARCHIBUS THAT HAVE A LAT LON (otherwise i can't plot them)
$query = "select bl_id, name, lat, lon, image_file, address1, address2, area_gross_ext from [afm].[bl] where ";
$query .= " lat is not NULL and lon is not NULL order by bl_id";
if ($debug) {print("<br/><b>QUERY:</b> $query<br/>\n");print("now: ".date("H:i:s")."<br/>");flush();}
$rsBL = $connWS->execute($query);	

$allBuildings = array();
$allFloors = array();

while (!$rsBL->EOF) {
	$bl_id = trim($rsBL->fields['bl_id']);
	$bl_name = trim($rsBL->fields['name']);
	$bl_lat = trim($rsBL->fields['lat']);
	$bl_lon = trim($rsBL->fields['lon']);
	$bl_img = trim($rsBL->fields['image_file']->value);   //  -> value is necessary if the field is of type NULL
	$bl_add1 = trim($rsBL->fields['address1']->value);
	$bl_add2 = trim($rsBL->fields['address2']->value);
	$bl_area = trim($rsBL->fields['area_gross_ext']);
	
	if ($debug) {print("<br/><b>Got building:</b> $bl_id<br/>\n");print("now: ".date("H:i:s")."<br/>");flush();}

	$allBuildings[$bl_id] = array($bl_name,$bl_lat,$bl_lon,$bl_img,$bl_add1."<br/>".$bl_add2,$bl_area);
	
	$rsBL->MoveNext();
}


// GET THE FLOORS FOR EACH BUILDING
$query = "select bl_id, name, fl_id from [afm].[fl] where bl_id='A' ";
foreach ($allBuildings as $bl_id=>$blArray) {
	$query .= "OR bl_id='$bl_id' ";
}
if ($debug) {print("<br/><b>QUERY:</b> $query<br/>\n");print("now: ".date("H:i:s")."<br/>");flush();}
$rsFL = $connWS->execute($query);	

while (!$rsFL->EOF) {
	$bl_id = trim($rsFL->fields['bl_id']);
	$fl_id = trim($rsFL->fields['fl_id']);
	$fl_name = trim($rsFL->fields['name']->value);
	if (!(is_array($allFloors[$bl_id]))) {
		$allFloors[$bl_id] = array();
	}
	array_push($allFloors[$bl_id], "$fl_id~$fl_name");
	$rsFL->MoveNext();
}


$BuildingsInit = "";
$BuildingsArray = "";
$BuildingsPopulate = "";

foreach ($allBuildings as $bID=>$values) {
	if (count($allFloors[$bID]) >= 1) {  //Some Buildings don't have floors, this is a problem.
		list($bName, $bLAT, $bLONG, $bIcon, $bAddy, $bArea) = $allBuildings[$bID];
		$BuildingsInit .= "\t\tvar $bID;\n";
		$BuildingsArray .= "'$bID',";
		$BuildingsPopulate .= "\t\t\taddToOptionList(document.myForm.markerList,\"$bLAT,$bLONG\",\"$bID | $bName\");\n";
	}
}


// GET ALL BUILDINGS FROM ARCHIBUS THAT HAVE A LAT LON (otherwise i can't plot them)
//////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET LIST OF OTHER LAYERS AND CLASSES FROM DB

$query = "select * from [afm].[uc_googlelayers] as l, [afm].[uc_googlelayercategories] as c where ";
$query .= " l.catid = c.catid ";
$query .= " order by catname";

$allCategories = array('Buildings');
$allPoints = array();

if ($debug) {print("<br/><b>QUERY:</b> $query<br/>\n");print("now: ".date("H:i:s")."<br/>");flush();}
$rsGL = $connWS->execute($query);	

while (!$rsGL->EOF) {
	$catname = trim($rsGL->fields['catname']->value);
	$img = trim($rsGL->fields['image_file']->value);
	$lat = trim($rsGL->fields['lat']->value);
	$long = trim($rsGL->fields['long']->value);
	$name = trim($rsGL->fields['name']->value);
	$desc = trim($rsGL->fields['description']->value);
	$layerid = trim($rsGL->fields['glid']->value);

	$catname = str_replace(" ","_",$catname);
	
	if (!(in_array($catname, $allCategories))) {
		array_push($allCategories, $catname);
	}
	$init = $catname."Init";
	$array = $catname."Array";
	$populate = $catname."Populate";
	$uniqueID = str_replace(" ","",$catname).$layerid;
	
	$$init .= "\t\tvar $uniqueID;\n";
	$$array .= "'$uniqueID',";
	$$populate .= "\t\t\taddToOptionList(document.myForm.markerList,\"$lat,$long\",\"$name\");\n";

	$allPoints[$uniqueID] = array($name,$lat,$long,$img,$desc);
	
	$rsGL->MoveNext();
}

// clean up javascript
foreach ($allCategories as $key=>$catname) {
	$array = $catname."Array";
	$$array = "var ".$catname."Array = new Array(".$$array;
	$$array = rtrim($$array,",").");\n";  //remove last comma and end JS array
}

// GET LIST OF OTHER LAYERS AND CLASSES FROM DB
//////////////////////////////////////////////////////////////////////////////////////////////////////////



?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Google maps for WorkSpace</title>



<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=<?php echo $googleMapsKey[$thisServer]; ?>" type="text/javascript"></script>

<script type="text/javascript">
	var map;
	var lastInfoWindow;

// Initialize all GMarkers varables and create an array for each Marker Set 
<?php
	foreach ($allCategories as $key=>$catname) {
		$init = $catname."Init";
		$array = $catname."Array";
		print("\n");
		print($$array);
		print($$init);
	}
?>




// Always clear an option list from the last entry to the first
 	function clearOptions(OptionList) {
		for (x = OptionList.length; x >= 0; x = x - 1) {
			OptionList[x] = null;
		}
	}

// Add option to the bottom of the list
	function addToOptionList(OptionList, OptionValue, OptionText) {
	   OptionList[OptionList.length] = new Option(OptionText, OptionValue);
	}

	

<?php
	print("// PHP GENERATED JAVASCRIPT\n");
	print("\tfunction populateSet(setName) {\n\t\tclearOptions(document.myForm.markerList);\n");

	foreach ($allCategories as $key=>$catname) {
		$init = $catname."Init";
		$array = $catname."Array";
		$populate = $catname."Populate";

		print("\t\tif (setName == \"$catname\") {\n");
		foreach ($allCategories as $k=>$c) {
			if ($c == $catname) {
				print("\t\t\ttoggleMarkers(\"$c\", true);\n");
			}
			else {
				print("\t\t\ttoggleMarkers(\"$c\", false);\n");
			}
		}
		print($$populate);
		print("\t\t}\n\n");
	}
	
	print("\t}\n\n");

?>

	
	function toggleMarkers(markerName, showMarkers) {
		var thisArray = markerName+"Array";
		if (showMarkers) {
			for (var i in eval(thisArray)) {
				eval(eval(thisArray)[i]).show();    // yes, this really does work.... arg!  Building Name = SS = Social Science.  ==>  SS.hide();  from the BuildingsArray()
			}
		}
		else {
			for (var i in eval(thisArray)) {
				eval(eval(thisArray)[i]).hide();
			}		
		}
	}
	
    function initialize() {
      if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("map_canvas"));
        map.setCenter(new GLatLng(51.076566,-114.131453), 16);
		map.setMapType(G_SATELLITE_MAP);
		var mapControl = new GMapTypeControl();
		map.addControl(mapControl);
		map.addControl(new GLargeMapControl3D());
		map.enableScrollWheelZoom();
		map.enableContinuousZoom();

// info about icons used on map
		var tinyIcon = new GIcon();
		tinyIcon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
		tinyIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
		tinyIcon.iconSize = new GSize(12, 20);
		tinyIcon.shadowSize = new GSize(22, 20);
		tinyIcon.iconAnchor = new GPoint(6, 20);
		tinyIcon.infoWindowAnchor = new GPoint(5, 1);

		
<?php

// Set up all buildings points based on array
		foreach ($allBuildings as $bID=>$values) {
			if (count($allFloors[$bID]) >= 1) {  //Some Buildings don't have floors, this is a problem.
				list($bName, $bLAT, $bLONG, $bIcon, $bAddy, $bArea) = $values;
				$bAddy = str_replace("'","\\'",$bAddy);
				$bAddy = str_replace("\"","",$bAddy);
				$bArea = number_format($bArea);  //cut off decimal, add pretty commas
				print("\n\n\t\tmarkerOptions = { icon:tinyIcon };\n");
				print("\t\tvar ".$bID."point = new GLatLng($bLAT,$bLONG);\n");
				print("\t\t$bID = new GMarker(".$bID."point, markerOptions);\n");
				print("\t\tmap.addOverlay($bID);\n");
				//google popup 
				print("\t\tGEvent.addListener($bID, \"mouseover\", function() {\n");
				print("\t\tif (lastInfoWindow) {myCloseInfoWindow();}\n");
				print("\t\tlastInfoWindow = $bID;\n");
				print("\t\t\tthis.openInfoWindowHtml(\"<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>$bName</td></tr>");
				print("<tr valign='top'><td><img src='$bIcon'></td><td>");
				foreach ($allFloors[$bID] as $fKey=>$fValue) {
					if ($debug) {print("\n\nDEBUG: Floor key:$fKey value:$fValue</br>\n\n");}
					list($fid,$fname) = split("~",$fValue);
					if ($fname != "Roof") {  // For the most part 85%+ we don't have drawings of the roof.... best just to hide them.
						print("<font face='Arial'>&middot; <a onmouseover=\\\"this.style.background='#e6e8fa'\\\" onmouseout=\\\"this.style.background='white'\\\" href='/archibus/uc-floor-selector-goog.axvw?bl_id=$bID&fl_id=$fid'>$fname</a></font><br>");
					}
				}
				print("</td></tr>");
				// next line adds building address and area information.
				print("<tr><td colspan=2><font face='Arial'><b>Area:</b> ".$bArea."m<sup>2</sup></font></td></tr></table>\");");
				print("\n\t\t});\n");
			}
		}
		
// Set up all other points based on array
		foreach ($allPoints as $bID=>$values) {
			list($bName, $bLAT, $bLONG, $bIcon, $bDesc) = $values;
			print("\n\n\t\tmarkerOptions = { icon:tinyIcon };\n");
			print("\t\tvar ".$bID."point = new GLatLng($bLAT,$bLONG);\n");
			print("\t\t$bID = new GMarker(".$bID."point, markerOptions);\n");
			print("\t\tmap.addOverlay($bID);\n");
			//google popup 
			print("\t\tGEvent.addListener($bID, \"mouseover\", function() {\n");
			print("\t\tif (lastInfoWindow) {myCloseInfoWindow();}\n");
			print("\t\tlastInfoWindow = $bID;\n");
			print("\t\t\tthis.openInfoWindowHtml(\"<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>$bName</td></tr>");
			print("<tr valign='top'><td><img src='$bIcon'></td><td>$bDesc</td></tr></table>\");");
			print("\n\t\t});\n");
		}

?>
		
      } //GBrowserIsCompatable()
    } // initialize()
	
	
	function myCloseInfoWindow() {
			lastInfoWindow.closeInfoWindow();	
	}

	function centerZoom (coords) {
		tempArray = coords.split(",");
		lat = tempArray[0];
		lng = tempArray[1];
		if (lastInfoWindow) {
			myCloseInfoWindow();
		}
		map.setZoom(16);
		map.panTo(new GLatLng(lat,lng));
		setTimeout('map.setZoom(17)',1500);
		setTimeout('map.setZoom(18)',2000);
	}


</script>

</head>
<body onload="initialize()" onunload="GUnload()" bgcolor="#999999">
<?php
		print("<div><div style=\"position:absolute; bottom: 25px; left: 7px; z-index: 50;\">");
		print("<form name=\"myForm\">");
		print("<select onChange=\"populateSet(this.value);\" size=1 style=\"width:200px; background-color:#CCD3CC;\">\n");
		foreach ($allCategories as $key=>$catname) {
			print("<option value=\"$catname\">- $catname -</option>\n");
		}
		print("</select>\n<br/>");
		print("<select name=\"markerList\" onChange=\"centerZoom(this.value);\" size=10 style=\"width:200px; background-color:#CCD3CC;\">\n");
		foreach ($allBuildings as $bID=>$values) {
			list($bName, $bLAT, $bLONG, $bIcon, $bAddy, $bArea) = $values;
			print("<option value=\"$bLAT,$bLONG\">$bID | $bName</option>\n");
		}
		print("</select></div>");
		print("</form>");
		
?>

<script language="javascript">
var h = document.documentElement.scrollHeight-20;
document.write("<div id=\"map_canvas\" style=\"width: 100%; height: "+h+"px; z-index:10;\"></div>");
</script>


</div>
</body>
</html>
