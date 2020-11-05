const Product = require('../../models/product');
const ProductCategory = require('../../models/product_category');
const StoreProductPricing = require('../../models/store_product_pricing')

var moment = require('moment');
const { validationResult } = require('express-validator');
const fs = require('fs');

exports.list = async (req, res)=>{
	
	  try{
		

	  let stores  = 	 await StoreProductPricing.find({'_store':req.params.id}).select('-createdAt -updatedAt -__v').populate('_product','name image sku').populate('_deal').lean()
			// let products = await Product.find().populate('_category','name logo').lean();
			 if(!stores.length) return res.json({status: "false", message: "No data found", data: []});
			 stores = stores.map( store =>{
					//product.image = `${process.env.BASE_URL}/images/products/${product.image}`;
					_product = store._product,
					_deal = store._deal
					delete store._product;
					delete store._deal;
					return {...store,name: _product.name,image: `${process.env.BASE_URL}/images/products/${_product.image}`, sku: _product.sku,deal:_deal.name }
			 })
			
			// products = await products.map( (product) =>{
			// 	 product.image = `${process.env.BASE_URL}/images/products/${product.image}`;
			// 	 return product;
			// } )
			 return res.json({status: "success", baseUrl:process.env.BASE_URL, message: "", data: stores});
			
	   }catch(err){
		   console.log(err)
			res.status(400).json({status: "false", message: "", data: err});
	   }
},

exports.show =  async (req, res)=> { 
	try{
		const product = await Product.findById(req.params.id).exec();
		if(!product) return res.json({status: "success", message: "Product not found", data: []});
		return res.json({status: "success", message: "", data: product});
	 }catch(err){
		res.status(400).json({status: "false", data: err});
   }
	
	
}

