import { parseJSONIfCould } from '@asuna-admin/helpers';
import { CascaderOptionType } from 'antd/es/cascader';
import * as _ from 'lodash';

const areas = require('china-division/dist/areas.json');
const cities = require('china-division/dist/cities.json');
const provinces = require('china-division/dist/provinces.json');

type CityType = typeof cities[0] & { children?: Array<CascaderOptionType> };
type AreaType = typeof areas[0] & { children?: Array<CascaderOptionType> };
type ProvinceType = typeof provinces[0] & { children?: Array<CascaderOptionType> };

areas.forEach((area: AreaType) => {
  const matchCity: CascaderOptionType = cities.filter((city) => city.code === area.cityCode)[0];
  if (matchCity) {
    matchCity.children = matchCity.children || [];
    matchCity.children.push({
      label: area.name,
      value: area.code,
    });
  }
});

cities.forEach((city: CityType) => {
  const matchProvince: CascaderOptionType = provinces.filter((province) => province.code === city.provinceCode)[0];
  if (matchProvince) {
    matchProvince.children = matchProvince.children || [];
    matchProvince.children.push({
      label: city.name,
      value: city.code,
      children: city.children,
    });
  }
});

export const ChinaDivisionOptions: CascaderOptionType[] = provinces.map((province: ProvinceType) => ({
  label: province.name,
  value: province.code,
  children: province.children,
}));

export const parseAddress = (value: string): { codes: string[]; labels: string[]; detail: string } => {
  const json = _.isString(value) ? parseJSONIfCould(value) : value;
  const [codes, labels, detail] = _.isArray(json)
    ? [json[0]?.split(','), json[1]?.split(','), json[2]]
    : [undefined, undefined, json];
  return { codes, labels, detail };
};

export const parseAddressStr = (value: string): string => {
  const { labels, detail } = parseAddress(value);
  return `${labels ? `${labels.join(',')} ` : ''}${detail || ''}`;
};
