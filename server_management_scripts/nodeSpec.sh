node_array=( "203.255.92.193" "203.255.92.194" "203.255.92.195" )
node_array_size=${#node_array[@]}




for ((i=0; i<$node_array_size; i++)) ;do 
echo "----------------------------------------------------------------"
node=${node_array[i]}
connect='sshpass -p netdb3230 ssh root@'$node
ip=$node
os=$($connect sudo grep "PRETTY_NAME" /etc/*release | sed  -e 's/^.*=//' -e 's/"//g' )
kernel=$($connect sudo uname -r)
cpu=$($connect sudo grep 'model.name' /proc/cpuinfo | head -1 | sed -e 's/^.*://' -e 's/ //g') 
ram=$($connect sudo grep "MemTotal" /proc/meminfo | sed -e 's/^.*://' -e 's/ //g') 
HDD=$($connect sudo fdisk -l | grep "sda" -m 1 | sed -e 's/^.*://' -e 's/ //g' -e 's/,.*$//g')
SSD=$($connect sudo fdisk -l | grep "nvme0n1" -m 1 | sed -e 's/^.*://' -e 's/ //g' -e 's/,.*$//g')
s_storage="HDD: ${HDD}, SSD: ${SSD}"

echo -e "IP : "$ip	"\nOS : "$os	"\nKERNEL : "$kernel	"\nCPU : "$cpu	"\nRAM : "$ram	"\nS_STORAGE : "$s_storage

done
