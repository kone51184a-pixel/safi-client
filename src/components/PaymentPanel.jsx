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

// Longueur minimale exigée pour la référence de transaction — limite les entrées
// bidons ("ok", "123"), même si ça ne garantit pas que la référence est authentique.
const MIN_REFERENCE_LENGTH = 6;

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isAppleDevice() {
  // Couvre iPhone, iPad, iPod, et macOS (Safari sur Mac inclus)
  return /iphone|ipad|ipod|macintosh|mac os x/i.test(navigator.userAgent);
}

export default function PaymentPanel({ amount, method, setMethod, paymentReference, setPaymentReference, paymentConfirmed, setPaymentConfirmed }) {
  const { orangeMoneyNumber, waveNumber } = useSettings();
  const [copied, setCopied] = useState(false);

  const METHODS = [
    { id: 'wave', label: 'Wave', logo: waveLogo, color: '#1DA1F2', number: waveNumber },
    { id: 'maxit', label: 'Max it (Orange Money)', logo: orangeMoneyLogo, color: '#FF6600', number: orangeMoneyNumber },
    { id: 'cash_on_delivery', label: 'Paiement à la livraison', logo: null, icon: '₣', color: 'var(--ochre)', number: null },
  ];
  const selected = METHODS.find((m) => m.id === method) || METHODS[0];
  const requiresProof = method !== 'cash_on_delivery';
  const referenceTooShort = paymentReference.trim().length > 0 && paymentReference.trim().length < MIN_REFERENCE_LENGTH;

  function copyNumber() {
    if (!selected.number) return;
    navigator.clipboard.writeText(selected.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openApp() {
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
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: m.logo ? 'white' : m.color,
            border: m.logo ? '1px solid var(--line)' : 'none',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 700, overflow: 'hidden'
          }}>
            {m.logo ? (
              <img
                src={m.logo}
                alt={m.label}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                onError={(e) => {
                  // Si l'image n'a pas été ajoutée dans src/assets/, on retombe sur une pastille de couleur avec initiale
                  e.target.parentNode.style.background = m.color;
                  e.target.parentNode.style.border = 'none';
                  e.target.style.display = 'none';
                  e.target.parentNode.textContent = m.label[0];
                }}
              />
            ) : m.icon}
          </div>
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
            📲 Ouvrir {selected.label}
          </button>

          {selected.number ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: '#8A6116' }}>Numéro :</span>
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#8A6116' }}>{selected.number}</span>
              <button type="button" onClick={copyNumber} style={{ background: '#8A6116', color: 'white', border: 'none', borderRadius: 7, padding: '4px 9px', fontSize: 11, cursor: 'pointer' }}>
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          ) : (
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
              width: '100%', padding: '9px 12px', borderRadius: 8,
              border: `1.5px solid ${referenceTooShort ? 'var(--tomato)' : '#EBCFA0'}`,
              fontSize: 12.5, marginBottom: referenceTooShort ? 4 : 12, boxSizing: 'border-box'
            }}
          />
          {referenceTooShort && (
            <p style={{ fontSize: 11, color: 'var(--tomato)', marginBottom: 12 }}>
              La référence doit contenir au moins {MIN_REFERENCE_LENGTH} caractères.
            </p>
          )}

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