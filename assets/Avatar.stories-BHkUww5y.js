import{R as e}from"./iframe-DeVPOllh.js";import{A as r}from"./Avatar-Bxq-CCgv.js";import"./preload-helper-D9Z9MdNV.js";const v={title:"Components/Avatar",component:r,parameters:{layout:"centered"},argTypes:{size:{control:{type:"select"},options:["small","medium","large","xl"]},color:{control:{type:"select"},options:["primary","secondary","accent","gray"]},status:{control:{type:"select"},options:[void 0,"online","away","offline"]},clickable:{control:"boolean"},children:{control:"text"},image:{control:"text"}}},t={args:{children:"김"}},c={args:{children:"이",size:"small",color:"secondary"}},l={args:{children:"박",size:"large",color:"accent"}},n={args:{children:"최",size:"xl",color:"primary"}},i={args:{children:"온",status:"online"}},m={args:{children:"자",status:"away",color:"secondary"}},d={args:{children:"오",status:"offline",color:"gray"}},p={args:{children:"클",clickable:!0,onClick:()=>alert("Avatar clicked!")}},a=()=>e.createElement("div",{style:{display:"flex",alignItems:"center",gap:"16px"}},e.createElement(r,{size:"small"},"소"),e.createElement(r,{size:"medium"},"중"),e.createElement(r,{size:"large"},"대"),e.createElement(r,{size:"xl"},"특")),s=()=>e.createElement("div",{style:{display:"flex",alignItems:"center",gap:"16px"}},e.createElement(r,{color:"primary"},"P"),e.createElement(r,{color:"secondary"},"S"),e.createElement(r,{color:"accent"},"A"),e.createElement(r,{color:"gray"},"G")),o=()=>e.createElement("div",{className:"ds-avatar-group"},e.createElement(r,{color:"primary"},"김"),e.createElement(r,{color:"secondary"},"이"),e.createElement(r,{color:"accent"},"박"),e.createElement(r,{color:"gray"},"+2"));a.__docgenInfo={description:"",methods:[],displayName:"AllSizes"};s.__docgenInfo={description:"",methods:[],displayName:"AllColors"};o.__docgenInfo={description:"",methods:[],displayName:"AvatarGroup"};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: '김'
  }
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: '이',
    size: 'small',
    color: 'secondary'
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: '박',
    size: 'large',
    color: 'accent'
  }
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: '최',
    size: 'xl',
    color: 'primary'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: '온',
    status: 'online'
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    children: '자',
    status: 'away',
    color: 'secondary'
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: '오',
    status: 'offline',
    color: 'gray'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    children: '클',
    clickable: true,
    onClick: () => alert('Avatar clicked!')
  }
}`,...p.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`() => <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
}}>
    <Avatar size="small">소</Avatar>
    <Avatar size="medium">중</Avatar>
    <Avatar size="large">대</Avatar>
    <Avatar size="xl">특</Avatar>
  </div>`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`() => <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
}}>
    <Avatar color="primary">P</Avatar>
    <Avatar color="secondary">S</Avatar>
    <Avatar color="accent">A</Avatar>
    <Avatar color="gray">G</Avatar>
  </div>`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`() => <div className="ds-avatar-group">
    <Avatar color="primary">김</Avatar>
    <Avatar color="secondary">이</Avatar>
    <Avatar color="accent">박</Avatar>
    <Avatar color="gray">+2</Avatar>
  </div>`,...o.parameters?.docs?.source}}};const A=["Default","Small","Large","ExtraLarge","WithStatus","Away","Offline","Clickable","AllSizes","AllColors","AvatarGroup"];export{s as AllColors,a as AllSizes,o as AvatarGroup,m as Away,p as Clickable,t as Default,n as ExtraLarge,l as Large,d as Offline,c as Small,i as WithStatus,A as __namedExportsOrder,v as default};
