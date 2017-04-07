/**
 * A base class for Archibus Flash-based JavaScript controls such as a drawing viewer or chart
 *
 * this class subsumes & replaces AC_OETags.js v 1.6
 *
 */
//
// NOTES
// 
// handles the object/embed tag placed in the div/span/other element within a panel
//
//	the config parameter 'swfPath' should be a path from ab-core (e.g., /controls/drawing/ArchibusSwf or /controls/chart/AbColumnChart)
// note that the extension is added within AC_GetArgs()
//
//   

/**
 * Declare the "flash" namespace.
 */
Ab.namespace('flash');



/**
 * Custom control class. Extends the base Component class.
 */
Ab.flash.FlashComponent = Ab.view.Component.extend({

	// booleans for browser detection
	isIE: (navigator.appVersion.indexOf("MSIE") != -1) ? true : false,

	isWin: (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false,

	isOpera: (navigator.userAgent.indexOf("Opera") != -1) ? true : false,

	
	// member variables controlling the initial layout
	swfPath: "ArchibusSwf",
	
	bgColor: "#dddddd",
	    
	/**
	 * Constructor sets the few member vars specific to all flash components 
	 *  that are not set by base Ab.view.Component
	 */
	constructor:function(id, type, config) {
	    this.inherit(id, type, config);

	    this.swfPath 		= config.getConfigParameter('swf', 'abDrawing');
	    this.bgColor 		= config.getConfigParameter('bgcolor', '#dddddd');			
	},
 	
 	
 	
 	flashAppLoaded: function() {
 	},
 	
 	flashDocLoaded: function() {
 	},
 	

	/**
	 * Generate & Inject into the panel the browser-dependent string that loads the SWF into the browser
	 *
	 */
	runContent: function() {
		var ret = this.AC_GetArgs(arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash");
		var tag = this.generateEmbedObjectTag(ret.objAttrs, ret.params, ret.embedAttrs);
		this.injectFlashTag(tag);
	},


	/**
	 * Return the browser-dependent string that can load the SWF into the browser
	 *
	 */
	returnContent: function() {
		var ret = this.AC_GetArgs(arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash");
		return this.generateEmbedObjectTag(ret.objAttrs, ret.params, ret.embedAttrs);
	},


	/**
	 * Return the browser-dependent string that will be injected into the panel  
	 * to load the SWF into Flash plugin within the browser
	 *
	 */
	generateEmbedObjectTag: function(objAttrs, params, embedAttrs, parentElementId, parentPanelId)  { 
    	var str = '';
    	if (this.isIE && this.isWin && !this.isOpera) {
  			str += '<object ';
  			for (var i in objAttrs) {
  				str += i + '="' + objAttrs[i] + '" ';
			}
            str += '>';
  			for (var i in params) {
  				str += '<param name="' + i + '" value="' + params[i] + '" /> ';
			}
			str += '<param name="wmode" value="transparent"/>';
  			str += '</object>';
    	} 
		else {
  			str += '<embed ';
  			for (var i in embedAttrs) {
  				str += i + '="' + embedAttrs[i] + '" ';
			}
  			str += ' wmode="opaque"> </embed>';
    	}		
		return str;
	},


	/**
	 * Inject the browser-dependent Flash-loading string into the panel parentElement
	 */
	injectFlashTag: function(tagString) {
		if (valueExists(this.parentEl)) {
            var lastChild = this.parentEl.last();
            if (lastChild && (lastChild.dom.tagName.toLowerCase() === 'embed' || lastChild.dom.tagName.toLowerCase() === 'object')) {
                // replace the previous SWF object
                this.parentEl.dom.innerHTML = tagString;
            } else {
                // append the SWF object to the parent element
                try {
                    if (this.parentEl.last()) {
                        Ext.DomHelper.insertHtml('afterBegin', lastChild.dom, tagString);
                    } else {
                        Ext.DomHelper.insertHtml('afterBegin', this.parentEl.dom, tagString);
                    }
                } catch (error) {
                    this.parentEl.dom.innerHTML = tagString;
                }
            }

            View.log('Flash control [' + this.id + ']: loading SWF content', 'debug');
		}
	},

    /**
     * Called by the view after initial data fetch is complete for all panels.
     * In IE6/7 the ActiveX object height has to be synced up to the layout region height.
     */	
	afterInitialDataFetch: function() {
		// we have to defer the execution because in IE the layout manager initialization is also deferred
		this.syncHeight.defer(100, this, [this.parentEl]);
	},
	
	ControlVersion: function () {
		var version;
		var axo;
		var e;
		// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry
		try {
			// version will be set for 7.X or greater players
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			version = axo.GetVariable("$version");
		} 
		catch (e) {
		}
		if (!version) {
			try {
				// version will be set for 6.X players only
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");	
				// installed player is some revision of 6.0
				// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
				// so we have to be careful. 
				//			
				// default to the first public version
				version = "WIN 6,0,21,0";
				// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
				axo.AllowScriptAccess = "always";
				// safe to call for 6.0r47 or greater
				version = axo.GetVariable("$version");
			} 
			catch (e) {
			}
		}
		if (!version) {
			try {
				// version will be set for 4.X or 5.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = axo.GetVariable("$version");
			} 
			catch (e) {
			}
		}
		if (!version) {
			try {
				// version will be set for 3.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = "WIN 3,0,18,0";
			} 
			catch (e) {
			}
		}
		if (!version) {
			try {
				// version will be set for 2.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				version = "WIN 2,0,0,11";
			} 
			catch (e) {
				version = -1;
			}
		}
		return version;
	},


	// JavaScript helper required to detect Flash Player PlugIn version information
	GetSwfVer: function(){
		// NS/Opera version >= 3 check for Flash plugin in plugin array
		var flashVer = -1;
	
		if (navigator.plugins != null && navigator.plugins.length > 0) {
			if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
				var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
				var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
				var descArray = flashDescription.split(" ");
				var tempArrayMajor = descArray[2].split(".");			
				var versionMajor = tempArrayMajor[0];
				var versionMinor = tempArrayMajor[1];
				var versionRevision = descArray[3];
				if (versionRevision == "") {
					versionRevision = descArray[4];
				}
				if (versionRevision[0] == "d") {
					versionRevision = versionRevision.substring(1);
				} 
				else if (versionRevision[0] == "r") {
					versionRevision = versionRevision.substring(1);
					if (versionRevision.indexOf("d") > 0) {
						versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
					}
				}
				var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			}
		}
		// MSN/WebTV 2.6 supports Flash 4
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) {
			flashVer = 4;
		}
		// WebTV 2.5 supports Flash 3
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) {
			flashVer = 3;
		}
		// older WebTV supports Flash 2
		else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) {
			flashVer = 2;
		}
		else if (this.isIE && this.isWin && !this.isOpera ) {
			flashVer = this.ControlVersion();
		}	
		return flashVer;
	},

	// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
	DetectFlashVer: function(reqMajorVer, reqMinorVer, reqRevision) {
		versionStr = this.GetSwfVer();
		if (versionStr == -1 ) {
			return false;
		} 
		else if (versionStr != 0) {
			if (this.isIE && this.isWin && !this.isOpera) {
				// Given "WIN 2,0,0,11"
				tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
				tempString        = tempArray[1];			// "2,0,0,11"
				versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
			} 
			else {
				versionArray      = versionStr.split(".");
			}
			var versionMajor      = versionArray[0];
			var versionMinor      = versionArray[1];
			var versionRevision   = versionArray[2];

		   	// is the major.revision >= requested major.revision AND the minor version >= requested minor
			if (versionMajor > parseFloat(reqMajorVer)) {
				return true;
			} 
			else if (versionMajor == parseFloat(reqMajorVer)) {
				if (versionMinor > parseFloat(reqMinorVer)) {
					return true;
				}
				else if (versionMinor == parseFloat(reqMinorVer)) {
					if (versionRevision >= parseFloat(reqRevision)) {
						return true;
					}
				}
			}
			return false;
		}
	},


	AC_AddExtension: function (src, ext) {
		if (src.indexOf('?') != -1) {
		    return src.replace(/\?/, ext+'?'); 
		}
		else {
		    return src + ext;
		}
	},


	AC_GetArgs: function(args, ext, srcParamName, classid, mimeType){
	    var ret = new Object();
	    ret.embedAttrs = new Object();
	    ret.params = new Object();
	    ret.objAttrs = new Object();
	    for (var i=0; i < args.length; i=i+2){
  		    var currArg = args[i].toLowerCase();    

  		    switch (currArg) {	
		        case "classid":
  			        break;
		        case "pluginspage":
	  		        ret.embedAttrs[args[i]] = args[i+1];
			        break;
		        case "src":
		        case "movie":	
			        args[i+1] = this.AC_AddExtension(args[i+1], ext);
			        ret.embedAttrs["src"] = args[i+1];
			        ret.params[srcParamName] = args[i+1];
			        break;
		        case "onafterupdate":
		        case "onbeforeupdate":
		        case "onblur":
		        case "oncellchange":
		        case "onclick":
		        case "ondblClick":
		        case "ondrag":
		        case "ondragend":
		        case "ondragenter":
		        case "ondragleave":
		        case "ondragover":
		        case "ondrop":
		        case "onfinish":
		        case "onfocus":
		        case "onhelp":
		        case "onmousedown":
		        case "onmouseup":
		        case "onmouseover":
		        case "onmousemove":
		        case "onmouseout":
		        case "onkeypress":
		        case "onkeydown":
		        case "onkeyup":
		        case "onload":
		        case "onlosecapture":
		        case "onpropertychange":
		        case "onreadystatechange":
		        case "onrowsdelete":
		        case "onrowenter":
		        case "onrowexit":
		        case "onrowsinserted":
		        case "onstart":
		        case "onscroll":
		        case "onbeforeeditfocus":
		        case "onactivate":
		        case "onbeforedeactivate":
		        case "ondeactivate":
		        case "type":
		        case "codebase":
			        ret.objAttrs[args[i]] = args[i+1];
			        break;
		        case "id":
		        case "width":
		        case "height":
		        case "align":
		        case "vspace": 
		        case "hspace":
		        case "class":
		        case "title":
		        case "accesskey":
		        case "name":
		        case "tabindex":
			        ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i+1];
			        break;
		        default:
	  		      ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i+1];
		    }
	    }
	    ret.objAttrs["classid"] = classid;
	    if (mimeType) ret.embedAttrs["type"] = mimeType;
	    return ret;
	}
});


 