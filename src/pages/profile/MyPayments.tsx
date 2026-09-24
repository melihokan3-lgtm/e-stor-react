import SeoMeta from "../../components/common/SeoMeta";

export default function MyPayments() {
  return (
    <div className="w-full">
      <SeoMeta title="Ödeme Yöntemlerim | E-Storee" description="Ödeme yöntemleri" canonicalPath="/profile/payments" robots="noindex,nofollow" />
      <h1 className="text-[28px] font-extrabold text-[#111]">Ödeme Yöntemlerim</h1>
      <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Güvenli ödeme sağlayıcısı henüz kurulmadı. Bu nedenle kart numarası veya CVV istemiyoruz ve kart kaydetmiyoruz.
        Lütfen bu siteye gerçek kart bilgilerinizi girmeyin.
      </p>
    </div>
  );
}
