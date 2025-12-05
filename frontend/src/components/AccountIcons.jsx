// 导入SVG图标
import alipayIcon from '../assets/icons/支付宝支付.svg';
import wechatIcon from '../assets/icons/微信.svg';
import icbcIcon from '../assets/icons/银行-工商.svg';
import bocIcon from '../assets/icons/银行-中国银行.svg';
import huabeiIcon from '../assets/icons/花呗.svg';
import jdIcon from '../assets/icons/京东白条.svg';

// 通用图标组件 - 使用SVG文件
const IconImage = ({ src, size = 24, className = '' }) => (
  <img 
    src={src} 
    width={size} 
    height={size} 
    className={className}
    alt=""
    style={{ objectFit: 'contain' }}
  />
);

// 支付宝图标
export const AlipayIcon = ({ size = 24, className = '' }) => (
  <IconImage src={alipayIcon} size={size} className={className} />
);

// 微信支付图标
export const WechatIcon = ({ size = 24, className = '' }) => (
  <IconImage src={wechatIcon} size={size} className={className} />
);

// 工商银行图标
export const ICBCIcon = ({ size = 24, className = '' }) => (
  <IconImage src={icbcIcon} size={size} className={className} />
);

// 中国银行图标
export const BOCIcon = ({ size = 24, className = '' }) => (
  <IconImage src={bocIcon} size={size} className={className} />
);

// 花呗图标
export const HuabeiIcon = ({ size = 24, className = '' }) => (
  <IconImage src={huabeiIcon} size={size} className={className} />
);

// 京东白条图标
export const JDIcon = ({ size = 24, className = '' }) => (
  <IconImage src={jdIcon} size={size} className={className} />
);

// 通用钱包图标 - 保留SVG内联版本
export const WalletIcon = ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 1024 1024" width={size} height={size} className={className}>
    <rect fill="#3B82F6" width="1024" height="1024" rx="128"/>
    <path 
      fill="#fff" 
      d="M768 384H256c-35.3 0-64 28.7-64 64v320c0 35.3 28.7 64 64 64h512c35.3 0 64-28.7 64-64V448c0-35.3-28.7-64-64-64zm-64 256c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zM704 320V256c0-35.3-28.7-64-64-64H384c-35.3 0-64 28.7-64 64v64h384z"
    />
  </svg>
);

// 账户图标映射
export const AccountIconMap = {
  alipay: AlipayIcon,
  wechat: WechatIcon,
  icbc: ICBCIcon,
  boc: BOCIcon,
  huabei: HuabeiIcon,
  jd_baitiao: JDIcon,
};

// 获取账户图标组件
export const getAccountIcon = (name, size = 24) => {
  const IconComponent = AccountIconMap[name] || WalletIcon;
  return <IconComponent size={size} />;
};
