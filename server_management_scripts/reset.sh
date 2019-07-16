
node_array=( "203.255.92.192" "203.255.92.193" "203.255.92.194" "203.255.92.195" )
node_array_size=${#node_array[@]}

for ((i=1; i<$node_array_size; i++)) ;do 

node=${node_array[i]}
connect='sshpass -p netdb3230 ssh root@'$node
$connect "sudo echo 3 > /proc/sys/vm/drop_caches";
$connect sudo rm -rf /ssdStorage/casData
$connect sudo rm -rf /ssdStorage/rocks/data/*
$connect docker exec cassandra sh -c 'rm -rf /var/lib/cassandra/*'
$connect docker stop cassandra
$connect fuser -k -n tcp 7198
echo $connect
done





