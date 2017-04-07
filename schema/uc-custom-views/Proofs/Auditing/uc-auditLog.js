/* *****************************************************************************
This script require two external JS files. 
- captureDOMelements.js
	A file that runs though all DOM elements found on the page and returns
	an XML document of the elements name and value.
	
- mootools.js
	A modified (i think) mootools.js core file found http://www.solutoire.com/experiments/mootools/json_ex1.html

And two external PHP files.
- JSON.php
	A packaged file that setups the JSON call and formats the data.
	
- uc-auditLog.php
	The page that processes the JSON data (inserts it into a database?) and
	replies (if necessary, not typically in this case).

	
This collection of files capture the current page AXVW name and sends the page name along with the
Archibus user id (passed from the AXVW) and the XML document of elements to uc-auditLog.php file
where this data is logged in a database for audit purpouses.

To run this, include this script only and call the main function: 
  uc_auditPage( userName );

To see what is sent to the server and what SQL the server executes turn auditDebug =1

Corey Kaye
2009-06-06
****************************************************************************** */

var auditDebug = 1;


document.write("<script type=\"text/javascript\" src=\"/auditing/captureDOMelements.js\"></script>");
document.write("<script type=\"text/javascript\" src=\"/auditing/mootools.js\"></script>");
if (auditDebug) {
	document.write("<hr><h3>DEBUG ON!</h3><p><b>Audit JSON sent to the server:</b><p id=\"sentJSON\"></p></p><p><b>Audit JSON returned by the server:</b><p id=\"returnJSON\"></p></p><hr>");
}

function uc_auditPage(workSpaceUser) {
	var sPage = window.location.pathname;
	sPage = sPage.substring(sPage.lastIndexOf('/') + 1);
	sPage = sPage.substring(sPage.indexOf('?'));

	var uc_package = new Object();
	uc_package.userid = workSpaceUser;
	uc_package.page = sPage;
	uc_package.audit = uc_captureDOMelements();

	var uc_auditString = uc_JSONaudit.toString(uc_package);


	if (auditDebug) {
		var temp = uc_auditString.replace(/</g,"&lt;");
		temp = temp.replace(/>/g,"&gt;");
		temp = temp.replace(/&lt;element/g,"<br/>&lt;element");
		$('sentJSON').innerHTML = temp;
	}

	new ajax('/auditing/uc-auditLog.php', {postBody: uc_auditString, onComplete: function(req){if(auditDebug){$('returnJSON').innerHTML = req;}}}).request();
	
}

var uc_JSONaudit = {
	toString: function(obj){
		var string = [];
		switch ($type(obj)){
			case 'string':
				return '"'+obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1')+'"';
			case 'array':
				obj.each(function(ar){
					string.push(uc_JSONaudit.toString(ar));
				});
				return '['+string.join(',')+']';
			case 'object':
				for (var property in obj) string.push('"'+property+'":'+uc_JSONaudit.toString(obj[property]));
				return '{'+string.join(',')+'}';
		}
		return String(obj);
	},

	evaluate: function(str){
		return eval('(' + str + ')');
	}
}



