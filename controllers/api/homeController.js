const Product = require('../../models/product');
const ProductCategory = require('../../models/product_category');

const Setting = require('../../models/setting')
const { validationResult } = require('express-validator');


exports.dashboard = async (req, res)=>{
	
	try{
		let categories = await ProductCategory.find().populate('_products').exec();
		let setting = await Setting.find({key:"home_banner"},'value').exec();
		if(!categories.length) return res.json({status: "false", message: "No data found", data: categories});
		return res.json({status: "success", message: "", data: {categories:categories, banner:setting[0].value}});
		
   }catch(err){
		res.status(400).json({status: "success", message: "", data: err});
   }
}

