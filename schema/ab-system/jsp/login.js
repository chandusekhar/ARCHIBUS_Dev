/************************************************
	login.js
	used by login.xsl to handle login form
 ************************************************/
//this variable is for user's selected project name
var strSelectedProjectName = "HQ-Sybase-WebEdition";
//this is for Guest's userId
//which will be overwritten in login.xsl
var strGuestUserId = "GUEST";

//used by new opened window for look up password in ab-lookup-password.js
var strUserId = "";
var key = "0@1Z2y3X4^5w6*7=8-9+";




function onLogin(f)
{
	//var strXML	= "";
var uName = f.vName.value;
var pWord = f.vPassword.value
				userID = doSecure(uName);
				userPWD = doSecure(pWord);
				//alert(userID);
				strXML = generatingXMLDataString(f.hid.value, strSelectedProjectName,userID,userPWD);
//alert(strXML);

	//check if strXML is empty, if not, send request to server
	//if(strXML != "")
	//{
		sendingDataFromHiddenForm("", strXML, "", "", false,"");
	//}

}




//forming xml data string to be sent to server
function generatingXMLDataString(strSerialized, projectName,userID,userPWD)
{
	var strXML  = "";
	var strData = "";
	if(strSerialized != "")
	{
		//calling setSerializedInsertingDataVariables() in
		//common.js to set up related JS variables in common.js
		//strSerializedStartTag, strSerializedCloseTag,
		//strSerializedInsertingDataFirstPart,strSerializedInsertingDataRestPart	
		setSerializedInsertingDataVariables(strSerialized);
		//strData =  strSerializedStartTag + 'records' + strSerializedCloseTag;
		strData =  strData + strSerializedStartTag + 'record ';
		strData =  strData + ' login.projectName="' + projectName + '" ';
		//if(userID != "")
			strData =  strData + ' login.userId="' + userID + '" ';
		//if(userPWD != "")
			strData =  strData + ' login.password="' + userPWD + '" ';

		strData =  strData + ' /' + strSerializedCloseTag;
		//strData =  strData + strSerializedStartTag + '/records' + strSerializedCloseTag;
		strXML = strSerializedInsertingDataFirstPart + strData + strSerializedInsertingDataRestPart;
	}
	return strXML;
}




//////////////////////////////////////////////////////////


function permutationGenerator(nNumElements) {
this.nNumElements     = nNumElements;
this.antranspositions = new Array;
var k = 0;
for (i = 0; i < nNumElements - 1; i++)
for (j = i + 1; j < nNumElements; j++)
this.antranspositions[ k++ ] = ( i << 8 ) | j;
// keep two positions as lo and hi byte!
this.nNumtranspositions = k;
this.fromCycle = permutationGenerator_fromCycle;
}
function permutationGenerator_fromCycle(anCycle) {
var anpermutation = new Array(this.nNumElements);
for (var i = 0; i < this.nNumElements; i++) anpermutation[i] = i;
for (var i = 0; i < anCycle.length; i++) {
var nT = this.antranspositions[anCycle[i]];
var n1 = nT & 255;
var n2 = (nT >> 8) & 255;
nT = anpermutation[n1];
anpermutation[n1] = anpermutation[n2];
anpermutation[n2] = nT;
}
return anpermutation;
}
function password(strpasswd) {
this.strpasswd = strpasswd;
this.getHashValue   = password_getHashValue;
this.getpermutation = password_getpermutation;
}
function password_getHashValue() {
var m = 907633409;
var a = 65599;
var h = 0;
for (var i = 0; i < this.strpasswd.length; i++) 
h = (h % m) * a + this.strpasswd.charCodeAt(i);
return h;
}
function password_getpermutation() {
var nNUMELEMENTS = 4;
var nCYCLELENGTH = 9;
pg = new permutationGenerator(nNUMELEMENTS);
var anCycle = new Array(nCYCLELENGTH);
var npred   = this.getHashValue();
for (var i = 0; i < nCYCLELENGTH; i++) {
npred = 11 * npred + 11;
anCycle[i] = npred % pg.nNumtranspositions;
}
return pg.fromCycle(anCycle);
}

