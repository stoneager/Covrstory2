import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, uploadAPI } from '../services/api';

const ProductModal = ({ product, collections, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		collection: '',
		type: 'top',
		gender: 'm',
		activity: '',
		name: '',
		description: '',
		variants: [{
			colour: '',
			price: '',
			sizes: [{ size: 's', qty: 0 }],
			images: []
		}]
	});
	const [quantities, setQuantities] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [uploadingImages, setUploadingImages] = useState({});

	useEffect(() => {
		if (product) {
			setIsEditMode(true);
			setFormData({
				collection: product.collection._id,
				type: product.type,
				gender: product.gender,
				activity: product.activity,
				name: product.name,
				description: product.description,
				variants: []
			});
			fetchProductQuantities();
		}
	}, [product]);

	const fetchProductQuantities = async () => {
		try {
			const response = await productsAPI.getById(product._id);
			setQuantities(response.data.quantities);
			// Group quantities by color for editing
			const variants = groupQuantitiesByColor(response.data.quantities);
			setFormData(prev => ({ ...prev, variants }));
		} catch (error) {
			console.error('Error fetching product quantities:', error);
		}
	};

	const groupQuantitiesByColor = (quantities) => {
		const grouped = {};
		quantities.forEach(qty => {
			if (!grouped[qty.colour]) {
				grouped[qty.colour] = {
					colour: qty.colour,
					price: qty.price,
					sizes: [],
					images: qty.images || []
				};
			}
			grouped[qty.colour].sizes.push({
				_id: qty._id,
				size: qty.size,
				qty: qty.qty
			});
		});
		return Object.values(grouped);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleVariantChange = (index, field, value) => {
		const newVariants = [...formData.variants];
		newVariants[index][field] = value;
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].sizes[sizeIndex][field] = value;
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const addVariant = () => {
		setFormData(prev => ({
			...prev,
			variants: [...prev.variants, {
				colour: '',
				price: '',
				sizes: [{ size: 's', qty: 0 }],
				images: []
			}]
		}));
	};

	const removeVariant = (index) => {
		if (formData.variants.length === 1) {
			alert('At least one variant is required');
			return;
		}
		const newVariants = formData.variants.filter((_, i) => i !== index);
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const addSize = (variantIndex) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].sizes.push({ size: 's', qty: 0 });
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const removeSize = (variantIndex, sizeIndex) => {
		const newVariants = [...formData.variants];
		if (newVariants[variantIndex].sizes.length === 1) {
			alert('At least one size is required per variant');
			return;
		}
		newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const removeImage = (variantIndex, imageIndex) => {
		const newVariants = [...formData.variants];
		newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
		setFormData(prev => ({ ...prev, variants: newVariants }));
	};

	const handleImageUpload = async (variantIndex, files) => {
		try {
			const productName = formData.name;
			const color = formData.variants[variantIndex].colour;
			
			if (!productName || !color) {
				alert('Please enter product name and color before uploading images');
				return;
			}

			setUploadingImages(prev => ({ ...prev, [variantIndex]: true }));
			const uploadedUrls = [];
			
			for (const file of Array.from(files)) {
				// Request presigned URL from backend
				const presignedRes = await uploadAPI.productPresigned(productName, color, file.name, file.type);
				const { url, key } = presignedRes.data;
				
				// Upload file to S3
				const s3Response = await fetch(url, {
					method: 'PUT',
					headers: {
						'Content-Type': file.type
					},
					body: file
				});
				
				if (s3Response.ok) {
					const s3Url = `https://${process.env.REACT_APP_S3_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${key}`;
					uploadedUrls.push(s3Url);
				} else {
					alert('Image upload to S3 failed. Please try again.');
				}
			}
			
			const newVariants = [...formData.variants];
			newVariants[variantIndex].images = [
				...newVariants[variantIndex].images,
				...uploadedUrls
			];
			setFormData(prev => ({ ...prev, variants: newVariants }));
		} catch (error) {
			console.error('Error uploading images:', error);
			alert('Image upload failed. Please try again.');
		} finally {
			setUploadingImages(prev => ({ ...prev, [variantIndex]: false }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Validate form data
			if (!formData.name || !formData.description || !formData.collection) {
				alert('Please fill in all required fields');
				setLoading(false);
				return;
			}

			// Validate variants
			for (const variant of formData.variants) {
				if (!variant.colour || !variant.price) {
					alert('Please fill in color and price for all variants');
					setLoading(false);
					return;
				}
				if (variant.sizes.length === 0) {
					alert('Each variant must have at least one size');
					setLoading(false);
					return;
				}
			}

			if (isEditMode) {
				// Update existing product - now supports updating all fields
				const updateData = {
					collection: formData.collection,
					type: formData.type,
					gender: formData.gender,
					activity: formData.activity,
					name: formData.name,
					description: formData.description,
					variants: formData.variants.map(variant => ({
						...variant,
						price: parseFloat(variant.price),
						sizes: variant.sizes.map(size => ({
							...size,
							qty: parseInt(size.qty)
						}))
					}))
				};
				
				await productsAPI.updateProduct(product._id, updateData);
			} else {
				// Create new product
				await productsAPI.create({
					...formData,
					variants: formData.variants.map(variant => ({
						...variant,
						price: parseFloat(variant.price),
						sizes: variant.sizes.map(size => ({
							...size,
							qty: parseInt(size.qty)
						}))
					}))
				});
			}
			onSave();
		} catch (error) {
			console.error('Error saving product:', error);
			alert('Error saving product. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
					<h2 className="text-2xl font-bold text-gray-900">
						{isEditMode ? 'Edit Product' : 'Add New Product'}
					</h2>
					<button 
						onClick={onClose}
						className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
					>
						<FontAwesomeIcon icon={faTimes} className="text-gray-600" />
					</button>
				</div>
        
				<form onSubmit={handleSubmit} className="flex flex-col h-full">
					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						{/* Basic Product Information */}
						<div className="bg-gray-50 rounded-xl p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Collection *</label>
									<select
										name="collection"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.collection}
										onChange={handleInputChange}
										required
									>
										<option value="">Select Collection</option>
										{collections.map(collection => (
											<option key={collection._id} value={collection._id}>
												{collection.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
									<input
										type="text"
										name="name"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.name}
										onChange={handleInputChange}
										placeholder="Enter product name"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
									<select
										name="type"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.type}
										onChange={handleInputChange}
										required
									>
										<option value="top">Top</option>
										<option value="bottom">Bottom</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
									<select
										name="gender"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.gender}
										onChange={handleInputChange}
										required
									>
										<option value="m">Male</option>
										<option value="f">Female</option>
									</select>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">Activity *</label>
									<input
										type="text"
										name="activity"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.activity}
										onChange={handleInputChange}
										placeholder="e.g., Running, Casual, Formal"
										required
									/>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
									<textarea
										name="description"
										rows="4"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
										value={formData.description}
										onChange={handleInputChange}
										placeholder="Enter product description"
										required
									/>
								</div>
							</div>
						</div>

						{/* Product Variants */}
						<div className="bg-gray-50 rounded-xl p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
								<button 
									type="button" 
									onClick={addVariant}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
								>
									<FontAwesomeIcon icon={faPlus} />
									Add Variant
								</button>
							</div>

							<div className="space-y-6">
								{formData.variants.map((variant, variantIndex) => (
									<div key={variantIndex} className="bg-white border border-gray-200 rounded-xl p-6">
										<div className="flex items-center justify-between mb-4">
											<h4 className="text-md font-semibold text-gray-800">Variant {variantIndex + 1}</h4>
											{formData.variants.length > 1 && (
												<button 
													type="button" 
													onClick={() => removeVariant(variantIndex)}
													className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
												>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
												<input
													type="text"
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													value={variant.colour}
													onChange={(e) => handleVariantChange(variantIndex, 'colour', e.target.value)}
													placeholder="e.g., Red, Blue, Black"
													required
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
												<input
													type="number"
													className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
													value={variant.price}
													onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
													placeholder="0.00"
													min="0"
													step="0.01"
													required
												/>
											</div>
										</div>

										{/* Sizes & Stock */}
										<div className="mb-4">
											<div className="flex items-center justify-between mb-3">
												<label className="block text-sm font-medium text-gray-700">Sizes & Stock</label>
												<button 
													type="button" 
													onClick={() => addSize(variantIndex)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
												>
													<FontAwesomeIcon icon={faPlus} />
													Add Size
												</button>
											</div>

											<div className="space-y-2">
												{variant.sizes.map((size, sizeIndex) => (
													<div key={sizeIndex} className="flex items-center gap-3">
														<select
															className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
															value={size.size}
															onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
															required
														>
															<option value="xs">XS</option>
															<option value="s">S</option>
															<option value="m">M</option>
															<option value="l">L</option>
															<option value="xl">XL</option>
															<option value="xxl">XXL</option>
														</select>
														<input
															type="number"
															className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
															placeholder="Stock quantity"
															value={size.qty}
															onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'qty', e.target.value)}
															min="0"
															required
														/>
														{variant.sizes.length > 1 && (
															<button 
																type="button" 
																onClick={() => removeSize(variantIndex, sizeIndex)}
																className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
															>
																<FontAwesomeIcon icon={faMinus} />
															</button>
														)}
													</div>
												))}
											</div>
										</div>

										{/* Images */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
											<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors duration-200">
												<input
													type="file"
													multiple
													accept="image/*"
													onChange={(e) => handleImageUpload(variantIndex, e.target.files)}
													className="w-full"
													disabled={uploadingImages[variantIndex]}
												/>
												{uploadingImages[variantIndex] && (
													<div className="flex items-center justify-center mt-2 text-blue-600">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
														Uploading images...
													</div>
												)}
											</div>
											
											{variant.images.length > 0 && (
												<div className="grid grid-cols-4 gap-3 mt-4">
													{variant.images.map((image, imgIndex) => (
														<div key={imgIndex} className="relative group">
															<img 
																src={image} 
																alt={`${variant.colour} ${imgIndex + 1}`} 
																className="w-full h-20 object-cover rounded-lg border border-gray-200"
															/>
															<button
																type="button"
																onClick={() => removeImage(variantIndex, imgIndex)}
																className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
															>
																<FontAwesomeIcon icon={faTimes} className="text-xs" />
															</button>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
						<button 
							type="button" 
							onClick={onClose}
							className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						>
							Cancel
						</button>
						<button 
							type="submit" 
							disabled={loading}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center gap-2"
						>
							{loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
							
							{loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProductModal;