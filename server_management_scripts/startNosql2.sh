node_array=( "203.255.92.192" "203.255.92.193" "203.255.92.194" "203.255.92.195" )
node_array_size=${#node_array[@]}


for ((i=1; i<$node_array_size; i++)) ;do 

node=${node_array[i]}
connect='sshpass -p netdb3230 ssh root@'$node

$connect docker start cassandra
$connect /ssdStorage/rocks/bin/./cassandra -Dcassandra.rocksdb.keyspace=ycsb

done
echo "cache memory & data reset.. now, you have to create keyspace and table.."


