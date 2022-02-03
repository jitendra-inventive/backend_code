var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
const { initDb, getDbUri } = require('./lib/db');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
var eventsRouter = require('./routers/router');
var app = express();
var cors = require('cors');
dotenv.config();
var port = process.env.PORT || 5000;
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('client'));

// Enable CORS on ExpressJS to avoid cross-origin errors when calling this server using AJAX
// We are authorizing all domains to be able to manage information via AJAX (this is just for development)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,recording-session");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', eventsRouter);

const url = "mongodb+srv://jitencompas:Lu0SbLpfNqIPD1vI@cluster0.vpzzn.mongodb.net/codetown?retryWrites=true&w=majority";
// Create a new MongoClient
initDb(url, async (err, db) => {
    if(err){
        console.log(colors.red(`Error connecting to MongoDB: ${err}`));
        process.exit(2);
    }
    app.db = db;
	
	try{
		console.log('connected!');
	}catch(ex){
		console.log('connection failed!');
	}
});

app.listen(port);
console.log("Running app on port port. Visit: http://localhost:" + port + "/");