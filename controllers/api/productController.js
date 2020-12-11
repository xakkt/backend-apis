const Product = require('../../models/product');
const ProductCategory = require('../../models/product_category');
const ProductRegularPricing = require('../../models/product_regular_pricing')

var moment = require('moment');
const { validationResult } = require('express-validator');
const fs = require('fs');
const _global = require('../../helper/common')

exports.list = async (req, res) => {

	try {

		let stores = await StoreProductPricing.find({ '_store': req.params.storeid }).select('-createdAt -updatedAt -__v').populate('_product', 'name image sku').populate('_deal').lean()
		// let products = await Product.find().populate('_category','name logo').lean();
		if (!stores.length) return res.json({ status: "false", message: "No data found", data: [] });
		stores = stores.map(store => {
			//product.image = `${process.env.BASE_URL}/images/products/${product.image}`;
			_product = store._product,
				_deal = store._deal
			delete store._product;
			delete store._deal;
			return { ...store, name: _product.name, image: `${process.env.BASE_URL}/images/products/${_product.image}`, sku: _product.sku, deal: _deal.name }
		})

		return res.json({ status: "success", baseUrl: process.env.BASE_URL, message: "", data: stores });

	} catch (err) {
		console.log(err)
		res.status(400).json({ status: "false", message: "", data: err });
	}
},

	exports.show = async (req, res) => {
		try {
			var productPrice = await _global.productprice(req.body.storeid, req.body.productid)
			const product = await Product.findById(req.body.productid).select("-meta_title -meta_keywords -meta_description -updatedAt -createdAt -__v").lean();
			if (!product) return res.json({ status: "success", message: "Product not found", data: [] });
			product.price = productPrice.regular_price
			product.deal_price = productPrice.deal_price
			return res.json({ status: "success", message: "", data: product });
		} catch (err) {
			res.status(400).json({ status: "false", data: err });
		}


	}
exports.search = async (req, res) => {

	try {
		var search_product = []
		// var pagno = req.query.start / req.query.length + 1
        var page = req.body.page || 1; //for next page pass 1 here
        var limit = req.body.limit || 10;
        let searchString = req.body.search ||''
        let product = await ProductRegularPricing.find({
            _store:req.body._store
        }).populate({
			path: '_product',
			match: { 
				$or: [

					{description: { $regex: '.*' + searchString + '.*', $options: 'i' }}, 
					{"name.english": { $regex:searchString, $options: 'i' } }
			   ],
			 },
		}).skip((page - 1) * limit) //Notice here
            .limit(limit)
			.lean();
			console.log("--value",product)
						await Promise.all(product.map(async (element) => {
				var data = {}
				var productId = element._product._id.toString();
				var productPrice = await _global.productprice(req.body._store, productId)
	
				data = { ...element}
				data._product.image = `${process.env.BASE_URL}/images/products/${element._product.image}`,
				data._product.deal_price = productPrice.deal_price.toFixed(2),
				data._product.regular_price =  productPrice.regular_price.toFixed(2)
				delete data.regular_price 
				search_product.push(data)
	
			}))	



        let total = await ProductRegularPricing.find({
            _store:req.body._store
        }).populate({
			path: '_product',
			match: { 
				$or: [

					 {description: { $regex: '.*' + searchString + '.*', $options: 'i' }}, 
					 {"name.english": { $regex:searchString, $options: 'i' } }
				],
			 },
		})
        return res.json({ draw: page, recordsTotal: total.length, recordsFiltered: total.length, data: search_product })

	} catch (err) {
		console.log("--logs",err)
       return res.status(404).json({message:err.message})
	}

}

