import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { loadReferralData, type ReferralData } from "../../features/profile/referrals";
import SeoMeta from "../../components/common/SeoMeta";

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
    <div className="space-y-8">
      <SeoMeta title="Arkadaşlarını Davet Et | E-Storee" description="E-Storee davet programıyla arkadaşlarınızı davet edin ve indirim fırsatlarından yararlanın." canonicalPath="/profile/refer" robots="noindex,nofollow" />
      {/* 1. Hero & Kampanya Alanı */}
      <section className="rounded-2xl bg-gradient-to-br from-[#b6349a] to-[#831843] p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold max-sm:text-2xl">Arkadaşını Davet Et,<br/>İkiniz de 100 TL İndirim Kazanın!</h1>
          <p className="mt-3 text-sm leading-6 text-white/85">Favori ürünlerini arkadaşlarınla paylaş, onlar ilk alışverişlerinde 100 TL kazansın, sen de her başarılı davet için 100 TL indirim kuponu kazan!</p>
        </div>
      </section>

      {/* 2. Nasıl Çalışır? */}
      <section>
        <h3 className="mb-4 text-xl font-bold text-[#111]">Nasıl Çalışır?</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eee] bg-white p-5">
            <div className="mb-3 text-2xl">🔗</div>
            <h4 className="font-bold text-[#111]">1. Linki Paylaş</h4>
            <p className="mt-2 text-sm text-[#777]">Sana özel davet kodunu veya linkini arkadaşlarınla paylaş.</p>
          </div>
          <div className="rounded-2xl border border-[#eee] bg-white p-5">
            <div className="mb-3 text-2xl">🛍️</div>
            <h4 className="font-bold text-[#111]">2. Sipariş Versinler</h4>
            <p className="mt-2 text-sm text-[#777]">Arkadaşın senin kodunla üye olup ilk siparişini tamamlasın.</p>
          </div>
          <div className="rounded-2xl border border-[#eee] bg-white p-5">
            <div className="mb-3 text-2xl">🎁</div>
            <h4 className="font-bold text-[#111]">3. İndirimi Kazan</h4>
            <p className="mt-2 text-sm text-[#777]">100 TL değerindeki hediye kuponun anında hesabına yatsın!</p>
          </div>
        </div>
      </section>

      {/* 3. Paylaşım Modülü */}
      <section className="rounded-2xl border border-[#eee] bg-white p-6">
        <h3 className="mb-4 text-xl font-bold text-[#111]">Davet Kodunu Paylaş</h3>
        <div className="flex max-w-xl gap-2">
          <div className="flex-1 rounded-lg bg-[#f7f4f7] px-4 py-3 font-mono font-bold text-[#b6349a]">{referralCode}</div>
          <button 
            className="rounded-lg bg-[#b6349a] px-4 py-3 text-sm font-semibold text-white"
            onClick={handleCopy}
          >
            {copyStatus}
          </button>
        </div>
        
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-[#555]">Hızlı Paylaş:</p>
          <div className="flex flex-wrap gap-2">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
            >
              WhatsApp
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white"
            >
              X (Twitter)
            </a>
            <a 
              href={`mailto:?subject=E-Storee 100 TL İndirim!&body=${encodeURIComponent(shareText)}`} 
              className="rounded-lg bg-[#555] px-3 py-2 text-xs font-semibold text-white"
            >
              E-posta
            </a>
          </div>
        </div>
      </section>

      {/* 4. İstatistikler ve Kazanç Geçmişi */}
      <section>
        <h3 className="mb-4 text-xl font-bold text-[#111]">Davet İstatistiklerin</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#fff8fd] p-5"><div className="text-2xl font-extrabold text-[#b6349a]">{referralData.totalEarned} ₺</div><div className="mt-1 text-sm text-[#777]">Kazanılan İndirim</div>
          </div>
          <div className="rounded-2xl bg-[#fff8fd] p-5"><div className="text-2xl font-extrabold text-[#b6349a]">{referralData.friendsInvited}</div><div className="mt-1 text-sm text-[#777]">Davet Edilen Arkadaş</div>
          </div>
          <div className="rounded-2xl bg-[#fff8fd] p-5"><div className="text-2xl font-extrabold text-[#b6349a]">{referralData.pendingApprovals}</div><div className="mt-1 text-sm text-[#777]">Bekleyen Onaylar</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#eee] bg-white p-5">
          <h4 className="mb-3 font-bold text-[#111]">Davet Geçmişi</h4>
          {referralData.history.length > 0 ? (
            <ul className="divide-y divide-[#eee]">
              {referralData.history.map((item) => (
                <li key={item.name} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-[#555]">{item.name}</span>
                  <span className="font-semibold text-[#b6349a]">{item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-sm text-[#999]">Henüz kimseyi davet etmediniz.</p>
          )}
        </div>
      </section>
    </div>
  );
}
