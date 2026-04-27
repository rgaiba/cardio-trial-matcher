import { useState } from 'react';
import { buildShareUrl } from '../engine/serialize.js';

// Initial empty patient state. `undefined` means "user hasn't provided" → the
// engine treats those criteria as `unknown` rather than auto-failing them.
export const EMPTY_PATIENT = {
  age: undefined,
  sex: 'unknown',
  nyhaClass: undefined,
  lvef: undefined,
  ntProBnp: undefined,
  bnp: undefined,
  egfr: undefined,
  potassium: undefined,
  sodium: undefined,
  hemoglobin: undefined,
  creatinine: undefined,
  sbp: undefined,
  hr: undefined,
  qrs: undefined,
  rhythm: 'unknown',
  comorbidities: {
    diabetes: 'unknown',
    afib: undefined,
    htn: undefined,
    priorMI: undefined,
    copd: undefined,
    angioedema: undefined,
    severeValveDisease: undefined,
    cadAmenableToCabg: undefined,
    leftMainGte50: undefined,
    ccsAnginaClass3plus: undefined,
    // AF-specific
    priorStrokeOrTIA: undefined,
    vascularDisease: undefined,
    mitralStenosis: undefined,
    mechanicalValve: undefined,
  },
  // AF-specific top-level fields
  afibType: 'unknown',           // paroxysmal | persistent | permanent | unknown
  afibSymptomatic: undefined,
  priorAblation: undefined,
  priorAADFailure: undefined,
  recent: {
    miWithinMonths: undefined,
    hfHospWithinMonths: undefined,
    cabgPciWithinMonths: undefined,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: undefined,
    arni: undefined,
    betaBlocker: undefined,
    mra: undefined,
    sglt2i: undefined,
    loopDiuretic: undefined,
    ivabradine: undefined,
    digoxin: undefined,
  },
};

const SAMPLE_PATIENT = {
  ...EMPTY_PATIENT,
  age: 64,
  sex: 'M',
  nyhaClass: 3,
  lvef: 28,
  ntProBnp: 1850,
  egfr: 52,
  potassium: 4.4,
  sodium: 138,
  hemoglobin: 12.8,
  creatinine: 1.3,
  sbp: 118,
  hr: 78,
  qrs: 138,
  rhythm: 'sinus',
  comorbidities: {
    ...EMPTY_PATIENT.comorbidities,
    diabetes: 'type2',
    afib: false,
    htn: true,
    priorMI: true,
    copd: false,
    angioedema: false,
    severeValveDisease: false,
    cadAmenableToCabg: true,
    leftMainGte50: false,
    ccsAnginaClass3plus: false,
  },
  recent: {
    miWithinMonths: 18,
    hfHospWithinMonths: 4,
    cabgPciWithinMonths: 18,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: true,
    arni: false,
    betaBlocker: true,
    mra: false,
    sglt2i: false,
    loopDiuretic: true,
    ivabradine: false,
    digoxin: false,
  },
};

function NumberInput({ label, value, onChange, unit, hint, min, max, step }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint && <span className="field-hint"> ({hint})</span>}
      </span>
      <span className="field-input-wrap">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          min={min}
          max={max}
          step={step ?? 'any'}
          placeholder=""
        />
        {unit && <span className="field-unit">{unit}</span>}
      </span>
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value ?? 'unknown'} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TriToggle({ label, value, onChange }) {
  // value: true | false | undefined
  return (
    <div className="tri">
      <span className="tri-label">{label}</span>
      <div className="tri-buttons" role="group">
        <button
          type="button"
          className={value === true ? 'tri-btn tri-yes active' : 'tri-btn'}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={value === false ? 'tri-btn tri-no active' : 'tri-btn'}
          onClick={() => onChange(false)}
        >
          No
        </button>
        <button
          type="button"
          className={value === undefined ? 'tri-btn tri-unknown active' : 'tri-btn'}
          onClick={() => onChange(undefined)}
        >
          ?
        </button>
      </div>
    </div>
  );
}

