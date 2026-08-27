import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import waveLogo from '../assets/wave-logo.png';
import orangeMoneyLogo from '../assets/orange-money-logo.png';

// Packages Android connus (pour tenter d'ouvrir l'app directement) — pas de lien officiel
// documenté avec montant pré-rempli pour Wave/Max it, donc on ouvre juste l'app.
const ANDROID_PACKAGES = {
  wave: 'com.wave.personal',
  maxit: 'com.oml.dsi.orangemobile',
};

// Identifiants App Store (iOS) des mêmes apps — utilisés pour rediriger
// les utilisateurs iPhone/Mac vers la bonne fiche App Store.
const IOS_APP_IDS = {
  wave: '1523884528',      // Wave - Mobile Money
  maxit: '1494321079',     // Orange Max it – Mali
};

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isAppleDevice() {
  // Couvre iPhone, iPad, iPod, et macOS (Safari sur Mac inclus)
  return /iphone|ipad|ipod|macintosh|mac os x/i.test(navigator.userAgent);
}

export default function PaymentPanel({ amount, method, setMethod, paymentReference, setPaymentReference, paymentConfirmed, setPaymentConfirmed }) {
  const { orangeMoneyNumber, waveNumber, moovMoneyNumber } = useSettings();
  const [copied, setCopied] = useState(false);

  const METHODS = [
    { id: 'wave', label: 'Wave', icon: 'W', color: '#1DA1F2', number: waveNumber },
    { id: 'moov_money', label: 'Moov Money', icon: 'MM', color: 'var(--indigo)', number: moovMoneyNumber },
    { id: 'maxit', label: 'Max it (Orange Money)', icon: 'M', color: 'var(--tomato)', number: orangeMoneyNumber },
    { id: 'cash_on_delivery', label: 'Paiement à la livraison', icon: '₣', color: 'var(--ochre)', number: null },
  ];
  const selected = METHODS.find((m) => m.id === method) || METHODS[0];
  const requiresProof = method !== 'cash_on_delivery';

  function copyNumber() {
    if (!selected.number) return;
    navigator.clipboard.writeText(selected.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openApp() {
    if (method === 'moov_money') {
      // Moov Money Mali passe par un vrai code USSD, fiable sur tous les téléphones
      window.location.href = 'tel:*166%23';
      return;
    }
    const pkg = ANDROID_PACKAGES[method];
    const iosId = IOS_APP_IDS[method];
    if (pkg && isAndroid()) {
      // Tentative d'ouverture directe de l'app installée, sinon bascule vers le Play Store
      window.location.href = `intent://#Intent;package=${pkg};end`;
      setTimeout(() => {
        window.location.href = `https://play.google.com/store/apps/details?id=${pkg}`;
      }, 1200);
    } else if (iosId && isAppleDevice()) {
      // iPhone/iPad/Mac : direction la fiche App Store de l'app
      window.open(`https://apps.apple.com/app/id${iosId}`, '_blank');
    } else if (pkg) {
      // Autre navigateur desktop non identifié : on retombe sur le Play Store à défaut
      window.open(`https://play.google.com/store/apps/details?id=${pkg}`, '_blank');
    }
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 10px' }}>Mode de paiement</div>
      {METHODS.map((m) => (
        <div
          key={m.id}
          onClick={() => setMethod(m.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 13,
            border: `1.5px solid ${method === m.id ? 'var(--tomato)' : 'var(--line)'}`,
            background: method === m.id ? 'rgba(198,71,63,0.05)' : 'var(--card)',
            borderRadius: 12, marginBottom: 10, cursor: 'pointer'
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 9, background: m.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700 }}>{m.icon}</div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
        </div>
      ))}

      {requiresProof && (
        <div style={{ background: '#FBEFE0', border: '1px solid #EBCFA0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: '#8A6116', marginBottom: 10 }}>
            Montant à envoyer : <strong>{amount.toLocaleString()} FCFA</strong>
          </p>

          <button
            type="button"
            onClick={openApp}
            style={{ background: selected.color, color: 'white', border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginBottom: 10, width: '100%' }}
          >
            {method === 'moov_money' ? '📞 Composer le code Moov Money' : `📲 Ouvrir ${selected.label}`}
          </button>

          {selected.number ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: '#8A6116' }}>Numéro :</span>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#8A6116' }}>{selected.number}</span>
              <button type="button" onClick={copyNumber} style={{ background: '#8A6116', color: 'white', border: 'none', borderRadius: 7, padding: '4px 9px', fontSize: 11, cursor: 'pointer' }}>
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          ) : method !== 'moov_money' && (
            <p style={{ fontSize: 11.5, color: '#8A6116', marginBottom: 4 }}>Numéro pas encore configuré — contacte-nous directement.</p>
          )}

          <p style={{ fontSize: 11, color: '#8A6116', marginTop: 8, marginBottom: 14 }}>
            Une fois le dépôt fait, renseigne la référence de la transaction ci-dessous pour pouvoir valider ta commande.
          </p>

          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#8A6116', marginBottom: 6 }}>
            Référence de la transaction *
          </label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Ex : ID reçu par SMS après le paiement"
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #EBCFA0',
              fontSize: 12.5, marginBottom: 12, boxSizing: 'border-box'
            }}
          />

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={(e) => setPaymentConfirmed(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 12, color: '#8A6116' }}>
              Je confirme avoir effectué le paiement de <strong>{amount.toLocaleString()} FCFA</strong>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}