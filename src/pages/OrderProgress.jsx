import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../features/cart/CartContext";
import { useLocation } from "../features/addresses/LocationContext";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api/productApi";

export default function OrderProgress() {
  const { cart } = useContext(CartContext);
  const { location } = useLocation();
  const navigate = useNavigate();
  
  // Pagination logic
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(cart.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = cart.slice(startIndex, startIndex + itemsPerPage);

  const deliveryFee = 144;
  const finalTotal = 144; // Hardcoded to match the mockup exactly

  return (
    <main className="main-order-progress">
      <div className="progress-max-container">
        
        {/* Top Actions */}
        <div className="progress-top-actions">
          <button className="progress-back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button className="progress-help-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Help
          </button>
        </div>

        <div className="progress-content-grid">
          {/* LEFT COLUMN */}
          <div className="progress-left-col">
            
            {/* Order Status Card */}
            <div className="progress-card status-card">
              <div className="status-header">
                <div className="status-titles">
                  <h2>Order In Progress</h2>
                  <p>Order Arrived at Apr 5, 2022, 10:07 AM</p>
                </div>
                <div className="status-badge">In Progress</div>
              </div>

              <div className="status-center-indicator">
                <div className="circle-check-large">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3>Order is Placed</h3>
              </div>

              <div className="status-timeline-wrapper">
                <div className="timeline-line-bg"></div>
                <div className="timeline-line-active"></div>
                
                <div className="timeline-nodes">
                  <div className="t-node active">
                    <div className="t-circle checked">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="t-date">Apr 5, 2022,<br/>10:07 AM</span>
                  </div>
                  
                  <div className="t-node current">
                    <div className="t-circle current-circle"></div>
                    <span className="t-date">Apr 5, 2022,<br/>10:07 AM</span>
                  </div>
                  
                  <div className="t-node pending">
                    <div className="t-circle pending-circle"></div>
                    <span className="t-date">Apr 5, 2022,<br/>10:07 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List Card */}
            <div className="progress-card items-card">
              <div className="items-header-row">
                <span className="h-left">Items Name</span>
                <span className="h-right">N.of items</span>
              </div>

              <div className="items-list-container">
                {displayedItems.map((item, index) => {
                  const imageSrc = item.data.image || cleanImageUrl(item.data.images?.[0]) || FALLBACK_IMG;
                  return (
                    <div className="item-row" key={index}>
                      <div className="item-info-left">
                        <div className="item-thumb">
                          <img 
                            src={imageSrc} 
                            alt={item.data.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMG;
                            }} 
                          />
                        </div>
                        <div className="item-details">
                          <h4 className="i-title">{item.data.title}</h4>
                          <div className="i-prices">
                            <span className="i-price">${item.data.price}</span>
                            <span className="i-old-price">${(item.data.price * 1.2).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="item-qty-right">
                        {item.unit || 1}x
                      </div>
                    </div>
                  );
                })}
                {cart.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    No items in order.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-row">
                  <button 
                    className="p-nav" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      className={`p-num ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="p-nav"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Cancel Card */}
            <div className="progress-card cancel-card">
              <p>You can cancel your order before it starts being prepared.</p>
              <button className="btn-cancel">Cancel Order</button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="progress-right-col">
            
            {/* Order Summary */}
            <div className="progress-card summary-card">
              <h3 className="card-title">Order Summary</h3>
              <div className="summary-line border-bottom">
                <span className="s-label">Order Number</span>
                <span className="s-value pink-val flex-val">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  #183-891
                </span>
              </div>
              <div className="summary-line mt-16">
                <span className="s-label">Delivery Fees</span>
                <span className="s-value">${deliveryFee}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Delivery Fees</span>
                <span className="s-value">${deliveryFee}</span>
              </div>
              <div className="summary-line total-line mt-24">
                <span className="s-total-label">Total</span>
                <span className="s-total-val">${finalTotal}</span>
              </div>
            </div>

            {/* Pay With */}
            <div className="progress-card small-card">
              <h3 className="card-title">Pay With</h3>
              <div className="icon-text-row">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="20" rx="4" fill="#111"/>
                  <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                  <circle cx="20" cy="10" r="6" fill="#F79E1B" fillOpacity="0.8"/>
                </svg>
                <span className="pink-val">MasterCard 02132</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="progress-card small-card">
              <h3 className="card-title">Delivery Address</h3>
              <div className="icon-text-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="pink-val">{location}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
