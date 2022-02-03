var router = require('express').Router();
var _ = require('lodash');
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
var jwtSecretKey = 'jwtTokenauth';
// user login
router.post("/user/login", async (req, res) => {
  const db = req.app.db;
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Access denied. Check fields and try again." });
  }
  console.log(req.body.email, req.body.password);
  const user = await db.users.findOne({ Email: req.body.email });
  console.log(user);
  if (!user || user === null) {
    res.status(400).json({ message: "A user with that email does not exist." });
    return;
  }
  // we have a user under that email so we compare the password
  bcrypt.compare(req.body.password, user.Password).then((result) => {
    if (result) {
    let data = {
        time: Date(),
        Email: req.body.email,
    }
    const token = jwt.sign(data, jwtSecretKey, {
        expiresIn: "1hr"
    });
	console.log(token);
      res.status(200).json({ message: "Login successful", authToken: token });
      return;
    }
    // password is not correct
    res
      .status(400)
      .json({ message: "Access denied. Check password and try again." });
  });
});


// new user create
router.post("/user/create", async (req, res) => {
  const db = req.app.db;
  console.log(req.body);
	const chk1 = await db.users.findOne({ Email: req.body.Email });

	if (chk1) {
	  res.status(400).json({
		message: "A email already exists",
	  });
	  return;
	}
  const userObj = {
    Name: req.body.Name,
    Email: req.body.Email,
    Password: await bcrypt.hashSync(req.body.Password, 10),
    Created: new Date(Date.now()),
  };
  
  try {
    const newCustomer = await db.users.insertOne(userObj);
    res.status(200).json({
      message: "New user Added successfully",
    });
  } catch (ex) {
    console.error("Failed to insert user: ");
    res.status(400).json({
      message: "user creation failed.",
    });
  }
});

// get user data
router.get('/users_account', verifyToken, async (req, res) => {
	console.log('not valid 00');
    const db = req.app.db;
	const usersData = await db.users.find({}).toArray();
	try {
		res.status(200).json({
		  data: usersData,
		  message: "data retrive successfully",
		});
	} catch (ex) {
		console.error("Failed to fatch data ");
		res.status(400).json({
		  message: "Failed to fatch data.",
		});
	}
});

function verifyToken(req, res, next){
	const bearerHeader = req.headers['authorization'];
	if(typeof bearerHeader !== 'undefined'){
		const bearer = bearerHeader.split(' ');
		console.log(bearer[1]);
		req.token = bearer[1];
		jwt.verify(req.token,jwtSecretKey, (err, authData) => {
			if(err){
				res.json({result:err});
			}else{
				next();
			}
		})
	}else{
		res.send({"result":"Token not provide!"})
	}
}
module.exports = router;