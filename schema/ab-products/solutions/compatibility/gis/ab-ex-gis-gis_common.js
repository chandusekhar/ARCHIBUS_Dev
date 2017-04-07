
function getInputValue(fieldFullName, form)
{
	var returnedValue = "";
	if(fieldFullName!=""){
		if(form==null  || form==""){
			form = document.forms[1].name;
		}
		var objForm = document.forms[form];
		returnedValue = objForm.elements[fieldFullName].value;
        if(returnedValue == null) returnedValue = '';
		returnedValue = trim(returnedValue);
		var typeUpperCase = arrFieldsInformation[fieldFullName]["type"];
        if(typeUpperCase == null) typeUpperCase = '';
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[fieldFullName]["format"];
        if(formatUpperCase == null) formatUpperCase = '';
		formatUpperCase = formatUpperCase.toUpperCase();
		returnedValue=convertFieldValueIntoValidFormat(typeUpperCase,formatUpperCase,returnedValue);
		if(typeUpperCase != "JAVA.SQL.TIME")
			returnedValue = convert2validXMLValue(returnedValue);
		else
			returnedValue = objForm.elements["Stored"+fieldFullName].value;
	}
	return returnedValue;
}

AFM.form.Form.prototype.clearValidationResult = function() 
{
    this.validationResult = new AFM.form.ValidationResult();
    
    // clear validation message
    var messageElement = this.getMessageElement();
    messageElement.innerHTML = "";
    YAHOO.util.Dom.removeClass(messageElement, "formMessage");
    YAHOO.util.Dom.removeClass(messageElement, "formError");
    
    // clear field highlighting for all fields
    var fieldNames = this.getFieldNames();
    for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        
        try{
	        // clear the input element class
	        var fieldInput = $(fieldName);
	        var fieldInputTd = fieldInput.parentNode;
	        YAHOO.util.Dom.removeClass(fieldInputTd, "formErrorInput");
	        
	        // remove per-field error messages
	        var errorTextElements = YAHOO.util.Dom.getElementsByClassName('formErrorText', '', fieldInputTd);
	        for (var e = 0; e < errorTextElements.length; e++) {
	            fieldInputTd.removeChild(errorTextElements[e]);
	        }
        }catch(ex){}
    }
    
    // both Save and Refresh clear the afm_form_values_changed flag
    afm_form_values_changed = false;
}

Calendar.formatCalendar = function (year, month, day){
	month = month + "";
	month = parseInt(month, 10);
	var obj_MM = $(this.MMID, false);
	if(obj_MM!=null){
		for(var i=0;i<obj_MM.length;i++){
			if(obj_MM[i]!=null && obj_MM[i].value==month){
				obj_MM[i].selected=1;
				break;
			}
		}
	}
	var obj_YYYY = $(this.YYYYID, false);
	if(obj_YYYY!=null)
		obj_YYYY.innerHTML = year;
	var daysOfMonth = 31;
	if(month==4||month==6||month==9||month==11){
		daysOfMonth = 30;
	}else{
		if( month == 2 ){
			daysOfMonth = 28;
			if( ( year % 4 == 0 && year % 100 != 0 ) || ( year % 400 == 0) )
				daysOfMonth = 29;
		}
	}
	var date	= new Date( year, month-1, 1);
	var dayOfFirst	= date.getDay();
	var var_day	= 1;
	var dd;

	var curDate	= new Date();
	var curYear	= curDate.getFullYear();
	var curMonth	= curDate.getMonth()+ 1;
	var curDay	= curDate.getDate();
	if(typeof day == "undefined")
		day = curDay;

	for(var i = 0; i <= 41; i++){
		var objElem = $(this.DateButton+(i+1), false);
		if(objElem!=null){
			if( ( i < dayOfFirst )  ||  ( var_day > daysOfMonth ) ){
				if( document.all ||(!document.all && document.getElementById) )
					if(objElem.style != null)objElem.style.visibility = "hidden";
			}else{
				if( var_day.toString().length < 2 )
					dd = " " + var_day + " ";
				else
					dd = var_day;

				objElem.innerHTML = dd;
				if(objElem.style!=null){
				objElem.style.visibility = "visible";
				if(curYear==year && curMonth==month && dd == day){
					objElem.style.backgroundColor="#FFCC66";
					objElem.style.borderStyle="solid";
					objElem.style.borderColor="#FF9900";
					objElem.style.borderWidth="thin";
				}else{
					objElem.style.backgroundColor="";
					objElem.style.borderStyle="";
					objElem.style.borderColor="";
					objElem.style.borderWidth="";
				}
				var_day = var_day + 1;
				}
			}
		}
	}
};

var oMenu = null;

//var isVisible = new Object();

//loads the ArcWeb Explorer SWF map
function get_key()
{
	//read the ArcWebServices key from database
	var param_id = 'ESRIArcWebServicesKey';
	var parameters ={	tableName: 'afm_activity_params',
						fieldNames: toJSON(['afm_activity_params.param_value']),
						restriction: toJSON({'afm_activity_params.param_id':param_id})
					};     

	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

	if (result.code == 'executed') 
	{
    	var record = result.data.records[0];
      	var key_value = record['afm_activity_params.param_value'];
      	return key_value;
   	}
	else 
	{
  		AFM.workflow.Workflow.handleError(result);
   	}   	
}

