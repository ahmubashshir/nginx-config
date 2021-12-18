local args, err = ngx.req.get_uri_args();
local url = ngx.var.scheme .. "://" .. ngx.var.host .. "/cow";

local set_args = function(eye, tongue, mode, cow)
	local cow_args = "";
	if not_nil(cow) then
		if cow == "random" then
			cow_args = cow_args .. " -f " .. "/usr/share/cows/" .. termcow.cows[math.random(1,table.getn(termcow.cows))] .. ".cow";
		elseif indexOf(termcow.cows, cow) then
			cow_args = cow_args .. " -f " .. "/usr/share/cows/" .. sans(cow) .. ".cow";
		else
			args_error(args, "cow");
		end
	end;
	if is_nil(mode) then
		if not_nil(tongue) then
			cow_args =  cow_args .. " -T " .. sans(tongue);
		end;
		if not_nil(eye) then
			cow_args =  cow_args .. " -e " .. sans(eye);
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
			args_error(args, "mode");
		end;
	end;
	return cow_args;
end;
if args["help"] ~= nil then
	require('cowhelp')()
else
	if ngx.req.get_method() == "POST" then
		ngx.req.read_body()
		args["msg"] = ngx.req.get_body_data()
		if args["msg"] == nil then
			local file = ngx.req.get_body_file()
		end
	end
	cmd = (
		"cow" .. (ngx.var[1] == "random" and termcow.op[math.random(1,2)] or ngx.var[1] ) ..
		set_args(args["eye"], args["tongue"], args["mode"], args["cow"]) ..
		" -W " .. (sans(args["col"]) or "22")
	);
	local handle = io.popen("env printf '" .. ( sans(args["msg"]) or "moo") .."\n'|".. cmd);
	speech = handle:read("*a")
	ngx.say(speech);
	handle:close();
end
