function initialize_map() {

  if (GBrowserIsCompatible()) {
    var map = new GMap2(document.getElementById("map_canvas"));
    map.setCenter(new GLatLng(51.078066,-114.131453), 16);
    	map.addControl(new GLargeMapControl3D());
    	map.setMapType(G_SATELLITE_MAP);

// all info about icon setup
    	var tinyIcon = new GIcon();
    	tinyIcon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
    	tinyIcon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
    	tinyIcon.iconSize = new GSize(12, 20);
    	tinyIcon.shadowSize = new GSize(22, 20);
    	tinyIcon.iconAnchor = new GPoint(6, 20);
    	tinyIcon.infoWindowAnchor = new GPoint(5, 1);

// Set up the icon for MacHall
    	markerOptions = { icon:tinyIcon };
    	var macHallPoint = new GLatLng(51.078466,-114.131053);
    	var macHall = new GMarker(macHallPoint, markerOptions);
    	map.addOverlay(macHall);
    	GEvent.addListener(macHall, "click", function() {
    		this.openInfoWindowHtml("<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>MacEwan Hall</td></tr><tr valign='top'><td><img src='http://test.workspace.ucalgary.ca/google/macewan-hall.png'></td><td><font face='Arial'>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=01'>First floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Second floor</a></td></tr></table>");
    	});


     
// Set up the icon for Oval
    	markerOptions = { icon:tinyIcon };
    	var ovalPoint = new GLatLng(51.076966,-114.135853);
    	var oval = new GMarker(ovalPoint, markerOptions);
    	map.addOverlay(oval);
    	GEvent.addListener(oval, "click", function() {
    		this.openInfoWindowHtml("<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>Olympic Oval</td></tr><tr><td><img src='http://test.workspace.ucalgary.ca/google/olympic-oval.png'></td><td valign='top'><font face='Arial'>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=01'>First floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Second floor</a><br></td></tr></table>");
    	});
// Set up the icon for Library Tower
    	markerOptions = { icon:tinyIcon };
    	var libraryPoint = new GLatLng(51.077466,-114.128953);
    	var library = new GMarker(libraryPoint, markerOptions);
    	map.addOverlay(library);
    	GEvent.addListener(library, "click", function() {
    		this.openInfoWindowHtml("<table border=0 cellpadding=0 cellspacing=3><tr><td colspan=2><font face='Arial'><b>MacKimmie Library Tower</td></tr><tr><td valign=top><img src='http://test.workspace.ucalgary.ca/google/mackimmie-tower.png'></td><td><font face='Arial'>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=01'>First floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Second floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Third floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Fourth floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Fifth floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Sixth floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Seventh floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Ninth floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Tenth floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Eleventh floor</a><br>&middot; <a onmouseover=\"this.style.background='#e6e8fa'\" onmouseout=\"this.style.background='white'\" href='http://test.workspace.ucalgary.ca/archibus/brg-space-dashboard-floor-drawing.axvw?bl_id=BI&fl_id=02'>Twelth floor</a><br></td></tr></table>");
    		});
  }
}