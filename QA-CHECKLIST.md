# QA Checklist (MVP Critical Flows)

Bu liste, admin paneli ve satis akisini hizli manuel dogrulamak icin hazirlandi.

## 1) Admin route korumasi

- [ ] Auth yokken `/admin` ac -> `/login` yonlenmeli.
- [ ] Auth var ama `ADMIN` degilken `/admin` ac -> `/account` yonlenmeli.
- [ ] `ADMIN` kullanici ile `/admin` ac -> sayfa acilmali.

## 2) Admin urun akisi

- [ ] Admin panelde urun listesi gorunmeli.
- [ ] Yeni urun ekle -> kayit basarili mesaji ve listede urun gorunmeli.
- [ ] Var olan urunu duzenle -> kayit basarili mesaji ve degisiklik listede gorunmeli.
- [ ] `nameTR` ve `nameEN` degerleri duzenlemeden sonra korunmali.

## 3) Admin siparis akisi

- [ ] Siparis listesi veri cekebilmeli.
- [ ] Bir siparisin durumunu degistir (ornegin `PROCESSING`).
- [ ] Sayfayi yenile -> secilen durum backend'den kalici gelmeli.

## 4) Checkout ve odeme zinciri

- [ ] Sepetten checkout'a git -> `/api/orders` basarili donmeli.
- [ ] Sonra `/api/payment/init` basarili donmeli.
- [ ] Iyzico callback, backend endpointine ulasmali (`/api/payment/callback`).
- [ ] Basarili odemede `payment/success?orderId=...` acilmali.
- [ ] Basarisiz odemede `payment/failed` acilmali.

## 5) Success ekrani dogrulama

- [ ] `payment/success` sayfasi `orderId` olmadan acilirsa failed'e dusmeli.
- [ ] `orderId` varsa ama siparis statusu `PAID/PROCESSING/SHIPPED/DELIVERED` disinda ise failed'e dusmeli.
- [ ] Gecerli statuslerde success ekrani gorunmeli.

## Opsiyonel log kontrolu

- [ ] Backend loglarinda `/api/payment/callback` istegi gorunmeli.
- [ ] Siparis status degisimi sonrasi DB kaydi kontrol edilmeli.
