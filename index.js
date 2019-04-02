/* App bootstrap */
	(function(meta)
	{
		if(!meta) throw "App bootstrap failed: config missing.";

		else
		{
			var net = new XMLHttpRequest;
			meta = meta.getAttribute("content");

			net.addEventListener("loadend", function(event)
			{
				switch(net.status)
				{
					case 200:
						try
						{
							window.App = {
								config: JSON.parse(net.response),
								race: []
							};

							App.config.path = meta;
						}

						catch(error)
						{
							throw "App bootstrap failed: config JSON is malformed or contains invalid syntax.";
						}

						break;

					case 0:
						throw "App bootstrap failed: client offline.";

						break;

					default:
						throw "App bootstrap failed: network error (" + net.status + ").";

						break;
				}
			});

			net.open("GET", meta, true);
			net.send();
		}
	})(document.querySelector("meta[name='config'][content]"));

/* Prototype Updates & Polyfills */
	/* CustomEvent() */
	/* Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent */
		(function()
		{
			if(typeof window.CustomEvent === "function") return false;

			function CustomEvent(event, params)
			{
				params = params || {
					bubbles: false, 
					cancelable: false,
					detail: undefined
				};

				var evt = document.createEvent("CustomEvent");

				evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

				return evt;
			}

			CustomEvent.prototype = window.Event.prototype;

			window.CustomEvent = CustomEvent;
		})();

	/* Window.ScrollX / Window.ScrollY */
	/* Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX, https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY */
		if(Window && (!Window.prototype.scrollY || !Window.prototype.scrollX))
		{
			if(Window && !Window.prototype.scrollY) window.scrollY = window.pageYOffset || document.documentElement.scrollTop;
			if(Window && !Window.prototype.scrollX) window.scrollX = window.pageXOffset || document.documentElement.scrollLeft;
		}

	/* Array.forEach() */
	/* Documentation: //developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach */
		if(!Array.prototype.forEach) Array.prototype.forEach = function(callback)
		{
			var T, i;

			if(this == null) throw new TypeError("this is null or not defined");

			var Obj = Object(this);
			var len = Obj.length >>> 0;

			if(typeof callback !== "function") throw new TypeError(callback + " is not a function");

			if(arguments.length > 1) T = arguments[1];

			i = 0;

			while(i < len)
			{
				var iValue;

				if(i in Obj)
				{
					iValue = Obj[i];

					callback.call(T, iValue, i, Obj);
				}

				i++;
			}
		};

	/* Array.extend() */
	/* Non-Standard: Allows two objects to be merged, with duplicate overwriting */
	/* Example Usage: a = a.extend(b) */
		Object.prototype.extend = function()
		{
			var a = this,
			b = false,
			i = 0,
			c = arguments.length;

			if(Object.prototype.toString.call(arguments[0]) === "[object Boolean]")
			{
				b = arguments[0];

				i++;
			}

			var d = function(e)
			{
				for(var f in e) if(Object.prototype.hasOwnProperty.call(e, f)) a[f] = (b && Object.prototype.toString.call(e[f]) === "[object Object]") ? __extend(true, a[f], e[f]) : e[f];
			};

			for(; i < c; i++)
			{
				var e = arguments[i];

				d(e);
			}

			return a;
		};

	/* Array.last() */
	/* Non-Standard: Returns the last item of an array */
	/* Example Usage: b = a.last() */
		Array.prototype.last = function()
		{
			return (this[this.length - 1]) ? this[this.length - 1] : null;
		};

	/* Array.remove() */
	/* Non-Standard: Removes an item from an array via direct reference. */
	/* Example Usage: 
		var x = ["a","b","c"];
		x[0].remove();
	*/
		Array.prototype.remove = function()
		{
			var s, 
			n,
			a = arguments;
			var l = a.length;

			while (l && this.length)
			{
				s = a[--l];

				while((n = this.indexOf(s)) !== -1) this.splice(n, 1);
			}

			return this;
		};

	/* NodeList.forEach() */
	/* Documentation: https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach */
		if(typeof NodeList.prototype.forEach !== "function") NodeList.prototype.forEach = Array.prototype.forEach;

	/* Object.forEach() */
	/* Non-Standard: Works exactly the same as Array.forEach, just for Objects. */
		if(!Object.prototype.forEach) Object.defineProperty(Object.prototype, "forEach", {
			value: function (callback, thisArg)
			{
				if(this == null) throw new TypeError("Not an object");

				thisArg = thisArg || window;

				for (var key in this) if(this.hasOwnProperty(key)) callback.call(thisArg, this[key], key, this);
			}
		});

	/* Element.interactive */
	/* Non-Standard: This applies to elements that users can directly manipulate - buttons, inputs, editable content, etc. */
	/* Example Usage: if(window.querySelector("#myButton").interactive) { ... } */
		window.Object.defineProperty(Element.prototype, "interactive",
		{
			get: function()
			{
				return (this && ((this.nodeName === "A" || ((this.nodeName === "BUTTON" || this.nodeName === "INPUT" || this.nodeName === "SELECT" || this.nodeName === "TEXTAREA" || this.contentEditable) && !this.disabled)) || (this.tabIndex && this.tabIndex > 0))) ? true : false;
			}
		});
		
	/* Element.visible */
	/* Non-Standard: This behaves very similarly to jQuery's ".is(':visible')" selector, except it must be called as a boolean call and not a leveragable selector. */
	/* Example Usage: if(window.querySelector("#myElement").visible) { ... } */
		window.Object.defineProperty(Element.prototype, "visible",
		{
			get: function()
			{
				var element = this;

				while(element && element.nodeType === 1)
				{
					if(element.style && element.style.display === "none" || element.type === "hidden" || (!element.offsetWidth || !element.offsetHeight) || !element.getClientRects().length) return false;

					element = element.parentNode;
				}

				return true;
			}
		});

	/* ChildNode.remove() */
	/* Documentation: //developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove */
		(function(arr)
		{
			arr.forEach(function(item)
			{
				if(item.hasOwnProperty("remove")) return;

				Object.defineProperty(item, "remove", {
					configurable: true,
					enumerable: true,
					writable: true,
					value: function remove()
					{
						if(this.parentNode !== null) this.parentNode.removeChild(this);
					}
				});
			});
		})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

