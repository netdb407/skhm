repeatCount=$1
node195='sshpass -p netdb3230 ssh root@203.255.92.195'
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
    $node195 docker exec cassandra nodetool status | sed '1,4d' > check_nosql_status.txt
    cat check_nosql_status.txt
    grepDownresult=`grep D[NLJM] check_nosql_status.txt`
    filesize=$(wc -c check_nosql_status.txt | awk '{print $1}')
    echo "file size : " $filesize
    echo "grepresult :" $grepDownresult
    echo "D[NLJM] or Error Check.."

    if [[ -n $grepDownresult ]] || [[ ${filesize} -eq 0 ]]
    then
        result='inactive'
        ./startNosql.sh
        repeatCount=$((repeatCount+1))
        ./checkNosql.sh $repeatCount
    else
        grepULJMresult=`grep U[LJM] check_nosql_status.txt`
        grepRNLJMresult=`grep ?[NLJM] check_nosql_status.txt`
        echo $grepULJMresult
        echo "U[LJM],?[NLJM] Check.."

        if [[ -n $grepULJMresult ]] || [[ -n $grepRNLJMresult ]]
        then
            result='inactive'
            echo "U[LJM] or ?[NLJM].. start loading.."
            repeatCount=$((repeatCount+1))
            sleep 5
            ./checkNosql.sh $repeatCount
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
    jsontext2='"}'
    jsonfile=${jsontext1}${result}${jsontext2}
    echo "$jsonfile" > result.json
fi


