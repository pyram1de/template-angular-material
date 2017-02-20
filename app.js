var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var stream = require('stream');
var fileUpload = require('express-fileupload');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var app = express();

var port = process.env.PORT || 5000;
MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
    console.log('Connected to MongoDB Server');
});
app.use(bodyParser());
app.use(fileUpload());
app.use(express.static('public'));
app.set('views','./src/views');

app.set('view engine', 'ejs');
app.get('/', function(req, res){
    res.render('index', {
        place: 'world',
        fileUploaded: undefined
    });
});

app.get('/download', function(req, res){
      res.setHeader('Content-disposition', 'attachment; filename=output.csv');
    res.setHeader('Content-type', 'text/csv');
    var allInstitutions;
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        var myCollection =  db.collection('converted');
        var institutions = db.collection('institutions');
        institutions.find({}).toArray(function(err, inst){
            allInstitutions = inst;
            
            myCollection.find({}).toArray(function(err, data){                            
            var output = Buffer.from('');
            var bytesWritten = 0;
            var offset = 0;
            
            for(var i = 0;i<data.length;i++){                
                var insts;
                for(var x = 0;x<allInstitutions.length;x++){
                    if(parseInt(data[i].paylocationref)===allInstitutions[x].PAYLOCATIONREF)
                    {
                        insts = allInstitutions[x].PAYLOCATIONNAME;
                    }
                }                
                var myBuffer = Buffer.from( '"'+
                        data[i].TITLEFG + '","' +
                        data[i].FORENAMES + '","' +  
                        data[i].SURNAME + '","'  +  
                        data[i].PREVSURNAME + '","' +
                        data[i].GENDERFG + '","' +
                        data[i].MARITALSTATUSFG + '","' + 
                        data[i].NINO + '","' +
                        data[i].DOB + '","' +
                        data[i].DOBVERIFIEDFG + '","' + 
                        data[i].doj._i + '","' + 
                        data[i].STATERETDATE + '","' + 
                        insts + '","' + //inst name","' + // institution name
                        data[i].paylocationref + '",100,,"' + // fraction % salary
                        data[i].ADDRESS1 + '","' + 
                        data[i].ADDRESS2 + '","' +
                        data[i].ADDRESS3 + '","' +
                        data[i].ADDRESS4 + '","' + 
                        data[i].ADDRESS5 + '","' +
                        data[i].POSTCODE + '","' + 
                        data[i].COUNTYFG + '","' +
                        data[i].COUNTRYFG + '",N,N\r\n'); // vte opt out
                var newBuffer = Buffer.alloc(output.length+myBuffer.length);
                output.copy(newBuffer,0,0,output.length);
                myBuffer.copy(newBuffer,output.length,0,myBuffer.length);   
                output = newBuffer;             
            }
            
            var bufferStream = new stream.PassThrough();
            bufferStream.end(output);            
            bufferStream.pipe(res);  
        });                 
        });
    });
     
});

app.get('/updateMembersWithInstName', function(req, res){
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        var allMembers = db.collection('bulk_joiner');
        allMembers.find({})
        
    });
});

app.get('/downloadInsert', function(req, res){
    res.setHeader('Content-disposition', 'attachment; filename=output.csv');
    res.setHeader('Content-type', 'text/csv');
    var allInstitutions;
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        var myCollection =  db.collection('converted');
        var institutions = db.collection('institutions');
        institutions.find({}).toArray(function(err, inst){
            allInstitutions = inst;
            
            myCollection.find({}).toArray(function(err, data){                            
            var output = Buffer.from('');
            var bytesWritten = 0;
            var offset = 0;
            var script = `
/*
declare\r\n
    eformId number(9,0):=0;\r\n
    eformFieldId number(9,0):=0;\r\n
begin   */\r\n
    eformId:= USS_INST_EFORM_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform values(eformId, 'UPMClient', 116, 'JOINCARE', 'CA_CREATE_NEW_JOINERS', NULL, SYSDATE, NULL, NULL);\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'surname','S','{{surname}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'dobver','S','{{dobver}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'rejoiner_existingmembership','S','N');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'dob','S','{{dob}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'maritalstatus','S','{{maritalstatus}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'gender','S','{{gender}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'rejoiner_existingactivecarerecord','S','N');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'doj','S','{{doj}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'membertypeserv','S','N');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'membertypeserv','S','N');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'caremembership','S','Y');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'careoptout_ae','S','N');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'multiemp','S','Y');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'multiemp','S','Y');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'nino','S','{{nino}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'forenames','S','{{forenames}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'title','S','{{title}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'instpaylocation','S','{{instpaylocation}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'instname','S','{{instname}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'country','S','{{country}}'); \r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add1','S','{{add1}}'); \r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'postcode','S','{{postcode}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'towncity','S','{{towncity}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add2','S','{{add2}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'county','S','{{county}}');\r\n
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();\r\n
    insert into uss_inst_eform_field values(eformFieldId,eformId,'personref','S','{{personref}}');\r\n
    /*   \r\n
end;*/\r\n\r\n
            `;
            for(var i = 0;i<data.length;i++){                
                var insts;
                for(var x = 0;x<allInstitutions.length;x++){
                    if(parseInt(data[i].paylocationref)===allInstitutions[x].PAYLOCATIONREF)
                    {
                        insts = allInstitutions[x].PAYLOCATIONNAME;
                        data[i].PAYLOCATIONNAME = allInstitutions[x].PAYLOCATIONNAME;
                        data[i].PAYLOCATIONID = allInstitutions[x]._id;
                    }
                }                
                var myBuffer = Buffer.from(
                        script
                            .replace('{{title}}',data[i].TITLEFG)
                            .replace('{{forenames}}',data[i].FORENAMES)
                            .replace('{{forenames}}',data[i].FORENAMES)
                            .replace('{{surname}}',data[i].SURNAME)
                            .replace('{{gender}}',data[i].GENDERFG)
                            .replace('{{maritalstatus}}',data[i].MARITALSTATUSFG)
                            .replace('{{nino}}',data[i].NINO)
                            .replace('{{dob}}',data[i].DOB)
                            .replace('{{dobver}}',data[i].DOBVERIFIEDFG)
                            .replace('{{doj}}',data[i].doj._i)
                            .replace('{{add1}}',data[i].ADDRESS1.replace("'","''"))
                            .replace('{{add2}}',data[i].ADDRESS2.replace("'","''"))
                            .replace('{{towncity}}',data[i].ADDRESS3.replace("'","''"))
                            .replace('{{county}}',data[i].COUNTYFG.replace("'","''"))
                            .replace('{{country}}',data[i].COUNTRYFG.replace("'","''"))
                            .replace('{{postcode}}',data[i].POSTCODE.replace("'","''"))
                            .replace('{{altname}}',data[i].PREVSURNAME.replace("'","''"))
                            .replace('{{instpaylocation}}',data[i].PAYLOCATIONID)
                            .replace('{{instname}}',data[i].PAYLOCATIONNAME.replace("'","''"))
                            .replace('{{personref}}',data[i].PERSONREF1)
                            );
                            /*
                        data[i].PREVSURNAME + '","' +
                        data[i].STATERETDATE + '","' + 
                        insts + '","' + //inst name","' + // institution name
                        data[i].paylocationref + '",100,,"' + // fraction % salary                                                                        
                        data[i].ADDRESS4 + '","' + 
                        data[i].ADDRESS5 + '","' +                        
                        */
                var newBuffer = Buffer.alloc(output.length+myBuffer.length);
                output.copy(newBuffer,0,0,output.length);
                myBuffer.copy(newBuffer,output.length,0,myBuffer.length);   
                output = newBuffer;             
            }
            
            var bufferStream = new stream.PassThrough();
            bufferStream.end(output);            
            bufferStream.pipe(res);  
        });                 
        });
    });
     
});

