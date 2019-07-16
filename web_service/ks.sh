ps -elf | grep 'node foot.js' | awk '{print $4}' | while read line; do kill -9 $line; done
