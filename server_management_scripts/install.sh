node_num=$#
node_args=("$@")

#create seeds
for ((i=0; i<$node_num; i++)) ;do
    seeds="${seeds}${node_args[$i]},"
done
seeds=${seeds:: -1}
echo "bench node count: $node_num"
echo "set seeds: $seeds"

#install Cassandra
wget -P /Nosql/ http://www.apache.org/dist/cassandra/3.11.4/apache-cassandra-3.11.4-bin.tar.gz &&
tar -xvzf /Nosql/apache-cassandra-3.11.4-bin.tar.gz -C /Nosql
rm -rf /Nosql/apache-cassandra-3.11.4-bin.tar.gz

#install Rocksandra
git clone -b rocks_3.0 https://github.com/1586piano/rocks.git /Nosql/Rocksandra &&
cd /Nosql/Rocksandra && ant 

#set Cassandra
sed -i "s/127.0.0.1/$seeds/g" /Nosql/apache-cassandra-3.11.4/conf/cassandra.yaml
sed -i '662s/false/true/g' /Nosql/apache-cassandra-3.11.4/conf/cassandra.yaml
sed -i '622 i\listen_on_broadcast_address: true' /Nosql/apache-cassandra-3.11.4/conf/cassandra.yaml
sed -i '621d' /Nosql/apache-cassandra-3.11.4/conf/cassandra.yaml

#set Rocksandra
sed -i "s/127.0.0.1/$seeds/g" /Nosql/Rocksandra/conf/cassandra.yaml

#copy Nosql & set bench node
for ((i=0; i<$node_num; i++)) ;do
	#copy
	scp -r /Nosql/ root@${node_args[$i]}:/ssdStorage
	connect='sshpass -p netdb3230 ssh root@'${node_args[$i]}
	#set bench node Cassandra
	$connect sed -i "s/localhost/${node_args[$i]}/g" /ssdStorage/Nosql/apache-cassandra-3.11.4/conf/cassandra.yaml
	#set bench node Rocksandra
	$connect sed -i "s/localhost/${node_args[$i]}/g" /ssdStorage/Nosql/Rocksandra/conf/cassandra.yaml
done

