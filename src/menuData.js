/* ═══════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Complete Menu Database
   All products extracted from DotPe store, deduplicated,
   categorized, with SEO descriptions & image mapping.
   ═══════════════════════════════════════════════════════════ */

export const STORE_URL = 'https://veggieskitchen.dotpe.in/store/1/delivery'

/* ── CDN Image Map (from DotPe store) ──────────────────── */
const CDN = {
  // ── Specials & Combos ──
  palakPaneerRoti: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUI.jpg',
  shahiPaneerRice: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUA.jpg',
  shahiPaneerRoti: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P8.jpg',
  alooKulcha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU5.jpg',
  paneerChurChurNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QI.jpg',
  alooChurChurNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUZ.jpg',
  alooPyazChurChurNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTR.jpg',
  mixKulchaCombo: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV0.jpg',
  // ── Paneer ──
  shahiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUY.jpg',
  kadhaiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTE.jpg',
  paneerButterMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OC.jpg',
  paneerTikkaMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVL.jpg',
  paneerLababdar: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QN.jpg',
  paneerDoPyaza: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUC.jpg',
  palakPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QF.jpg',
  paneerMethiMalai: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNT4.jpg',
  paneerBhurji: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OS.jpg',
  handiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q5.jpg',
  tawaPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q7.jpg',
  mutterPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU9.jpg',
  kaliMirchPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTU.jpg',
  palakMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OZ.jpg',
  malaiKofta: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTQ.jpg',
  palakKofta: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OG.jpg',
  // ── Chaap ──
  kadhaiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PX.jpg',
  malaiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVA.jpg',
  butterChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PV.jpg',
  tawaChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNT7.jpg',
  handiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV8.jpg',
  // ── Chinese ──
  vegManchuranGravy: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PA.jpg',
  vegManchuranDry: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OL.jpg',
  chilliPaneerDry: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QO.jpg',
  springRoll: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV5.jpg',
  chilliPotato: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q4.jpg',
  chilliHoneyPotato: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTX.jpg',
  vegNoodle: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUL.jpg',
  // ── Main Course ──
  dalMakhani: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QJ.jpg',
  yellowDalTadka: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OY.jpg',
  mixVeg: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PK.jpg',
  jeeraAloo: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P0.jpg',
  alooMethi: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV9.jpg',
  alooGobi: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PC.jpg',
  gobiMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OI.jpg',
  mushroomMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUK.jpg',
  kadhaiMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OO.jpg',
  matarMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTI.jpg',
  matarMethiMalai: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTH.jpg',
  // ── Rice ──
  plainRice: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU1.jpg',
  jeeraRice: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OU.jpg',
  vegPulao: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PE.jpg',
  vegBiryani: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV6.jpg',
  // ── Tandoor ──
  paneerTikka: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUM.jpg',
  paneerMalaiTikka: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PO.jpg',
  haraBharaKebab: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU2.jpg',
  tandooriAloo: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PR.jpg',
  tandooriMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OE.jpg',
  tandooriStuffedChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OT.jpg',
  seekhKebab: 'https://lh3.googleusercontent.com/aida/AP1WRLu1OXkhlpJqq3N5zR8jgrvLjxuV9T79Q6v8IcKVI-_47kYj2E_jitMHakVNELbUIH241uFKmfaiUdEfgOUx0zHF_8MylPqgHmAzlttDUJ-e9p36BG5PCRJLtIY5CNsgguNUOa-QtTg5IfN9UlnJr-P4Kd-GPbn3s4S4r8Pnezi-1o2iFp0TTg1oKf7w7dHmwmMVrCc92ksgTMDLW_7BVjTesRnUk_eM2ygRWGLR47gJHDCJbK3phkSxOsc',
  platterTikkaChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU0.jpg',
  platterTikkaMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUQ.jpg',
  platterTikkaAlooChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVU.jpg',
  platterFull: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PW.jpg',
  platterChaapMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNT8.jpg',
  platterChaapAlooMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNV2.jpg',
  platterTikkaMushroomAlt: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU7.jpg',
  platterTikkaAlooChaapAlt: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUT.jpg',
  platterTikkaChaapAlt: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P4.jpg',
  // ── Breads ──
  tandooriRoti: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q2.jpg',
  tandooriButterRoti: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVN.jpg',
  missiRoti: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QH.jpg',
  // ── Naan & Kulcha ──
  plainNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVP.jpg',
  butterNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q3.jpg',
  garlicNaan: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUW.jpg',
  // ── Parathas ──
  plainParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVB.jpg',
  lacchaParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUD.jpg',
  pudinaParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PJ.jpg',
  redChilliParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNT5.jpg',
  greenChilliParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTK.jpg',
  alooParatha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVI.jpg',
  alooParathaCurd: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QM.jpg',
  // ── Soups ──
  hotSourSoup: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OH.jpg',
  tomatoSoup: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUG.jpg',
  // ── Breakfast variants ──
  bfShahiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNU3.jpg',
  bfKadhaiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTE.jpg',
  bfPaneerButterMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4Q1.jpg',
  bfPaneerTikkaMasala: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVE.jpg',
  bfPaneerLababdar: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTM.jpg',
  bfPaneerDoPyaza: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUB.jpg',
  bfPalakPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNVV.jpg',
  bfMutterPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QE.jpg',
  bfHandiPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4QD.jpg',
  bfTawaPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNUS.jpg',
  bfKaliMirchPaneer: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P6.jpg',
  bfPaneerBhurji: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P2.jpg',
  bfPaneerMethiMalai: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OW.jpg',
  bfMalaiKofta: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTS.jpg',
  bfPalakKofta: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTA.jpg',
  bfPalakMushroom: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4ON.jpg',
  bfKadhaiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OM.jpg',
  bfTawaChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4PS.jpg',
  bfMalaiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4OJ.jpg',
  bfHandiChaap: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTO.jpg',
  bfMixKulcha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F1ANMEAX07NNTW.jpg',
  bfAlooKulcha: 'https://cdn.dotpe.in/catalog/sku-images/2026-01-08/35TH8F56T0FBZ6CG4P1.jpg',
  heroSpread: '/images/hero_food_spread.png',
}

