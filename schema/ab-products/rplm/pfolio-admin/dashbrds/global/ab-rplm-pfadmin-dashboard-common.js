
/**
 * Example controller class.
 */
var summaryController = View.createController('summaryController', {
    
    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad: function() {	      	
		// set up the top panel label and user values
		var Logo = $("Logo");
		if (Logo != null) {
			Logo.innerHTML = '<img height="80" src="'+View.contextPath+'/schema/ab-system/graphics/archibus.png" title="ARCHIBUS Logo" ALT="ARCHIBUS Logo" border="5"/>';
		}		
		var more = $("more");
		more.innerHTML = getMessage('moreText');
	
		var level1Name = $("level1Name");
		level1Name.innerHTML = getMessage('level1Name');	 	   
	},

	getDataFetchedString: function() {
		var month_names = new Array('January','February','March', 'April','May','June','July','August','September','October','November','December');
		var now = new Date();
		var nowHour = now.getHours();
		var meridian = (nowHour < 12) ? 'AM' : 'PM';
		nowHour = (nowHour < 13) ? nowHour : nowHour - 12;
		var nowYear = now.getYear();
		nowYear = (nowYear < 1000) ? nowYear + 1900 : nowYear;
		return month_names[now.getMonth()] + ' ' + now.getDate() + ', ' + nowYear + ' at ' + nowHour + ':' + now.getMinutes() + ':' + now.getSeconds() + ' ' + meridian;
	},
	
	showMore: function(){
		View.openDialog('ab-rplm-pfadmin-dashboard-summary-detail.axvw', null, false);
	}

});

function intializeHorizontalGauge(panelObj, gaugeObj){
	var panelWidth = panelObj.offsetWidth;
	var panelHeight = panelObj.offsetHeight;
	var wdt = panelWidth * .7;
	var hgt = panelHeight * .34 ; 
	
	gaugeObj.setStyleProperty('fontSize', 10);
	gaugeObj.setStyleProperty('paddingRight', 0);
	gaugeObj.setStyleProperty('paddingLeft', 0);
	gaugeObj.setStyleProperty('paddingTop', 0);
	gaugeObj.setStyleProperty('paddingBottom', 0);
	gaugeObj.setStyleProperty('backgroundAlpha', .5);
	gaugeObj.setStyleProperty('backgroundColor', "0x000000");
	gaugeObj.setStyleProperty('foregroundColor', "0x375B73");
	gaugeObj.setStyleProperty('color', "0xFFFFFF");
	gaugeObj.setStyleProperty('skinColor', "0x375B73");
	
	//gaugeObj.width=wdt;
	//gaugeObj.height=hgt + 25;

	gaugeObj.setControlProperty('width', wdt);
	gaugeObj.setControlProperty('height', hgt);
	//gaugeObj.refresh;
	
	
	
	
}

function intializeKnobGauge(panelObj, gaugeObj){
	var panelWidth = panelObj.offsetWidth;
	var panelHeight = panelObj.offsetHeight;
	var wdt = panelWidth * .5;
	var hgt = panelHeight * .5; 
	
//	gaugeObj.setStyleProperty('fontSize', 10);
//	gaugeObj.setStyleProperty('paddingRight', 0);
//	gaugeObj.setStyleProperty('paddingLeft', 0);
//	gaugeObj.setStyleProperty('paddingTop', 0);
//	gaugeObj.setStyleProperty('paddingBottom', 0);
//	gaugeObj.setStyleProperty('backgroundAlpha', .5);
//	gaugeObj.setStyleProperty('backgroundColor', "0x000000");
//	gaugeObj.setStyleProperty('foregroundColor', "0xFFFFFF");
//	gaugeObj.setStyleProperty('color', "0xFFFFFF");
	
	gaugeObj.width=wdt;
	gaugeObj.height=hgt;

	//gaugeObj.setControlProperty('width', wdt);
	//gaugeObj.setControlProperty('height', hgt);
	//gaugeObj.refresh;			
	
}

function intializeCircularGauge(panelObj, gaugeObj){
	//gauge_office_util.setStyleProperty('showTrack', false);
	gaugeObj.setStyleProperty('paddingRight', 0);
	gaugeObj.setStyleProperty('paddingLeft', 0);
	gaugeObj.setStyleProperty('paddingTop', 0);
	//gaugeObj.setStyleProperty('paddingBottom', 0);
	gaugeObj.setStyleProperty('backgroundAlpha',.8);
	gaugeObj.setStyleProperty('backgroundColor', "0xffffff");
	gaugeObj.setStyleProperty('foregroundColor', "0x95B6CC");
	
	gaugeObj.setStyleProperty('skinColor', "0x95B6CC");
	gaugeObj.setStyleProperty('color', "0x000000");
	gaugeObj.setStyleProperty('fontSize', 14);
	gaugeObj.width = 20;
}


function XMLWriter()
{
    this.XML=[];
    this.Nodes=[];
    this.State="";
    this.FormatXML = function(Str)
    {
        if (Str)
            return Str.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return ""
    }
    this.BeginNode = function(Name)
    {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        this.State="beg";
        this.Nodes.push(Name);
        this.XML.push("<"+Name);
    }
    this.EndNode = function()
    {
        if (this.State=="beg")
        {
            this.XML.push("/>");
            this.Nodes.pop();
        }
        else if (this.Nodes.length>0)
            this.XML.push("</"+this.Nodes.pop()+">");
        this.State="";
    }
    this.Attrib = function(Name, Value)
    {
        if (this.State!="beg" || !Name) return;
        this.XML.push(" "+Name+"=\""+this.FormatXML(Value)+"\"");
    }
    this.WriteString = function(Value)
    {
        if (this.State=="beg") this.XML.push(">");
        this.XML.push(this.FormatXML(Value));
        this.State="";
    }
    this.Node = function(Name, Value)
    {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        this.XML.push((Value=="" || !Value)?"<"+Name+"/>":"<"+Name+">"+this.FormatXML(Value)+"</"+Name+">");
        this.State="";
    }
    this.Close = function()
    {
        while (this.Nodes.length>0)
            this.EndNode();
        this.State="closed";
    }
    this.ToString = function(){return this.XML.join("");}
}

