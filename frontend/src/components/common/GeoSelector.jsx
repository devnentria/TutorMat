import React from 'react';
import { COUNTRIES, getStates } from '../../data/geoData';

export default function GeoSelector({ country, state, school, onChange, compact = false }) {
  const states = getStates(country);

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "input-field";

  return (
    <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-4"}>
      <div className={compact ? "" : ""}>
        <label className={labelClass}>País</label>
        <select
          value={country || 'México'}
          onChange={e => onChange({ country: e.target.value, state: '', school })}
          className={inputClass}>
          {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Estado / Provincia</label>
        <select
          value={state || ''}
          onChange={e => onChange({ country, state: e.target.value, school })}
          className={inputClass}
          disabled={!country || getStates(country).length === 0}>
          <option value="">Selecciona un estado</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={compact ? "col-span-2" : ""}>
        <label className={labelClass}>Escuela / Institución</label>
        <input
          type="text"
          value={school || ''}
          onChange={e => onChange({ country, state, school: e.target.value })}
          placeholder="Nombre de la institución educativa"
          className={inputClass} />
      </div>
    </div>
  );
}
