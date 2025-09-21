import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch , faBoxes} from '@fortawesome/free-solid-svg-icons';
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
			<div className="page-header">
				<div>
					<h1 className="page-title">Product Management</h1>
					<p className="page-subtitle">Manage your product catalog and inventory</p>
				</div>
				<button className="btn btn-primary" onClick={handleAddProduct}>
					<FontAwesomeIcon icon={faPlus} className="icon-left" />
					Add Product
				</button>
			</div>
			
			<div className="search-section">
				<div className="search-container">
					<div className="search-input-wrapper">
						<FontAwesomeIcon 
							icon={faSearch} 
							className="search-icon"
						/>
						<input 
							type="text" 
							className="search-input" 
							placeholder="Search by name, collection, or category..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
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
								<div className="product-header">
									<h3 className="product-name">{product.name}</h3>
									<p className="product-description">{product.description}</p>
								</div>

								{product.variants && product.variants.length > 0 && (
									<div className="product-images">
										{product.variants.map((variant, vIdx) => (
											<div key={vIdx} className="product-variant">
												<div className="variant-label">
													Color: {variant.colour}
												</div>
												<div className="images-grid">
													{variant.images && variant.images.length > 0 ? (
														variant.images.map((img, imgIdx) => (
															<img
																key={imgIdx}
																src={img}
																alt={`${product.name} ${variant.colour} ${imgIdx + 1}`}
																className="product-image"
															/>
														))
													) : (
														<span className="no-image-text">No images available</span>
													)}
												</div>
											</div>
										))}
									</div>
								)}

								<div className="product-info">
									<div className="product-metadata">
										{product.collection?.name && (
											<div className="metadata-item">
												<span className="metadata-label">Collection:</span>
												{product.collection.name}
											</div>
										)}
										<div className="metadata-item">
											<span className="metadata-label">Category:</span>
											{product.type} | {product.gender === 'm' ? 'Men' : 'Women'}
										</div>
										{product.activity && (
											<div className="metadata-item">
												<span className="metadata-label">Activity:</span>
												{product.activity}
											</div>
										)}
									</div>

									<div className="product-actions">
										<button 
											className="btn btn-secondary"
											onClick={() => handleEditProduct(product)}
										>
											<FontAwesomeIcon icon={faEdit} className="icon-left" />
											Edit
										</button>
										<button 
											className="btn btn-danger"
											onClick={() => handleDeleteProduct(product._id)}
										>
											<FontAwesomeIcon icon={faTrash} className="icon-left" />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && products.length === 0 && (
					<div className="empty-state">
						<div className="empty-state-icon">
							<FontAwesomeIcon icon={faBoxes} />
						</div>
						<h3 className="empty-state-title">
							{searchTerm ? 'No products found' : 'No products yet'}
						</h3>
						<p className="empty-state-description">
							{searchTerm ? 'Try adjusting your search terms.' : 'Add your first product to get started!'}
						</p>
						{!searchTerm && (
							<button className="btn btn-primary" onClick={handleAddProduct}>
								<FontAwesomeIcon icon={faPlus} className="icon-left" />
								Add Your First Product
							</button>
						)}
					</div>
				)}

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