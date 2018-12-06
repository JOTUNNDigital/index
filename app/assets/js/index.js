App.events = [
	{
		target: document,
		trigger: "navigate",
		event: function _callback(event)
		{
			if(App.track.name == "home")
			{
				
			}
		}
	},
	{
		target: document,
		trigger: "click",
		event: function _callback(event)
		{
			if(App.track.name == "home")
			{
				
			}
		}
	}
];

App.events.forEach(function(event,index)
{
	event.target.addEventListener(event.trigger, event.event, true);
});