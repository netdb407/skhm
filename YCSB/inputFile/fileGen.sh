fileSize=$1
fileID=$2
echo "fileSize: $fileSize"

echo "Generating...*^.^* wait please~"


fileFullName="${fileID}"

echo "fileName: $fileFullName"

fallocate -l $fileSize $fileFullName

filePath="/home/skhm/YCSB/inputFile"
fileFullPath="${filePath}/${fileFullName}"

echo "$fileFullPath"

