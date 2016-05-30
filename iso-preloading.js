/*

ISOGEN Preloading Library
Author: Ian Murphy


USE:

All preload elements must have class "iso-preload".
All preload elements must have a preload handler installed: iso.installPreloadClass("classname", lambda-preload-decoder, "dividtoswapto")
All preload elements must have a preload attribute with the id or whatever.
All preload elements must have a preload-class attribute.

For example, all articles are stored in the /articles/ directory.

iso.installPreloadCLass("article", function(name){
	return "/articles/" + name + ".html";
}, "putarticlehere");

<div id="putarticlehere" class="iso-preload" preload="article-name" preload-class="article"></div>

No event handlers, nothing else.  Install your preload class and do some preloading.
\

*/

window.addEventListener('load', 
  function() { 
    iso.profile();
    iso.isoOnLoad();
    
  }, false);


var iso = {

	PARENT: "iso",
	
   allPreElem: [],
	
   cachedPreloadData: {},
	
   preloadingElement: {},
	
   loadToElement:{},
	
   preloadClass: [],

   isoOnLoad: function(){},
	
   customPreloadDecoder: function(str){
		return str;
	},

	
   getPreloadElements: function(){
		iso.allPreElem = document.getElementsByClassName("iso-preload");
		for (var i = iso.allPreElem.length - 1; i >= 0; i--) {
			iso.allPreElem[i].className.replace(/\biso-preload\b/,'');
			iso.allPreElem[i].addEventListener("mouseover", function(){iso.hoverEvent(this)});
			iso.allPreElem[i].addEventListener("click", function(){iso.clickEvent(this)});
		};
	},

	profile: function(){
		var preSize = iso.allPreElem.length;
		this.getPreloadElements();
		console.log("Profiling: Added " + (iso.allPreElem.length - preSize) + " new nodes, total " + iso.allPreElem.length);
	},

	hoverEvent: function(element, onLoadedEvent){
		var pClassInfo = this.preloadClass[element.getAttribute("preload-class")];
		if(pClassInfo == null){ 
			console.error("You must install a preload class using iso.installPreloadClass before preloading can be done.");
			return;
		}
		else{
			var decoder = pClassInfo[0];
			this.loadToElement = document.getElementById(pClassInfo[1]);
			//console.log(this.loadToElement);
			if(onLoadedEvent == null) onLoadedEvent = function(){};
			var rawResource = element.getAttribute("preload");
			var resourceToPreload = decoder(rawResource);
			//console.log(resourceToPreload);
			
			this.preloadingElement = element;
			this.get(resourceToPreload, function(data){
				cachedPreloadData = data;
				console.log(this.cachedPreloadData.length);
				element.setAttribute("loaded", "true");
				onLoadedEvent();
			});
		}

		
	},

	clickEvent: function(element){
		if(element.getAttribute("loaded") == "true"){
			//console.log(this.loadToElement.innerHTML);
			this.loadToElement.innerHTML = cachedPreloadData;
			//console.log(this.cachedPreloadData.length);
		}
		else{
			//console.log(this.loadToElement + "\n" + this.cachedPreloadData);
			this.hoverEvent(element, function(){
				this.loadToElement.innerHTML = this.cachedPreloadData;
			});
		}
		iso.profile();
		
	},

	installPreloadClass: function(classname, decoder, insertid){
		
		this.preloadClass[classname] = new Array(decoder, insertid);
	},
	
	get: function(resource, callback){
		var xmlHttp = new XMLHttpRequest();
    	xmlHttp.onreadystatechange = function() { 
    		console.log("xml: " + xmlHttp.readyState);
        	if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        		//console.log(xmlHttp.responseText);
            	callback(xmlHttp.responseText);
    			
        	}
    	}
    	xmlHttp.open("GET", resource, true); 
    	xmlHttp.send(null);
	},

	onload: function(userdef){
		iso.isoOnLoad = userdef;
		console.log("onload");
	}
}

