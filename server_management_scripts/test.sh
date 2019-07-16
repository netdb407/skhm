array_node = ("203.255.92.192","203.255.92.193","203.255.92.194","203.255.92.195")


node193='sshpass -p netdb3230 ssh root@203.255.92.193'
node194='sshpass -p netdb3230 ssh root@203.255.92.194'
node195='sshpass -p netdb3230 ssh root@203.255.92.195'

$node193 sudo service docker start
$node193 docker start cassandra
echo "193 docker on"

$node194 sudo service docker start
$node194 docker start cassandra
echo "194 docker on"

$node195 sudo service docker start
$node195 docker start cassandra
echo "195 docker on"

fdisk -l>192nodespec.txt
$node193 fdisk -l>193nodespec.txt
$node194 fdisk -l>194nodespec.txt
$node195 fdisk -l>195nodespec.txt

$node195 docker exec cassandra nodetool status | sed '1,4d' > check_nosql_status.txt
if [ -z [ grep D[NLJM] check_nosql_status.txt ]]; then
echo "Nosql inactive..!"
else
echo "Nosql active"
fi



service postgresql-9.6 status > check_rdbms_status.txt
if [ -z [ grep "inactive" check_rdbms_status ]]; then
echo "RDBMS inactive..!"
else
echo "RDBMS active"
fi
