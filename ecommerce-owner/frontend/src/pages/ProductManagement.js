import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { productsAPI, collectionsAPI } from '../services/api';
import ProductModal from '../components/ProductModal';

const ProductManagement = () => {
	const [products, setProducts] = useState([]);
	const [collections, setCollections] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		fetchProducts();
		fetchCollections();
	}, []);

	useEffect(() => {
		const delayedSearch = setTimeout(() => {
			if (searchTerm !== '') {
				fetchProducts();
			}
		}, 500);

		return () => clearTimeout(delayedSearch);
	}, [searchTerm]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await productsAPI.getAll(searchTerm);
			setProducts(response.data);
			console.log('Fetched products:', response.data);
			console.log('Variants : ', response.data.variants);
		} catch (error) {
			console.error('Error fetching products:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCollections = async () => {
		try {
			const response = await collectionsAPI.getAll();
			setCollections(response.data);
		} catch (error) {
			console.error('Error fetching collections:', error);
		}
	};

	const handleAddProduct = () => {
		setSelectedProduct(null);
		setShowModal(true);
	};
	const handleEditProduct = (product) => {
		setSelectedProduct(product);
		setShowModal(true);
	};

	const handleDeleteProduct = async (productId) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				await productsAPI.delete(productId);
				fetchProducts();
			} catch (error) {
				console.error('Error deleting product:', error);
			}
		}
	};
	const handleModalClose = () => {
		setShowModal(false);
		setSelectedProduct(null);
	};

	const handleModalSave = () => {
		fetchProducts();
		handleModalClose();
	};
	return (
		<div>
			<div className="card-header">
				<div>
					<h1 className="card-title">Product Management</h1>
					<p className="text-gray-600 text-lg mt-2">Manage your product catalog and inventory</p>
				</div>
				<button className="btn btn-primary" onClick={handleAddProduct}>
					<FontAwesomeIcon icon={faPlus} />
					Add Product
				</button>
			</div>
			
			<div className="card">
				<div className="mb-6">
					<div className="form-group" style={{ marginBottom: '0', maxWidth: '400px' }}>
						<label className="form-label">Search Products</label>
						<div style={{ position: 'relative' }}>
							<input 
								type="text" 
								className="form-control" 
								placeholder="Search by name, collection, or category..."
							    value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								style={{ paddingLeft: '35px' }}
							/>
							<FontAwesomeIcon 
								icon={faSearch} 
								style={{ 
									position: 'absolute', 
									left: '12px', 
									top: '50%', 
									transform: 'translateY(-50%)',
									color: '#94a3b8'
								}} 
							/>
						</div>
					</div>
				</div>
				
				{loading ? (
					<div className="loading-spinner">
						<div className="spinner"></div>
					</div>
				) : (
					<div className="product-grid">
						{products.map(product => (
							<div key={product._id} className="product-card">
								{/* Image previews grouped by color/variant */}
								{product.variants && product.variants.length > 0 && (
									<div style={{ marginBottom: '16px' }}>
										{product.variants.map((variant, vIdx) => (
											<div key={vIdx} style={{ marginBottom: '12px' }}>
												<div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '6px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
													Color: {variant.colour}
												</div>
												<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
													{variant.images && variant.images.length > 0 ? (
														variant.images.map((img, imgIdx) => (
															<img
																key={imgIdx}
																src={img}
																alt={`${product.name} ${variant.colour} ${imgIdx + 1}`}
																style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
															/>
														))
													) : (
														<span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>No images</span>
													)}
												</div>
											</div>
										))}
									</div>
								)}
								<div className="product-info">
									<h3 className="product-name">{product.name}</h3>
									<p className="product-description">{product.description}</p>
									<div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
										<div style={{ marginBottom: '4px' }}><strong>Collection:</strong> {product.collection?.name}</div>
										<div style={{ marginBottom: '4px' }}><strong>Category:</strong> {product.type} | {product.gender === 'm' ? 'Men' : 'Women'}</div>
										<div><strong>Activity:</strong> {product.activity}</div>
									</div>
									<div className="product-actions">
										<button 
											className="btn btn-primary"
											onClick={() => handleEditProduct(product)}
										>
											<FontAwesomeIcon icon={faEdit} />
											Edit
										</button>
										<button 
											className="btn btn-danger"
											onClick={() => handleDeleteProduct(product._id)}
										>
											<FontAwesomeIcon icon={faTrash} />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && products.length === 0 && (
					<div className="text-center py-16">
						<div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
							<FontAwesomeIcon icon={faBoxes} className="text-3xl text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-4">
							{searchTerm ? 'No products found' : 'No products yet'}
						</h3>
						<p className="text-gray-600 mb-8">
							{searchTerm ? 'Try adjusting your search terms.' : 'Add your first product to get started!'}
						</p>
						{!searchTerm && (
							<button className="btn btn-primary" onClick={handleAddProduct}>
								<FontAwesomeIcon icon={faPlus} className="mr-2" />
								Add Your First Product
							</button>
						)}
					</div>
				)}
			</div>

			{showModal && (
				<ProductModal
					product={selectedProduct}
					collections={collections}
					onClose={handleModalClose}
					onSave={handleModalSave}
				/>
			)}
		</div>
	);
};

export default ProductManagement;