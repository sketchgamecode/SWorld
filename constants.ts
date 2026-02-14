import { Product, CaseStudy, CloudSettings } from './types';

// =========================================================================
// [公开读取配置] - PUBLIC_READ_CONFIG
// 作用：告诉普通访客的浏览器去哪里获取最新的网站数据。
// 安全建议：
// 1. endpointUrl: 必须与您在后台发布的 Bin URL 一致。
// 2. apiKey: 建议使用 JSONBin 的 "Read Access Key" (只读密钥)。
//    即使此文件被公开，别人也无法篡改您的数据，只能读取。
// =========================================================================
export const PUBLIC_READ_CONFIG: CloudSettings = {
  enabled: true, 
  endpointUrl: "https://api.jsonbin.io/v3/b/69902ccc43b1c97be97e15f3", 
  apiKey: "$2a$10$92Ys3I7VKmCRv2W1BT3kbuBQDOQ3LY1mUq8JjxAnPx4/x3nbkp4Xa" 
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'type-c',
    model: 'VER-LITE',
    name: 'Type C: 轻量普及版 (入门首选)',
    category: 'Software',
    subCategory: '3D数字展厅',
    price: '¥10,000 (首建)',
    description: '专为初创企业打造的企业概念空间。提供基础AI交互能力，配备24小时值班AI客服。支持电脑与移动端横竖屏自适应及投屏，极速上线，是朋友圈营销与快速展示的神器。',
    features: ['企业概念空间 + 基础AI交互', '24小时值班AI客服', '极速上线，超高性价比', '多端适配 (电脑/手机/投屏)'],
    specs: [
        '内容配置: 2视频 + 2语音讲解 + 1知识库',
        '适用场景: 初创企业、快速展示',
        '包含运营: 3个月基础运营 (支持5并发)',
        '续费运维: ¥2,000/季 或 ¥5,000/年'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=60',
    brochureUrl: ''
  },
  {
    id: 'type-b',
    model: 'VER-STD-PRO',
    name: 'Type B: 标准专业版 (主推爆款)',
    category: 'Software',
    subCategory: '3D数字展厅',
    price: '¥30,000 - ¥50,000',
    description: '面向成长型企业的主推爆款。提供3D语音交互展厅与深度漫游体验，支持官网展厅及产品发布。采用安防云渲染技术，支持全平台流畅体验。可选配企业形象全身定制数字人。',
    features: ['3D语音交互展厅 + 深度漫游', '可选企业形象定制数字人', '云渲染技术 (PC/移动/平板)', '快速部署'],
    specs: [
        '内容配置: 5展位讲解 + 2视频 + 2图 + 1模型',
        '价格详情: ¥3万 (无定制人) / ¥5万 (含定制人)',
        '包含运营: 3个月基础运营 (支持5并发)',
        '续费(含人): ¥2万/季 或 ¥6万/年'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60',
    brochureUrl: ''
  },
  {
    id: 'type-a',
    model: 'VER-FLAGSHIP',
    name: 'Type A: 旗舰定制版 (高端尊享)',
    category: 'Software',
    subCategory: '3D数字展厅',
    price: '¥100,000',
    description: '头部企业与政府展厅的尊享选择。提供独家定制化设计与开发，支持本地化私有部署及线下大屏适配。深度打磨每一个细节，打造定制企业形象全身数字人，彰显品牌实力。',
    features: ['全案定制化设计与开发', '本地化部署 + 线下大屏适配', '定制企业形象全身数字人', '深度打磨，尊享服务'],
    specs: [
        '内容配置: 全案定制',
        '适用场景: 头部企业、政府展厅',
        '包含运营: 3个月基础运营 (支持5并发)',
        '续费运维: ¥20,000/季 或 ¥60,000/年'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
    brochureUrl: ''
  }
];

export const INITIAL_CASES: CaseStudy[] = [
  {
    id: 'c1',
    title: '某省级政府智慧城市成果展厅 (Type A)',
    description: '采用旗舰定制版方案，通过本地化大屏部署与全案定制设计，完美呈现了智慧城市治理成果。定制的政务数字人不仅提升了互动体验，更大幅降低了人工讲解成本。',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=60',
    linkUrl: '#'
  },
  {
    id: 'c2',
    title: '知名科技独角兽企业官网3D展厅 (Type B)',
    description: '利用标准专业版方案快速搭建官网3D展厅，集成企业IP定制数字人，为投资人和客户提供了身临其境的产品漫游体验，品牌形象提升显著。',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c54be3853247?w=800&auto=format&fit=crop&q=60',
    linkUrl: '#'
  }
];
