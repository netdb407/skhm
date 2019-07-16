fileSize=$1
fileID=$2
echo "fileSize: $fileSize"

echo "Generate..."


fileFullName="${fileID}"

echo "fileName: $fileFullName"

fallocate -l $fileSize $fileFullName

filePath=$(pwd)
fileFullPath="${filePath}/${fileFullName}"

echo "$fileFullPath"