export default function PatientForm({ patient, onChange }) {
  const [activeTab, setActiveTab] = useState('core');
  const [shareState, setShareState] = useState('idle'); // 'idle' | 'copied' | 'failed'

  const handleShare = async () => {
    const url = buildShareUrl(patient);
    try {
      await navigator.clipboard.writeText(url);
      setShareState('copied');
    } catch {
      // Clipboard API can fail on http or insecure contexts; fallback to prompt
      window.prompt('Copy this link to share the patient case:', url);
      setShareState('copied');
    }
    setTimeout(() => setShareState('idle'), 2000);
  };

  const update = (path, value) => {
    onChange((prev) => {
      const keys = path.split('.');
      const next = { ...prev };
      let target = next;
      for (let i = 0; i < keys.length - 1; i++) {
        target[keys[i]] = { ...target[keys[i]] };
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const tabs = [
    { id: 'core', label: 'Core' },
    { id: 'comorb', label: 'Comorbidities' },
    { id: 'meds', label: 'Medications' },
    { id: 'labs', label: 'Labs' },
    { id: 'afib', label: 'AF' },
  ];

  return (
    <div className="form-card">
      <div className="form-header">
        <div>
          <h2>Patient profile</h2>
          <p className="muted">No PHI; clinical variables only. Leave any field blank if unknown.</p>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className={`btn-primary ${shareState === 'copied' ? 'btn-success' : ''}`}
            onClick={handleShare}
            title="Copy a shareable link to this patient case"
          >
            {shareState === 'copied' ? '✓ Copied' : 'Share'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => onChange(SAMPLE_PATIENT)}>
            Sample
          </button>
          <button type="button" className="btn-secondary" onClick={() => onChange(EMPTY_PATIENT)}>
            Reset
          </button>
        </div>
      </div>

      <nav className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === 'core' && (
        <div className="form-grid">
          <NumberInput label="Age" unit="yrs" min={0} max={120} value={patient.age} onChange={(v) => update('age', v)} />
          <SelectInput
            label="Sex"
            value={patient.sex}
            onChange={(v) => update('sex', v)}
            options={[
              { value: 'unknown', label: 'Not specified' },
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' },
            ]}
          />
          <SelectInput
            label="NYHA class"
            value={patient.nyhaClass ?? ''}
            onChange={(v) => update('nyhaClass', v === '' ? undefined : Number(v))}
            options={[
              { value: '', label: 'Not specified' },
              { value: 1, label: 'I' },
              { value: 2, label: 'II' },
              { value: 3, label: 'III' },
              { value: 4, label: 'IV' },
            ]}
          />
          <NumberInput label="LVEF" unit="%" min={5} max={75} value={patient.lvef} onChange={(v) => update('lvef', v)} />
          <NumberInput label="NT-proBNP" unit="pg/mL" min={0} value={patient.ntProBnp} onChange={(v) => update('ntProBnp', v)} />
          <NumberInput label="BNP" unit="pg/mL" min={0} hint="if NT-proBNP not available" value={patient.bnp} onChange={(v) => update('bnp', v)} />
          <NumberInput label="eGFR" unit="mL/min/1.73m²" min={5} max={150} value={patient.egfr} onChange={(v) => update('egfr', v)} />
          <NumberInput label="SBP" unit="mmHg" min={50} max={250} value={patient.sbp} onChange={(v) => update('sbp', v)} />
          <NumberInput label="HF hosp within last…" unit="months" min={0} max={120} hint="leave blank if none" value={patient.recent.hfHospWithinMonths} onChange={(v) => update('recent.hfHospWithinMonths', v)} />
        </div>
      )}

      {activeTab === 'comorb' && (
        <div className="form-grid form-grid-tri">
          <SelectInput
            label="Diabetes"
            value={patient.comorbidities.diabetes}
            onChange={(v) => update('comorbidities.diabetes', v)}
            options={[
              { value: 'unknown', label: 'Not specified' },
              { value: 'none', label: 'None' },
              { value: 'type1', label: 'Type 1' },
              { value: 'type2', label: 'Type 2' },
            ]}
          />
          <TriToggle label="Atrial fibrillation/flutter" value={patient.comorbidities.afib} onChange={(v) => update('comorbidities.afib', v)} />
          <TriToggle label="Hypertension" value={patient.comorbidities.htn} onChange={(v) => update('comorbidities.htn', v)} />
          <TriToggle label="Prior MI (any time)" value={patient.comorbidities.priorMI} onChange={(v) => update('comorbidities.priorMI', v)} />
          <TriToggle label="COPD" value={patient.comorbidities.copd} onChange={(v) => update('comorbidities.copd', v)} />
          <TriToggle label="History of angioedema" value={patient.comorbidities.angioedema} onChange={(v) => update('comorbidities.angioedema', v)} />
          <TriToggle label="Severe valvular disease" value={patient.comorbidities.severeValveDisease} onChange={(v) => update('comorbidities.severeValveDisease', v)} />
          <TriToggle label="CAD amenable to CABG" value={patient.comorbidities.cadAmenableToCabg} onChange={(v) => update('comorbidities.cadAmenableToCabg', v)} />
          <TriToggle label="Left main ≥50% stenosis" value={patient.comorbidities.leftMainGte50} onChange={(v) => update('comorbidities.leftMainGte50', v)} />
          <TriToggle label="CCS angina class III+" value={patient.comorbidities.ccsAnginaClass3plus} onChange={(v) => update('comorbidities.ccsAnginaClass3plus', v)} />
          <NumberInput label="MI within last…" unit="months" min={0} hint="leave blank if no MI / unknown" value={patient.recent.miWithinMonths} onChange={(v) => update('recent.miWithinMonths', v)} />
          <NumberInput label="CABG/PCI within last…" unit="months" min={0} hint="leave blank if none" value={patient.recent.cabgPciWithinMonths} onChange={(v) => update('recent.cabgPciWithinMonths', v)} />
          <NumberInput label="Stroke/TIA within last…" unit="months" min={0} hint="leave blank if none" value={patient.recent.strokeWithinMonths} onChange={(v) => update('recent.strokeWithinMonths', v)} />
        </div>
      )}

      {activeTab === 'meds' && (
        <div className="form-grid form-grid-tri">
          <TriToggle label="ACEi or ARB" value={patient.meds.aceArb} onChange={(v) => update('meds.aceArb', v)} />
          <TriToggle label="ARNI (sacubitril/valsartan)" value={patient.meds.arni} onChange={(v) => update('meds.arni', v)} />
          <TriToggle label="Beta-blocker" value={patient.meds.betaBlocker} onChange={(v) => update('meds.betaBlocker', v)} />
          <TriToggle label="MRA (spirono/eplerenone)" value={patient.meds.mra} onChange={(v) => update('meds.mra', v)} />
          <TriToggle label="SGLT2 inhibitor" value={patient.meds.sglt2i} onChange={(v) => update('meds.sglt2i', v)} />
          <TriToggle label="Loop diuretic" value={patient.meds.loopDiuretic} onChange={(v) => update('meds.loopDiuretic', v)} />
          <TriToggle label="Ivabradine" value={patient.meds.ivabradine} onChange={(v) => update('meds.ivabradine', v)} />
          <TriToggle label="Digoxin" value={patient.meds.digoxin} onChange={(v) => update('meds.digoxin', v)} />
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="form-grid">
          <NumberInput label="Potassium" unit="mmol/L" min={2} max={8} step={0.1} value={patient.potassium} onChange={(v) => update('potassium', v)} />
          <NumberInput label="Sodium" unit="mmol/L" min={110} max={160} value={patient.sodium} onChange={(v) => update('sodium', v)} />
          <NumberInput label="Creatinine" unit="mg/dL" min={0.2} max={15} step={0.1} value={patient.creatinine} onChange={(v) => update('creatinine', v)} />
          <NumberInput label="Hemoglobin" unit="g/dL" min={3} max={20} step={0.1} value={patient.hemoglobin} onChange={(v) => update('hemoglobin', v)} />
          <NumberInput label="Heart rate" unit="bpm" min={30} max={220} value={patient.hr} onChange={(v) => update('hr', v)} />
          <NumberInput label="QRS duration" unit="ms" min={60} max={250} value={patient.qrs} onChange={(v) => update('qrs', v)} />
          <SelectInput
            label="Rhythm"
            value={patient.rhythm}
            onChange={(v) => update('rhythm', v)}
            options={[
              { value: 'unknown', label: 'Not specified' },
              { value: 'sinus', label: 'Sinus' },
              { value: 'afib', label: 'AFib / flutter' },
              { value: 'paced', label: 'Paced' },
            ]}
          />
        </div>
      )}

      {activeTab === 'afib' && (
        <div className="form-grid form-grid-tri">
          <SelectInput
            label="AF type"
            value={patient.afibType}
            onChange={(v) => update('afibType', v)}
            options={[
              { value: 'unknown', label: 'Not specified' },
              { value: 'paroxysmal', label: 'Paroxysmal' },
              { value: 'persistent', label: 'Persistent' },
              { value: 'permanent', label: 'Permanent' },
            ]}
          />
          <TriToggle label="Symptomatic AF" value={patient.afibSymptomatic} onChange={(v) => update('afibSymptomatic', v)} />
          <TriToggle label="Prior catheter ablation" value={patient.priorAblation} onChange={(v) => update('priorAblation', v)} />
          <TriToggle label="Failed ≥1 antiarrhythmic drug" value={patient.priorAADFailure} onChange={(v) => update('priorAADFailure', v)} />
          <TriToggle label="Prior stroke or TIA (any time)" value={patient.comorbidities.priorStrokeOrTIA} onChange={(v) => update('comorbidities.priorStrokeOrTIA', v)} />
          <TriToggle label="Vascular disease (PAD or prior MI)" value={patient.comorbidities.vascularDisease} onChange={(v) => update('comorbidities.vascularDisease', v)} />
          <TriToggle label="Moderate–severe mitral stenosis" value={patient.comorbidities.mitralStenosis} onChange={(v) => update('comorbidities.mitralStenosis', v)} />
          <TriToggle label="Mechanical heart valve" value={patient.comorbidities.mechanicalValve} onChange={(v) => update('comorbidities.mechanicalValve', v)} />
        </div>
      )}
    </div>
  );
}
