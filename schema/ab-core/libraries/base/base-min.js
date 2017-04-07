/*
 * ab-core
 * Copyright(c) 2006, ARCHIBUS Inc.
 * 
 * 
 */


function Base(){};Base.version="1.0.1";Base.prototype={extend:function(source,value){var extend=Base.prototype.extend;if(arguments.length==2){var ancestor=this[source];if((ancestor instanceof Function)&&(value instanceof Function)&&ancestor.valueOf()!=value.valueOf()&&/\binherit\b/.test(value)){var method=value;value=function(){var previous=this.inherit;this.inherit=ancestor;var returnValue=method.apply(this,arguments);this.inherit=previous;return returnValue;};value.valueOf=function(){return method;};value.toString=function(){return String(method);};}
return this[source]=value;}else if(source){var _prototype={toSource:null};var _protected=["toString","valueOf"];if(Base._prototyping)_protected[2]="constructor";for(var i=0;(name=_protected[i]);i++){if(source[name]!=_prototype[name]){extend.call(this,name,source[name]);}}
for(var name in source){if(!_prototype[name]){extend.call(this,name,source[name]);}}}
return this;},inherit:function(){}};Base.extend=function(_instance,_static){var extend=Base.prototype.extend;if(!_instance)_instance={};if(_instance.constructor==Object){_instance.constructor=new Function;}
Base._prototyping=true;var _prototype=new this;extend.call(_prototype,_instance);var constructor=_prototype.constructor;_prototype.constructor=this;delete Base._prototyping;var klass=function(){if(!Base._prototyping)constructor.apply(this,arguments);this.constructor=klass;};klass.prototype=_prototype;klass.extend=this.extend;klass.toString=function(){return String(constructor);};extend.call(klass,_static);var object=constructor?klass:_prototype;if(object.init instanceof Function)object.init();return object;};