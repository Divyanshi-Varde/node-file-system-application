// ********** Promise API ********** //
const fs = require("fs/promises");

const createFile = async (path) => {
  try {
    // Check whether or not we already have that file
    let existingFileHandle = await fs.open(path, "r");
    existingFileHandle.close();
    // We already have that file
    return console.log(`The file ${path} already exists.`);
  } catch (e) {
    // If the file doesn't exist, create a new file
    const newFileHandle = await fs.open(path, "w");
    console.log("A new file was successfully created!");
    newFileHandle.close();
  }
};

const deleteFile = async (path) => {
  try {
    await fs.unlink(path);
    console.log("The file was successfully removed!");
    // console.log(`Deleting ${path}.....`);
  } catch (e) {
    if ((e.code = "ENOENT")) {
      console.log("There is no such file to remove!");
    } else {
      console.log("An erroe occured while removing the file!");
      console.log(e);
    }
  }
};

const renameFile = async (oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    console.log("The file was successfully renamed.");
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(
        "No file at this path to rename, or the destination doesn't exist."
      );
    } else {
      console.log("An error occurred while removing the file: ");
      console.log(e);
    }
  }
};

let addedContent;

const addToFile = async (path, content) => {
  if (addedContent === content) return;
  try {
    const fileHandle = await fs.open(path, "a");
    fileHandle.write(content);
    addedContent = content;
    console.log("The content was added successfully.");
  } catch (e) {
    console.log("An error occurred while removing the file: ");
    console.log(e);
  }
};
(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const commandFileHandler = await fs.open("./sample1.txt", "r");

  commandFileHandler.on("change", async () => {
    // Read the content
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = size;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);

    const command = buff.toString("utf-8");

    // Create a file
    if (command.includes(CREATE_FILE)) {
      const filepath = command.substring(CREATE_FILE.length + 1);
      await createFile(filepath);
    }

    //delete a file
    if (command.includes(DELETE_FILE)) {
      const filepath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filepath);
    }

    //rename a file
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldfilepath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilepath = command.substring(_idx + 4);
      renameFile(oldfilepath, newFilepath);
    }

    //add to a file
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content:");
      const filepath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const content = command.substring(_idx + 15);
      addToFile(filepath, content);
    }
  });

  const watcher = fs.watch("./sample1.txt");
  for await (const a of watcher) {
    if (a.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
