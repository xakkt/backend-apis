const User = require('../../models/user');

var randomstring = require("randomstring");
const express = require('express');
const bcrypt = require('bcrypt');	
const saltRounds = 10;
const jwt = require('jsonwebtoken');				
var moment = require('moment');
const { validationResult } = require('express-validator');

const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//const transporter = require('../../config/transporter-mail');


class Mail { 

	 constructor(info){
		 this.email = info.email;
		 this.subject = 'Xakkt New Password'
		 this.body = `Here's your autogenerrated password <b>${info.password}</b>  . It is recommonded to change password after using it.`;
	 }
     async sendmail(){
								
				    let info = await transporter.sendMail({
					from: `Message from @xakkt.com <donotreply@xakkt.com>`, // sender address
					to: this.email, // list of receivers
					subject: this.subject, // Subject line
					html: `${this.body}` 
				});

				return info;	
		
	 }

}


exports.check = function(req, res){

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	res.json(req.body.email); 
},
 
exports.list = function(req, res){
			
		let query = User.find({},{password:false, updatedAt:false}).exec();
		query.then(function(result){
			res.json({status:"success", users: result}); 
		}).catch(err=>{ console.log(err); res.status(400).json({status:"false", data:err}) }); 	
	
},

exports.getUser = async(req, res)=>{
	try{
		const user = await User.findById(req.params.id,{password:false, updatedAt:false}).exec();
		res.json({status: "success", message: "", data: user});
	 }catch(err){
		res.status(400).json({status: "false", data: err});
   }
}

exports.create = async (req, res) => { 
	const errors = await validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	  }
		let userinfo =  { 
							first_name: req.body.first_name,
							last_name: req.body.last_name, 
							email: req.body.email,
							password: req.body.password, 
							contact_no: req.body.contact_no, 
							status: req.body.status,
							last_login:req.body.last_login,
							ncrStatus:req.body.ncrStatus,
							superbuckId:req.body.superbuckId,
							timezone:req.body.timezone,
							dob: moment(req.body.dob).format('YYYY-MM-DD') 
						}
		User.create(userinfo,function (err, result) {
						if (err) return res.status(400).json({ data: err.message }); 

						//mail.sendmail();
						return res.json({status: "success", message: "User Created.", data: result});
						
						});
			
}; 

exports.updateProfile = async function(req, res){

	try{
		let userinfo =  {
						first_name: req.body.first_name,
						last_name: req.body.last_name, 
						email: req.body.email,
						password: req.body.password, 
						contact_no: req.body.contact_no, 
						status: req.body.status,
						last_login:req.body.last_login,
						ncrStatus:req.body.ncrStatus,
						superbuckId:req.body.superbuckId,
						timezone:req.body.timezone,
						dob: moment(req.body.dob).format('YYYY-MM-DD') 
				}

		if(req.file){ userinfo.profile_pic=req.file.path.replace('public/',''); }
		const user =  await User.findByIdAndUpdate({ _id: req.params.id }, userinfo,{ new: true, upsert: true });

		if(!user) return res.status(400).json({status:false, message: "User not found"});
			
		res.json({status:true, message: "User updated", data:user});
				
			
		
	} catch(err){
		res.status(400).json({status:false, message: "Not updated", data:err});
	}
	

}

exports.authenticate = async (req, res) => { 

	try{
		const errors = await validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const userInfo = await User.findOne({email:req.body.email}).exec();
		if(!userInfo) return res.status(400).json({message: "User does not exist with this email."}); 
		
		if(!bcrypt.compareSync(req.body.password, userInfo.password)) return res.status(400).json({status:false, message: "Invalid password!!!", data:null});
		
		const token = await jwt.sign({id: userInfo._id}, process.env.JWT_SECRET, { expiresIn: '30d' }); 
		return res.json({status:true, message: "user found!!!", data:{user: userInfo, token:token}});	
	
	}catch(err){
		res.status(400).json({status:false, message: "", data:err});
	}
	
},

exports.updatestatus = async (req, res,) => {
		
			try{
				const user =  await User.updateOne({ _id: req.params.userid }, { rider_status: req.params.status });
				if(user.nModified){
					res.json({status:true, message: "Status updated"});
				}else{
					res.json({status:false, message: "Not found"});
				}
			}catch(err){
				res.status(400).json({status:false, message: "Not updated", data:err});
			}
			
},

	exports.forgotPassword = async (req, res)=>{
	
		try{
				const password = randomstring.generate({length: 12,	charset: 'alphanumeric' });
				const info = {email:req.query.email, password:password}
				mail = new Mail(info);
				const encrypted_password = await bcrypt.hashSync(password, saltRounds);
				const user =  await User.updateOne({ email: req.query.email }, { password: encrypted_password });
				
				if(user.nModified){
					if(mail.sendmail())
					{
						res.status(200).json({status:true,'data':'Auto-generated password is sent to your email.'});
					}else{
						res.status(400).json({'data':'Unable to send mail'})
					}
					
				}else{
					res.status(400).json({status:false, message: "Email not found"});
				}

					
	   }catch(err){
				res.status(400).json({'data':err})
	   }
	},
	exports.changePassword = async (req,res)=>{
		try{
						
			const encrypted_password = await bcrypt.hashSync(req.body.password, saltRounds);
			
			const query = User.findOne({email:req.body.email}).exec();
			const userInfo = await query.then();
			console.log(encrypted_password); 

			if(userInfo != null && bcrypt.compareSync(req.body.oldpassword, userInfo.password)) {
					const query = User.updateOne({email:req.body.email }, { password: encrypted_password }).exec();
					query.then(function(result){
						res.status(200).json({status:true, message: "Pasword updated", data: result});
					})
				
			}else{
				res.status(400).json({status:false, message: "Invalid email/password!!!", data:null});
			}
			 

		}catch(err){
			res.status(400).json({status:false, message: "not updated", data:err});
		}   
	}


