local args, err = ngx.req.get_uri_args();
local url = ngx.var.scheme .. "://" .. ngx.var.host .. "/cow";
local is = function(val)
	return val == nil or val == '';
end;
local args_error = function(key)
	ngx.say("Unsupported value on $GET["..key.."]: " .. args[key]);
	ngx.say("");
	ngx.say("Reference ".. url .. ngx.var.uri .. "?help");
	ngx.exit(406);
end;
local set_args = function(eye, tongue, mode, cow)
	local cow_args = "";
	if not is(cow) then
		if os.execute('test -f "'.. "/usr/share/cows/"..cow..".cow" ..'"') == 0 then
			ngx.say("");
			cow_args = cow_args .. " -f " .. "/usr/share/cows/" .. cow .. ".cow";
		elseif cow == "random" then
			cow_args = cow_args .. " -f " .. "/usr/share/cows/" .. termcow.cows[math.random(1,#termcow.cows)] .. ".cow";
		else
			args_error("cow");
		end
	end;
	if is(mode) then
		if not is(tongue) then
			cow_args =  cow_args .. " -T " .. tongue;
		end;
		if not is(eye) then
			cow_args =  cow_args .. " -e " .. eye;
		end;
	else
		if mode == "" then
			cow_args = cow_args;
		elseif mode == "random" then
			cow_args = cow_args .. " ".. termcow.modes[math.random(1,8)].." ";
		elseif mode == "borg" then
			cow_args = cow_args .. " -b ";
		elseif mode == "dead" then
			cow_args = cow_args .. " -d ";
		elseif mode == "greedy" then
			cow_args = cow_args .. " -g ";
		elseif mode == "paranoia" then
			cow_args = cow_args .. " -p ";
		elseif mode == "stoned" then
			cow_args = cow_args .. " -s ";
		elseif mode == "tired" then
			cow_args = cow_args .. " -t ";
		elseif mode == "wired" then
			cow_args = cow_args .. " -w ";
		elseif mode == "youth" then
			cow_args = cow_args .. " -y ";
		else
			args_error("mode");
		end;
	end;
	return cow_args;
end;
if args["help"] ~= nil then
	require 'cowhelp'
else
	local handle = io.popen(
		"cow" .. (ngx.var[1] == "random" and termcow.op[math.random(1,2)] or ngx.var[1] ) ..
		set_args(args["eye"], args["tongue"], args["mode"], args["cow"]) ..
		" -W " .. (args["col"] or "22") ..
		" " ..
		( args["msg"] or "moo")
	);
	ngx.say(handle:read("*a"));
	handle:close();
end
