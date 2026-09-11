import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: 1,
    question: "Siparişim ne zaman kargoya verilir?",
    category: "Teslimat & Kargo",
    answer:
      "Hafta içi saat 16:00'a kadar tamamlanan tüm siparişler aynı gün özenle paketlenerek anlaşmalı kargo firmalarına teslim edilir. Kampanya dönemlerinde ve resmi tatillerde kargoya verilme süresi 24-48 saat arasında değişkenlik gösterebilir. Siparişiniz kargoya verildiğinde takip numarası SMS ve e-posta ile tarafınıza iletilir; ayrıca Profil > Siparişlerim sekmesinden anlık kargo hareketlerini izleyebilirsiniz.",
  },
  {
    id: 2,
    question: "İade ve değişim şartları nelerdir?",
    category: "İade & Değişim",
    answer:
      "Satın aldığınız ürünleri, teslimat tarihinden itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin ücretsiz olarak iade edebilirsiniz. İade edilecek ürünlerin kullanılmamış, etiketleri sökülmemiş, orijinal kutusu ve tüm aksesuarlarıyla birlikte eksiksiz gönderilmesi gerekmektedir. İadeniz depomuza ulaşıp kontroller sağlandıktan sonra 2-4 iş günü içinde tutar ödeme yaptığınız karta veya banka hesabınıza eksiksiz yansıtılır.",
  },
  {
    id: 3,
    question: "Kredi kartı bilgilerim güvende mi?",
    category: "Ödeme & Güvenlik",
    answer:
      "Kesinlikle güvendedir. Sitemizde uluslararası PCI-DSS Level 1 güvenlik standartları ve 256-bit SSL şifreleme protokolleri kullanılmaktadır. Kredi kartı numaranız ve CVV güvenlik kodunuz sunucularımızda asla düz metin olarak kaydedilmez ve çalışanlarımız dahil hiç kimse tarafından görüntülenemez. Ödemeleriniz doğrudan bankaların 3D Secure güvenli doğrulama altyapısı üzerinden gerçekleştirilir.",
  },
  {
    id: 4,
    question: "Kargom hasarlı veya eksik geldiğinde ne yapmalıyım?",
    category: "Teslimat & Kargo",
    answer:
      "Kargo paketini teslim alırken kurye önünde dış ambalajı kontrol etmenizi tavsiye ederiz. Eğer pakette yırtılma, ezilme veya ıslanma gibi belirgin bir hasar varsa kuryeden derhal 'Hasar Tespit Tutanağı' düzenlemesini talep ediniz. Hasarlı veya eksik ürün durumunda 24 saat içinde Müşteri Hizmetlerimize sipariş numaranız ve ürün fotoğraflarıyla ulaştığınızda derhal yeni ürün gönderimi veya ücret iadesi organize edilir.",
  },
  {
    id: 5,
    question: "Yurtdışına gönderim (International Shipping) yapıyor musunuz?",
    category: "Uluslararası Gönderim",
    answer:
      "Evet! Başta Avrupa Birliği ülkeleri, Birleşik Krallık, ABD ve Körfez bölgesi olmak üzere dünya genelinde 60'tan fazla ülkeye DHL Express ve UPS güvencesiyle hızlı uluslararası kargo hizmeti sunuyoruz. Yurtdışı teslimat süreleri destinasyona bağlı olarak 3-7 iş günü arasında değişmekte olup gümrük süreçleri alıcı ülke mevzuatlarına tabidir.",
  },
  {
    id: 6,
    question: "Siparişimi nasıl iptal edebilirim?",
    category: "Sipariş Yönetimi",
    answer:
      "Henüz 'Hazırlanıyor' veya 'Kargoya Verildi' aşamasına geçmemiş siparişlerinizi Profil > Siparişlerim sekmesinden tek tıkla iptal edebilirsiniz. Siparişiniz kargoya verildiyse iptal edilemez; bu durumda paketi teslim alırken kapıda iade edebilir veya teslim aldıktan sonra 14 gün içinde ücretsiz iade sürecini başlatabilirsiniz.",
  },
];

