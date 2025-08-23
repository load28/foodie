import{R as e}from"./iframe-DeVPOllh.js";import"./preload-helper-D9Z9MdNV.js";const i=({label:o,placeholder:p="",variant:n="bordered",disabled:m=!1,value:l,defaultValue:u,onChange:d,rows:g=4,helpMessage:c,...f})=>{const b=["ds-text-area",n!=="bordered"&&`ds-text-area--${n}`].filter(Boolean).join(" "),x=l!==void 0&&d!==void 0?{value:l,onChange:d}:{defaultValue:l||u};return e.createElement("div",{className:"ds-text-area-group"},o&&e.createElement("label",{className:"ds-text-area-label"},o),e.createElement("textarea",{className:b,placeholder:p,disabled:m,rows:g,...x,...f}),e.createElement("div",{className:`ds-text-area-message ds-text-area-help ${c?"ds-text-area-message--visible":""}`},c||" "))};i.__docgenInfo={description:"",methods:[],displayName:"TextArea",props:{label:{required:!1,tsType:{name:"string"},description:""},placeholder:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"''",computed:!1}},variant:{required:!1,tsType:{name:"literal",value:"'bordered'"},description:"",defaultValue:{value:"'bordered'",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},value:{required:!1,tsType:{name:"string"},description:""},defaultValue:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: React.ChangeEvent<HTMLTextAreaElement>) => void",signature:{arguments:[{type:{name:"ReactChangeEvent",raw:"React.ChangeEvent<HTMLTextAreaElement>",elements:[{name:"HTMLTextAreaElement"}]},name:"e"}],return:{name:"void"}}},description:""},rows:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4",computed:!1}},helpMessage:{required:!1,tsType:{name:"string"},description:""}}};const y={title:"Components/TextArea",component:i,parameters:{layout:"padded"},argTypes:{variant:{control:{type:"select"},options:["bordered"]},disabled:{control:"boolean"},label:{control:"text"},placeholder:{control:"text"},value:{control:"text"},rows:{control:{type:"range",min:2,max:10,step:1}}}},a={args:{label:"후기 작성",placeholder:"맛집에 대한 후기를 작성해주세요...",rows:4}},r={args:{label:"맛집 후기",placeholder:"맛집에 대한 후기를 작성해주세요...",value:"정말 맛있었어요! 크림 파스타가 특히 인상깊었고, 분위기도 좋았습니다.",rows:4}},t={args:{label:"비활성화",placeholder:"수정할 수 없습니다",disabled:!0,rows:3}},s={args:{label:"긴 후기 작성",placeholder:"맛집에 대한 자세한 후기를 작성해주세요...",rows:8}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: '후기 작성',
    placeholder: '맛집에 대한 후기를 작성해주세요...',
    rows: 4
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: '맛집 후기',
    placeholder: '맛집에 대한 후기를 작성해주세요...',
    value: '정말 맛있었어요! 크림 파스타가 특히 인상깊었고, 분위기도 좋았습니다.',
    rows: 4
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: '비활성화',
    placeholder: '수정할 수 없습니다',
    disabled: true,
    rows: 3
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: '긴 후기 작성',
    placeholder: '맛집에 대한 자세한 후기를 작성해주세요...',
    rows: 8
  }
}`,...s.parameters?.docs?.source}}};const w=["Default","WithValue","Disabled","LargeSize"];export{a as Default,t as Disabled,s as LargeSize,r as WithValue,w as __namedExportsOrder,y as default};