function showNavigation()
{
	showHideWidget(AWMap.WIDGET_NAVIGATION);
}

function showFind()
{
	showHideWidget(AWMap.WIDGET_FIND);
}

function showDirections()
{
	showHideWidget(AWMap.WIDGET_DIRECTIONS);
}

function showMapTypes()
{
	showHideWidget(AWMap.WIDGET_MAPTYPES);
}

function showLegend()
{
	showHideWidget(AWMap.WIDGET_LEGEND);
}

function showHideWidget(str)
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	//if(isVisible[str] == true)
	//{
	//	myExplorer.hideWidget(str);
	//	isVisible[str] = false;
	//}
	//else
	//{
	if(myExplorer != null)
		myExplorer.showWidget(str);
	//	isVisible[str] = true;
	//}
}

function createHeader(element)
{
	//var div = document.createElement("div");
	//div.id = "mapHeader";
	//div.className = "panelHeader";
	//div.innerHTML = "Streets";
	//div.style.cssText = "color: #000000; text-align: center;font-size: 12px;font-weight: bold;padding-top: 2px;"
	//element.parentElement.parentNode.insertBefore(div, element.parentElement.parentNode.firstChild);//'<div id="mapHeader" class="panelHeader" width="100%" style="color: #000000; text-align: center;font-size: 12px;font-weight: bold;padding-top: 2px;">Streets</div>',
		//element.parentElement.parentNode.firstChild); 
		
}

function changeHeader(str)
{
	//var div = document.getElementById("mapHeader");
	//div.innerHTML = str;
}

function showStreets()
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	myExplorer.removeAllGroupLayers();
    myExplorer.addGroupLayer("vectorGroupLayer");
    changeHeader("Streets");
}

function showHybrid()
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	myExplorer.removeAllGroupLayers();
    myExplorer.addGroupLayer("hybridGroupLayer");
    changeHeader("Hybrid");
}

function showSatellite()
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	myExplorer.removeAllGroupLayers();
    myExplorer.addGroupLayer("rasterTileGroupLayer");
    changeHeader("Satellite");
}

function showCensus()
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	myExplorer.removeAllGroupLayers();
    myExplorer.addGroupLayer("mapImageGroupLayer", "ArcWeb:Census.Density.US");
    changeHeader("Census Density");
}

function showDriveTime()
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	myExplorer.removeAllGroupLayers();
    myExplorer.addGroupLayer("mapImageGroupLayer", "ArcWeb:TA.Streets.NA");
    changeHeader("Drive Time");
}

function showOtherMap(p_sType, p_aArgs, p_oValue)
{
	var mapFrame = getFrameObject(parent, "detailsFrame");
	myExplorer = mapFrame.myMap;
	if(p_oValue[0] == "queryGroupLayer")
		myExplorer.removeGroupLayer("queryGroupLayer");
	else
		myExplorer.removeAllGroupLayers();
	if(p_oValue[0] == "thematicGroupLayer")
	    myExplorer.addGroupLayer(p_oValue[0], p_oValue[1], {
	          alpha:50,
	          thematicField:"AVGHHINC",
	          numClasses:5,
	          mapLegend:{autoextend:"true", height:10},
	          showLegend:"floating"
	        });
	else
		myExplorer.addGroupLayer(p_oValue[0], p_oValue[1]);
        	
    changeHeader("Others");
    
    oMenu.hide();
}

