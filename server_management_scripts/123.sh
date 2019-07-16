

node_num=$#
node_args=("$@")




for ((i=0; i<$node_num; i++)) ;do
		seeds="${seeds}${node_args[$i]},"
done

seeds=${seeds:: -1}

echo "$seeds"

