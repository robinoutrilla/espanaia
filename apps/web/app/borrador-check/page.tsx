"use client";

import { useState, useMemo } from "react";
import { SiteHeader } from "../../components/site-header";

/* ═══════════════════════════════════════════════════════════════════════════
   Borrador Check — Verificador de deducciones IRPF no activadas
   Detecta cuanto puede ahorrar el ciudadano revisando su borrador
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Tipos ──────────────────────────────────────────────────────────────────

interface UserProfile {
  income: number;
  ccaa: string;
  age: number;
  hasChildren: boolean;
  numChildren: number;
  childrenUnder3: number;
  childrenInGuarderia: boolean;
  isSingleParent: boolean;
  isFamiliaNumero: boolean;
  hasDisability: boolean;
  disabilityPercent: number;
  caresForElderly: boolean;
  elderlyDependents: number;
  hasMortgagePre2013: boolean;
  mortgageAnnualPayment: number;
  paysRent: boolean;
  rentAnnualAmount: number;
  rentContractPre2015: boolean;
  makesDonations: boolean;
  donationAmount: number;
  donationRecurring: boolean;
  hasPensionPlan: boolean;
  pensionContribution: number;
  isAutonomo: boolean;
  worksFromHome: boolean;
  homeOfficePercent: number;
  hasUnionFees: boolean;
  unionFeeAmount: number;
  hasLegalDefenseCosts: boolean;
  legalDefenseAmount: number;
  investedInStartup: boolean;
  startupInvestment: number;
  boughtElectricVehicle: boolean;
  evPurchaseAmount: number;
  installedSolarPanels: boolean;
  solarInvestment: number;
  didEnergyRehab: boolean;
  rehabInvestment: number;
  isNewResident: boolean;
  livesInRuralArea: boolean;
  hasMaternityBenefit: boolean;
  spouseIncome: number;
  jointFiling: boolean;
}

interface Deduction {
  id: string;
  category: string;
  name: string;
  description: string;
  maxSaving: number;
  actualSaving: number;
  isActive: boolean;
  requirement: string;
  tip: string;
  scope: "estatal" | "autonomica" | "ambas";
  article: string;
}

const DEFAULT_PROFILE: UserProfile = {
  income: 30000,
  ccaa: "madrid",
  age: 35,
  hasChildren: false,
  numChildren: 0,
  childrenUnder3: 0,
  childrenInGuarderia: false,
  isSingleParent: false,
  isFamiliaNumero: false,
  hasDisability: false,
  disabilityPercent: 0,
  caresForElderly: false,
  elderlyDependents: 0,
  hasMortgagePre2013: false,
  mortgageAnnualPayment: 0,
  paysRent: false,
  rentAnnualAmount: 0,
  rentContractPre2015: false,
  makesDonations: false,
  donationAmount: 0,
  donationRecurring: false,
  hasPensionPlan: false,
  pensionContribution: 0,
  isAutonomo: false,
  worksFromHome: false,
  homeOfficePercent: 30,
  hasUnionFees: false,
  unionFeeAmount: 0,
  hasLegalDefenseCosts: false,
  legalDefenseAmount: 0,
  investedInStartup: false,
  startupInvestment: 0,
  boughtElectricVehicle: false,
  evPurchaseAmount: 0,
  installedSolarPanels: false,
  solarInvestment: 0,
  didEnergyRehab: false,
  rehabInvestment: 0,
  isNewResident: false,
  livesInRuralArea: false,
  hasMaternityBenefit: false,
  spouseIncome: 0,
  jointFiling: false,
};

// ── CCAA Data ──────────────────────────────────────────────────────────────

const CCAA_OPTIONS: { value: string; label: string }[] = [
  { value: "andalucia", label: "Andalucia" },
  { value: "aragon", label: "Aragon" },
  { value: "asturias", label: "Asturias" },
  { value: "baleares", label: "Islas Baleares" },
  { value: "canarias", label: "Canarias" },
  { value: "cantabria", label: "Cantabria" },
  { value: "castilla-leon", label: "Castilla y Leon" },
  { value: "castilla-mancha", label: "Castilla-La Mancha" },
  { value: "cataluna", label: "Cataluna" },
  { value: "extremadura", label: "Extremadura" },
  { value: "galicia", label: "Galicia" },
  { value: "madrid", label: "Comunidad de Madrid" },
  { value: "murcia", label: "Region de Murcia" },
  { value: "navarra", label: "Navarra" },
  { value: "pais-vasco", label: "Pais Vasco" },
  { value: "rioja", label: "La Rioja" },
  { value: "valencia", label: "Comunitat Valenciana" },
];

// ── Marginal tax rate estimate for saving calculations ─────────────────────

function marginalRate(income: number): number {
  if (income <= 12450) return 0.19;
  if (income <= 20200) return 0.24;
  if (income <= 35200) return 0.30;
  if (income <= 60000) return 0.37;
  if (income <= 300000) return 0.45;
  return 0.47;
}

// ── Calculate deductions based on profile ──────────────────────────────────

function calculateDeductions(p: UserProfile): Deduction[] {
  const rate = marginalRate(p.income);
  const deductions: Deduction[] = [];

  // 1. MINIMO POR DESCENDIENTES
  if (p.hasChildren && p.numChildren > 0) {
    const amounts = [2400, 2700, 4000, 4500]; // 1st, 2nd, 3rd, 4th+
    let total = 0;
    for (let i = 0; i < p.numChildren; i++) {
      total += amounts[Math.min(i, 3)];
    }
    // Extra for children under 3
    total += p.childrenUnder3 * 2800;
    const saving = total * rate;
    deductions.push({
      id: "min-descendientes",
      category: "Familia",
      name: "Minimo por descendientes",
      description: `Reduccion en base por ${p.numChildren} hijo(s)${p.childrenUnder3 > 0 ? ` (${p.childrenUnder3} menor de 3 anos)` : ""}. Cada hijo reduce la base imponible.`,
      maxSaving: saving,
      actualSaving: saving,
      isActive: true,
      requirement: "Hijos que convivan con el contribuyente y ganen menos de 8.000 euros/ano",
      tip: "Si tu hijo ha cumplido 25 anos pero sigue conviviendo contigo y ganando menos de 8.000 euros, aun puede aplicarse la deduccion si tiene discapacidad.",
      scope: "estatal",
      article: "Art. 58 LIRPF",
    });
  } else {
    deductions.push({
      id: "min-descendientes",
      category: "Familia",
      name: "Minimo por descendientes",
      description: "Si tienes hijos menores de 25 anos (o con discapacidad sin limite de edad) que convivan contigo y ganen menos de 8.000 euros al ano.",
      maxSaving: 2400 * rate,
      actualSaving: 0,
      isActive: false,
      requirement: "Tener hijos que convivan con el contribuyente",
      tip: "Incluye hijos adoptados y acogidos. Si el hijo tiene menos de 3 anos, el minimo sube 2.800 euros adicionales.",
      scope: "estatal",
      article: "Art. 58 LIRPF",
    });
  }

  // 2. DEDUCCION POR MATERNIDAD
  {
    const applies = p.hasChildren && p.childrenUnder3 > 0 && p.hasMaternityBenefit;
    const saving = applies ? Math.min(1200 * p.childrenUnder3, 1200) : 0;
    deductions.push({
      id: "maternidad",
      category: "Familia",
      name: "Deduccion por maternidad",
      description: "Hasta 1.200 euros anuales por cada hijo menor de 3 anos para madres trabajadoras (o padres en caso de fallecimiento, custodia exclusiva, etc.).",
      maxSaving: 1200,
      actualSaving: saving,
      isActive: applies,
      requirement: "Madre trabajadora con hijos menores de 3 anos dada de alta en la Seguridad Social",
      tip: "Se puede solicitar el abono anticipado de 100 euros/mes en vez de esperar a la declaracion. Ademas se incrementa en 1.000 euros por gastos de guarderia autorizada.",
      scope: "estatal",
      article: "Art. 81 LIRPF",
    });
  }

  // 3. GASTOS DE GUARDERIA (incremento maternidad)
  {
    const applies = p.hasChildren && p.childrenInGuarderia && p.childrenUnder3 > 0;
    const saving = applies ? Math.min(1000, 1000) : 0;
    deductions.push({
      id: "guarderia",
      category: "Familia",
      name: "Incremento por gastos de guarderia",
      description: "Hasta 1.000 euros adicionales a la deduccion por maternidad si el hijo asiste a una guarderia o centro de educacion infantil autorizado.",
      maxSaving: 1000,
      actualSaving: saving,
      isActive: applies,
      requirement: "Hijo menor de 3 anos inscrito en guarderia autorizada",
      tip: "La guarderia debe informar a Hacienda (modelo 233). Verifica que tu centro lo haya presentado, si no, no aparecera en tu borrador.",
      scope: "estatal",
      article: "Art. 81.1 LIRPF",
    });
  }

  // 4. FAMILIA NUMEROSA
  {
    const applies = p.isFamiliaNumero;
    const saving = applies ? (p.numChildren >= 5 ? 2400 : 1200) : 0;
    deductions.push({
      id: "familia-numerosa",
      category: "Familia",
      name: "Deduccion por familia numerosa",
      description: "1.200 euros por familia numerosa general, 2.400 euros por familia numerosa especial (5+ hijos).",
      maxSaving: 2400,
      actualSaving: saving,
      isActive: applies,
      requirement: "Titulo de familia numerosa en vigor",
      tip: "Se puede solicitar abono anticipado. Si ambos padres trabajan, uno de ellos puede ceder su parte al otro. Tambien aplica con 2 hijos si uno tiene discapacidad.",
      scope: "estatal",
      article: "Art. 81 bis LIRPF",
    });
  }

  // 5. MONOPARENTAL
  {
    const applies = p.isSingleParent && p.hasChildren;
    const saving = applies ? 1200 : 0;
    deductions.push({
      id: "monoparental",
      category: "Familia",
      name: "Deduccion por familia monoparental",
      description: "1.200 euros anuales para familias monoparentales con dos o mas hijos sin derecho a anualidades por alimentos.",
      maxSaving: 1200,
      actualSaving: saving,
      isActive: applies,
      requirement: "Familia monoparental con 2+ hijos que cumplan requisitos",
      tip: "Muchas CCAA tienen deducciones adicionales propias para monoparentales. Revisalo en la seccion autonomica de tu borrador.",
      scope: "estatal",
      article: "Art. 81 bis LIRPF",
    });
  }

  // 6. MINIMO POR ASCENDIENTES
  {
    const applies = p.caresForElderly && p.elderlyDependents > 0;
    const total = applies ? p.elderlyDependents * 1150 : 0;
    const saving = total * rate;
    deductions.push({
      id: "min-ascendientes",
      category: "Familia",
      name: "Minimo por ascendientes",
      description: "1.150 euros por ascendiente mayor de 65 anos (o con discapacidad) que conviva contigo y gane menos de 8.000 euros. 1.400 euros adicionales si supera los 75 anos.",
      maxSaving: (1150 + 1400) * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Ascendiente mayor de 65 conviviendo con el contribuyente",
      tip: "Si tu padre/madre vive en una residencia pero depende economicamente de ti, puede considerarse convivencia. Guarda justificantes de los pagos.",
      scope: "estatal",
      article: "Art. 59 LIRPF",
    });
  }

  // 7. DISCAPACIDAD
  {
    const applies = p.hasDisability && p.disabilityPercent >= 33;
    const minDisc = applies ? (p.disabilityPercent >= 65 ? 12000 : 3000) : 0;
    const saving = minDisc * rate;
    deductions.push({
      id: "discapacidad",
      category: "Personal",
      name: "Minimo por discapacidad del contribuyente",
      description: "3.000 euros con discapacidad del 33-64%. 12.000 euros si es del 65% o superior. Adicionalmente, 3.000 euros por gastos de asistencia si necesitas ayuda de terceros.",
      maxSaving: 15000 * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Grado de discapacidad reconocido del 33% o superior",
      tip: "Si tienes la condicion reconocida pero no la has comunicado a tu empresa, no aparecera en el borrador. Verifica la casilla 0417 y siguientes.",
      scope: "estatal",
      article: "Art. 60 LIRPF",
    });
  }

  // 8. PLANES DE PENSIONES
  {
    const applies = p.hasPensionPlan && p.pensionContribution > 0;
    const maxContrib = 1500;
    const effective = applies ? Math.min(p.pensionContribution, maxContrib) : 0;
    const saving = effective * rate;
    deductions.push({
      id: "pension",
      category: "Ahorro y prevision",
      name: "Aportaciones a planes de pensiones",
      description: `Reduccion en base imponible por aportaciones a planes de pensiones, hasta 1.500 euros/ano (o 8.500 euros si la empresa contribuye tambien).`,
      maxSaving: maxContrib * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Tener un plan de pensiones con aportaciones en el ejercicio",
      tip: "Si tu empresa ofrece plan de empleo, las aportaciones empresariales amplian tu limite hasta 8.500 euros. Es el ahorro fiscal mas rentable para rentas altas.",
      scope: "estatal",
      article: "Art. 51 LIRPF",
    });
  }

  // 9. DONATIVOS
  {
    const applies = p.makesDonations && p.donationAmount > 0;
    let saving = 0;
    if (applies) {
      const first250 = Math.min(p.donationAmount, 250);
      const rest = Math.max(p.donationAmount - 250, 0);
      saving = first250 * 0.80 + rest * (p.donationRecurring ? 0.45 : 0.40);
    }
    deductions.push({
      id: "donativos",
      category: "Ahorro y prevision",
      name: "Deduccion por donativos",
      description: "80% de deduccion en los primeros 250 euros donados. 40% del resto (45% si donas a la misma ONG 2+ anos seguidos).",
      maxSaving: 250 * 0.80 + (p.donationAmount > 250 ? (p.donationAmount - 250) * 0.45 : 0),
      actualSaving: saving,
      isActive: applies,
      requirement: "Donaciones a entidades acogidas a la Ley 49/2002 (ONGs, fundaciones, etc.)",
      tip: "Los primeros 250 euros tienen un 80% de deduccion, es una de las mas generosas del IRPF. Si donas 250 euros, recuperas 200 euros en la renta.",
      scope: "estatal",
      article: "Art. 68.3 LIRPF / Ley 49/2002",
    });
  }

  // 10. VIVIENDA HABITUAL (hipoteca pre-2013)
  {
    const applies = p.hasMortgagePre2013 && p.mortgageAnnualPayment > 0;
    const base = applies ? Math.min(p.mortgageAnnualPayment, 9040) : 0;
    const saving = base * 0.15;
    deductions.push({
      id: "vivienda-hipoteca",
      category: "Vivienda",
      name: "Deduccion por inversion en vivienda habitual",
      description: "15% de las cantidades pagadas (capital + intereses) hasta 9.040 euros/ano. Solo para hipotecas firmadas antes del 1 de enero de 2013.",
      maxSaving: 9040 * 0.15,
      actualSaving: saving,
      isActive: applies,
      requirement: "Hipoteca de vivienda habitual contratada antes del 01/01/2013 con deducciones aplicadas en 2012 o anteriores",
      tip: "Si en 2012 ya te deduciste por esta vivienda, mantienes el derecho. Si puedes, adelanta amortizacion hasta los 9.040 euros para maximizar. Es el ahorro fiscal mas potente (1.356 euros/ano).",
      scope: "estatal",
      article: "Disp. Trans. 18a LIRPF",
    });
  }

  // 11. ALQUILER (estatal pre-2015)
  {
    const applies = p.paysRent && p.rentContractPre2015;
    const base = applies ? Math.min(p.rentAnnualAmount, 9040) : 0;
    const saving = base * 0.105;
    deductions.push({
      id: "alquiler-estatal",
      category: "Vivienda",
      name: "Deduccion estatal por alquiler (transitoria)",
      description: "10,05% del alquiler pagado (max 9.040 euros/ano). Solo para contratos firmados antes del 01/01/2015 con base imponible inferior a 24.107,20 euros.",
      maxSaving: p.income < 24107 ? 9040 * 0.105 : 0,
      actualSaving: p.income < 24107 ? saving : 0,
      isActive: applies && p.income < 24107,
      requirement: "Contrato de alquiler de vivienda habitual anterior al 01/01/2015",
      tip: "Aunque la deduccion estatal desaparecio en 2015, se mantiene para contratos anteriores. Si no la estas aplicando, estas perdiendo hasta 949 euros/ano.",
      scope: "estatal",
      article: "Disp. Trans. 15a LIRPF",
    });
  }

  // 12. ALQUILER AUTONOMICO
  {
    const applies = p.paysRent && !p.rentContractPre2015;
    const ccaaRentDeductions: Record<string, { pct: number; max: number; maxIncome: number }> = {
      andalucia: { pct: 0.15, max: 600, maxIncome: 25000 },
      aragon: { pct: 0.10, max: 600, maxIncome: 25000 },
      asturias: { pct: 0.10, max: 500, maxIncome: 25009 },
      baleares: { pct: 0.15, max: 530, maxIncome: 26000 },
      canarias: { pct: 0.20, max: 600, maxIncome: 22000 },
      cantabria: { pct: 0.10, max: 300, maxIncome: 22946 },
      "castilla-mancha": { pct: 0.15, max: 450, maxIncome: 24000 },
      cataluna: { pct: 0.10, max: 300, maxIncome: 20000 },
      extremadura: { pct: 0.05, max: 300, maxIncome: 28000 },
      galicia: { pct: 0.10, max: 300, maxIncome: 22000 },
      madrid: { pct: 0.30, max: 1000, maxIncome: 26414 },
      murcia: { pct: 0.10, max: 300, maxIncome: 24000 },
      valencia: { pct: 0.15, max: 700, maxIncome: 25000 },
      rioja: { pct: 0.10, max: 300, maxIncome: 18030 },
      "castilla-leon": { pct: 0.20, max: 459, maxIncome: 18900 },
    };
    const ccaaData = ccaaRentDeductions[p.ccaa];
    const saving = applies && ccaaData && p.income <= ccaaData.maxIncome
      ? Math.min(p.rentAnnualAmount * ccaaData.pct, ccaaData.max)
      : 0;
    deductions.push({
      id: "alquiler-ccaa",
      category: "Vivienda",
      name: "Deduccion autonomica por alquiler",
      description: ccaaData
        ? `Tu CCAA ofrece ${(ccaaData.pct * 100).toFixed(0)}% del alquiler (max ${ccaaData.max} euros) si tu renta es inferior a ${ccaaData.maxIncome.toLocaleString("es-ES")} euros.`
        : "Tu comunidad autonoma puede tener deducciones por alquiler. Consultalo en la normativa autonomica.",
      maxSaving: ccaaData ? ccaaData.max : 600,
      actualSaving: saving,
      isActive: saving > 0,
      requirement: "Contrato de alquiler de vivienda habitual + limites de renta segun CCAA",
      tip: "Madrid ofrece hasta 1.000 euros (30% del alquiler). Es la deduccion autonomica por alquiler mas generosa. Asegurate de que tu casero ha registrado la fianza.",
      scope: "autonomica",
      article: "Normativa autonomica IRPF",
    });
  }

  // 13. CUOTAS SINDICALES
  {
    const applies = p.hasUnionFees && p.unionFeeAmount > 0;
    const effective = applies ? Math.min(p.unionFeeAmount, 600) : 0;
    const saving = effective * rate;
    deductions.push({
      id: "sindicatos",
      category: "Trabajo",
      name: "Cuotas sindicales",
      description: "Las cuotas a sindicatos son gasto deducible de los rendimientos del trabajo, hasta 600 euros/ano.",
      maxSaving: 600 * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Pagar cuotas a un sindicato legalmente constituido",
      tip: "Muchos trabajadores no incluyen sus cuotas sindicales. Si pagas 300 euros/ano, puedes ahorrar entre 57 y 141 euros segun tu tramo.",
      scope: "estatal",
      article: "Art. 19.2.d LIRPF",
    });
  }

  // 14. DEFENSA JURIDICA
  {
    const applies = p.hasLegalDefenseCosts && p.legalDefenseAmount > 0;
    const effective = applies ? Math.min(p.legalDefenseAmount, 300) : 0;
    const saving = effective * rate;
    deductions.push({
      id: "defensa-juridica",
      category: "Trabajo",
      name: "Gastos de defensa juridica laboral",
      description: "Deducibles hasta 300 euros/ano los gastos de defensa juridica derivados de litigios con el empleador.",
      maxSaving: 300 * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Gastos de abogado en litigios laborales contra el empleador",
      tip: "Si tuviste un juicio laboral, despido impugnado o cualquier reclamacion, esos honorarios de abogado son deducibles. Guarda la factura.",
      scope: "estatal",
      article: "Art. 19.2.e LIRPF",
    });
  }

  // 15. AUTONOMO: GASTOS DEDUCIBLES HOME OFFICE
  {
    const applies = p.isAutonomo && p.worksFromHome;
    const estimatedGastos = applies ? (p.income * 0.05 * (p.homeOfficePercent / 100)) : 0;
    const saving = estimatedGastos * rate;
    deductions.push({
      id: "autonomo-homeoffice",
      category: "Trabajo",
      name: "Gastos de suministros (autonomos)",
      description: "Los autonomos que trabajan desde casa pueden deducir el 30% de la proporcion de suministros (luz, agua, gas, internet) correspondiente a la superficie dedicada.",
      maxSaving: p.income * 0.03 * rate,
      actualSaving: saving,
      isActive: applies,
      requirement: "Ser autonomo y tener parte de la vivienda afecta a la actividad",
      tip: "Si dedicas el 25% de tu vivienda a trabajar, puedes deducir el 30% de ese 25% de suministros. Muchos autonomos no lo aplican y pierden 400-800 euros/ano.",
      scope: "estatal",
      article: "Art. 30.2.5a LIRPF",
    });
  }

  // 16. INVERSION EN STARTUPS
  {
    const applies = p.investedInStartup && p.startupInvestment > 0;
    const base = applies ? Math.min(p.startupInvestment, 100000) : 0;
    const saving = base * 0.50;
    deductions.push({
      id: "startup",
      category: "Inversiones",
      name: "Inversion en empresas de nueva creacion",
      description: "50% de deduccion sobre las cantidades invertidas en startups, con un maximo de 100.000 euros de base (hasta 50.000 euros de deduccion).",
      maxSaving: 50000,
      actualSaving: saving,
      isActive: applies,
      requirement: "Inversion en empresa de nueva creacion (menos de 3 anos, SA/SL) sin participacion superior al 40%",
      tip: "Desde la Ley de Startups (2023), la deduccion subio del 30% al 50% y la base del 60.000 a 100.000 euros. Es la deduccion mas potente del IRPF para inversores.",
      scope: "estatal",
      article: "Art. 68.1 LIRPF / Ley 28/2022",
    });
  }

  // 17. VEHICULO ELECTRICO
  {
    const applies = p.boughtElectricVehicle && p.evPurchaseAmount > 0;
    const base = applies ? Math.min(p.evPurchaseAmount, 20000) : 0;
    const saving = base * 0.15;
    deductions.push({
      id: "vehiculo-electrico",
      category: "Transicion verde",
      name: "Deduccion por vehiculo electrico",
      description: "15% del valor de compra de un vehiculo electrico nuevo, con base maxima de 20.000 euros (hasta 3.000 euros de deduccion).",
      maxSaving: 3000,
      actualSaving: saving,
      isActive: applies,
      requirement: "Compra de vehiculo electrico nuevo enchufable (BEV o PHEV con +40km autonomia) entre 2023 y 2025",
      tip: "Incluye el pago de la senal/reserva si se formalizo la compra antes de fin de ano. Tambien aplica a motos electricas.",
      scope: "estatal",
      article: "Disp. Adic. 58a LIRPF",
    });
  }

  // 18. PUNTO DE RECARGA EV / PANELES SOLARES
  {
    const applies = p.installedSolarPanels && p.solarInvestment > 0;
    const base = applies ? Math.min(p.solarInvestment, 5000) : 0;
    const saving = base * 0.15;
    deductions.push({
      id: "punto-recarga",
      category: "Transicion verde",
      name: "Instalacion de punto de recarga / energia renovable",
      description: "15% de la inversion en punto de recarga para vehiculo electrico en vivienda (max 5.000 euros base = 750 euros deduccion).",
      maxSaving: 750,
      actualSaving: saving,
      isActive: applies,
      requirement: "Instalar punto de recarga para VE en garaje/vivienda entre 2023-2025",
      tip: "Si instalaste placas solares o un punto de recarga en tu garaje, revisa si la factura incluye el desglose de mano de obra e instalacion, que tambien cuentan.",
      scope: "estatal",
      article: "Disp. Adic. 58a LIRPF",
    });
  }

  // 19. REHABILITACION ENERGETICA
  {
    const applies = p.didEnergyRehab && p.rehabInvestment > 0;
    const base = applies ? Math.min(p.rehabInvestment, 15000) : 0;
    const saving = base * 0.40;
    deductions.push({
      id: "rehab-energetica",
      category: "Transicion verde",
      name: "Obras de mejora de eficiencia energetica",
      description: "20-60% de las obras que reduzcan la demanda energetica de tu vivienda, segun el tipo de mejora y la reduccion conseguida.",
      maxSaving: 15000 * 0.40,
      actualSaving: saving,
      isActive: applies,
      requirement: "Obras en vivienda que reduzcan demanda de calefaccion/refrigeracion al menos un 7% (certificado energetico antes/despues)",
      tip: "Ventanas, aislamiento, calderas eficientes... Si reduces un 30%+ la demanda energetica, la deduccion sube al 40%. Necesitas dos certificados energeticos (antes y despues).",
      scope: "estatal",
      article: "Disp. Adic. 50a LIRPF",
    });
  }

  // 20. TRIBUTACION CONJUNTA
  {
    const applies = p.jointFiling;
    const saving = applies ? 3400 * rate : 0;
    const familySaving = p.hasChildren && p.isSingleParent ? 2150 * rate : 0;
    deductions.push({
      id: "conjunta",
      category: "Personal",
      name: "Tributacion conjunta (reduccion)",
      description: "Matrimonios: reduccion de 3.400 euros en base. Familias monoparentales: reduccion de 2.150 euros. Conveniente cuando un conyuge gana poco o nada.",
      maxSaving: 3400 * rate,
      actualSaving: saving || familySaving,
      isActive: applies || (p.isSingleParent && p.hasChildren),
      requirement: "Estar casado (conjunta matrimonial) o ser monoparental (conjunta con hijos)",
      tip: "Si tu conyuge gana menos de 3.400 euros/ano, la conjunta siempre compensa. Si gana mas de 12.000 euros, casi siempre conviene la individual. Haz numeros con ambas opciones.",
      scope: "estatal",
      article: "Art. 82-84 LIRPF",
    });
  }

  // 21. CEUTA Y MELILLA / ZONA RURAL
  {
    const applies = p.livesInRuralArea;
    const saving = applies ? p.income * 0.05 * rate : 0;
    deductions.push({
      id: "zona-rural",
      category: "Territorial",
      name: "Deducciones por residencia en zonas despobladas",
      description: "Varias CCAA ofrecen deducciones de 500-1.500 euros por vivir en municipios con menos de 2.000-5.000 habitantes.",
      maxSaving: 1500,
      actualSaving: Math.min(saving, 1500),
      isActive: applies,
      requirement: "Residir en un municipio de baja poblacion segun la normativa de tu CCAA",
      tip: "Aragon, Castilla y Leon, Castilla-La Mancha, Galicia y Extremadura tienen deducciones especificas. Si te mudaste a un pueblo, puede suponer 500-1.500 euros de ahorro.",
      scope: "autonomica",
      article: "Normativa autonomica IRPF",
    });
  }

  // 22. NUEVOS RESIDENTES / IMPATRIADOS
  {
    const applies = p.isNewResident;
    deductions.push({
      id: "impatriados",
      category: "Territorial",
      name: "Regimen de impatriados (Ley Beckham)",
      description: "Tipo fijo del 24% para nuevos residentes fiscales en Espana durante 6 ejercicios. Solo tributan rentas de fuente espanola.",
      maxSaving: p.income > 60000 ? (p.income * 0.45 - p.income * 0.24) : 0,
      actualSaving: applies && p.income > 60000 ? (p.income * 0.45 - p.income * 0.24) * 0.5 : 0,
      isActive: applies,
      requirement: "No haber sido residente fiscal en Espana en los 5 anos anteriores",
      tip: "Si vienes del extranjero a trabajar en Espana, puedes solicitar el regimen de impatriados y tributar al 24% plano hasta 600.000 euros. Consultalo antes de presentar tu primera declaracion.",
      scope: "estatal",
      article: "Art. 93 LIRPF",
    });
  }

  return deductions;
}

// ── Formato helpers ────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Categorias con iconos ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Familia: "#2563eb",
  Personal: "#7c3aed",
  "Ahorro y prevision": "#059669",
  Vivienda: "#d97706",
  Trabajo: "#dc2626",
  Inversiones: "#0891b2",
  "Transicion verde": "#16a34a",
  Territorial: "#9333ea",
};

// ── Components ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", cursor: "pointer", fontSize: "0.95rem" }}>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? "var(--azul, #2563eb)" : "var(--border, #ccc)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: "50%",
          background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.2s",
        }} />
      </span>
      <span style={{ color: "var(--ink)" }}>{label}</span>
    </label>
  );
}

function NumberInput({ value, onChange, label, suffix, min, max, step }: {
  value: number; onChange: (v: number) => void; label: string; suffix?: string;
  min?: number; max?: number; step?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.9rem" }}>
      <span style={{ color: "var(--ink-muted, #666)" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          value={value || ""}
          onChange={e => onChange(Number(e.target.value) || 0)}
          min={min ?? 0}
          max={max}
          step={step ?? 1}
          style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--ink)", width: 130, fontSize: "0.95rem",
          }}
        />
        {suffix && <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>{suffix}</span>}
      </div>
    </label>
  );
}

function DeductionCard({ d }: { d: Deduction }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[d.category] ?? "var(--ink)";

  return (
    <div style={{
      background: "var(--bg)", borderRadius: 12,
      border: `1px solid ${d.isActive ? color + "40" : "var(--border)"}`,
      padding: "var(--space-md)",
      opacity: d.isActive ? 1 : 0.7,
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-sm)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              display: "inline-block", padding: "2px 8px", borderRadius: 6,
              background: color + "18", color, fontSize: "0.75rem", fontWeight: 600,
            }}>{d.category}</span>
            <span style={{
              fontSize: "0.7rem", color: "var(--ink-muted)",
              padding: "1px 6px", borderRadius: 4,
              background: d.scope === "estatal" ? "rgba(37,99,235,0.08)" : d.scope === "autonomica" ? "rgba(147,51,234,0.08)" : "rgba(5,150,105,0.08)",
            }}>
              {d.scope === "estatal" ? "Estatal" : d.scope === "autonomica" ? "Autonomica" : "Ambas"}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>{d.name}</h3>
          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: 1.5 }}>{d.description}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, minWidth: 90 }}>
          {d.isActive ? (
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#059669" }}>+{fmt(d.actualSaving)} &euro;</div>
              <div style={{ fontSize: "0.75rem", color: "#059669" }}>ahorro estimado</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#dc2626" }}>hasta {fmt(d.maxSaving)} &euro;</div>
              <div style={{ fontSize: "0.75rem", color: "#dc2626" }}>podrias ahorrar</div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "none", padding: "6px 0 0", cursor: "pointer",
          color: color, fontSize: "0.85rem", fontWeight: 500,
        }}
      >
        {expanded ? "Ocultar detalles" : "Ver detalles y consejo"}  {expanded ? "\u25B2" : "\u25BC"}
      </button>

      {expanded && (
        <div style={{ marginTop: 8, padding: "12px", background: color + "08", borderRadius: 8, fontSize: "0.88rem" }}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "var(--ink)" }}>Requisitos:</strong>
            <span style={{ color: "var(--ink-muted)", marginLeft: 4 }}>{d.requirement}</span>
          </div>
          <div style={{
            padding: "10px 12px", background: "#fef3c7", borderRadius: 8,
            borderLeft: `3px solid #d97706`, color: "#92400e", lineHeight: 1.5,
          }}>
            <strong>Consejo:</strong> {d.tip}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.8rem", color: "var(--ink-muted)" }}>
            Ref.: {d.article}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function BorradorCheckPage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const deductions = useMemo(() => calculateDeductions(profile), [profile]);
  const analysis = useMemo(() => {
    if (!submitted) return null;
    const active = deductions.filter(d => d.isActive);
    const inactive = deductions.filter(d => !d.isActive);
    const totalSaving = active.reduce((s, d) => s + d.actualSaving, 0);
    const potentialExtra = inactive.reduce((s, d) => s + d.maxSaving, 0);
    return { active, inactive, totalSaving, potentialExtra };
  }, [deductions, submitted]);

  const sectionStyle: React.CSSProperties = {
    padding: "var(--space-lg)", background: "var(--bg)",
    borderRadius: 16, border: "1px solid var(--border)",
    marginBottom: "var(--space-md)",
  };

  return (
    <main className="page-shell detail-page">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <SiteHeader currentSection="borrador-check" />

      <section className="detail-hero" style={{ textAlign: "center", padding: "var(--space-xl) var(--space-md)" }}>
        <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--azul, #2563eb)" }}>
          Herramienta fiscal
        </span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "var(--space-sm) 0", color: "var(--ink)" }}>
          Verificador del Borrador
        </h1>
        <p style={{ maxWidth: 650, margin: "0 auto", color: "var(--ink-muted)", lineHeight: 1.7, fontSize: "1.1rem" }}>
          Descubre cuantas deducciones y opciones fiscales no estan activadas en tu borrador de Hacienda.
          Responde unas preguntas sobre tu situacion y te mostramos cuanto podrias ahorrar.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 var(--space-md) var(--space-xl)" }}>

        {/* DATOS BASICOS */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            1. Datos basicos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
            <NumberInput label="Ingresos brutos anuales" value={profile.income} onChange={v => update("income", v)} suffix="euros" />
            <NumberInput label="Tu edad" value={profile.age} onChange={v => update("age", v)} min={16} max={100} />
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.9rem" }}>
              <span style={{ color: "var(--ink-muted)" }}>Comunidad autonoma</span>
              <select
                value={profile.ccaa}
                onChange={e => update("ccaa", e.target.value)}
                style={{
                  padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--bg)", color: "var(--ink)", fontSize: "0.95rem",
                }}
              >
                {CCAA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* SITUACION FAMILIAR */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            2. Situacion familiar
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.hasChildren} onChange={v => update("hasChildren", v)} label="Tengo hijos" />
            {profile.hasChildren && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-sm)", paddingLeft: 20 }}>
                <NumberInput label="Numero de hijos" value={profile.numChildren} onChange={v => update("numChildren", v)} min={0} max={15} />
                <NumberInput label="Hijos menores de 3 anos" value={profile.childrenUnder3} onChange={v => update("childrenUnder3", v)} min={0} max={profile.numChildren} />
                <Toggle checked={profile.childrenInGuarderia} onChange={v => update("childrenInGuarderia", v)} label="Algun hijo en guarderia" />
                <Toggle checked={profile.hasMaternityBenefit} onChange={v => update("hasMaternityBenefit", v)} label="Madre trabajadora (alta SS)" />
              </div>
            )}
            <Toggle checked={profile.isSingleParent} onChange={v => update("isSingleParent", v)} label="Soy familia monoparental" />
            <Toggle checked={profile.isFamiliaNumero} onChange={v => update("isFamiliaNumero", v)} label="Tengo titulo de familia numerosa" />
            <Toggle checked={profile.caresForElderly} onChange={v => update("caresForElderly", v)} label="Tengo ascendientes a cargo (+65 anos)" />
            {profile.caresForElderly && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Numero de ascendientes" value={profile.elderlyDependents} onChange={v => update("elderlyDependents", v)} min={0} max={10} />
              </div>
            )}
            <Toggle checked={profile.jointFiling} onChange={v => update("jointFiling", v)} label="Quiero/puedo tributar en conjunta" />
            {profile.jointFiling && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Ingresos del conyuge" value={profile.spouseIncome} onChange={v => update("spouseIncome", v)} suffix="euros" />
              </div>
            )}
          </div>
        </div>

        {/* DISCAPACIDAD */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            3. Discapacidad
          </h2>
          <Toggle checked={profile.hasDisability} onChange={v => update("hasDisability", v)} label="Tengo un grado de discapacidad reconocido" />
          {profile.hasDisability && (
            <div style={{ paddingLeft: 20, marginTop: "var(--space-sm)" }}>
              <NumberInput label="Grado de discapacidad" value={profile.disabilityPercent} onChange={v => update("disabilityPercent", v)} suffix="%" min={0} max={100} />
            </div>
          )}
        </div>

        {/* VIVIENDA */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            4. Vivienda
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.hasMortgagePre2013} onChange={v => update("hasMortgagePre2013", v)} label="Hipoteca de vivienda habitual (firmada antes de 2013)" />
            {profile.hasMortgagePre2013 && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Cuotas anuales pagadas (capital + intereses)" value={profile.mortgageAnnualPayment} onChange={v => update("mortgageAnnualPayment", v)} suffix="euros" />
              </div>
            )}
            <Toggle checked={profile.paysRent} onChange={v => update("paysRent", v)} label="Vivo de alquiler" />
            {profile.paysRent && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", paddingLeft: 20 }}>
                <NumberInput label="Alquiler anual pagado" value={profile.rentAnnualAmount} onChange={v => update("rentAnnualAmount", v)} suffix="euros" />
                <Toggle checked={profile.rentContractPre2015} onChange={v => update("rentContractPre2015", v)} label="Mi contrato es anterior a 2015" />
              </div>
            )}
          </div>
        </div>

        {/* TRABAJO */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            5. Trabajo y actividad
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.isAutonomo} onChange={v => update("isAutonomo", v)} label="Soy autonomo / freelance" />
            {profile.isAutonomo && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", paddingLeft: 20 }}>
                <Toggle checked={profile.worksFromHome} onChange={v => update("worksFromHome", v)} label="Trabajo desde casa" />
                {profile.worksFromHome && (
                  <NumberInput label="% de vivienda dedicada" value={profile.homeOfficePercent} onChange={v => update("homeOfficePercent", v)} suffix="%" min={5} max={50} />
                )}
              </div>
            )}
            <Toggle checked={profile.hasUnionFees} onChange={v => update("hasUnionFees", v)} label="Pago cuotas sindicales" />
            {profile.hasUnionFees && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Cuota anual" value={profile.unionFeeAmount} onChange={v => update("unionFeeAmount", v)} suffix="euros" />
              </div>
            )}
            <Toggle checked={profile.hasLegalDefenseCosts} onChange={v => update("hasLegalDefenseCosts", v)} label="He tenido gastos de defensa juridica laboral" />
            {profile.hasLegalDefenseCosts && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Importe gastos abogado" value={profile.legalDefenseAmount} onChange={v => update("legalDefenseAmount", v)} suffix="euros" />
              </div>
            )}
          </div>
        </div>

        {/* AHORRO E INVERSIONES */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            6. Ahorro, inversiones y donativos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.hasPensionPlan} onChange={v => update("hasPensionPlan", v)} label="Tengo plan de pensiones" />
            {profile.hasPensionPlan && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Aportacion anual" value={profile.pensionContribution} onChange={v => update("pensionContribution", v)} suffix="euros" />
              </div>
            )}
            <Toggle checked={profile.makesDonations} onChange={v => update("makesDonations", v)} label="He hecho donativos a ONGs/fundaciones" />
            {profile.makesDonations && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", paddingLeft: 20 }}>
                <NumberInput label="Importe total donado" value={profile.donationAmount} onChange={v => update("donationAmount", v)} suffix="euros" />
                <Toggle checked={profile.donationRecurring} onChange={v => update("donationRecurring", v)} label="Dono a la misma entidad 2+ anos" />
              </div>
            )}
            <Toggle checked={profile.investedInStartup} onChange={v => update("investedInStartup", v)} label="He invertido en una startup / empresa nueva" />
            {profile.investedInStartup && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Importe invertido" value={profile.startupInvestment} onChange={v => update("startupInvestment", v)} suffix="euros" />
              </div>
            )}
          </div>
        </div>

        {/* TRANSICION VERDE */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            7. Transicion verde
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.boughtElectricVehicle} onChange={v => update("boughtElectricVehicle", v)} label="He comprado un vehiculo electrico" />
            {profile.boughtElectricVehicle && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Precio de compra" value={profile.evPurchaseAmount} onChange={v => update("evPurchaseAmount", v)} suffix="euros" />
              </div>
            )}
            <Toggle checked={profile.installedSolarPanels} onChange={v => update("installedSolarPanels", v)} label="He instalado punto de recarga VE / placas solares" />
            {profile.installedSolarPanels && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Inversion en instalacion" value={profile.solarInvestment} onChange={v => update("solarInvestment", v)} suffix="euros" />
              </div>
            )}
            <Toggle checked={profile.didEnergyRehab} onChange={v => update("didEnergyRehab", v)} label="He hecho obras de eficiencia energetica" />
            {profile.didEnergyRehab && (
              <div style={{ paddingLeft: 20 }}>
                <NumberInput label="Inversion en obras" value={profile.rehabInvestment} onChange={v => update("rehabInvestment", v)} suffix="euros" />
              </div>
            )}
          </div>
        </div>

        {/* OTROS */}
        <div style={sectionStyle}>
          <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "1.2rem", color: "var(--ink)" }}>
            8. Otros
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Toggle checked={profile.livesInRuralArea} onChange={v => update("livesInRuralArea", v)} label="Vivo en una zona rural / despoblada" />
            <Toggle checked={profile.isNewResident} onChange={v => update("isNewResident", v)} label="Soy nuevo residente fiscal en Espana (desde extranjero)" />
          </div>
        </div>

        {/* BOTON ANALIZAR */}
        <button
          onClick={() => setSubmitted(true)}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: 12,
            background: "var(--azul, #2563eb)", color: "white",
            fontSize: "1.1rem", fontWeight: 600, border: "none",
            cursor: "pointer", transition: "transform 0.1s, box-shadow 0.2s",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          Analizar mi borrador
        </button>

        {/* RESULTADOS */}
        {submitted && analysis && (
          <div style={{ marginTop: "var(--space-xl)", animation: "fadeIn 0.5s ease" }}>

            {/* RESUMEN KPIs */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-md)", marginBottom: "var(--space-lg)",
            }}>
              <div style={{
                padding: "var(--space-lg)", borderRadius: 16, textAlign: "center",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", color: "white",
              }}>
                <div style={{ fontSize: "2.4rem", fontWeight: 800 }}>{fmt(analysis.totalSaving)} &euro;</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Ahorro con deducciones activas</div>
              </div>
              <div style={{
                padding: "var(--space-lg)", borderRadius: 16, textAlign: "center",
                background: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)", color: "white",
              }}>
                <div style={{ fontSize: "2.4rem", fontWeight: 800 }}>{fmt(analysis.potentialExtra)} &euro;</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Ahorro potencial NO activado</div>
              </div>
              <div style={{
                padding: "var(--space-lg)", borderRadius: 16, textAlign: "center",
                background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)", color: "white",
              }}>
                <div style={{ fontSize: "2.4rem", fontWeight: 800 }}>{analysis.active.length}/{deductions.length}</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Deducciones activadas</div>
              </div>
            </div>

            {/* GRAFICOS */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-md)", marginBottom: "var(--space-lg)",
            }}>
              {/* Donut: Active vs Inactive */}
              <div style={{
                padding: "var(--space-md)", background: "var(--bg)", borderRadius: 16,
                border: "1px solid var(--border)", textAlign: "center",
              }}>
                <h3 style={{ fontSize: "0.95rem", margin: "0 0 var(--space-sm)", color: "var(--ink)" }}>Estado de tus deducciones</h3>
                <svg viewBox="0 0 200 200" width="180" height="180" style={{ margin: "0 auto", display: "block" }}>
                  {(() => {
                    const active = analysis.active.length;
                    const inactive = analysis.inactive.length;
                    const total = active + inactive;
                    if (total === 0) return null;
                    const activePct = active / total;
                    const R = 70; const CX = 100; const CY = 100;
                    const endAngle = activePct * 2 * Math.PI - Math.PI / 2;
                    const startAngle = -Math.PI / 2;
                    const x1 = CX + R * Math.cos(startAngle);
                    const y1 = CY + R * Math.sin(startAngle);
                    const x2 = CX + R * Math.cos(endAngle);
                    const y2 = CY + R * Math.sin(endAngle);
                    const largeArc = activePct > 0.5 ? 1 : 0;
                    return (
                      <>
                        <circle cx={CX} cy={CY} r={R} fill="#fee2e2" stroke="none" />
                        {activePct > 0 && activePct < 1 && (
                          <path d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill="#d1fae5" />
                        )}
                        {activePct >= 1 && <circle cx={CX} cy={CY} r={R} fill="#d1fae5" />}
                        <circle cx={CX} cy={CY} r="42" fill="var(--bg)" />
                        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">{active}/{total}</text>
                        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="8" fill="var(--ink-muted)">activas</text>
                      </>
                    );
                  })()}
                </svg>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8, fontSize: "0.8rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#d1fae5", border: "2px solid #059669", display: "inline-block" }} />
                    <span style={{ color: "#059669", fontWeight: 600 }}>Activas ({analysis.active.length})</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fee2e2", border: "2px solid #dc2626", display: "inline-block" }} />
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>Inactivas ({analysis.inactive.length})</span>
                  </span>
                </div>
              </div>

              {/* Bar chart: Savings by category */}
              <div style={{
                padding: "var(--space-md)", background: "var(--bg)", borderRadius: 16,
                border: "1px solid var(--border)",
              }}>
                <h3 style={{ fontSize: "0.95rem", margin: "0 0 var(--space-sm)", color: "var(--ink)" }}>Ahorro potencial por categoria</h3>
                {(() => {
                  const categories: Record<string, { active: number; potential: number; color: string }> = {};
                  for (const d of deductions) {
                    if (!categories[d.category]) categories[d.category] = { active: 0, potential: 0, color: CATEGORY_COLORS[d.category] ?? "#6b7280" };
                    if (d.isActive) categories[d.category].active += d.actualSaving;
                    else categories[d.category].potential += d.maxSaving;
                  }
                  const entries = Object.entries(categories).sort((a, b) => (b[1].active + b[1].potential) - (a[1].active + a[1].potential));
                  const maxVal = Math.max(...entries.map(([, v]) => v.active + v.potential), 1);
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {entries.map(([cat, vals]) => (
                        <div key={cat}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 3 }}>
                            <span style={{ color: vals.color, fontWeight: 600 }}>{cat}</span>
                            <span style={{ color: "var(--ink-muted)" }}>{fmt(vals.active + vals.potential)} euros</span>
                          </div>
                          <div style={{ height: 10, borderRadius: 5, background: "var(--border)", overflow: "hidden", display: "flex" }}>
                            <div style={{
                              height: "100%", background: vals.color,
                              width: `${(vals.active / maxVal) * 100}%`,
                              transition: "width 0.6s ease",
                            }} />
                            <div style={{
                              height: "100%", background: vals.color + "40",
                              width: `${(vals.potential / maxVal) * 100}%`,
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 12, fontSize: "0.7rem", color: "var(--ink-muted)", marginTop: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 12, height: 6, borderRadius: 3, background: "#059669", display: "inline-block" }} /> Ahorro activo
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 12, height: 6, borderRadius: 3, background: "#05966940", display: "inline-block" }} /> Potencial
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* BARRA DE PROGRESO */}
            <div style={{
              padding: "var(--space-md)", background: "var(--bg)", borderRadius: 12,
              border: "1px solid var(--border)", marginBottom: "var(--space-lg)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.9rem" }}>
                <span style={{ color: "var(--ink-muted)" }}>Optimizacion del borrador</span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                  {deductions.length > 0 ? Math.round((analysis.active.length / deductions.length) * 100) : 0}%
                </span>
              </div>
              <div style={{
                height: 12, borderRadius: 6, background: "var(--border)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 6,
                  background: "linear-gradient(90deg, #059669, #10b981)",
                  width: `${deductions.length > 0 ? (analysis.active.length / deductions.length) * 100 : 0}%`,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>

            {/* DEDUCCIONES NO ACTIVADAS */}
            {analysis.inactive.length > 0 && (
              <div style={{ marginBottom: "var(--space-lg)" }}>
                <h2 style={{
                  fontSize: "1.3rem", color: "#dc2626", margin: "0 0 var(--space-md)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: "1.5rem" }}>!</span>
                  Deducciones que NO estas aprovechando ({analysis.inactive.length})
                </h2>
                <p style={{ color: "var(--ink-muted)", marginBottom: "var(--space-md)", fontSize: "0.95rem" }}>
                  Si tu situacion cambiara o ya cumples alguno de estos requisitos y no lo has marcado,
                  podrias ahorrar hasta <strong style={{ color: "#dc2626" }}>{fmt(analysis.potentialExtra)} euros</strong> adicionales.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                  {analysis.inactive
                    .sort((a, b) => b.maxSaving - a.maxSaving)
                    .map(d => <DeductionCard key={d.id} d={d} />)}
                </div>
              </div>
            )}

            {/* DEDUCCIONES ACTIVADAS */}
            {analysis.active.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: "1.3rem", color: "#059669", margin: "0 0 var(--space-md)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: "1.5rem" }}>{"✓"}</span>
                  Deducciones que SI aplicas ({analysis.active.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                  {analysis.active
                    .sort((a, b) => b.actualSaving - a.actualSaving)
                    .map(d => <DeductionCard key={d.id} d={d} />)}
                </div>
              </div>
            )}

            {/* DISCLAIMER */}
            <div style={{
              marginTop: "var(--space-xl)", padding: "var(--space-md)",
              background: "#fef3c7", borderRadius: 12, borderLeft: "4px solid #d97706",
              fontSize: "0.85rem", color: "#92400e", lineHeight: 1.6,
            }}>
              <strong>Aviso importante:</strong> Esta herramienta es orientativa y no sustituye el asesoramiento fiscal profesional.
              Los calculos son aproximados y pueden variar segun tu situacion concreta.
              Consulta siempre con un asesor fiscal o con la propia AEAT para confirmar las deducciones aplicables a tu caso.
              Datos fiscales basados en la normativa IRPF vigente para el ejercicio 2024.
            </div>
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
