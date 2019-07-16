#!/bin/bash

JQ="jq -r"
PARSER="/usr/local/bin/ioparser"

json=""

while read line
do
	json+="$line"
done

nr=$(echo "$json" | $JQ '.meta.hostnames | length')

for (( i = 0; i < $nr; i++ )); do
	host=$(echo "$json" | $JQ .meta.hostnames[$i].hostname)
	log_dir=$(echo "$json" | $JQ .result)

	ssh -q -t $host "$PARSER -w  $(echo ${json} | $JQ .window_size) $log_dir $log_dir"
	scp $host:$log_dir/trace.json $host:$log_dir/threshold.json $host:$log_dir/dmdu.json .
	rename '' ${host}_ dmdu.json threshold.json trace.json
done
