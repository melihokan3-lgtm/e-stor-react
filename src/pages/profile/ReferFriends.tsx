import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { loadReferralData, type ReferralData } from "../../features/profile/referrals";

export default function ReferFriends() {
  const { user } = useAuth();
  const [copyStatus, setCopyStatus] = useState("Kopyala");
  const [referralData, setReferralData] = useState<ReferralData>({
    totalEarned: 0,
    friendsInvited: 0,
    pendingApprovals: 0,
    history: []
  });

  const referralCode = "EMASTUDIO2024";

  useEffect(() => {
    if (!user) return;
    setReferralData(loadReferralData(user));
  }, [user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopyStatus("Kopyalandı! ✅");
      setTimeout(() => setCopyStatus("Kopyala"), 3000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const shareText = `E-Storee'ye katıl, ilk siparişinde anında 100 TL indirim kazan! Davet Kodum: ${referralCode}`;
  
  return (
    <div className="refer-friends-page">
      {/* 1. Hero & Kampanya Alanı */}
      <section className="refer-hero">
        <div className="refer-hero-content">
          <h2>Arkadaşını Davet Et,<br/>İkiniz de 100 TL İndirim Kazanın!</h2>
          <p>Favori ürünlerini arkadaşlarınla paylaş, onlar ilk alışverişlerinde 100 TL kazansın, sen de her başarılı davet için 100 TL indirim kuponu kazan!</p>
        </div>
      </section>

      {/* 2. Nasıl Çalışır? */}
      <section className="refer-how-it-works">
        <h3>Nasıl Çalışır?</h3>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">🔗</div>
            <h4>1. Linki Paylaş</h4>
            <p>Sana özel davet kodunu veya linkini arkadaşlarınla paylaş.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🛍️</div>
            <h4>2. Sipariş Versinler</h4>
            <p>Arkadaşın senin kodunla üye olup ilk siparişini tamamlasın.</p>
          </div>
          <div className="step-card">
            <div className="step-icon">🎁</div>
            <h4>3. İndirimi Kazan</h4>
            <p>100 TL değerindeki hediye kuponun anında hesabına yatsın!</p>
          </div>
        </div>
      </section>

      {/* 3. Paylaşım Modülü */}
      <section className="refer-share-module">
        <h3>Davet Kodunu Paylaş</h3>
        <div className="copy-code-container">
          <div className="code-display">{referralCode}</div>
          <button 
            className={`copy-btn ${copyStatus !== "Kopyala" ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copyStatus}
          </button>
        </div>
        
        <div className="social-share">
          <p>Hızlı Paylaş:</p>
          <div className="social-buttons">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn whatsapp"
            >
              WhatsApp
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn twitter"
            >
              X (Twitter)
            </a>
            <a 
              href={`mailto:?subject=E-Storee 100 TL İndirim!&body=${encodeURIComponent(shareText)}`} 
              className="social-btn email"
            >
              E-posta
            </a>
          </div>
        </div>
      </section>

      {/* 4. İstatistikler ve Kazanç Geçmişi */}
      <section className="refer-dashboard">
        <h3>Davet İstatistiklerin</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{referralData.totalEarned} ₺</div>
            <div className="stat-label">Kazanılan İndirim</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{referralData.friendsInvited}</div>
            <div className="stat-label">Davet Edilen Arkadaş</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{referralData.pendingApprovals}</div>
            <div className="stat-label">Bekleyen Onaylar</div>
          </div>
        </div>

        <div className="history-table-container">
          <h4>Davet Geçmişi</h4>
          {referralData.history.length > 0 ? (
            <ul className="history-list">
              {referralData.history.map((item) => (
                <li key={item.name} className={`history-item ${item.type}`}>
                  <span className="history-name">{item.name}</span>
                  <span className="history-status">{item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-history">Henüz kimseyi davet etmediniz.</p>
          )}
        </div>
      </section>
    </div>
  );
}
