App.events = [
	{
		target: document,
		trigger: "init",
		event: function _callback(event)
		{
			if(!App.detect.localhost)
			{
				if(App.settings.analytics.google && App.settings.analytics.google.enabled)
				{
					(function(i,s,o,g,r,a,m)
					{
						i["GoogleAnalyticsObject"] = r;
						
						i[r] = i[r] || function()
						{
							(i[r].q = i[r].q || []).push(arguments)
						},
						i[r].l = 1 * new Date();

						a = s.createElement(o),
						m = s.getElementsByTagName(o)[0];

						a.async = 1;
						a.src = g;

						m.parentNode.insertBefore(a, m);
					})(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

					ga("create", App.settings.analytics.google.id, "auto");
				}
				
				if(App.settings.analytics.google && App.settings.analytics.facebook.enabled)
				{
					!function(f,b,e,v,n,t,s)
					{
						if(f.fbq) return;
						
						n = f.fbq = function()
						{
							n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
						};
						
						if(!f._fbq) f._fbq = n;

						n.push = n;
						n.loaded = !0;
						n.version = "2.0";
						n.queue = [];
						t = b.createElement(e);
						t.async = !0;
						t.src = v;
						s = b.getElementsByTagName(e)[0];

						s.parentNode.insertBefore(t,s);
					}(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

					fbq("init", App.settings.analytics.facebook.id);
				}
			}
		}
	},
	{
		target: document,
		trigger: "navigate",
		event: function _callback(event)
		{
			if(typeof ga === "function")
			{
				ga("set", "page", "/" + App.track.name);
				ga("send", "pageView");
			}
		}
	},
	{
		target: window,
		trigger: "scroll",
		event: function _callback(event)
		{

		}
	}
];

App.events.forEach(function(event,work)
{
	event.target.addEventListener(event.trigger, event.event, true);
});