app.post('/upload', function(req, res) {
  // Uploaded files: 
  //console.log(req.files.csvFile.name);
  var lines = req.files.csvFile.data.toString('utf8').split('\n');
  
  MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        console.log('Connected to MongoDB Server');
        var bulkJoiner = db.collection('bulk_joiner');
        var convertedCollection = db.collection('converted');
        convertedCollection.remove();
        var members = {};
        var Member = function(nino, surname, paylocationref, contributiondate) {
                return {
                    nino: nino,
                    surname: surname,
                    paylocationref: paylocationref,
                    contributiondate: contributiondate
                };
            };                   
        var i = 0;
        for(i = 0;i< lines.length;i=i+1){
            var line = lines[i].split(',');
            var member = new Member(line[1],line[0],line[2],moment(line[3],'DD-MMM-YY'));
            var currentMember = members[member.nino];
            if(currentMember===undefined){
                members[member.nino] = member;
            } else {
                if(moment(member.contributiondate).isBefore(currentMember.contributiondate)){
                    members[member.nino] = member;
                }
            }            
        }
        
        var consolidatedMemberList = _.mapObject(members,function(val,key){
            return val;
        });

        var arr = _.toArray(consolidatedMemberList);

        arr.forEach(function(person){
            bulkJoiner.findOne({
                        'NINO': person.nino,
                        'SURNAME': person.surname
                    },function(err, data){
                            if(data){
                                // found someone so log it into the new db
                                var newdata = data;
                                newdata.doj = person.contributiondate;
                                newdata.paylocationref = person.paylocationref;
                                convertedCollection.insert(newdata);
                            }
                    }); 
        });
/*
        consolidated_members_list.forEach(function(person){
        var p  = bulk_joiner.findOne({
                    "NINO": person.nino,
                    "SURNAME": person.surname
                },function(a, b){
                        console.log(a);
                        console.log(b);
                });     */                    
    });

    //var members = [];
    //lines.forEach(function(line){
    //    var data = line.split(',');
    //    
    //    member.nino = data[1];
    //    member.surname = data[0];
    //    member.paylocationref = data[2];
    //    member.contributiondate = moment(data[3]);
    //    var sameMember = false;
    //    members.forEach(function(m){
    //        if(m.nino===member.nino&&m.surname===member.surname){
    //            sameMember = true;
    //            if(moment(member.contributiondate).isBefore(m.contributiondate)){
    //                m.contributiondate = member.contributiondate;
    //            }
    //        }
    //        sameMember = false;
    //    });
    //    if(!sameMember){
    //        //console.log('adding member ' + member.nino);
    //        members.push(member);
    //    }
    //    console.log(members.length);
        /*bulk_joiner.find({
            "NINO": dataIs.nino,
            "SURNAME": dataIs.surname
        }).toArray(function(err, docs){
            //console.log(docs);
            console.log(dataIs.nino);
            if(docs.length>1){
                console.log(dataIs.nino);
                console.log('found too many');
            } else if(docs.length===1) {
                console.log('found 1');
            } else {
                console.log('found none');
            }
        });*/


  res.redirect('/');
});

app.listen(port, function(err){
    console.log('running server on port ' + port);
});