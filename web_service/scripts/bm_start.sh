#!/bin/bash

JQ="jq -r"
IOTRACER="/usr/local/bin/iotracer"

json=""

while read line
do
	json+="$line"
done

nr=$(echo "$json" | $JQ '.meta.hostnames | length')

result="{\"status\":["

status=()
for (( i = 0; i < $nr; i++ )); do
	host=$(echo "$json" | $JQ .meta.hostnames[$i].hostname)
	line="{\"hostname\":\"$host\","

	ssh $host "nohup $IOTRACER -D -i $(echo ${json} | $JQ .window_size) -m $(echo ${json} | $JQ .device_manager) -o $(echo ${json} | $JQ .result) $(echo ${json} | $JQ .watch_directory) > /dev/null 2>&1 &"
	sleep 2
	pid=$(ssh $host "cat /var/run/iotracer.pid")

	if [[ $? -ne 0 ]]; then
		line+="\"pid\":-1}"
	else
		line+="\"pid\":$pid}"
	fi

	status+=("$line")
done

status_line=$(printf ",%s" "${status[@]}")
result+=${status_line:1}
result+="]}"

echo "$result" | $JQ '.'
