checkNode=$1
repeatCount=$2

connect='sshpass -p netdb3230 ssh root@'$checkNode
echo $connect
result=''
echo $repeatCount

if [ -f result.json ]
then
	rm result.json
	echo "delete exist result.json"
fi

if [ ${repeatCount} -eq 5 ]
then
	result='inactive'
	echo $result
else
	echo "start nosql status check"
	$connect /ssdStorage/Nosql/apache-cassandra-3.11.4/bin/nodetool status | sed '1,4d' > check_cas_status.txt
	cat check_cas_status.txt
	grepDownresult=`grep D[NLJM] check_cas_status.txt`
	filesize=$(wc -c check_cas_status.txt | awk '{print $1}')
	echo "file size : " $filesize
	echo "grepresult :" $grepDownresult
	echo "D[NLJM] or Error Check.."

	if [[ -n $grepDownresult ]] || [[ ${filesize} -eq 0 ]]
	then
   	    result='inactive'
   		./startNosql.sh
   		repeatCount=$((repeatCount+1))
   	   	./checkNosql.sh $checkNode $repeatCount
	else
   		grepULJMresult=`grep U[LJM] check_cas_status.txt`
		grepRNLJMresult=`grep ?[NLJM] check_cas_status.txt`
       	echo $grepULJMresult
       	echo "U[LJM],?[NLJM] Check.."
       	
		if [[ -n $grepULJMresult ]] || [[ -n $grepRNLJMresult ]]
		then
	   		result='inactive'
       		echo "U[LJM] or ?[NLJM].. start loading.."
      		repeatCount=$((repeatCount+1))
      		sleep 5
       		./checkNosql.sh $checkNode $repeatCount
      	else
			result='active'
	   		echo $result
      	fi
	fi
fi



if [ -f result.json ]
then
	echo "file already exist not change result file, result is : " $result
else
    echo "file not exist, generate result file, result is : " $result
    jsontext1='{"result":"'
    jsontext2='"}'
    jsonfile=${jsontext1}${result}${jsontext2}
    echo "$jsonfile" > result.json
fi

