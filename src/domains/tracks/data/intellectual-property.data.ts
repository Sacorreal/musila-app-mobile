import copyrightCmoData from './global_copyright_cmo.json';

export interface CopyrightOfficeOption {
  countryCode: string;
  countryName: string;
  flag: string;
  officeName: string;
}

export interface CmoOption {
  acronym: string;
  originalName: string;
  country: string;
  logo: string;
}

const countriesMap = copyrightCmoData.countries as Record<
  string,
  { name: string; flag: string; copyrightOffice: { name: string } }
>;

const cmosMap = copyrightCmoData.cmos as Record<
  string,
  { acronym: string; originalName: string; country: string; logo: string }
>;

export const copyrightOfficeOptions: CopyrightOfficeOption[] = Object.entries(countriesMap)
  .map(([code, data]) => ({
    countryCode: code,
    countryName: data.name,
    flag: data.flag,
    officeName: data.copyrightOffice.name,
  }))
  .sort((a, b) => a.countryName.localeCompare(b.countryName, 'es'));

export const cmoOptions: CmoOption[] = Object.values(cmosMap)
  .map((cmo) => ({
    acronym: cmo.acronym,
    originalName: cmo.originalName,
    country: cmo.country,
    logo: cmo.logo,
  }))
  .sort((a, b) => a.acronym.localeCompare(b.acronym));
