node_num=$#
node_args=("$@")


#start Cassandra
for ((i=0; i<$node_num; i++)) ;do 
	echo "Connecting..${node_args[$i]}.."
	connect='sshpass -p netdb3230 ssh root@'${node_args[$i]}
	$connect "cd /ssdStorage/Nosql/apache-cassandra-3.11.4/bin/ && ./cassandra -R" 
done

echo "Cassandra ON"

#start Rocksandra
for ((i=0; i<$node_num; i++)) ;do
    echo "Connecting..${node_args[$i]}.."
    connect='sshpass -p netdb3230 ssh root@'${node_args[$i]}
	$connect "cd /ssdStorage/Nosql/Rocksandra/bin/ && ./cassandra -Dcassandra.rocksdb.keyspace=ycsb"
done

echo "Rocksandra ON"

echo "Nosql ON"
