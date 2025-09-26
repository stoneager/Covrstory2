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
	const [activeVariant, setActiveVariant] = useState(0);

	useEffect(() => {
		if (product) {
			setIsEditMode(true);
			// Fetch quantities and set variants from backend
			productsAPI.getById(product._id).then(response => {
				const variants = groupQuantitiesByColor(response.data.quantities);
				setFormData({
					collection: product.collection?._id || '',
					type: product.type || 'top',
					gender: product.gender || 'm',
					activity: product.activity || '',
					name: product.name || '',
					description: product.description || '',
					variants: variants.length > 0 ? variants : [{
						colour: '',
						price: '',
						sizes: [{ size: 's', qty: 0 }],
						images: []
					}]
				});
			});
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
		setFormData(prev => {
			const newVariants = [...prev.variants, {
				colour: '',
				price: '',
				sizes: [{ size: 's', qty: 0 }],
				images: []
			}];
			// Set active variant to the newly added one using its new index
			setActiveVariant(newVariants.length - 1);
			return { ...prev, variants: newVariants };
		});
	};


	const removeVariant = (index) => {
		if (formData.variants.length === 1) {
			alert('At least one variant is required');
			return;
		}
		const newVariants = formData.variants.filter((_, i) => i !== index);
		setFormData(prev => ({ ...prev, variants: newVariants }));
		setActiveVariant(prev => Math.max(0, prev - (index === prev ? 1 : 0)));
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
			// Validate form data (now includes activity)
			if (!formData.name || !formData.description || !formData.collection || !formData.activity) {
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
		<div className="modal-overlay">
			<div className="modal-content">
				<div className="modal-header">
					<h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
					<button 
						onClick={onClose}
						className="modal-close"
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
        
				<form onSubmit={handleSubmit}>
					<div className="modal-body">
						{/* Basic Product Information */}
						<div className="form-section">
							<h3 className="form-section-title">Basic Information</h3>
							<div className="form-grid">
								<div className="form-group">
									<label className="form-label">Collection *</label>
									<select
										name="collection"
										className="form-control"
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

								<div className="form-group">
									<label className="form-label">Product Name *</label>
									<input
										type="text"
										name="name"
										className="form-control"
										value={formData.name}
										onChange={handleInputChange}
										placeholder="Enter product name"
										required
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Type *</label>
									<select
										name="type"
										className="form-control"
										value={formData.type}
										onChange={handleInputChange}
										required
									>
										<option value="top">Top</option>
										<option value="bottom">Bottom</option>
									</select>
								</div>

								<div className="form-group">
									<label className="form-label">Gender *</label>
									<select
										name="gender"
										className="form-control"
										value={formData.gender}
										onChange={handleInputChange}
										required
									>
										<option value="m">Male</option>
										<option value="f">Female</option>
									</select>
								</div>

								<div className="form-group">
									<label className="form-label">Activity *</label>
									<input
										type="text"
										name="activity"
										className="form-control"
										value={formData.activity}
										onChange={handleInputChange}
										placeholder="e.g., Running, Casual, Training"
										required
									/>
								</div>

								<div className="form-group form-group-full">
									<label className="form-label">Description *</label>
									<textarea
										name="description"
										className="form-control"
										value={formData.description}
										onChange={handleInputChange}
										rows={3}
										placeholder="Enter a detailed product description"
										required
									/>
								</div>

								<div className="variants-toggle-container">
									<div className="variants-toggle-bar">
										{formData.variants.map((_, idx) => (
											<button
												key={idx}
												type="button"
												className={`variant-toggle-btn${activeVariant === idx ? ' active' : ''}`}
												onClick={() => setActiveVariant(idx)}
											>
												{`Variant ${idx + 1}`}
											</button>
										))}
										<button
											type="button"
											className="variant-toggle-btn add-variant-btn"
											onClick={addVariant}
										>
											<FontAwesomeIcon icon={faPlus} /> Add Variant
										</button>
									</div>
									<div className="variants-toggle-nav">
										<button
											type="button"
											className="variant-nav-btn"
											onClick={() => setActiveVariant(v => Math.max(0, v - 1))}
											disabled={activeVariant === 0}
										>
											Prev
										</button>
										<span className="variant-nav-indicator">{`Variant ${activeVariant + 1} of ${formData.variants.length}`}</span>
										<button
											type="button"
											className="variant-nav-btn"
											onClick={() => setActiveVariant(v => Math.min(formData.variants.length - 1, v + 1))}
											disabled={activeVariant === formData.variants.length - 1}
										>
											Next
										</button>
									</div>
									<div className="variant-section">
										<div className="variant-header">
											<h4 className="variant-title">Variant {activeVariant + 1}</h4>
											{formData.variants.length > 1 && (
												<button
													type="button"
													onClick={() => removeVariant(activeVariant)}
													className="btn btn-danger"
												>
													<FontAwesomeIcon icon={faTrash} className="icon-left" />
												</button>
											)}
										</div>
										<div className="variant-grid">
											<div className="form-group">
												<label className="form-label">Color *</label>
												<input
													type="text"
													className="form-control"
													value={formData.variants[activeVariant]?.colour ?? ''}
													onChange={e => handleVariantChange(activeVariant, 'colour', e.target.value)}
													placeholder="e.g., Red, Blue, Black"
													required
												/>
											</div>
											<div className="form-group">
												<label className="form-label">Price (₹) *</label>
												<input
													type="number"
													className="form-control"
													value={formData.variants[activeVariant]?.price ?? ''}
													onChange={e => handleVariantChange(activeVariant, 'price', e.target.value)}
													placeholder="0.00"
													min="0"
													step="0.01"
													required
												/>
											</div>
										</div>
										<div className="sizes-section">
											<div className="form-section-header">
												<label className="form-label">Sizes & Stock</label>
												<button
													type="button"
													onClick={() => addSize(activeVariant)}
													className="btn btn-secondary btn-sm"
												>
													<FontAwesomeIcon icon={faPlus} className="icon-left" />
													Add Size
												</button>
											</div>
											<div className="sizes-container">
												{(formData.variants[activeVariant]?.sizes ?? []).map((size, sizeIndex) => (
													<div key={sizeIndex} className="sizes-grid">
														<select
															className="form-control"
															value={size.size}
															onChange={e => handleSizeChange(activeVariant, sizeIndex, 'size', e.target.value)}
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
															className="form-control"
															placeholder="Stock quantity"
															value={size.qty}
															onChange={e => handleSizeChange(activeVariant, sizeIndex, 'qty', e.target.value)}
															min="0"
															required
														/>
														{(formData.variants[activeVariant]?.sizes?.length ?? 0) > 1 && (
															<button
																type="button"
																onClick={() => removeSize(activeVariant, sizeIndex)}
																className="btn btn-danger btn-sm"
															>
																<FontAwesomeIcon icon={faMinus} />
															</button>
														)}
													</div>
												))}
											</div>
										</div>
										<div className="form-group">
											<label className="form-label">Images</label>
											<div className="image-upload">
												<input
													type="file"
													multiple
													accept="image/*"
													onChange={e => handleImageUpload(activeVariant, e.target.files)}
													disabled={uploadingImages[activeVariant]}
												/>
												{uploadingImages[activeVariant] && (
													<div className="loading-state">
														<div className="loading-spinner"></div>
														<span>Uploading images...</span>
													</div>
												)}
											</div>
											{formData.variants[activeVariant].images.length > 0 && (
												<div className="image-preview-grid">
													{formData.variants[activeVariant].images.map((image, imgIndex) => (
														<div key={imgIndex} className="image-preview-item">
															<img
																src={image}
																alt={`${formData.variants[activeVariant].colour} ${imgIndex + 1}`}
															/>
															<button
																type="button"
																onClick={() => removeImage(activeVariant, imgIndex)}
																className="remove-image-btn"
															>
																<FontAwesomeIcon icon={faTimes} />
															</button>
														</div>
													))}
												</div>
											)}
									</div>
								</div> {/* end variant-section */}
							</div> {/* end variants-toggle-container */}
						</div> {/* end form-grid */}
					</div> {/* end form-section */}
				</div> {/* end modal-body */}
					<div className="modal-footer">
						<button 
							type="button" 
							onClick={onClose}
							className="btn btn-secondary"
						>
							Cancel
						</button>
						<button 
							type="submit" 
							disabled={loading}
							className="btn btn-primary"
						>
							{loading && <div className="spinner"></div>}
							{loading ? 'Saving...' : 
								isEditMode ? 'Update Product' : 'Create Product'
							}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
export default ProductModal;