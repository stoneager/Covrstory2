import React from 'react';

const Header = () => {
	const companyName = process.env.REACT_APP_COMPANY_NAME || 'Your Store';
	const companyLogo = process.env.REACT_APP_COMPANY_LOGO_URL || 'https://via.placeholder.com/150x50?text=LOGO';

	return (
		<header className="header">
			<div className="logo">
				<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
					<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
					</svg>
				</div>
				<div>
					<div className="text-xl font-black">{companyName}</div>
					<div className="text-sm text-white/80 font-medium">Owner Dashboard</div>
				</div>
			</div>
			<div className="header-actions">
				<div className="flex items-center gap-4">
					<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
						<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
						</svg>
					</div>
					<span className="text-white/90">Welcome, Owner</span>
				</div>
			</div>
		</header>
	);
};

export default Header;
