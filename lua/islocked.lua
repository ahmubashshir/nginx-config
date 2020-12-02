local handle = io.popen('pgrep xsecurelock\necho _$?')
if handle:read('*a'):match('.*%D(%d+)')+0 == 0 then
	ngx.say("Desktop is locked");
else
	ngx.say("Desktop is unlocked");
end
handle:close()
ngx.exit(200);