/* ── Section-level emoji for placeholders ───────────────── */
export const SECTION_EMOJI = {
  'todays-specials': '⭐',
  breakfast: '🍳',
  combos: '🔥',
  'main-course': '🍛',
  'paneer-specials': '🧀',
  'chaap-specials': '🌿',
  chinese: '🥡',
  'rice-biryani': '🍚',
  rolls: '🌯',
  tandoor: '🔥',
  breads: '🫓',
  'kulcha-naan': '🫓',
  parathas: '🥟',
  soups: '🍜',
  thalis: '🍽️',
  'party-packs': '🎉',
  'raita-sides': '🥣',
}

/* ═══════════════════════════════════════════════════════════
   MENU SECTIONS — 17 Categories
   ═══════════════════════════════════════════════════════════ */

export const MENU_SECTIONS = [
  /* ────────────────────────────────────────────────────────
     1. TODAY'S SPECIALS
     ──────────────────────────────────────────────────────── */
  {
    id: 'todays-specials',
    name: "Today's Specials",
    icon: 'auto_awesome',
    description: 'Limited-time deals on our most loved dishes — grab them before they are gone!',
    items: [
      {
        id: 'ts-palak-paneer-3-roti',
        name: 'Palak Paneer + 3 Roti',
        price: 120,
        description: 'Creamy spinach paneer curry served with three freshly baked rotis. A wholesome meal deal.',
        image: CDN.palakPaneerRoti,
        customizable: false,
        featured: true,
        tags: ['palak', 'paneer', 'spinach', 'roti', 'combo', 'deal', 'special'],
      },
      {
        id: 'ts-shahi-paneer-rice',
        name: 'Shahi Paneer Rice',
        price: 120,
        description: 'Royal shahi paneer gravy paired with aromatic steamed rice. A satisfying combo at a special price.',
        image: CDN.shahiPaneerRice,
        customizable: false,
        featured: true,
        tags: ['shahi', 'paneer', 'rice', 'combo', 'deal', 'special'],
      },
      {
        id: 'ts-shahi-paneer-3-roti',
        name: 'Shahi Paneer + 3 Roti',
        price: 120,
        description: 'Rich cashew-tomato paneer gravy with three soft rotis. Today only at an unbeatable price.',
        image: CDN.shahiPaneerRoti,
        customizable: false,
        featured: true,
        tags: ['shahi', 'paneer', 'roti', 'combo', 'deal', 'special'],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────
     2. BREAKFAST
     ──────────────────────────────────────────────────────── */
  {
    id: 'breakfast',
    name: 'Breakfast',
    icon: 'wb_sunny',
    description: 'Start your morning right with our hearty breakfast combos — curries, chaap, naan & kulcha specials.',
    items: [
      // — Paneer Breakfast —
      { id: 'bf-shahi-paneer', name: 'Shahi Paneer', price: 200, description: 'Royal paneer in a creamy cashew-tomato gravy. Served with choice of roti or rice.', image: CDN.bfShahiPaneer, customizable: true, featured: false, tags: ['shahi', 'paneer', 'breakfast', 'gravy', 'curry'] },
      { id: 'bf-kadhai-paneer', name: 'Kadhai Paneer', price: 200, description: 'Wok-tossed paneer with bell peppers and freshly ground kadhai masala.', image: CDN.bfKadhaiPaneer, customizable: true, featured: false, tags: ['kadhai', 'paneer', 'breakfast', 'bell pepper', 'spicy'] },
      { id: 'bf-paneer-butter-masala', name: 'Paneer Butter Masala', price: 200, description: 'Silky butter-tomato gravy with soft paneer cubes. A beloved classic.', image: CDN.bfPaneerButterMasala, customizable: true, featured: true, tags: ['paneer', 'butter', 'masala', 'breakfast', 'creamy'] },
      { id: 'bf-paneer-tikka-masala', name: 'Paneer Tikka Masala', price: 200, description: 'Chargrilled paneer tikka simmered in a smoky, spiced tomato gravy.', image: CDN.bfPaneerTikkaMasala, customizable: true, featured: false, tags: ['paneer', 'tikka', 'masala', 'breakfast', 'smoky'] },
      { id: 'bf-paneer-lababdar', name: 'Paneer Lababdar', price: 200, description: 'Cottage cheese in a rich onion-tomato-cashew gravy with aromatic spices.', image: CDN.bfPaneerLababdar, customizable: true, featured: false, tags: ['paneer', 'lababdar', 'breakfast', 'onion', 'cashew'] },
      { id: 'bf-paneer-do-pyaza', name: 'Paneer Do Pyaza', price: 200, description: 'Paneer cooked with double onions in a tangy, spice-rich masala.', image: CDN.bfPaneerDoPyaza, customizable: true, featured: false, tags: ['paneer', 'do pyaza', 'breakfast', 'onion'] },
      { id: 'bf-palak-paneer', name: 'Palak Paneer', price: 200, description: 'Cottage cheese in a vibrant spinach puree tempered with garlic and cumin.', image: CDN.bfPalakPaneer, customizable: true, featured: false, tags: ['palak', 'paneer', 'spinach', 'breakfast', 'healthy'] },
      { id: 'bf-mutter-paneer', name: 'Mutter Paneer', price: 200, description: 'Green peas and paneer in a fragrant tomato-onion gravy.', image: CDN.bfMutterPaneer, customizable: true, featured: false, tags: ['mutter', 'paneer', 'peas', 'breakfast'] },
      { id: 'bf-handi-paneer', name: 'Handi Paneer', price: 200, description: 'Slow-cooked paneer in a traditional handi with creamy spiced gravy.', image: CDN.bfHandiPaneer, customizable: true, featured: false, tags: ['handi', 'paneer', 'breakfast', 'slow cooked'] },
      { id: 'bf-tawa-paneer', name: 'Tawa Paneer', price: 200, description: 'Flat griddle-seared paneer with onions, peppers and Indian spices.', image: CDN.bfTawaPaneer, customizable: true, featured: false, tags: ['tawa', 'paneer', 'breakfast', 'griddle'] },
      { id: 'bf-kali-mirch-paneer', name: 'Kali Mirch Paneer', price: 200, description: 'Paneer in a peppery cream gravy with freshly cracked black pepper.', image: CDN.bfKaliMirchPaneer, customizable: true, featured: false, tags: ['kali mirch', 'paneer', 'pepper', 'breakfast', 'creamy'] },
      { id: 'bf-paneer-bhurji', name: 'Paneer Bhurji', price: 200, description: 'Scrambled cottage cheese with onions, tomatoes and green chillies.', image: CDN.bfPaneerBhurji, customizable: true, featured: false, tags: ['paneer', 'bhurji', 'scrambled', 'breakfast'] },
      { id: 'bf-paneer-methi-malai', name: 'Paneer Methi Malai', price: 200, description: 'Creamy fenugreek-laced white gravy with soft paneer pieces.', image: CDN.bfPaneerMethiMalai, customizable: true, featured: false, tags: ['paneer', 'methi', 'malai', 'fenugreek', 'breakfast'] },
      { id: 'bf-malai-kofta', name: 'Malai Kofta', price: 200, description: 'Soft paneer-potato dumplings in a velvety cream-cashew sauce.', image: CDN.bfMalaiKofta, customizable: true, featured: false, tags: ['malai', 'kofta', 'breakfast', 'creamy', 'dumpling'] },
      { id: 'bf-palak-kofta', name: 'Palak Kofta', price: 200, description: 'Vegetable dumplings in a vibrant, nutrient-rich spinach gravy.', image: CDN.bfPalakKofta, customizable: true, featured: false, tags: ['palak', 'kofta', 'spinach', 'breakfast'] },
      { id: 'bf-palak-mushroom', name: 'Palak Mushroom', price: 200, description: 'Earthy mushrooms in a smooth spinach purée with garlic notes.', image: CDN.bfPalakMushroom, customizable: true, featured: false, tags: ['palak', 'mushroom', 'spinach', 'breakfast'] },
      // — Chaap Breakfast —
      { id: 'bf-kadhai-chaap', name: 'Kadhai Chaap', price: 180, description: 'Soya chaap tossed in a spicy kadhai masala with capsicum and onion.', image: CDN.bfKadhaiChaap, customizable: true, featured: false, tags: ['kadhai', 'chaap', 'breakfast', 'spicy'] },
      { id: 'bf-tawa-chaap', name: 'Tawa Chaap', price: 180, description: 'Griddle-seared soya chaap in a tangy tawa masala sauce.', image: CDN.bfTawaChaap, customizable: true, featured: false, tags: ['tawa', 'chaap', 'breakfast'] },
      { id: 'bf-malai-chaap', name: 'Malai Chaap White Gravy', price: 180, description: 'Soya chaap in a silky white cream and cashew gravy.', image: CDN.bfMalaiChaap, customizable: true, featured: false, tags: ['malai', 'chaap', 'white', 'creamy', 'breakfast'] },
      { id: 'bf-handi-chaap', name: 'Handi Chaap', price: 180, description: 'Traditional handi-cooked soya chaap in aromatic spiced gravy.', image: CDN.bfHandiChaap, customizable: true, featured: false, tags: ['handi', 'chaap', 'breakfast'] },
      // — Naan Breakfast Combos —
      // — Kulcha Breakfast —
      { id: 'bf-aloo-kulcha', name: 'Aloo Kulcha Combo', price: 160, description: 'Potato-stuffed kulcha with chole, boondi raita and imly chutney.', image: CDN.bfAlooKulcha, customizable: true, featured: false, tags: ['aloo', 'kulcha', 'chole', 'breakfast'] },
      { id: 'bf-mix-kulcha', name: 'Mix Kulcha Combo', price: 160, description: 'Mixed-filling kulcha with chole, boondi raita and imly chutney.', image: CDN.bfMixKulcha, customizable: true, featured: false, tags: ['mix', 'kulcha', 'chole', 'breakfast'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     3. COMBOS
     ──────────────────────────────────────────────────────── */
  {
    id: 'combos',
    name: 'Combos',
    icon: 'widgets',
    description: 'Value-packed meal combos — curry with roti, rice, noodles or naan. Complete satisfaction in every bite.',
    items: [
      // Chur Chur Naan combos (Naan + Dal Makhani + Shahi Paneer + Raita + Salad & Chutney)
      { id: 'cb-paneer-chur-chur', name: 'Paneer Chur Chur Naan', price: 180, description: 'Crispy layered paneer naan with dal makhani, shahi paneer, raita, salad & chutney.', image: CDN.paneerChurChurNaan, customizable: true, featured: true, tags: ['chur chur', 'naan', 'paneer', 'dal makhani', 'combo', 'thali'] },
      { id: 'cb-aloo-chur-chur', name: 'Aloo Chur Chur Naan', price: 180, description: 'Flaky aloo naan served with dal makhani, shahi paneer, raita, salad & chutney.', image: CDN.alooChurChurNaan, customizable: true, featured: false, tags: ['chur chur', 'naan', 'aloo', 'dal makhani', 'combo'] },
      { id: 'cb-aloo-pyaz-chur-chur', name: 'Aloo Pyaz Chur Chur Naan', price: 180, description: 'Potato-onion chur chur naan with dal makhani, paneer, raita & chutney.', image: CDN.alooPyazChurChurNaan, customizable: true, featured: false, tags: ['chur chur', 'naan', 'aloo', 'pyaz', 'combo'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     4. MAIN COURSE
     ──────────────────────────────────────────────────────── */
  {
    id: 'main-course',
    name: 'Main Course',
    icon: 'dinner_dining',
    description: 'Hearty North Indian curries, dals and sabzis — slow-cooked to perfection with organic ingredients.',
    items: [
      { id: 'mc-dal-makhani', name: 'Dal Makhani', price: 162, description: 'Legendary slow-cooked black lentils simmered 24 hours with butter and cream.', image: CDN.dalMakhani, customizable: true, featured: true, tags: ['dal', 'makhani', 'lentils', 'slow cooked', 'butter', 'cream'] },
      { id: 'mc-yellow-dal-tadka', name: 'Yellow Dal Tadka', price: 143, description: 'Tempered yellow lentils with cumin, garlic and fresh coriander.', image: CDN.yellowDalTadka, customizable: true, featured: false, tags: ['dal', 'tadka', 'yellow', 'lentils', 'cumin'] },
      { id: 'mc-mix-veg', name: 'Mix Veg', price: 152, description: 'Seasonal mixed vegetables sautéed in a flavourful Indian masala.', image: CDN.mixVeg, customizable: true, featured: false, tags: ['mix veg', 'vegetables', 'sabzi', 'seasonal'] },
      { id: 'mc-jeera-aloo', name: 'Jeera Aloo', price: 152, description: 'Cumin-spiced potatoes — a simple, comforting North Indian classic.', image: CDN.jeeraAloo, customizable: true, featured: false, tags: ['jeera', 'aloo', 'potato', 'cumin'] },
      { id: 'mc-aloo-methi', name: 'Aloo Methi', price: 152, description: 'Potatoes cooked with fresh fenugreek leaves and aromatic spices.', image: CDN.alooMethi, customizable: true, featured: false, tags: ['aloo', 'methi', 'fenugreek', 'potato'] },
      { id: 'mc-aloo-gobi', name: 'Aloo Gobi', price: 180, description: 'Classic potato-cauliflower curry with turmeric and cumin seeds.', image: CDN.alooGobi, customizable: true, featured: false, tags: ['aloo', 'gobi', 'cauliflower', 'potato'] },
      { id: 'mc-gobi-masala', name: 'Gobi Masala', price: 180, description: 'Cauliflower florets in a robust onion-tomato masala gravy.', image: CDN.gobiMasala, customizable: true, featured: false, tags: ['gobi', 'masala', 'cauliflower'] },
      { id: 'mc-mushroom-masala', name: 'Mushroom Masala', price: 160, description: 'Button mushrooms simmered in a rich, spice-laden masala sauce.', image: CDN.mushroomMasala, customizable: true, featured: false, tags: ['mushroom', 'masala', 'gravy'] },
      { id: 'mc-kadhai-mushroom', name: 'Kadhai Mushroom', price: 152, description: 'Wok-tossed mushrooms with bell peppers in kadhai spices.', image: CDN.kadhaiMushroom, customizable: true, featured: false, tags: ['kadhai', 'mushroom', 'bell pepper'] },
      { id: 'mc-matar-mushroom', name: 'Matar Mushroom', price: 152, description: 'Green peas and mushrooms in a mild, tomato-based gravy.', image: CDN.matarMushroom, customizable: true, featured: false, tags: ['matar', 'mushroom', 'peas'] },
      { id: 'mc-matar-methi-malai', name: 'Matar Methi Malai', price: 180, description: 'Peas and fenugreek in a luxurious cream-cashew sauce.', image: CDN.matarMethiMalai, customizable: true, featured: false, tags: ['matar', 'methi', 'malai', 'peas', 'fenugreek', 'cream'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     5. PANEER SPECIALS
     ──────────────────────────────────────────────────────── */
  {
    id: 'paneer-specials',
    name: 'Paneer Specials',
    icon: 'restaurant',
    description: 'Premium cottage cheese curries — from creamy classics to bold, spice-forward preparations.',
    items: [
      { id: 'ps-shahi-paneer', name: 'Shahi Paneer', price: 190, description: 'Cottage cheese in a royal cashew-cream-tomato gravy. Our signature.', image: CDN.shahiPaneer, customizable: true, featured: true, tags: ['shahi', 'paneer', 'cashew', 'cream', 'royal'] },
      { id: 'ps-kadhai-paneer', name: 'Kadhai Paneer', price: 190, description: 'Wok-tossed paneer with bell peppers and freshly ground kadhai spices.', image: CDN.kadhaiPaneer, customizable: true, featured: true, tags: ['kadhai', 'paneer', 'bell pepper', 'spicy', 'wok'] },
      { id: 'ps-paneer-butter-masala', name: 'Paneer Butter Masala', price: 190, description: 'Silky tomato-butter gravy with soft paneer cubes. A timeless favourite.', image: CDN.paneerButterMasala, customizable: true, featured: true, tags: ['paneer', 'butter', 'masala', 'tomato', 'creamy'] },
      { id: 'ps-paneer-tikka-masala', name: 'Paneer Tikka Masala', price: 220, description: 'Chargrilled paneer tikka simmered in a smoky, aromatic tomato gravy.', image: CDN.paneerTikkaMasala, customizable: true, featured: false, tags: ['paneer', 'tikka', 'masala', 'smoky', 'chargrilled'] },
      { id: 'ps-paneer-lababdar', name: 'Paneer Lababdar', price: 190, description: 'Cottage cheese in a velvety onion-tomato-cashew gravy.', image: CDN.paneerLababdar, customizable: true, featured: false, tags: ['paneer', 'lababdar', 'cashew', 'onion'] },
      { id: 'ps-paneer-do-pyaza', name: 'Paneer Do Pyaza', price: 235, description: 'Paneer cooked with generous double onions in a tangy masala.', image: CDN.paneerDoPyaza, customizable: true, featured: false, tags: ['paneer', 'do pyaza', 'onion', 'tangy'] },
      { id: 'ps-palak-paneer', name: 'Palak Paneer', price: 190, description: 'Cottage cheese in a vibrant spinach purée with garlic and cumin.', image: CDN.palakPaneer, customizable: true, featured: true, tags: ['palak', 'paneer', 'spinach', 'garlic', 'healthy'] },
      { id: 'ps-paneer-methi-malai', name: 'Paneer Methi Malai', price: 235, description: 'Creamy fenugreek-infused white gravy with tender paneer pieces.', image: CDN.paneerMethiMalai, customizable: true, featured: false, tags: ['paneer', 'methi', 'malai', 'fenugreek', 'cream'] },
      { id: 'ps-paneer-bhurji', name: 'Paneer Bhurji', price: 229, description: 'Scrambled cottage cheese with tomatoes, onions and green chillies.', image: CDN.paneerBhurji, customizable: true, featured: false, tags: ['paneer', 'bhurji', 'scrambled', 'spicy'] },
      { id: 'ps-handi-paneer', name: 'Handi Paneer', price: 190, description: 'Slow-cooked paneer in a traditional clay handi with fragrant spices.', image: CDN.handiPaneer, customizable: true, featured: false, tags: ['handi', 'paneer', 'slow cooked', 'clay'] },
      { id: 'ps-tawa-paneer', name: 'Tawa Paneer', price: 190, description: 'Iron griddle-seared paneer with onions, peppers and tawa spices.', image: CDN.tawaPaneer, customizable: true, featured: false, tags: ['tawa', 'paneer', 'griddle', 'seared'] },
      { id: 'ps-mutter-paneer', name: 'Mutter Paneer', price: 190, description: 'Green peas and paneer in a classic tomato-onion gravy.', image: CDN.mutterPaneer, customizable: true, featured: false, tags: ['mutter', 'paneer', 'peas', 'tomato'] },
      { id: 'ps-kali-mirch-paneer', name: 'Kali Mirch Paneer', price: 190, description: 'Paneer in a peppery cream sauce with cracked black pepper.', image: CDN.kaliMirchPaneer, customizable: true, featured: false, tags: ['kali mirch', 'paneer', 'pepper', 'cream'] },
      { id: 'ps-palak-mushroom', name: 'Palak Mushroom', price: 190, description: 'Earthy mushrooms in a smooth, garlicky spinach purée.', image: CDN.palakMushroom, customizable: true, featured: false, tags: ['palak', 'mushroom', 'spinach', 'garlic'] },
      { id: 'ps-malai-kofta', name: 'Malai Kofta', price: 190, description: 'Soft paneer-potato dumplings in a velvety cream-cashew sauce.', image: CDN.malaiKofta, customizable: true, featured: false, tags: ['malai', 'kofta', 'dumpling', 'cream', 'cashew'] },
      { id: 'ps-palak-kofta', name: 'Palak Kofta', price: 190, description: 'Vegetable dumplings in a nutritious spinach gravy.', image: CDN.palakKofta, customizable: true, featured: false, tags: ['palak', 'kofta', 'spinach', 'dumpling'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     6. CHAAP SPECIALS
     ──────────────────────────────────────────────────────── */
  {
    id: 'chaap-specials',
    name: 'Chaap Specials',
    icon: 'local_fire_department',
    description: 'Signature soya chaap curries — tender, flavourful and uniquely Veggies Kitchen.',
    items: [
      { id: 'cs-kadhai-chaap', name: 'Kadhai Chaap', price: 152, description: 'Soya chaap tossed in a fiery kadhai masala with capsicum and onions.', image: CDN.kadhaiChaap, customizable: true, featured: true, tags: ['kadhai', 'chaap', 'spicy', 'capsicum'] },
      { id: 'cs-malai-chaap', name: 'Malai Chaap White Gravy', price: 200, description: 'Soya chaap in a luxurious white cream-cashew gravy.', image: CDN.malaiChaap, customizable: true, featured: true, tags: ['malai', 'chaap', 'white', 'cream', 'cashew'] },
      { id: 'cs-butter-chaap', name: 'Butter Chaap with Gravy', price: 152, description: 'Soft soya chaap drenched in a rich, buttery tomato gravy.', image: CDN.butterChaap, customizable: true, featured: false, tags: ['butter', 'chaap', 'tomato', 'gravy'] },
      { id: 'cs-tawa-chaap', name: 'Tawa Chaap', price: 152, description: 'Griddle-seared soya chaap with onions and tangy tawa spices.', image: CDN.tawaChaap, customizable: true, featured: false, tags: ['tawa', 'chaap', 'griddle', 'tangy'] },
      { id: 'cs-handi-chaap', name: 'Handi Chaap', price: 152, description: 'Traditional handi-style soya chaap in a slow-cooked gravy.', image: CDN.handiChaap, customizable: true, featured: false, tags: ['handi', 'chaap', 'traditional', 'slow cooked'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     7. CHINESE
     ──────────────────────────────────────────────────────── */
  {
    id: 'chinese',
    name: 'Chinese',
    icon: 'ramen_dining',
    description: 'Indo-Chinese favourites — from sizzling noodles and fried rice to crispy starters and manchurian.',
    items: [
      { id: 'ch-veg-noodle', name: 'Veg Noodles', price: 114, description: 'Classic vegetable noodles with a light soy-based seasoning.', image: CDN.vegNoodle, customizable: true, featured: false, tags: ['veg', 'noodles', 'chinese', 'basic'] },
      { id: 'ch-veg-manchurian-gravy', name: 'Veg Manchurian Gravy', price: 133, description: 'Deep-fried veggie balls in a tangy, garlicky manchurian sauce.', image: CDN.vegManchuranGravy, customizable: true, featured: true, tags: ['manchurian', 'gravy', 'chinese', 'garlic'] },
      { id: 'ch-veg-manchurian-dry', name: 'Veg Manchurian Dry', price: 133, description: 'Crispy vegetable balls tossed in a dry chilli-soy-garlic glaze.', image: CDN.vegManchuranDry, customizable: true, featured: false, tags: ['manchurian', 'dry', 'chinese', 'crispy'] },
      { id: 'ch-chilli-paneer-dry', name: 'Chilli Paneer Dry', price: 190, description: 'Crispy paneer cubes tossed with peppers in a fiery chilli sauce.', image: CDN.chilliPaneerDry, customizable: true, featured: true, tags: ['chilli', 'paneer', 'dry', 'chinese', 'spicy'] },
      { id: 'ch-spring-roll', name: 'Spring Roll', price: 114, description: 'Golden crispy rolls stuffed with spiced mixed vegetables.', image: CDN.springRoll, customizable: true, featured: false, tags: ['spring roll', 'crispy', 'chinese', 'starter'] },
      { id: 'ch-chilli-potato', name: 'Chilli Potato', price: 100, description: 'Crispy potato fingers tossed in a tangy chilli-soy sauce.', image: CDN.chilliPotato, customizable: true, featured: false, tags: ['chilli', 'potato', 'chinese', 'starter', 'crispy'] },
      { id: 'ch-chilli-honey-potato', name: 'Chilli Honey Potato', price: 100, description: 'Crispy potato fingers glazed with sweet honey and spicy chilli.', image: CDN.chilliHoneyPotato, customizable: true, featured: false, tags: ['chilli', 'honey', 'potato', 'chinese', 'sweet', 'crispy'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     8. RICE & BIRYANI
     ──────────────────────────────────────────────────────── */
  {
    id: 'rice-biryani',
    name: 'Rice & Biryani',
    icon: 'rice_bowl',
    description: 'Fragrant basmati rice dishes — from simple steamed rice to aromatic biryanis and pulaos.',
    items: [
      { id: 'rb-plain-rice', name: 'Plain Rice', price: 100, description: 'Fluffy steamed basmati rice — the perfect companion for any curry.', image: CDN.plainRice, customizable: true, featured: false, tags: ['plain', 'rice', 'basmati', 'steamed'] },
      { id: 'rb-jeera-rice', name: 'Jeera Rice', price: 124, description: 'Basmati rice tempered with whole cumin seeds and ghee.', image: CDN.jeeraRice, customizable: true, featured: false, tags: ['jeera', 'rice', 'cumin', 'basmati'] },
      { id: 'rb-veg-pulao', name: 'Veg Pulao', price: 143, description: 'Fragrant basmati rice cooked with mixed vegetables and whole spices.', image: CDN.vegPulao, customizable: true, featured: false, tags: ['pulao', 'rice', 'vegetables', 'aromatic'] },
      { id: 'rb-veg-biryani', name: 'Veg Biryani with Boondi Raita', price: 143, description: 'Aromatic layered vegetable biryani served with boondi raita.', image: CDN.vegBiryani, customizable: true, featured: true, tags: ['biryani', 'rice', 'raita', 'layered', 'aromatic'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     9. ROLLS
     ──────────────────────────────────────────────────────── */
  {
    id: 'rolls',
    name: 'Rolls',
    icon: 'kebab_dining',
    description: 'Freshly wrapped rolls with your choice of filling — perfect for a quick, flavourful bite.',
    items: [
    ],
  },

  /* ────────────────────────────────────────────────────────
     10. TANDOOR
     ──────────────────────────────────────────────────────── */
  {
    id: 'tandoor',
    name: 'Tandoor',
    icon: 'outdoor_grill',
    description: 'Clay oven specialties — smoky, chargrilled tikkas, kebabs, chaap and platters from our traditional tandoor.',
    items: [
      // Singles
      { id: 'td-paneer-tikka', name: 'Paneer Tikka', price: 190, description: 'Marinated paneer cubes charred to perfection in our clay tandoor.', image: CDN.paneerTikka, customizable: true, featured: true, tags: ['paneer', 'tikka', 'tandoor', 'chargrilled'] },
      { id: 'td-paneer-malai-tikka', name: 'Paneer Malai Tikka', price: 267, description: 'Cream-cheese marinated paneer grilled to a golden, smoky finish.', image: CDN.paneerMalaiTikka, customizable: true, featured: true, tags: ['paneer', 'malai', 'tikka', 'cream', 'tandoor'] },
      { id: 'td-veg-seekh-kebab', name: 'Veg Seekh Kebab', price: 360, description: 'Minced vegetables and spices skewered and charred in clay tandoor.', image: CDN.seekhKebab, customizable: false, featured: true, tags: ['seekh', 'kebab', 'veg', 'tandoor', 'skewer'] },
      { id: 'td-hara-bhara-kebab', name: 'Hara Bhara Kebab', price: 229, description: 'Spinach and pea patties with aromatic spices — crispy outside, soft inside.', image: CDN.haraBharaKebab, customizable: false, featured: false, tags: ['hara bhara', 'kebab', 'spinach', 'peas', 'tandoor'] },
      { id: 'td-tandoori-aloo', name: 'Tandoori Aloo', price: 190, description: 'Baby potatoes marinated in spices and roasted in the clay tandoor.', image: CDN.tandooriAloo, customizable: false, featured: false, tags: ['tandoori', 'aloo', 'potato', 'tandoor'] },
      { id: 'td-tandoori-mushroom', name: 'Tandoori Mushroom', price: 267, description: 'Whole mushrooms marinated and charred in our wood-fired tandoor.', image: CDN.tandooriMushroom, customizable: false, featured: false, tags: ['tandoori', 'mushroom', 'tandoor', 'charred'] },
      { id: 'td-tandoori-stuffed-chaap', name: 'Tandoori Stuffed Chaap', price: 267, description: 'Stuffed soya chaap slow-grilled in the tandoor with smoky spices.', image: CDN.tandooriStuffedChaap, customizable: false, featured: false, tags: ['tandoori', 'stuffed', 'chaap', 'tandoor'] },
      // Tandoori Platters
      { id: 'td-platter-tikka-mushroom', name: 'Paneer Tikka + Tandoori Mushroom', price: 228, description: 'A platter of smoky paneer tikka and charred tandoori mushrooms.', image: CDN.platterTikkaMushroom, customizable: false, featured: false, tags: ['platter', 'paneer', 'tikka', 'mushroom', 'tandoor'] },
      { id: 'td-platter-tikka-chaap', name: 'Paneer Tikka + Tandoori Chaap', price: 228, description: 'Grilled paneer tikka paired with tandoori soya chaap.', image: CDN.platterTikkaChaap, customizable: false, featured: false, tags: ['platter', 'paneer', 'tikka', 'chaap', 'tandoor'] },
      { id: 'td-platter-tikka-aloo-chaap', name: 'Paneer Tikka + Tandoori Aloo + Chaap', price: 286, description: 'Triple treat — paneer tikka, tandoori aloo and soya chaap.', image: CDN.platterTikkaAlooChaap, customizable: false, featured: false, tags: ['platter', 'paneer', 'tikka', 'aloo', 'chaap', 'tandoor'] },
      { id: 'td-platter-chaap-mushroom', name: 'Tandoori Chaap + Tandoori Mushroom', price: 228, description: 'Smoked soya chaap and mushrooms fresh from the clay oven.', image: CDN.platterChaapMushroom, customizable: false, featured: false, tags: ['platter', 'chaap', 'mushroom', 'tandoor'] },
      { id: 'td-platter-chaap-aloo-mushroom', name: 'Tandoori Chaap + Aloo + Mushroom Tikka', price: 320, description: 'Grand platter — soya chaap, tandoori aloo and mushroom tikka.', image: CDN.platterChaapAlooMushroom, customizable: false, featured: false, tags: ['platter', 'chaap', 'aloo', 'mushroom', 'tandoor'] },
      { id: 'td-platter-full', name: 'Paneer + Chaap + Mushroom + Aloo', price: 381, description: 'The ultimate tandoori platter — paneer, chaap, mushroom and aloo.', image: CDN.platterFull, customizable: false, featured: true, tags: ['platter', 'paneer', 'chaap', 'mushroom', 'aloo', 'tandoor', 'full'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     11. BREADS
     ──────────────────────────────────────────────────────── */
  {
    id: 'breads',
    name: 'Breads',
    icon: 'bakery_dining',
    description: 'Freshly baked Indian breads from our tandoor — soft rotis and flavoured flatbreads.',
    items: [
      { id: 'br-tandoori-roti', name: 'Tandoori Roti', price: 24, description: 'Whole-wheat roti baked in the clay tandoor till lightly charred.', image: CDN.tandooriRoti, customizable: false, featured: false, tags: ['tandoori', 'roti', 'bread', 'whole wheat'] },
      { id: 'br-tandoori-butter-roti', name: 'Tandoori Butter Roti', price: 33, description: 'Tandoor-baked roti brushed with a generous pat of fresh butter.', image: CDN.tandooriButterRoti, customizable: false, featured: false, tags: ['tandoori', 'butter', 'roti', 'bread'] },
      { id: 'br-missi-roti', name: 'Missi Roti', price: 48, description: 'Spiced gram-flour flatbread with onions and fresh herbs.', image: CDN.missiRoti, customizable: false, featured: false, tags: ['missi', 'roti', 'gram flour', 'spiced', 'bread'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     12. KULCHA & NAAN
     ──────────────────────────────────────────────────────── */
  {
    id: 'kulcha-naan',
    name: 'Kulcha & Naan',
    icon: 'flatware',
    description: 'Stuffed kulchas and fluffy naans — baked golden in our clay tandoor.',
    items: [
      { id: 'kn-plain-naan', name: 'Plain Naan', price: 38, description: 'Soft, fluffy tandoor-baked naan — classic and versatile.', image: CDN.plainNaan, customizable: false, featured: false, tags: ['plain', 'naan', 'bread', 'tandoor'] },
      { id: 'kn-butter-naan', name: 'Butter Naan', price: 48, description: 'Pillowy naan generously brushed with melted butter.', image: CDN.butterNaan, customizable: false, featured: false, tags: ['butter', 'naan', 'bread'] },
      { id: 'kn-garlic-naan', name: 'Garlic Naan', price: 57, description: 'Aromatic naan topped with roasted garlic and fresh coriander.', image: CDN.garlicNaan, customizable: false, featured: true, tags: ['garlic', 'naan', 'bread', 'aromatic'] },
      { id: 'kn-aloo-kulcha-combo', name: 'Aloo Kulcha Combo', price: 100, description: 'Potato-stuffed kulcha with chole, boondi raita & imly chutney.', image: CDN.alooKulcha, customizable: true, featured: true, tags: ['aloo', 'kulcha', 'chole', 'raita', 'combo'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     13. PARATHAS
     ──────────────────────────────────────────────────────── */
  {
    id: 'parathas',
    name: 'Parathas',
    icon: 'breakfast_dining',
    description: 'Flaky, buttery parathas — stuffed and plain varieties served with curd, butter and pickle.',
    items: [
      { id: 'pr-plain-paratha', name: 'Plain Paratha', price: 38, description: 'Simple, flaky layered paratha — golden and buttery.', image: CDN.plainParatha, customizable: false, featured: false, tags: ['plain', 'paratha', 'bread', 'flaky'] },
      { id: 'pr-laccha-paratha', name: 'Laccha Paratha', price: 48, description: 'Multi-layered laccha paratha — crispy, flaky perfection.', image: CDN.lacchaParatha, customizable: false, featured: false, tags: ['laccha', 'paratha', 'layered', 'crispy'] },
      { id: 'pr-pudina-paratha', name: 'Pudina Paratha', price: 48, description: 'Refreshing mint-flavoured paratha — aromatic and light.', image: CDN.pudinaParatha, customizable: false, featured: false, tags: ['pudina', 'paratha', 'mint', 'aromatic'] },
      { id: 'pr-red-chilli-paratha', name: 'Red Chilli Paratha', price: 57, description: 'Spicy red chilli paratha for those who love the heat.', image: CDN.redChilliParatha, customizable: false, featured: false, tags: ['red chilli', 'paratha', 'spicy'] },
      { id: 'pr-green-chilli-paratha', name: 'Green Chilli Paratha', price: 57, description: 'Fresh green chilli paratha — bold flavour with a kick.', image: CDN.greenChilliParatha, customizable: false, featured: false, tags: ['green chilli', 'paratha', 'spicy'] },
      { id: 'pr-aloo-paratha-full', name: 'Aloo Paratha (Curd, Butter & Pickle)', price: 80, description: 'Classic potato-stuffed paratha with curd, butter and pickle.', image: CDN.alooParatha, customizable: false, featured: true, tags: ['aloo', 'paratha', 'curd', 'butter', 'pickle', 'potato'] },
      { id: 'pr-aloo-paratha-dahi', name: 'Aloo Paratha (Dahi & Pickle)', price: 86, description: 'Potato paratha served with fresh dahi and tangy pickle.', image: CDN.alooParathaCurd, customizable: false, featured: false, tags: ['aloo', 'paratha', 'dahi', 'pickle', 'potato'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     14. SOUPS
     ──────────────────────────────────────────────────────── */
  {
    id: 'soups',
    name: 'Soups',
    icon: 'soup_kitchen',
    description: 'Warming, flavourful soups — the perfect start to your meal.',
    items: [
      { id: 'sp-tomato-soup', name: 'Tomato Soup', price: 133, description: 'Classic creamy tomato soup with a hint of basil and pepper.', image: CDN.tomatoSoup, customizable: false, featured: false, tags: ['tomato', 'soup', 'creamy', 'warm'] },
      { id: 'sp-hot-sour-soup', name: 'Hot & Sour Soup', price: 133, description: 'Tangy, peppery Indo-Chinese soup with crisp vegetables.', image: CDN.hotSourSoup, customizable: false, featured: true, tags: ['hot', 'sour', 'soup', 'chinese', 'spicy'] },
    ],
  },

  /* ────────────────────────────────────────────────────────
     15. THALIS
     ──────────────────────────────────────────────────────── */
  {
    id: 'thalis',
    name: 'Thalis',
    icon: 'lunch_dining',
    description: 'Complete Indian thali meals — a balanced platter of dal, paneer, bread, rice and more.',
    items: [
    ],
  },

  /* ────────────────────────────────────────────────────────
     16. PARTY PACKS
     ──────────────────────────────────────────────────────── */
  {
    id: 'party-packs',
    name: 'Party Packs',
    icon: 'celebration',
    description: 'Celebrate in style — curated party packs for gatherings and festivals.',
    items: [
    ],
  },

  /* ────────────────────────────────────────────────────────
     17. RAITA & SIDES
     ──────────────────────────────────────────────────────── */
  {
    id: 'raita-sides',
    name: 'Raita & Sides',
    icon: 'room_service',
    description: 'Cool raitas and crunchy sides to complete your meal.',
    items: [
    ],
  },
]

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

/** Get a flat array of every product across all sections */
export function getAllProducts() {
  return MENU_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionId: section.id, sectionName: section.name }))
  )
}

/** Search products by name or tags (NOT description, to avoid false category matches) */
export function searchProducts(query) {
  if (!query || !query.trim()) return []
  const q = query.toLowerCase().trim()
  return getAllProducts().filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.includes(q))
  )
}

/** Get only featured / recommended products */
export function getFeaturedProducts() {
  return getAllProducts().filter((item) => item.featured)
}

/** Total number of unique products */
export function getProductCount() {
  return getAllProducts().length
}

/** Get section by id */
export function getSectionById(sectionId) {
  return MENU_SECTIONS.find((s) => s.id === sectionId) || null
}