function SecureContext(strText, strSignature, bEscape) {
this.strSIGNATURE = strSignature || '';
this.bESCApE      = bEscape || false;
this.strText = strText;
this.escape        = SecureContext_escape;
this.unescape      = SecureContext_unescape;
this.transliterate = SecureContext_transliterate;
this.encypher      = SecureContext_encypher;
this.decypher      = SecureContext_decypher;
this.sign          = SecureContext_sign;
this.unsign        = SecureContext_unsign;
this.secure   = SecureContext_secure;
this.unsecure = SecureContext_unsecure; 

}
function SecureContext_escape(strToEscape) {
var strEscaped = '';
for (var i = 0; i < strToEscape.length; i++) {
var chT = strToEscape.charAt( i );
switch(chT) {
case '\r': strEscaped += '\\r'; break;
case '\n': strEscaped += '\\n'; break;
case '\\': strEscaped += '\\\\'; break;
default: strEscaped += chT;
   }
}
return strEscaped;
}
function SecureContext_unescape(strToUnescape) {
var strUnescaped = '';
var i = 0;
while (i < strToUnescape.length) {
var chT = strToUnescape.charAt(i++);
if ('\\' == chT) {
chT = strToUnescape.charAt( i++ );
switch( chT ) {
case 'r': strUnescaped += '\r'; break;
case 'n': strUnescaped += '\n'; break;
case '\\': strUnescaped += '\\'; break;
default: // not possible
   }
}
else strUnescaped += chT;
}
return strUnescaped;
}
function SecureContext_transliterate(btransliterate) {
var strDest = '';

var nTextIter  = 0;
var nTexttrail = 0;

while (nTextIter < this.strText.length) {
var strRun = '';
var cSkipped   = 0;
while (cSkipped < 7 && nTextIter < this.strText.length) {
var chT = this.strText.charAt(nTextIter++);
if (-1 == strRun.indexOf(chT)) {
strRun += chT;
cSkipped = 0;
}
else cSkipped++;
}
while (nTexttrail < nTextIter) {
var nRunIdx = strRun.indexOf(this.strText.charAt(nTexttrail++));
if (btransliterate) {
nRunIdx++
if (nRunIdx == strRun.length) nRunIdx = 0;
}
else {
nRunIdx--;
if (nRunIdx == -1) nRunIdx += strRun.length;
}
strDest += strRun.charAt(nRunIdx);
   }
}
this.strText = strDest;
}
function SecureContext_encypher(anperm) {
var strEncyph = '';
var nCols     = anperm.length;
var nRows     = this.strText.length / nCols;
for (var i = 0; i < nCols; i++) {
var k = anperm[ i ];
for (var j = 0; j < nRows; j++) {
strEncyph += this.strText.charAt(k);
k         += nCols;
   }
}
this.strText = strEncyph;
}
function SecureContext_decypher(anperm) {
var nRows    = anperm.length;
var nCols    = this.strText.length / nRows;
var anRowOfs = new Array;
for (var i = 0 ; i < nRows; i++) anRowOfs[ anperm[ i ] ] = i * nCols;
var strplain = '';
for (var i = 0; i < nCols; i++) {
for (var j = 0; j < nRows; j++)
strplain += this.strText.charAt(anRowOfs[ j ] + i);
}
this.strText = strplain;
}
function SecureContext_sign(nCols) {
if (this.bESCApE) {
this.strText      = this.escape(this.strText);
this.strSIGNATURE = this.escape(this.strSIGNATURE);
}
var nTextLen     = this.strText.length + this.strSIGNATURE.length;
var nMissingCols = nCols - (nTextLen % nCols);
var strpadding   = '';  
if (nMissingCols < nCols)
for (var i = 0; i < nMissingCols; i++) strpadding += ' ';
var x = this.strText.length;
this.strText +=  strpadding + this.strSIGNATURE;
}
function SecureContext_unsign(nCols) {
if (this.bESCApE) {
this.strText      = this.unescape(this.strText);
this.strSIGNATURE = this.unescape(this.strSIGNATURE);
}
if ('' == this.strSIGNATURE) return true;
var nTextLen = this.strText.lastIndexOf(this.strSIGNATURE);
if (-1 == nTextLen) return false;
this.strText = this.strText.substr(0, nTextLen);
return true;
}
function SecureContext_secure(strpasswd) {
var passwd = new password(strpasswd);
var anperm   = passwd.getpermutation()
this.sign(anperm.length);
this.transliterate(true);
this.encypher(anperm);
}
function SecureContext_unsecure(strpasswd) {
var passwd = new password(strpasswd);
var anperm = passwd.getpermutation()
this.decypher(anperm);
this.transliterate(false);
return this.unsign(anperm.length);
}

function doSecure(str){
	//alert("in doSecure");
var sc = new SecureContext(str.toUpperCase(), key, false);
sc.secure(key);
//Handle the special characters
var tmp = sc.strText;
tmp = tmp.replace(/&/g, '&amp;');
tmp = tmp.replace(/>/g, "&gt;");
tmp = tmp.replace(/</g, "&lt;");
tmp = tmp.replace(/\'/g, "&apos;");
tmp = tmp.replace(/\"/g, '&quot;');
return tmp;

}
