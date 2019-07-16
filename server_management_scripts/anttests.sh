
node_num=$#
node_args=("$@")
first_node=$1

echo $first_node

connect='sshpass -p netdb3230 ssh root@'$first_node
$connect "cd /ssdStorage/Rocksandra && $ant"



