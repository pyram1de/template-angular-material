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
    var rejectedData = [];
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        var rejectedCollection = db.collection('rejected');
        rejectedCollection.find({}).toArray(function(err,data){
            rejectedData=data;
            res.render('index', {
                place: 'world',
                fileUploaded: undefined,
                rejectedData: rejectedData
            });
        });
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
                        (data[i].COUNTYFG || 'UK')+ '","' +
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
declare
    eformId number(9,0):=0;
    eformFieldId number(9,0):=0;
begin   --*/
    eformId:= USS_INST_EFORM_SEQ.NEXTVAL();
    insert into uss_inst_eform values(eformId, 'UPMClient', 116, 'JOINCARE', 'CA_CREATE_NEW_JOINERS', NULL, SYSDATE, NULL, NULL);
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'surname','S','{{surname}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'dobver','S','{{dobver}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'rejoiner_existingmembership','S','N');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'dob','S','{{dob}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'maritalstatus','S','{{maritalstatus}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'gender','S','{{gender}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'rejoiner_existingactivecarerecord','S','N');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'doj','S','{{doj}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'membertypeserv','S','{{membertypeserv}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'caremembership','S','Y');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'careoptout_ae','S','N');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'multiemp','S','Y');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'nino','S','{{nino}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'forenames','S','{{forenames}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'title','S','{{title}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'instpaylocation','S','{{instpaylocation}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'instname','S','{{instname}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'country','S','{{country}}'); 
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add1','S','{{add1}}'); 
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'postcode','S','{{postcode}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'towncity','S','{{towncity}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add2','S','{{add2}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add3','S','{{add3}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'add4','S','{{add4}}');        
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'county','S','{{county}}');
    eformFieldId:= USS_INST_EFORM_FIELD_SEQ.NEXTVAL();
    insert into uss_inst_eform_field values(eformFieldId,eformId,'personref','S','{{personref}}');
    /*   
end;--*/\r\n
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
                //console.log('address: ' + data[i].ADDRESS1);
                var currentMember = script
                            .replace('{{title}}',data[i].TITLEFG)
                            .replace('{{forenames}}',data[i].FORENAMES.replace("'","''"))
                            .replace('{{surname}}',data[i].SURNAME.replace("'","''"))
                            .replace('{{gender}}',data[i].GENDERFG)
                            .replace('{{maritalstatus}}',data[i].MARITALSTATUSFG)
                            .replace('{{nino}}',data[i].NINO)
                            .replace('{{dob}}',moment(data[i].DOB,'DD-MMM-YYYY').format('DD/MM/YYYY'))
                            .replace('{{dobver}}',data[i].DOBVERIFIEDFG)
                            .replace('{{doj}}',moment(data[i].doj._i,'DD-MMM-YY').date(1).format('DD/MM/YYYY'))                            
                            .replace('{{add1}}','CO USS LTD'===data[i].ADDRESS1 ? '': (data[i].ADDRESS1+'').replace("'","''"))
                            .replace('{{add2}}',data[i].ADDRESS2.replace("'","''"))
                            .replace('{{add3}}',data[i].ADDRESS3.replace("'","''"))
                            .replace('{{add4}}',data[i].ADDRESS4.replace("'","''"))
                            .replace('{{towncity}}',data[i].ADDRESS5.replace("'","''"))
                            .replace('{{county}}',data[i].COUNTY.replace("'","''"))
                            .replace('{{country}}','CO USS LTD'===data[i].ADDRESS1 ? '': (data[i].COUNTRY || 'United Kingdom').replace("'","''"))
                            .replace('{{postcode}}',(''+data[i].POSTCODE).replace("'","''"))
                            .replace('{{altname}}',data[i].PREVSURNAME.replace("'","''"))
                            .replace('{{instpaylocation}}',data[i].PAYLOCATIONID)
                            .replace('{{instname}}',data[i].PAYLOCATIONNAME.replace("'","''"))
                            .replace('{{personref}}',data[i].PERSONREF1)       
                            .replace('{{membertypeserv}}',data[i].memberisvte);

                var myBuffer = Buffer.from(currentMember);
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
  var lines = req.files.csvFile.data.toString('utf8').split('\n');
  MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
        console.log('Connected to MongoDB Server');
        var bulkJoiner = db.collection('bulk_joiner');
        var convertedCollection = db.collection('converted');
        var rejectedCollection = db.collection('rejected');
        convertedCollection.remove();
        rejectedCollection.remove();
        var members = {};
        var Member = function(  nino, 
                                surname, 
                                paylocationref, 
                                contributiondate,
                                memberisvte) {                                                    
                return {
                    nino: nino,
                    surname: surname,
                    paylocationref: paylocationref,
                    contributiondate: contributiondate,
                    memberisvte: memberisvte==='VTE'?'Y':'N'
                };
            };                   
        var i = 0;
        for(i = 0;i< lines.length;i=i+1){
            var line = lines[i].split(',');
            var member = new Member(
                                line[1],
                                line[0],
                                line[2],
                                moment(line[3],'DD-MMM-YY'),
                                line[7]);
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
            if(person.nino&&person.nino.indexOf('TN')===0){
                rejectedCollection.insert(person);
            } else {
                bulkJoiner.findOne({
                        'NINO': person.nino // now only matching on NINO
                        //,'upperSurname': (person.surname + '').toUpperCase() 
                    },function(err, data){
                            if(data){
                                // found someone so log it into the new db
                                var newdata = data;
                                newdata.doj = person.contributiondate;
                                newdata.paylocationref = person.paylocationref;
                                newdata.memberisvte = person.memberisvte;
                                convertedCollection.insert(newdata);
                            } else {
                                rejectedCollection.insert(person);
                            }
                    }); 
            }
        });                  
    });
  res.redirect('/');
});

app.listen(port, function(err){
    console.log('running server on port ' + port);
});