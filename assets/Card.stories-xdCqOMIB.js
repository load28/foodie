import{R as e}from"./iframe-DeVPOllh.js";import"./preload-helper-D9Z9MdNV.js";const t=({title:s="맛집 이름",description:d="맛집에 대한 간단한 설명입니다.",rating:m=4.5,location:p="강남구",emoji:u="🍽️",variant:l="default",image:c,children:g,...f})=>{const v=["ds-card",l!=="default"&&`ds-card--${l}`].filter(Boolean).join(" "),y=l!=="text-only";return e.createElement("div",{className:v,...f},y&&e.createElement("div",{className:"ds-card__image ds-card__image--placeholder"},c?e.createElement("img",{src:c,alt:s}):u),e.createElement("div",{className:"ds-card__content"},g||e.createElement(e.Fragment,null,e.createElement("h3",{className:"ds-card__title"},s),e.createElement("p",{className:"ds-card__description"},d),e.createElement("div",{className:"ds-card__meta"},e.createElement("div",{className:"ds-card__rating"},"⭐ ",m),e.createElement("div",{className:"ds-card__location"},p)))))};t.__docgenInfo={description:"",methods:[],displayName:"Card",props:{title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'맛집 이름'",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'맛집에 대한 간단한 설명입니다.'",computed:!1}},rating:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4.5",computed:!1}},location:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'강남구'",computed:!1}},emoji:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'🍽️'",computed:!1}},variant:{required:!1,tsType:{name:"union",raw:"'default' | 'horizontal' | 'compact' | 'text-only'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'horizontal'"},{name:"literal",value:"'compact'"},{name:"literal",value:"'text-only'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},image:{required:!1,tsType:{name:"string"},description:""},children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const C={title:"Components/Card",component:t,parameters:{layout:"padded"},argTypes:{variant:{control:{type:"select"},options:["default","horizontal","compact","text-only"]},title:{control:"text"},description:{control:"text"},rating:{control:{type:"range",min:1,max:5,step:.1}},location:{control:"text"},emoji:{control:"text"}}},r={args:{title:"이탈리안 레스토랑",description:"크림 파스타가 정말 맛있는 곳이에요. 분위기도 좋고 데이트 코스로 추천합니다.",rating:4.5,location:"강남구",emoji:"🍝"}},n={args:{variant:"horizontal",title:"신선한 초밥집",description:"회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다. 가격대도 합리적이고 서비스가 좋아요.",rating:4.8,location:"서초구",emoji:"🍣"}},i={args:{variant:"compact",title:"맛있는 피자집",description:"치즈가 정말 맛있고 도우도 바삭해요",rating:4.2,location:"홍대",emoji:"🍕"}},o={args:{variant:"text-only",title:"카페 베네",description:"조용한 분위기에서 커피 한 잔의 여유를 즐길 수 있는 곳입니다. 디저트류도 맛있어요.",rating:4,location:"강남구"}},a=()=>e.createElement("div",{style:{display:"grid",gap:"24px",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))"}},e.createElement(t,{title:"이탈리안 레스토랑",description:"크림 파스타가 정말 맛있는 곳이에요",rating:4.5,location:"강남구",emoji:"🍝"}),e.createElement(t,{variant:"compact",title:"맛있는 피자집",description:"치즈가 정말 맛있고 도우도 바삭해요",rating:4.2,location:"홍대",emoji:"🍕"}),e.createElement(t,{variant:"text-only",title:"카페 베네",description:"조용한 분위기에서 커피를 즐길 수 있어요",rating:4,location:"강남구"}),e.createElement("div",{style:{gridColumn:"1 / -1",marginTop:"16px"}},e.createElement(t,{variant:"horizontal",title:"신선한 초밥집",description:"회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다.",rating:4.8,location:"서초구",emoji:"🍣"})));a.__docgenInfo={description:"",methods:[],displayName:"AllVariants"};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: '이탈리안 레스토랑',
    description: '크림 파스타가 정말 맛있는 곳이에요. 분위기도 좋고 데이트 코스로 추천합니다.',
    rating: 4.5,
    location: '강남구',
    emoji: '🍝'
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'horizontal',
    title: '신선한 초밥집',
    description: '회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다. 가격대도 합리적이고 서비스가 좋아요.',
    rating: 4.8,
    location: '서초구',
    emoji: '🍣'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'compact',
    title: '맛있는 피자집',
    description: '치즈가 정말 맛있고 도우도 바삭해요',
    rating: 4.2,
    location: '홍대',
    emoji: '🍕'
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'text-only',
    title: '카페 베네',
    description: '조용한 분위기에서 커피 한 잔의 여유를 즐길 수 있는 곳입니다. 디저트류도 맛있어요.',
    rating: 4.0,
    location: '강남구'
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`() => <div style={{
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
}}>
    {/* Default Card */}
    <Card title="이탈리안 레스토랑" description="크림 파스타가 정말 맛있는 곳이에요" rating={4.5} location="강남구" emoji="🍝" />
    
    {/* Compact Card */}
    <Card variant="compact" title="맛있는 피자집" description="치즈가 정말 맛있고 도우도 바삭해요" rating={4.2} location="홍대" emoji="🍕" />
    
    {/* Text Only Card */}
    <Card variant="text-only" title="카페 베네" description="조용한 분위기에서 커피를 즐길 수 있어요" rating={4.0} location="강남구" />
    
    <div style={{
    gridColumn: '1 / -1',
    marginTop: '16px'
  }}>
      {/* Horizontal Card */}
      <Card variant="horizontal" title="신선한 초밥집" description="회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다." rating={4.8} location="서초구" emoji="🍣" />
    </div>
  </div>`,...a.parameters?.docs?.source}}};const E=["Default","Horizontal","Compact","TextOnly","AllVariants"];export{a as AllVariants,i as Compact,r as Default,n as Horizontal,o as TextOnly,E as __namedExportsOrder,C as default};
