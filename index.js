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

							window.Resolver = function()
							{
								App.location = new String(window.location.hash.replace(/^#/,""));
								App.location.asString = App.location.valueOf();
								App.location.asArray = App.location.split("/");

								if(App.location.asArray[0] == "") App.location.asArray.shift();
							};

							Resolver();

							window.addEventListener("hashchange", Resolver);

							delete window.Resolver;
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
	/* Usage: a = a.extend(b) */
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
	/* Usage: b = a.last() */
		Array.prototype.last = function()
		{
			return (this[this.length - 1]) ? this[this.length - 1] : null;
		};

	/* Array.remove() */
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
	/* Technically this is an out-of-spec feature, but it really should have been included in spec just for convenience */
		if(!Object.prototype.forEach) Object.defineProperty(Object.prototype, "forEach", {
			value: function (callback, thisArg)
			{
				if(this == null) throw new TypeError("Not an object");

				thisArg = thisArg || window;

				for (var key in this) if(this.hasOwnProperty(key)) callback.call(thisArg, this[key], key, this);
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

					/* Find content area */	
						App.content = (document.querySelector("main")) ? document.querySelector("main") : (document.querySelector("[role='main']")) ? document.querySelector("[role='main']") : (function(element)
						{
							element.setAttribute("role","main");

							document.body.appendChild(element);

							return element;
						})(document.createElement("main"));

					/* Route path variables */
						App.config.routes.forEach(function(route)
						{
							if(App.config.filesystem.content)
							{
								route.href = route.href
									.replace(/\[@filesystem\.assets\]/gi, App.config.filesystem.assets)
									.replace(/\[@filesystem\.content\]/gi, App.config.filesystem.content)
									.replace(/\[@filesystem\.vendor\]/gi, App.config.filesystem.vendor);
							}
						});

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

															fragment.events[event] = new Event(id, {
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

					/* Auto-load features in app manifest */
						App.config.features.forEach(function(feature)
						{
							App.add(feature);
						});

					/* Page & Asset Loader */
						App.load = function(href,path,silent)
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
											}

											script.remove();
										})(document.documentElement.querySelectorAll("script[src]"));
									}

									else
									{
										if(document.documentElement.classList.contains("loading")) console.warn("Load failed: previous content load not finished.");

										else
										{
											document.documentElement.classList.add("loading");
											document.documentElement.classList.remove("visible");

											var net = new XMLHttpRequest;

											net.addEventListener("load", function(event)
											{
												switch(net.status)
												{
													case 200:
														var loaded = document.createElement("template");
														loaded.innerHTML = net.response;

														loaded.content.querySelectorAll("script").forEach(function(script)
														{
															if(!script.src)
															{
																if(!/['|"]use strict['|"]/gi.test(script.textContent)) script.textContent = '"use strict";' + script.textContent;

																var id = "__" +  new Date().getTime();																
																window[id] = new Function(script.textContent);

																window[id]();

																delete window[id];
															}
														});

														loaded.content.querySelectorAll("link[href][rel='stylesheet']").forEach(function(stylesheet)
														{
															document.documentElement.classList.add("loading-stylesheets");
															document.documentElement.classList.remove("loaded-stylesheets");
														});

														if(!path)
														{
															path = href.split("/").last().split(".");

															if(path[0] === "") path.shift();

															if(path.length > 1)
															{
																path.pop();

																path = path.join(".");
															}

															else path = path[0];
														}

														if(!silent) location.hash = "/" + path;

														if(loaded.content.querySelector("title"))
														{
															document.title = loaded.content.querySelector("title").textContent;

															loaded.content.querySelector("title").remove();
														}

														App.content.innerHTML = loaded.innerHTML;

														var loadingStylesheets = 0;

														App.content.querySelectorAll("link[href][rel='stylesheet']").forEach(function(stylesheet)
														{
															loadingStylesheets++;

															stylesheet.addEventListener("load", function(event)
															{
																loadingStylesheets--;

																if(loadingStylesheets <= 0)
																{
																	document.documentElement.classList.add("loaded-stylesheets");
																	document.documentElement.classList.remove("loading-stylesheets");
																}
															});
														});

														window.Verify = function()
														{
															if(!document.documentElement.classList.contains("loaded-stylesheets")) window.requestAnimationFrame(window.Verify);

															else
															{
																if(App.config.settings.transitions && App.config.settings.transitions.enabled)
																{
																	App.config.settings.transitions.duration = (isNaN(App.config.settings.transitions.duration)) ? 0 : App.config.settings.transitions.duration;
																}
																
																document.documentElement.classList.add("visible");

																delete window.Verify;
															}
														};

														window.Verify();

														break;

													default:
														console.warn("Page could not be loaded: error " + net.status + ".");

														break;
												}
											});

											net.addEventListener("error", function(event)
											{
												console.warn("Page could not be loaded: local network error.");
											});

											net.addEventListener("loadend", function(event)
											{
												document.documentElement.classList.remove("loading");
											});

											net.open("GET", href, true);
											net.send();
										}
									}
								}
							}
						};

					/* Hashchange page loading */
						window.addEventListener("hashchange", function(event)
						{
							var path = event.newURL.split("#")[1].toLowerCase();

							App.config.routes.forEach(function(route,index)
							{
								if(route.path.toLowerCase() != path) return;
								else App.load(route.href, route.path, true);
							});
						});

					/* Initial page loading */
						if(!location.hash) location.hash = "/";

						else (function(path)
						{
							App.config.routes.forEach(function(route,index)
							{
								if(route.path.toLowerCase() != path) return;
								else App.load(route.href, route.path, true);
							});
						})(location.hash.split("#")[1].toLowerCase());

					/* Cleanup */
						delete window[id];
				}
			}
		};

		window[id]();
	})("__" +  new Date().getTime());