function createMenu()
{
		var aItems = [
        
            { text: "Geographic", submenu: { id: "geographic", itemdata: [ 
            
                { text: "North American Points of Interest Spatial Query NAVTEQ", onclick: { fn: showOtherMap, obj: ["queryGroupLayer", "ArcWeb:NT.POI.NA"] } },
                { text: "U.S. Thematic Map Report ESRI", onclick: { fn: showOtherMap, obj: ["thematicGroupLayer", "ArcWeb:ESRI.ThematicMap.US"] }  }, //Invalid data source name
                { text: "U.S. National Elevation Dataset Shaded Relief Map USGS", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:USGS.NED.US"] } },
                { text: "U.S. USGS Digital Ortho Map Image Service GlobeXplorer", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.DOQQ.US"] } },
                { text: "U.S. Elevation Data Spatial Query USGS", onclick: { fn: showOtherMap, obj: ["queryGroupLayer", "ArcWeb:USGS.Elevation.US"] } },
                { text: "U.S. National Land Cover Dataset Map USGS", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:USGS.NLCD.US"] }},
                { text: "U.S. Nautical Charts Maptech", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:MT.NauticalCharts.US"] }},
                { text: "U.S. TOPO! Map National Geographic", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:NGS.Topo.US"] }},
                { text: "World Earthquakes Spatial Query USGS", onclick: { fn: showOtherMap, obj: ["queryGroupLayer",  "ArcWeb:USGS.Earthquakes.World"] } },
                { text: "World Recent Earthquakes Map USGS", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:USGS.Earthquakes.World"] } },              
            
            ] } },

            { text: "Demographic", submenu: { id: "demographic", itemdata: [

                { text: "U.S. Demographics (Set 1) by ZIP Code Thematic Map ESRI", onclick: { fn: showOtherMap, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByZipCode.US"] } },
                { text: "U.S. Detailed Business Listings Spatial Query infoUSA", onclick: { fn: showOtherMap, obj: ["queryGroupLayer", "ArcWeb:INFOUSA.BusinessListingsDetails.US"] } },//error
                { text: "U.S. 2000 Population Density Map Census", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:Census.Density.US"] } },
                { text: "U.S. Parcel Place Finder Blue Raster", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:BR.Parcels.US"] } },
                { text: "U.S. 109th Congressional Districts Thematic Map ESRI", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:ESRI.CongDist109.US"] } },
                { text: "U.S. Demographics (Set 1) by Congressional District Thematic Map ESRI", onclick: {fn: showOtherMap, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByCongressionalDistrict.US"]}},
                { text: "U.S. Demographics (Set 1) by County Subdivision Thematic Map ESRI ", onclick: {fn: showOtherMap, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByCountySubdivision.US"]}},
                { text: "U.S. Demographics (Set 1) by Populated Place Thematic Map ESRI ", onclick: {fn: showOtherMap, obj: ["thematicGroupLayer", "ArcWeb:ESRI.DemographicsByPopulatedPlace.US"]}} 
                           
            ] } },

            { text: "Satellite", submenu: { id: "satellite", itemdata: [
            
                { text: "World EarthSat NaturalVue Imagery GlobeXplorer $", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.EarthSatNaturalVue.World"] }  },
                { text: "World Imagery ESRI", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:ESRI.Satellite.World"] } },
                { text: "World Premium Imagery GlobeXplorer $$", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:GlobeXplorer.Premium.World"] } }
            
            ] } },
            
            {text: "Weather", submenu: { id: "weather", itemdata: [
            
            	{ text: "U.S. Flood Hazard Areas Spatial Query FEMA", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer", "ArcWeb:FEMA.Flood.US"] }  },
            	{ text: "World Forecasted Airport Delays Map CustomWeather", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:CW.AirportDelays.World"] }  },
            	{ text: "North American Current Weather Map Meteorlogix", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:MX.CurrentWeather.NA"] }  },
            	{ text: "North American Forecast Weather Map Meteorlogix" , onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:MX.ForecastWeather.NA"] } },
            	{ text: "World Current Weather Conditions Map CustomWeather", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:CW.CurrentWeather.World"] }  },
            	{ text: "U.S. Flood Risk Zone Map FEMA", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:FEMA.Flood.US"] }  },
            	{ text: "U.S. Precipitation Map Meteorlogix", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:MX.Precipitation.US"] }  }
            	
           	] } },
           	
           	{text: "Streets", submenu: { id: "streets", itemdata: [
           		
           		{ text: "U.S. Street Map Tele Atlas", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:TA.Streets.US"] }  },
           		{ text: "U.S. TIGER 2000 Street Map Census", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:Census.Streets.US"] }  },
           		{ text: "U.S. Traffic Incident Map TrafficCast", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:TC.Traffic.US"] }  },
           		{ text: "World Airport Locations Spatial Query NGA", onclick: { fn: showOtherMap, obj: ["queryGroupLayer",  "ArcWeb:ESRI.Airports.World"] }  },
           		{ text: "U.S. Traffic Spatial Query TrafficCast", onclick: { fn: showOtherMap, obj: ["queryGroupLayer",  "ArcWeb:TC.Traffic.US"] }  },
           		{ text: "North American Drive Time Utility NAVTEQ", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:NT.Streets.NA"] }  },
           		{ text: "North American Drive Time Utility Tele Atlas", onclick: { fn: showOtherMap, obj: ["mapImageGroupLayer",  "ArcWeb:TA.Streets.NA"] }  }
           		
       		] } }

        ];                

        /*
             Instantiate the menu.  The first argument passed to the 
             constructor is the id of the DOM element to be created for the 
             menu; the second is an object literal representing a set of 
             configuration properties for the menu.
        */

        oMenu = new YAHOO.widget.Menu("others", {context: ["ShowOthers", "br", "tr"], zindex: 5 });
        

        /*
            Add items to the menu by passing an array of object literals 
            (each of which represents a set of YAHOO.widget.MenuItem 
            configuration properties) to the "addItems" method.
        */

        oMenu.addItems(aItems);

        oMenu.showEvent.subscribe(function () {

            this.focus();
        
        });

        /*
             Since this menu is built completely from script, call the "render" 
             method passing in the id of the DOM element that the menu's 
             root element should be appended to.
        */
        
        //oMenu.cfg.setProperty("x",  oMenu.cfg.getProperty("x") + 50);
		//oMenu.cfg.setProperty("y",  oMenu.cfg.getProperty("y") - 50);
        
        oMenu.render("ShowOthers");        
}

function showOthers()
{
	oMenu.show();
}