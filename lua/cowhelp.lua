local args, err = ngx.req.get_uri_args();
local uri, scheme, host = ngx.var.uri, ngx.var.scheme, ngx.var.host
function this()
	local url = scheme .. "://" .. host .. "/cow";
	ngx.say( url .. "/say" .. " usage:");
	ngx.say("  GET " .. url .. "/say");
	ngx.say("  GET " .. url .. "/say" .. "?[args]");
	ngx.say("");
	ngx.say( url .. "/think" .. " usage:");
	ngx.say("  GET " .. url .. "/think");
	ngx.say("  GET " .. url .. "/think" .. "?[args]");
	ngx.say("");
	ngx.say("");
	ngx.say("args:");
	ngx.say("   eye:         at most 2 characters.");
	ngx.say("   tongue:      at most 2 characters.");
	ngx.say("   mode:        preset for appearence.");
	ngx.say("   mode:values: random borg dead greedy paranoia stoned tired wired youth");
	ngx.say("   cow:         use alternate cowfile.");
	ngx.say("   cow:values:");
	local cols , prevlen = 0, 0;
	for idx ,line in ipairs(termcow.cows) do
		if cols == 0 then
			ngx.print("       ");
		else
			for i = 0,20-prevlen do
				ngx.print(" ");
			end;
		end
		if line == "random" then
			ngx.say(line);
			cols = 0;
		else
			if cols < 2 then
				ngx.print(line);
				cols = cols + 1;
			else
				ngx.say(line);
				cols = 0;
			end
			prevlen = line:len();
		end;
	end;
	ngx.say("")
	ngx.say("")
	ngx.say("PS. you can put msg in POST body, eg.:")
	ngx.say("  fortune|POST " .. url .. "/say");
end
if uri == '/cow' or uri == '/cow/' then
	this()
elseif uri == '/cow/say' or uri == '/cow/think' or uri == '/cow/random' then
	return this
else
	ngx.exit(404);
end
