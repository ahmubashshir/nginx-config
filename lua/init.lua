termcow = {
    ["modes"] = { "-b","-d","-g","-p","-s","-t","-w","-y"},
    ["cows"] = {},
    ["op"] = { "say", "think"}
}
local handle = io.popen("ls /usr/share/cows/*.cow|xargs basename -a|sed 's/\\.cow$//g'");
table.insert(termcow.cows,"random");
for line in handle:lines() do
    table.insert(termcow.cows,line);
end;
handle:close();
function string.starts(String,Start)
	return string.sub(String,1,string.len(Start))==Start
end
function indexOf(t, object)
    if type(t) ~= "table" then error("table expected, got " .. type(t), 2) end;
    for i, v in pairs(t) do
        if object == v then
            return i;
        end;
    end;
end;
function is_nil(val)
    return val == nil or val == '';
end;
function not_nil(val)
    return not is_nil(val)
end;
function args_error(args, key, msg)
    ngx.say(
        ( msg == nil and "Unsupported value on" or msg ) ..
        " $GET[" .. key .. "]: " .. '\'' ..
        ( (args == nil or args[key] == nil) and '' or args[key] ) .. '\''
    );
    ngx.say("");
    ngx.say("Reference ".. ngx.var.scheme .. "://" .. ngx.var.host .. ngx.var.uri .. "?help");
    ngx.exit(406);
end;
