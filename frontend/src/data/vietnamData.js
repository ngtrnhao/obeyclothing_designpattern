import dvhcvnData from './dvhcvn.json';

// Kiểm tra cấu trúc dữ liệu và điều chỉnh tương ứng
const data = Array.isArray(dvhcvnData) ? dvhcvnData : dvhcvnData.data;

export const provinces = data.map(province => ({
  code: province.level1_id,
  name: province.name
}));

export const getDistricts = (provinceCode) => {
  const province = data.find(p => p.level1_id === provinceCode);
  return province ? province.level2s.map(district => ({
    code: district.level2_id,
    name: district.name
  })) : [];
};

export const getWards = (provinceCode, districtCode) => {
  const province = data.find(p => p.level1_id === provinceCode);
  if (!province) return [];
  const district = province.level2s.find(d => d.level2_id === districtCode);
  return district ? district.level3s.map(ward => ({
    code: ward.level3_id,
    name: ward.name
  })) : [];
};