/* Basic App Functionality */
	(function(id)
	{
		window[id] = function()
		{
			if(!window.App) window.requestAnimationFrame(window[id]);

			else
			{
				if(!document.documentElement.classList.contains("app"))
				{
					/* Redundant fire control */
						document.documentElement.classList.add("app");
					
					/* Simple identifier for App version */
						App.version = "1.0";

					/* Find content area */	
						App.content = (document.querySelector("main")) ? document.querySelector("main") : (document.querySelector("[role='main']")) ? document.querySelector("[role='main']") : (function(element)
						{
							element.setAttribute("role","main");

							document.body.appendChild(element);

							return element;
						})(document.createElement("main"));

					/* Path variables */
						App.config.routes.forEach(function(route)
						{
							route.href = route.href
								.replace(/\[@filesystem\.assets\]/gi, App.config.filesystem.assets)
								.replace(/\[@filesystem\.content\]/gi, App.config.filesystem.content)
								.replace(/\[@filesystem\.vendor\]/gi, App.config.filesystem.vendor);
						});

						App.config.autoload.forEach(function(asset,index)
						{
							App.config.autoload[index] = asset
								.replace(/\[@filesystem\.assets\]/gi, App.config.filesystem.assets)
								.replace(/\[@filesystem\.content\]/gi, App.config.filesystem.content)
								.replace(/\[@filesystem\.vendor\]/gi, App.config.filesystem.vendor);
						});

					/* Path resolution */
						App.location = (App.config.settings && App.config.settings.navigation && App.config.settings.navigation.toLowerCase() === "hash") ? new String(window.location.hash.replace(/^#/,"")) : new String(window.location.pathname);

						if(App.location == "") App.location = new String("/");
						
						App.location.asString = App.location.valueOf();
						App.location.asArray = App.location.split("/");

						if(App.location.asArray[0] == "") App.location.asArray.shift();

					/* Feature loader */
						App.add = function(feature)
						{
							if(App[feature]) console.warn("Feature request ignored: feature '" + feature + "' already loaded.");

							else
							{
								var net = new XMLHttpRequest;

								net.addEventListener("load", function(event)
								{
									var pattern = /<!index\s+feature>/gi;

									if(pattern.test(net.response))
									{
										fragment = document.createRange();
										fragment = fragment.createContextualFragment(net.response);
										fragment.id = feature;

										/* Metadata */
											fragment.querySelectorAll("meta[name][content]").forEach(function(meta)
											{
												switch(meta.name.toLowerCase())
												{
													case "id":
														fragment.id = meta.getAttribute("content");

														break;

													case "events":
														fragment.events = fragment.events || {};

														var events = meta.getAttribute("content").split(",");

														events.forEach(function(event)
														{
															var id = (fragment.id === event && events.length === 1) ? event : fragment.id + "." + event;

															fragment.events[event] = new CustomEvent(id, {
																bubbles: 1,
																cancelable: 1
															});
														});

														break;
												}
											});

											App[fragment.id] = {};

											/* Events */
												if(fragment.events)
												{
													App[fragment.id].events = fragment.events;

													if(App[fragment.id].events.forEach)
													{
														App[fragment.id].events.forEach(function(event)
														{
															event.initEvent(event.type, true, true);
														});
													}
												}

											/* Stylesheets */
												fragment.querySelectorAll("style,link[rel~='stylesheet'][href]").forEach(function(stylesheet)
												{
													var __a = stylesheet.cloneNode(true);
													__a.setAttribute("data-feature", fragment.id);

													document.head.appendChild(__a);
												});

											/* Scripts */
												fragment.querySelectorAll("script").forEach(function(script)
												{
													if(!/['|"]use strict['|"]/gi.test(script.textContent)) script.textContent = '"use strict";' + script.textContent;

													script.textContent = script.textContent.replace(/\[@feature\.id\]/gi, fragment.id);

													var __a = document.createElement("script");
													__a.textContent = script.textContent;
													__a.setAttribute("data-feature", fragment.id);

													document.head.appendChild(__a);
												});

											/* Templates */
												fragment.querySelectorAll("template").forEach(function(template)
												{
													App[fragment.id].templates = App[fragment.id].templates || {};

													App[fragment.id].templates[template.id] = template.cloneNode(true);
												});

										/* Cleanup */
											fragment = null;
									}
								});

								net.addEventListener("error", function(event)
								{
									console.warn("Feature could not be added: local network error.");
								});

								net.open("GET", App.config.repository + "/features/" + feature + ".html", true);
								net.send();
							}
						};

					/* Autoload features in app manifest */
						App.config.features.forEach(function(feature)
						{
							App.add(feature);
						});

					/* Page & Asset Loader */
						App.loaded = {
							html: [],
							css: [],
							js: []
						};

						App.load = function(href,path)
						{
							if(!href || (href && typeof href != "string")) console.warn("Load failed: no reference.");

							else
							{
								href = href.replace(/\[@filesystem\.content\]/gi, App.config.filesystem.content);

								var context = (/\.(css|less|sass|scss)$/gi.test(href)) ? "stylesheet" : (/\.(js)$/gi.test(href)) ? "script" : "page";

								if(context === "stylesheet")
								{
									var link = document.createElement("link");
									link.rel = "stylesheet";
									link.href = href;

									if(document.head.querySelector("link[href='" + href + "']"))
									{
										link.classList.add("fresh");

										link.addEventListener("load", function()
										{
											document.head.querySelector("link[href='" + href + "']:not(.fresh)").remove();

											link.classList.remove("fresh");
										}, false);
									}

									document.head.appendChild(link);

									App.loaded.css.push(href);
								}

								else
								{
									if(context === "script")
									{
										(function(scripts)
										{
											var exists = false;

											scripts.forEach(function(script)
											{
												src = [
													href.split("?")[0],
													script.src.split("?")[0]
												];

												if(src[0] == src[1]) exists = true;
											});

											if(!exists)
											{
												var element = document.createElement("script");
												element.src = href;

												document.head.appendChild(element);

												App.loaded.js.push(href);
											}

											script.remove();
										})(document.documentElement.querySelectorAll("script[src]"));
									}

									else
									{
										var net = new XMLHttpRequest;

										net.addEventListener("loadend", function(event)
										{
											switch(net.status)
											{
												case 200:
													var loaded = document.createElement("template");
													loaded.setAttribute("data-href", href);
													
													var filename = href.split("/").last();

													loaded.innerHTML = net.response;

													App.loaded.html[filename] = loaded;

													break;
													
												case 0:
													console.warn("Page could not be loaded: client offline.");

													break;

												default:
													console.warn("Page could not be loaded: error " + net.status + ".");

													break;
											}
											
											document.documentElement.classList.remove("loading");
										});

										net.open("GET", href + "?" + String(new Date().getTime()), true);
										net.send();
									}
								}
							}
						};
						
					/* Autoload assets */
						if(App.config.autoload && Array.isArray(App.config.autoload)) App.config.autoload.forEach(function(asset)
						{
							App.load(asset)
						});

					/* Cleanup */
						delete window[id];
				}
			}
		};

		window[id]();
	})("__" +  new Date().getTime());