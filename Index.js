const express = require('express');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const fs = require("fs");
const uuid = require("uuid");
//We gave numbers for each intent and In excel sheet we are mapping Utterances with Intent nos
let names={
  "Intent_no": "Intent_name"
};


const app = express();
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send(`
        <form action="/" method="post" enctype="multipart/form-data">
            <input type="file" name="excel_file">
            <input type="submit" value="Upload">
        </form>
    `);
});

app.post('/', (req, res) => {
    if (!req.files || !req.files.excel_file) {
        return res.status(400).send('No files were uploaded.');
    }

    const excelFile = req.files.excel_file;
    const workbook = xlsx.read(excelFile.data);
    const firstSheet = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
    let newdata=sheetData[0]["UC_name"]
    let arr=[]

    //reading the json file
    let filename="./intents/"+names[sheetData[0]["UC"]]+"_usersays_hi.json";
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, JSON.stringify(arr), 'utf-8');
      console.log("file is created:"+filename)
    }
    let fileData = fs.readFileSync(filename);
    let data = JSON.parse(fileData);
    
    for (let i = 0; i < sheetData.length; i++) {
      let id = uuid.v4();
      if(sheetData[i]["UC"]==newdata)
      {
      data.push({
        "id": id,
        "data": [
          {
            "text": sheetData[i]["User Message"],
            "userDefined": false
          }
        ],
        "isTemplate": false,
        "count": 0,
        "lang": "hi",
        "updated": 0
        });
      }
     else{
       fs.writeFileSync(filename, JSON.stringify(data), function(err) {
         if (err) {
          console.error(err);
        } else {
          console.log("JSON file updated");
        }
       })
       console.log("JSON file updated"+filename);
       newdata=sheetData[i]["UC"];
       filename="./intents/"+names[sheetData[i]["UC"]]+"_usersays_hi.json";
       if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, JSON.stringify(arr), 'utf-8');
        console.log("file is created:"+filename)
      }
       fileData = fs.readFileSync(filename);
       data = JSON.parse(fileData);
       data.push({
        "id": id,
        "data": [
          {
            "text": sheetData[i]["User Message"],
            "userDefined": false
          }
        ],
        "isTemplate": false,
        "count": 0,
        "lang": "hi",
        "updated": 0
        });
       }
    }

    //training for last  Use case
    fs.writeFileSync(filename, JSON.stringify(data), function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log("All are updated till"+filename);
        }
      });

    res.json("Successfull training! \n check the Logs");
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
