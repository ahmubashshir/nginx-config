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
