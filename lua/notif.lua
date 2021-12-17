local args, err = ngx.req.get_uri_args();
local function wrap(txt)
	return "$(env printf '" .. txt .. "')"
end

if not_nil(args["title"]) then
	cmd = (
		'dbus-send --system / net.nuetzlich.SystemNotifications.Notify ' ..
		'"string:' .. wrap(sans(args["title"])) .. " from " .. ngx.var.remote_addr .. '" ' ..
		(not_nil(args["text"]) and '"string:' .. wrap(sans(args["text"])) .. '"' or '')
	);
	os.execute(cmd);
	ngx.say("Notified: ");
	ngx.say("title: " .. args["title"] );
	if not_nil(args["text"]) then ngx.say("text : " .. args["text"]) end;
	ngx.exit(200);
elseif args["help"] ~= nil then
	local url = ngx.var.scheme .. "://" .. ngx.var.host .. ngx.var.uri;
	ngx.say( url .. " usage:");
	ngx.say("  GET " .. url .. "?title=<title>[&text=<text>]");
	ngx.say("");
	ngx.say("args:");
	ngx.say("    title: string, not null");
	ngx.say("    title: string, optional");
else
	args_error(args, "title", "Empty value");
end;
