var allDescriptors=[{"dependencies":[],"name":"platform","scripts":[]},{"dependencies":["platform"],"name":"toolbox_bootstrap","scripts":[]}];var applicationDescriptor;var _loadedScripts={};function loadResource(url)
{var xhr=new XMLHttpRequest();xhr.open("GET",url,false);try{xhr.send(null);}catch(e){console.error(url+" -> "+new Error().stack);throw e;}
return xhr.status<400?xhr.responseText:"";}
function loadResourcePromise(url)
{return new Promise(load);function load(fulfill,reject)
{var xhr=new XMLHttpRequest();xhr.open("GET",url,true);xhr.onreadystatechange=onreadystatechange;function onreadystatechange(e)
{if(xhr.readyState!==4)
return;if([0,200,304].indexOf(xhr.status)===-1)
reject(new Error("While loading from url "+url+" server responded with a status of "+xhr.status));else
fulfill(e.target.response);}
xhr.send(null);}}
function normalizePath(path)
{if(path.indexOf("..")===-1&&path.indexOf('.')===-1)
return path;var normalizedSegments=[];var segments=path.split("/");for(var i=0;i<segments.length;i++){var segment=segments[i];if(segment===".")
continue;else if(segment==="..")
normalizedSegments.pop();else if(segment)
normalizedSegments.push(segment);}
var normalizedPath=normalizedSegments.join("/");if(normalizedPath[normalizedPath.length-1]==="/")
return normalizedPath;if(path[0]==="/"&&normalizedPath)
normalizedPath="/"+normalizedPath;if((path[path.length-1]==="/")||(segments[segments.length-1]===".")||(segments[segments.length-1]===".."))
normalizedPath=normalizedPath+"/";return normalizedPath;}
function loadScriptsPromise(scriptNames)
{var promises=[];var urls=[];var sources=new Array(scriptNames.length);var scriptToEval=0;for(var i=0;i<scriptNames.length;++i){var scriptName=scriptNames[i];var sourceURL=self._importScriptPathPrefix+scriptName;var schemaIndex=sourceURL.indexOf("://")+3;sourceURL=sourceURL.substring(0,schemaIndex)+normalizePath(sourceURL.substring(schemaIndex));if(_loadedScripts[sourceURL])
continue;urls.push(sourceURL);promises.push(loadResourcePromise(sourceURL).then(scriptSourceLoaded.bind(null,i),scriptSourceLoaded.bind(null,i,undefined)));}
return Promise.all(promises).then(undefined);function scriptSourceLoaded(scriptNumber,scriptSource)
{sources[scriptNumber]=scriptSource||"";while(typeof sources[scriptToEval]!=="undefined"){evaluateScript(urls[scriptToEval],sources[scriptToEval]);++scriptToEval;}}
function evaluateScript(sourceURL,scriptSource)
{_loadedScripts[sourceURL]=true;if(!scriptSource){console.error("Empty response arrived for script '"+sourceURL+"'");return;}
self.eval(scriptSource+"\n//# sourceURL="+sourceURL);}}
(function(){var baseUrl=self.location?self.location.origin+self.location.pathname:"";self._importScriptPathPrefix=baseUrl.substring(0,baseUrl.lastIndexOf("/")+1);})();function Runtime(descriptors,coreModuleNames)
{this._modules=[];this._modulesMap={};this._extensions=[];this._cachedTypeClasses={};this._descriptorsMap={};for(var i=0;i<descriptors.length;++i)
this._registerModule(descriptors[i]);if(coreModuleNames)
this._loadAutoStartModules(coreModuleNames).catch(Runtime._reportError);}
Runtime._queryParamsObject={__proto__:null};Runtime.cachedResources={__proto__:null};Runtime.isReleaseMode=function()
{return!!allDescriptors.length;}
Runtime.startSharedWorker=function(moduleName,workerName)
{if(Runtime.isReleaseMode())
return new SharedWorker(moduleName+"_module.js",workerName);var content=loadResource(moduleName+"/module.json");if(!content)
throw new Error("Worker is not defined: "+moduleName+" "+new Error().stack);var scripts=JSON.parse(content)["scripts"];if(scripts.length!==1)
throw Error("Runtime.startSharedWorker supports modules with only one script!");return new SharedWorker(moduleName+"/"+scripts[0],workerName);}
Runtime.startWorker=function(moduleName)
{if(Runtime.isReleaseMode())
return new Worker(moduleName+"_module.js");var content=loadResource(moduleName+"/module.json");if(!content)
throw new Error("Worker is not defined: "+moduleName+" "+new Error().stack);var message=[];var scripts=JSON.parse(content)["scripts"];for(var i=0;i<scripts.length;++i){var url=self._importScriptPathPrefix+moduleName+"/"+scripts[i];var parts=url.split("://");url=parts.length===1?url:parts[0]+"://"+normalizePath(parts[1]);message.push({source:loadResource(moduleName+"/"+scripts[i]),url:url});}
var loader=function(){self.onmessage=function(event){self.onmessage=null;var scripts=event.data;for(var i=0;i<scripts.length;++i){var source=scripts[i]["source"];self.eval(source+"\n//# sourceURL="+scripts[i]["url"]);}};};var blob=new Blob(["("+loader.toString()+")()\n//# sourceURL="+moduleName],{type:"text/javascript"});var workerURL=window.URL.createObjectURL(blob);try{var worker=new Worker(workerURL);worker.postMessage(message);return worker;}finally{window.URL.revokeObjectURL(workerURL);}}
Runtime.startApplication=function(appName)
{console.timeStamp("Runtime.startApplication");var allDescriptorsByName={};for(var i=0;Runtime.isReleaseMode()&&i<allDescriptors.length;++i){var d=allDescriptors[i];allDescriptorsByName[d["name"]]=d;}
var applicationPromise;if(applicationDescriptor)
applicationPromise=Promise.resolve(applicationDescriptor);else
applicationPromise=loadResourcePromise(appName+".json").then(JSON.parse.bind(JSON));applicationPromise.then(parseModuleDescriptors);function parseModuleDescriptors(configuration)
{var moduleJSONPromises=[];var coreModuleNames=[];for(var i=0;i<configuration.length;++i){var descriptor=configuration[i];if(descriptor["type"]==="worker")
continue;var name=descriptor["name"];var moduleJSON=allDescriptorsByName[name];if(moduleJSON)
moduleJSONPromises.push(Promise.resolve(moduleJSON));else
moduleJSONPromises.push(loadResourcePromise(name+"/module.json").then(JSON.parse.bind(JSON)));if(descriptor["type"]==="autostart")
coreModuleNames.push(name);}
Promise.all(moduleJSONPromises).then(instantiateRuntime).catch(Runtime._reportError);function instantiateRuntime(moduleDescriptors)
{for(var i=0;!Runtime.isReleaseMode()&&i<moduleDescriptors.length;++i)
moduleDescriptors[i]["name"]=configuration[i]["name"];self.runtime=new Runtime(moduleDescriptors,coreModuleNames);}}}
Runtime.queryParam=function(name)
{return Runtime._queryParamsObject[name]||null;}
Runtime._experimentsSetting=function()
{try{return(JSON.parse(self.localStorage&&self.localStorage["experiments"]?self.localStorage["experiments"]:"{}"));}catch(e){console.error("Failed to parse localStorage['experiments']");return{};}}
Runtime._some=function(promises)
{var all=[];var wasRejected=[];for(var i=0;i<promises.length;++i){var handlerFunction=(handler.bind(promises[i],i));all.push(promises[i].catch(handlerFunction));}
return Promise.all(all).then(filterOutFailuresResults);function filterOutFailuresResults(results)
{var filtered=[];for(var i=0;i<results.length;++i){if(!wasRejected[i])
filtered.push(results[i]);}
return filtered;}
function handler(index,e)
{wasRejected[index]=true;console.error(e.stack);}}
Runtime._console=console;Runtime._originalAssert=console.assert;Runtime._assert=function(value,message)
{if(value)
return;Runtime._originalAssert.call(Runtime._console,value,message);}
Runtime._reportError=function(e)
{if(e instanceof Error)
console.error(e.stack);else
console.error(e);}
Runtime.prototype={_registerModule:function(descriptor)
{var module=new Runtime.Module(this,descriptor);this._modules.push(module);this._modulesMap[descriptor["name"]]=module;},loadModulePromise:function(moduleName)
{return this._modulesMap[moduleName]._loadPromise();},_loadAutoStartModules:function(moduleNames)
{var promises=[];for(var i=0;i<moduleNames.length;++i){if(Runtime.isReleaseMode())
this._modulesMap[moduleNames[i]]._loaded=true;else
promises.push(this.loadModulePromise(moduleNames[i]));}
return Promise.all(promises);},_checkExtensionApplicability:function(extension,predicate)
{if(!predicate)
return false;var contextTypes=(extension.descriptor().contextTypes);if(!contextTypes)
return true;for(var i=0;i<contextTypes.length;++i){var contextType=this._resolve(contextTypes[i]);var isMatching=!!contextType&&predicate(contextType);if(isMatching)
return true;}
return false;},isExtensionApplicableToContext:function(extension,context)
{if(!context)
return true;return this._checkExtensionApplicability(extension,isInstanceOf);function isInstanceOf(targetType)
{return context instanceof targetType;}},isExtensionApplicableToContextTypes:function(extension,currentContextTypes)
{if(!extension.descriptor().contextTypes)
return true;return this._checkExtensionApplicability(extension,currentContextTypes?isContextTypeKnown:null);function isContextTypeKnown(targetType)
{return currentContextTypes.has(targetType);}},extensions:function(type,context)
{return this._extensions.filter(filter).sort(orderComparator);function filter(extension)
{if(extension._type!==type&&extension._typeClass()!==type)
return false;var activatorExperiment=extension.descriptor()["experiment"];if(activatorExperiment&&!Runtime.experiments.isEnabled(activatorExperiment))
return false;activatorExperiment=extension._module._descriptor["experiment"];if(activatorExperiment&&!Runtime.experiments.isEnabled(activatorExperiment))
return false;return!context||extension.isApplicable(context);}
function orderComparator(extension1,extension2)
{var order1=extension1.descriptor()["order"]||0;var order2=extension2.descriptor()["order"]||0;return order1-order2;}},extension:function(type,context)
{return this.extensions(type,context)[0]||null;},instancesPromise:function(type,context)
{var extensions=this.extensions(type,context);var promises=[];for(var i=0;i<extensions.length;++i)
promises.push(extensions[i].instancePromise());return Runtime._some(promises);},instancePromise:function(type,context)
{var extension=this.extension(type,context);if(!extension)
return Promise.reject(new Error("No such extension: "+type+" in given context."));return extension.instancePromise();},_resolve:function(typeName)
{if(!this._cachedTypeClasses[typeName]){var path=typeName.split(".");var object=window;for(var i=0;object&&(i<path.length);++i)
object=object[path[i]];if(object)
this._cachedTypeClasses[typeName]=(object);}
return this._cachedTypeClasses[typeName]||null;}}
Runtime.ModuleDescriptor=function()
{this.name;this.extensions;this.dependencies;this.scripts;}
Runtime.ExtensionDescriptor=function()
{this.type;this.className;this.contextTypes;}
Runtime.Module=function(manager,descriptor)
{this._manager=manager;this._descriptor=descriptor;this._name=descriptor.name;this._instanceMap={};var extensions=(descriptor.extensions);for(var i=0;extensions&&i<extensions.length;++i)
this._manager._extensions.push(new Runtime.Extension(this,extensions[i]));this._loaded=false;}
Runtime.Module.prototype={name:function()
{return this._name;},_loadPromise:function()
{if(this._loaded)
return Promise.resolve();if(this._pendingLoadPromise)
return this._pendingLoadPromise;var dependencies=this._descriptor.dependencies;var dependencyPromises=[];for(var i=0;dependencies&&i<dependencies.length;++i)
dependencyPromises.push(this._manager._modulesMap[dependencies[i]]._loadPromise());this._pendingLoadPromise=Promise.all(dependencyPromises).then(this._loadScripts.bind(this)).then(markAsLoaded.bind(this));return this._pendingLoadPromise;function markAsLoaded()
{delete this._pendingLoadPromise;this._loaded=true;}},_loadScripts:function()
{if(!this._descriptor.scripts)
return Promise.resolve(undefined);if(Runtime.isReleaseMode())
return loadScriptsPromise([this._name+"_module.js"]);return loadScriptsPromise(this._descriptor.scripts.map(modularizeURL,this)).catch(Runtime._reportError);function modularizeURL(scriptName)
{return this._name+"/"+scriptName;}},_instance:function(className)
{if(className in this._instanceMap)
return this._instanceMap[className];var constructorFunction=window.eval(className);if(!(constructorFunction instanceof Function)){this._instanceMap[className]=null;return null;}
var instance=new constructorFunction();this._instanceMap[className]=instance;return instance;}}
Runtime.Extension=function(module,descriptor)
{this._module=module;this._descriptor=descriptor;this._type=descriptor.type;this._hasTypeClass=this._type.charAt(0)==="@";this._className=descriptor.className||null;}
Runtime.Extension.prototype={descriptor:function()
{return this._descriptor;},module:function()
{return this._module;},_typeClass:function()
{if(!this._hasTypeClass)
return null;return this._module._manager._resolve(this._type.substring(1));},isApplicable:function(context)
{return this._module._manager.isExtensionApplicableToContext(this,context);},instancePromise:function()
{if(!this._className)
return Promise.reject(new Error("No class name in extension"));var className=this._className;if(this._instance)
return Promise.resolve(this._instance);return this._module._loadPromise().then(constructInstance.bind(this));function constructInstance()
{var result=this._module._instance(className);if(!result)
return Promise.reject("Could not instantiate: "+className);return result;}}}
Runtime.ExperimentsSupport=function()
{this._supportEnabled=Runtime.queryParam("experiments")!==null;this._experiments=[];this._experimentNames={};this._enabledTransiently={};}
Runtime.ExperimentsSupport.prototype={allConfigurableExperiments:function()
{var result=[];for(var i=0;i<this._experiments.length;i++){var experiment=this._experiments[i];if(!this._enabledTransiently[experiment.name])
result.push(experiment);}
return result;},supportEnabled:function()
{return this._supportEnabled;},_setExperimentsSetting:function(value)
{if(!self.localStorage)
return;self.localStorage["experiments"]=JSON.stringify(value);},register:function(experimentName,experimentTitle,hidden)
{Runtime._assert(!this._experimentNames[experimentName],"Duplicate registration of experiment "+experimentName);this._experimentNames[experimentName]=true;this._experiments.push(new Runtime.Experiment(this,experimentName,experimentTitle,!!hidden));},isEnabled:function(experimentName)
{this._checkExperiment(experimentName);if(this._enabledTransiently[experimentName])
return true;if(!this.supportEnabled())
return false;return!!Runtime._experimentsSetting()[experimentName];},setEnabled:function(experimentName,enabled)
{this._checkExperiment(experimentName);var experimentsSetting=Runtime._experimentsSetting();experimentsSetting[experimentName]=enabled;this._setExperimentsSetting(experimentsSetting);},setDefaultExperiments:function(experimentNames)
{for(var i=0;i<experimentNames.length;++i){this._checkExperiment(experimentNames[i]);this._enabledTransiently[experimentNames[i]]=true;}},enableForTest:function(experimentName)
{this._checkExperiment(experimentName);this._enabledTransiently[experimentName]=true;},cleanUpStaleExperiments:function()
{var experimentsSetting=Runtime._experimentsSetting();var cleanedUpExperimentSetting={};for(var i=0;i<this._experiments.length;++i){var experimentName=this._experiments[i].name;if(experimentsSetting[experimentName])
cleanedUpExperimentSetting[experimentName]=true;}
this._setExperimentsSetting(cleanedUpExperimentSetting);},_checkExperiment:function(experimentName)
{Runtime._assert(this._experimentNames[experimentName],"Unknown experiment "+experimentName);}}
Runtime.Experiment=function(experiments,name,title,hidden)
{this.name=name;this.title=title;this.hidden=hidden;this._experiments=experiments;}
Runtime.Experiment.prototype={isEnabled:function()
{return this._experiments.isEnabled(this.name);},setEnabled:function(enabled)
{this._experiments.setEnabled(this.name,enabled);}}
{(function parseQueryParameters()
{var queryParams=location.search;if(!queryParams)
return;var params=queryParams.substring(1).split("&");for(var i=0;i<params.length;++i){var pair=params[i].split("=");Runtime._queryParamsObject[pair[0]]=pair[1];}
var settingsParam=Runtime.queryParam("settings");if(settingsParam){try{var settings=JSON.parse(window.decodeURI(settingsParam));for(var key in settings)
window.localStorage[key]=settings[key];}catch(e){}}})();}
Runtime.experiments=new Runtime.ExperimentsSupport();var runtime;Promise.rejectWithError=function(error)
{return Promise.reject(new Error(error));}
Promise.prototype.thenOrCatch=function(callback)
{return this.then(callback,reject.bind(this));function reject(e)
{this._reportError(e);callback(undefined);}}
Promise.prototype.done=function()
{this.catchAndReport();}
Promise.prototype.catchAndReport=function()
{return this.catch(this._reportError.bind(this));}
Promise.prototype._reportError=function(e)
{if(e instanceof Error)
console.error(e.stack);else
console.error(e);};console=console;console.__originalAssert=console.assert;console.assert=function(value,message)
{if(value)
return;console.__originalAssert(value,message);}
var ArrayLike;Object.isEmpty=function(obj)
{for(var i in obj)
return false;return true;}
Object.values=function(obj)
{var result=Object.keys(obj);var length=result.length;for(var i=0;i<length;++i)
result[i]=obj[result[i]];return result;}
function mod(m,n)
{return((m%n)+n)%n;}
String.prototype.findAll=function(string)
{var matches=[];var i=this.indexOf(string);while(i!==-1){matches.push(i);i=this.indexOf(string,i+string.length);}
return matches;}
String.prototype.lineEndings=function()
{if(!this._lineEndings){this._lineEndings=this.findAll("\n");this._lineEndings.push(this.length);}
return this._lineEndings;}
String.prototype.lineCount=function()
{var lineEndings=this.lineEndings();return lineEndings.length;}
String.prototype.lineAt=function(lineNumber)
{var lineEndings=this.lineEndings();var lineStart=lineNumber>0?lineEndings[lineNumber-1]+1:0;var lineEnd=lineEndings[lineNumber];var lineContent=this.substring(lineStart,lineEnd);if(lineContent.length>0&&lineContent.charAt(lineContent.length-1)==="\r")
lineContent=lineContent.substring(0,lineContent.length-1);return lineContent;}
String.prototype.escapeCharacters=function(chars)
{var foundChar=false;for(var i=0;i<chars.length;++i){if(this.indexOf(chars.charAt(i))!==-1){foundChar=true;break;}}
if(!foundChar)
return String(this);var result="";for(var i=0;i<this.length;++i){if(chars.indexOf(this.charAt(i))!==-1)
result+="\\";result+=this.charAt(i);}
return result;}
String.regexSpecialCharacters=function()
{return"^[]{}()\\.^$*+?|-,";}
String.prototype.escapeForRegExp=function()
{return this.escapeCharacters(String.regexSpecialCharacters());}
String.prototype.escapeHTML=function()
{return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
String.prototype.unescapeHTML=function()
{return this.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#58;/g,":").replace(/&quot;/g,"\"").replace(/&#60;/g,"<").replace(/&#62;/g,">").replace(/&amp;/g,"&");}
String.prototype.collapseWhitespace=function()
{return this.replace(/[\s\xA0]+/g," ");}
String.prototype.trimMiddle=function(maxLength)
{if(this.length<=maxLength)
return String(this);var leftHalf=maxLength>>1;var rightHalf=maxLength-leftHalf-1;return this.substr(0,leftHalf)+"\u2026"+this.substr(this.length-rightHalf,rightHalf);}
String.prototype.trimEnd=function(maxLength)
{if(this.length<=maxLength)
return String(this);return this.substr(0,maxLength-1)+"\u2026";}
String.prototype.trimURL=function(baseURLDomain)
{var result=this.replace(/^(https|http|file):\/\//i,"");if(baseURLDomain)
result=result.replace(new RegExp("^"+baseURLDomain.escapeForRegExp(),"i"),"");return result;}
String.prototype.toTitleCase=function()
{return this.substring(0,1).toUpperCase()+this.substring(1);}
String.prototype.compareTo=function(other)
{if(this>other)
return 1;if(this<other)
return-1;return 0;}
function sanitizeHref(href)
{return href&&href.trim().toLowerCase().startsWith("javascript:")?null:href;}
String.prototype.removeURLFragment=function()
{var fragmentIndex=this.indexOf("#");if(fragmentIndex==-1)
fragmentIndex=this.length;return this.substring(0,fragmentIndex);}
String.prototype.startsWith=function(substring)
{return!this.lastIndexOf(substring,0);}
String.prototype.endsWith=function(substring)
{return this.indexOf(substring,this.length-substring.length)!==-1;}
String.prototype.hashCode=function()
{var result=0;for(var i=0;i<this.length;++i)
result=(result*3+this.charCodeAt(i))|0;return result;}
String.prototype.isDigitAt=function(index)
{var c=this.charCodeAt(index);return 48<=c&&c<=57;}
String.naturalOrderComparator=function(a,b)
{var chunk=/^\d+|^\D+/;var chunka,chunkb,anum,bnum;while(1){if(a){if(!b)
return 1;}else{if(b)
return-1;else
return 0;}
chunka=a.match(chunk)[0];chunkb=b.match(chunk)[0];anum=!isNaN(chunka);bnum=!isNaN(chunkb);if(anum&&!bnum)
return-1;if(bnum&&!anum)
return 1;if(anum&&bnum){var diff=chunka-chunkb;if(diff)
return diff;if(chunka.length!==chunkb.length){if(!+chunka&&!+chunkb)
return chunka.length-chunkb.length;else
return chunkb.length-chunka.length;}}else if(chunka!==chunkb)
return(chunka<chunkb)?-1:1;a=a.substring(chunka.length);b=b.substring(chunkb.length);}}
Number.constrain=function(num,min,max)
{if(num<min)
num=min;else if(num>max)
num=max;return num;}
Number.gcd=function(a,b)
{if(b===0)
return a;else
return Number.gcd(b,a%b);}
Number.toFixedIfFloating=function(value)
{if(!value||isNaN(value))
return value;var number=Number(value);return number%1?number.toFixed(3):String(number);}
Date.prototype.toISO8601Compact=function()
{function leadZero(x)
{return(x>9?"":"0")+x;}
return this.getFullYear()+
leadZero(this.getMonth()+1)+
leadZero(this.getDate())+"T"+
leadZero(this.getHours())+
leadZero(this.getMinutes())+
leadZero(this.getSeconds());}
Date.prototype.toConsoleTime=function()
{function leadZero2(x)
{return(x>9?"":"0")+x;}
function leadZero3(x)
{return(Array(4-x.toString().length)).join('0')+x;}
return this.getFullYear()+"-"+
leadZero2(this.getMonth()+1)+"-"+
leadZero2(this.getDate())+" "+
leadZero2(this.getHours())+":"+
leadZero2(this.getMinutes())+":"+
leadZero2(this.getSeconds())+"."+
leadZero3(this.getMilliseconds());}
Object.defineProperty(Array.prototype,"remove",{value:function(value,firstOnly)
{var index=this.indexOf(value);if(index===-1)
return;if(firstOnly){this.splice(index,1);return;}
for(var i=index+1,n=this.length;i<n;++i){if(this[i]!==value)
this[index++]=this[i];}
this.length=index;}});Object.defineProperty(Array.prototype,"keySet",{value:function()
{var keys={};for(var i=0;i<this.length;++i)
keys[this[i]]=true;return keys;}});Object.defineProperty(Array.prototype,"pushAll",{value:function(array)
{Array.prototype.push.apply(this,array);}});Object.defineProperty(Array.prototype,"rotate",{value:function(index)
{var result=[];for(var i=index;i<index+this.length;++i)
result.push(this[i%this.length]);return result;}});Object.defineProperty(Array.prototype,"sortNumbers",{value:function()
{function numericComparator(a,b)
{return a-b;}
this.sort(numericComparator);}});Object.defineProperty(Uint32Array.prototype,"sort",{value:Array.prototype.sort});(function(){var partition={value:function(comparator,left,right,pivotIndex)
{function swap(array,i1,i2)
{var temp=array[i1];array[i1]=array[i2];array[i2]=temp;}
var pivotValue=this[pivotIndex];swap(this,right,pivotIndex);var storeIndex=left;for(var i=left;i<right;++i){if(comparator(this[i],pivotValue)<0){swap(this,storeIndex,i);++storeIndex;}}
swap(this,right,storeIndex);return storeIndex;}};Object.defineProperty(Array.prototype,"partition",partition);Object.defineProperty(Uint32Array.prototype,"partition",partition);var sortRange={value:function(comparator,leftBound,rightBound,sortWindowLeft,sortWindowRight)
{function quickSortRange(array,comparator,left,right,sortWindowLeft,sortWindowRight)
{if(right<=left)
return;var pivotIndex=Math.floor(Math.random()*(right-left))+left;var pivotNewIndex=array.partition(comparator,left,right,pivotIndex);if(sortWindowLeft<pivotNewIndex)
quickSortRange(array,comparator,left,pivotNewIndex-1,sortWindowLeft,sortWindowRight);if(pivotNewIndex<sortWindowRight)
quickSortRange(array,comparator,pivotNewIndex+1,right,sortWindowLeft,sortWindowRight);}
if(leftBound===0&&rightBound===(this.length-1)&&sortWindowLeft===0&&sortWindowRight>=rightBound)
this.sort(comparator);else
quickSortRange(this,comparator,leftBound,rightBound,sortWindowLeft,sortWindowRight);return this;}}
Object.defineProperty(Array.prototype,"sortRange",sortRange);Object.defineProperty(Uint32Array.prototype,"sortRange",sortRange);})();Object.defineProperty(Array.prototype,"stableSort",{value:function(comparator)
{function defaultComparator(a,b)
{return a<b?-1:(a>b?1:0);}
comparator=comparator||defaultComparator;var indices=new Array(this.length);for(var i=0;i<this.length;++i)
indices[i]=i;var self=this;function indexComparator(a,b)
{var result=comparator(self[a],self[b]);return result?result:a-b;}
indices.sort(indexComparator);for(var i=0;i<this.length;++i){if(indices[i]<0||i===indices[i])
continue;var cyclical=i;var saved=this[i];while(true){var next=indices[cyclical];indices[cyclical]=-1;if(next===i){this[cyclical]=saved;break;}else{this[cyclical]=this[next];cyclical=next;}}}
return this;}});Object.defineProperty(Array.prototype,"qselect",{value:function(k,comparator)
{if(k<0||k>=this.length)
return;if(!comparator)
comparator=function(a,b){return a-b;}
var low=0;var high=this.length-1;for(;;){var pivotPosition=this.partition(comparator,low,high,Math.floor((high+low)/2));if(pivotPosition===k)
return this[k];else if(pivotPosition>k)
high=pivotPosition-1;else
low=pivotPosition+1;}}});Object.defineProperty(Array.prototype,"lowerBound",{value:function(object,comparator,left,right)
{function defaultComparator(a,b)
{return a<b?-1:(a>b?1:0);}
comparator=comparator||defaultComparator;var l=left||0;var r=right!==undefined?right:this.length;while(l<r){var m=(l+r)>>1;if(comparator(object,this[m])>0)
l=m+1;else
r=m;}
return r;}});Object.defineProperty(Array.prototype,"upperBound",{value:function(object,comparator,left,right)
{function defaultComparator(a,b)
{return a<b?-1:(a>b?1:0);}
comparator=comparator||defaultComparator;var l=left||0;var r=right!==undefined?right:this.length;while(l<r){var m=(l+r)>>1;if(comparator(object,this[m])>=0)
l=m+1;else
r=m;}
return r;}});Object.defineProperty(Uint32Array.prototype,"lowerBound",{value:Array.prototype.lowerBound});Object.defineProperty(Uint32Array.prototype,"upperBound",{value:Array.prototype.upperBound});Object.defineProperty(Float64Array.prototype,"lowerBound",{value:Array.prototype.lowerBound});Object.defineProperty(Array.prototype,"binaryIndexOf",{value:function(value,comparator)
{var index=this.lowerBound(value,comparator);return index<this.length&&comparator(value,this[index])===0?index:-1;}});Object.defineProperty(Array.prototype,"select",{value:function(field)
{var result=new Array(this.length);for(var i=0;i<this.length;++i)
result[i]=this[i][field];return result;}});Object.defineProperty(Array.prototype,"peekLast",{value:function()
{return this[this.length-1];}});(function(){function mergeOrIntersect(array1,array2,comparator,mergeNotIntersect)
{var result=[];var i=0;var j=0;while(i<array1.length&&j<array2.length){var compareValue=comparator(array1[i],array2[j]);if(mergeNotIntersect||!compareValue)
result.push(compareValue<=0?array1[i]:array2[j]);if(compareValue<=0)
i++;if(compareValue>=0)
j++;}
if(mergeNotIntersect){while(i<array1.length)
result.push(array1[i++]);while(j<array2.length)
result.push(array2[j++]);}
return result;}
Object.defineProperty(Array.prototype,"intersectOrdered",{value:function(array,comparator)
{return mergeOrIntersect(this,array,comparator,false);}});Object.defineProperty(Array.prototype,"mergeOrdered",{value:function(array,comparator)
{return mergeOrIntersect(this,array,comparator,true);}});}());function insertionIndexForObjectInListSortedByFunction(object,list,comparator,insertionIndexAfter)
{if(insertionIndexAfter)
return list.upperBound(object,comparator);else
return list.lowerBound(object,comparator);}
String.sprintf=function(format,var_arg)
{return String.vsprintf(format,Array.prototype.slice.call(arguments,1));}
String.tokenizeFormatString=function(format,formatters)
{var tokens=[];var substitutionIndex=0;function addStringToken(str)
{tokens.push({type:"string",value:str});}
function addSpecifierToken(specifier,precision,substitutionIndex)
{tokens.push({type:"specifier",specifier:specifier,precision:precision,substitutionIndex:substitutionIndex});}
var index=0;for(var precentIndex=format.indexOf("%",index);precentIndex!==-1;precentIndex=format.indexOf("%",index)){addStringToken(format.substring(index,precentIndex));index=precentIndex+1;if(format[index]==="%"){addStringToken("%");++index;continue;}
if(format.isDigitAt(index)){var number=parseInt(format.substring(index),10);while(format.isDigitAt(index))
++index;if(number>0&&format[index]==="$"){substitutionIndex=(number-1);++index;}}
var precision=-1;if(format[index]==="."){++index;precision=parseInt(format.substring(index),10);if(isNaN(precision))
precision=0;while(format.isDigitAt(index))
++index;}
if(!(format[index]in formatters)){addStringToken(format.substring(precentIndex,index+1));++index;continue;}
addSpecifierToken(format[index],precision,substitutionIndex);++substitutionIndex;++index;}
addStringToken(format.substring(index));return tokens;}
String.standardFormatters={d:function(substitution)
{return!isNaN(substitution)?substitution:0;},f:function(substitution,token)
{if(substitution&&token.precision>-1)
substitution=substitution.toFixed(token.precision);return!isNaN(substitution)?substitution:(token.precision>-1?Number(0).toFixed(token.precision):0);},s:function(substitution)
{return substitution;}}
String.vsprintf=function(format,substitutions)
{return String.format(format,substitutions,String.standardFormatters,"",function(a,b){return a+b;}).formattedResult;}
String.format=function(format,substitutions,formatters,initialValue,append,tokenizedFormat)
{if(!format||!substitutions||!substitutions.length)
return{formattedResult:append(initialValue,format),unusedSubstitutions:substitutions};function prettyFunctionName()
{return"String.format(\""+format+"\", \""+Array.prototype.join.call(substitutions,"\", \"")+"\")";}
function warn(msg)
{console.warn(prettyFunctionName()+": "+msg);}
function error(msg)
{console.error(prettyFunctionName()+": "+msg);}
var result=initialValue;var tokens=tokenizedFormat||String.tokenizeFormatString(format,formatters);var usedSubstitutionIndexes={};for(var i=0;i<tokens.length;++i){var token=tokens[i];if(token.type==="string"){result=append(result,token.value);continue;}
if(token.type!=="specifier"){error("Unknown token type \""+token.type+"\" found.");continue;}
if(token.substitutionIndex>=substitutions.length){error("not enough substitution arguments. Had "+substitutions.length+" but needed "+(token.substitutionIndex+1)+", so substitution was skipped.");result=append(result,"%"+(token.precision>-1?token.precision:"")+token.specifier);continue;}
usedSubstitutionIndexes[token.substitutionIndex]=true;if(!(token.specifier in formatters)){warn("unsupported format character \u201C"+token.specifier+"\u201D. Treating as a string.");result=append(result,substitutions[token.substitutionIndex]);continue;}
result=append(result,formatters[token.specifier](substitutions[token.substitutionIndex],token));}
var unusedSubstitutions=[];for(var i=0;i<substitutions.length;++i){if(i in usedSubstitutionIndexes)
continue;unusedSubstitutions.push(substitutions[i]);}
return{formattedResult:result,unusedSubstitutions:unusedSubstitutions};}
function createSearchRegex(query,caseSensitive,isRegex)
{var regexFlags=caseSensitive?"g":"gi";var regexObject;if(isRegex){try{regexObject=new RegExp(query,regexFlags);}catch(e){}}
if(!regexObject)
regexObject=createPlainTextSearchRegex(query,regexFlags);return regexObject;}
function createPlainTextSearchRegex(query,flags)
{var regexSpecialCharacters=String.regexSpecialCharacters();var regex="";for(var i=0;i<query.length;++i){var c=query.charAt(i);if(regexSpecialCharacters.indexOf(c)!=-1)
regex+="\\";regex+=c;}
return new RegExp(regex,flags||"");}
function countRegexMatches(regex,content)
{var text=content;var result=0;var match;while(text&&(match=regex.exec(text))){if(match[0].length>0)
++result;text=text.substring(match.index+1);}
return result;}
function spacesPadding(spacesCount)
{return Array(spacesCount).join("\u00a0");}
function numberToStringWithSpacesPadding(value,symbolsCount)
{var numberString=value.toString();var paddingLength=Math.max(0,symbolsCount-numberString.length);return spacesPadding(paddingLength)+numberString;}
Array.from=function(iterator)
{var values=[];for(var iteratorValue=iterator.next();!iteratorValue.done;iteratorValue=iterator.next())
values.push(iteratorValue.value);return values;}
Set.fromArray=function(array)
{return new Set(array);}
Set.prototype.valuesArray=function()
{return Array.from(this.values());}
Set.prototype.remove=Set.prototype.delete;Map.prototype.remove=function(key)
{var value=this.get(key);this.delete(key);return value;}
Map.prototype.valuesArray=function()
{return Array.from(this.values());}
Map.prototype.keysArray=function()
{return Array.from(this.keys());}
var StringMultimap=function()
{this._map=new Map();}
StringMultimap.prototype={set:function(key,value)
{var set=this._map.get(key);if(!set){set=new Set();this._map.set(key,set);}
set.add(value);},get:function(key)
{var result=this._map.get(key);if(!result)
result=new Set();return result;},remove:function(key,value)
{var values=this.get(key);values.remove(value);if(!values.size)
this._map.remove(key)},removeAll:function(key)
{this._map.remove(key)},keysArray:function()
{return this._map.keysArray();},valuesArray:function()
{var result=[];var keys=this.keysArray();for(var i=0;i<keys.length;++i)
result.pushAll(this.get(keys[i]).valuesArray());return result;},clear:function()
{this._map.clear();}}
function loadXHR(url)
{return new Promise(load);function load(successCallback,failureCallback)
{function onReadyStateChanged()
{if(xhr.readyState!==XMLHttpRequest.DONE)
return;if(xhr.status!==200){xhr.onreadystatechange=null;failureCallback(new Error(xhr.status));return;}
xhr.onreadystatechange=null;successCallback(xhr.responseText);}
var xhr=new XMLHttpRequest();xhr.open("GET",url,true);xhr.onreadystatechange=onReadyStateChanged;xhr.send(null);}}
function CallbackBarrier()
{this._pendingIncomingCallbacksCount=0;}
CallbackBarrier.prototype={createCallback:function(userCallback)
{console.assert(!this._outgoingCallback,"CallbackBarrier.createCallback() is called after CallbackBarrier.callWhenDone()");++this._pendingIncomingCallbacksCount;return this._incomingCallback.bind(this,userCallback);},callWhenDone:function(callback)
{console.assert(!this._outgoingCallback,"CallbackBarrier.callWhenDone() is called multiple times");this._outgoingCallback=callback;if(!this._pendingIncomingCallbacksCount)
this._outgoingCallback();},_incomingCallback:function(userCallback)
{console.assert(this._pendingIncomingCallbacksCount>0);if(userCallback){var args=Array.prototype.slice.call(arguments,1);userCallback.apply(null,args);}
if(!--this._pendingIncomingCallbacksCount&&this._outgoingCallback)
this._outgoingCallback();}}
function suppressUnused(value)
{}
self.setImmediate=function(callback)
{Promise.resolve().then(callback).done();return 0;};Node.prototype.rangeOfWord=function(offset,stopCharacters,stayWithinNode,direction)
{var startNode;var startOffset=0;var endNode;var endOffset=0;if(!stayWithinNode)
stayWithinNode=this;if(!direction||direction==="backward"||direction==="both"){var node=this;while(node){if(node===stayWithinNode){if(!startNode)
startNode=stayWithinNode;break;}
if(node.nodeType===Node.TEXT_NODE){var start=(node===this?(offset-1):(node.nodeValue.length-1));for(var i=start;i>=0;--i){if(stopCharacters.indexOf(node.nodeValue[i])!==-1){startNode=node;startOffset=i+1;break;}}}
if(startNode)
break;node=node.traversePreviousNode(stayWithinNode);}
if(!startNode){startNode=stayWithinNode;startOffset=0;}}else{startNode=this;startOffset=offset;}
if(!direction||direction==="forward"||direction==="both"){node=this;while(node){if(node===stayWithinNode){if(!endNode)
endNode=stayWithinNode;break;}
if(node.nodeType===Node.TEXT_NODE){var start=(node===this?offset:0);for(var i=start;i<node.nodeValue.length;++i){if(stopCharacters.indexOf(node.nodeValue[i])!==-1){endNode=node;endOffset=i;break;}}}
if(endNode)
break;node=node.traverseNextNode(stayWithinNode);}
if(!endNode){endNode=stayWithinNode;endOffset=stayWithinNode.nodeType===Node.TEXT_NODE?stayWithinNode.nodeValue.length:stayWithinNode.childNodes.length;}}else{endNode=this;endOffset=offset;}
var result=this.ownerDocument.createRange();result.setStart(startNode,startOffset);result.setEnd(endNode,endOffset);return result;}
Node.prototype.traverseNextTextNode=function(stayWithin)
{var node=this.traverseNextNode(stayWithin);if(!node)
return null;while(node&&node.nodeType!==Node.TEXT_NODE)
node=node.traverseNextNode(stayWithin);return node;}
Node.prototype.rangeBoundaryForOffset=function(offset)
{var node=this.traverseNextTextNode(this);while(node&&offset>node.nodeValue.length){offset-=node.nodeValue.length;node=node.traverseNextTextNode(this);}
if(!node)
return{container:this,offset:0};return{container:node,offset:offset};}
Element.prototype.positionAt=function(x,y,relativeTo)
{var shift={x:0,y:0};if(relativeTo)
shift=relativeTo.boxInWindow(this.ownerDocument.defaultView);if(typeof x==="number")
this.style.setProperty("left",(shift.x+x)+"px");else
this.style.removeProperty("left");if(typeof y==="number")
this.style.setProperty("top",(shift.y+y)+"px");else
this.style.removeProperty("top");}
Element.prototype.isScrolledToBottom=function()
{return Math.abs(this.scrollTop+this.clientHeight-this.scrollHeight)<=1;}
function removeSubsequentNodes(fromNode,toNode)
{for(var node=fromNode;node&&node!==toNode;){var nodeToRemove=node;node=node.nextSibling;nodeToRemove.remove();}}
Element.prototype.containsEventPoint=function(event)
{var box=this.getBoundingClientRect();return box.left<event.x&&event.x<box.right&&box.top<event.y&&event.y<box.bottom;}
Node.prototype.enclosingNodeOrSelfWithNodeNameInArray=function(nameArray)
{for(var node=this;node&&node!==this.ownerDocument;node=node.parentNodeOrShadowHost()){for(var i=0;i<nameArray.length;++i){if(node.nodeName.toLowerCase()===nameArray[i].toLowerCase())
return node;}}
return null;}
Node.prototype.enclosingNodeOrSelfWithNodeName=function(nodeName)
{return this.enclosingNodeOrSelfWithNodeNameInArray([nodeName]);}
Node.prototype.enclosingNodeOrSelfWithClass=function(className,stayWithin)
{for(var node=this;node&&node!==stayWithin&&node!==this.ownerDocument;node=node.parentNodeOrShadowHost()){if(node.nodeType===Node.ELEMENT_NODE&&node.classList.contains(className))
return(node);}
return null;}
Node.prototype.parentElementOrShadowHost=function()
{var node=this.parentNode;if(!node)
return null;if(node.nodeType===Node.ELEMENT_NODE)
return(node);if(node.nodeType===Node.DOCUMENT_FRAGMENT_NODE)
return(node.host);return null;}
Node.prototype.parentNodeOrShadowHost=function()
{return this.parentNode||this.host||null;}
Node.prototype.window=function()
{return this.ownerDocument.defaultView;}
Element.prototype.query=function(query)
{return this.ownerDocument.evaluate(query,this,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;}
Element.prototype.removeChildren=function()
{if(this.firstChild)
this.textContent="";}
Element.prototype.isInsertionCaretInside=function()
{var selection=window.getSelection();if(!selection.rangeCount||!selection.isCollapsed)
return false;var selectionRange=selection.getRangeAt(0);return selectionRange.startContainer.isSelfOrDescendant(this);}
function createElement(tagName)
{return document.createElement(tagName);}
function createTextNode(data)
{return document.createTextNode(data);}
Document.prototype.createElementWithClass=function(elementName,className)
{var element=this.createElement(elementName);if(className)
element.className=className;return element;}
function createElementWithClass(elementName,className)
{return document.createElementWithClass(elementName,className);}
function createDocumentFragment()
{return document.createDocumentFragment();}
Element.prototype.createChild=function(elementName,className)
{var element=this.ownerDocument.createElementWithClass(elementName,className);this.appendChild(element);return element;}
DocumentFragment.prototype.createChild=Element.prototype.createChild;Element.prototype.createTextChild=function(text)
{var element=this.ownerDocument.createTextNode(text);this.appendChild(element);return element;}
DocumentFragment.prototype.createTextChild=Element.prototype.createTextChild;Element.prototype.createTextChildren=function(var_args)
{for(var i=0,n=arguments.length;i<n;++i)
this.createTextChild(arguments[i]);}
DocumentFragment.prototype.createTextChildren=Element.prototype.createTextChildren;Element.prototype.appendChildren=function(var_args)
{for(var i=0,n=arguments.length;i<n;++i)
this.appendChild(arguments[i]);}
Element.prototype.totalOffsetLeft=function()
{return this.totalOffset().left;}
Element.prototype.totalOffsetTop=function()
{return this.totalOffset().top;}
Element.prototype.totalOffset=function()
{var rect=this.getBoundingClientRect();return{left:rect.left,top:rect.top};}
Element.prototype.scrollOffset=function()
{var curLeft=0;var curTop=0;for(var element=this;element;element=element.scrollParent){curLeft+=element.scrollLeft;curTop+=element.scrollTop;}
return{left:curLeft,top:curTop};}
function AnchorBox(x,y,width,height)
{this.x=x||0;this.y=y||0;this.width=width||0;this.height=height||0;}
AnchorBox.prototype.relativeTo=function(box)
{return new AnchorBox(this.x-box.x,this.y-box.y,this.width,this.height);}
AnchorBox.prototype.relativeToElement=function(element)
{return this.relativeTo(element.boxInWindow(element.ownerDocument.defaultView));}
AnchorBox.prototype.equals=function(anchorBox)
{return!!anchorBox&&this.x===anchorBox.x&&this.y===anchorBox.y&&this.width===anchorBox.width&&this.height===anchorBox.height;}
Element.prototype.offsetRelativeToWindow=function(targetWindow)
{var elementOffset=new AnchorBox();var curElement=this;var curWindow=this.ownerDocument.defaultView;while(curWindow&&curElement){elementOffset.x+=curElement.totalOffsetLeft();elementOffset.y+=curElement.totalOffsetTop();if(curWindow===targetWindow)
break;curElement=curWindow.frameElement;curWindow=curWindow.parent;}
return elementOffset;}
Element.prototype.boxInWindow=function(targetWindow)
{targetWindow=targetWindow||this.ownerDocument.defaultView;var anchorBox=this.offsetRelativeToWindow(window);anchorBox.width=Math.min(this.offsetWidth,window.innerWidth-anchorBox.x);anchorBox.height=Math.min(this.offsetHeight,window.innerHeight-anchorBox.y);return anchorBox;}
Element.prototype.setTextAndTitle=function(text)
{this.textContent=text;this.title=text;}
KeyboardEvent.prototype.__defineGetter__("data",function()
{switch(this.type){case"keypress":if(!this.ctrlKey&&!this.metaKey)
return String.fromCharCode(this.charCode);else
return"";case"keydown":case"keyup":if(!this.ctrlKey&&!this.metaKey&&!this.altKey)
return String.fromCharCode(this.which);else
return"";}});Event.prototype.consume=function(preventDefault)
{this.stopImmediatePropagation();if(preventDefault)
this.preventDefault();this.handled=true;}
Text.prototype.select=function(start,end)
{start=start||0;end=end||this.textContent.length;if(start<0)
start=end+start;var selection=this.ownerDocument.defaultView.getSelection();selection.removeAllRanges();var range=this.ownerDocument.createRange();range.setStart(this,start);range.setEnd(this,end);selection.addRange(range);return this;}
Element.prototype.selectionLeftOffset=function()
{var selection=window.getSelection();if(!selection.containsNode(this,true))
return null;var leftOffset=selection.anchorOffset;var node=selection.anchorNode;while(node!==this){while(node.previousSibling){node=node.previousSibling;leftOffset+=node.textContent.length;}
node=node.parentNodeOrShadowHost();}
return leftOffset;}
Node.prototype.deepTextContent=function()
{var node=this.traverseNextTextNode(this);var result=[];var nonTextTags={"STYLE":1,"SCRIPT":1};while(node){if(!nonTextTags[node.parentElement.nodeName])
result.push(node.textContent);node=node.traverseNextTextNode(this);}
return result.join("");}
Node.prototype.isAncestor=function(node)
{if(!node)
return false;var currentNode=node.parentNodeOrShadowHost();while(currentNode){if(this===currentNode)
return true;currentNode=currentNode.parentNodeOrShadowHost();}
return false;}
Node.prototype.isDescendant=function(descendant)
{return!!descendant&&descendant.isAncestor(this);}
Node.prototype.isSelfOrAncestor=function(node)
{return!!node&&(node===this||this.isAncestor(node));}
Node.prototype.isSelfOrDescendant=function(node)
{return!!node&&(node===this||this.isDescendant(node));}
Node.prototype.traverseNextNode=function(stayWithin)
{if(this.firstChild)
return this.firstChild;if(this.shadowRoot)
return this.shadowRoot;if(stayWithin&&this===stayWithin)
return null;var node=this.nextSibling;if(node)
return node;node=this;while(node&&!node.nextSibling&&(!stayWithin||!node.parentNodeOrShadowHost()||node.parentNodeOrShadowHost()!==stayWithin))
node=node.parentNodeOrShadowHost();if(!node)
return null;return node.nextSibling;}
Node.prototype.traversePreviousNode=function(stayWithin)
{if(stayWithin&&this===stayWithin)
return null;var node=this.previousSibling;while(node&&node.lastChild)
node=node.lastChild;if(node)
return node;return this.parentNodeOrShadowHost();}
Node.prototype.setTextContentTruncatedIfNeeded=function(text,placeholder)
{const maxTextContentLength=65535;if(typeof text==="string"&&text.length>maxTextContentLength){this.textContent=typeof placeholder==="string"?placeholder:text.trimEnd(maxTextContentLength);return true;}
this.textContent=text;return false;}
Event.prototype.deepElementFromPoint=function()
{var node=this.target;while(node&&node.nodeType!==Node.DOCUMENT_FRAGMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE)
node=node.parentNode;if(!node)
return null;node=node.elementFromPoint(this.pageX,this.pageY);while(node&&node.shadowRoot)
node=node.shadowRoot.elementFromPoint(this.pageX,this.pageY);return node;}
Document.prototype.deepElementFromPoint=function(x,y)
{var node=this.elementFromPoint(x,y);while(node&&node.shadowRoot)
node=node.shadowRoot.elementFromPoint(x,y);return node;}
function isEnterKey(event){return event.keyCode!==229&&event.key==="Enter";}
function consumeEvent(e)
{e.consume();};WebInspector={};WebInspector.addExtensions=function(){};(function()
{function toolboxLoaded()
{if(!window.opener)
return;window.opener.WebInspector["app"]["toolboxLoaded"](document);}
function windowLoaded()
{window.removeEventListener("DOMContentLoaded",windowLoaded,false);toolboxLoaded();}
function initToolbox()
{if(document.readyState==="complete")
toolboxLoaded();else
window.addEventListener("DOMContentLoaded",windowLoaded,false);}
initToolbox();})();;applicationDescriptor=[{"type":"autostart","name":"platform"},{"type":"autostart","name":"toolbox_bootstrap"}];Runtime.startApplication("toolbox");