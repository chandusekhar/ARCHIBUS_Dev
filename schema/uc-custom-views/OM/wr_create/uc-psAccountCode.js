/* *****************************************************************************

THERE IS NO LOGIC IN THIS FILE! 
All logic is handled in the PHP file.  Not as efficent but 
keeps it all together. 

This file only passes the info to PHP and returns the answer
to Archibus.  Nothing more, nothing less.
; )



This script require two external JS files. 
- captureDOMelements.js
	A file that runs though all DOM elements found on the page and returns
	an XML document of the elements name and value.
	
- mootools.js
	A modified (i think) mootools.js core file found http://www.solutoire.com/experiments/mootools/json_ex1.html

And two external PHP files.
- JSON.php
	A packaged file that setups the JSON call and formats the data.
	
- uc-psAccountCode.php
	The script that accepts an UofC account code and searches the Archibus tables
	to see if it already exists, if so returns true.  If not it searches the UofC
	data warehouse for the code.  If found it inserts it into the Archibus table and 
	returns true.  Other wise it returns false.

To run this, include this script only and call the main function: 
uc_psAccountCode(UNIT(AAAAA)5, FUND(99)2, DEPT(99999)5, ACCOUNT(99999)5, PROGRAM(99999)5, INTERNAL(AA9999999)9, PROJECT(AA999999)8, ACTIVITY(AAAAA)5 );
 
To see what is sent to the server and what SQL the server executes turn auditDebug =1

Corey Kaye
2009-08-19
****************************************************************************** */

var auditDebug = 0;

document.write("<script type=\"text/javascript\" src=\"/resource/ajax/mootools.js\"></script>");

if (auditDebug) {
	document.write("<hr><h3>DEBUG ON!</h3><p><b>Audit JSON sent to the server:</b><p id=\"sentJSON\"></p></p><p><b>Audit JSON returned by the server:</b><p id=\"returnJSON\"></p></p><hr>");
};

function uc_psAccountCode(psUnit, psFund, psDept, psAccount, psProgram, psInternal, psProject, psActivity, functionToCall) {
	var psConcat = psUnit+"-"+psFund+"-"+psDept+"-"+psAccount+"-"+psProgram+"-"+psInternal+"-"+psProject+"-"+psActivity;
	var uc_psConcat = uc_JSON.toString(psConcat);
	var psValid = "Not Set";

	if (auditDebug) {
		$('sentJSON').innerHTML = psConcat;
	};

	new ajax('/resource/psAccountCode/uc-psAccountCode.php', {
			postBody: uc_psConcat, onComplete:	function(req){
				if(auditDebug){
					$('returnJSON').innerHTML = req;
				} 
				eval(functionToCall)(req);
			}
		}).request();
}

function uc_psAccountCode_CallBack(callBackValue) {
	alert("This is a test call back, i got: "+callBackValue);
}



var uc_JSON = {
	toString: function(obj){
		var string = [];
		//switch ($type(obj)){
		//var test = Object.prototype.toString.call(obj);
		
		switch (Object.prototype.toString.call(obj)){
			case '[object String]':
				return '"'+obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1')+'"';
			case '[object Array]':
				obj.each(function(ar){
					string.push(uc_JSONaudit.toString(ar));
				});
				return '['+string.join(',')+']';
		/* 	case 'object': */
			default:
				for (var property in obj) string.push('"'+property+'":'+uc_JSONaudit.toString(obj[property]));
				return '{'+string.join(',')+'}';
		}
		return String(obj);
	},

	evaluate: function(str){
		return eval('(' + str + ')');
	}
}



