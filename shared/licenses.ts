import { License } from './types';

export const licenses: License[] = [
  {
    id: 'cc-by-sa-4.0',
    name: 'CC BY-SA 4.0',
    fullName: 'Creative Commons Attribution-ShareAlike 4.0 International',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: true,
    description: '允许商业使用，但必须注明原作者姓名，并以相同许可协议发布衍生作品。'
  },
  {
    id: 'cc-by-4.0',
    name: 'CC BY 4.0',
    fullName: 'Creative Commons Attribution 4.0 International',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: false,
    description: '允许商业使用和衍生创作，但必须注明原作者姓名。'
  },
  {
    id: 'mit',
    name: 'MIT License',
    fullName: 'MIT License',
    url: 'https://opensource.org/licenses/MIT',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: false,
    description: '允许商业使用、修改、分发，只需保留版权声明和许可声明。'
  },
  {
    id: 'gpl-3.0',
    name: 'GPL-3.0',
    fullName: 'GNU General Public License v3.0',
    url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: true,
    description: '允许商业使用，但衍生作品必须以相同许可协议开源，不得闭源。'
  },
  {
    id: 'lgpl-3.0',
    name: 'LGPL-3.0',
    fullName: 'GNU Lesser General Public License v3.0',
    url: 'https://www.gnu.org/licenses/lgpl-3.0.en.html',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: false,
    description: '允许商业使用，可在闭源项目中使用，但修改后的库部分必须开源。'
  },
  {
    id: 'apache-2.0',
    name: 'Apache-2.0',
    fullName: 'Apache License 2.0',
    url: 'https://www.apache.org/licenses/LICENSE-2.0',
    commercialUse: true,
    attributionRequired: true,
    shareAlike: false,
    description: '允许商业使用、修改、分发，需注明版权声明。'
  },
  {
    id: 'cc-nc-sa-4.0',
    name: 'CC BY-NC-SA 4.0',
    fullName: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    commercialUse: false,
    attributionRequired: true,
    shareAlike: true,
    description: '禁止商业使用，必须注明原作者，衍生作品以相同许可协议发布。'
  },
  {
    id: 'cc0-1.0',
    name: 'CC0 1.0',
    fullName: 'Creative Commons Zero v1.0 Universal',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    commercialUse: true,
    attributionRequired: false,
    shareAlike: false,
    description: '放弃所有版权，可自由使用、修改、分发，无需注明原作者。'
  }
];

export function getLicenseById(id: string): License | undefined {
  return licenses.find(license => license.id === id);
}
