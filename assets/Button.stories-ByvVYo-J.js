import{R as r}from"./iframe-DeVPOllh.js";import{B as e}from"./Button-BtUlYdzB.js";import"./preload-helper-D9Z9MdNV.js";const m={title:"Components/Button",component:e,parameters:{layout:"centered"},argTypes:{variant:{control:{type:"select"},options:["primary","secondary","ghost"]},size:{control:{type:"select"},options:["medium","small"]},disabled:{control:"boolean"},children:{control:"text"}}},t={args:{children:"주문하기",variant:"primary"}},s={args:{children:"취소",variant:"secondary"}},n={args:{children:"더보기",variant:"ghost"}},o={args:{children:"작은 버튼",size:"small"}},c={args:{children:"비활성화",disabled:!0}},a=()=>r.createElement("div",{style:{display:"flex",gap:"16px",alignItems:"center",flexWrap:"wrap"}},r.createElement(e,{variant:"primary"},"Primary"),r.createElement(e,{variant:"secondary"},"Secondary"),r.createElement(e,{variant:"ghost"},"Ghost"),r.createElement(e,{size:"small"},"Small"),r.createElement(e,{disabled:!0},"Disabled"));a.__docgenInfo={description:"",methods:[],displayName:"AllVariants"};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: '주문하기',
    variant: 'primary'
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: '취소',
    variant: 'secondary'
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: '더보기',
    variant: 'ghost'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: '작은 버튼',
    size: 'small'
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: '비활성화',
    disabled: true
  }
}`,...c.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`() => <div style={{
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap'
}}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="small">Small</Button>
    <Button disabled>Disabled</Button>
  </div>`,...a.parameters?.docs?.source}}};const p=["Primary","Secondary","Ghost","Small","Disabled","AllVariants"];export{a as AllVariants,c as Disabled,n as Ghost,t as Primary,s as Secondary,o as Small,p as __namedExportsOrder,m as default};
