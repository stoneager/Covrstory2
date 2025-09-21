import React from 'react';

const Header = () => {
	const companyName = process.env.REACT_APP_COMPANY_NAME || 'Your Store';
	const companyLogo = process.env.REACT_APP_COMPANY_LOGO_URL || 'https://via.placeholder.com/150x50?text=LOGO';

	return (
		<header className="header">
			<div className="logo">
				<div className="logo-icon">
					<svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
					</svg>
				</div>
				<div className="logo-text">
					<div className="company-name">{companyName}</div>
					<div className="dashboard-label">Owner Dashboard</div>
				</div>
			</div>
			<div className="header-actions">
				<div className="flex items-center gap-4">
					<div className="user-avatar">
						<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
						</svg>
					</div>
					<span className="welcome-text">Welcome, Owner</span>
				</div>
			</div>
		</header>
	);
};

export default Header;
