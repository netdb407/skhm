node_num=$#
node_args=("$@")

for ((i=0; i<$node_num; i++)) ;do 

echo ${node_args[$i]}

connect='sshpass -p netdb3230 ssh root@'${node_args[$i]}
$connect sed -i "s/localhost/${node_args[$i]}/g" /ssdStorage/apache-cassandra-3.11.4/conf/cassandra.yaml
done
