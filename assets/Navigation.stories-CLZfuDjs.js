import{R as o}from"./iframe-DeVPOllh.js";import"./preload-helper-D9Z9MdNV.js";const l=({items:e=[],activeItem:t,onItemClick:s,variant:i="default",...m})=>{const c=["ds-navigation",i!=="default"&&`ds-navigation--${i}`].filter(Boolean).join(" "),d=[{id:"home",label:"홈",href:"#home"},{id:"search",label:"검색",href:"#search"},{id:"favorites",label:"즐겨찾기",href:"#favorites"},{id:"profile",label:"프로필",href:"#profile"}],u=e.length>0?e:d;return o.createElement("nav",{className:c,...m},u.map(a=>o.createElement("a",{key:a.id,href:a.href,className:`ds-navigation__item ${t===a.id?"ds-navigation__item--active":""}`,onClick:f=>{f.preventDefault(),s&&s(a.id,a)}},a.label)))};l.__docgenInfo={description:"",methods:[],displayName:"Navigation",props:{items:{required:!1,tsType:{name:"Array",elements:[{name:"NavigationItem"}],raw:"NavigationItem[]"},description:"",defaultValue:{value:"[]",computed:!1}},activeItem:{required:!1,tsType:{name:"string"},description:""},onItemClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(id: string, item: NavigationItem) => void",signature:{arguments:[{type:{name:"string"},name:"id"},{type:{name:"NavigationItem"},name:"item"}],return:{name:"void"}}},description:""},variant:{required:!1,tsType:{name:"literal",value:"'default'"},description:"",defaultValue:{value:"'default'",computed:!1}}}};const v={title:"Components/Navigation",component:l,parameters:{layout:"centered"},argTypes:{activeItem:{control:{type:"select"},options:["home","search","favorites","profile"]},variant:{control:{type:"select"},options:["default"]}}},n={args:{activeItem:"home",onItemClick:(e,t)=>console.log("Clicked:",e,t)}},r={args:{items:[{id:"restaurants",label:"맛집",href:"#restaurants"},{id:"reviews",label:"리뷰",href:"#reviews"},{id:"bookmarks",label:"북마크",href:"#bookmarks"},{id:"settings",label:"설정",href:"#settings"}],activeItem:"restaurants",onItemClick:(e,t)=>console.log("Menu clicked:",e,t)}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    activeItem: 'home',
    onItemClick: (id, item) => console.log('Clicked:', id, item)
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      id: 'restaurants',
      label: '맛집',
      href: '#restaurants'
    }, {
      id: 'reviews',
      label: '리뷰',
      href: '#reviews'
    }, {
      id: 'bookmarks',
      label: '북마크',
      href: '#bookmarks'
    }, {
      id: 'settings',
      label: '설정',
      href: '#settings'
    }],
    activeItem: 'restaurants',
    onItemClick: (id, item) => console.log('Menu clicked:', id, item)
  }
}`,...r.parameters?.docs?.source}}};const h=["Default","CustomMenu"];export{r as CustomMenu,n as Default,h as __namedExportsOrder,v as default};
