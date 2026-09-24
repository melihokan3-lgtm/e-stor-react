import { useState } from "react";
import { ProfileEmptyState } from "../../components/profile";
import SeoMeta from "../../components/common/SeoMeta";

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
    question: "Kart seçimiyle gerçek ödeme yapılıyor mu?",
    category: "Ödeme & Güvenlik",
    answer:
      "Hayır. Bu site staj amaçlı bir test projesidir; ödeme sağlayıcısı veya 3D Secure entegrasyonu yoktur ve gerçek ödeme alınmaz. Kart seçimi yalnızca arayüz örneğidir. Sadece gösterilen test kartlarını kullanın; gerçek kart bilgisi girmeyin. Test kartının maskelenmiş numarası tarayıcınızda tutulabilir, CVV kaydedilmez.",
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
  const [openItemIds, setOpenItemIds] = useState<number[]>([1]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Toggle FAQ Accordion item
  const toggleAccordion = (id: number) => {
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
    <div className="w-full space-y-5">
      <SeoMeta title="Yardım ve Destek | E-Storee" description="E-Storee yardım merkeziyle sipariş, teslimat ve hesap sorularınıza yanıt bulun." canonicalPath="/profile/help" robots="noindex,nofollow" />
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#fff8fd] p-6">
        <h1 className="mb-2 text-[28px] font-extrabold text-[#111]">Yardım ve Destek Merkezi</h1>
        <p className="mb-5 text-sm text-[#777]">
          Siparişleriniz, iade süreçleriniz ve ödeme güvenliği hakkında merak ettiğiniz tüm soruların yanıtları.
        </p>

        {/* Real-time Search Box */}
        <div className="flex items-center gap-3 rounded-xl border border-[#eee] bg-white px-4 py-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Bir konu, soru veya anahtar kelime arayın (Örn: iade, kargo, kart...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 border-0 text-sm outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              className="text-xl text-[#777]"
              onClick={() => setSearchQuery("")}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${selectedCategory === cat ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#eee] bg-white text-[#777]"}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <ProfileEmptyState compact className="text-sm text-[#777]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>"{searchQuery}" aramasıyla eşleşen bir soru bulunamadı.</p>
            <span>Farklı bir anahtar kelime deneyebilir veya aşağıdaki Canlı Destek ekibimizle iletişime geçebilirsiniz.</span>
          </ProfileEmptyState>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = openItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#eee] bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm font-semibold text-[#222]"
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isOpen}
                >
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#b6349a]/[.1] px-2 py-1 text-[11px] text-[#b6349a]">{item.category}</span>
                    {item.question}
                  </span>
                  <span className={`transition ${isOpen ? "rotate-180" : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[#eee] bg-[#fafafa] p-4 text-sm leading-6 text-[#666]">
                    <p className="m-0">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact & Support Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2"><h4 className="font-bold text-[#111]">Canlı Destek</h4><span className="text-xs text-emerald-700">7/24 Aktif</span></div>
            <p className="my-2 text-sm text-[#666]">Müşteri temsilcilerimizle anında yazışarak sipariş ve iade desteği alın.</p><span className="text-xs text-[#777]">Ortalama yanıt süresi: &lt; 2 dakika</span>
          </div>
          <button
            type="button"
            className="self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => setChatModalOpen(true)}
          >
            Sohbeti Başlat
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-pink-100 bg-pink-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div><h4 className="font-bold text-[#111]">Bize Ulaşın</h4><p className="my-2 text-sm text-[#666]">Sorularınızı ve kurumsal taleplerinizi destek ekibimize e-posta veya telefonla iletin.</p><span className="text-xs text-[#777]">
              <strong>destek@estore.com</strong> &bull; <strong>0850 123 45 67</strong>
            </span>
          </div>
          <a
            href="mailto:destek@estore.com"
            className="self-start rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white"
          >
            E-Posta Gönder
          </a>
        </div>
      </div>

      {/* Live Chat Simulation Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setChatModalOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#eee] p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <span>🎧</span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111] bg-emerald-500"></span>
                </div>
                <div><h4 className="font-bold text-[#111]">Müşteri Temsilcisi (Selin Y.)</h4><span className="text-xs text-[#777]">Canlı Destek Ekibi &bull; Çevrimiçi</span>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-xl text-[#777] hover:bg-[#f5f5f5]"
                onClick={() => setChatModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="min-h-48 bg-[#fafafa] p-4"><div className="max-w-[85%] rounded-xl bg-white p-3 text-sm text-[#555] shadow-sm"><p className="m-0">Merhaba! E-Store Canlı Destek hattına hoş geldiniz. Size siparişleriniz veya ürünlerinizle ilgili nasıl yardımcı olabilirim?</p><span className="mt-2 block text-xs text-[#999]">Şimdi</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#eee] p-4">
              <input
                type="text"
                placeholder="Mesajınızı buraya yazın..."
                className="min-w-0 flex-1 rounded-lg border border-[#ddd] px-3 py-2 text-sm outline-none focus:border-[#b6349a]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    alert("Mesajınız canlı destek temsilcimize iletildi.");
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                type="button"
                className="rounded-lg bg-[#b6349a] px-3 text-white"
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
