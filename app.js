var express = require('express');
var app = express();
var fs = require('fs');
var targetDir = 'e:\\temp\\testing\\';
var sourceDir = 'z:\\';
var newLine = '\r\n';
var fir=0,sec=0,las = 0;
var filesToSkim = {};
var FileToSkim = function(source, target) {
    var s = source;
    var t = target;
    return {
        source: s,
        target: t
    };
}

fs.readdir(sourceDir, function(err, files){   
    fs.mkdir(targetDir,function(err){
        if(err)
            console.log(err);
        
        for(var incb = 0;incb<files.length;incb++){                
            var stats = fs.statSync(sourceDir + files[incb]);        
            if(stats.isDirectory()){
                var calcDir = files[incb];
                console.log(calcDir);
                var calcDirFileDirectory = sourceDir+calcDir;
                
                // find the csv file from each folder and process them.                
                var calcDirFiles = fs.readdirSync(calcDirFileDirectory);                
                for(var incc = 0;incc < calcDirFiles.length; incc = incc + 1){
                    if(calcDirFiles[incc].substr(-4)==='.csv'){
                        var theCSVLocation = calcDirFiles[incc];
                        var theCSV = fs.readFileSync(sourceDir+calcDir+'\\'+theCSVLocation, 'utf8');
                        // make directory.
                        fs.mkdirSync(targetDir+calcDir);
                        // read 10 items from the csv.
                        var theCSVbyRow = theCSV.split(newLine);
                        for(var incd=0;(incd < theCSVbyRow.length) && (incd < 100); incd++){
                            var lineData = theCSVbyRow[incd].split(',');
                            var fileName = lineData[1];
                            fs.appendFileSync(targetDir+calcDir+'\\'+theCSVLocation,lineData+newLine,'utf8');
                            if(fileName){                                
                                var file = fs.readFileSync(sourceDir+calcDir+'\\'+fileName);
                                fs.writeFileSync(targetDir+calcDir+'\\'+fileName,file);
                                /*
                                fs.createReadStream(
                                    sourceDir+calcDir+'\\'+fileName
                                ).pipe(fs.createWriteStream(
                                    targetDir+calcDir+'\\'+fileName
                                ));*/
                            } else {
                                    console.log('***********************');
                                    console.log('NO filename');
                                    console.log(theCSVLocation);
                                    console.log(calcDir);
                                    console.log(lineData);
                                    console.log('***********************');
                                }
                                //console.log(lineData);
                            }
                        break;
                    }
                }
        }
    }            
    });   
    
});                

                /*
            for(var inca = 0; inca < calcDirFiles.length-1;inca++){
                var csvFile = calcDirFiles[inca];
                if(csvFile&&csvFile.substr(-4)==='.csv'){                        
                    fir+=1;
                    console.log(fir + ' : ' + sec + ' : ' + las);
                    // this is the csv file that we now need to look inside,
                    // get some sample data and save.
                    var csvData = fs.readFileSync(sourceDir+calcDir+'\\'+csvFile, 'utf8');
                    sec+=1;
                    console.log(fir + ' : ' + sec + ' : ' + las);
                    fs.mkdirSync(targetDir+calcDir);
                    // we are going to ignore errors.
                    var splitData = csvData.split(newLine);
                    for(var i = 0;i < (splitData.length - 1) && i < 100;i++){
                        las+=1;
                        console.log(fir + ' : ' + sec + ' : ' + las);
                        var lineData = splitData[i].split(',');
                        var fileName = lineData[1];
                        fs.appendFileSync(targetDir+calcDir+'\\'+csvFile,lineData+newLine,'utf8');
                        if(fileName){
                        fs.createReadStream(
                            sourceDir+calcDir+'\\'+fileName
                        ).pipe(fs.createWriteStream(
                            targetDir+calcDir+'\\'+fileName
                        ));
                        } else {
                            console.log('NO filename');
                            console.log(csvData);
                            console.log(calcDir)
                        }
                    }                                        
                }
            }
            */      



/*
//interface
var port = process.env.PORT || 5000;
app.use(express.static('public'));
app.set('views','./src/views');
app.set('view engine', 'ejs');
app.get('/', function(req, res){
    res.render('index', {
        place: 'world'
    });
});


app.listen(port, function(err){
    console.log('running server on port ' + port);
});
*/
