export interface WfsLayerConfig {
  url: string;
  typeName: string;
  label: string;
  /** Property names to show as table columns (in order) */
  columns: { field: string; label: string }[];
  /** If set, this layer accepts a --year option to select a variant */
  variants?: Record<string, { typeName: string; label: string }>;
}

export const WFS_LAYERS: Record<string, WfsLayerConfig> = {
  haltes: {
    url: 'https://geo.api.vlaanderen.be/Haltes/wfs',
    typeName: 'Haltes:Halte',
    label: 'De Lijn stops (bus/tram/belbus)',
    columns: [
      { field: 'STOPID', label: 'Stop ID' },
      { field: 'NAAMHALTE', label: 'Name' },
      { field: 'LBLTYPEHAL', label: 'Type' },
      { field: 'NAAMGEM', label: 'Municipality' },
    ],
  },
  bos: {
    url: 'https://geo.api.vlaanderen.be/Bosref/wfs',
    typeName: 'Bosref:Bos',
    label: 'Forest areas (Bosreferentielaag 2000)',
    columns: [
      { field: 'OIDN', label: 'ID' },
      { field: 'BMS', label: 'Tree species' },
      { field: 'ONT', label: 'Development' },
      { field: 'SLG', label: 'Canopy' },
      { field: 'KLASSE', label: 'Class' },
    ],
  },
  jacht: {
    url: 'https://geo.api.vlaanderen.be/Jacht/wfs',
    typeName: 'Jacht:Jachtterr',
    label: 'Hunting grounds (Jachtterreinen)',
    columns: [
      { field: 'VELDID', label: 'Field ID' },
      { field: 'WBENAAM', label: 'WBE name' },
      { field: 'PROV', label: 'Province' },
      { field: 'DATGOEDK', label: 'Approved' },
    ],
  },
  landbouw: {
    url: 'https://geo.api.vlaanderen.be/Landbgebrperc/wfs',
    typeName: 'Landbgebrperc:Lbgebrperc',
    label: 'Agricultural parcels (Landbouwgebruikspercelen)',
    columns: [
      { field: 'OIDN', label: 'ID' },
      { field: 'LBLHFDTLT', label: 'Crop' },
      { field: 'GEWASGROEP', label: 'Crop group' },
    ],
  },
  landgebruik: {
    url: 'https://geo.api.vlaanderen.be/HistLandgebruik/wfs',
    typeName: 'HistLandgebruik:Lgbrk1778',
    label: 'Historical land use',
    columns: [
      { field: 'OIDN', label: 'ID' },
      { field: 'KLASSE', label: 'Land use' },
      { field: 'VERSDATUM', label: 'Version date' },
    ],
    variants: {
      '1778': { typeName: 'HistLandgebruik:Lgbrk1778', label: 'Historical land use — Ferraris 1778' },
      '1873': { typeName: 'HistLandgebruik:Lgbrk1873', label: 'Historical land use — Topokaart 1873' },
      '1969': { typeName: 'HistLandgebruik:Lgbrk1969', label: 'Historical land use — Topokaart 1969' },
    },
  },
};

export const VALID_LAYER_NAMES = Object.keys(WFS_LAYERS);
