/*
 * ab-core
 * Copyright(c) 2006, ARCHIBUS Inc.
 * 
 * 
 */


escapeJSONChar=function escapeJSONChar(c)
{if(c=="\""||c=="\\")return"\\"+c;else if(c=="\b")return"\\b";else if(c=="\f")return"\\f";else if(c=="\n")return"\\n";else if(c=="\r")return"\\r";else if(c=="\t")return"\\t";var hex=c.charCodeAt(0).toString(16);if(hex.length==1)return"\\u000"+hex;else if(hex.length==2)return"\\u00"+hex;else if(hex.length==3)return"\\u0"+hex;else return"\\u"+hex;};escapeJSONString=function escapeJSONString(s)
{var parts=s.split("");for(var i=0;i<parts.length;i++){var c=parts[i];if(c=='"'||c=='\\'||c.charCodeAt(0)<32||c.charCodeAt(0)>=128)
parts[i]=escapeJSONChar(parts[i]);}
return"\""+parts.join("")+"\"";};toJSON=function toJSON(o)
{if(o==null){return"null";}else if(o.constructor==String){return escapeJSONString(o);}else if(o.constructor==Number){return o.toString();}else if(o.constructor==Boolean){return o.toString();}else if(o.constructor==Date){return'{javaClass: "java.util.Date", time: '+o.valueOf()+'}';}else if(o.constructor==Array||typeof(o.length)!='undefined'){var v=[];for(var i=0;i<o.length;i++)v.push(toJSON(o[i]));return"["+v.join(", ")+"]";}else{var v=[];for(attr in o){if(o[attr]==null)v.push("\""+attr+"\": null");else if(typeof o[attr]=="function");else v.push(escapeJSONString(attr)+": "+toJSON(o[attr]));}
return"{"+v.join(", ")+"}";}};(function(){var INTEND="&nbsp;&nbsp;";var NEWLINE="<br/>";var pPr=false;var intendLevel=0;var intend=function(a){if(!pPr)return a;for(var l=0;l<intendLevel;l++){a[a.length]=INTEND;}
return a;};var newline=function(a){if(pPr)a[a.length]=NEWLINE;return a;};var m={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},s={array:function(x){var a=['['],b,f,i,l=x.length,v;a=newline(a);intendLevel++;for(i=0;i<l;i+=1){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';a=newline(a);}
a=intend(a);a[a.length]=v;b=true;}}}
intendLevel--;a=newline(a);a=intend(a);a[a.length]=']';return a.join('');},'boolean':function(x){return String(x);},'null':function(x){return"null";},number:function(x){return isFinite(x)?String(x):'null';},object:function(x,formatedOutput){if(x){if(x instanceof Array){return s.array(x);}
var a=['{'],b,f,i,v;a=newline(a);intendLevel++;for(i in x){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';a=newline(a);}
a=intend(a);a.push(s.string(i),((pPr)?' : ':':'),v);b=true;}}}
intendLevel--;a=newline(a);a=intend(a);a[a.length]='}';return a.join('');}
return'null';},string:function(x){if(/["\\\x00-\x1f]/.test(x)){x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){var c=m[b];if(c){return c;}
c=b.charCodeAt();return'\\u00'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);});}
return'"'+x+'"';}};prettyPrintJson=function(json){pPr=true;if(json.constructor==String){return json;}else if(json.constructor==Array){return s.array(json);}else{return s.object(json);}};})();