export default function HelpCenter() {
  const [openItemIds, setOpenItemIds] = useState([1]); // First FAQ open by default
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Toggle FAQ Accordion item
  const toggleAccordion = (id) => {
    setOpenItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter FAQs
  const categories = ["Tümü", "Teslimat & Kargo", "İade & Değişim", "Ödeme & Güvenlik", "Sipariş Yönetimi"];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tümü" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="help-center-page">
      {/* Header Banner */}
      <div className="help-center-header">
        <h2 className="profile-page-title">Yardım ve Destek Merkezi</h2>
        <p className="help-subtitle">
          Siparişleriniz, iade süreçleriniz ve ödeme güvenliği hakkında merak ettiğiniz tüm soruların yanıtları.
        </p>

        {/* Real-time Search Box */}
        <div className="help-search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Bir konu, soru veya anahtar kelime arayın (Örn: iade, kargo, kart...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="faq-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`faq-pill-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="faq-accordion-list">
        {filteredFaqs.length === 0 ? (
          <div className="faq-not-found">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>"{searchQuery}" aramasıyla eşleşen bir soru bulunamadı.</p>
            <span>Farklı bir anahtar kelime deneyebilir veya aşağıdaki Canlı Destek ekibimizle iletişime geçebilirsiniz.</span>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = openItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`faq-accordion-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">
                    <span className="faq-q-badge">{item.category}</span>
                    {item.question}
                  </span>
                  <span className="faq-arrow-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-answer-pane">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact & Support Cards */}
      <div className="help-contact-section">
        <div className="help-contact-card chat-card">
          <div className="contact-icon-wrapper chat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="contact-info">
            <div className="contact-title-row">
              <h4>Canlı Destek</h4>
              <span className="online-badge">
                <span className="online-dot"></span> 7/24 Aktif
              </span>
            </div>
            <p>Müşteri temsilcilerimizle anında yazışarak sipariş ve iade desteği alın.</p>
            <span className="response-time">Ortalama yanıt süresi: &lt; 2 dakika</span>
          </div>
          <button
            type="button"
            className="contact-btn chat-btn"
            onClick={() => setChatModalOpen(true)}
          >
            Sohbeti Başlat
          </button>
        </div>

        <div className="help-contact-card email-card">
          <div className="contact-icon-wrapper email-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div className="contact-info">
            <h4>Bize Ulaşın</h4>
            <p>Sorularınızı ve kurumsal taleplerinizi destek ekibimize e-posta veya telefonla iletin.</p>
            <span className="contact-details-line">
              <strong>destek@estore.com</strong> &bull; <strong>0850 123 45 67</strong>
            </span>
          </div>
          <a
            href="mailto:destek@estore.com"
            className="contact-btn email-btn"
          >
            E-Posta Gönder
          </a>
        </div>
      </div>

      {/* Live Chat Simulation Modal */}
      {chatModalOpen && (
        <div className="card-modal-overlay" onClick={() => setChatModalOpen(false)}>
          <div className="live-chat-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="live-chat-header">
              <div className="chat-agent-info">
                <div className="agent-avatar">
                  <span>🎧</span>
                  <span className="agent-online-dot"></span>
                </div>
                <div>
                  <h4>Müşteri Temsilcisi (Selin Y.)</h4>
                  <span>Canlı Destek Ekibi &bull; Çevrimiçi</span>
                </div>
              </div>
              <button
                type="button"
                className="card-modal-close-btn"
                onClick={() => setChatModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="live-chat-messages">
              <div className="chat-bubble agent">
                <p>Merhaba! E-Store Canlı Destek hattına hoş geldiniz. Size siparişleriniz veya ürünlerinizle ilgili nasıl yardımcı olabilirim?</p>
                <span className="chat-time">Şimdi</span>
              </div>
            </div>

            <div className="live-chat-footer">
              <input
                type="text"
                placeholder="Mesajınızı buraya yazın..."
                className="chat-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    alert("Mesajınız canlı destek temsilcimize iletildi.");
                    e.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={() => alert("Mesajınız canlı destek temsilcimize iletildi.")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
