import fs from "fs"
import path from "path";

// Recursively gets all file paths in a folder and its subfolders
export const getAllFiles = (folderPath: string) => {
    // folderPath: root directory to start searching for files
    let response: string[] = [];
    
    // Read all files and folders in the current directory
    const allFileAndFolders = fs.readdirSync(folderPath);
    
    allFileAndFolders.forEach((file)=>{
        const fullFilePath = path.join(folderPath, file);
        
        // If the path is a directory, recursively get files from it
        if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath));
        }
        // If the path is a file, add it to the response array
        else{
            response.push(fullFilePath);
        }
    })

    // Return array of all file paths
    return response;
};